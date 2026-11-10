# Claude Desktop

Anthropic · 桌面应用 · 支持 macOS、Windows

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

或合并进 `~/Library/Application Support/Claude/claude_desktop_config.json` 的 `mcpServers`：

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

设置 › Connectors › Add custom connector，填入地址，点 Connect 后登录授权（首次连接登录授权，不用 Key）：

```
https://<你的域名>/mcp
```

## Skill

在客户端的技能设置里上传 Release 里的 `frameleap-video-skill.zip`。

生效：完全退出 Claude 再打开。 官方文档：<https://modelcontextprotocol.io/docs/develop/connect-local-servers>
