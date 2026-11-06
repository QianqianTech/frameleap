#!/usr/bin/env python3
"""校验 FrameLeap 客户端适配文件（frameleap-client/1），规则与 FrameLeap 导入时完全一致。只用标准库。

    python3 scripts/validate_adapter.py adapters/codeneo/frameleap-client.codeneo.json [更多文件…]
    python3 scripts/validate_adapter.py --all        # 校验 adapters/ 下全部
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path, PurePosixPath

SCHEMA = "frameleap-client/1"
ID_RE = re.compile(r"[a-z][a-z0-9_-]{1,39}")
KEY_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_]{0,40}")
CMD_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,63}")
BAD_CLIS = {"sh", "bash", "zsh", "fish", "dash", "ksh", "csh", "tcsh", "env", "sudo", "su", "doas", "python", "python3", "perl", "ruby",
            "node", "deno", "bun", "php", "lua", "osascript", "open", "xargs", "find", "curl", "wget", "rm", "mv", "cp", "dd", "chmod",
            "chown", "ln", "launchctl", "defaults", "security", "ssh", "scp", "rsync", "git", "npm", "npx", "pip", "pip3", "brew", "make"}
BAD_SCHEMES = {"file", "http", "https", "javascript", "data", "about", "ftp", "smb", "afp", "ssh", "vnc"}
PLACEHOLDERS = {"name", "command", "command_url", "config_json", "config_url", "config_b64", "config_b64_url", "config_url_b64_url"}
# FrameLeap 内置客户端（适配文件不能覆盖；codeneo 是待对接条目，允许）
BUILTIN = {"deepseek_harness", "qoder", "qoder_cn", "trae", "trae_cn", "codebuddy", "workbuddy", "kimi", "qwen", "cherry", "claude_code",
           "codex", "cursor", "vscode", "devin", "cline", "roo", "gemini", "kiro", "opencode", "zed", "claude_desktop", "goose"}


def _path(p, what: str, exts: tuple = ()) -> str:
    p = str(p or "").strip()
    if not p:
        return ""
    if not (p.startswith(("~/", "{appdata}/", "{config}/")) or (what == "detect" and p.startswith("/Applications/"))):
        raise ValueError(f"{what} 路径必须以 ~/（用户主目录）或 {{appdata}}/（应用配置目录）开头：{p}")
    if ".." in PurePosixPath(p).parts or "\x00" in p:
        raise ValueError(f"{what} 路径里不能有 ..：{p}")
    if exts and not p.lower().endswith(exts):
        raise ValueError(f"{what} 只支持 {'/'.join(exts)} 文件：{p}")
    return p


def _entry(o, depth: int = 0):
    if depth > 4:
        raise ValueError("mcp.entry 嵌套太深")
    if isinstance(o, dict):
        if len(o) > 20:
            raise ValueError("mcp.entry 字段太多")
        return {str(k): _entry(v, depth + 1) for k, v in o.items()}
    if isinstance(o, list):
        return [_entry(v, depth + 1) for v in o[:20]]
    if isinstance(o, (str, int, float, bool)) or o is None:
        return o
    raise ValueError("mcp.entry 只能包含字符串、数字、布尔、数组和对象")


def validate(d) -> None:
    if not isinstance(d, dict):
        raise ValueError("适配文件必须是 JSON 对象")
    if d.get("schema", SCHEMA) != SCHEMA:
        raise ValueError(f"不支持的 schema：{d.get('schema')}（需要 {SCHEMA}）")
    cid = str(d.get("id") or "").strip().lower()
    if not ID_RE.fullmatch(cid):
        raise ValueError("id 只能是小写字母开头的字母、数字、- 和 _（2–40 个字符）")
    if cid in BUILTIN:
        raise ValueError(f"id「{cid}」是内置客户端，不能覆盖")
    if not str(d.get("label") or "").strip():
        raise ValueError("请填写 label（软件名称）")
    docs = str(d.get("docs") or "").strip()
    if docs and not docs.startswith("https://"):
        raise ValueError("docs 只接受 https:// 链接")
    for x in (d.get("detect") or [])[:8]:
        _path(x, "detect")
    clis = []
    for c in (d.get("clis") or [])[:4]:
        if not CMD_RE.fullmatch(str(c)):
            raise ValueError(f"clis 只能写命令名，不能带路径或参数：{c}")
        clis.append(str(c))
    m = d.get("mcp") or {}
    if not isinstance(m, dict):
        raise ValueError("mcp 必须是对象")
    has = False
    if m.get("file"):
        _path(m["file"], "mcp.file", (".json", ".jsonc"))
        if not KEY_RE.fullmatch(str(m.get("key") or "mcpServers")):
            raise ValueError("mcp.key 只能是字母、数字和下划线")
        if (m.get("when") or "always") not in ("always", "dir", "file"):
            raise ValueError("mcp.when 只能是 always / dir / file")
        has = True
    entry = _entry(m.get("entry") if m.get("entry") is not None else {"command": "{command}", "args": []})
    if "{command}" not in json.dumps(entry):
        raise ValueError("mcp.entry 里必须用 {command} 表示启动命令")
    if m.get("cli_add"):
        ca = m["cli_add"]
        if not (isinstance(ca, list) and 2 <= len(ca) <= 16 and all(isinstance(x, str) and len(x) <= 80 for x in ca)):
            raise ValueError("mcp.cli_add 必须是 2–16 个字符串组成的数组")
        if ca[0] != "{cli}":
            raise ValueError("mcp.cli_add 第一项必须是 {cli}")
        cli = str(m.get("cli") or (clis[0] if clis else ""))
        if not CMD_RE.fullmatch(cli):
            raise ValueError("用 mcp.cli_add 时必须给出命令名 mcp.cli")
        if cli.lower() in BAD_CLIS:
            raise ValueError(f"mcp.cli 不能是通用命令（{cli}），只能是该软件自己的命令行")
        bad = {x for a in ca[1:] for x in re.findall(r"\{(\w+)\}", a)} - {"name", "command"}
        if bad:
            raise ValueError(f"mcp.cli_add 只能用 {{name}} 和 {{command}} 占位：{', '.join(sorted(bad))}")
        has = True
    if m.get("deeplink"):
        dl = str(m["deeplink"]).strip()
        sch = dl.split("://", 1)[0].lower() if "://" in dl else ""
        if not re.fullmatch(r"[a-z][a-z0-9+.-]{1,30}", sch) or sch in BAD_SCHEMES:
            raise ValueError("mcp.deeplink 必须是软件自己的协议链接（如 codeneo://…），不能是网页或文件链接")
        bad = set(re.findall(r"\{(\w+)\}", dl)) - PLACEHOLDERS
        if bad:
            raise ValueError(f"mcp.deeplink 里有不认识的占位：{', '.join(sorted(bad))}")
        has = True
    sk = d.get("skill") or {}
    if not isinstance(sk, dict):
        raise ValueError("skill 必须是对象")
    if _path(sk.get("dir"), "skill.dir"):
        has = True
    if not has:
        raise ValueError("mcp.file、mcp.cli_add、mcp.deeplink、skill.dir 至少要有一个")


def main(argv: list[str]) -> int:
    files = sorted(Path(__file__).resolve().parents[1].glob("adapters/**/*.json")) if argv == ["--all"] else [Path(a) for a in argv]
    if not files:
        print(__doc__)
        return 2
    bad = 0
    for f in files:
        try:
            validate(json.loads(f.read_text(encoding="utf-8")))
            print(f"✅ {f}")
        except (ValueError, OSError) as e:
            bad += 1
            print(f"❌ {f}：{e}")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
