#!/usr/bin/env python3
"""社区数据看板（O-09）：npm 周 / 月下载量、GitHub Star / Fork / 未关闭 Issue，追加到 stats/history.csv，按月统计接入量和来源。

    python3 scripts/stats.py                      # 打印并追加一行
    GITHUB_TOKEN=… python3 scripts/stats.py       # 带令牌避免 GitHub 限流（CI 里每周跑一次，见 .github/workflows/stats.yml）
"""
from __future__ import annotations

import csv
import json
import os
import time
import urllib.request
from pathlib import Path

PKG, REPO = "frameleap-mcp", os.getenv("GITHUB_REPOSITORY", "QianqianTech/frameleap")


def get(url: str, headers: dict | None = None):
    req = urllib.request.Request(url, headers={"User-Agent": "frameleap-connect-stats", **(headers or {})})
    with urllib.request.urlopen(req, timeout=20) as r:  # noqa: S310 — 固定的公开接口
        return json.loads(r.read())


def collect() -> dict:
    row = {"date": time.strftime("%Y-%m-%d")}
    for period in ("last-week", "last-month"):
        try:
            row[f"npm_{period.replace('-', '_')}"] = get(f"https://api.npmjs.org/downloads/point/{period}/{PKG}").get("downloads", 0)
        except Exception:  # noqa: BLE001
            row[f"npm_{period.replace('-', '_')}"] = ""
    h = {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"} if os.getenv("GITHUB_TOKEN") else {}
    try:
        g = get(f"https://api.github.com/repos/{REPO}", h)
        row.update(stars=g.get("stargazers_count"), forks=g.get("forks_count"), open_issues=g.get("open_issues_count"))
    except Exception:  # noqa: BLE001
        row.update(stars="", forks="", open_issues="")
    return row


def main() -> None:
    row = collect()
    print(json.dumps(row, ensure_ascii=False))
    f = Path(__file__).resolve().parents[1] / "stats" / "history.csv"
    f.parent.mkdir(exist_ok=True)
    new = not f.exists()
    with f.open("a", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(row))
        if new:
            w.writeheader()
        w.writerow(row)


if __name__ == "__main__":
    main()
