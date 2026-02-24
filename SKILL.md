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

**Note:** This skill focuses on **writing**. For topic management (recording ideas, analyzing viral content, monitoring trends), use `{skill-dir}/skills/topic-manager.md`. For standalone title generation, use `{skill-dir}/skills/title-generator.md`.

## Execution Principles (MUST NOT skip)

1. **Progress file first**: After entering the writing workflow, the very first action must be creating the progress file (Step 0). No other steps may execute before the progress file is created. The progress file is the "roadmap" for this session — all subsequent operations strictly follow the step order in the progress file.
2. **Initialize only once**: Dependency checks, API key validation, and environment pre-checks are performed only once in Step 0, never repeated. Subsequent steps skip initialization when they see the `Initialization: ✅ completed` marker in the progress file.
3. **Output directory convention**: All output files are stored under `outputs/{topic-slug}/`.
4. **禁止擅自兜底**: 任何命令或工具调用失败时，必须如实报告给用户，由用户决定是否采用替代方案。不得未经允许自行使用 WebSearch 或其他方式作为降级兜底。
5. **搜索实时性**: 搜索热点/热门内容时，禁止以任何时间段（月/周/季度）为单位搜索。不搜"X月热点总结""本周趋势""近期回顾"等盘点类内容，只搜具体话题关键词获取当下实时内容。
6. **自主模式不中断原则**: 自主模式下，AI 全程自主执行，不在任何步骤等待用户。工具或技能调用失败时，记录失败详情到 Execution Log 和 Autonomous Decision Log，跳过该环节继续后续流程。在最终摘要中汇总所有失败项，供用户事后处理。此原则覆盖 Principle #4（禁止擅自兜底）在自主模式下的行为：自主模式下，失败 → 记录 + 跳过，而非报告等待。**自主模式必须执行到 Completion Gate 全部通过才能停止，见 Autonomous Mode 章节的"Completion Gate"。**

## Three-Level Reference System

Assets and references follow a three-level hierarchy (system / user / project). Content merges on read; lower levels override higher on conflict.

**Full protocol:** Read `references/three-level-protocol.md` for level definitions, READ:3L merge rules, WRITE:user/project targets, and quick reference table.

**Shorthands used in this file:** `READ:3L` = read all three levels and merge. `WRITE:user` / `WRITE:project` = target a specific write level.

## Companion Skills (project-local)

以下 skills 位于 `{skill-dir}/skills/` 目录下（`{skill-dir}` 定义见 `references/three-level-protocol.md`）：

| Skill | 文件路径 | 调用时机 |
|-------|---------|---------|
| title-generator | `{skill-dir}/skills/title-generator.md` | Step 4 (标题生成) / 独立调用 |
| content-adapter | `{skill-dir}/skills/content-adapter.md` | Step 9b (平台适配) / 独立调用 |
| topic-manager | `{skill-dir}/skills/topic-manager.md` | 选题管理（独立调用） |
| experience-tracker | `{skill-dir}/skills/experience-tracker.md` | Experience Check（每步交互后） |
| scheduler | `{skill-dir}/skills/scheduler.md` | 定时任务管理（独立调用） |

### Project-Local Skill 执行协议（MUST）

调用 project-local skill 时，**必须**：

1. **使用 Read 工具读取完整文件**（不得凭记忆替代文件内容）
2. **严格按文件中的 Step 顺序执行**，不得跳过任何步骤
3. **每个 Step 的输出格式必须与文件要求一致**

❌ 禁止：看到 `skills/title-generator.md` 后凭记忆生成标题
✅ 正确：Read 工具读取文件 → 按 Step 0 → Step 1 → ... → Step 6 顺序执行

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
> 1. **Immediately** create a case file in `assets/experiences/cases/` (`WRITE:user`) (format: `{YYYY-MM-DD}-{slug}.md`, see `{skill-dir}/skills/experience-tracker.md`)
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

### Autonomous Mode Behavior

自主模式下：
- Mechanism 1（步前读 lessons.md）：不变，照常执行
- Mechanism 2（步后纠错检测）：跳过。记录 "Autonomous mode — no interaction"

## Autonomous Mode（自主模式）

> **⚠️ 核心约束：自主模式必须执行到 Completion Gate 全部通过才能停止。不得在任何中间步骤停下。详见下方"Completion Gate"章节。**

自主模式下，用户发出指令后即可离开，AI 全程自动完成所有步骤，中间不会卡住。

### 开启方式

用户在初始消息中包含自主模式信号即可开启。例如：
- "自主模式，帮我写一篇关于 X 的小红书文章"
- "全自动写一篇公众号文章，主题是 Y，写完发到公众号"
- "autonomous mode, write about Z for XHS, just produce the final article"

AI 从用户的初始消息中理解以下信息（不强制格式，用自然语言即可）：
- **写什么**：主题/素材/草稿（对应 Mode 1/2/3）
- **发到哪**：目标平台（如未指定，AI 根据内容特征选择最合适的平台）
- **完成条件**：用户想要的最终结果是什么（见下方"完成条件"部分）

如果用户的初始消息信息充足，直接开始执行。
如果关键信息缺失（比如完全没提主题），在 Step 1 一次性追问所有缺失项——
这是自主模式下唯一允许的交互，且仅发生在执行开始前。

### 自主能力边界

自主模式只执行 AI 能完全自主完成的操作。判断标准：**该操作是否需要用户在过程中参与（如登录、扫码、手动确认）？**

- **可自主完成**：写文章、润色、配图、适配平台、通过 API 发布、读写本地文件
- **不可自主完成**：需要用户登录的发布流程、需要扫码授权的操作、需要用户手动确认的外部系统操作

自主模式下默认不执行发布（Step 10），除非该发布方式 AI 可以完全自主完成（如通过 API 提交、可用已有 cookie/token 的 CLI 工具等）。如果用户指令中包含发布要求，AI 评估发布路径是否可自主完成：
- 可以 → 执行并记录
- 不可以 → 跳过发布，在执行摘要中标注"发布需用户手动完成"并给出所需信息（文件路径、平台等）

### 完成条件（Completion Condition）

完成条件完全由用户自然语言定义，AI 负责理解并执行。不限于"写一篇"——支持任意任务组合。

**示例场景：**

| 用户说的 | AI 理解为 |
|---------|----------|
| "帮我写一篇关于 X 的小红书文章" | 单篇，写到最终文章 |
| "写完发到公众号" | 单篇，评估公众号发布是否可自主完成；可以则发布，否则写到最终文章并标注 |
| "写三篇不同角度的小红书文章" | 三篇循环，每篇独立走 Step 0-10，各自独立 progress tracker |
| "把 inbox 里的选题都写了" | 读取 inbox.md，逐个选题执行完整流程 |
| "一直写，把 developing/ 里的选题全部完成" | 循环处理 developing/ 中所有选题 |
| "写一篇小红书，再适配一版公众号" | 单篇 + 适配，写到最终文章 |
| "根据这份素材，写小红书和公众号两个版本" | 单次素材收集，两个平台各走一次 Step 4-10 |
| "每天从 inbox 里挑一个选题写" | AI 理解意图，本次执行一篇（无法跨会话持续） |

**设计原则：**
- 不定义固定格式，AI 从自然语言中理解
- 多篇场景：每篇文章独立走完整流程（独立 progress tracker、独立 outputs 目录）
- 批量场景：逐个执行，前一篇完成后自动开始下一篇
- 如果完成条件不明确，默认为"单篇，写到最终文章，不发布"
- 每篇文章完成后，在该篇的 progress tracker 中生成执行摘要；全部完成后，生成一份总体摘要

### 执行规则

1. **跳过所有用户交互**：所有 "ask user"/"present to user"/"wait for confirmation" 环节，AI 自主决策并记录理由
2. **失败不停**：任何工具/技能/搜索失败 → 记录到 Execution Log（失败原因 + 影响 + 跳过了什么）→ 继续下一步。不报错等待，不静默兜底
3. **卡住检测**：如果某个操作（工具调用、技能调用、搜索等）长时间无响应或反复重试无果，AI 应主动判断为卡住。处理方式：记录卡住情况（哪个操作、等了多久、尝试了什么）→ 尝试替代方案（如有）→ 替代方案也不行则跳过该环节继续后续流程。绝不在一个环节上无限等待。
4. **经验库照用**：步前读 lessons.md 不变，步后纠错检测跳过（无用户交互 = 无纠错）
5. **决策全记录**：每个自主决策记录到 Autonomous Decision Log（选了什么、为什么、还考虑了什么）
6. **灵活理解用户意图**：AI 根据用户的自然语言说明决定执行范围，不依赖固定的完成条件格式
7. **循环执行**：多篇/批量场景下，每篇独立执行完整工作流，前一篇的经验教训自动应用到后续篇章
8. **⚠️ 绝不提前停止（Completion Gate 强制）**：自主模式下，AI 不得在任何步骤中途停止、向用户汇报中间状态然后等待、或在未满足 Completion Gate 的情况下结束会话。每完成一个步骤后，必须立即读取 progress tracker 确认下一步是什么，然后继续执行。唯一允许停止的时刻是 Completion Gate 全部通过。

### ⚠️ Completion Gate（停止条件 — 强制）

**这是自主模式的核心约束。AI 不满足以下全部条件时，绝不允许停止执行。**

每完成一个步骤后，AI 必须对照此清单。如有任何一项未满足，必须继续执行对应步骤。

**单篇场景停止条件：**

| # | 条件 | 验证方式 |
|---|------|---------|
| G1 | `{topic-slug}-final.md` 文件已创建且非空 | 检查文件是否存在于 outputs/{topic-slug}/ |
| G2 | Progress tracker 中 Step 0-9 所有 checkbox 已标记 `[x]` | 读取 progress tracker 逐项核对 |
| G3 | Step 10 已执行或已明确标记为"跳过"（含跳过理由） | 检查 Step 10 Log |
| G4 | Execution Log 每个步骤都有记录（无空白步骤） | 检查 Step 1-10 Log 区域 |
| G5 | Autonomous Decision Log 至少有 3 条记录 | 检查 Autonomous Decision Log 表格 |
| G6 | 流程自检 + 复盘已完成 | 检查"流程自检 + 复盘"区域的 checkbox |
| G7 | 自主模式执行摘要已填写（非 pending） | 检查执行摘要区域 |

**多篇/批量场景额外停止条件：**

| # | 条件 | 验证方式 |
|---|------|---------|
| G8 | 所有计划文章都已完成（各自满足 G1-G7） | 检查每篇的 progress tracker |
| G9 | 总体摘要已生成 | 检查最后输出 |

**Completion Gate 执行协议：**
1. 每个 Step 完成后，读取 progress tracker，确认当前进度，然后立即执行下一个未完成的 Step
2. Step 9 完成后（或 Step 10 完成/跳过后），执行流程自检 + 复盘
3. 复盘完成后，逐项核对 G1-G7（多篇加 G8-G9）
4. **全部通过** → 填写执行摘要 → 向用户呈现最终结果 → 允许停止
5. **任何一项未通过** → 定位缺失项 → 回到对应步骤补完 → 重新核对，直到全部通过
6. **绝不允许**：在 Gate 未通过时向用户说"已完成"或停止执行

### 各步自主决策策略

每个步骤的 "If Autonomous Mode" 块定义了具体策略。总体原则：
- **有参考库内容时**：基于经验库 + 技巧匹配 + 平台规范做选择
- **无参考库内容时**：基于 AI 自身判断 + 平台搜索结果做选择
- **有多个选项时**：选择最契合平台规范和所选技巧的选项
- **失败时**：记录并跳过，在 Execution Log 标注影响
- **卡住时**：判断为卡住 → 记录 → 尝试替代方案 → 替代也不行则跳过并继续

### 最终输出

自主模式执行完毕后，呈现一份结构化的执行摘要：

**单篇场景**：写入该篇 progress tracker 的 "自主模式执行摘要" 部分。

**多篇/批量场景**：每篇各自有 progress tracker 中的执行摘要，另外在最后生成一份总体摘要，包含：
- 完成了几篇，每篇标题和平台
- 每篇的产出文件路径
- 全局跳过/失败项汇总
- 前一篇的经验是否影响了后续篇章的决策

摘要内容：
- 产出文件清单
- 关键决策 Top 3-5（选了什么、为什么）
- 跳过/失败项清单（如有）
- 建议复查点（AI 自评哪些决策最可能需要用户调整）

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

**Required dependencies:** content-research-writer, baoyu-xhs-images, xiaohongshu, wechat-article-search, generate-image, baoyu-post-to-wechat, baoyu-post-to-x (or x-article-publisher).

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
- **After each step:** Update the checklist, marking items as `[x]` and adding notes. **Update the Execution Log** for this step (see below).
- **After each step (Autonomous Mode):** 更新完 progress tracker 后，**立即**确认下一个未完成的 Step 是什么，然后**立即**开始执行。不得停下来等待、汇报中间状态、或询问用户。直到 Completion Gate 全部通过。
- **On correction:** Immediately add a row to the Corrections Log
- **At session end:** Review the tracker for any missed items, then run the retrospective

### Execution Logging (每步必做)

**After completing each step**, update the Execution Log section in the progress tracker. Record:
- **What you did**: key actions and decisions made
- **What you used**: which references, techniques, tools were applied
- **What you skipped**: anything you could have done but didn't, and why
- **Friction**: any obstacles, tool failures, or awkward points in the process

This log is reviewed during the 流程复盘 (retrospective) at session end to identify process issues.

### Step 1: Choose Starting Mode + Select Platform

> **Start:** Read progress tracker. Update Step 1 status to in-progress.

**1a-0. Check for Autonomous Mode:**

检测用户初始消息是否包含自主模式信号（"自主模式"/"全自动"/"autonomous mode"/"自动完成" 等）。

如果检测到：
1. 从用户消息中理解：主题/素材、目标平台、完成条件（写几篇、是否发布、是否适配等）
2. 如果关键信息缺失，一次性追问（这是自主模式唯一允许的交互）
3. 在 progress tracker metadata 记录：`Autonomous Mode: enabled`，并记录解析出的执行范围
4. 多篇/批量场景：确定文章列表（从 inbox/developing/ 读取，或从用户消息解析）
5. 从此步起，所有后续步骤走自主路径，不再有任何用户交互
6. 多篇场景：每篇独立创建 progress tracker，循环执行完整 Step 0-10

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

> **If Autonomous Mode:** 从用户初始消息解析平台；未指定则根据内容特征自动选择最合适的平台（如生活类话题 → 小红书，深度观点 → 公众号），记录选择理由到 Autonomous Decision Log。跳过所有"ask user"环节，直接进入下一步。

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

> **Experience Check:** Review user's responses. Did user provide any corrections? If yes, invoke `{skill-dir}/skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **If Autonomous Mode:** 跳过 Experience Check（无用户交互 = 无纠错）。记录 "Autonomous mode — no interaction"。

> **End:** Update progress tracker. **Update Execution Log** (Step 1 Log: platform, mode, developed topic used or not). Proceed to Step 2.

> **Start:** Read progress tracker. Update Step 2 status to in-progress.

After understanding the user's topic/theme and target platform, search all reference sources. **Full search workflow:** Read `references/search-workflow.md` for detailed process.

**Mandatory actions (do NOT skip):**

1. **Search references** (`READ:3L`): Check `references/authors/`, `references/by-element/`, `references/techniques/` for style matches, element patterns, and writing methodologies
2. **Search benchmarks** (`READ:3L`): Check `assets/topics/benchmarks/` for viral cases
3. **Select and record techniques** in progress tracker under "Applied References & Techniques"
4. **【必做】Search target platform for popular content** on the same topic using platform tools:
   - 小红书: Invoke xiaohongshu skill (MCP tool: `search_feeds`, keyword: "{keywords}") — returns interactInfo; sort by engagement priority (commentCount > likedCount = sharedCount > collectedCount)
   - 抖音: WebSearch
   - X/Twitter: `bird search "{keywords}" --cookie-source chrome`
5. **【强制】Record search results** in progress file Session Notes (platform, command, keywords, result count, top 3-5 high-engagement items, extracted patterns). See `references/search-workflow.md` for required format.
6. **Present reference summary** to user: author style, element patterns, techniques, benchmarks

> **If Autonomous Mode:** 有匹配作者风格则自动选用，无则跳过作者风格参考。搜索失败时记录失败原因到 Execution Log 并继续。不向用户呈现参考摘要，直接进入 Step 3。

> **End:** Update progress tracker with all findings. **Update Execution Log** (Step 2 Log: sources searched, techniques selected, references matched, anything skipped). Proceed to Step 3.

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

> **If Autonomous Mode:** 跳过交互式提问。AI 自行生成澄清问题并自答（基于素材 + 搜索结果 + 选定技巧），将 Q&A 模拟记录到 Execution Log。如需补充研究（WebSearch/WebFetch），正常执行；搜索失败则记录并基于已有素材继续。直接组织初稿并进入 Step 4。

> **Experience Check:** Review user's responses during questioning. Did user provide any corrections? If yes, invoke `{skill-dir}/skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **If Autonomous Mode:** 跳过 Experience Check（无用户交互 = 无纠错）。记录 "Autonomous mode — no interaction"。

> **End:** Update progress tracker. **Update Execution Log** (Step 3 Log: questions asked, research done, technique application). Proceed to Step 4.
- Ask 2-4 questions at a time (avoid overwhelming the user)
- Tailor each question to the specific content provided - no fixed templates
- Let the content guide the questions - if something is already clear, don't ask about it

### Step 4: Element-Level Reference (Title, Opening, Structure)

> **Start:** Read progress tracker. Review selected techniques and target platform. Update Step 4 status to in-progress.

Before finalizing the initial draft, use the reference library AND selected writing techniques to refine key writing elements.

**This step applies to all modes** (Topic-Based, Materials-Based, and Draft-Based).

**Process:**

1. **Title Refinement**:
   - **【强制】使用 Read 工具读取 `{skill-dir}/skills/title-generator.md`，严格按照文件中的 Step 0-6 顺序执行。** 不得跳过任何步骤，不得凭记忆替代文件内容。
   - Pass the target platform (determined in Step 1) to the title-generator
   - The title-generator will search references, apply platform rules, and generate 5 candidates
   - **Technique cross-reference**: If Content Funnel technique was selected and article is TOFU, verify titles follow TOFU principles: broad appeal, emotional trigger, no jargon, relatable to wide audience
   - Let user choose or customize

> **If Autonomous Mode (Title):** 生成 5 个候选标题后，按平台规范 + 技巧匹配度自动选择最佳标题。记录全部候选和选择理由到 Autonomous Decision Log。

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

> **If Autonomous Mode (Opening):** 生成 1-2 个开头选项后，按技巧原则 + 平台风格自动选择。记录选择理由到 Autonomous Decision Log。

3. **Structure Planning**:
   - Read `references/by-element/structures/structure-templates.md` (`READ:3L`) if available
   - Propose an article structure based on successful patterns
   - **Technique cross-reference**: Align structure with selected techniques:
     - Content Funnel: structure should match the funnel stage — TOFU favors shorter, punchier structures; MOFU favors deeper, more layered structures
     - Review the "Application Scenarios" table in the technique documentation for content type guidance
   - Adjust based on user's content, preferences, and **target platform** constraints

> **If Autonomous Mode (Structure):** 基于平台规范 + 所选技巧自动选择最合适的结构模板。记录到 Autonomous Decision Log。

4. **Hook Integration**:
   - Read `references/by-element/hooks/hook-examples.md` (`READ:3L`) if available
   - Note effective hook techniques to use within the article
   - Plan where to place engaging hooks in the draft
   - **Technique cross-reference**: Ensure hooks align with the article's funnel stage and platform expectations

> **Experience Check:** Review user's choices and feedback on proposed elements. Did user provide any corrections? If yes, invoke `{skill-dir}/skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **If Autonomous Mode:** 跳过 Experience Check（无用户交互 = 无纠错）。记录 "Autonomous mode — no interaction"。

> **End:** Update progress tracker. **Update Execution Log** (Step 4 Log: title type chosen, opening technique, structure template, hook placement). Proceed to Step 5 or Step 6 with the refined elements.

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

> **If Autonomous Mode (Step 5):** 保留用户原稿的核心结构和语气，基于选定技巧自动改进。不询问用户保留/修改决策，AI 自行判断并记录理由到 Autonomous Decision Log。

3. **Apply selected techniques throughout the article body**:
   - Do NOT limit technique application to just title and opening
   - Review the entire draft body against selected technique principles:
     - **Language register**: Does the body language match the technique's guidance? (e.g., TOFU = plain language, no jargon)
     - **Emotional arc**: Does the body maintain emotional engagement throughout? (e.g., hooks at section transitions, relatable examples)
     - **Reader relatability**: Can the target audience see themselves in the content? (e.g., "和我有关" principle from Content Funnel)
     - **Paragraph-level application**: Each paragraph should be checked against technique checklists, not just the overall structure
   - Suggest specific paragraph-level improvements based on techniques

> **Experience Check:** Review user's decisions on what to keep/change. Did user provide any corrections? If yes, invoke `{skill-dir}/skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **If Autonomous Mode:** 跳过 Experience Check（无用户交互 = 无纠错）。记录 "Autonomous mode — no interaction"。

> **End:** Update progress tracker. **Update Execution Log** (Step 5 Log: what was modified, what was kept, technique application). Proceed to Step 6 with the (optionally refined) draft.

### Steps 6-10: Polish to Publish

**Full details:** Read `references/steps-polish-to-publish.md` for complete instructions.

**Step 6: Polish** — **【强制】使用 Skill 工具调用 content-research-writer**，不得手动润色代替。Compile technique-aware instructions (platform, techniques, checklist, style, lessons) before invoking. Output: `{topic-slug}-polished.md`. Experience Check after. **Update Execution Log.**
> **If Autonomous Mode:** content-research-writer 失败 → 记录失败到 Execution Log 和 Autonomous Decision Log，AI 自行润色作为降级方案（这是自主模式的设计决策，非违反"禁止擅自兜底"）。跳过 Experience Check。

**Step 7: Illustrations** — **【强制】使用 Skill 工具调用 baoyu-xhs-images**，传入 polished.md。禁止手动编写 outline/prompt。Output: images in `xhs-images/`. Experience Check after. **Update Execution Log.**
> **If Autonomous Mode:** 默认跳过配图（Step 7 整步跳过），在 Execution Log 记录"自主模式 — 跳过配图"。如用户在初始指令中明确要求配图，则尝试调用 baoyu-xhs-images；调用失败 → 记录失败到 Execution Log 和 Autonomous Decision Log，继续。跳过 Experience Check。

**Step 8: Final Article** — Combine polished content + images. Create `{topic-slug}-final.md`. **呈现最终文章（不可省略）：** 告知用户文件路径 + 图片位置 + **等待用户确认**。Experience Check after. **Update Execution Log.** **⚠️ STOP: 不得直接跳到 Step 10，必须先执行 Step 9。**
> **If Autonomous Mode:** 跳过用户确认，创建 final.md 后直接继续到 Step 9。跳过 Experience Check。

**Step 9: Review & Adaptation** ← **不可跳过** — 即使用户已表达发布意图，仍需执行。
- 9a. Review: verbal summary + ask for revisions
- 9b. Platform Adaptation (optional): **【强制】使用 Read 工具读取 `{skill-dir}/skills/content-adapter.md`，严格按照文件中的 Step 顺序执行。** Extracts core message, searches target platform, restructures per platform spec, saves as `{topic-slug}-{platform}.md`
- 9c. Publishing Decision: ask user
- Experience Check after. **Update Execution Log.**
> **If Autonomous Mode:** 9a: AI 自行审阅，不询问修改意见。9b: 根据用户初始意图决定是否适配其他平台——用户要求了则执行，未要求则跳过。9c: 根据用户初始意图和自主能力边界决定是否发布。跳过 Experience Check。

**Step 10: Publish (Optional)** — Invoke platform-specific publishing skill (xiaohongshu / baoyu-post-to-wechat / baoyu-post-to-x). After publishing, remind user about data recording ("记录数据"). **Update Execution Log.** Then proceed to **流程自检 + 复盘**.
> **If Autonomous Mode:** 评估发布路径是否可自主完成：API/CLI 且已有凭证 → 执行并记录；需用户登录/扫码 → 跳过发布，在执行摘要中标注"发布需用户手动完成"并给出所需信息（文件路径、平台等）。

### 流程自检 + 复盘（不可跳过）

**Full protocol:** Read `references/steps-polish-to-publish.md` "流程自检 + 复盘" section for the complete 10-step self-check and retrospective process (checklist audit + execution review + experience recording).

> **If Autonomous Mode:** 标准自检 + 复盘照常执行。额外生成"自主模式执行摘要"填入 progress tracker 对应区域。复盘中发现的流程问题照常记录到经验系统。多篇/批量场景：每篇各自完成自检 + 复盘；全部完成后，生成总体摘要。**复盘完成后，必须执行 Completion Gate 核对（逐项检查 G1-G7），全部通过才能停止。**

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
├── metrics.md                    # Publication metrics
└── xhs-images/                   # Illustrations
    ├── outline.md
    ├── prompts/
    └── *.png
```

Use consistent naming throughout the workflow. All files use the topic slug as prefix and reside in the same output directory.
