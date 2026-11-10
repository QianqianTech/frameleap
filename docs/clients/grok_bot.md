# Grok Bot

xAI · 桌面应用 / 命令行 · 支持 macOS、Windows、Linux

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

在终端运行：

```bash
grok mcp add --scope user frameleap -- npx -y frameleap-mcp
```

追加到 `~/.grok/config.toml`：

```toml
[mcp_servers.frameleap]
command = "npx"
args = ["-y", "frameleap-mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 120
```

连云端时给转发程序加环境变量 `FRAMELEAP_URL=https://<你的域名>`、`FRAMELEAP_API_KEY=fl_…`；不加则自动连本机桌面版。
Windows 上如果客户端提示找不到 `npx`，把 `command` 写成 `cmd`、`args` 写成 `["/c", "npx", "-y", "frameleap-mcp"]`。

## Skill

把本仓库的 `skills/frameleap-video` 复制到 `~/.grok/skills/frameleap-video`。

> 本机 Grok CLI 会写入 ~/.grok/config.toml，并把 Skill 装到 ~/.grok/skills。也可手动运行：grok mcp add --scope user frameleap -- <启动命令>。Grok Bot 桌面版连云端 FrameLeap 时，用设置里的远程 MCP 地址添加自定义连接器。

生效：Grok CLI 请新开一个会话；Grok Bot 桌面版请新开对话后生效。
