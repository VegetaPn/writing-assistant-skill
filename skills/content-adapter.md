---
name: content-adapter
description: Multi-platform content adaptation with per-platform specs. Use when users say "适配到", "改成XX版", "发到XX", "多平台", "一鱼多吃", "平台适配", "适配", or "改成XX风格".
---

# Content Adapter

为目标平台重新组织内容——不是简单删减，而是基于每个平台的内容规范、受众习惯和互动逻辑，重新构建最适合该平台的版本。

> **Three-Level Protocol:** 本技能遵循三层内容层级。所有 `assets/` 和 `references/` 读取使用 `READ:3L`（检查 system → user → project 三层并合并）。写入根据调用上下文决定层级。详见 `references/three-level-protocol.md`。

## When to Use

**独立调用:**
- "适配到小红书" / "改成小红书版" — 将已有内容适配到指定平台
- "一鱼多吃" / "多平台" / "平台适配" — 将内容适配到多个平台
- "发到抖音" — 适配并准备发布

**被其他技能调用:**
- writing-assistant Step 9b 调用：平台适配环节

## Workflow

### Step 0: Check Experience Library

Read `assets/experiences/lessons.md` (`READ:3L`) if it exists. Note any platform-adaptation-related lessons and apply them throughout this workflow.

### Step 1: Determine Source and Target

1. **Identify source content:**
   - File path → read the file
   - Inline content → use directly
   - From Step 9b → use the final article from the writing workflow

2. **Identify source platform** (if applicable): Which platform was the content originally written for?

3. **Identify target platform(s):** 微信公众号 / 小红书 / X/Twitter / 抖音
   - If source platform = target platform → remind user: "源内容已是 {platform} 格式，确定要重新适配吗？"
   - Multiple targets → process one at a time, but share the core information extraction (Step 2) across all targets

4. **Record:** Source path, source platform, target platform(s)

### Step 2: Extract Core Information (Platform-Agnostic)

From the source content, extract:

- **Core thesis** — one sentence: what is the main argument/insight?
- **Key supporting points** — 3-5 points that support the thesis
- **Data and examples** — specific numbers, case studies, anecdotes
- **Emotional hooks** — what emotions does this content trigger? (curiosity, anxiety, empathy, surprise, aspiration)
- **Target audience** — who is this for? What do they care about?
- **Unique value** — what makes this content worth reading vs. everything else on the topic?

This extraction is shared across all target platforms. Do NOT skip it — it prevents the adaptation from becoming a surface-level reformatting.

### Step 3: Search Target Platform for Popular Content

Reuse the search logic from `references/search-workflow.md` (Step 2, point 6):

- **小红书**: Invoke xiaohongshu skill (MCP tool: `search_feeds`, keyword: "{topic keywords}")
- **微信公众号**: `node scripts/search_wechat.js "{topic keywords}" -n 15` (wechat-article-search)
- **抖音**: `WebSearch` with queries like "抖音 {topic keywords} 热门"
- **X/Twitter**: `bird search "{topic keywords}" --cookie-source chrome`

Analyze 2-3 high-engagement results:
- Title patterns on this platform
- Content density and length
- Tone and voice
- Engagement style (what gets comments/shares)

Apply currently effective patterns to the adaptation.

### Step 4: Generate Platform-Optimized Title

**【强制】使用 Read 工具读取 `{skill-dir}/skills/title-generator.md`，严格按照文件中的 Step 0-6 顺序执行。** Pass:
- The core thesis from Step 2
- The key data points and emotional hooks
- The target platform

Let user choose from the generated candidates.

### Step 5: Restructure Content per Platform Spec

Using the core information from Step 2, the platform search insights from Step 3, and the title from Step 4, restructure the content according to the target platform's spec (see Platform Specs below).

**Key principle:** This is a restructuring, not a trim. Each platform version should feel like it was written natively for that platform.

### Step 6: Quality Check

Run the adapted content through these checks:

1. **Anti-AI check**: Does it sound natural? Apply `{skill-dir}/skills/title-generator.md` Anti-AI Rules to the full content (not just title). No banned words/patterns.
2. **Lessons check**: Re-read `assets/experiences/lessons.md` (`READ:3L`). Does the adaptation violate any learned lessons?
3. **Spec compliance**: Does the content meet all items in the target platform's Content Checklist (see Platform Specs)?
4. **Core information preservation**: Compare against Step 2 extraction — are the core thesis and key supporting points preserved? (They should be restructured, not lost.)
5. **Platform tone**: Does it read like native content for this platform? Would a regular user of this platform engage with it?

If any check fails, revise before presenting to user.

### Step 7: Save Output

**File naming:**
- Called from Step 9b: `outputs/{topic-slug}/{topic-slug}-{platform-slug}.md`
- Called independently: same directory as source file, or ask user for preferred location

**Platform slug mapping:**
| Platform | Slug |
|----------|------|
| 微信公众号 | wechat |
| 小红书 | xhs |
| X/Twitter | x |
| 抖音 | douyin |

Present the adapted content to user for review before saving.

---

## Platform Specs

### 微信公众号 (WeChat Official Account)

**Positioning:** Long-form, authoritative, in-depth analysis. Readers expect complete reasoning and polished writing.

**Format:**
- Length: 2000-5000 words
- Paragraphs: medium length, well-structured
- Images: support inline images, diagrams, charts
- Subheadings: use clear section headers to guide reading

**Content Checklist:**
- [ ] Complete argument with supporting evidence
- [ ] Clear thesis stated early (within first 2 paragraphs)
- [ ] Each section adds new information (no filler)
- [ ] Professional but not stiff — conversational authority
- [ ] Data and sources cited where applicable
- [ ] Smooth transitions between sections
- [ ] Strong conclusion that ties back to thesis
- [ ] Subheadings are informative (not generic like "分析" or "总结")
- [ ] Reading time feels justified — every paragraph earns its place
- [ ] Call to action or takeaway at the end

**Structure Template:**
```
[Title — can be longer, up to 30 chars]

[Opening: set up the problem or insight — 2-3 paragraphs]

[Section 1: core argument or first major point]
  - Supporting evidence, data, examples
  - Analysis and implications

[Section 2: second major point or deeper exploration]
  - Case study or extended example
  - Connection to reader's experience

[Section 3: practical implications or counterpoint]
  - What this means for the reader
  - Actionable insights

[Conclusion: tie it together, leave reader with a thought]
```

**What NOT to do:**
- Don't write listicles (that's 小红书 style)
- Don't use excessive emoji or casual internet slang
- Don't start with "大家好" or similar greetings
- Don't pad with generic filler to hit word count
- Don't use clickbait titles that the content can't support

---

### 小红书 (Xiaohongshu / RED)

**Positioning:** Short, punchy, emotionally resonant. Readers scroll fast — you have 2 seconds to hook them. Visual-first platform.

**Format:**
- Length: ≤1000 words (shorter is better, 500-800 ideal)
- Paragraphs: very short (1-3 sentences each)
- Line breaks: generous, create visual breathing room
- Emoji: use naturally, 3-8 per post, integrated into text flow (not decorative headers)

**Content Checklist:**
- [ ] First line is a hook (question, bold claim, relatable pain point)
- [ ] ≤1000 words total
- [ ] Paragraphs are 1-3 sentences max
- [ ] Conversational tone — like talking to a friend
- [ ] At least one specific, relatable example or personal touch
- [ ] Emoji used naturally within sentences (not as bullet points)
- [ ] Ends with engagement prompt (question, "你觉得呢？", or call to save/share)
- [ ] No jargon or academic language — explain everything simply
- [ ] Each paragraph delivers one clear point
- [ ] Tags/hashtags at the end (3-5 relevant ones)

**Structure Template:**
```
[Hook — one punchy sentence or question]

[Pain point or relatable scenario — 1-2 short paragraphs]

[Key insight or solution — the core value]

[Supporting point 1 — with example]

[Supporting point 2 — with example]

[Optional: personal experience or emotional close]

[Engagement prompt: question to audience]

#tag1 #tag2 #tag3
```

**What NOT to do:**
- Don't write long paragraphs (>3 sentences)
- Don't use formal or academic language
- Don't forget the emotional hook — pure information posts underperform
- Don't use emoji as decorative headers (❌ "**标题**" → ✅ integrate into text)
- Don't start with background/context — start with the hook
- Don't exceed 1000 words

---

### X/Twitter

**Positioning:** Concise, opinionated, shareable. Either a single powerful statement or a well-structured thread.

**Decision Rule:** Can the core message be expressed in one compelling sentence?
- **Yes** → Single tweet (≤280 characters)
- **No** → Thread (3-8 tweets)

#### Single Tweet

**Format:**
- Length: ≤280 characters (Chinese characters count as 1 each in X's counting)
- One core idea, no hedging

**Content Checklist (Single Tweet):**
- [ ] ≤280 characters
- [ ] One clear, standalone point
- [ ] Opinionated or provocative — takes a position
- [ ] No filler words or qualifiers
- [ ] Quotable — someone would want to retweet this
- [ ] If data is used, it's specific (not "很多人")

#### Thread

**Format:**
- Length: 3-8 tweets, each ≤280 characters
- First tweet is the hook — must work standalone
- Last tweet is a summary or call to action

**Content Checklist (Thread):**
- [ ] 3-8 tweets total
- [ ] Tweet 1 works as a standalone hook (would get engagement even without the thread)
- [ ] Each tweet delivers one point
- [ ] Each tweet can be understood without reading previous ones (mostly)
- [ ] Numbered (1/N format or use numbering)
- [ ] Last tweet: summary, takeaway, or question
- [ ] No tweet is wasted on setup or disclaimers
- [ ] Thread adds up to a complete argument

**Structure Template (Thread):**
```
Tweet 1 (Hook):
[Bold claim, surprising data point, or provocative question]

Tweet 2-N (Body):
[One point per tweet, with evidence or example]
[Each tweet adds to the argument]

Tweet N+1 (Close):
[Summary/takeaway/question for engagement]
```

**What NOT to do:**
- Don't write tweets that only make sense in context of the thread
- Don't start with "Thread:" or "🧵" (let the content speak)
- Don't use more than 5 tweets for a simple idea
- Don't hedge or add disclaimers
- Don't link to other content in tweet 1 (kills engagement)

---

### 抖音 (Douyin — Oral Script)

**Positioning:** Pure oral delivery script. The viewer is watching a person talk — no images, no B-roll, just words spoken to camera. Every word must sound natural when read aloud.

**Format:**
- Duration: 60-180 seconds (~200-600 words)
- Pure text with delivery marks: `[停顿]` for pauses, **bold** for emphasis
- No image descriptions, no camera instructions, no scene directions
- Short sentences: ≤15 characters per sentence

**Content Checklist:**
- [ ] 200-600 words total
- [ ] First 3 seconds grab attention (NO "大家好", NO self-introduction)
- [ ] Every sentence ≤15 characters
- [ ] Reads naturally when spoken aloud (test by reading it)
- [ ] `[停顿]` marks at key transition points (3-5 per script)
- [ ] **Bold** on 5-8 key words/phrases for vocal emphasis
- [ ] Conversational — like chatting with a friend, not lecturing
- [ ] One core message (not three — just one)
- [ ] Ends with a hook: question, call to action, or cliffhanger
- [ ] No written-language constructs (no "首先/其次/最后", no "综上所述")
- [ ] No jargon — if a concept needs explaining, explain it in one sentence

**Structure Template:**
```
[Hook — 3 seconds, must shock/intrigue/challenge]

[停顿]

[Set up the problem or context — 15-20 seconds]
(Short sentences. One idea per sentence.)

[停顿]

[Core insight — the main point — 30-60 seconds]
(This is the meat. Use **emphasis** on key words.)
(Include one specific example or data point.)

[停顿]

[Reinforce or flip perspective — 15-20 seconds]
(Add depth, counter-argument, or emotional punch.)

[停顿]

[Close — 5-10 seconds]
(Question, call to action, or open loop for next video.)
```

**Delivery Mark Examples:**
```
你知道吗 [停顿]
90%的人，花了三年时间 [停顿]
学的东西，**完全没用**

不是他们不努力
是努力的**方向**，从一开始就错了
```

**What NOT to do:**
- Don't include image/scene/camera descriptions — this is pure oral script
- Don't write sentences longer than 15 characters
- Don't start with greetings ("大家好，我是XXX")
- Don't use written-language connectors ("首先"、"其次"、"综上所述")
- Don't try to cover multiple topics — one video, one message
- Don't lecture — talk to the viewer like a friend
- Don't forget delivery marks — without `[停顿]` and **emphasis**, the script loses its rhythm

---

## With Other Skills

- **← writing-assistant**: Step 9b calls this skill for platform adaptation
- **→ title-generator**: Step 4 invokes title-generator for platform-optimized titles
- **← experience-tracker**: Step 0 and Step 6 check `lessons.md` for relevant lessons
- **← search-workflow**: Step 3 reuses the platform search logic from `references/search-workflow.md`
- **← topic-manager**: topic-manager manages the content lifecycle; content-adapter handles the cross-platform distribution
