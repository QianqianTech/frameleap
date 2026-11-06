# 工具参考

> 由 FrameLeap 主仓库的工具定义自动生成，请勿手改（CI 会校验与代码一致）。

| 工具 | 用途 | 只读 |
|---|---|---|
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
| `fl_publish` | 发布到平台 | 否 |
| `fl_segments` | 成片分段 | 是 |
| `fl_segment_edit` | 选段修改 | 否 |
| `fl_redub` | 重新配音 | 否 |
| `fl_template` | 模板：查找 / 按模板出片 / 新建 / 导出对接包 | 否 |
| `fl_upload` | 上传原片（远程） | 否 |
| `fl_status` | 服务检查 | 是 |

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
| `start` | boolean |  | false = 只出方案不开工，给用户确认后再带 start=true 调用（默认 true） |

## `fl_edit_video` · 口播素材后期

对已有口播视频做后期（去口癖粗剪、字幕包装、配乐、多平台导出），参数明确时用它，不经过对话。只描述需求时用 fl_create_video。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string | 是 | 原片绝对路径或 http/s3 地址 |
| `platforms` | array |  | （默认 ["douyin"]） |
| `title` | string |  | 片内 / 发布标题 |
| `style_hint` | string |  | 风格提示，如“知识科普，沉稳” |
| `script` | string |  | 可选文稿，按稿剪辑 |
| `bgm` | string |  | 配乐文件；none = 不配乐；不填自动选曲 |
| `remove_fillers` | boolean |  | （默认 true） |
| `speaker_name` | string |  |  |
| `speaker_title` | string |  |  |
| `template` | string |  | 作业模板 ID（fl_catalog what=templates） |
| `approval` | string：auto / manual / skip |  | 审批方式：auto 质检通过自动往下走、有问题才停（默认）；manual 每一步都停下等确认；skip 全程不停（发布和超预算仍会询问）（默认 "auto"） |

## `fl_start_studio` · 按参数启动智能出片

高级用法：已经知道具体模式和参数时直接启动（每日资讯 news_brief、软件演示 software_demo、AI 生图成片 image_story、产品图解 product_explainer、热点解读 self_media、AI 视频 ai_video），或按模板 ID 启动。参数不确定时用 fl_create_video。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `kind` | string：news_brief / software_demo / image_story / product_explainer / self_media / ai_video |  |  |
| `params` | object |  | 该模式的参数（与 FrameLeap 界面里的设置同名） |
| `template` | string |  | 模板 ID（fl_catalog what=templates） |
| `name` | string |  | 任务名 |
| `approval` | string：auto / manual / skip |  | 审批方式：auto 质检通过自动往下走、有问题才停（默认）；manual 每一步都停下等确认；skip 全程不停（发布和超预算仍会询问）（默认 "auto"） |

## `fl_list_tasks` · 任务列表

列出 FrameLeap 任务中心里最近的任务（口播作业和智能出片在同一个列表），phase 为 running / needs_input / done / failed / cancelled。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `limit` | integer |  | （默认 20） |
| `phase` | string：running / needs_input / done / failed / cancelled |  |  |
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

像在 FrameLeap 对话里一样对任务说一句话：审片 / 草稿时说“通过”或修改意见（“字幕再大一点”“开头那句删掉”“换成男声”），完成后说“再改改…”出新一版，失败后说“重试”。确认类回复必须来自用户本人的意见。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `text` | string | 是 | 要传达的话 |

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
| `download_to` | string |  | 下载目录（绝对路径），不传则只返回链接 |
| `videos_only` | boolean |  | 下载时只下视频（false 时一并下载封面、字幕、文案）（默认 true） |

## `fl_catalog` · 可选项目录

查询可选项：modes（视频模式和示例需求）、templates（模板）、voices（音色）、platforms（平台规格）、accounts（发布账号）、caption_styles（字幕风格）。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `what` | string：modes / templates / voices / platforms / accounts / caption_styles |  | （默认 "modes"） |

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

列出一条智能出片成片（run:…）的分段：每段的时间、标题、旁白、画面文字和能做的修改，以及历史版本。用于选段修改前。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |

## `fl_segment_edit` · 选段修改

只改成片里选中的几段，其余部分沿用原片（原版保留，可还原）。两步：先传 segment_ids + request 生成方案（不执行）；把方案和影响告诉用户，同意后带 plan_id 再调用一次执行，得到新任务编号。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `segment_ids` | array |  | 要改的段（fl_segments 返回的 id），简洁档最多连选 3 段 |
| `request` | string |  | 怎么改，例如：把“旧文字”改成“新文字”、这句旁白改成……、换一张图、删掉这段 |
| `mode` | string：simple / pro |  | （默认 "simple"） |
| `plan_id` | string |  | 第一步返回的方案编号；只有用户同意后才传 |

## `fl_redub` · 重新配音

对配音 / 音色不满意时用：只重新配音（换音色、调语速），文稿、画面、配图、录屏都沿用原片，不重新生成整片；原版保留，返回新任务编号。智能出片（run:…）支持音色和语速；口播作业（job:…）支持全片换声。会产生配音费用（带数字人的片子还要重对口型），先 dry_run=true 看影响并征得用户同意。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `task_id` | string | 是 | 任务编号，形如 job:abc123 或 run:xyz789（来自 fl_create_video / fl_list_tasks） |
| `voice` | string |  | 新音色 id（fl_catalog what=voices）；default = 恢复默认音色 / 原声；不传 = 不换音色 |
| `voice_name` | string |  |  |
| `voice_target` | string |  | 音色所属配音目标，如 heygen:heygen-voice-1；音色库别名可不填 |
| `speed` | number |  | 语速倍数 0.7–1.5（只对智能出片），如 1.1 表示快一点 |
| `dry_run` | boolean |  | true：只返回能否重新配音、沿用 / 重做哪些、计费项，不执行（默认 false） |

## `fl_template` · 模板：查找 / 按模板出片 / 新建 / 导出对接包

所有模板相关操作。action=list 列出模板（keyword 筛选）；schema 看某个模板要填什么；use 按模板出片（返回 task_id，图片 / 音频可写本机绝对路径，自动上传）；create 按规范 frameleap.template/v1 新建模板（严格校验，错误带修改建议，dry_run=true 只校验）；export_dev_kit 导出给三方的对接包 zip（link_days 同时生成只读链接）。口播模板出片请用 fl_edit_video。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `action` | string：list / schema / use / create / export_dev_kit | 是 |  |
| `template_id` | string |  | schema / use / export_dev_kit 必填 |
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

## `fl_status` · 服务检查

检查 FrameLeap 服务是否在运行、版本、工作区；deep=true 时附带环境预检和模型 Key 健康状况。出错时先调用它。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `deep` | boolean |  | （默认 false） |

资源：`frameleap://task/{task_id}`（任务详情，完成后含成片链接）。
