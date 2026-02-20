# Step 2: Search Workflow — Detailed Process

> This document contains the full search workflow for SKILL.md Step 2.
> The main SKILL.md contains a summary with mandatory actions; refer here for detailed instructions.

## Reference Library Structure (three-level — `READ:3L`)

All paths below are searched across system, user, and project levels.

```
references/                         # Exists at each level:
├── authors/                        #   {skill-dir}/references/  (system)
│   └── {author-name}/              #   {project-root}/references/  (user)
│       ├── profile.md              #   outputs/{slug}/references/  (project)
│       └── articles/
│
├── by-element/
│   ├── titles/
│   ├── openings/
│   ├── structures/
│   └── hooks/
│
└── techniques/
    └── psychology/
        ├── psychology-index.md
        └── content-funnel.md
```

## Search Process

### 1. Check Reference Library Existence

- System-level references (in skill directory) always exist
- Check user-level and project-level for additional content
- If only system-level exists, proceed with system defaults

### 2. Search Author Styles (`READ:3L`)

- Read available `references/authors/*/profile.md` files across all levels
- Present a brief summary of available writing styles
- Ask: "Would you like to reference a specific author's style for this article?"

### 3. Search Writing Element Patterns (`READ:3L`)

- Check `references/by-element/` across all levels for relevant patterns
- Note relevant title patterns, opening techniques, structure templates, and hooks
- These will be used in Step 4

### 4. Search Writing Techniques and Methodologies (`READ:3L`)

- Read `references/techniques/psychology/psychology-index.md` across all levels
- For each technique listed, evaluate relevance to the current topic and platform:
  - **Content Marketing Funnel (内容营销漏斗)**: Relevant for all content creation. Determine which funnel stage this article targets (TOFU/MOFU/BOFU) based on the topic and platform. For example:
    - 小红书 content is typically TOFU (broad audience, easy to understand, emotional)
    - 微信公众号 long-form can be MOFU (in-depth, trust-building)
    - The technique's Practice Guide checklist should be applied during writing
  - Additional techniques as they are added to the library
- **Record selected techniques** in the progress tracker under "Applied References & Techniques"
- Present to user: "Based on your topic and platform, I recommend applying these writing techniques: [list]. Here's why: [brief explanation]."

### 5. Search Viral Benchmarks (`READ:3L`)

If `assets/topics/benchmarks/` exists at any level:
- Check for benchmark analyses on similar topics
- If found, present: "I found N benchmark analyses on related topics that might inform our approach."
- Note relevant title patterns, hooks, and structures from benchmarks
- Record key benchmarks in the progress tracker

### 6. 【必做】Search Target Platform for Popular Content

This step MUST NOT be skipped. Even if the local reference library is rich, you must search the target platform for current popular content.

**Process:**

a. Search by platform using corresponding tools:
  - **小红书**: Invoke xiaohongshu skill — MCP tool `search_feeds` with keyword: "{topic keywords}". Returns notes with feed_id and xsec_token. Use MCP tool `get_feed_detail` with feed_id and xsec_token to get full content and comments for promising results.
  - **微信公众号**: Use `wechat-article-search` skill — `node scripts/search_wechat.js "{topic keywords}" -n 15`. Returns titles, summaries, publish time, source accounts, and links. Use `-r` flag for real URLs.
  - **抖音**: `WebSearch` with queries like "抖音 {topic keywords} 热门"
  - **X/Twitter**: `bird search "{topic keywords}" --cookie-source chrome` (here `bird search` IS correct — searching by topic, not reading timeline)

b. Select 3-5 high-engagement results

c. For each, briefly analyze: title type, opening technique, structure patterns, engagement reasons

d. Ask user if they want deep analysis on any (invoke topic-manager's "分析爆款")

e. **【必做】积累爆款模式到参考库** — 从搜索结果中提取有价值的模式，追加到 `references/by-element/` (`WRITE:user`)。这是参考库动态增长的核心机制，不可跳过。

   **积累标准**：高互动内容（Top 3-5）中，标题/开头/结构有明确可复用模式的，必须积累。

   **积累格式**（追加到对应文件末尾，与现有条目格式一致）：

   - **标题** → `references/by-element/titles/titles-index.md`：
     ```markdown
     ## Title #N
     **Original Title:** {原标题}
     **Source:** {作者} - *{文章标题}* ({平台}, {日期})
     **Analysis（分析）：** {为什么这个标题有效，1-3 个要点}
     **Pattern（模式）：** `{可复用的标题模板公式}`
     ```

   - **开头** → `references/by-element/openings/openings-index.md`：
     ```markdown
     ## Opening #N
     **Source:** {作者} - *{文章标题}* ({平台}, {日期})
     ### Original Text
     > {开头前 2-3 段}
     ### Analysis（分析）
     **使用的技巧：** {技巧名称 + 简要分析}
     **为什么有效：** {核心逻辑}
     ```

   - **结构** → `references/by-element/structures/structure-templates.md`：追加新的结构模板
   - **钩子** → `references/by-element/hooks/hook-examples.md`：追加新的钩子案例

   > **注意**：不是每条搜索结果都要积累，只积累有明确可复用模式的。一次搜索积累 1-3 条即可。如果搜索结果质量都不高，记录"本次搜索未发现新的可积累模式"即可。

**f.【强制】将搜索结果写入进度文件 Session Notes，格式如下：**

```markdown
### Step 2 平台搜索记录
**平台**: {platform}
**搜索命令**: `{actual command executed}`
**搜索关键词**: {keywords used}
**返回结果数**: {N} 条
**筛选后高互动内容**: {N} 条

**Top 3-5 高互动内容**:
| # | 标题 | 作者 | 互动数据 | 有参考价值的点 |
|---|------|------|---------|-------------|
| 1 | ... | ... | ... | 标题用了对比句式 |
| 2 | ... | ... | ... | 开头用数据冲击 |

**提取的模式/发现**:
- {pattern 1}
- {pattern 2}
```

> 如果搜索结果为空或无高互动内容，也必须记录："搜索 {platform} 关键词 '{keywords}'，返回 {N} 条，无明显高互动内容。"

> **Why this step matters**: The local reference library may be sparse. Searching the target platform for what's currently working on the same topic provides real, proven patterns to learn from — not generic writing advice, but specific examples of what resonates with the actual audience on that platform.

### 7. Present Reference Summary

- Summarize what was found: author style, element patterns, techniques, benchmarks
- If user wants to reference a style, note the chosen author's profile for use in later steps
- The style guidance and selected techniques will influence all subsequent steps:
  - Title suggestions (Step 4)
  - Opening paragraph style (Step 4)
  - Overall article structure (Step 4)
  - Content organization and body writing (Steps 3/5)
  - Tone and voice during polishing (Step 6)
  - Platform adaptation (Step 9)
