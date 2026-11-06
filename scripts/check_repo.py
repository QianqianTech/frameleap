#!/usr/bin/env python3
"""仓库自检（CI 用）：所有 JSON 能解析；各处版本号一致（npm 包、转发程序、插件、server.json、更新记录）；没有遗留占位符。

    python3 scripts/check_repo.py              # 检查
    python3 scripts/check_repo.py --tag 0.1.12 # 发布时：tag 必须等于版本号
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main(argv: list[str]) -> int:
    errs = []
    for f in ROOT.rglob("*.json"):
        if "node_modules" in f.parts:
            continue
        try:
            json.loads(f.read_text(encoding="utf-8"))
        except ValueError as e:
            errs.append(f"{f.relative_to(ROOT)} 不是合法 JSON：{e}")
    pkg = json.loads((ROOT / "packages/frameleap-mcp/package.json").read_text())
    ver = pkg["version"]
    found = {"package.json": ver}
    m = re.search(r'const VERSION = "([^"]+)"', (ROOT / "packages/frameleap-mcp/bin/frameleap-mcp.mjs").read_text())
    found["bin/frameleap-mcp.mjs"] = m[1] if m else None
    for p in ("plugins/claude/.claude-plugin/plugin.json", "plugins/codex/.codex-plugin/plugin.json"):
        if (ROOT / p).is_file():
            found[p] = json.loads((ROOT / p).read_text())["version"]
    srv = json.loads((ROOT / "server.json").read_text())
    found["server.json"], found["server.json packages"] = srv["version"], srv["packages"][0]["version"]
    m = re.search(r"^## (\S+)", (ROOT / "CHANGELOG.md").read_text(), re.M)
    found["CHANGELOG.md"] = m[1] if m else None
    for k, v in found.items():
        if v != ver:
            errs.append(f"版本号不一致：{k} = {v}，package.json = {ver}")
    if pkg.get("mcpName") != srv["name"]:
        errs.append("package.json 的 mcpName 必须等于 server.json 的 name（MCP 官方目录用它验证包归属）")
    for f in ROOT.rglob("*"):
        if f.is_file() and f.suffix in (".md", ".json", ".yml", ".yaml", ".mjs") and "node_modules" not in f.parts:
            if "{{" in f.read_text(encoding="utf-8", errors="ignore") and ".github" not in f.parts:
                errs.append(f"{f.relative_to(ROOT)} 里还有未替换的占位符 {{{{…}}}}")
    if "--tag" in argv:
        tag = argv[argv.index("--tag") + 1]
        if tag != ver:
            errs.append(f"tag v{tag} 和版本号 {ver} 不一致")
    print("\n".join(errs) if errs else f"✅ 版本 {ver}，检查通过")
    return 1 if errs else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
