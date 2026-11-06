# Windsurf / Devin Desktop

Cognition · IDE / 命令行 · 支持 macOS、Windows、Linux

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

在终端运行：

```bash
devin mcp add frameleap -s user -- npx -y frameleap-mcp
```

或合并进 `~/.config/devin/mcp_config.json` 的 `mcpServers`：

```json
{
  "mcpServers": {
    "frameleap": {
      "command": "npx",
      "args": [
        "-y",
        "frameleap-mcp"
      ]
    }
  }
}
```

连云端时给转发程序加环境变量 `FRAMELEAP_URL=https://<你的域名>`、`FRAMELEAP_API_KEY=fl_…`；不加则自动连本机桌面版。
Windows 上如果客户端提示找不到 `npx`，把 `command` 写成 `cmd`、`args` 写成 `["/c", "npx", "-y", "frameleap-mcp"]`。

## 云端直连（不用转发程序）

合并进 mcp_config.json：

```
{
  "mcpServers": {
    "frameleap": {
      "serverUrl": "https://<你的域名>/mcp",
      "headers": {
        "Authorization": "Bearer <你的 API Key>"
      }
    }
  }
}
```

## Skill

把本仓库的 `skills/frameleap-video` 复制到 `~/.config/devin/skills/frameleap-video`（也会读通用目录 `~/.agents/skills`）。

> Windsurf 已于 2026-06 改名为 Devin Desktop；旧版 Windsurf 的配置位置也会一并写入。

生效：在 Customize › MCPs 里点刷新。 官方文档：<https://docs.devin.ai/cli/extensibility/mcp/configuration>
