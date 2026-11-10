# 工具参考

> 由 FrameLeap 主仓库的工具定义自动生成，请勿手改（CI 会校验与代码一致）。

| 工具 | 用途 | 只读 |
|---|---|---|
| `fl_memory` | 记忆与跨会话历史 | 否 |
| `fl_create_video` | 用一句话做视频 | 否 |
| `fl_edit_video` | 口播素材后期 | 否 |
| `fl_start_studio` | 按参数启动智能出片 | 否 |
| `fl_list_tasks` | 任务列表 | 是 |
| `fl_get_task` | 任务详情 | 是 |
| `fl_wait_task` | 等待任务 | 是 |
| `fl_reply` | 对任务说话 | 否 |
| `fl_cancel_task` | 取消任务 | 否 |
| `fl_get_outputs` | 获取成片 | 否 |
| `fl_catalog` | 可选项目录 | 是 |
| `fl_resources` | 搜索并搭配模板、风格与动效 | 否 |
| `fl_publish` | 发布到平台 | 否 |
| `fl_segments` | 成片分段 | 是 |
| `fl_segment_edit` | 选段修改 | 否 |
| `fl_redub` | 重新配音 | 否 |
| `fl_template` | 模板：查找 / 按模板出片 / 新建 / 导出对接包 | 否 |
| `fl_upload` | 上传原片（远程） | 否 |
| `fl_skills` | 可用的技能 | 是 |
| `fl_status` | 服务检查 | 是 |
| `fl_plan` | 制作方案与确认 | 否 |
| `fl_story_script` | 生图成片文字分镜 | 否 |
| `fl_storyboard` | 产品图解分镜 | 否 |
| `fl_task_action` | 审片与续跑 | 否 |
| `fl_assets` | 工作区素材库 | 否 |
| `fl_publications` | 发布回执 | 是 |
| `fl_automation` | 栏目自动化 | 否 |
| `fl_capabilities` | 查找 FrameLeap 软件能力 | 是 |
| `fl_invoke` | 调用 FrameLeap 软件能力 | 否 |

## `fl_memory` · 记忆与跨会话历史

先查可靠偏好再询问缺项；search 返回索引，read 按需回读，timeline 查纠正先后。仅在用户明确要求记住或忘记时调用 remember/forget；保存时携带 list 返回的字段 revision，新增字段用 0。身份取自连接账户。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：list / changes / search / read / timeline / continuation / remember / forget | 是 |  |
| `query` | string |  |  |
| `ref` | string |  |  |
| `mode` | string |  |  |
| `fields` | object |  |  |
| `revisions` | object |  |  |
| `keys` | array |  |  |
| `scope` | string：personal / project / workspace |  |  |
| `project_id` | string |  |  |
| `after` | integer |  |  |
| `offset` | integer |  |  |
| `limit` | integer |  |  |

## `fl_create_video` · 用一句话做视频

首选入口。把用户对视频的描述原样传进来，FrameLeap 的 AI 助手会自动选择模式（口播后期 / 每日资讯 / 软件演示 / AI 生图成片 / 产品图解 / 热点解读 / AI 视频）并补全设置。返回 status=need_input 时，把 assistant_reply 里的问题转述给用户，拿到回答后带同一个 session_id 再调用；返回 started 时得到 task_id，用 fl_wait_task 等待。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `request` | string | 是 | 用户的需求原话或对问题的回答，例如“做一期今天的 AI 早报，竖屏发抖音” |
| `session_id` | string |  | 继续上一次的需求对话时传入（来自上一次返回） |
| `source` | string |  | 原片：本机视频文件绝对路径，或 http(s) / s3 地址。口播后期必填 |
| `sources` | array |  | 多个原片（批量建作业） |
| `platforms` | array |  | 目标平台，如 douyin、bilibili、xiaohongshu、channels、youtube |
| `approval` | string：auto / manual / skip |  | 审批方式：auto 质检通过自动往下走、有问题才停（默认）；manual 每一步都停下等确认；skip 全程不停（发布和超预算仍会询问）（默认 "auto"） |
| `start` | boolean |  | false = 生成确认单；有 plan_id 时经 fl_plan 确认提交（默认 true） |
| `skill` | string |  | 用工作区里的某个技能来做（技能名，见 fl_skills），例如用户说“用我们的探店技能做一条” |

## `fl_edit_video` · 口播素材后期

口播制作与后期：已有视频传 source；照片或数字人念稿传 avatar（mode=script）和 script，生成口播后沿用模板做字幕、包装和多平台导出。只描述需求时用 fl_create_video。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string |  | 原片绝对路径或 http/s3 地址；数字人念稿时可省略 |
| `platforms` | array |  | （默认 ["douyin"]） |
| `title` | string |  | 片内 / 发布标题 |
| `style_hint` | string |  | 风格提示，如“知识科普，沉稳” |
| `script` | string |  | 可选文稿，按稿剪辑 |
| `bgm` | string |  | 配乐文件；none = 不配乐；不填自动选曲 |
| `remove_fillers` | boolean |  | （默认 true） |
| `speaker_name` | string |  |  |
| `speaker_title` | string |  |  |
| `avatar` | object |  | 已有数字人或照片形象：look_id、mode（script/replace/pip）、voice_id、lip_engine（qtalk/wan/heygen）、motion_prompt；script 模式可代替原片 |
| `style_template` | string |  |  |
| `brandkit` | string |  |  |
| `marketing` | object |  | 企业营销简报，填写 objective、brand_name、offer、audience、selling_points、evidence、cta_text、cta_detail 等字段 |
| `screencast` | boolean |  | 原片以软件录屏为主，技术质检对照原片中的界面停留 |
| `hotwords` | array |  |  |
| `keep_full_source` | boolean |  | 保留完整原稿与顺序，适合已定稿的数字人口播 |
| `template` | string |  | 作业模板 ID（fl_catalog what=templates） |
| `approval` | string：auto / manual / skip |  | 审批方式：auto 质检通过自动往下走、有问题才停（默认）；manual 每一步都停下等确认；skip 全程不停（发布和超预算仍会询问）（默认 "auto"） |

## `fl_start_studio` · 按参数启动智能出片

高级用法：已经知道具体模式和参数时直接启动（每日资讯 news_brief、软件演示 software_demo、AI 生图成片 image_story、产品图解 product_explainer、热点解读 self_media、AI 视频 ai_video），或按模板 ID 启动。参数不确定时用 fl_create_video。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `kind` | string：news_brief / software_demo / image_story / product_explainer / self_media / ai_video / image_gen / knowledge_film / footage |  |  |
| `params` | object |  | 该模式的参数（与 FrameLeap 界面里的设置同名） |
| `template` | string |  | 模板 ID（fl_catalog what=templates）；传此项时 params 只能填模板 schema 的字段。已编译的出片设置请只传 kind 和 params。 |
| `name` | string |  | 任务名 |
| `start` | boolean |  | false = 只保存待确认方案 |
| `idempotency_key` | string |  | 直接开工时的稳定提交标识 |
| `approval` | string：auto / manual / skip |  | 审批方式：auto 质检通过自动往下走、有问题才停（默认）；manual 每一步都停下等确认；skip 全程不停（发布和超预算仍会询问）（默认 "auto"） |

## `fl_list_tasks` · 任务列表

列出 FrameLeap 任务中心里最近的任务（口播作业和智能出片在同一个列表），phase 为 running / needs_input / done / failed / cancelled。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `limit` | integer |  | （默认 20） |
| `phase` | string：running / needs_input / done / failed / cancelled |  |  |
| `state` | string |  | 按具体业务状态筛选，如 needs_attention 或 waiting_credits |
| `type` | string：all / job / run |  | （默认 "all"） |

## `fl_get_task` · 任务详情

查看一个任务的状态、当前步骤、最近的制作过程和待确认内容。等待进度请用 fl_wait_task，不要反复调用本工具。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `events` | integer |  | （默认 8） |

## `fl_wait_task` · 等待任务

等待任务推进：直到完成、失败、需要确认，或超时（默认 45 秒，最长 300 秒）后返回当前状态。still_running=true 时可以再次调用。期间会发送进度通知。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `timeout_s` | integer |  | （默认 45） |

## `fl_reply` · 对任务说话

像在 FrameLeap 对话里一样对任务说一句话：审片 / 草稿时说“通过”或修改意见（“字幕再大一点”“开头那句删掉”“换成男声”），完成后说“再改改…”出新一版，失败后说“重试”。智能出片支持查询后续修改、取消后续修改和提交确认单。提交前要先给用户看方案并得到本人明确同意。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `text` | string |  |  |
| `action` | string：say / confirm / followups / cancel_followup |  | （默认 "say"） |
| `confirm_token` | string |  |  |
| `confirm_kind` | string：production_edit / rerun |  |  |
| `followup_id` | string |  |  |

## `fl_cancel_task` · 取消任务

停止一个正在制作的任务。已完成的阶段会保留，之后可用 fl_reply 说“重试”继续。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |

## `fl_get_outputs` · 获取成片

列出任务的成片、封面、字幕等文件和预览链接；传 download_to（绝对路径目录）可把成片下载到本机，例如用户的项目文件夹。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `include_previews` | boolean |  | 同时返回允许交付的中间预览 |
| `download_to` | string |  | 下载目录（绝对路径），不传则只返回链接 |
| `videos_only` | boolean |  | 下载时只下视频（false 时一并下载封面、字幕、文案）（默认 true） |

## `fl_catalog` · 可选项目录

capabilities 返回可制作片型和确认单字段，指定 mode 可读取字段、选项和预估。也可查询模式、模板、音色、平台、账号和字幕风格。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `what` | string：capabilities / modes / templates / voices / platforms / accounts / caption_styles |  | （默认 "modes"） |
| `mode` | string |  |  |
| `params` | object |  |  |

## `fl_resources` · 搜索并搭配模板、风格与动效

search 搜索整个授权目录，支持语义关键词、别名、#044 和分页。prepare 用真实 ID 将组合编译为可恢复的制作方案，不开工、不记为长期偏好；补齐输入后通过 fl_plan 确认。普通一句话需求仍可用 fl_create_video 自动选择。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：search / prepare | 是 |  |
| `query` | string |  |  |
| `kind` | string： / template / style_pack / motion |  |  |
| `mode` | string |  |  |
| `offset` | integer |  |  |
| `limit` | integer |  |  |
| `template` | string |  |  |
| `version` | integer |  |  |
| `inputs` | object |  |  |
| `current` | object |  |  |
| `style_pack` | string |  |  |
| `motion` | string |  |  |
| `approval` | string：auto / manual / skip |  | 审批方式：auto 质检通过自动往下走、有问题才停（默认）；manual 每一步都停下等确认；skip 全程不停（发布和超预算仍会询问）（默认 "auto"） |

## `fl_publish` · 发布到平台

把已完成并确认的成片发布到一个或多个平台 / 账号。两步：第一次调用只返回预览和 confirm_token（不发布）；把预览给用户看并得到明确同意后，用完全相同的参数加 confirm_token 再调用一次才真正发布。不得在用户没有同意时发布。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `targets` | array | 是 | 发布目标 |
| `title` | string |  |  |
| `description` | string |  |  |
| `tags` | array |  |  |
| `at` | number |  | 定时发布（秒级时间戳），不填立即 |
| `confirm_token` | string |  | 第一次调用返回的令牌；只有用户同意后才传 |

## `fl_segments` · 成片分段

查看智能出片成片的当前版本、分段时间、缩略图、画面文字、旁白和可执行的修改。传 exact_version 可查指定的历史版本。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 成片任务编号（run:…） |
| `exact_version` | boolean |  | true 查指定版本，默认跟随当前版本（默认 false） |

## `fl_segment_edit` · 选段修改

沿用工作台局部修改流程，默认在当前版本选段。已有 SRT 要嵌入画面或只改片尾卡时传 post。先生成方案，用户同意后带返回的 task_id 和 plan_id 执行。同一方案重复确认返回已有任务。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 成片任务编号（run:…）。执行时传方案返回的 task_id |
| `exact_version` | boolean |  | 生成方案时显式指定历史版本。默认跟随当前版本（默认 false） |
| `segment_ids` | array |  | 要改的段（fl_segments 返回的 id），简洁档最多连选 3 段 |
| `request` | string |  | 怎么改，例如：把“旧文字”改成“新文字”、这句旁白改成……、换一张图、删掉这段 |
| `mode` | string：simple / pro |  | （默认 "simple"） |
| `post` | object |  | 在已渲染成片上合成，不用选段。沿用原旁白和字幕时间。 |
| `plan_id` | string |  | 第一步返回的方案编号，有效期一小时。用户同意后传入。同一账号可在重连后继续执行 |

## `fl_redub` · 重新配音

对配音 / 音色不满意时用：只重新配音（换音色、调语速），文稿、画面、配图、录屏都沿用原片，不重新生成整片；原版保留，返回新任务编号。智能出片（run:…）支持音色和语速；口播作业（job:…）支持全片换声。会产生配音费用（带数字人的片子还要重对口型），先 dry_run=true 看影响并征得用户同意。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `voice` | string |  | 新音色 id（fl_catalog what=voices）；default = 恢复默认音色 / 原声；不传 = 不换音色 |
| `voice_name` | string |  |  |
| `voice_target` | string |  | 音色所属配音目标，如 heygen:heygen-voice-1；音色库别名可不填 |
| `speed` | number |  | 语速倍数 0.7–1.5（只对智能出片），如 1.1 表示快一点 |
| `ai_label_placement` | string：corner / intro_footer |  | 生图成片的生成标识放在全程角标或片头底部 |
| `workspace_watermark` | boolean |  | 生图成片修订版是否叠加工作区文字水印 |
| `dry_run` | boolean |  | true：只返回能否重新配音、沿用 / 重做哪些、计费项，不执行（默认 false） |

## `fl_template` · 模板：查找 / 按模板出片 / 新建 / 导出对接包

查找模板、读取填空或版本、按指定版本准备制作、从已验收作品保存模板。prepare 先校验输入并预估，用户确认后用 fl_plan 提交。use 直接开工。create 可用 dry_run 校验。export_dev_kit 导出对接包。口播模板请用 fl_edit_video。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：list / schema / versions / use / create / prepare / from_task / export_dev_kit | 是 |  |
| `template_id` | string |  | schema / use / export_dev_kit 必填 |
| `version` | integer |  |  |
| `task_id` | string |  | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `keyword` | string |  | list：按名称 / 分类 / 说明筛选 |
| `mode` | string |  | list：按生成方式筛选 |
| `mine` | boolean |  | list：只看自建模板 |
| `limit` | integer |  | （默认 30） |
| `inputs` | object |  | use：填空内容 {字段 key: 值}，字段见 action=schema |
| `name` | string |  |  |
| `template` | 任意 |  | create：模板对象或 JSON / YAML 文本，最外层要有 format: frameleap.template/v1 和 mode |
| `dry_run` | boolean |  | （默认 false） |
| `lang` | string：zh / en |  | （默认 "zh"） |
| `save_dir` | string |  | export_dev_kit：保存目录（默认 ~/Downloads） |
| `link_days` | integer |  |  |

## `fl_upload` · 上传原片（远程）

远程（云端）连接时上传原片 / 素材：action=create 返回上传页面链接（给用户在浏览器里打开）和 curl 命令；上传完 action=status 拿到 source，再传给 fl_create_video / fl_edit_video。本机连接不需要上传，直接传文件路径。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：create / status |  | （默认 "create"） |
| `name` | string |  | 文件名（含扩展名，如 口播.mp4） |
| `upload_id` | string |  | action=status 时：create 返回的 upload_id |
| `operation_id` | string |  | 为指定的 fl_invoke 能力上传文件，本机也可使用，模板包等格式需传入 |

## `fl_skills` · 可用的技能

列出用户在 FrameLeap 里启用的技能（团队做某一类片子的做法说明，如“门店探店”）。用户提到“用我们的 XX 技能 / 按我们的做法”时先调用，再在 fl_create_video 的 skill 参数里填技能名。只读。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `keyword` | string |  | 按名称 / 说明筛选 |

## `fl_status` · 服务检查

检查 FrameLeap 服务是否在运行、版本、工作区；deep=true 时附带环境预检和模型 Key 健康状况。出错时先调用它。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `deep` | boolean |  | （默认 false） |

## `fl_plan` · 制作方案与确认

读取、修改或提交带版本的制作方案。早报支持 news_preview、news_status、pick_news。confirm 前展示方案与费用预估，只有用户确认后才提交当前 revision。重连可用 get 查回执。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：get / news_status / update / confirm / news_preview / pick_news | 是 |  |
| `plan_id` | string | 是 |  |
| `revision` | integer |  |  |
| `patch` | object |  |  |
| `preview_id` | string |  |  |
| `news_ids` | array |  |  |

## `fl_story_script` · 生图成片文字分镜

知识科普等生图成片的可编辑文字分镜。preview 只写稿，支持 template_id + inputs/overrides 或 params；list 恢复已保存分镜；get 读取。update 的 patch 支持 shots（i/text/visual/characters）与 characters（id/name/desc）；update/start 必须带当前字符串 revision。start 沿用已核对的分镜、音色和品牌，stage 为 draft 或 final。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：list / preview / get / update / start | 是 |  |
| `script_id` | string |  |  |
| `revision` | string |  |  |
| `params` | object |  |  |
| `template_id` | string |  |  |
| `inputs` | object |  |  |
| `overrides` | object |  |  |
| `patch` | object |  |  |
| `stage` | string：draft / final |  |  |

## `fl_storyboard` · 产品图解分镜

读取或修改产品图解草稿。update 与 start 必须带当前 revision。展示分镜并获得用户确认后执行 start。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：get / update / start | 是 |  |
| `draft_id` | string | 是 |  |
| `revision` | integer |  |  |
| `patch` | object |  |  |

## `fl_task_action` · 审片与续跑

inspect 查看审核内容和版本。用户确认后用 approve 或 reject 提交意见，attest 提交已复核的具体质检项，release 完成验收，retry 续跑中断任务。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：inspect / approve / reject / attest / release / retry | 是 |  |
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `review_revision` | string |  |  |
| `media_revision` | string |  |  |
| `note` | string |  |  |
| `artifact` | string |  |  |
| `checks` | object |  |  |

## `fl_assets` · 工作区素材库

搜索、查看或收藏到素材库。把返回的 asset_ref 填入模板的图片或音频字段。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：search / get / save | 是 |  |
| `keyword` | string |  |  |
| `asset_ref` | string |  |  |
| `kind` | string |  |  |
| `scope` | string：builtin / library / favorites / enterprise |  |  |
| `page` | integer |  |  |
| `limit` | integer |  |  |

## `fl_publications` · 发布回执

按发布记录、任务或平台查询提交后的状态和平台回执。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `publication_id` | string |  |  |
| `task_id` | string |  | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `status` | string |  |  |
| `platform` | string |  |  |
| `limit` | integer |  |  |

## `fl_automation` · 栏目自动化

查询栏目或预览配置。prepare 保存待确认的试跑、启停或周期栏目方案，再由 fl_plan 确认。试跑只进入审片。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：list / preview / prepare | 是 |  |
| `operation` | string：run / enable / pause / schedule |  |  |
| `channel_id` | string |  |  |
| `config` | object |  |  |
| `topic` | string |  |  |

## `fl_capabilities` · 查找 FrameLeap 软件能力

发现各模块的可用操作。用 group 或 q 查找，带 operation_id 读取路径参数、查询参数、请求体和确认方式。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `group` | string |  |  |
| `q` | string |  |  |
| `operation_id` | string |  |  |
| `offset` | integer |  |  |
| `limit` | integer |  |  |
| `include_unavailable` | boolean |  |  |

## `fl_invoke` · 调用 FrameLeap 软件能力

使用 fl_capabilities 返回的 operation_id 调用原生功能。读取立即执行。写入先返回方案，用户核对后以 action=confirm 提交 plan_id 和 revision。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：call / status / confirm |  | （默认 "call"） |
| `operation_id` | string |  |  |
| `arguments` | object |  |  |
| `plan_id` | string |  |  |
| `revision` | integer |  |  |

资源：`frameleap://task/{task_id}`（任务详情，完成后含成片链接）。
