#!/usr/bin/env node
// frameleap-mcp：FrameLeap Studio（臻悦）的 MCP 转发程序（零依赖，Node.js ≥ 18）。
// 把只会启动本机命令（stdio）的 AI 客户端接到 FrameLeap 的远程 MCP（Streamable HTTP）：
//   1. 设置了 FRAMELEAP_URL → 连这个地址（云端 / 私有化 / 局域网），带 FRAMELEAP_API_KEY；
//   2. 否则找本机桌面版：~/.config/frameleap/server.json → 端口 17860–17899 → 8000；
//   3. 都没有 → 每个请求都返回中文说明（怎么装桌面版 / 怎么填云端地址）。
// 用法：npx -y frameleap-mcp            （客户端配置里：command "npx", args ["-y", "frameleap-mcp"]）
//       npx -y frameleap-mcp --check    （诊断：打印连到哪里、是否需要 Key）
// 协议消息只写 stdout，日志只写 stderr。
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

const VERSION = "0.1.16";
const DESKTOP_PORTS = Array.from({ length: 40 }, (_, i) => 17860 + i).concat([8000]);
const env = process.env;
const log = (...a) => process.stderr.write("[frameleap-mcp] " + a.join(" ") + "\n");
const out = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");

const state = { base: null, key: env.FRAMELEAP_API_KEY || "", session: null, protocol: null, client: "unknown", init: null, resolving: null };

async function getJSON(url, ms = 1500) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal, headers: { Accept: "application/json" } });
    return r.ok ? await r.json() : null;
  } catch { return null; } finally { clearTimeout(t); }
}

const isFrameLeap = (m) => m && typeof m === "object" && ("build_protocol" in m || "principal" in m);

export async function resolveBase() {
  if (env.FRAMELEAP_URL) return env.FRAMELEAP_URL.replace(/\/+$/, "").replace(/\/mcp$/, "");
  try {
    const d = JSON.parse(readFileSync(join(env.FRAMELEAP_HOME || homedir(), ".config/frameleap/server.json"), "utf8"));
    if (d && d.url && isFrameLeap(await getJSON(d.url.replace(/\/+$/, "") + "/api/meta"))) return d.url.replace(/\/+$/, "");
  } catch { /* 没有发现文件 */ }
  const found = await Promise.all(DESKTOP_PORTS.map(async (p) => (isFrameLeap(await getJSON(`http://127.0.0.1:${p}/api/meta`, 800)) ? p : null)));
  const port = found.find(Boolean);
  return port ? `http://127.0.0.1:${port}` : null;
}

async function base() {
  if (state.base) return state.base;
  state.resolving = state.resolving || resolveBase();
  state.base = await state.resolving;
  state.resolving = null;
  if (state.base) log("已连接", state.base);
  return state.base;
}

const NOT_FOUND = "没有找到 FrameLeap 服务：本机请先打开 FrameLeap Studio 桌面版（下载：https://www.qianqianai.com）；" +
  "用云端版请设置环境变量 FRAMELEAP_URL（如 https://frameleap.example.com）和 FRAMELEAP_API_KEY（设置 › 接入 AI 助手 › API Key）。";

function rpcError(id, code, message, data) {
  if (id === undefined || id === null) return;
  out({ jsonrpc: "2.0", id, error: { code, message, ...(data ? { data } : {}) } });
}

async function* sse(body) {
  const dec = new TextDecoder();
  let buf = "";
  for await (const chunk of body) {
    buf += dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.search(/\r?\n\r?\n/)) >= 0) {
      const block = buf.slice(0, i);
      buf = buf.slice(i).replace(/^\r?\n\r?\n/, "");
      const data = block.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).replace(/^ /, "")).join("\n");
      if (data) yield data;
    }
  }
}

async function post(msg, retried = false) {
  const b = await base();
  if (!b) return rpcError(msg.id, -32000, NOT_FOUND);
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream",
    "User-Agent": `frameleap-mcp/${VERSION}`, "X-FrameLeap-Client": state.client };
  if (state.key) headers.Authorization = `Bearer ${state.key}`;
  if (state.session) headers["Mcp-Session-Id"] = state.session;
  if (state.protocol) headers["MCP-Protocol-Version"] = state.protocol;
  let r;
  try {
    r = await fetch(b + "/mcp", { method: "POST", headers, body: JSON.stringify(msg) });
  } catch (e) {
    if (!env.FRAMELEAP_URL) state.base = null;  // 桌面版重启后端口可能变了，下次重新找
    return rpcError(msg.id, -32000, `连接 FrameLeap 失败（${b}）：${e.cause?.code || e.message}`);
  }
  if (msg.method === "initialize" && r.headers.get("mcp-session-id")) state.session = r.headers.get("mcp-session-id");
  if (r.status === 202) return;
  if (r.status === 404 && state.session && !retried && state.init) {  // 会话失效：重新握手后重试一次
    state.session = null;
    await post({ ...state.init, id: "__reinit" }, true).catch(() => {});
    return post(msg, true);
  }
  if (r.status === 401) {
    return rpcError(msg.id, -32001, state.key ? "API Key 无效或授权已过期：请在 FrameLeap 设置 › 接入 AI 助手 里重新生成"
      : "这个 FrameLeap 服务需要登录：设置环境变量 FRAMELEAP_API_KEY（设置 › 接入 AI 助手 › API Key）");
  }
  if (r.status === 405 || (r.status === 404 && !state.session)) {
    return rpcError(msg.id, -32000, "这个 FrameLeap 版本还不支持远程 MCP，请把 FrameLeap 更新到最新版");
  }
  const ctype = r.headers.get("content-type") || "";
  if (ctype.includes("text/event-stream")) {
    for await (const data of sse(r.body)) {
      try { relay(JSON.parse(data)); } catch { log("跳过无法解析的事件"); }
    }
    return;
  }
  const text = await r.text();
  if (!r.ok) {
    let detail = text;
    try { detail = JSON.parse(text).detail || detail; } catch { /* 原样 */ }
    return rpcError(msg.id, -32000, `FrameLeap 返回 ${r.status}：${String(detail).slice(0, 300)}`);
  }
  if (text) {
    const d = JSON.parse(text);
    for (const m of Array.isArray(d) ? d : [d]) relay(m);
  }
}

function relay(m) {
  if (!m || m.id === "__reinit") return;
  if (m.result && m.result.protocolVersion) state.protocol = m.result.protocolVersion;
  out(m);
}

async function check() {
  const b = await base();
  if (!b) { console.error(NOT_FOUND); return 1; }
  console.error(`FrameLeap 服务：${b}${state.key ? "（带 API Key）" : ""}`);
  const meta = await getJSON(b + "/api/meta", 5000);
  console.error(meta ? `版本：${meta.version || "?"}` : "（读不到 /api/meta：云端多租户需要 Key，或服务未就绪）");
  state.client = "frameleap-mcp-check";
  const r = await fetch(b + "/mcp", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json",
    ...(state.key ? { Authorization: `Bearer ${state.key}` } : {}) },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "frameleap-mcp-check", version: VERSION } } }) })
    .catch((e) => ({ status: 0, text: async () => String(e) }));
  console.error(r.status === 200 ? "✅ 远程 MCP 可用" : `❌ /mcp 返回 ${r.status}：${(await r.text()).slice(0, 200)}`);
  return r.status === 200 ? 0 : 1;
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--version") || argv.includes("-v")) { console.log(VERSION); return 0; }
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`frameleap-mcp ${VERSION}：把 AI 客户端接到 FrameLeap Studio（臻悦）\n\n` +
      "  npx -y frameleap-mcp           作为 MCP 服务运行（stdio）\n  npx -y frameleap-mcp --check   诊断连接\n\n" +
      "环境变量：FRAMELEAP_URL（云端 / 私有化地址，不填则找本机桌面版）、FRAMELEAP_API_KEY（云端需要）");
    return 0;
  }
  if (argv.includes("--check")) return check();
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const pending = new Set();
  rl.on("line", (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch { return out({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); }
    for (const m of Array.isArray(msg) ? msg : [msg]) {
      if (m && m.method === "initialize") {
        state.init = m;
        state.client = String(m.params?.clientInfo?.name || "unknown").slice(0, 60);
      }
      const p = (m && m.method === "initialize" ? post(m) : (state.initPromise || Promise.resolve()).then(() => post(m)))
        .catch((e) => rpcError(m && m.id, -32603, String(e && e.message || e)));
      if (m && m.method === "initialize") state.initPromise = p;  // 其它请求等握手拿到会话号再发
      pending.add(p);
      p.finally(() => pending.delete(p));
    }
  });
  await new Promise((res) => rl.on("close", res));
  await Promise.allSettled([...pending]);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("frameleap-mcp") || process.argv[1]?.endsWith("frameleap-mcp.mjs")) {
  main().then((code) => process.exit(code ?? 0), (e) => { log(String(e?.stack || e)); process.exit(1); });
}
