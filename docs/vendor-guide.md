# FrameLeap Studio（臻跃，命令行 frameleap）对接指南 · 给 CodeNeo 及其它 AI 客户端

版本：frameleap-client/1 · frameleap-server/1（2026-11）
读者：CodeNeo 等 AI 编程 / 智能体软件的开发者。
目标：用户装了 FrameLeap 之后，在你的软件里一句话就能让 FrameLeap 出片、审片、拿成片、发布，**不需要手动改任何配置**。

---

## 0. 一句话版本

1. **找到 FrameLeap**：读 `~/.config/frameleap/server.json`，里面有 MCP 启动命令。
2. **连上 FrameLeap**：按 MCP 标准（stdio）启动这条命令，就能拿到 15 个 `fl_*` 工具。
3. **让 FrameLeap 认识你**：把一份适配文件放进 `~/.config/frameleap/clients/codeneo.json`。FrameLeap 的「设置 › 接入 AI 助手」里，CodeNeo 会从“待对接”变成“一键接入”。
4. （推荐）**加载 Skill**：把 `frameleap-video` 这个 Skill 装进你的技能目录，模型会更懂怎么用这些工具。

做到第 2 步就能用。第 3、4 步让体验做到“无缝”。

---

## 1. 对接方式总览

| 方式 | 谁来做 | 效果 |
|---|---|---|
| A. 你的软件读 FrameLeap 发现文件，自动添加 MCP 服务 | CodeNeo | 用户什么都不用做（**推荐**） |
| B. 你提供适配文件，FrameLeap 一键把自己写进你的配置 | CodeNeo 给文件，FrameLeap 来写 | 用户在 FrameLeap 里点一下 |
| C. 用户在 FrameLeap 里导入适配文件 | 用户 | 适配文件没随软件分发时用 |
| D. 不用 MCP，直接调 HTTP 接口 | CodeNeo | 只适合没有 MCP 能力的场景 |

A 和 B 可以同时做；FrameLeap 不会重复注册（按服务名 `frameleap` 去重）。

---

## 2. 找到 FrameLeap：发现文件 `~/.config/frameleap/server.json`

FrameLeap 在本机运行时（桌面版或 `frameleap serve`），收到第一个请求就会写这个文件；端口变了会重写。云端多租户部署不写。

```json
{
  "schema": "frameleap-server/1",
  "name": "FrameLeap Studio",
  "version": "0.1.12",
  "url": "http://127.0.0.1:17860",
  "mcp": { "name": "frameleap", "transport": "stdio", "command": "/…/integrations/bin/frameleap-mcp", "args": [] },
  "mcpServers": { "frameleap": { "command": "/…/integrations/bin/frameleap-mcp", "args": [] } },
  "skill": { "name": "frameleap-video", "dir": "/…/integrations/skills/frameleap-video",
             "zip_url": "http://127.0.0.1:17860/api/integrations/skill.zip" },
  "adapters_dir": "~/.config/frameleap/clients",
  "guide_url": "http://127.0.0.1:17860/api/integrations/guide",
  "updated": 1793930000,
  "pid": 12345
}
```

建议的做法：

- 启动时（或用户打开 MCP 设置页时）检查这个文件是否存在。
- 存在：在你的 MCP 列表里提示“发现 FrameLeap Studio（臻跃），是否连接？”，同意后把 `mcpServers.frameleap` 合并进你的配置。
- `mcp.command` 是一个启动脚本，它自己会找到 FrameLeap（开发目录或桌面版内置后端）。**FrameLeap 服务没开着时它也能启动**，此时工具调用会返回“FrameLeap 没在运行”的提示，不会崩溃。
- 文件不存在：说明用户没装 FrameLeap，或者 FrameLeap 还没启动过，不要报错。

---

## 3. MCP 服务说明

### 3.1 传输与协议

| 项 | 值 |
|---|---|
| 传输 | stdio，一行一条 JSON-RPC 2.0 消息（标准 MCP） |
| 协议版本 | 2025-11-25 / 2025-06-18 / 2025-03-26 / 2024-11-05，按客户端请求协商，不认识的回落到 2025-06-18 |
| 能力 | `tools`、`resources`（不支持订阅）；长任务用 `notifications/progress` 报进度；支持 `notifications/cancelled` |
| 服务名 | `frameleap`（请用这个名字注册，便于双方去重） |
| clientInfo.name | 请填 `codeneo`（或含 `codeneo` 的名字）：FrameLeap 会显示“来自 CodeNeo”，并按它统计调用与限额 |
| 依赖 | 无第三方依赖；启动约 1 秒 |

### 3.2 工具（15 个）

带 * 的是必填参数。

| 工具 | 用途 | 参数 | 只读 | 有破坏性 |
|---|---|---|---|---|
| `fl_create_video` | **首选入口**。传用户原话，FrameLeap 自动选模式（口播后期 / 每日资讯 / 软件演示 / AI 生图成片 / 产品图解 / 热点解读 / AI 视频）。信息不够时返回问题，带 `session_id` 继续 | request*, session_id, source, sources, platforms, approval, start | 否 | 否 |
| `fl_edit_video` | 口播素材后期（参数明确时） | source*, platforms, title, style_hint, script, bgm, remove_fillers, speaker_name, speaker_title, template, approval | 否 | 否 |
| `fl_start_studio` | 按模式和参数直接启动智能出片 | kind, params, template, name, approval | 否 | 否 |
| `fl_list_tasks` | 任务列表（含来源） | limit, phase, type | 是 | — |
| `fl_get_task` | 任务详情、制作过程、待确认内容 | task_id*, events | 是 | — |
| `fl_wait_task` | 等任务推进；默认最多 45 秒，最长 300 秒，期间发进度 | task_id*, timeout_s | 是 | — |
| `fl_reply` | 对任务说话：“通过”、修改意见、“重试” | task_id*, text* | 否 | 否 |
| `fl_cancel_task` | 取消任务 | task_id* | 否 | 是 |
| `fl_get_outputs` | 成片 / 封面 / 字幕的链接；可下载到指定目录 | task_id*, download_to, videos_only | 否 | 否 |
| `fl_catalog` | 模式、模板、音色、平台、发布账号、字幕风格 | what | 是 | — |
| `fl_publish` | 发布到平台。**两步**：先返回预览和 `confirm_token`，用户同意后再带令牌调用 | task_id*, targets*, title, description, tags, at, confirm_token | 否 | 是 |
| `fl_segments` | 成片分段 | task_id* | 是 | — |
| `fl_segment_edit` | 只改选中的几段：先出方案，同意后带 `plan_id` 执行 | task_id*, segment_ids, request, mode, plan_id | 否 | 否 |
| `fl_redub` | 只重新配音 / 换声音，不重做整条视频 | task_id*, voice, voice_name, voice_target, speed, dry_run | 否 | 否 |
| `fl_template` | 模板：`action=list` 找模板 / `schema` 看要填什么 / `use` 按模板出片 / `create` 按规范 frameleap.template/v1 新建（严格校验）/ `export_dev_kit` 导出给三方的对接包 | action*, template_id, keyword, mode, mine, limit, inputs, name, template, dry_run, lang, save_dir, link_days | 否 | 否 |
| `fl_upload` | 远程（云端）连接时上传原片：返回上传页面和 curl 命令，传完拿 `source` | action, name, upload_id | 否 | 否 |
| `fl_status` | 服务和 Key 检查、接入策略 | deep | 是 | — |

工具的完整参数说明以 `tools/list` 的返回为准（中文描述里写了“何时用 / 不该何时用”）。

### 3.3 任务编号和状态

- 编号：`job:<id>`（口播作业）或 `run:<id>`（智能出片）。
- `phase` 只有五种：`running` / `needs_input`（等用户确认草稿或粗剪）/ `done` / `failed` / `cancelled`。
- 资源：`frameleap://task/{task_id}`。`resources/list` 返回最近 20 个任务。

### 3.4 返回格式与错误

- 每个工具都返回：`content[0].text`（一句人话总结加 JSON），以及 `structuredContent`（同一个 JSON）。
- 失败时 `isError: true`，`structuredContent = {error, code, hint}`。常见 `code`：
  - `not_running` / `unreachable`：FrameLeap 没开；
  - `unauthorized` / `forbidden`；
  - `not_found` / `bad_request` / `conflict`；
  - `rate_limited`（429，外部智能体的每日或并发上限）；
  - `server_error`。
- `hint` 是给人看的下一步建议，可以直接展示给用户。

### 3.5 超时建议

出片要几分钟到十几分钟。请把 MCP 工具超时设为 **≥ 60 秒**（`fl_wait_task` 默认 45 秒就返回）。不要用短间隔循环调 `fl_get_task`，用 `fl_wait_task`。

### 3.6 必须遵守的交互规则

- 发布、取消、审片“通过”，都必须来自用户本人的明确意见。
- `fl_publish` 第一次调用只出预览；把平台、账号、标题、文案给用户看，同意后再带 `confirm_token` 调用。
- 返回 429 时，把原因告诉用户，不要重试绕过。上限由用户在 FrameLeap 的设置页里调。

---

### 远程 MCP（云端 / 私有化 / 本机 HTTP）

除了 stdio，FrameLeap 服务本身提供 Streamable HTTP 的远程 MCP：`<服务地址>/mcp`（本机桌面版是发现文件里的 `url` + `/mcp`）。
- 云端需要鉴权：支持 MCP 授权规范（OAuth 2.1 + PKCE + 动态客户端注册，元数据在 `/.well-known/oauth-protected-resource/mcp`），
  或请求头 `Authorization: Bearer fl_…`（工作区 API Key）；没带凭据返回 401 和 `WWW-Authenticate`。
- 会话号在 `Mcp-Session-Id` 响应头里；进度通知走 SSE（请求头 `Accept: application/json, text/event-stream`）。
- 只能启动本机命令的客户端可以用开源转发程序 `npx -y frameleap-mcp`（环境变量 `FRAMELEAP_URL`、`FRAMELEAP_API_KEY`）。

## 4. 让 FrameLeap 认识你：客户端适配文件（frameleap-client/1）

### 4.1 放在哪里

- **自动发现（推荐）**：你的安装程序或首次启动时写入 `~/.config/frameleap/clients/codeneo.json`。FrameLeap 每次打开设置页都会读取，不用用户导入。
- **用户导入**：用户在 FrameLeap 的「设置 › 接入 AI 助手 › 导入客户端适配文件」里粘贴或选择文件。
- 两处都有时，以用户导入的为准。

### 4.2 格式

JSON Schema：`integrations/frameleap-client.schema.json`。示例：`integrations/codeneo/frameleap-client.codeneo.json`。

```json
{
  "schema": "frameleap-client/1",
  "id": "codeneo",
  "label": "CodeNeo",
  "vendor": "CodeNeo",
  "kind": "IDE",
  "detect": ["~/.codeneo", "/Applications/CodeNeo.app"],
  "clis": ["codeneo"],
  "mcp": {
    "file": "~/.codeneo/mcp.json",
    "key": "mcpServers",
    "when": "always",
    "entry": { "type": "stdio", "command": "{command}", "args": [] },
    "cli": "codeneo",
    "cli_add": ["{cli}", "mcp", "add", "{name}", "--", "{command}"],
    "deeplink": "codeneo://mcp/install?name={name}&config={config_b64_url}"
  },
  "skill": { "dir": "~/.codeneo/skills", "upload": false },
  "restart": "重启 CodeNeo 后生效",
  "docs": "https://…"
}
```

| 字段 | 说明 |
|---|---|
| `id` | 小写字母开头，2–40 位，可用字母、数字、`-`、`_`。`codeneo` 会替换 FrameLeap 内置的“CodeNeo 待对接”条目；不能和其它内置客户端重名 |
| `detect` | 判断“本机已安装”的路径：`~/…` 或 `/Applications/….app` |
| `clis` | 你的命令行名（只能是命令名，不能带路径） |
| `mcp.file` | 你的 MCP 配置文件。必须在用户主目录下（`~/…`），JSON 格式 |
| `mcp.key` | 顶层键名，常见是 `mcpServers` |
| `mcp.when` | `always` 没有就新建；`dir` 目录存在才写；`file` 文件存在才写 |
| `mcp.entry` | 你的配置里一条服务的写法，用 `{command}` 代表 FrameLeap 的启动命令（可以出现在数组里，如 `["{command}"]`） |
| `mcp.cli` + `mcp.cli_add` | 你的命令行添加 MCP 的命令。第一项必须是 `{cli}`，参数里只能用 `{name}`、`{command}` 两个占位 |
| `mcp.deeplink` | 你的安装链接（只能是你自己的协议，如 `codeneo://`）。可用占位见下表 |
| `skill.dir` | 你的用户级技能目录（`~/…`）。FrameLeap 会复制成 `<dir>/frameleap-video/SKILL.md` |
| `skill.upload` | 只能在界面里上传 Skill 时设为 `true`；FrameLeap 会提示用户下载 Skill 压缩包 |

`mcp.file`、`mcp.cli_add`、`mcp.deeplink`、`skill.dir` 至少要有一个。

安装链接里可用的占位：

| 占位 | 内容 |
|---|---|
| `{name}` | `frameleap` |
| `{command}` / `{command_url}` | 启动命令 / URL 编码后的启动命令 |
| `{config_json}` / `{config_url}` | `mcp.entry` 填好后的 JSON / 它的 URL 编码 |
| `{config_b64}` / `{config_b64_url}` | JSON 的 base64 / 再做 URL 编码（Cursor、Trae 风格） |
| `{config_url_b64_url}` | 先 URL 编码，再 base64，再 URL 编码（Qoder 风格） |

### 4.3 FrameLeap 一键接入时做什么

1. 有 `mcp.cli_add`，并且本机找得到你的命令：先把完整命令展示给用户确认，再运行。
2. 否则合并 `mcp.file`：先备份为 `*.bak-frameleap`，只增加 `frameleap` 一项；带注释的 JSON 不改。
3. 都不行就打开 `mcp.deeplink`，由你的软件弹出确认。
4. 复制 Skill 到 `skill.dir`。
5. 已经注册过的不重复写；结果和需要用户手动做的步骤显示在 FrameLeap 页面上。

### 4.4 安全限制（FrameLeap 会拒绝不合格的适配文件）

- 路径必须在用户主目录下，且不能含 `..`。
- 命令行不能是 `sh`、`bash`、`python`、`node`、`osascript`、`open`、`curl` 等通用命令。
- 安装链接不能是 `http(s)`、`file`、`javascript` 等。
- 由适配文件定义的命令，运行前一定先让用户确认。

---

## 5. Skill：`frameleap-video`

- 标准 SKILL.md（YAML 头 `name`、`description`），附 `references/modes.md`、`references/cli.md`。
- 获取方式：
  - 发现文件里的 `skill.dir`（本机目录）；
  - `skill.zip_url`（压缩包，文件夹名与 Skill 同名）；
  - 或 FrameLeap 一键接入时复制到你的 `skill.dir`。
- 也会放进通用目录 `~/.agents/skills/frameleap-video`。如果你的软件读这个目录，就不用单独处理。
- 内容是标准流程：出片 → 等待 → 审片 → 拿成片 → 发布前确认，以及“429 不要绕过”等规则。请不要改写，以便 FrameLeap 升级时同步更新。

---

## 6. 不用 MCP 时：HTTP 接口

- 地址：发现文件里的 `url`（桌面版端口在 17860–17899 之间，`frameleap serve` 默认 8000）。
- 本机单用户模式不需要鉴权；云端部署带 `Authorization: Bearer fl_…`（工作区 API Key）。
- 请求头请带 `X-FrameLeap-Client: codeneo`，FrameLeap 才能统计来源、应用限额。
- 主流程：
  - `POST /api/assistant/intake`：需求转成方案；
  - `POST /api/studio/runs` 或 `POST /api/jobs`：开工；
  - `GET /api/studio/runs/{id}` 或 `GET /api/jobs/{id}`：查进度；
  - `POST /api/assistant/run/{id}` 或 `POST /api/assistant/job/{id}`：确认或修改；
  - `GET /api/jobs/{id}/outputs`：拿成片。
- 详细字段见 `integrations/skills/frameleap-video/references/cli.md`。

---

## 7. 限额与来源

- FrameLeap 只约束外部智能体（按 `X-FrameLeap-Client` 识别；MCP 会自动带上 `mcp:<clientInfo.name>`）。
- 默认同时进行 2 个任务、每天新建 20 个，用户可以在设置页调整，也可以关闭发布或整体关闭接入。
- 外部智能体建的任务，在 FrameLeap 任务中心显示“来自 CodeNeo”。

---

## 8. 联调清单

| # | 检查 | 期望 |
|---|---|---|
| 1 | 你的软件读到 `~/.config/frameleap/server.json` | 提示发现 FrameLeap |
| 2 | 启动 `mcp.command`，发送 `initialize` | `serverInfo.name = "frameleap"` |
| 3 | `tools/list` | 15 个 `fl_*` 工具 |
| 4 | 调 `fl_status` | 返回版本和接入策略；FrameLeap 没开时返回 `not_running` 和 `hint` |
| 5 | 说“做一期今天的 AI 早报，竖屏” | `fl_create_video` 返回 `need_input` 或 `started` |
| 6 | `fl_wait_task`（`progressToken`） | 收到 `notifications/progress`；45 秒内返回 |
| 7 | 放好 `~/.config/frameleap/clients/codeneo.json` | FrameLeap 设置页里 CodeNeo 显示“软件自带适配文件”，可一键接入 |
| 8 | 在 FrameLeap 点 CodeNeo 的「一键接入」 | 你的配置里出现 `frameleap`；Skill 出现在 `skill.dir` |
| 9 | FrameLeap 任务中心 | 任务显示“来自 CodeNeo” |
| 10 | `fl_publish` 不带令牌 | 只返回预览，不发布 |

FrameLeap 自带的自检：「设置 › 接入 AI 助手 › 连接测试」，或运行 `scripts/mcp_smoke.py`。

---

## 9. 联系与版本

- 字段只增不改。不兼容的变化会升 `schema` 版本（`frameleap-client/2`、`frameleap-server/2`），FrameLeap 会同时支持旧版本至少一个大版本。
- 适配文件写好后，可以在 FrameLeap 设置页「导出适配文件」，发给 FrameLeap 团队，收录进内置列表。
