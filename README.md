# FrameLeap Connect · 臻悦 接入包

让 **Claude Code、Codex、Cursor、VS Code、Qoder、Trae、CodeBuddy、WorkBuddy、DeepSeek Harness、Kimi Code、Qwen Code、Gemini CLI** 等 AI 助手
直接调用 [FrameLeap Studio（臻悦）](https://www.qianqianai.com) 出片：口播后期、每日资讯 / AI 早报、软件演示、AI 生图成片、产品图解、热点解读、AI 视频，
审片、拿成片，经你确认后发布到抖音、视频号、小红书、B 站等平台。

> 本仓库只有接入层（Skill、插件、MCP 转发程序、适配规范、文档），FrameLeap Studio 本体不开源。许可证 Apache-2.0，见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)。

## 三种用法

| 你有 | 怎么接 |
|---|---|
| 本机装了 FrameLeap 桌面版 | 在 FrameLeap「设置 › 接入 AI 助手」点一键接入；或在任意客户端里配 `npx -y frameleap-mcp` |
| 云端 / 企业私有化账号 | 在客户端里添加远程地址 `https://<你的域名>/mcp`，首次连接登录授权；不支持登录的客户端带 API Key |
| 只能启动本机命令的客户端 | `npx -y frameleap-mcp`，环境变量 `FRAMELEAP_URL`、`FRAMELEAP_API_KEY`（不设则自动找本机桌面版） |

```bash
# Claude Code：云端
claude mcp add --transport http --scope user frameleap https://<你的域名>/mcp
# Claude Code：本机桌面版或带 Key 的云端
claude mcp add --scope user frameleap -e FRAMELEAP_URL=https://<你的域名> -e FRAMELEAP_API_KEY=fl_xxx -- npx -y frameleap-mcp
# Claude Code 插件（含 Skill）
/plugin marketplace add QianqianTech/frameleap
/plugin install frameleap@frameleap
```

然后对它说：**“用 FrameLeap 做一期今天的 AI 早报，竖屏”**。

各客户端的详细步骤见 [docs/clients](docs/clients/index.md)，工具说明见 [docs/tools.md](docs/tools.md)。

## 目录

| 路径 | 内容 |
|---|---|
| `packages/frameleap-mcp/` | MCP 转发程序（npm 包，零依赖，Node.js ≥ 18） |
| `skills/frameleap-video/` | Agent Skill：教 AI 助手怎么用 FrameLeap（遵循 SKILL.md 开放格式） |
| `plugins/claude/`、`plugins/codex/` | Claude Code / Codex 插件包；仓库根目录带插件市场清单 |
| `schema/frameleap-client.schema.json` | 客户端适配文件规范（`frameleap-client/1`） |
| `adapters/` | 社区提交的客户端适配文件（审核后收录进 FrameLeap 内置列表） |
| `docs/` | 文档站源文件（MkDocs） |
| `server.json`、`smithery.yaml`、`glama.json` | MCP 官方目录、Smithery、Glama 的收录信息 |

## 安全

发布永远两步：AI 助手第一次调用只拿到预览和一次性确认令牌，必须给你看过、你同意后才会真正发布。你可以在 FrameLeap 里关掉外部智能体发布、
设每日 / 同时进行的任务上限，随时撤销授权。漏洞请按 [SECURITY.md](SECURITY.md) 私下报告。

## 参与

欢迎提交客户端适配文件（让新的 AI 软件支持一键接入）、文档改进和问题反馈，见 [CONTRIBUTING.md](CONTRIBUTING.md)。

© 2026 贵阳黔前科技有限公司 · 臻悦 / FrameLeap 是贵阳黔前科技有限公司的商标。
