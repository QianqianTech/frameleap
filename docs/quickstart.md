# 快速开始

## 1. 准备 FrameLeap

- **桌面版**：从 [下载页](https://www.qianqianai.com) 安装 FrameLeap Studio，打开后按首次设置向导填模型 Key、自检；
- **云端版**：向管理员要云端地址（如 `https://frameleap.example.com`），用邮箱登录。

## 2. 接入你的 AI 助手

| 客户端 | 最快的方式 |
|---|---|
| 本机装了桌面版 | FrameLeap「设置 › 接入 AI 助手」→ 在检测到的客户端旁点「一键接入」→ 重启客户端 |
| Claude（网页 / 桌面 / 手机） | 设置 › Connectors › Add custom connector → 填 `https://<域名>/mcp` → Connect → 登录授权 |
| Claude Code | `claude mcp add --transport http --scope user frameleap https://<域名>/mcp`，再输入 `/mcp` 登录 |
| 其它客户端 | 见 [各客户端接入](clients/index.md) |

## 3. 试一下

对 AI 助手说：

> 用 FrameLeap 做一期今天的 AI 早报，竖屏，1 分钟左右

它会调用 `fl_create_video` 开工，用 `fl_wait_task` 等进度（一般几分钟到十几分钟），做完给你成片链接。
想发布时说“发到抖音”，它会先给你看平台、账号、标题和文案，你同意后才会发布。
