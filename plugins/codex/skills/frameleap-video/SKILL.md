---
name: frameleap-video
description: 用 FrameLeap Studio（臻悦，简称 FrameLeap）做视频和视频后期：口播剪辑加字幕配乐、每日资讯/AI早报、软件使用介绍、AI 生图成片、产品图解、热点解读、AI 视频，以及把成片发布到抖音/视频号/小红书/B站等平台。用户提到做视频、剪视频、出片、早报视频、发布视频时使用。需要 frameleap MCP 工具（fl_*），支持桌面版和远程工作区。
---

# FrameLeap 臻悦 出片

通过 `fl_*` 工具调用用户的 FrameLeap 桌面版或远程工作区。本机插件使用 `frameleap`，私有账号版使用 `frameleap_cloud`。同一个任务沿用最初选定的连接和工作区。

## 标准流程

专用出片工具之外的功能，用 `fl_capabilities` 按模块查找并读取操作参数，再用 `fl_invoke` 执行。读取直接返回，写入返回待确认方案。按用户授权用 `action=confirm` 提交并用 `action=status` 查回执。原生文件参数用 `fl_upload` 传对应 `operation_id` 获取上传编号。

1. **说需求 → `fl_create_video`**：把用户原话传进 `request`。本机原片用绝对路径，远程原片用上传后返回的 `source`。
   - `status=need_input`：把 `assistant_reply` 的问题转述给用户，拿到回答后带同一个 `session_id` 再调用。不要替用户编答案。
   - 先看方案时传 `start=false`。用返回的 `plan_id` 调 `fl_plan` 读取确认单，改选项时用 `action=update` 并传 `revision`。用户确认后，用 `action=confirm` 提交同一版本。重连后仍可读取方案和回执。只提供旧版工具的服务可用 `session_id` 和 `start=true` 提交。
   - 每日资讯可用 `fl_plan` 的 `news_preview`、`news_status` 和 `pick_news` 先选题。把候选新闻、来源和入选条数给用户核对。
   - 产品图解提交方案后可能返回 `explainer_draft`。用 `fl_storyboard` 看分镜并修改，核对新版本后传 `revision` 开工。
   - `status=started`：记下 `task_id`，告诉用户预计用时（`eta`）。
2. **等待 → `fl_wait_task`**：使用约 45 秒的等待窗口。`still_running=true` 时继续等待。重连后用已有 `task_id` 查进度，继续等待同一个任务。
3. **按 `state` 和 `next_action` 处理阻塞**。等待素材时补充素材，等待额度时先解决额度。需要审片时，用 `fl_task_action` 的 `inspect` 查看审片要求，传 `include_previews=true` 给 `fl_get_outputs` 获取预览。得到审片决定后按 `review_revision` 提交。具体修改意见仍可用 `fl_reply`。
4. **生成结束后用 `fl_get_outputs` 取成片、封面和字幕**。交付状态看 `lifecycle.review` 和 `lifecycle.publication`。待复核时给用户看预览，复核和交付动作使用当前 `media_revision`。需要人工复核的项目请用户在 FrameLeap 中确认。智能体提交的复核独立记录。本机连接可用 `download_to` 保存到用户指定的绝对路径，远程连接使用限时下载链接。
   - 成片已有字幕文件、只缺内嵌字幕，或只需更新片尾：优先走下方「轻量后期」，沿用成片和原音轨。
   - 只想改其中几段（智能出片 `run:…`）：用 `fl_segments` 查看当前版本、分段和 `thumbnail_url`。用它返回的 `task_id`、目标 `segment_ids` 和用户的 `request` 调用 `fl_segment_edit`。用户同意后用方案返回的 `task_id` 和 `plan_id` 执行，再用 `fl_wait_task` 和 `fl_get_outputs` 查看新版本。需要指定旧版时，在查分段和生成方案时都传 `exact_version=true`。整片改或口播作业用 `fl_reply`。
   - 只是配音 / 音色不满意：`fl_redub`（先 `dry_run=true` 看影响，用户同意后传 `voice` / `speed`），只重新配音，画面不重做，返回新任务编号（原版保留）。
5. **发布（只在用户要求时）用 `fl_publish`**。第一次调用返回预览和 `confirm_token`。把平台、账号、标题、文案和发布方式给用户看，**用户明确同意后**再用相同参数加 `confirm_token` 调用。用 `fl_publications` 按回执 ID 查平台状态。

用 `fl_assets` 查找并复用工作区素材。模板流程用 `fl_template` 的 `versions`、`schema` 和 `prepare` 固定版本并检查填空，素材字段可以传 `asset_ref`。作品通过复核后，可用 `from_task` 沉淀为模板。

普通需求用 `fl_create_video` 自动选择已有资源。要指定或替换组合，用 `fl_resources action=search` 按用途、风格词、别名或动效编号搜索；先读少量摘要，只选择当前片型 `applicable=true` 的条目。用 `action=prepare` 传真实模板 ID、版本、填空、风格包和动效，随后沿用现有 `fl_plan` 确认流程。不要把搜索结果当作已执行，也不要将自动选择写为长期偏好。

制作依次整理素材、选择组合、编排分镜、预检、执行和质检。状态及费用以任务回执为准；待核对费用不能按零计。恢复或重试先查询原任务。修改转场与字幕时复用已有素材和配音，改动第二镜只提交对应镜头的修改；保留需要人工审看的状态。

用 `fl_automation` 查栏目，预览时区、时段、预算和账号。栏目创建、启用、暂停和单次试跑都先用 `prepare` 生成方案，再按版本提交。新建栏目默认暂停，发布方式为人工审核。试跑进入审片，保留选题池和正式排期。

## 轻量后期（已有成片）

对已有 `run:…` 先调 `fl_segments`。`post.captions_available=true` 可按原文字和时间烧录现成 SRT；`post.captions_adjustable=true` 可用原底片移动或缩放已经叠加的后期字幕。`post.caption_layout` 是当前字幕距画面底部的百分比和字号倍率。已经内嵌且不能微调的字幕不要再加一遍；缺 SRT 时不要自动调用转写。

用 `fl_segment_edit` 传 `task_id` 和 `post`，不传 `segment_ids`。例如 `{"embed_subtitles":true,"ending_text":"了解更多\n关注 FrameLeap Studio","ending_start":50.2}`。两个动作可各自提交；`ending_start` 以秒为单位，缺省取最后 4 秒。片尾文案按行展示，适合从旁白结束后开始；只改画面，不改口播。可在 FrameLeap「成片工作台 › 字幕与片尾」做同样的操作。

专业片尾可在「成片工作台 › 字幕与片尾 › 片尾样式」选择。Codex 先用 `fl_segments` 查看 `post.ending_styles`。动效示例 `post:{"ending_text":"了解更多\n关注我们","ending_style":"editorial","ending_brand":"FrameLeap Studio","ending_start":50.2}`。蓝白导览为 `editorial`，蓝金光带为 `ribbon`，墨蓝极简为 `minimal`，经典静态为 `classic`。`ending_brand` 可留空。

新建产品图解时，在「画面与交付 › 片尾样式」选样式并播放预览。分镜里的片尾设置可以存为模板。结构化出片请求使用 `params.ending={"style":"editorial","text":"了解更多\n关注我们","brand":"FrameLeap Studio","duration":4}`，时长范围 2–8 秒，接在正文之后。FrameLeap 对话也可以说“片尾用蓝白导览”。

只微调字幕时，传 `post:{"caption_bottom_pct":16,"caption_scale":1}`。距底部 16% 适合把竖版图解字幕放到进度线上方；数值越大越靠上，范围 2–40。字号倍率为 0.7–1.3。两项可单独传；不重写字幕或对时。新建图解可在「画面与交付 › 高级样式」设置字幕距底部。

核对方案的 `impact.render.mode=post`、`impact.needs_tts=false`，按用户已授权的范围用 `plan_id` 执行，再等待新任务并取回成片。此路径只做本地合成和检查，保留原音轨和原版本；补字幕、改片尾不用重新生成整片。

## 云端（远程）连接

连的是云端地址（`https://…/mcp`）时，FrameLeap 不在用户电脑上：
- 原片先用 `fl_upload` 获取 `upload_page`，由用户打开页面上传。再用 `fl_upload` 的 `status` 取当前工作区的 `source`，传给 `fl_create_video` 的 `sources` 或 `fl_edit_video` 的 `source`。
- 成片：`fl_get_outputs` 返回带时效的下载链接（默认 6 小时），不支持 `download_to`；把链接给用户。
- 局部修改与成片工作台共用版本。审核授权可出方案，出片授权可执行。同一账号重连后可继续使用一小时内生成的 `plan_id`。确认响应丢失时重发同一方案即可取回任务编号。若提示当前版本已切换，或任务执行失败，重新查看当前分段并生成方案。
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

- 用户说“用我们的某某技能 / 按我们的做法做一条”：先用 `fl_skills` 找到技能名，再调用 `fl_create_video` 时把它填进 `skill` 参数（等同于在 FrameLeap 的 AI 助手里打 /技能名）。技能的导入和创建请用户在 FrameLeap「风格 › 技能」里做。
- 用户说“用某某模板做”或要按固定格式批量出片：用 `fl_template` 的 `list` 找到 `template_id`，再用 `schema` 核对字段、`use` 传 `inputs` 开工，随后用 `fl_wait_task`。缺必填项时先问用户。口播模板用 `fl_edit_video`，`template` 填模板 ID。
- 口播模板也支持照片 / 数字人念稿：`fl_edit_video` 传 `avatar={look_id,mode:"script",voice_id,lip_engine}` 与 `script`，可省略 `source`。形象与本人音色先从 FrameLeap 目录核实；已定稿可传 `keep_full_source=true` 保留完整原文与顺序。照片上传与外部数字人生成须在用户授权范围内。桌面模板的「用这个」可选择原片或照片念稿。
- 模板的图片和音频可填当前工作区的 `tplasset:` 引用。本机也可填绝对路径。远程服务的模板说明支持上传素材时，先用 `fl_upload`，把上传完成后返回的 `source` 填入对应字段。
- 用户要设计新模板：按规范 `frameleap.template/v1` 写 JSON / YAML，先 `fl_template` `action=create` + `dry_run=true` 校验，按返回的每条 `fix` 改好，再正式保存。规范和样板见 FrameLeap 设置 › 开发者 › 模板开放接口（参照模板）。
- 用户要导出模板对接包时，本机使用 `fl_template` 的 `export_dev_kit`，把需求要点和 ZIP 路径交给用户。远程服务的工具描述提供 `zip_url` 时，用同一操作获取限时下载链接。旧版远程服务在 FrameLeap 模板界面导出。对接包和带权限的下载链接仅交给提出请求的用户。

## 选哪种模式

不用自己判断，`fl_create_video` 会选。需要参考时看 [references/modes.md](references/modes.md)。已经明确模式和参数时可以用 `fl_start_studio`（智能出片）或 `fl_edit_video`（口播后期）跳过对话。

### 每日资讯风格

结构化出片使用 `kind=news_brief`，例如 `params.visual_style={"preset":"classic"}`。FrameLeap「每日资讯」可以按场景预览片头、资讯页和片尾。

预设包括自动适配 `inherit`、经典蓝白快讯 `classic`、清爽新闻 `editorial`、石墨快报 `graphite`、杂志笔记 `notebook`、深蓝科技 `cobalt`、薄荷观察 `mint`、暖色日报 `warm`、证据片 `evidence`、极简信号 `swiss`。使用 `params.platform_styles` 为指定平台单独设置风格。

## 写需求的要点

一句话里尽量包含：做什么（模式/主题）、素材（原片路径、网址、照片）、平台和横竖屏、时长、风格和语气、配音（男声/女声/我的声音/数字人）、语言。例如：

- “把 ~/Movies/talk.mp4 剪成抖音和 B 站两个版本，去口癖，加字幕和轻音乐”
- “做一期今天的 AI 早报，6 条，竖屏，女声播报”
- “给 https://example.com 做一个 1 分钟的使用介绍视频，演示注册和创建项目”
- “用 AI 生图做一条 30 秒的番茄炒蛋教程，温馨风格”

## 没有 MCP 工具时

如果 `fl_*` 工具不可用但能运行终端命令：先确认 FrameLeap 已启动，再参考 [references/cli.md](references/cli.md) 用 HTTP 接口完成同样流程。
