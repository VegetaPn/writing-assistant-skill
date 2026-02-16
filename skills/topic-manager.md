---
name: topic-manager
description: Manage writing topics from idea capture to development, with viral content benchmarking. Use when users say "记录选题", "看选题", "深化选题", "分析爆款", "监控爆款", "启动爆款监控", "看热点", "监控热点", "热点", "有什么热点", or "最近有什么火的".
---

# Topic Manager

选题管理 + 爆款对标系统。负责**决定写什么**——从碎片想法到选题成熟。与写作系统 (writing-assistant) 分离：本系统产出准备好的选题，writing-assistant 从这里接手正式写作。

> **Three-Level Protocol:** 选题管理主要读写 user-level。所有 `assets/` 和 `references/` 读取使用 `READ:3L`（检查 system → user → project 三层并合并）。写入默认为 `WRITE:user`。详见 SKILL.md "Three-Level Reference System"。

## When to Use

**选题管理:**
- "记录选题" — 记录一个想法
- "看选题" / "我的选题" — 查看选题管线
- "深化选题" — 研究一个选题，分析角度、找爆款参考、生成大纲

**爆款对标:**
- "分析爆款" + URL/内容 — 分析一条爆款内容
- "监控爆款" / "看热点" / "监控热点" / "有什么热点" / "最近有什么火的" — 手动批量扫描当前热门内容
- "启动爆款监控" — 启动后台长期监控进程

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

## Initialize Workspace

Before executing any command, ensure user-level required directories and files exist. Create any that are missing; never overwrite existing files.

```
{project-root}/assets/topics/     # WRITE:user — all topic data lives at user level
├── inbox.md
├── developing/
└── benchmarks/
    ├── benchmarks-index.md
    └── monitor-config.md
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
4. **Dynamic reference building** — auto-enrich reference library (`WRITE:user`):
   - Title pattern → append to `references/by-element/titles/titles-index.md`
   - Opening technique → append to `references/by-element/openings/openings-index.md`
   - Novel structure → append to `references/by-element/structures/structure-templates.md`
   - New author with multiple pieces → create `references/authors/{name}/profile.md`
5. Ask: "要把这条爆款转化为选题吗？" If yes, run "爆款转选题" flow (Command 7).

### 5. 监控爆款

**Trigger:** "监控爆款" / "看热点" / "监控热点" / "有什么热点" / "最近有什么火的"

**Action (manual batch scan):**

像一个人刷 timeline 一样——需要大量阅读才能感知到什么在流行。不是看 10 条就够的，而是持续积累。

**Step 1: 读取监控配置**

Read `assets/topics/benchmarks/monitor-config.md` (`READ:3L`)，获取筛选阈值和关键词配置。

**Step 2: 多平台扫描**

1. **X/Twitter**: `bird home --cookie-source chrome` — 至少 20 条，可多次执行以获取更多内容
   > ⚠️ 必须用 `bird home`，不得用 `bird search`。`bird search` 是关键词搜索，会错过自然趋势。
2. **小红书**: `python scripts/xhs_client.py search "{relevant keywords}"` + `python scripts/xhs_client.py feeds`
3. **微信公众号**: `node scripts/search_wechat.js "{relevant keywords}" -n 20`
4. Optionally `WebFetch` analysis sites from `monitor-config.md`

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
**扫描范围**:
| 平台 | 执行命令 | 抓取条数 | 筛选条件 |
|------|---------|---------|---------|
| X/Twitter | `bird home --cookie-source chrome` | {N} 条 | 原始 timeline |
| 小红书 | `xhs search "{keywords}"` | {N} 条 | 关键词: {keywords} |
| 微信公众号 | `search_wechat "{keywords}" -n 20` | {N} 条 | 关键词: {keywords} |

**高频话题**: {topic1}, {topic2}, {topic3}...

**Top 10 高互动内容**:
| # | 平台 | 标题 | 互动数据 | 话题标签 |
|---|------|------|---------|---------|
| 1 | ... | ... | 点赞 {N} / 评论 {N} | ... |
| ... | ... | ... | ... | ... |

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

## With Other Skills

- **→ title-generator**: Called during "深化选题" and "爆款转选题" for title candidates
- **→ experience-tracker**: Lessons checked during "深化选题"
- **→ writing-assistant**: `developing/` is the handoff point. Writing-assistant Step 1 checks `developing/` for mature topics.
- **← writing-assistant**: After writing is complete, publishing data may flow back (future: data & retrospective system)
