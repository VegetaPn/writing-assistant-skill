# Writing Assistant Skill

English | [简体中文](README.zh-CN.md)

A Claude Code skill that orchestrates end-to-end writing workflows — from idea to polished, illustrated, published article. Built-in topic management, viral benchmarking, experience tracking, and multi-platform publishing.

**Two ways to use it:**
- **CLI** — install as a Claude Code skill and interact via terminal
- **Desktop App** — full GUI with visual workflow, topic kanban, trend dashboard, and background monitoring (see [`gui/`](gui/))

## Quick Start

### Option A: CLI Skill

Ask Claude Code:

```
Install the writing-assistant skill from https://github.com/VegetaPn/writing-assistant-skill to my project directory
```

<details>
<summary>Manual installation</summary>

```bash
curl -L https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip -o writing-assistant-skill.zip
mkdir -p .claude/skills
unzip writing-assistant-skill.zip -d .claude/skills/
mv .claude/skills/writing-assistant-skill-main .claude/skills/writing-assistant
rm writing-assistant-skill.zip
```

</details>

### Use

```
/writing-assistant
```

Or just talk to Claude:

```
I want to write an article about the attention economy, for Xiaohongshu
```

That's it. The skill walks you through the entire process interactively.

### Option B: Desktop App

Requires Node.js >= 18 and Claude Code CLI installed.

```bash
cd gui
npm install
npm run build
npm start
```

The app provides the same writing workflow through a visual interface — with a step-by-step writing studio, topic kanban board, trend monitoring dashboard, reference library browser, and more. See [`gui/README.md`](gui/README.md) for details.

## What It Does

### Writing Workflow (11 steps, fully guided)

| Phase | What happens |
|-------|-------------|
| **Prep** | Environment check, progress tracker, platform selection |
| **Research** | Search reference library, analyze platform trends, select writing techniques |
| **Draft** | Interactive Q&A to clarify intent → structured draft with technique application |
| **Refine** | Element-level optimization (title, opening, structure, hooks) |
| **Polish** | Professional content refinement via content-research-writer |
| **Illustrate** | Auto-generate images via baoyu-xhs-images + generate-image |
| **Publish** | Review → platform adaptation → publish to WeChat / Xiaohongshu / X |

Three starting modes: **topic idea**, **raw materials**, or **existing draft**.

### Topic Management

| Command | What it does |
|---------|-------------|
| "Record a topic: {idea}" | Save an idea to inbox |
| "Show topics" | View topic pipeline |
| "Develop topic: {topic}" | Research topic with benchmarks + outline |

### Viral Benchmarking

| Command | What it does |
|---------|-------------|
| "Analyze viral post" + URL | Deep-analyze a viral piece |
| "Monitor trends" / "Show trends" | Scan trending content across platforms |
| "Start trend monitoring" | Start background monitoring |

### Title Generation

| Command | What it does |
|---------|-------------|
| "Generate titles" | Generate platform-optimized title candidates |

### Experience System

| Command | What it does |
|---------|-------------|
| "Show experience" | View lessons and recent cases |
| "Summarize experience" | Re-distill rules from all cases |

## Key Features

**Content Creation**
- Multi-mode input: topic idea / raw materials / existing draft
- Interactive clarification — asks smart questions, not generic templates
- Psychology-based writing techniques (content funnel, emotional hooks) applied throughout
- Platform-aware from the start — length, tone, and structure adapt to target platform

**Reference & Learning System**
- Three-level content hierarchy (system → user → project) with automatic merging
- Reference library: author styles, title patterns, opening techniques, structure templates
- Viral benchmarking: analyze hits, extract patterns, grow your library organically
- Experience tracking: auto-records corrections, distills lessons, prevents repeated mistakes

**Production Pipeline**
- Professional polishing via content-research-writer skill
- Auto-generated illustrations via baoyu-xhs-images + generate-image
- Per-session progress tracker with step-by-step checklists
- Multi-platform publishing: WeChat Official Account, Xiaohongshu, X/Twitter
- One article → multiple platform adaptations with per-platform optimization

## Configuration

### Image Generation (Optional)

To generate actual images (not just descriptions), set up an OPENROUTER API key:

1. Get a key from [OpenRouter](https://openrouter.ai/)
2. Add to `.env` in your project root:
   ```
   OPENROUTER_API_KEY=your_key_here
   ```
3. Add `.env` to `.gitignore`

Without this, the workflow still works — Step 7 will produce image descriptions that you can create manually.

## Dependencies

All dependencies are **bundled in the repository** and auto-installed on first run:

| Skill | Purpose |
|-------|---------|
| content-research-writer | Content polishing |
| baoyu-xhs-images | Illustration generation |
| generate-image | AI image generation (needs OPENROUTER API) |
| xiaohongshu-mcp | Xiaohongshu search & publish |
| wechat-article-search | WeChat article search |
| baoyu-post-to-wechat | WeChat publishing |
| baoyu-post-to-x | X/Twitter publishing |

<details>
<summary>Manual dependency installation</summary>

```bash
mkdir -p .claude/skills
cp -r dependencies/<skill-name> .claude/skills/
```

</details>

## Architecture

<details>
<summary>File structure</summary>

```
writing-assistant-skill/
├── SKILL.md                       # Main workflow orchestrator
├── skills/                        # Sub-skills (project-local)
│   ├── title-generator.md         # Platform-optimized titles
│   ├── content-adapter.md         # Multi-platform adaptation
│   ├── topic-manager.md           # Topic lifecycle + benchmarking
│   └── experience-tracker.md      # Correction tracking + lessons
├── assets/                        # System-level defaults
├── references/                    # System-level reference library
│   ├── authors/                   # Author profiles & styles
│   ├── by-element/                # Writing elements (cases)
│   └── techniques/                # Methodologies (principles)
├── dependencies/                  # Bundled dependency skills
├── gui/                           # Desktop app (Electron + React)
│   ├── src/main/                  # Electron main process
│   ├── src/renderer/              # React UI
│   └── src/shared/                # Shared types
└── outputs/                       # Generated articles
```

</details>

<details>
<summary>Three-level content system</summary>

Assets and references use a three-level hierarchy. Content merges on read; lower levels override higher on conflict.

| Level | Location | Purpose |
|-------|----------|---------|
| **System** | `{skill-dir}/assets/`, `{skill-dir}/references/` | Skill defaults (read-only) |
| **User** | `{project-root}/assets/`, `{project-root}/references/` | Your accumulated knowledge |
| **Project** | `outputs/{topic-slug}/assets/`, `outputs/{topic-slug}/references/` | Per-article overrides |

</details>

<details>
<summary>Output directory</summary>

```
outputs/{topic-slug}/
├── {topic-slug}-progress.md      # Progress tracker
├── {topic-slug}.md               # Initial draft
├── {topic-slug}-polished.md      # Polished version
├── {topic-slug}-final.md         # Final version
├── {topic-slug}-{platform}.md    # Platform adaptation
└── xhs-images/                   # Illustrations
```

</details>

## Contributing

Contributions, issues, and feature requests are welcome at the [issues page](https://github.com/VegetaPn/writing-assistant-skill/issues).

## License

MIT License

## Author

[VegetaPn](https://github.com/VegetaPn)

## Changelog

### 2.0.0 (2026-02-17)

Architecture overhaul — from linear writing tool to sustainable content creation system.

- Sub-skill architecture (title-generator, topic-manager, experience-tracker)
- Three-level content system with merge protocol
- Topic management: inbox → developing → writing workflow
- Viral benchmarking: single analysis, batch scanning, background monitoring
- Experience tracking: auto-detect corrections → cases → distilled lessons
- Writing methodology integration (psychology-based techniques)
- Real-time platform search before writing
- Multi-platform adaptation
- Progress tracker with execution log and retrospective

### 1.2.0 (2026-02-04)

- Reference library system (author profiles, writing elements, techniques)
- Element-level refinement (titles, openings, structures, hooks)

### 1.1.0 (2026-01-31)

- Bundled dependencies with auto-installation
- Image generation support (OPENROUTER)

### 1.0.0

- Initial release: three starting modes, content polishing, image generation, WeChat/X publishing
