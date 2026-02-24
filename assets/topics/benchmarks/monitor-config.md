# 爆款监控配置

> 由 topic-manager "监控爆款"和"启动爆款监控"命令读取。修改此文件以调整监控范围、频率和筛选条件。

## 抓取源

| 平台 | 命令 | 状态 |
|------|------|------|
| X/Twitter | `bird home --cookie-source chrome` | 默认启用 |
| 小红书 | `python scripts/xhs_client.py search` + `feeds` | 默认启用 |
<!-- 可扩展：添加其他平台/站点 URL，如新榜、蝉妈妈等 -->

## 监控参数

- **每次抓取条数**: 20
- **监控频率**: 每 4 小时（后台模式）

## 分平台筛选阈值

| 平台 | 高互动标准 | 说明 |
|------|-----------|------|
| X/Twitter | 点赞 > 100 或 转发 > 50 | timeline 自然内容 |
| 小红书 | likedCount > 500 或 collectedCount > 200 | search_feeds 完整数据；list_feeds 仅 likedCount |

> 以上阈值可根据实际情况调整。不同领域的"高互动"标准差异很大。

## 小红书数据可用性

| MCP 工具 | 返回字段 | 说明 |
|----------|---------|------|
| `search_feeds` | likedCount, collectedCount, commentCount, sharedCount | 完整 interactInfo，可直接筛选排序 |
| `list_feeds` | likedCount | 仅点赞数，需 `get_feed_detail` 补全 |
| `get_feed_detail` | 完整内容 + 评论 + 全部互动数据 | 单条详情，用于二次enrichment |

**策略**: `search_feeds` 结果可直接按互动数据筛选排序；`list_feeds` 结果先按 likedCount 初筛 Top 5，再调用 `get_feed_detail` 补全完整互动数据后重新排序。

## 排序权重

| 平台 | 权重（从高到低） |
|------|----------------|
| 小红书 | commentCount（最高） > likedCount = sharedCount > collectedCount（最低） |
| X/Twitter | replies（最高） > retweets > likes（最低） |

## 监控关键词（可选）

> 留空则仅读 timeline/推荐流。填写关键词后，会在搜索时使用这些关键词。

- AI
- 写作
<!-- 添加更多关键词 -->

## 排除关键词（可选）

> 匹配到排除关键词的内容会被过滤掉。

<!-- 添加排除关键词 -->