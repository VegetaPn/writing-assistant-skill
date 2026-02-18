# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Writing Assistant Skill** - a Claude Code skill that orchestrates end-to-end writing workflows from ideation to publication. The skill transforms ideas, materials, or rough drafts into polished, illustrated articles.

## Architecture

### Core Files

- `SKILL.md` - Main writing workflow (the "brain" — focuses on writing, from draft to publish)

### Scripts (`scripts/`)

- `scripts/check-env.sh` - Environment pre-check script (OPENROUTER_API_KEY, bird CLI, installed skills, npm deps)

### Extracted References (from SKILL.md for Progressive Disclosure)

These files contain detailed instructions that SKILL.md references via links:

- `references/three-level-protocol.md` - Full three-level reference system protocol (READ:3L, WRITE:user/project)
- `references/search-workflow.md` - Step 2 detailed search process (platform commands, session notes format)
- `references/steps-polish-to-publish.md` - Steps 6-10 full instructions + Best Practices
- `assets/progress-template.md` - Progress tracker template (instantiated per session in Step 0)

### Sub-Skills (`skills/`)

Project-local skills, no installation needed. Directly readable by the main workflow.

- `skills/title-generator.md` - Platform-optimized title generation (小红书/公众号/抖音), anti-AI-flavor rules, title type distribution
- `skills/content-adapter.md` - Multi-platform content adaptation (微信/小红书/X/抖音), per-platform specs
- `skills/topic-manager.md` - Topic lifecycle (inbox → developing) + viral benchmarking (分析爆款/监控爆款/后台监控) + data recording
- `skills/experience-tracker.md` - Auto-records user corrections as cases, distills lessons learned

### Three-Level Content System

Assets (`assets/`) and references (`references/`) follow a three-level hierarchy. Each level has the same directory structure. Content merges on read (system → user → project); lower levels override higher levels on conflict.

| Level | Location | Purpose |
|-------|----------|---------|
| **System** | `{skill-dir}/assets/`, `{skill-dir}/references/` | Skill 自带默认值，不可修改 |
| **User** | `{project-root}/assets/`, `{project-root}/references/` | 用户积累（经验、选题、对标、参考） |
| **Project** | `outputs/{topic-slug}/assets/`, `outputs/{topic-slug}/references/` | 单篇文章 override（按需创建） |

**Read (`READ:3L`):** Check all three levels, merge content, annotate source. Conflict → project > user > system.
**Write:** Each operation targets a level — `WRITE:user` (default) or `WRITE:project` (article-specific).

**Directory structure (same at each level):**

```
assets/
├── topics/                       # Topic management + viral benchmarks
│   ├── inbox.md                  # Idea capture (append-only)
│   ├── developing/               # Researched topics ready to write
│   └── benchmarks/               # Viral content analyses
│       ├── benchmarks-index.md   # Quick-lookup index
│       └── monitor-config.md     # Background monitoring config
└── experiences/                  # Experience/case library
    ├── cases/                    # Individual correction records
    └── lessons.md                # Distilled rules from cases

references/
├── authors/{name}/               # By author: profile.md + articles/
├── by-element/                   # By writing element (case-driven)
│   ├── titles/titles-index.md
│   ├── openings/openings-index.md
│   ├── structures/structure-templates.md
│   └── hooks/hook-examples.md
└── techniques/                   # By methodology (principle-driven)
    └── psychology/psychology-index.md
```

**Key distinction in references/:**
- `by-element/` = "What is this title, why is it good" (cases)
- `techniques/` = "What makes a good title" (underlying principles)

### Dependencies (`dependencies/`)

Bundled skills for auto-installation:
- `content-research-writer` - Content polishing (required)
- `baoyu-xhs-images` - Illustration generation (required)
- `xiaohongshu-mcp` - Xiaohongshu search, analysis, and publishing (required, needs local MCP server)
- `wechat-article-search` - WeChat article searching (required)
- `generate-image` - Actual image generation (required, needs OPENROUTER API)
- `baoyu-post-to-wechat` - WeChat publishing (required)
- `baoyu-post-to-x` - X/Twitter publishing (required)

### Development (`dev/`)

- `iteration-plan.md` - Project roadmap and design decisions
- `dev_reference_materials/` - Source materials for reference library

## Workflow

**Topic System** (skills/topic-manager.md) — decides WHAT to write:
1. 记录选题 → inbox.md
2. 监控/分析爆款 → benchmarks/
3. 深化选题 → developing/ (with benchmarks, outline, title candidates)
4. 记录数据 → outputs/{slug}/metrics.md

**Writing System** (SKILL.md) — does the WRITING:
0. **Create Progress Tracker** - Initialize per-session tracking file
1. **Choose Starting Mode + Select Platform** - Load from `assets/topics/developing/` or start fresh; determine target platform upfront
2. **Search References + Benchmarks + Techniques** - Find styles, patterns, viral cases, and writing methodologies from `references/techniques/`
3. **Collect & Clarify** - Interactive questioning (Modes 1 & 2), apply selected techniques
4. **Element-Level Reference** - Title (via title-generator), opening, structure, with technique cross-reference
5. **Process Draft** - Mode 3 only, apply techniques throughout body
6. **Polish** - Using content-research-writer with technique-aware instructions
7. **Generate Illustrations** - Using baoyu-xhs-images skill
8. **Create Final Article** - Combine content + images
9. **Review + Platform Adaptation** - Review, optional multi-platform adaptation via content-adapter
10. **Publish** - Optional, to WeChat or X

**Experience System** (skills/experience-tracker.md) — learns from corrections:
- Auto-records when user corrects AI output (enforced via Experience Checkpoints after every interactive step)
- Progress tracker logs all corrections in a Corrections Log table
- Distills lessons → all skills check before executing

## Key Patterns

### Adding to Reference Library

**For cases (by-element/):**
Each entry follows: Original → Source → Analysis → Pattern

**For methodologies (techniques/psychology/):**
Each entry follows: Core Framework → Psychology Mechanism → Why It Works → Application Scenarios → Practice Guide → Case Study

### File Naming Convention

All output files are stored under `outputs/{topic-slug}/`:

- Progress tracker: `outputs/{topic-slug}/{topic-slug}-progress.md`
- Initial draft: `outputs/{topic-slug}/{topic-slug}.md`
- Polished: `outputs/{topic-slug}/{topic-slug}-polished.md`
- Final: `outputs/{topic-slug}/{topic-slug}-final.md`
- Platform adaptation: `outputs/{topic-slug}/{topic-slug}-{platform}.md`
- Metrics: `outputs/{topic-slug}/metrics.md`
- Illustrations: `outputs/{topic-slug}/xhs-images/`

## Language

Project documentation is bilingual (English + Chinese). README.md is English, README.zh-CN.md is Chinese. Reference library content is primarily in Chinese with English annotations.
