---
name: writing-assistant
description: Comprehensive writing workflow from ideation to publication. Guides users through creating polished articles by collecting ideas, asking clarifying questions, researching content, polishing drafts, adding images, and publishing to platforms like WeChat or X. Use when users want to write articles, blog posts, or long-form content, especially when starting from a topic idea, rough materials, or initial draft. Also use when users mention writing, publishing, or content creation workflows.
---

# Writing Assistant

A complete end-to-end writing workflow that transforms ideas, materials, or rough drafts into polished, illustrated articles ready for publication.

## Overview

This skill orchestrates a multi-step writing process:
0. **Create progress tracker** — initialize per-session tracking file
1. **Choose starting mode + select platform** — load from topic pipeline or start fresh; determine target platform upfront
2. **Search references, benchmarks, and techniques** — find styles, patterns, viral cases, and writing methodologies
3. **Collect and clarify** — interactive questioning (Modes 1 & 2), apply selected techniques
4. **Element-level reference** — title (via title-generator), opening, structure, with technique cross-reference
5. **Process draft** — Mode 3 only, apply techniques throughout body
6. **Polish** — using content-research-writer, with technique-aware instructions
7. **Generate illustrations** — using baoyu-xhs-images
8. **Create final article** — combine content + images
9. **Review and platform adaptation** — review, optional multi-platform adaptation with technique re-application
10. **Publish** — optional, to WeChat or X

**Note:** This skill focuses on **writing**. For topic management (recording ideas, analyzing viral content, monitoring trends), use `skills/topic-manager.md`. For standalone title generation, use `skills/title-generator.md`.

## Execution Principles (MUST NOT skip)

1. **Progress file first**: After entering the writing workflow, the very first action must be creating the progress file (Step 0). No other steps may execute before the progress file is created. The progress file is the "roadmap" for this session — all subsequent operations strictly follow the step order in the progress file.
2. **Initialize only once**: Dependency checks, API key validation, and environment pre-checks are performed only once in Step 0, never repeated. Subsequent steps skip initialization when they see the `Initialization: ✅ completed` marker in the progress file.
3. **Output directory convention**: All output files are stored under `outputs/{topic-slug}/`.

## Three-Level Reference System

Assets and references follow a three-level hierarchy (system / user / project). Content merges on read; lower levels override higher on conflict.

**Full protocol:** Read `references/three-level-protocol.md` for level definitions, READ:3L merge rules, WRITE:user/project targets, and quick reference table.

**Shorthands used in this file:** `READ:3L` = read all three levels and merge. `WRITE:user` / `WRITE:project` = target a specific write level.

## Companion Skills (project-local, no installation needed)

These skills live in the `skills/` directory and can be invoked directly:
- `skills/title-generator.md` — Platform-optimized title generation (called in Step 4, or independently)
- `skills/topic-manager.md` — Topic lifecycle management + viral benchmarking
- `skills/experience-tracker.md` — Records user corrections, distills lessons learned

## Experience Check System

**Two mechanisms work together to ensure corrections are captured:**

### Mechanism 1: Pre-step lesson check
**Before every step**, check `assets/experiences/lessons.md` (`READ:3L`) if it exists. Apply any relevant lessons to avoid repeating past mistakes.

### Mechanism 2: Post-interaction correction checkpoint
**After every step that involves user interaction** (Steps 1, 3, 4, 5, 8, 9), perform this checkpoint:

> **Experience Checkpoint:**
> Review the user's response in this step. Did the user:
> - Directly negate your output? ("不是这样", "不对", "错了")
> - Point out style issues? ("太 AI 了", "爹味", "太正式了", "不自然")
> - Provide a corrected version? ("应该是...", "改成...", "我要的是...")
> - Express dissatisfaction? ("别这样写", "这不是我想要的")
> - Rewrite your output instead of accepting it?
>
> **If ANY of the above occurred:**
> 1. **Immediately** create a case file in `assets/experiences/cases/` (`WRITE:user`) (format: `{YYYY-MM-DD}-{slug}.md`, see `skills/experience-tracker.md`)
> 2. Log the correction in the progress tracker's Corrections Log with `Case Recorded? = Yes` and fill in the Case File path
> 3. Ask user: "这条经验是通用的还是仅针对本文？"
>    - 通用 → update `assets/experiences/lessons.md` (`WRITE:user`)
>    - 仅本文 → update `outputs/{topic-slug}/assets/experiences/lessons.md` (`WRITE:project`)
> 4. Confirm to user: "已记录这条经验。"
> 5. Then proceed to the next step
>
> **NEVER** leave a correction as "Pending" in the Corrections Log without creating a case file. Every correction must be closed out on the spot.
>
> **If none occurred:** Note "No corrections" in the progress tracker and proceed.

This checkpoint is marked as **"Experience Check"** in every applicable step below. Do NOT skip it.

## Workflow

### Initial Setup: Initialize Workspace

Before starting the workflow, check the user's working directory and ensure the **user-level** directory structure exists. The system-level directories ship with the skill and are always available.

**User-level directory structure (create if absent):**
```
{project-root}/
├── assets/
│   ├── topics/
│   │   ├── inbox.md
│   │   ├── developing/
│   │   └── benchmarks/
│   │       ├── benchmarks-index.md
│   │       └── monitor-config.md
│   └── experiences/
│       ├── cases/
│       └── lessons.md
└── references/              # (optional — user-level references grow over time)
```

**Process:**
1. Verify system-level assets exist (in skill directory)
2. Check if user-level directories and files exist in `{project-root}`
3. Create any missing user-level directories and template files silently
4. Do NOT overwrite existing files — only create if absent
5. Proceed to dependency check

### Initial Setup: Check Dependencies

Run the environment check script:

```bash
bash scripts/check-env.sh
```

The script checks: OPENROUTER_API_KEY in `.env`, `bird` CLI availability, `config/bird.json5` propagation, installed skills in `.claude/skills/`, and baoyu-post-to-wechat npm dependencies.

**Handle results:**
- All checks pass → proceed to Step 0
- Required dependencies missing → install from bundled `dependencies/` directory:
  ```bash
  mkdir -p .claude/skills && cp -r dependencies/<skill-name> .claude/skills/
  ```
- User declines required dependencies → explain workflow cannot proceed, offer to pause

**Required dependencies:** content-research-writer, baoyu-xhs-images, xiaohongshu-mcp, wechat-article-search, generate-image, baoyu-post-to-wechat, baoyu-post-to-x (or x-article-publisher).

### Step 0: Create Progress Tracker

Before starting the writing workflow, create a session progress tracker file. This file serves as the "checklist brain" for the entire session, ensuring no step or sub-step is skipped.

**Process:**
1. Determine a topic slug (use a short English slug for the filename, e.g., "attention-economy", "ai-writing-tips")
2. Create the output directory: `outputs/{topic-slug}/`
3. Read `assets/progress-template.md` (`READ:3L`) and instantiate it — replace all `{topic-slug}` with the actual slug
4. Save as `outputs/{topic-slug}/{topic-slug}-progress.md`
5. **Environment pre-check (only in Step 0, once):** Run `bash scripts/check-env.sh` if not yet run in Initial Setup. Record results in the progress file's Session Metadata (Environment fields). If anything is missing, fix on the spot or prompt user — do not leave for later steps.
6. Proceed to Step 1

**Usage rules for the progress tracker:**
- **Before each step:** Read the progress tracker to see current status and what this step requires
- **After each step:** Update the checklist, marking items as `[x]` and adding notes
- **On correction:** Immediately add a row to the Corrections Log
- **At session end:** Review the tracker for any missed items

### Step 1: Choose Starting Mode + Select Platform

> **Start:** Read progress tracker. Update Step 1 status to in-progress.

**1a. Determine Target Platform:**

Before anything else, ask the user which platform they are writing for:
- 小红书 (Xiaohongshu)
- 微信公众号 (WeChat Official Account)
- 抖音 (Douyin)
- X/Twitter
- Other / Not sure yet

Record the platform in the progress tracker metadata. The platform choice influences:
- Title constraints and style (Step 4 via title-generator)
- Content length and structure (Steps 3-6)
- Tone and voice (Steps 3-6)
- Image style and quantity (Step 7)
- Publishing options (Step 10)

If user is unsure, default to the most common platform they use, or proceed without a platform constraint and determine it later. But always try to establish platform early.

**1b. Check for Developed Topics:**

- Look in `assets/topics/developing/` (`READ:user`) for existing topic files
- If topics exist, present them: "You have N developed topics. Would you like to continue with one?"
- If user picks a topic, load its file (outline, benchmark references, title candidates) and proceed to Step 2 with this context

**1c. Choose Starting Mode:**

If no developed topics, or user wants to start fresh, ask for one of three modes:

**Mode 1: Topic-Based**
- User provides a topic or theme they want to write about
- Most suitable when starting from scratch with just an idea

**Mode 2: Materials-Based**
- User provides loosely organized materials, notes, or reference content
- Can include rough notes, copied references, or miscellaneous content
- Ask for file paths if materials are in files

**Mode 3: Draft-Based**
- User provides an unpolished initial draft
- Suitable when the user has already written a rough version
- Ask for file path if draft is in a file

**1d. Update Progress Tracker:**

Update the progress tracker metadata (Platform, Mode, Topic) and mark Step 1 checklist items.

> **Experience Check:** Review user's responses. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 2.

### Step 2: Search Reference Library, Benchmarks, and Techniques

> **Start:** Read progress tracker. Update Step 2 status to in-progress.

After understanding the user's topic/theme and target platform, search all reference sources. **Full search workflow:** Read `references/search-workflow.md` for detailed process.

**Mandatory actions (do NOT skip):**

1. **Search references** (`READ:3L`): Check `references/authors/`, `references/by-element/`, `references/techniques/` for style matches, element patterns, and writing methodologies
2. **Search benchmarks** (`READ:3L`): Check `assets/topics/benchmarks/` for viral cases
3. **Select and record techniques** in progress tracker under "Applied References & Techniques"
4. **【必做】Search target platform for popular content** on the same topic using platform tools:
   - 小红书: `python scripts/xhs_client.py search "{keywords}"` (xiaohongshu-mcp)
   - 微信公众号: `node scripts/search_wechat.js "{keywords}" -n 15` (wechat-article-search)
   - 抖音: WebSearch
   - X/Twitter: `bird search "{keywords}" --cookie-source chrome`
5. **【强制】Record search results** in progress file Session Notes (platform, command, keywords, result count, top 3-5 high-engagement items, extracted patterns). See `references/search-workflow.md` for required format.
6. **Present reference summary** to user: author style, element patterns, techniques, benchmarks

> **End:** Update progress tracker with all findings. Proceed to Step 3.

### Step 3: Collect and Clarify (Modes 1 & 2 Only)

> **Start:** Read progress tracker. Check which techniques were selected in Step 2. Update Step 3 status to in-progress.

For Modes 1 and 2, use an interactive questioning approach:

1. **Analyze the provided content first**:
   - Read and understand what the user has already provided
   - Identify what's clear vs. what needs clarification
   - Note gaps, ambiguities, or areas that need expansion

2. **Ask tailored, content-specific questions**:
   - Formulate questions based on the specific topic and materials provided
   - Focus on filling identified gaps and resolving ambiguities
   - Ask about aspects that are unclear or need deeper exploration
   - Adapt questions to the user's context and writing goals

3. **Collect user responses** systematically

4. **Supplement with research** if context is insufficient:
   - Use WebSearch for relevant information
   - Use WebFetch if user provides URLs
   - Gather supporting materials from the internet

5. **Apply selected techniques to content organization**:
   - Review the techniques selected in Step 2 (recorded in progress tracker)
   - Apply them to how you organize and frame the content:
     - **If Content Funnel was selected**: Determine the TOFU/MOFU/BOFU positioning. For TOFU content: ensure the draft uses plain language, triggers emotion (curiosity/anxiety/empathy), and relates to the reader personally. Run the Practice Guide checklist from `references/techniques/psychology/psychology-index.md` against your draft outline.
     - **For each selected technique**: Review its Practice Guide and apply its principles to the content structure, framing, and language choices.
   - This is NOT just about elements (title, opening) — techniques should influence the entire article body: paragraph structure, argument flow, examples chosen, language register, and emotional arc.

6. **Organize into initial draft** based on:
   - User's answers to questions
   - Researched supplementary materials
   - Logical article structure
   - **Selected technique principles** (e.g., if TOFU: simple, emotional, relatable)
   - **Platform constraints** (e.g., 小红书: ≤1000 words, casual tone)

7. **Proceed to Step 4** for element-level refinement

> **Experience Check:** Review user's responses during questioning. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 4.

**Question Strategy:**
- Ask 2-4 questions at a time (avoid overwhelming the user)
- Tailor each question to the specific content provided - no fixed templates
- Let the content guide the questions - if something is already clear, don't ask about it

### Step 4: Element-Level Reference (Title, Opening, Structure)

> **Start:** Read progress tracker. Review selected techniques and target platform. Update Step 4 status to in-progress.

Before finalizing the initial draft, use the reference library AND selected writing techniques to refine key writing elements.

**This step applies to all modes** (Topic-Based, Materials-Based, and Draft-Based).

**Process:**

1. **Title Refinement**:
   - Read and invoke `skills/title-generator.md` for platform-optimized title generation
   - Pass the target platform (determined in Step 1) to the title-generator
   - The title-generator will search references, apply platform rules, and generate 5 candidates
   - **Technique cross-reference**: If Content Funnel technique was selected and article is TOFU, verify titles follow TOFU principles: broad appeal, emotional trigger, no jargon, relatable to wide audience
   - Let user choose or customize

2. **Opening Paragraph Refinement**:
   - Read `references/by-element/openings/openings-index.md` (`READ:3L`) if available
   - Suggest an opening approach based on reference techniques
   - **Technique cross-reference**: Apply selected techniques to opening choice:
     - Content Funnel TOFU: opening should trigger universal emotions (anxiety, curiosity, empathy), be instantly understandable, and relate to the reader
     - Content Funnel MOFU: opening can assume some context, focus on credibility and depth
   - Common techniques to reference:
     - Anxiety resonance → contrarian pivot → cascade questions
     - Bold claim → self-correction → answer reveal
   - Draft 1-2 opening paragraph options for user to choose

3. **Structure Planning**:
   - Read `references/by-element/structures/structure-templates.md` (`READ:3L`) if available
   - Propose an article structure based on successful patterns
   - **Technique cross-reference**: Align structure with selected techniques:
     - Content Funnel: structure should match the funnel stage — TOFU favors shorter, punchier structures; MOFU favors deeper, more layered structures
     - Review the "Application Scenarios" table in the technique documentation for content type guidance
   - Adjust based on user's content, preferences, and **target platform** constraints

4. **Hook Integration**:
   - Read `references/by-element/hooks/hook-examples.md` (`READ:3L`) if available
   - Note effective hook techniques to use within the article
   - Plan where to place engaging hooks in the draft
   - **Technique cross-reference**: Ensure hooks align with the article's funnel stage and platform expectations

> **Experience Check:** Review user's choices and feedback on proposed elements. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 5 or Step 6 with the refined elements.

### Step 5: Process Draft (Mode 3 Only)

> **Start:** Read progress tracker. Review selected techniques. Update Step 5 status to in-progress.

For Mode 3 (Draft-Based):

1. **Analyze the user's draft**:
   - Read and understand the existing content
   - Identify the main theme and structure
   - Note areas that could be improved

2. **Apply Step 4 (Element-Level Reference)**:
   - Even with an existing draft, offer to refine title, opening, and structure
   - Suggest improvements based on reference library patterns
   - Let user decide what to keep vs. what to change

3. **Apply selected techniques throughout the article body**:
   - Do NOT limit technique application to just title and opening
   - Review the entire draft body against selected technique principles:
     - **Language register**: Does the body language match the technique's guidance? (e.g., TOFU = plain language, no jargon)
     - **Emotional arc**: Does the body maintain emotional engagement throughout? (e.g., hooks at section transitions, relatable examples)
     - **Reader relatability**: Can the target audience see themselves in the content? (e.g., "和我有关" principle from Content Funnel)
     - **Paragraph-level application**: Each paragraph should be checked against technique checklists, not just the overall structure
   - Suggest specific paragraph-level improvements based on techniques

> **Experience Check:** Review user's decisions on what to keep/change. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 6 with the (optionally refined) draft.

### Steps 6-10: Polish to Publish

**Full details:** Read `references/steps-polish-to-publish.md` for complete instructions.

**Step 6: Polish** — **【强制】使用 Skill 工具调用 content-research-writer**，不得手动润色代替。Compile technique-aware instructions (platform, techniques, checklist, style, lessons) before invoking. Output: `{topic-slug}-polished.md`. Experience Check after.

**Step 7: Illustrations** — **【强制】使用 Skill 工具调用 baoyu-xhs-images**，传入 polished.md。禁止手动编写 outline/prompt。Output: images in `xhs-images/`. Experience Check after.

**Step 8: Final Article** — Combine polished content + images. Create `{topic-slug}-final.md`. **呈现最终文章（不可省略）：** 告知用户文件路径 + 图片位置 + **等待用户确认**。Experience Check after. **⚠️ STOP: 不得直接跳到 Step 10，必须先执行 Step 9。**

**Step 9: Review & Adaptation** ← **不可跳过** — 即使用户已表达发布意图，仍需执行。
- 9a. Review: verbal summary + ask for revisions
- 9b. Platform Adaptation (optional): search new platform + re-apply techniques + re-generate title + save as `{topic-slug}-{platform}.md`
- 9c. Publishing Decision: ask user
- Experience Check after.

**Step 10: Publish (Optional)** — Invoke platform-specific publishing skill (xiaohongshu-mcp / baoyu-post-to-wechat / baoyu-post-to-x). Then proceed to **流程自检**.

### 流程完成自检（不可跳过）

> 在标记会话完成之前，必须执行以下自检：
> 1. 读取进度文件，逐步检查所有 checkbox
> 2. 标记遗漏（补标或记录原因 + 询问用户）
> 3. 检查 Corrections Log（无 Pending）
> 4. 检查 Step 9（已执行）
> 5. 向用户报告自检结果
> 6. 更新进度文件的"流程自检"区域

## Best Practices

See `references/steps-polish-to-publish.md` "Best Practices" section for 11 guidelines covering user voice, reference usage, technique application, progress tracking, and write-level selection.

## Output Directory Convention

All output files are stored under `outputs/{topic-slug}/`:

```
outputs/{topic-slug}/
├── {topic-slug}-progress.md      # Progress tracker
├── {topic-slug}.md               # Initial draft
├── {topic-slug}-polished.md      # Polished draft
├── {topic-slug}-final.md         # Final version
├── {topic-slug}-{platform}.md    # Platform adaptation
└── xhs-images/                   # Illustrations
    ├── outline.md
    ├── prompts/
    └── *.png
```

Use consistent naming throughout the workflow. All files use the topic slug as prefix and reside in the same output directory.
