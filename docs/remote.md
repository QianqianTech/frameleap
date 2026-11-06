# 云端 / 远程接入

FrameLeap 云端（以及企业私有化部署）提供远程 MCP：`https://<域名>/mcp`，协议 **Streamable HTTP**。

## 登录授权（推荐）

支持 MCP 授权（OAuth 2.1）的客户端只需要填地址：第一次连接时会打开 FrameLeap 的登录页，选择工作区和权限：

| 权限 | 能做什么 |
|---|---|
| 只看 | 查看任务、拿成片链接 |
| 审片 | 只看 + 提修改意见 |
| 出片 | 新建任务、改片、回复审片；发布前仍需你在对话里确认 |

授权随时可以在 FrameLeap「设置 › 接入 AI 助手 › 已授权的应用」里撤销。

## API Key

不支持登录授权的客户端带请求头 `Authorization: Bearer fl_…`。Key 在「设置 › 接入 AI 助手 › API Key」生成（需要管理员），权限不会超过生成者自己的角色。

## 文件

- 原片：AI 助手调用 `fl_upload` 拿到上传页面，你在浏览器里打开上传（2 小时内有效，只能用一次）；命令行环境可以直接 `curl -T 文件 <链接>`；
- 成片：`fl_get_outputs` 返回带时效的下载链接（默认 6 小时）。

## 只能启动本机命令的客户端

```json
{"mcpServers": {"frameleap": {"command": "npx", "args": ["-y", "frameleap-mcp"],
  "env": {"FRAMELEAP_URL": "https://<域名>", "FRAMELEAP_API_KEY": "fl_xxx"}}}}
```

`npx -y frameleap-mcp --check` 可以诊断连接。
