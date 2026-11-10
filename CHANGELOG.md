# 更新记录

## 0.1.16

- 同步 FrameLeap Studio（臻悦）品牌及接入包版本。
- 更新 MCP 工具参考，涵盖跨会话记忆、素材与模板检索、制作方案、分镜、审片续跑和栏目自动化。
- 更新 Claude Code 和 Codex 的 FrameLeap Skill，补充 Grok Bot 接入说明。

## 0.1.12

- 远程 MCP：云端 / 私有化地址 `https://<域名>/mcp`，支持登录授权（OAuth 2.1）和 API Key
- 新转发程序 `npx -y frameleap-mcp`：自动连本机桌面版，或连云端地址
- 新工具 `fl_upload`（远程上传原片）；`fl_get_outputs` 远程返回带时效的下载链接
- 客户端适配文件规范 `frameleap-client/1` 与校验脚本；CodeNeo 示例
