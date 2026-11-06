# Gemini CLI

Google · 命令行 · 支持 macOS、Windows、Linux

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

在终端运行：

```bash
gemini mcp add -s user frameleap npx -y frameleap-mcp
```

或合并进 `~/.gemini/settings.json` 的 `mcpServers`：

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

合并进 ~/.gemini/settings.json（首次连接登录授权，不用 Key）：

```
{
  "mcpServers": {
    "frameleap": {
      "httpUrl": "https://<你的域名>/mcp"
    }
  }
}
```

## Skill

把本仓库的 `skills/frameleap-video` 复制到 `~/.gemini/skills/frameleap-video`（也会读通用目录 `~/.agents/skills`）。

> 未信任的文件夹里本地 MCP 不会连接，必要时运行 gemini trust。

生效：新会话生效，或在会话里输入 /mcp reload。 官方文档：<https://geminicli.com/docs/tools/mcp-server/>
