// 转发程序测试：起一个假的 FrameLeap /mcp（JSON + SSE + 会话号 + 鉴权），用子进程跑 frameleap-mcp 走 stdio。
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const BIN = new URL("../bin/frameleap-mcp.mjs", import.meta.url).pathname;

function fakeServer({ key = null } = {}) {
  const seen = [];
  const srv = http.createServer(async (req, res) => {
    let body = "";
    for await (const c of req) body += c;
    if (req.url === "/api/meta") { res.writeHead(200, { "Content-Type": "application/json" }); return res.end('{"build_protocol":2,"version":"t"}'); }
    if (req.url !== "/mcp" || req.method !== "POST") { res.writeHead(404); return res.end(); }
    if (key && req.headers.authorization !== `Bearer ${key}`) { res.writeHead(401, { "Content-Type": "application/json" }); return res.end('{"detail":"no"}'); }
    const m = JSON.parse(body);
    seen.push({ method: m.method, session: req.headers["mcp-session-id"], client: req.headers["x-frameleap-client"] });
    if (m.method === "initialize") {
      res.writeHead(200, { "Content-Type": "application/json", "Mcp-Session-Id": "sess-1" });
      return res.end(JSON.stringify({ jsonrpc: "2.0", id: m.id, result: { protocolVersion: "2025-06-18", serverInfo: { name: "frameleap" }, capabilities: {} } }));
    }
    if (m.id === undefined) { res.writeHead(202); return res.end(); }
    if (m.method === "tools/call") {
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      res.write(`event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", method: "notifications/progress", params: { progressToken: "p", progress: 1 } })}\n\n`);
      setTimeout(() => {
        res.write(`event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: "ok" }] } })}\n\n`);
        res.end();
      }, 50);
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", id: m.id, result: { tools: [{ name: "fl_status" }] } }));
  });
  return new Promise((ok) => srv.listen(0, "127.0.0.1", () => ok({ srv, url: `http://127.0.0.1:${srv.address().port}`, seen })));
}

function run(env, lines, wantCount) {
  return new Promise((ok, fail) => {
    const p = spawn(process.execPath, [BIN], { env: { ...process.env, ...env } });
    const got = [];
    let buf = "";
    p.stdout.on("data", (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        got.push(JSON.parse(buf.slice(0, i)));
        buf = buf.slice(i + 1);
        if (got.length >= wantCount) p.stdin.end();
      }
    });
    p.on("exit", () => ok(got));
    p.on("error", fail);
    for (const l of lines) p.stdin.write(JSON.stringify(l) + "\n");
    setTimeout(() => { p.kill(); fail(new Error("timeout; got " + JSON.stringify(got))); }, 8000);
  });
}

const INIT = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "claude-code" } } };

test("JSON + SSE + 会话号 + 客户端名", async () => {
  const { srv, url, seen } = await fakeServer();
  const got = await run({ FRAMELEAP_URL: url + "/mcp" }, [INIT, { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list" }, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "fl_status", _meta: { progressToken: "p" } } }], 4);
  srv.close();
  assert.equal(got[0].result.serverInfo.name, "frameleap");
  assert.ok(got.some((m) => m.method === "notifications/progress"));
  assert.ok(got.some((m) => m.id === 3 && m.result.content[0].text === "ok"));
  assert.ok(got.some((m) => m.id === 2 && m.result.tools[0].name === "fl_status"));
  assert.ok(seen.filter((s) => s.method !== "initialize").every((s) => s.session === "sess-1"));
  assert.ok(seen.every((s) => s.client === "claude-code"));
});

test("云端需要 Key：没带 Key 给中文提示，带了能用", async () => {
  const { srv, url } = await fakeServer({ key: "fl_test" });
  const bad = await run({ FRAMELEAP_URL: url }, [INIT], 1);
  assert.match(bad[0].error.message, /FRAMELEAP_API_KEY/);
  const good = await run({ FRAMELEAP_URL: url, FRAMELEAP_API_KEY: "fl_test" }, [INIT], 1);
  srv.close();
  assert.equal(good[0].result.protocolVersion, "2025-06-18");
});

test("没设地址时读本机发现文件", async () => {
  const { srv, url } = await fakeServer();
  const home = mkdtempSync(join(tmpdir(), "flhome-"));
  mkdirSync(join(home, ".config/frameleap"), { recursive: true });
  writeFileSync(join(home, ".config/frameleap/server.json"), JSON.stringify({ schema: "frameleap-server/1", url }));
  const got = await run({ FRAMELEAP_URL: "", FRAMELEAP_HOME: home }, [INIT], 1);
  srv.close();
  assert.equal(got[0].result.serverInfo.name, "frameleap");
});
