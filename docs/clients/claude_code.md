# Claude Code

Anthropic · 命令行 · 支持 macOS、Windows、Linux

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

在终端运行：

```bash
claude mcp add --scope user frameleap -- npx -y frameleap-mcp
```

或合并进 `~/.claude.json` 的 `mcpServers`：

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

在终端运行，然后在 Claude Code 里输入 /mcp 完成登录（首次连接登录授权，不用 Key）：

```
claude mcp add --transport http --scope user frameleap https://<你的域名>/mcp
```

## Skill

把本仓库的 `skills/frameleap-video` 复制到 `~/.claude/skills/frameleap-video`。

> 也可以装插件：/plugin marketplace add <integrations 目录>，再 /plugin install frameleap@frameleap。

生效：重启该客户端后生效。 官方文档：<https://docs.claude.com/en/docs/claude-code/mcp>
