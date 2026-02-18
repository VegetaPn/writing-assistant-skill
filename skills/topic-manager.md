---
name: topic-manager
description: Manage writing topics from idea capture to development, with viral content benchmarking and publication metrics. Use when users say "记录选题", "看选题", "深化选题", "分析爆款", "监控爆款", "启动爆款监控", "看热点", "监控热点", "热点", "有什么热点", "最近有什么火的", "记录数据", or "看数据".
---

# Topic Manager

选题管理 + 爆款对标系统。负责**决定写什么**——从碎片想法到选题成熟。与写作系统 (writing-assistant) 分离：本系统产出准备好的选题，writing-assistant 从这里接手正式写作。

> **Three-Level Protocol:** 选题管理主要读写 user-level。所有 `assets/` 和 `references/` 读取使用 `READ:3L`（检查 system → user → project 三层并合并）。写入默认为 `WRITE:user`。详见 `references/three-level-protocol.md`。

## When to Use

**选题管理:**
- "记录选题" — 记录一个想法
- "看选题" / "我的选题" — 查看选题管线
- "深化选题" — 研究一个选题，分析角度、找爆款参考、生成大纲

**爆款对标:**
- "分析爆款" + URL/内容 — 分析一条爆款内容
- "监控爆款" / "看热点" / "监控热点" / "有什么热点" / "最近有什么火的" — 手动批量扫描当前热门内容
- "启动爆款监控" — 启动后台长期监控进程

**数据记录:**
- "记录数据" — 记录某篇文章的发布数据
- "看数据" — 查看某篇文章的历史数据

## Directory Structure

```
assets/topics/
├── inbox.md                    # 碎片想法收集箱（追加式）
├── developing/                 # 已研究、有大纲、准备好写的选题
│   └── {topic-slug}.md
└── benchmarks/                 # 爆款案例库
    ├── benchmarks-index.md     # 爆款索引（一行一条，含关键指标）
    ├── monitor-config.md       # 监控配置
    └── {platform}-{slug}.md   # 单篇爆款分析
```

## Prerequisites

- **bird skill** — Required for X/Twitter timeline reading and content fetching. Should be installed in the user's `.claude/skills/bird/` directory. If not available, "分析爆款" can still work with URLs via `WebFetch` or pasted content, but timeline-based commands (监控爆款/启动爆款监控) will be unavailable.

**bird command reference (important distinctions):**
- `bird home --cookie-source chrome` — Read your own X timeline feed (for trend monitoring)
- `bird read <url> --cookie-source chrome` — Read a specific tweet or thread (for analyzing individual content)
- `bird thread <url> --cookie-source chrome` — Read a full thread (for analyzing thread-format content)
- `bird search <query> --cookie-source chrome` — Search for tweets by keyword (NOT for timeline reading)

> **IMPORTANT:** When reading the user's timeline for trend monitoring (Commands 5 and 6), always use `bird home`, NOT `bird search`. `bird search` returns keyword-based search results and will miss organic timeline trends.
> **IMPORTANT:** Always use `--cookie-source chrome`. Do NOT use Safari cookies. If the project has `config/bird.json5`, this is already configured, but always pass the flag explicitly as a safeguard.

- **xiaohongshu-mcp skill** — Required for Xiaohongshu (小红书) content searching and analysis. Requires local MCP server running. Commands:
  - `python scripts/xhs_client.py search "{keyword}"` — Search notes by keyword
  - `python scripts/xhs_client.py detail "{feed_id}" "{xsec_token}"` — Get full content and comments
  - `python scripts/xhs_client.py feeds` — Get recommended feed
  - `python scripts/xhs_client.py publish "{title}" "{content}" "{images}"` — Publish a note

- **wechat-article-search skill** — Required for WeChat Official Account (微信公众号) article searching. Commands:
  - `node scripts/search_wechat.js "{keyword}"` — Search articles (default 10 results)
  - `node scripts/search_wechat.js "{keyword}" -n 15` — Search with custom result count
  - `node scripts/search_wechat.js "{keyword}" -n 5 -r` — Search with real URL resolution

## Dependency Pre-Check (所有命令执行前必做)

**在执行任何平台相关命令（监控爆款、看热点、分析爆款、深化选题等）之前**，必须先验证所需依赖是否已安装且可用。不要等到命令执行失败才发现依赖缺失。

**预检流程：**

1. **检查必要 skill 是否已安装**:
   - X/Twitter: 检查 `bird` 命令是否可用 → `bird whoami --cookie-source chrome`
   - 小红书: 检查 `xiaohongshu-mcp` 是否已安装 → `ls .claude/skills/xiaohongshu-mcp/` + 检查 MCP server 是否运行 → `curl -s http://localhost:18060/health` 或类似方式
   - 微信公众号: 检查 `wechat-article-search` 是否已安装 → `ls .claude/skills/wechat-article-search/`

2. **对于缺失的依赖**:
   - 检查 `dependencies/` 目录是否有打包好的版本
   - 如有，**主动安装**到 `.claude/skills/`（告知用户正在安装）
   - 如无法自动安装，**立即通知用户**，说明哪个平台将不可用及原因

3. **记录预检结果**，在透明度报告中体现：
   ```
   **平台可用性**:
   | 平台 | 依赖 | 状态 | 备注 |
   |------|------|------|------|
   | X/Twitter | bird CLI | ✅ 可用 | |
   | 小红书 | xiaohongshu-mcp | ❌ 未安装 | MCP server 未运行 |
   | 微信公众号 | wechat-article-search | ✅ 可用 | |
   ```

4. **如果某平台不可用**，不要静默跳过，必须：
   - 在透明度报告中标明该平台被跳过及原因
   - 用 `WebSearch` 作为降级方案搜索该平台的公开内容
   - 在命令失败日志中记录（见下方"命令失败日志"）

## Command Failure Log (命令失败日志)

**任何命令执行失败时**，必须记录到 `assets/experiences/command-failures.md` (`WRITE:user`)。

**记录格式：**

```markdown
## YYYY-MM-DD HH:MM

**失败命令**: `{exact command}`
**错误信息**: {error output, truncated to key info}
**失败原因**: {diagnosed reason: 依赖未安装 / 服务未启动 / 网络问题 / 权限问题 / 其他}
**影响范围**: {哪个功能受影响}
**临时解决方案**: {如有，如用 WebSearch 替代}
**修复建议**: {安装命令 / 配置步骤 / 需要用户操作}
**状态**: 🔴 未修复 / 🟡 临时绕过 / 🟢 已修复
```

**使用场景：**
- 依赖检查失败（skill 未安装、server 未启动）
- 命令执行返回错误码
- 命令超时无响应
- 命令返回空结果（可能是配置问题）

**在每次会话开始时**，读取 `command-failures.md`，检查是否有未修复 (🔴) 的问题，提醒用户并尝试自动修复。

## Initialize Workspace

Before executing any command, ensure user-level required directories and files exist. Create any that are missing; never overwrite existing files.

```
{project-root}/assets/topics/     # WRITE:user — all topic data lives at user level
├── inbox.md
├── developing/
└── benchmarks/
    ├── benchmarks-index.md
    └── monitor-config.md
{project-root}/assets/experiences/
└── command-failures.md            # WRITE:user — command failure log
```

---

## 选题管理

### 1. 记录选题

**Trigger:** "记录选题"

**Action:**
1. Append to `assets/topics/inbox.md` (`WRITE:user`) under today's date:
   ```markdown
   ## YYYY-MM-DD
   - {idea text}
   ```
2. If today's date section already exists, append to it.
3. Confirm: "已记录到选题收集箱。"

### 2. 看选题

**Trigger:** "看选题" / "我的选题" / "选题库"

**Action:**
1. Read `assets/topics/inbox.md` (`READ:user`) — show recent ideas (last 10)
2. List files in `assets/topics/developing/` (`READ:user`) — show mature topics ready to write
3. Summary: "收集箱 N 条 | 已深化 N 个"

### 3. 深化选题

**Trigger:** "深化选题" or "深化选题：{topic name}"

**Action:**
1. If no topic specified, show inbox and ask user to pick
2. Research phase:
   - Search `assets/topics/benchmarks/` (`READ:3L`) for related viral content
   - Search `references/` (`READ:3L`) for relevant author styles and techniques
   - Check `assets/experiences/lessons.md` (`READ:3L`) for relevant experience
3. Generate a preliminary outline:
   - Suggested angles (informed by benchmarks)
   - Key points to cover
   - Target audience
   - Recommended structure (from `references/by-element/structures/`, `READ:3L`)
4. Optionally invoke `skills/title-generator.md` for title candidates
5. Save to `assets/topics/developing/{topic-slug}.md` (`WRITE:user`):

```markdown
# Topic: {topic name}

**Created:** YYYY-MM-DD
**Target Platform:** {platform(s)}

## Idea
{original idea}

## Benchmark References
- {links to relevant benchmarks, with brief note on why relevant}

## Outline
{preliminary structure with key points}

## Title Candidates
{from title-generator, if invoked}

## Notes
{additional context, research findings}
```

6. Remove the idea from `inbox.md` (mark with ~~strikethrough~~)
7. Inform user: "选题已深化，保存在 developing/。准备好写的时候，启动 writing-assistant 即可。"

---

## 爆款对标

### 4. 分析爆款

**Trigger:** "分析爆款" + URL or pasted content

**Action:**
1. Fetch content:
   - X/Twitter URL → `bird read <url> --cookie-source chrome` or `bird thread <url> --cookie-source chrome`
   - 小红书 note → Use `xiaohongshu-mcp`: `python scripts/xhs_client.py detail "{feed_id}" "{xsec_token}"` to get full content and comments. If user provides a search keyword instead of ID, first search with `python scripts/xhs_client.py search "{keyword}"` then detail the target note.
   - 微信公众号 article → Use `wechat-article-search`: `node scripts/search_wechat.js "{keyword}" -n 5 -r` to find the article, then `WebFetch` to read the full content from the resolved URL.
   - Other URL → `WebFetch`
   - Pasted content → use directly
2. Create `assets/topics/benchmarks/{platform}-{slug}.md` (`WRITE:user`):

```markdown
# Benchmark: {original title}

**Platform:** {platform}
**Author:** {author}
**Date:** YYYY-MM-DD
**Metrics:** {likes / comments / shares / saves if available}
**URL:** {original URL}

## Original Content
{title and key content excerpts}

## Analysis

### Title
- **Type:** {title type from title-generator categories}
- **Tension Elements:** {对比/数字/悬念/冲突}
- **Why It Works:** {analysis}
- **Pattern:** {extractable template formula}

### Opening
- **Text:** {first 2-3 sentences}
- **Technique:** {hook technique name}
- **Why It Works:** {analysis}

### Structure
- **Type:** {problem-solution, narrative, listicle, etc.}
- **Flow:** {brief outline}

### Audience Resonance
- **Pain Point:** {what need this hits}
- **Emotional Trigger:** {curiosity/anxiety/empathy/surprise}

## Extractable Patterns
- Title pattern: {template}
- Hook pattern: {template}
- Topic angle: {reusable angle}
```

3. Append to `assets/topics/benchmarks/benchmarks-index.md` (`WRITE:user`)
4. **【必做】Dynamic reference building** — auto-enrich reference library (`WRITE:user`)。这是参考库动态增长的核心机制，分析完爆款后必须执行，不可跳过。

   从上面的 Analysis 中提取可复用模式，追加到参考库（格式与现有条目一致）：

   - **Title pattern** → append to `references/by-element/titles/titles-index.md`：
     ```markdown
     ## Title #N
     **Original Title:** {原标题}
     **Source:** {作者} - *{文章标题}* ({平台}, {日期})
     **Metrics:** {互动数据，如有}
     **Analysis（分析）：** {为什么这个标题有效，从 Benchmark Analysis 的 Title 部分提取}
     **Pattern（模式）：** `{可复用的标题模板公式}`
     ```
   - **Opening technique** → append to `references/by-element/openings/openings-index.md`：
     ```markdown
     ## Opening #N
     **Source:** {作者} - *{文章标题}* ({平台}, {日期})
     ### Original Text
     > {开头前 2-3 段}
     ### Analysis（分析）
     **使用的技巧：** {从 Benchmark Analysis 的 Opening 部分提取}
     **为什么有效：** {核心逻辑}
     ```
   - **Novel structure** → append to `references/by-element/structures/structure-templates.md`
   - **Hook** → append to `references/by-element/hooks/hook-examples.md`
   - **New author with multiple pieces** → create `references/authors/{name}/profile.md`

   > 不是每个维度都必须积累——只积累确实有新的、可复用模式的维度。但至少标题模式必须积累（每篇爆款都有标题）。
5. Ask: "要把这条爆款转化为选题吗？" If yes, run "爆款转选题" flow (Command 7).

### 5. 监控爆款

**Trigger:** "监控爆款" / "看热点" / "监控热点" / "有什么热点" / "最近有什么火的"

**Action (manual batch scan):**

像一个人刷 timeline 一样——需要大量阅读才能感知到什么在流行。不是看 10 条就够的，而是持续积累。

**Step 0: 依赖预检**

执行 "Dependency Pre-Check" 流程（见上方），确认各平台可用性。**记录不可用的平台和原因。** 如有命令失败，写入 `assets/experiences/command-failures.md`。

**Step 1: 读取监控配置**

Read `assets/topics/benchmarks/monitor-config.md` (`READ:3L`)，获取筛选阈值和关键词配置。

**Step 2: 多平台扫描（必须获取实时内容）**

> ⚠️ **实时性原则**：目标是获取"此刻"的热点内容，不是历史综述或月度总结。
> - 所有平台搜索**不加时间限定词**（不用"2月""本月""上周"等），直接搜关键词获取最新内容
> - 优先使用 timeline/feeds 类接口（返回的就是最新内容）
> - WebSearch 补充时，搜索"今天""实时""热门"，**绝对不要搜"X月热点总结"之类的月度回顾**
> - 判断时效性：如果内容发布时间超过 3 天，标注为"非实时"

1. **X/Twitter**: `bird home --cookie-source chrome` — 至少 20 条，可多次执行以获取更多内容
   > ⚠️ 必须用 `bird home`，不得用 `bird search`。`bird search` 是关键词搜索，会错过自然趋势。
   > `bird home` 返回的是实时 timeline，天然就是当下内容。
2. **小红书**: `python scripts/xhs_client.py feeds` (推荐流，实时内容) + `python scripts/xhs_client.py search "{relevant keywords}"` (关键词搜索)
   > 优先用 `feeds`（推荐流是实时的），再用 `search` 补充特定话题。
3. **微信公众号**: `node scripts/search_wechat.js "{relevant keywords}" -n 20`
   > 微信搜索默认按时间排序，返回的是最新文章。**不要在搜索词中加月份或日期**。
4. **WebSearch 补充（降级方案或额外信息源）**:
   > ⚠️ **禁止搜索月度/周度总结类内容**。
   > ❌ 错误："2026年2月AI热点总结"、"本月AI趋势回顾"
   > ✅ 正确："AI 热点 今天"、"AI最新动态"、直接搜具体话题关键词
   > 优先搜索具体话题而非笼统的"热点盘点"。

**Step 3: 积累式分析**

不是立即判断哪条是爆款，而是：
- 将所有内容记录下来（标题、互动数据、主题标签）
- 识别出现频率高的话题/关键词（大家都在聊什么）
- 找出互动数据明显高于平均的内容（参照 monitor-config.md 中的分平台阈值）
- 对比历史 benchmarks，识别新趋势

**Step 4:【强制】向用户呈现透明度报告**

> 扫描完成后，**必须**向用户呈现以下报告，不可省略任何字段：

```markdown
## 监控报告

**扫描时间**: YYYY-MM-DD HH:MM

**平台可用性**:
| 平台 | 依赖 | 状态 | 备注 |
|------|------|------|------|
| X/Twitter | bird CLI | ✅/❌ | {如失败则说明原因} |
| 小红书 | xiaohongshu-mcp | ✅/❌ | {如失败则说明原因} |
| 微信公众号 | wechat-article-search | ✅/❌ | {如失败则说明原因} |

**扫描范围**:
| 平台 | 执行命令 | 抓取条数 | 筛选条件 |
|------|---------|---------|---------|
| X/Twitter | `bird home --cookie-source chrome` | {N} 条 | 原始 timeline |
| 小红书 | `xhs feeds` + `xhs search "{keywords}"` | {N} 条 | 关键词: {keywords} |
| 微信公众号 | `search_wechat "{keywords}" -n 20` | {N} 条 | 关键词: {keywords} |

**命令失败记录**（如有）:
| 命令 | 错误 | 已记录到 command-failures.md |
|------|------|------|
| {failed command} | {error} | ✅ |

**高频话题**: {topic1}, {topic2}, {topic3}...

**Top 10 高互动内容**:
| # | 平台 | 标题 | 互动数据 | 话题标签 | 发布时间 |
|---|------|------|---------|---------|---------|
| 1 | ... | ... | 点赞 {N} / 评论 {N} | ... | {date/time} |
| ... | ... | ... | ... | ... | ... |

**新趋势/新话题**: {description}
```

**Step 5: 用户选择深入分析**

Ask: "要深入分析哪几条？"
For each selected: run "分析爆款" flow (Command 4)

### 6. 启动爆款监控

**Trigger:** "启动爆款监控"

**Action (background process):**

持续后台运行，模拟日常浏览习惯——定期读 timeline，积累数据，发现模式。

1. Read `assets/topics/benchmarks/monitor-config.md` (`READ:3L`)
2. Start background process, periodically:
   - **X/Twitter**: `bird home --cookie-source chrome`（每次大量读取，多次执行以积累数据）
     > ⚠️ 必须用 `bird home`，不得用 `bird search`。
   - **小红书**: `python scripts/xhs_client.py search` and `python scripts/xhs_client.py feeds`
   - **微信公众号**: `node scripts/search_wechat.js "{keywords}" -n 20`
   - Fetch configured analysis sites
   - **持续积累数据**到内存/临时文件中，跨多次抓取识别趋势
   - 判断标准参照 `monitor-config.md` 中的分平台阈值

3. **【强制】每轮扫描完成后输出简报**：
   ```
   [监控] 第 {N} 轮扫描完成 | X: {n1}条 小红书: {n2}条 微信: {n3}条 | 新发现高互动: {count}条 | 累计数据: {total}条
   ```

4. **发现潜在爆款时，通知必须包含判断依据**：
   ```
   发现热门趋势：{topic}
   - 依据：{N}条相关内容，平均互动{avg}，最高互动{max}
   - 时间跨度：最早{date1}，最新{date2}
   - 代表内容：{title1}, {title2}
   - 判断逻辑：{说明为什么判定为趋势，如"3个平台同时出现""互动数据是平均值的5倍"等}
   ```
   Auto-create benchmark files for confirmed viral content.

5. "停止爆款监控" to end the process

### 7. 爆款转选题

**Trigger:** "爆款转选题" or triggered after "分析爆款"

**Action:**
1. Read the benchmark file
2. Extract the topic angle from `Extractable Patterns → Topic angle`
3. Generate a developing topic, pre-filled with benchmark context:

```markdown
# Topic: {derived topic name}

**Created:** YYYY-MM-DD
**Target Platform:** {same platform or user-specified}
**Source Benchmark:** benchmarks/{benchmark-file}.md

## Idea
{topic angle derived from the benchmark — NOT copying the original, but the underlying insight/angle}

## Benchmark References
- [{benchmark title}](benchmarks/{file}.md) — {why this benchmark is relevant}

## Differentiation
{how this topic will differ from the benchmark: unique angle, personal experience, different audience, deeper analysis, etc.}

## Outline
{preliminary structure, informed by benchmark's structure analysis}

## Title Candidates
{to be generated via title-generator}

## Notes
{any additional context}
```

4. Save to `assets/topics/developing/{topic-slug}.md` (`WRITE:user`)
5. Inform user: "已从爆款创建选题，保存在 developing/。"

---

## 数据记录

### 8. 记录数据

**Trigger:** "记录数据"

**Action:**

1. **识别文章**:
   - 如果当前会话正在处理某篇文章 → 自动推断
   - 否则 → 列出 `outputs/` 目录下的文章，让用户选择

2. **确定平台**:
   - 检查文章目录中存在的平台文件：
     - `{slug}-final.md` → 源平台（从 progress 文件中读取）
     - `{slug}-wechat.md` → 微信公众号
     - `{slug}-xhs.md` → 小红书
     - `{slug}-x.md` → X/Twitter
     - `{slug}-douyin.md` → 抖音
   - 如果有多个平台文件，问用户要记录哪个平台的数据（可以多选）

3. **按平台收集指标**:

   **微信公众号：**
   - 阅读量
   - 在看数
   - 分享数
   - 留言数

   **小红书：**
   - 点赞数
   - 收藏数
   - 评论数
   - 分享数

   **X/Twitter：**
   - 浏览量 (impressions)
   - 点赞数
   - 转发数 (retweets)
   - 回复数

   **抖音：**
   - 播放量
   - 点赞数
   - 评论数
   - 分享数
   - 完播率 (%)

4. **保存到 `outputs/{slug}/metrics.md`** (`WRITE:project`)，追加式，带时间戳：

```markdown
## {YYYY-MM-DD} — {platform}

| 指标 | 数值 |
|------|------|
| {metric1} | {value1} |
| {metric2} | {value2} |
| ... | ... |

**备注:** {user notes, if any}
```

如果文件已存在，追加新快照（不覆盖历史数据）。

5. **确认并建议**:
   - "已记录 {platform} 数据到 metrics.md。"
   - 如果是首次记录："建议 3-7 天后再记一次，看数据趋势。"
   - 如果已有历史记录：自动对比上次数据，展示变化。

### 9. 看数据

**Trigger:** "看数据"

**Action:**

1. **识别文章**（同 Command 8 逻辑）

2. **读取 `outputs/{slug}/metrics.md`**

3. **展示数据**:
   - 如果只有一个快照 → 直接展示
   - 如果有多个快照 → 展示趋势对比表：

```markdown
## {article title} 数据趋势

### {platform}
| 指标 | {date1} | {date2} | 变化 |
|------|---------|---------|------|
| {metric} | {v1} | {v2} | {+/-}{diff} ({%}) |
```

4. **简要分析**（如果有多个快照）:
   - 哪些指标增长/下降
   - 与同平台其他文章对比（如果有其他文章的 metrics.md）

---

## With Other Skills

- **→ title-generator**: Called during "深化选题" and "爆款转选题" for title candidates
- **→ experience-tracker**: Lessons checked during "深化选题"
- **→ writing-assistant**: `developing/` is the handoff point. Writing-assistant Step 1 checks `developing/` for mature topics.
- **← writing-assistant**: After publishing (Step 10), writing-assistant reminds user to record data via "记录数据"
- **→ content-adapter**: topic-manager manages the content lifecycle; content-adapter handles cross-platform adaptation
