# 参与贡献

## 提交客户端适配文件（最常见）

让一个新的 AI 软件支持 FrameLeap 一键接入，只需要一份 `frameleap-client/1` 适配文件，不用改任何代码：

1. 按 [docs/adapters.md](docs/adapters.md) 写 `adapters/<id>/frameleap-client.<id>.json`（`id` 用小写字母、数字、`-` `_`）；
2. 本地校验：`python3 scripts/validate_adapter.py adapters/<id>/frameleap-client.<id>.json`；
3. 开 Pull Request，按模板填写软件官网、配置文件位置的官方文档链接、在哪些系统上实测过；
4. 我们审核（路径只能在用户主目录内、命令行只能是该软件自己的命令、安装链接只能是该软件的协议）后合并，下一版 FrameLeap 会把它收录进内置列表。

软件厂商也可以不经过本仓库：把适配文件放进用户电脑的 `~/.config/frameleap/clients/<id>.json`，FrameLeap 会自动识别（见 docs/vendor-guide.md）。

## 文档与转发程序

- 文档在 `docs/`，`docs/tools.md` 和 `docs/clients/` 由 FrameLeap 主仓库生成，请在 Issue 里指出问题；
- 转发程序改动请附测试：`cd packages/frameleap-mcp && npm test`。

## 行为准则

友善、就事论事；不提交他人的密钥、内部地址或受版权保护的素材。
