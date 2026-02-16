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

## Companion Skills (project-local, no installation needed)

These skills live in the `skills/` directory and can be invoked directly:
- `skills/title-generator.md` — Platform-optimized title generation (called in Step 4, or independently)
- `skills/topic-manager.md` — Topic lifecycle management + viral benchmarking
- `skills/experience-tracker.md` — Records user corrections, distills lessons learned

## Experience Check System

**Two mechanisms work together to ensure corrections are captured:**

### Mechanism 1: Pre-step lesson check
**Before every step**, check `assets/experiences/lessons.md` if it exists. Apply any relevant lessons to avoid repeating past mistakes.

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
> 1. **Immediately** create a case file in `assets/experiences/cases/` (format: `{YYYY-MM-DD}-{slug}.md`, see `skills/experience-tracker.md`)
> 2. Log the correction in the progress tracker's Corrections Log with `Case Recorded? = Yes` and fill in the Case File path
> 3. If it's a universal rule (applies to all articles), also update `assets/experiences/lessons.md`
> 4. Confirm to user: "已记录这条经验。"
> 5. Then proceed to the next step
>
> **NEVER** leave a correction as "Pending" in the Corrections Log without creating a case file. Every correction must be closed out on the spot.
>
> **If none occurred:** Note "No corrections" in the progress tracker and proceed.

This checkpoint is marked as **"Experience Check"** in every applicable step below. Do NOT skip it.

## Workflow

### Initial Setup: Initialize Workspace

Before starting the workflow, check the user's working directory and ensure required directories and template files exist.

**Required directory structure:**
```
assets/
├── topics/
│   ├── inbox.md
│   ├── developing/
│   └── benchmarks/
│       ├── benchmarks-index.md
│       └── monitor-config.md
└── experiences/
    ├── cases/
    └── lessons.md
```

**Process:**
1. Check if the above directories and files exist
2. Create any missing directories and template files silently
3. Do NOT overwrite existing files — only create if absent
4. Proceed to dependency check

### Initial Setup: Check Dependencies

Before starting the workflow, verify that all required skills are installed.

**Required dependencies:**
- `content-research-writer` - For polishing content (Step 6)
- `baoyu-xhs-images` - For generating illustration descriptions and layouts (Step 7)
- `xiaohongshu-mcp` - For searching and publishing on Xiaohongshu (小红书). Requires local MCP server running. Used in Step 2 (search popular content) and Step 10 (publish).
- `wechat-article-search` - For searching WeChat Official Account (微信公众号) articles. Used in Step 2 (search popular content).
- `generate-image` - For generating images from descriptions (requires OPENROUTER API key configured in `.env`).
- `baoyu-post-to-wechat` - For WeChat publishing (Step 10)
- `baoyu-post-to-x` OR `x-article-publisher` - For X/Twitter publishing (Step 10)

**Note**: To generate actual images (not just descriptions), you must configure OPENROUTER API key in `.env` file. To use xiaohongshu-mcp, the local MCP server must be running (see `dependencies/xiaohongshu-mcp/SKILL.md` for setup).

**Dependency check process:**

This skill bundles all dependencies in the `dependencies/` directory for convenient automatic installation.

1. **Check installed skills** using:
   ```bash
   claude skill list
   ```

2. **Identify missing dependencies**:
   - Compare installed skills against the required and optional dependencies listed above
   - Note which dependencies are missing

3. **For each missing dependency**:
   - Check if bundled version exists in `dependencies/<skill-name>/`
   - If found, ask user: "The skill `<skill-name>` is required for [purpose]. Install it to your project's `.claude/skills/` directory?"
   - If user confirms, copy to project:
     ```bash
     mkdir -p .claude/skills
     cp -r dependencies/<skill-name> .claude/skills/
     ```
   - Verify the skill is now available

4. **Handle installation outcomes**:
   - **Required dependencies missing and user declines**: Explain that workflow cannot proceed without these skills. Offer to pause until user installs them manually.
   - **Installation failed**: Provide manual instructions:
     ```bash
     # Manual installation from bundled dependencies
     cp -r dependencies/<skill-name> .claude/skills/
     ```

5. **Proceed to Step 0** once required dependencies are installed

### Step 0: Create Progress Tracker

Before starting the writing workflow, create a session progress tracker file. This file serves as the "checklist brain" for the entire session, ensuring no step or sub-step is skipped.

**Process:**
1. Determine a topic slug (use a short English slug for the filename, e.g., "attention-economy", "ai-writing-tips")
2. Create the output directory: `outputs/{topic-slug}/`
3. Create the progress tracker file: `outputs/{topic-slug}/{topic-slug}-progress.md`
4. Initialize the file with the template below
5. **Environment pre-check (only in Step 0, once):**
   1. Check if `.env` file exists and contains `OPENROUTER_API_KEY` (needed for image generation)
   2. Check if bird CLI is available (`bird whoami`), record available cookie source
   3. Check if baoyu-post-to-wechat dependencies are fully installed (`front-matter`, `marked`, `highlight.js`, `reading-time`, `fflate`)
   4. Record pre-check results in the progress file's Session Metadata (update Environment fields)
   5. If anything is missing, fix on the spot or prompt user — do not leave for later steps
6. Proceed to Step 1

**Progress Tracker Template:**

```markdown
# Progress Tracker: {topic-slug}

## Session Metadata
**Session Started:** YYYY-MM-DD HH:MM
**Platform:** (pending - determined in Step 1)
**Mode:** (pending - determined in Step 1)
**Topic:** (pending - determined in Step 1)
**Initialization:** ✅ completed (不需要重复)
**Output Directory:** outputs/{topic-slug}/
**Environment:**
- OPENROUTER_API_KEY: ✅ / ❌
- bird CLI: ✅ (cookie-source: chrome) / ❌
- wechat dependencies: ✅ / ❌

## Applied References & Techniques
- **Author Style:** (pending)
- **Selected Techniques:** (pending)
- **Key Benchmarks:** (pending)

## Step Checklist

### Step 0: Create Progress Tracker
- [x] Created output directory: outputs/{topic-slug}/
- [x] Created progress tracker file
- [x] Environment pre-check completed (results recorded above)

### Step 1: Choose Starting Mode + Platform
- [ ] Determined target platform
- [ ] Checked `assets/topics/developing/` for ready topics
- [ ] Selected starting mode
- [ ] Updated session metadata above
- [ ] **Experience Check** completed

### Step 2: Search References & Techniques
- [ ] Checked lessons.md
- [ ] Searched `references/authors/` for style matches
- [ ] Searched `references/by-element/` for element patterns
- [ ] Searched `references/techniques/` for writing methodologies
- [ ] Searched `assets/topics/benchmarks/` for viral cases
- [ ] Searched target platform for popular content on the same topic
- [ ] Recorded matched techniques in "Applied References & Techniques" above

### Step 3: Collect & Clarify (Modes 1 & 2)
- [ ] Checked lessons.md
- [ ] Analyzed provided content
- [ ] Asked clarifying questions
- [ ] Supplemented with research if needed
- [ ] Applied selected techniques to content organization
- [ ] Organized into initial draft
- [ ] **Experience Check** completed

### Step 4: Element-Level Reference
- [ ] Checked lessons.md
- [ ] Title: invoked title-generator with platform rules
- [ ] Opening: referenced openings-index.md + techniques
- [ ] Structure: referenced structure-templates.md + techniques
- [ ] Hooks: referenced hook-examples.md + planned placement
- [ ] **Experience Check** completed

### Step 5: Process Draft (Mode 3 only)
- [ ] Checked lessons.md
- [ ] Analyzed existing draft
- [ ] Applied element refinements (Step 4)
- [ ] Applied selected techniques throughout article body
- [ ] **Experience Check** completed

### Step 6: Polish
- [ ] Checked lessons.md
- [ ] Compiled technique-aware instructions for polishing
- [ ] Invoked content-research-writer
- [ ] Verified platform-specific style applied
- [ ] Output: outputs/{topic-slug}/{topic-slug}-polished.md
- [ ] **Experience Check** completed

### Step 7: Generate Illustrations
- [ ] Invoked baoyu-xhs-images
- [ ] Generated appropriate illustrations
- [ ] **Experience Check** completed

### Step 8: Create Final Article
- [ ] Combined polished content + images
- [ ] Verified layout and formatting
- [ ] Output: outputs/{topic-slug}/{topic-slug}-final.md
- [ ] **Experience Check** completed

### Step 9: Review & Platform Adaptation
- [ ] Presented summary to user
- [ ] Asked about revisions
- [ ] Asked about additional platform adaptations
- [ ] If adapting: re-applied techniques with platform rules
- [ ] **Experience Check** completed

### Step 10: Publish
- [ ] User confirmed platform and content
- [ ] Invoked publishing skill
- [ ] Publication result: ____

## Corrections Log
| Step | What User Said | Case Recorded? | Case File |
|------|----------------|----------------|-----------|

## Session Notes
(Add notes as the session progresses)
```

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

- Look in `assets/topics/developing/` for existing topic files
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

After understanding the user's topic/theme and target platform, search all reference sources.

**Reference Library Structure:**
```
references/
├── authors/                    # Author profiles and articles
│   └── {author-name}/
│       ├── profile.md          # Writing style analysis
│       └── articles/           # Collected articles
│
├── by-element/                 # Writing elements (cases)
│   ├── titles/                 # Title examples and patterns
│   ├── openings/               # Opening paragraph techniques
│   ├── structures/             # Article structure templates
│   └── hooks/                  # Engaging hooks and techniques
│
└── techniques/                 # Writing methodologies (principles)
    └── psychology/             # Psychology-based techniques
        ├── psychology-index.md # Index of all methodologies
        └── content-funnel.md   # Content marketing funnel methodology
```

**Search Process:**

1. **Check if reference library exists**:
   - Look for `references/` directory in the project root
   - If not found, skip this step and proceed to Step 3

2. **Search for relevant author styles**:
   - Read available `references/authors/*/profile.md` files
   - Present a brief summary of available writing styles
   - Ask: "Would you like to reference a specific author's style for this article?"

3. **Search for writing element patterns**:
   - Check `references/by-element/` for relevant patterns
   - Note relevant title patterns, opening techniques, structure templates, and hooks
   - These will be used in Step 4

4. **Search for writing techniques and methodologies**:
   - Read `references/techniques/psychology/psychology-index.md`
   - For each technique listed, evaluate relevance to the current topic and platform:
     - **Content Marketing Funnel (内容营销漏斗)**: Relevant for all content creation. Determine which funnel stage this article targets (TOFU/MOFU/BOFU) based on the topic and platform. For example:
       - 小红书 content is typically TOFU (broad audience, easy to understand, emotional)
       - 微信公众号 long-form can be MOFU (in-depth, trust-building)
       - The technique's Practice Guide checklist should be applied during writing
     - Additional techniques as they are added to the library
   - **Record selected techniques** in the progress tracker under "Applied References & Techniques"
   - Present to user: "Based on your topic and platform, I recommend applying these writing techniques: [list]. Here's why: [brief explanation]."

5. **Search viral benchmarks** (if `assets/topics/benchmarks/` exists):
   - Check for benchmark analyses on similar topics
   - If found, present: "I found N benchmark analyses on related topics that might inform our approach."
   - Note relevant title patterns, hooks, and structures from benchmarks
   - Record key benchmarks in the progress tracker

6. **【必做】Search target platform for popular content on the same topic**:

   This step MUST NOT be skipped. Even if the local reference library is rich, you must search the target platform for current popular content.

   Process:
   a. Search by platform using corresponding tools:
     - **小红书**: Use `xiaohongshu-mcp` skill — `python scripts/xhs_client.py search "{topic keywords}"`. Returns notes with feed_id and xsec_token. Use `python scripts/xhs_client.py detail "{feed_id}" "{xsec_token}"` to get full content and comments for promising results.
     - **微信公众号**: Use `wechat-article-search` skill — `node scripts/search_wechat.js "{topic keywords}" -n 15`. Returns titles, summaries, publish time, source accounts, and links. Use `-r` flag for real URLs.
     - **抖音**: `WebSearch` with queries like "抖音 {topic keywords} 热门"
     - **X/Twitter**: `bird search "{topic keywords}"` (here `bird search` IS correct — searching by topic, not reading timeline)
   b. Select 3-5 high-engagement results
   c. For each, briefly analyze: title type, opening technique, structure patterns, engagement reasons
   d. Ask user if they want deep analysis on any (invoke topic-manager's "分析爆款")
   e. **Accumulate**: If valuable patterns are found, append to corresponding files in `references/by-element/`
   f. Record search results summary in the progress tracker's Session Notes

   > **Why this step matters**: The local reference library may be sparse. Searching the target platform for what's currently working on the same topic provides real, proven patterns to learn from — not generic writing advice, but specific examples of what resonates with the actual audience on that platform.

7. **Present reference summary**:
   - Summarize what was found: author style, element patterns, techniques, benchmarks
   - If user wants to reference a style, note the chosen author's profile for use in later steps
   - The style guidance and selected techniques will influence all subsequent steps:
     - Title suggestions (Step 4)
     - Opening paragraph style (Step 4)
     - Overall article structure (Step 4)
     - Content organization and body writing (Steps 3/5)
     - Tone and voice during polishing (Step 6)
     - Platform adaptation (Step 9)

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
- Common areas to explore (adjust based on actual needs):
  - What's the main message or takeaway?
  - Who is the target audience?
  - What's the desired tone (professional, casual, technical, etc.)?
  - Are there specific points that need more detail?
  - What context or background should readers have?
  - Are there particular examples or stories to include?
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
   - Read `references/by-element/openings/openings-index.md` if available
   - Suggest an opening approach based on reference techniques
   - **Technique cross-reference**: Apply selected techniques to opening choice:
     - Content Funnel TOFU: opening should trigger universal emotions (anxiety, curiosity, empathy), be instantly understandable, and relate to the reader
     - Content Funnel MOFU: opening can assume some context, focus on credibility and depth
   - Common techniques to reference:
     - Anxiety resonance → contrarian pivot → cascade questions
     - Bold claim → self-correction → answer reveal
   - Draft 1-2 opening paragraph options for user to choose

3. **Structure Planning**:
   - Read `references/by-element/structures/structure-templates.md` if available
   - Propose an article structure based on successful patterns
   - **Technique cross-reference**: Align structure with selected techniques:
     - Content Funnel: structure should match the funnel stage — TOFU favors shorter, punchier structures; MOFU favors deeper, more layered structures
     - Review the "Application Scenarios" table in the technique documentation for content type guidance
   - Adjust based on user's content, preferences, and **target platform** constraints

4. **Hook Integration**:
   - Read `references/by-element/hooks/hook-examples.md` if available
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

### Step 6: Polish the Draft

> **Start:** Read progress tracker. Review selected techniques and target platform. Update Step 6 status to in-progress.

Use the **@content-research-writer** skill to refine and polish the draft.

**Before invoking the polishing skill, compile technique-aware instructions:**

1. **Target platform**: "{platform}" — apply platform-specific length, tone, and formatting rules
2. **Selected techniques**: List the techniques from Step 2 and their key principles
3. **Technique-specific polish checklist** (derive from selected techniques):
   - If Content Funnel (TOFU): "Ensure every paragraph passes the 'give it to your parents to read' test. Remove jargon. Strengthen emotional hooks. Make every section relatable."
   - If Content Funnel (MOFU): "Maintain depth and credibility. Add supporting evidence. Build trust through expertise demonstration."
4. **Author style reference** (if one was chosen in Step 2): key style characteristics to maintain
5. **Lessons from experience library**: any relevant rules from `assets/experiences/lessons.md`

```
Invoke: content-research-writer skill
Input: The initial or user-provided draft + technique-aware instructions above
Output: {filename}-polished.md
```

The polished version should have:
- Improved structure and flow
- Better hooks and engagement
- Citations and research integration
- Professional writing quality
- **Technique principles applied throughout** (not just surface-level polish)
- **Platform-appropriate style and length**

> **Experience Check:** After presenting polished draft to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker with output filename. Proceed to Step 7.

### Step 7: Generate Illustrations

> **Start:** Read progress tracker. Update Step 7 status to in-progress.

Use the **@baoyu-xhs-images** skill to create appropriate images:

```
Invoke: baoyu-xhs-images skill
Input: {filename}-polished.md content
Output: Generated images
```

**Image Guidelines:**
- Images should be appropriately spaced (not too dense, usually 3~5 images)
- Select key points that benefit from visual illustration
- Maintain balance between text and visuals

> **Experience Check:** After presenting illustrations to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 8.

### Step 8: Create Final Article

> **Start:** Read progress tracker. Update Step 8 status to in-progress.

Combine the polished content with generated images:

1. Take the {filename}-polished.md content
2. Insert images at appropriate positions
3. Ensure proper formatting and layout
4. Create final output: {filename}-final.md

**Layout Considerations:**
- Place images near relevant text sections
- Maintain readable flow
- Use consistent formatting
- Ensure images enhance rather than disrupt reading

> **Experience Check:** After presenting the final article to user, review their feedback. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker with output filename. Proceed to Step 9.

### Step 9: Review and Platform Adaptation

> **Start:** Read progress tracker. Review target platform and all applied techniques. Update Step 9 status to in-progress.

After creating the final article, summarize the work completed and guide the user through review and optional adaptation.

**9a. Review:**

**Do not write a summary document**. Instead, provide a brief verbal summary covering:
- What was written and for which platform
- Which references and techniques were applied
- Key decisions made during the process

Ask:
- "Would you like to make any revisions?"
- Handle revisions if requested (loop back to relevant step)

**9b. Platform Adaptation (Optional):**

Ask: "Would you like to adapt this article for another platform?"

If yes:
1. **Determine the new target platform** (小红书, 微信公众号, 抖音, X/Twitter)
2. **【NEW】Search the new platform for popular content**:
   - Use the corresponding platform tool (same as Step 2, point 6) to search for popular content on the same/similar topic on the new platform
   - Quickly analyze 2-3 results: title patterns, content density, tone/voice, engagement style
   - Extract currently effective patterns on this platform and apply them to the adaptation
3. **Re-evaluate funnel stage** (小红书 is typically TOFU, 微信公众号 MOFU — re-determine based on the new platform)
4. **Re-apply writing techniques with new platform rules**:
   - Re-read the selected techniques from Step 2
   - Apply the technique's guidance for the new platform's content type:
     - 小红书: TOFU — short (≤1000 words), casual, emotional, image-heavy
     - 微信公众号: MOFU — long-form, in-depth, authoritative
     - 抖音: TOFU — very short paragraphs, first 5 seconds critical, data-driven
     - X/Twitter: Varies — thread format, concise, hook-heavy
   - Adapt the article body, not just the title/opening
5. **Re-generate title** for the new platform (invoke `skills/title-generator.md` with new platform)
6. **Re-adapt opening and structure** for the new platform's conventions
7. **Save the adapted version** as `outputs/{topic-slug}/{topic-slug}-{platform}.md`

**9c. Publishing Decision:**

Ask:
- "Would you like to publish this article?"
- Present available publishing options based on installed dependencies

> **Experience Check:** Review all user feedback in this step. Did user provide any corrections? If yes, invoke `skills/experience-tracker.md` and log in Corrections Log. Then proceed.

> **End:** Update progress tracker. Proceed to Step 10 if publishing, or conclude session.

### Step 10: Publish (Optional)

> **Start:** Read progress tracker. Update Step 10 status to in-progress.

If the user wants to publish, invoke the appropriate skill:

**For 小红书 (Xiaohongshu):**
```
Invoke: xiaohongshu-mcp skill
Command: python scripts/xhs_client.py publish "{title}" "{content}" "{image_urls}"
```
Ensure the xiaohongshu-mcp local server is running before publishing.

**For WeChat Official Account:**
```
Invoke: baoyu-post-to-wechat skill
Input: {filename}-final.md and images
```

**For X (Twitter):**
```
Invoke: baoyu-post-to-x or x-article-publisher skill
Input: {filename}-final.md and images
```

Follow the publishing skill's workflow for platform-specific requirements.

> **End:** Update progress tracker with publication result. Mark session as complete.

## Best Practices

1. **Be Patient with Questions**: Take time in Step 3 to thoroughly understand the user's vision
2. **Research Thoughtfully**: Supplement user input with credible sources when gaps exist
3. **Preserve User Voice**: While polishing, maintain the user's intended tone and style
4. **Image Selection**: Be selective with images - quality and relevance over quantity
5. **Review Before Publishing**: Confirm the user is satisfied with the final article before publishing
6. **Use References as Inspiration, Not Templates**: The reference library provides patterns and techniques, not content to copy. Adapt them to the user's unique voice and topic.
7. **Let User Choose**: Always present reference-based suggestions as options, not requirements. The user has final say on title, opening, and structure.
8. **Style Consistency**: If a user chooses to reference a specific author's style, maintain that influence throughout the article for consistency.
9. **Apply Techniques Throughout, Not Just to Elements**: Writing techniques from `references/techniques/` should influence the entire article body — paragraph structure, language choices, emotional arc, example selection — not just the title and opening. Check the technique's Practice Guide at the paragraph level.
10. **Track Everything in the Progress File**: The progress tracker is your session memory. Read it before each step, update it after. This prevents skipped sub-steps and ensures corrections are captured.

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
