# Writing Assistant Skill

English | [简体中文](README.zh-CN.md)

A comprehensive end-to-end writing workflow skill for Claude Code that transforms ideas, materials, or rough drafts into polished, illustrated articles ready for publication — with built-in topic management, viral benchmarking, experience tracking, and multi-platform publishing.

## Overview

Writing Assistant orchestrates a complete multi-step writing process from ideation to publication, helping users create professional content for blogs, articles, and social media platforms. It goes beyond a simple writing tool — it's a **sustainable content creation system** where every session accumulates knowledge, references, and experience.

## Features

- **Multi-Mode Support**: Start from a topic idea, organized materials, or an existing draft
- **Sub-Skill Architecture**: Modular design with independently callable skills (title generation, topic management, experience tracking)
- **Three-Level Content System**: System → User → Project hierarchy for references and assets, with automatic merging and conflict resolution
- **Topic Management**: Full topic lifecycle from idea capture (inbox) to development, with viral benchmarking integration
- **Reference Library System**: Built-in library of writing styles, title patterns, opening techniques, article structures, and psychology-based writing methodologies
- **Experience Tracking**: Auto-records user corrections, distills lessons learned, prevents repeating mistakes
- **Real-Time Platform Search**: Mandatory search of target platforms for current popular content before writing
- **Interactive Clarification**: Intelligent questioning system to understand user intent and gather necessary details
- **Element-Level Refinement**: Title, opening paragraph, and structure suggestions based on proven patterns and techniques
- **Research Integration**: Automatic web research to supplement content with credible sources
- **Content Polishing**: Integration with content-research-writer for professional-grade refinement
- **Visual Enhancement**: Automatic illustration generation using baoyu-xhs-images + generate-image
- **Progress Tracking**: Per-session progress tracker with step-by-step checklists, corrections log, and end-of-flow self-check
- **Multi-Platform Publishing**: Direct publishing to WeChat Official Account, Xiaohongshu, or X (Twitter)
- **Platform Adaptation**: One article adapted to multiple platforms with platform-specific style, length, and tone

## Installation

### Option 1: Ask Claude Code to Install (Recommended)

Simply ask Claude Code to install this skill for you:

```
Install the writing-assistant skill from https://github.com/VegetaPn/writing-assistant-skill to my project directory
```

Claude will automatically download and set up the skill with all bundled dependencies.

### Option 2: Manual Installation

Download and extract the skill to your project:

```bash
# Download the latest version
curl -L https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip -o writing-assistant-skill.zip

# Extract to your project's .claude/skills directory
mkdir -p .claude/skills
unzip writing-assistant-skill.zip -d .claude/skills/
mv .claude/skills/writing-assistant-skill-main .claude/skills/writing-assistant

# Clean up
rm writing-assistant-skill.zip
```

Alternatively, download manually:
1. Visit https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip
2. Download and extract the ZIP file
3. Move the extracted folder to `.claude/skills/writing-assistant/` in your project directory

## Configuration

### Environment Setup for Image Generation

**Important**: The `baoyu-xhs-images` skill generates image descriptions and layouts. To convert these descriptions into actual images, you need the `generate-image` skill with OPENROUTER API access.

**If you want to generate actual images** (not just descriptions), follow these steps:

1. **Get an OPENROUTER API key**:
   - Visit [OpenRouter](https://openrouter.ai/)
   - Sign up or log in to your account
   - Generate an API key from your dashboard

2. **Create a `.env` file** in your project root:
   ```bash
   # Create .env file
   touch .env
   ```

3. **Add your OPENROUTER API key** to the `.env` file:
   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Verify the configuration**:
   ```bash
   # Check that .env exists and contains the key
   cat .env
   ```

**Security Note**: Add `.env` to your `.gitignore` to keep your API key secure:
```bash
echo ".env" >> .gitignore
```

**If you skip this configuration**: The workflow will still work, but Step 7 (illustration generation) will only produce text descriptions of images. You'll need to create the actual images manually or using other tools.

## Usage

### Writing Workflow

Invoke the skill in Claude Code:

```
/writing-assistant
```

Or ask Claude to help with writing tasks:
- "I want to write an article about..."
- "Help me polish this draft..."
- "I have some materials I want to turn into a blog post..."

### Topic Management

Use the topic manager for idea capture and development:
- "记录选题：{your idea}" — Save an idea to inbox
- "看选题" — View your topic pipeline
- "深化选题：{topic}" — Research and develop a topic with benchmarks and outline

### Viral Benchmarking

Analyze and monitor trending content:
- "分析爆款" + URL — Analyze a viral piece of content
- "监控爆款" / "看热点" — Scan current trending content across platforms
- "启动爆款监控" — Start background monitoring process

### Title Generation

Generate platform-optimized titles independently:
- "生成标题" / "帮我起标题" — Generate title candidates for your content

### Experience Management

View and manage accumulated writing experience:
- "看经验" — View distilled lessons and recent cases
- "总结经验" — Re-distill rules from all recorded cases

## Workflow Steps

The writing workflow follows 11 steps (Step 0–10):

| Step | Name | Description |
|------|------|-------------|
| 0 | Create Progress Tracker | Initialize per-session tracking file, environment pre-check |
| 1 | Choose Starting Mode + Platform | Load from topic pipeline or start fresh; select target platform |
| 2 | Search References & Techniques | Search reference library, benchmarks, techniques, and **target platform** for current popular content |
| 3 | Collect & Clarify | Interactive questioning (Modes 1 & 2), apply selected techniques |
| 4 | Element-Level Reference | Title (via title-generator), opening, structure, hooks — with technique cross-reference |
| 5 | Process Draft | Mode 3 only — apply techniques throughout article body |
| 6 | Polish | Invoke content-research-writer with technique-aware instructions |
| 7 | Generate Illustrations | Invoke baoyu-xhs-images + generate-image |
| 8 | Create Final Article | Combine content + images, present to user for confirmation |
| 9 | Review & Platform Adaptation | Review, optional multi-platform adaptation (cannot be skipped) |
| 10 | Publish | Optional — to WeChat, Xiaohongshu, or X |

After Step 10, a **mandatory self-check** reviews the progress tracker for completeness.

## Three-Level Content System

Assets (`assets/`) and references (`references/`) follow a three-level hierarchy. Content merges on read; lower levels override higher levels on conflict.

| Level | Location | Purpose |
|-------|----------|---------|
| **System** | `{skill-dir}/assets/`, `{skill-dir}/references/` | Skill defaults, shipped with the skill |
| **User** | `{project-root}/assets/`, `{project-root}/references/` | User accumulation (experiences, topics, benchmarks, references) |
| **Project** | `outputs/{topic-slug}/assets/`, `outputs/{topic-slug}/references/` | Per-article overrides (created on demand) |

**Read protocol (`READ:3L`):** Check all three levels, merge content, annotate source. Conflict resolution: project > user > system.

**Write protocol:** Each operation targets a level — `WRITE:user` (default) or `WRITE:project` (article-specific).

## Reference Library

The Reference Library (`references/`) provides style guidance, writing patterns, and inspiration. You can build and use it through natural conversation with Claude Code.

### Building Your Reference Library

Simply tell Claude Code what you want to add:

**Adding an author's writing style:**
- "Analyze Dan Koe's writing style and add it to my reference library"
- "Add this article to my references and extract the writing patterns"
- "Create a profile for {author name} based on these articles: {URLs or file paths}"

**Adding writing elements:**
- "Extract the title pattern from this article and add it to my titles reference"
- "Analyze this opening paragraph and save it as a reference"
- "Add this article structure as a template to my references"

**Auto-enrichment via viral benchmarking:**
When you analyze viral content ("分析爆款"), the system automatically extracts patterns and adds them to the reference library — title patterns, opening techniques, and structure templates grow organically.

### Using the Reference Library

During the writing workflow, the skill automatically searches your reference library. You can also explicitly request styles:

- "Write this article in Dan Koe's style"
- "Use the hypothesis-subversion title pattern from my references"
- "Apply the anxiety-resonance opening technique"
- "Show me what author styles I have available"
- "What title patterns do I have in my reference library?"

### Reference Library Structure

```
references/
├── authors/                    # Author profiles and articles
│   └── {author-name}/
│       ├── profile.md          # Writing style analysis
│       └── articles/           # Sample articles
│
├── by-element/                 # Writing elements (case-driven)
│   ├── titles/                 # Title patterns
│   ├── openings/               # Opening techniques
│   ├── structures/             # Article structures
│   └── hooks/                  # Engaging hooks
│
└── techniques/                 # Methodology-level guidance (principle-driven)
    └── psychology/             # Psychology-based methodologies
        ├── psychology-index.md # Methodology index (structured summary)
        └── content-funnel.md   # Content marketing funnel methodology
```

**Case Library vs Methodology Library:**
- `by-element/` (Case Library): What is this article's title, and why is it good
- `techniques/` (Methodology Library): What are the underlying principles of a good title, and how to systematically create great content

**Methodology Entry Format:**
Each methodology includes: Core Framework → Psychology Mechanism → Why It Works → Application Scenarios → Practice Guide → Case Study

## Sub-Skills

The skill is organized into a main orchestrator (`SKILL.md`) and independently callable sub-skills:

| Sub-Skill | File | Purpose | Standalone Use |
|-----------|------|---------|----------------|
| **Title Generator** | `skills/title-generator.md` | Platform-optimized title generation (小红书/公众号/抖音/X), anti-AI-flavor rules, title type distribution | "帮我给这篇文章想 5 个小红书标题" |
| **Topic Manager** | `skills/topic-manager.md` | Topic lifecycle (inbox → developing) + viral benchmarking (分析爆款/监控爆款/后台监控) | "记录选题" "看热点" |
| **Experience Tracker** | `skills/experience-tracker.md` | Auto-records user corrections as cases, distills lessons learned | "看经验" "总结经验" |

Sub-skills are project-local — no installation needed. They live in the `skills/` directory and can be invoked directly or as part of the writing workflow.

## Dependencies

This skill requires several other skills to function. These dependencies are **bundled in the repository** for your convenience and will be automatically installed when needed.

### Automatic Installation

When you run `/writing-assistant`, the skill will automatically:
1. Check which dependencies are installed
2. Offer to install missing dependencies from bundled versions
3. Copy them to your project's `.claude/skills/` directory with your permission

This ensures a seamless experience without needing to manually hunt down and install each dependency.

### Required Skills

- **content-research-writer** - Polishes and refines content with professional writing quality
- **baoyu-xhs-images** - Generates illustration descriptions and layouts in Xiaohongshu style
- **xiaohongshu-mcp** - Xiaohongshu search, analysis, and publishing (requires local MCP server)
- **wechat-article-search** - WeChat Official Account article searching
- **generate-image** - Generates actual images from descriptions using AI models (requires OPENROUTER API key)
- **baoyu-post-to-wechat** - Publishes to WeChat Official Account (微信公众号)
- **baoyu-post-to-x** - Publishes to X/Twitter

### Image Generation Requirements

To generate **actual images** (not just descriptions):
1. Install the `generate-image` skill (bundled in dependencies)
2. Configure OPENROUTER API key (see Configuration section above)

Without `generate-image`, the workflow will still work but Step 7 will only produce image descriptions that you'll need to create manually.

### Manual Installation

If automatic installation doesn't work or you prefer manual control, you can copy skills directly:

```bash
# From the writing-assistant repository root
# For project-local installation
mkdir -p .claude/skills
cp -r dependencies/content-research-writer .claude/skills/
cp -r dependencies/baoyu-xhs-images .claude/skills/
cp -r dependencies/xiaohongshu-mcp .claude/skills/
cp -r dependencies/wechat-article-search .claude/skills/

# Or for global installation (available to all projects)
cp -r dependencies/content-research-writer ~/.claude/skills/
cp -r dependencies/baoyu-xhs-images ~/.claude/skills/
```

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

## File Structure

```
writing-assistant-skill/
├── README.md                      # User documentation (English)
├── README.zh-CN.md                # User documentation (Chinese)
├── CLAUDE.md                      # Codebase instructions for Claude Code
├── SKILL.md                       # Main writing workflow (the "brain")
│
├── skills/                        # Sub-skills (project-local, no installation needed)
│   ├── title-generator.md         # Platform-optimized title generation
│   ├── topic-manager.md           # Topic lifecycle + viral benchmarking
│   └── experience-tracker.md      # Correction recording + lesson distillation
│
├── assets/                        # System-level defaults (shipped with skill)
│   ├── topics/
│   │   ├── inbox.md
│   │   ├── developing/
│   │   └── benchmarks/
│   │       ├── benchmarks-index.md
│   │       └── monitor-config.md
│   └── experiences/
│       ├── cases/
│       ├── lessons.md
│       └── command-failures.md
│
├── references/                    # System-level reference library
│   ├── authors/                   # Author profiles and writing styles
│   │   └── dan-koe/
│   ├── by-element/                # Writing elements (titles, openings, structures, hooks)
│   └── techniques/                # Methodology-level guidance
│       └── psychology/
│
├── config/                        # Tool configurations
│
├── dependencies/                  # Bundled dependency skills
│   ├── content-research-writer/
│   ├── baoyu-xhs-images/
│   ├── generate-image/
│   ├── xiaohongshu-mcp/
│   ├── wechat-article-search/
│   ├── baoyu-post-to-wechat/
│   └── baoyu-post-to-x/
│
└── dev/                           # Development docs and iteration plans
    └── iteration-plan.md
```

## Best Practices

1. **Be Patient with Questions**: Take time to thoroughly answer clarifying questions for best results
2. **Provide Context**: The more context you provide, the better the output
3. **Review at Each Stage**: Check the draft, polished version, and final article before publishing
4. **Image Balance**: Images should enhance, not overwhelm the content
5. **Platform Considerations**: Review platform-specific requirements before publishing
6. **Build Your Reference Library**: Analyze viral content regularly to grow your reference library organically
7. **Check Experience Before Writing**: The system checks lessons automatically, but you can also review with "看经验"
8. **Use Topic Pipeline**: Record ideas as they come ("记录选题"), develop them later — don't lose inspiration

## Examples

### Starting from a Topic

```
User: I want to write about the future of AI in healthcare
Skill: [Creates progress tracker, asks for platform, searches references & platform trends]
Skill: [Asks clarifying questions about audience, angle, key points]
User: [Provides answers]
Skill: [Generates title options, refines opening & structure]
Skill: [Polishes draft, generates illustrations, creates final article]
Skill: [Reviews with user, optional platform adaptation, publish]
```

### Using the Topic Pipeline

```
User: 记录选题：AI 正在让每个人都变成创作者
Skill: [Saves to inbox.md]
...later...
User: 深化选题：AI 创作者
Skill: [Searches benchmarks, researches topic, generates outline and title candidates]
...later...
User: /writing-assistant
Skill: [Finds the developed topic, proceeds with writing workflow]
```

### Monitoring Trends

```
User: 看热点
Skill: [Scans X timeline, Xiaohongshu, WeChat for trending content]
Skill: [Presents transparency report with platform availability, scan results, top content]
User: 深入分析第 3 条
Skill: [Runs detailed viral analysis, extracts patterns, offers to create topic]
```

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## License

MIT License

## Author

[VegetaPn GitHub](https://github.com/VegetaPn)

## Changelog

### Version 2.0.0 (2026-02-17)

**Architecture overhaul — from a linear writing tool to a sustainable content creation system.**

- **Sub-Skill Architecture**: Split monolithic skill into modular sub-skills (title-generator, topic-manager, experience-tracker), each independently callable
- **Three-Level Content System**: Introduced system/user/project hierarchy for assets and references with `READ:3L` merge protocol and `WRITE:user`/`WRITE:project` targeting
- **Topic Management System**: Full topic lifecycle — idea inbox, topic development with benchmarks and outlines, handoff to writing workflow
- **Viral Benchmarking**: Analyze individual viral content, batch-scan trending content across platforms (X, Xiaohongshu, WeChat), background monitoring with transparency reports
- **Experience Tracking**: Auto-detect user corrections, record cases, distill lessons — feedback loop that prevents repeating mistakes
- **Progress Tracker**: Per-session checklist with step-by-step tracking, corrections log, and mandatory end-of-flow self-check
- **Writing Methodology Integration**: Psychology-based techniques (content marketing funnel) applied throughout the writing process, not just to elements
- **Real-Time Platform Search**: Mandatory search of target platform for current popular content before writing (Step 2)
- **Platform Adaptation**: One article adapted to multiple platforms with re-evaluated techniques and platform-specific style
- **Expanded Workflow**: 11-step process (Step 0–10) with Experience Checkpoints after every interactive step
- **New Dependencies**: Added xiaohongshu-mcp (Xiaohongshu search/publish) and wechat-article-search (WeChat article search)
- **Reliability Improvements**: Mandatory skill tool invocations (Steps 6, 7), unskippable Step 9 review, Step 8 user confirmation, command failure logging, dependency pre-checks
- **Output Directory Convention**: All outputs stored under `outputs/{topic-slug}/` with consistent naming

### Version 1.2.0 (2026-02-04)
- **Reference Library System**: Added `references/` directory with author profiles, writing elements, and topic examples
- **Style Guidance**: Search and apply writing styles from reference authors
- **Element-Level Refinement**: Refine titles, openings, and article structure based on proven patterns
- **Hook Integration**: Plan and integrate engaging hooks throughout the article

### Version 1.1.0 (2026-01-31)
- **Bundled Dependencies**: All required skills now included in the repository, including generate-image for actual image generation
- **Automatic Dependency Installation**: Skill automatically checks and installs missing dependencies to project directory
- **Improved User Experience**: Users no longer need to manually hunt down and install dependencies
- **Enhanced Documentation**: Comprehensive installation guide with multiple options, including OPENROUTER configuration instructions
- **Project-Local Installation**: Dependencies installed to `.claude/skills/` for project-specific setup
- **Image Generation Support**: Added generate-image skill and configuration guide for generating actual images

### Version 1.0.0
- Initial release
- Support for three starting modes (topic, materials, draft)
- Integration with content-research-writer and baoyu-xhs-images
- Publishing support for WeChat and X platforms