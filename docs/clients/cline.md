# Cline

Cline · VS Code 插件 / 命令行 · 支持 macOS、Windows、Linux

## 本机桌面版（推荐）

在 FrameLeap「设置 › 接入 AI 助手」里点 **一键接入**（会自动写配置、装 Skill，改动前备份）。

## 手动配置（本机或云端，通过转发程序）

在终端运行：

```bash
cline mcp add frameleap --yes -- npx -y frameleap-mcp
```

或合并进 `~/.cline/data/settings/cline_mcp_settings.json` 的 `mcpServers`：

```json
{
  "mcpServers": {
    "frameleap": {
      "command": "npx",
      "args": [
        "-y",
        "frameleap-mcp"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

连云端时给转发程序加环境变量 `FRAMELEAP_URL=https://<你的域名>`、`FRAMELEAP_API_KEY=fl_…`；不加则自动连本机桌面版。
Windows 上如果客户端提示找不到 `npx`，把 `command` 写成 `cmd`、`args` 写成 `["/c", "npx", "-y", "frameleap-mcp"]`。

## Skill

把本仓库的 `skills/frameleap-video` 复制到 `~/.cline/skills/frameleap-video`。

生效：重启该客户端后生效。 官方文档：<https://docs.cline.bot/mcp/configuring-mcp-servers>
