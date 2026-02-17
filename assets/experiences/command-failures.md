# Command Failure Log

<!--
自动记录命令执行失败信息，用于后续迭代修复。
由 topic-manager 和 writing-assistant 在命令失败时写入。
每次会话开始时检查未修复 (🔴) 的问题。
-->

<!-- 示例格式：
## 2026-02-17 11:30

**失败命令**: `python scripts/xhs_client.py search "AI"`
**错误信息**: ConnectionError: Cannot connect to localhost:18060
**失败原因**: xiaohongshu-mcp server 未启动
**影响范围**: 小红书内容搜索不可用
**临时解决方案**: 使用 WebSearch 搜索小红书公开内容
**修复建议**: 启动 MCP server: `NO_PROXY=localhost .claude/skills/xiaohongshu-mcp/bin/xiaohongshu-mcp-darwin-arm64`
**状态**: 🟢 已修复
-->