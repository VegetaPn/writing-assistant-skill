---
name: writing-assistant
description: Comprehensive writing workflow from ideation to publication. Guides users through creating polished articles by collecting ideas, asking clarifying questions, researching content, polishing drafts, adding images, and publishing to platforms like WeChat or X. Use when users want to write articles, blog posts, or long-form content, especially when starting from a topic idea, rough materials, or initial draft. Also use when users mention writing, publishing, or content creation workflows.
---

# Writing Assistant

A complete end-to-end writing workflow that transforms ideas, materials, or rough drafts into polished, illustrated articles ready for publication.

## Overview

This skill orchestrates a multi-step writing process:
1. Collect initial content (topic, materials, or draft)
2. **Search reference library for style guidance and similar cases**
3. Clarify and enrich through interactive questioning (with element-level references)
4. Generate or refine the initial draft
5. Polish the content using content-research-writer
6. Add appropriate illustrations using baoyu-xhs-images
7. Combine content and images into final article
8. Optionally publish to WeChat or X platforms

## Workflow

### Initial Setup: Check Dependencies

Before starting the workflow, verify that all required skills are installed.

**Required dependencies:**
- `content-research-writer` - For polishing content (Step 4)
- `baoyu-xhs-images` - For generating illustration descriptions and layouts (Step 5)

**Optional dependencies:**
- `generate-image` - For actually generating images from descriptions (requires OPENROUTER API key). Without this, `baoyu-xhs-images` will only produce image descriptions.
- `baoyu-post-to-wechat` - For WeChat publishing (Step 8)
- `baoyu-post-to-x` OR `x-article-publisher` - For X/Twitter publishing (Step 8)

**Note**: To generate actual images (not just descriptions), you must install `generate-image` AND configure OPENROUTER API key in `.env` file.

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
   - **Optional dependencies missing**: Note that publishing features (Step 8) will be unavailable. Continue with the workflow.
   - **Installation failed**: Provide manual instructions:
     ```bash
     # Manual installation from bundled dependencies
     cp -r dependencies/content-research-writer .claude/skills/
     cp -r dependencies/baoyu-xhs-images .claude/skills/
     ```

5. **Proceed to Step 1** once required dependencies are installed

### Step 1: Choose Starting Mode

Ask the user to select one of three modes:

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

### Step 1.5: Search Reference Library

After understanding the user's topic/theme, search the reference library (`references/`) to provide style guidance and inspiration.

**Reference Library Structure:**
```
references/
├── authors/                    # Author profiles and articles
│   └── {author-name}/
│       ├── profile.md          # Writing style analysis
│       └── articles/           # Collected articles
│
├── by-element/                 # Writing elements
│   ├── titles/                 # Title examples and patterns
│   ├── openings/               # Opening paragraph techniques
│   ├── structures/             # Article structure templates
│   └── hooks/                  # Engaging hooks and techniques
│
└── by-topic/                   # Topic-based organization
```

**Search Process:**

1. **Check if reference library exists**:
   - Look for `references/` directory in the project root
   - If not found, skip this step and proceed to Step 2

2. **Search for relevant author styles**:
   - Read available `references/authors/*/profile.md` files
   - Present a brief summary of available writing styles
   - Ask: "Would you like to reference a specific author's style for this article?"

3. **Search for similar topics** (if `by-topic/` has relevant content):
   - Look for articles on similar themes
   - If found, briefly mention: "I found some reference articles on similar topics that might help."

4. **Present reference options**:
   - If user wants to reference a style, note the chosen author's profile for use in later steps
   - The style guidance will influence:
     - Title suggestions (Step 2)
     - Opening paragraph style (Step 2)
     - Overall article structure (Step 2)
     - Tone and voice during polishing (Step 4)

5. **Proceed to Step 2** with or without style reference

### Step 2: Collect and Clarify (Modes 1 & 2 Only)

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

5. **Organize into initial draft** based on:
   - User's answers to questions
   - Researched supplementary materials
   - Logical article structure

6. **Proceed to Step 2.5** for element-level refinement

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

### Step 2.5: Element-Level Reference (Title, Opening, Structure)

Before finalizing the initial draft, use the reference library to refine key writing elements.

**This step applies to all modes** (Topic-Based, Materials-Based, and Draft-Based).

**Process:**

1. **Title Refinement**:
   - Read `references/by-element/titles/titles-index.md` if available
   - Based on the article's theme, suggest 2-3 title options
   - Show relevant title patterns from the reference library
   - Example: "Based on Dan Koe's title patterns, here are some options:
     - Pattern A (hypothesis subversion): '[Topic] when [assumption is overturned]'
     - Pattern B (single optimal answer): 'The most important [X] for [Y]'"
   - Let user choose or customize

2. **Opening Paragraph Refinement**:
   - Read `references/by-element/openings/openings-index.md` if available
   - Suggest an opening approach based on reference techniques
   - Common techniques to reference:
     - Anxiety resonance → contrarian pivot → cascade questions
     - Bold claim → self-correction → answer reveal
   - Draft 1-2 opening paragraph options for user to choose

3. **Structure Planning**:
   - Read `references/by-element/structures/structure-templates.md` if available
   - Propose an article structure based on successful patterns
   - Example: "Based on reference articles, I suggest a 5-section structure:
     - I: Define the problem/context
     - II: Challenge common assumptions
     - III: Present your framework
     - IV: Practical implications
     - V: Action steps"
   - Adjust based on user's content and preferences

4. **Hook Integration**:
   - Read `references/by-element/hooks/hook-examples.md` if available
   - Note effective hook techniques to use within the article
   - Plan where to place engaging hooks in the draft

5. **Proceed to Step 3 or Step 4** with the refined elements

### Step 3: Process Draft (Mode 3 Only)

For Mode 3 (Draft-Based):

1. **Analyze the user's draft**:
   - Read and understand the existing content
   - Identify the main theme and structure
   - Note areas that could be improved

2. **Apply Step 2.5 (Element-Level Reference)**:
   - Even with an existing draft, offer to refine title, opening, and structure
   - Suggest improvements based on reference library patterns
   - Let user decide what to keep vs. what to change

3. **Proceed to Step 4** with the (optionally refined) draft

### Step 4: Polish the Draft

Use the **@content-research-writer** skill to refine and polish the draft:

```
Invoke: content-research-writer skill
Input: The initial or user-provided draft
Output: {filename}-polished.md
```

The polished version will have:
- Improved structure and flow
- Better hooks and engagement
- Citations and research integration
- Professional writing quality

### Step 5: Generate Illustrations

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

### Step 6: Create Final Article

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

### Step 7: Next Steps

After creating the final article, summarize the work completed and ask the user about publication:

**Do not write a summary document**. Instead, provide a brief verbal summary and ask:
- "Would you like to publish this article?"
- "Which platform would you prefer: WeChat Official Account (微信公众号) or X (Twitter)?"
- "Or would you like to make any revisions first?"

### Step 8: Publish (Optional)

If the user wants to publish, invoke the appropriate skill:

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

## Best Practices

1. **Be Patient with Questions**: Take time in Step 2 to thoroughly understand the user's vision
2. **Research Thoughtfully**: Supplement user input with credible sources when gaps exist
3. **Preserve User Voice**: While polishing, maintain the user's intended tone and style
4. **Image Selection**: Be selective with images - quality and relevance over quantity
5. **Review Before Publishing**: Confirm the user is satisfied with the final article before publishing
6. **Use References as Inspiration, Not Templates**: The reference library provides patterns and techniques, not content to copy. Adapt them to the user's unique voice and topic.
7. **Let User Choose**: Always present reference-based suggestions as options, not requirements. The user has final say on title, opening, and structure.
8. **Style Consistency**: If a user chooses to reference a specific author's style, maintain that influence throughout the article for consistency.

## File Naming Convention

Use consistent naming throughout the workflow:
- Initial draft: `{topic-or-title}.md`
- Polished version: `{topic-or-title}-polished.md`
- Final version: `{topic-or-title}-final.md`
