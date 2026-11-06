# Cursor

Anysphere · IDE · 支持 macOS、Windows、Linux

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

或合并进 `~/.cursor/mcp.json` 的 `mcpServers`：

```json
{
  "mcpServers": {
    "frameleap": {
      "type": "stdio",
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

合并进 ~/.cursor/mcp.json（首次使用时点 Login 授权）（首次连接登录授权，不用 Key）：

```
{
  "mcpServers": {
    "frameleap": {
      "url": "https://<你的域名>/mcp"
    }
  }
}
```

## Skill

把本仓库的 `skills/frameleap-video` 复制到 `~/.cursor/skills/frameleap-video`（也会读通用目录 `~/.agents/skills`）。

生效：重启该客户端后生效。 官方文档：<https://cursor.com/docs/context/mcp>
