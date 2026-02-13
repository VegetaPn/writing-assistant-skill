# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Writing Assistant Skill** - a Claude Code skill that orchestrates end-to-end writing workflows from ideation to publication. The skill transforms ideas, materials, or rough drafts into polished, illustrated articles.

## Architecture

### Core Files

- `SKILL.md` - Main writing workflow (the "brain" — focuses on writing, from draft to publish)

### Sub-Skills (`skills/`)

Project-local skills, no installation needed. Directly readable by the main workflow.

- `skills/title-generator.md` - Platform-optimized title generation (小红书/公众号/抖音), anti-AI-flavor rules, title type distribution
- `skills/topic-manager.md` - Topic lifecycle (inbox → developing) + viral benchmarking (分析爆款/监控爆款/后台监控)
- `skills/experience-tracker.md` - Auto-records user corrections as cases, distills lessons learned

### Content Assets (`assets/`)

User-owned data that grows over time.

```
assets/
├── topics/                       # Topic management + viral benchmarks
│   ├── inbox.md                  # Idea capture (append-only)
│   ├── developing/               # Researched topics ready to write
│   └── benchmarks/               # Viral content analyses
│       ├── benchmarks-index.md   # Quick-lookup index
│       └── monitor-config.md     # Background monitoring config
│
└── experiences/                  # Experience/case library
    ├── cases/                    # Individual correction records
    └── lessons.md                # Distilled rules from cases
```

### Reference Library System (`references/`)

The reference library is the core innovation - a structured knowledge base that reduces "AI-flavored" writing by providing style guidance and proven patterns.

**Three organizational approaches:**

```
references/
├── authors/{name}/           # By author: profile.md + articles/
├── by-element/               # By writing element (case-driven)
│   ├── titles/titles-index.md
│   ├── openings/openings-index.md
│   ├── structures/structure-templates.md
│   └── hooks/hook-examples.md
└── techniques/               # By methodology (principle-driven)
    └── psychology/psychology-index.md
```

**Key distinction:**
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
9. **Review + Platform Adaptation** - Review, optional multi-platform adaptation with technique re-application
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

- Progress tracker: `{topic}-progress.md`
- Initial draft: `{topic}.md`
- Polished: `{topic}-polished.md`
- Final: `{topic}-final.md`
- Platform adaptation: `{topic}-{platform}.md`

## Language

Project documentation is bilingual (English + Chinese). README.md is English, README.zh-CN.md is Chinese. Reference library content is primarily in Chinese with English annotations.
