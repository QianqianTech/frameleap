# 发布渠道清单（O-05）

目标：在 5 个以上目录里能搜到 “FrameLeap / 臻跃”。每个渠道都需要用公司账号操作一次，之后由 CI 自动更新版本。

| 渠道 | 提交什么 | 怎么提交 | 自动更新 |
|---|---|---|---|
| npm | `frameleap-mcp` 包 | 打 tag 后 CI 发布（需要仓库密钥 `NPM_TOKEN`；包名先手动 `npm publish` 抢注一次） | ✅ release.yml |
| GitHub Release | 插件包 zip、Skill zip、校验和 | 打 tag 自动创建 | ✅ release.yml |
| MCP 官方目录（registry.modelcontextprotocol.io） | `server.json`（名称 `io.github.qianqiantech/frameleap`，npm 包里的 `mcpName` 与之对应） | `mcp-publisher login github && mcp-publisher publish`（需要使用 GitHub 账号 QianqianTech 登录） | ✅ release.yml（配置 `MCP_PUBLISH=1` 后） |
| Smithery | `smithery.yaml` | smithery.ai 用 GitHub 登录 → Add Server → 选本仓库 | 跟随仓库 |
| Glama | `glama.json` | glama.ai/mcp/servers 提交仓库地址，维护者认领 | 跟随仓库 |
| Claude Code 插件市场 | 仓库根目录 `.claude-plugin/marketplace.json` | 用户 `/plugin marketplace add QianqianTech/frameleap`；另向社区插件目录提 PR 收录 | 跟随仓库 |
| Codex 插件 | `.agents/plugins/marketplace.json` | 用户 `codex plugin marketplace add QianqianTech/frameleap`（按 Codex 当前命令） | 跟随仓库 |
| Qoder / Trae / CodeBuddy MCP 市场 | 名称、简介、图标、`npx -y frameleap-mcp` 配置、远程地址 | 各自开发者后台提交（国内市场通常要求企业认证） | 手动 |
| Cursor MCP 目录（cursor.directory 等） | 安装链接 `cursor://anysphere.cursor-deeplink/mcp/install?...` | 网站提交表单 / PR | 手动 |
| skills.sh 等技能目录 | `skills/frameleap-video` | 按目录要求提交仓库地址 | 跟随仓库 |

提交前检查：README 首屏有一句话说明 + 三种用法；图标用 `docs/assets/logo.svg`；简介统一用：
“臻跃 FrameLeap：一句话出片、审片、发布的 AI 视频软件。让 Claude、Codex、Cursor 等 AI 助手直接调用它做视频。”
