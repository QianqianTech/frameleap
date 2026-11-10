# Trae

字节跳动 · IDE · 支持 macOS、Windows、Linux

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

或合并进 `~/Library/Application Support/Trae/User/mcp.json` 的 `mcpServers`：

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

在客户端的 MCP 设置里添加（Streamable HTTP）：

```
{
  "mcpServers": {
    "frameleap": {
      "type": "streamableHttp",
      "url": "https://<你的域名>/mcp",
      "headers": {
        "Authorization": "Bearer <你的 API Key>"
      }
    }
  }
}
```

## Skill

把本仓库的 `skills/frameleap-video` 复制到 `~/.trae/skills/frameleap-video`。

> Skill 没出现时，在 设置 › 技能 里导入 Skill 压缩包。

生效：重启该客户端后生效。 官方文档：<https://docs.trae.ai/ide/model-context-protocol>
