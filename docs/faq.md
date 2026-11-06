# 常见问题

**AI 助手说“没有找到 FrameLeap 服务”？**
本机：先打开 FrameLeap Studio 桌面版（关掉窗口不影响，后台服务还在）。云端：检查 `FRAMELEAP_URL` 是否填对，`npx -y frameleap-mcp --check` 诊断。

**返回 401 / “需要登录”？**
云端需要登录授权或 API Key。Key 被吊销、成员被移出工作区、授权被撤销时也会 401，重新连接即可。

**返回 403 forbidden？**
授权的权限不够（比如选了“只看”）。重新授权并选择“出片”，或请管理员调整你的角色。

**返回 429？**
达到了外部智能体的每日任务数或同时进行的任务上限，在 FrameLeap「设置 › 接入 AI 助手 › 接入策略」里调整。AI 助手不应反复重试。

**会不会自己发布？**
不会。发布必须两步：第一次只返回预览和确认令牌，用户明确同意后带令牌再调用才发布；FrameLeap 里还可以完全关闭外部智能体发布。

**卸载 FrameLeap 后客户端里还有失效的 frameleap？**
卸载前在 FrameLeap 菜单「服务 › 移除所有 AI 助手接入…」；已经卸载的话，按 [各客户端接入](clients/index.md) 里的配置位置手动删掉 `frameleap` 一项。

**Windows 上客户端提示找不到 npx？**
部分客户端不经过命令行外壳启动程序。把配置里的 `"command": "npx"` 改成 `"command": "cmd"`，`args` 改成 `["/c", "npx", "-y", "frameleap-mcp"]`；或者装了 FrameLeap 桌面版时直接用一键接入（写的是本机 `frameleap-mcp.exe`）。
