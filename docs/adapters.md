# 客户端适配文件规范（frameleap-client/1）

一份 JSON 描述一个 AI 软件“在哪里配置 MCP、Skill 放哪、有没有命令行或安装链接”。FrameLeap 读到后，这个软件就出现在「接入 AI 助手」列表里，可以一键接入。

- JSON Schema：[schema/frameleap-client.schema.json](https://github.com/QianqianTech/frameleap/blob/main/schema/frameleap-client.schema.json)
- 示例：[adapters/codeneo](https://github.com/QianqianTech/frameleap/tree/main/adapters/codeneo)
- 放置位置：用户电脑的 `~/.config/frameleap/clients/<id>.json`（自动识别），或在 FrameLeap 设置页导入，或向本仓库提交 PR 收录进内置列表

## 安全规则（FrameLeap 导入时强制检查）

1. 所有路径必须在用户主目录（`~/…`）或系统应用配置目录（`{appdata}/…`）内，不能有 `..`；
2. `mcp.cli` 只能是该软件自己的命令行程序，不能是 sh / bash / python / node / curl / osascript 等通用程序；
3. `mcp.deeplink` 只能用该软件自己的 URL 协议（不能是 http / https / file / javascript 等）；
4. 模板占位符只能用 `{name}`、`{command}` 及其编码变体；
5. 导入的命令行在第一次执行前会完整展示给用户确认。

字段说明见厂商对接指南的“适配文件”一节。本地校验：`python3 scripts/validate_adapter.py <文件>`。
