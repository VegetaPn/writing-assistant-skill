---
name: topic-manager
description: Manage writing topics from idea capture to development, with viral content benchmarking. Use when users say "记录选题", "看选题", "深化选题", "分析爆款", "监控爆款", or "启动爆款监控".
---

# Topic Manager

选题管理 + 爆款对标系统。负责**决定写什么**——从碎片想法到选题成熟。与写作系统 (writing-assistant) 分离：本系统产出准备好的选题，writing-assistant 从这里接手正式写作。

## When to Use

**选题管理:**
- "记录选题" — 记录一个想法
- "看选题" / "我的选题" — 查看选题管线
- "深化选题" — 研究一个选题，分析角度、找爆款参考、生成大纲

**爆款对标:**
- "分析爆款" + URL/内容 — 分析一条爆款内容
- "监控爆款" — 手动批量扫描当前热门内容
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

## Initialize Workspace

Before executing any command, ensure required directories and files exist. Create any that are missing; never overwrite existing files.

```
assets/topics/
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
1. Append to `assets/topics/inbox.md` under today's date:
   ```markdown
   ## YYYY-MM-DD
   - {idea text}
   ```
2. If today's date section already exists, append to it.
3. Confirm: "已记录到选题收集箱。"

### 2. 看选题

**Trigger:** "看选题" / "我的选题" / "选题库"

**Action:**
1. Read `assets/topics/inbox.md` — show recent ideas (last 10)
2. List files in `assets/topics/developing/` — show mature topics ready to write
3. Summary: "收集箱 N 条 | 已深化 N 个"

### 3. 深化选题

**Trigger:** "深化选题" or "深化选题：{topic name}"

**Action:**
1. If no topic specified, show inbox and ask user to pick
2. Research phase:
   - Search `assets/topics/benchmarks/` for related viral content
   - Search `references/` for relevant author styles and techniques
   - Check `assets/experiences/lessons.md` for relevant experience
3. Generate a preliminary outline:
   - Suggested angles (informed by benchmarks)
   - Key points to cover
   - Target audience
   - Recommended structure (from `references/by-element/structures/`)
4. Optionally invoke `skills/title-generator.md` for title candidates
5. Save to `assets/topics/developing/{topic-slug}.md`:

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
   - X/Twitter URL → `bird read <url>` or `bird thread <url>`
   - Other URL → `WebFetch`
   - Pasted content → use directly
2. Create `assets/topics/benchmarks/{platform}-{slug}.md`:

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

3. Append to `assets/topics/benchmarks/benchmarks-index.md`
4. **Dynamic reference building** — auto-enrich reference library:
   - Title pattern → append to `references/by-element/titles/titles-index.md`
   - Opening technique → append to `references/by-element/openings/openings-index.md`
   - Novel structure → append to `references/by-element/structures/structure-templates.md`
   - New author with multiple pieces → create `references/authors/{name}/profile.md`
5. Ask: "要把这条爆款转化为选题吗？" If yes, run "爆款转选题" flow (Command 7).

### 5. 监控爆款

**Trigger:** "监控爆款"

**Action (manual batch scan):**

像一个人刷 timeline 一样——需要大量阅读才能感知到什么在流行。不是看 10 条就够的，而是持续积累。

1. Read user's X timeline via `bird` — 大量读取（至少 20 条以上）
2. Optionally `WebFetch` analysis sites from `monitor-config.md`
3. **积累式分析**：不是立即判断哪条是爆款，而是：
   - 将所有内容记录下来（标题、互动数据、主题标签）
   - 识别出现频率高的话题/关键词（大家都在聊什么）
   - 找出互动数据明显高于平均的内容
   - 对比历史 benchmarks，识别新趋势
4. Present findings to user:
   - "最近大家在聊的话题: ..."
   - "互动数据突出的内容: ..." (Top 10)
   - "新趋势/新话题: ..."
5. Ask: "要深入分析哪几条？"
6. For each selected: run "分析爆款" flow (Command 4)

### 6. 启动爆款监控

**Trigger:** "启动爆款监控"

**Action (background process):**

持续后台运行，模拟日常浏览习惯——定期读 timeline，积累数据，发现模式。

1. Read `assets/topics/benchmarks/monitor-config.md`
2. Start background process, periodically:
   - Read user's X timeline via `bird`（每次大量读取）
   - Fetch configured analysis sites
   - **持续积累数据**到内存/临时文件中，跨多次抓取识别趋势
   - 当某个话题/内容的互动数据持续走高，或同一话题被多人讨论时，判定为潜在爆款
   - Auto-create benchmark files for confirmed viral content
3. Notify user when pattern detected: "发现热门趋势：{topic}，已有 N 条相关高互动内容" or "发现新爆款：{title} ({platform}, {metrics})"
4. "停止爆款监控" to end the process

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

4. Save to `assets/topics/developing/{topic-slug}.md`
5. Inform user: "已从爆款创建选题，保存在 developing/。"

---

## With Other Skills

- **→ title-generator**: Called during "深化选题" and "爆款转选题" for title candidates
- **→ experience-tracker**: Lessons checked during "深化选题"
- **→ writing-assistant**: `developing/` is the handoff point. Writing-assistant Step 1 checks `developing/` for mature topics.
- **← writing-assistant**: After writing is complete, publishing data may flow back (future: data & retrospective system)
