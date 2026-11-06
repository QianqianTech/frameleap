# 没有 MCP 时：直接调 HTTP 接口

FrameLeap 桌面版监听 `127.0.0.1:17860–17899` 中的一个端口，`frameleap serve` 默认 `127.0.0.1:8000`。用 `GET /api/meta` 判断哪个端口是 FrameLeap。云端部署需要请求头 `Authorization: Bearer fl_…`。

```bash
BASE=http://127.0.0.1:17860
# 1. 需求 → 方案（返回 mode / studio / draft / ready / reply）
curl -s $BASE/api/assistant/intake -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"做一期今天的 AI 早报，竖屏"}]}'
# 2a. 智能出片（mode≠talking_head）：用上一步的 mode 和 studio
curl -s $BASE/api/studio/runs -H 'Content-Type: application/json' -d '{"kind":"news_brief","params":{...}}'
# 2b. 口播后期：用上一步的 draft，加 source
curl -s $BASE/api/jobs -H 'Content-Type: application/json' -d '{"source":"/abs/talk.mp4","platforms":["douyin"],"review":"auto"}'
# 3. 进度
curl -s $BASE/api/studio/runs/<id>      # 或 /api/jobs/<id>
# 4. 确认 / 修改
curl -s $BASE/api/assistant/run/<id> -H 'Content-Type: application/json' -d '{"text":"通过"}'   # 作业用 /api/assistant/job/<id>
# 5. 成片
curl -s $BASE/api/jobs/<id>/outputs     # 智能出片看 /api/studio/runs/<id> 的 outputs，文件在 /api/studio/files/<id>/<path>
```

发布同样必须先得到用户同意：`POST /api/publish/batch {"job_id": "<作业 id 或 studio:<run id>>", "targets": [{"platform": "douyin", "account": "<账号 id>", "method": "browser"}]}`。
