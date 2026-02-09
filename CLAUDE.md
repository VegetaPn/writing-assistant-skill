# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Writing Assistant Skill** - a Claude Code skill that orchestrates end-to-end writing workflows from ideation to publication. The skill transforms ideas, materials, or rough drafts into polished, illustrated articles.

## Architecture

### Core Files

- `SKILL.md` - Main skill definition with 8-step workflow (the "brain" of this system)
- `writing-assistant.skill` - Packaged skill file for distribution

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
- `generate-image` - Actual image generation (optional, needs OPENROUTER API)
- `baoyu-post-to-wechat` - WeChat publishing (optional)
- `baoyu-post-to-x` - X/Twitter publishing (optional)

### Development (`dev/`)

- `iteration-plan.md` - Project roadmap and design decisions
- `dev_reference_materials/` - Source materials for reference library

## Workflow (8 Steps)

1. **Choose Mode** - Topic/Materials/Draft
2. **Search References** - Find relevant author styles and cases
3. **Collect & Clarify** - Interactive questioning (Modes 1 & 2)
4. **Element-Level Reference** - Title, opening, structure suggestions from library
5. **Process Draft** - Mode 3 only
6. **Polish** - Using content-research-writer skill
7. **Generate Illustrations** - Using baoyu-xhs-images skill
8. **Create Final & Publish** - Combine content + images, optional publish

## Key Patterns

### Adding to Reference Library

**For cases (by-element/):**
Each entry follows: Original → Source → Analysis → Pattern

**For methodologies (techniques/psychology/):**
Each entry follows: Core Framework → Psychology Mechanism → Why It Works → Application Scenarios → Practice Guide → Case Study

### File Naming Convention

- Initial draft: `{topic}.md`
- Polished: `{topic}-polished.md`
- Final: `{topic}-final.md`

## Language

Project documentation is bilingual (English + Chinese). README.md is English, README.zh-CN.md is Chinese. Reference library content is primarily in Chinese with English annotations.
