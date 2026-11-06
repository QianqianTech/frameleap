---
name: frameleap-video
description: 用本机的 FrameLeap Studio（臻跃，简称 FrameLeap）做视频和视频后期：口播剪辑加字幕配乐、每日资讯/AI早报、软件使用介绍、AI 生图成片、产品图解、热点解读、AI 视频，以及把成片发布到抖音/视频号/小红书/B站等平台。用户提到做视频、剪视频、出片、早报视频、发布视频时使用。需要 frameleap MCP 工具（fl_*）。
---

# FrameLeap 臻跃 出片

FrameLeap 是用户电脑上的视频生成与后期软件。你通过 `fl_*` 工具（MCP 服务 `frameleap`）指挥它，所有模型调用、渲染、发布都在 FrameLeap 里完成。

## 标准流程

1. **说需求 → `fl_create_video`**：把用户原话传进 `request`；有原片时传 `source`（绝对路径）。
   - `status=need_input`：把 `assistant_reply` 的问题转述给用户，拿到回答后带同一个 `session_id` 再调用。不要替用户编答案。
   - 用户只想先看方案：传 `start=false`，确认后带 `session_id` + `start=true`。
   - `status=started`：记下 `task_id`，告诉用户预计用时（`eta`）。
2. **等待 → `fl_wait_task`**：每次最多约 45 秒；`still_running=true` 就再调一次。不要循环调用 `fl_get_task`。长任务（每日资讯、生图成片常要 10 分钟以上）可以先告诉用户“在做了”，之后再回来查。
3. **需要确认（`phase=needs_input`）**：用 `fl_get_outputs` 拿草稿 / 粗剪预览给用户看，再用 `fl_reply` 传达用户的意见：“通过”，或具体修改（“字幕再大一点”“开头那句删掉”“换成男声”）。
4. **完成（`phase=done`）→ `fl_get_outputs`**：给用户成片链接；用户要文件时传 `download_to`（绝对路径，例如用户当前项目目录）。
   - 只想改其中几段（智能出片 `run:…`）：`fl_segments` 看分段 → `fl_segment_edit` 传 `segment_ids` + `request` 得到方案 → 用户同意后带 `plan_id` 执行，返回新任务编号（原版保留）。整片改或口播作业用 `fl_reply`。
   - 只是配音 / 音色不满意：`fl_redub`（先 `dry_run=true` 看影响，用户同意后传 `voice` / `speed`），只重新配音，画面不重做，返回新任务编号（原版保留）。
5. **发布（只在用户要求时）→ `fl_publish`**：第一次调用只返回预览和 `confirm_token`；把平台、账号、标题、文案、发布方式给用户看，**用户明确同意后**再用完全相同的参数加 `confirm_token` 调用。

## 云端（远程）连接

连的是云端地址（`https://…/mcp`）时，FrameLeap 不在用户电脑上：
- 原片不能传本机路径：先 `fl_upload`（`name` 填文件名）拿 `upload_page`，请用户在浏览器里打开上传（命令行环境可以直接运行返回的 `curl`），
  再用 `fl_upload` `action=status` 拿到 `source`，传给 `fl_create_video`（`sources`）/ `fl_edit_video`（`source`）。也可以直接给公开的视频网址。
- 成片：`fl_get_outputs` 返回带时效的下载链接（默认 6 小时），不支持 `download_to`；把链接给用户。
- 返回 `forbidden`（403）说明授权的角色不够（比如只给了“只看”），请用户重新授权并选择“出片”。

## 规则

- 发布、取消任务、审片“通过”都必须来自用户本人的意见，不要自作主张。
- `approval` 默认 `auto`（质检通过自动往下走）。用户说“每一步都给我看”用 `manual`；“不用问我直接做完”用 `skip`（发布仍需确认）。
- 默认输出 1080p；用户没提就不要改分辨率。
- 同一时间不要批量创建很多任务；一次一个，做完再下一个（多个原片可以在一次 `fl_create_video` 里用 `sources`）。
- 返回 429（达到每日或同时进行的上限）时告诉用户原因，不要重试绕过；上限在 FrameLeap 的 设置 › 接入 AI 助手 里调。
- 出错先看工具返回的 `hint`；服务连不上或 Key 有问题时调用 `fl_status`（`deep=true` 看模型 Key 健康）。FrameLeap 没运行时请用户打开 FrameLeap Studio 桌面版。
- 不确定有哪些模式、模板、音色、账号时用 `fl_catalog`。

## 按模板出片 / 建模板 / 给三方对接

- 用户说“用某某模板做”或要按固定格式批量出片：`fl_template` `action=list`（可按 `keyword` 筛选）找到 `template_id` → `action=schema` 看要填什么 → `action=use` 传 `inputs` 开工（图片 / 音频可直接写本机绝对路径，会自动上传）→ 之后同样用 `fl_wait_task`。缺必填项时先问用户，不要编。口播模板用 `fl_edit_video`（`template` 填模板 ID）。
- 用户要设计新模板：按规范 `frameleap.template/v1` 写 JSON / YAML，先 `fl_template` `action=create` + `dry_run=true` 校验，按返回的每条 `fix` 改好，再正式保存。规范和样板见 FrameLeap 设置 › 开发者 › 模板开放接口（参照模板）。
- 用户要把模板交给外包 / 合作方开发对接：`fl_template` `action=export_dev_kit`（`link_days` 可同时生成只读链接），把开发要求要点和 zip 路径告诉用户。三方调用要用 API Key（先给沙箱 Key 免费联调），这一步由用户在 FrameLeap 里操作。

## 选哪种模式

不用自己判断，`fl_create_video` 会选。需要参考时看 [references/modes.md](references/modes.md)。已经明确模式和参数时可以用 `fl_start_studio`（智能出片）或 `fl_edit_video`（口播后期）跳过对话。

## 写需求的要点

一句话里尽量包含：做什么（模式/主题）、素材（原片路径、网址、照片）、平台和横竖屏、时长、风格和语气、配音（男声/女声/我的声音/数字人）、语言。例如：

- “把 ~/Movies/talk.mp4 剪成抖音和 B 站两个版本，去口癖，加字幕和轻音乐”
- “做一期今天的 AI 早报，6 条，竖屏，女声播报”
- “给 https://example.com 做一个 1 分钟的使用介绍视频，演示注册和创建项目”
- “用 AI 生图做一条 30 秒的番茄炒蛋教程，温馨风格”

## 没有 MCP 工具时

如果 `fl_*` 工具不可用但能运行终端命令：先确认 FrameLeap 已启动，再参考 [references/cli.md](references/cli.md) 用 HTTP 接口完成同样流程。
