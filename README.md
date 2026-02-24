# Writing Assistant Skill

English | [简体中文](README.zh-CN.md)

A Claude Code skill that orchestrates end-to-end writing workflows — from idea to polished, illustrated, published article. Built-in topic management, viral benchmarking, experience tracking, multi-platform publishing, **autonomous mode** for fully hands-off execution, and **scheduled tasks** for automated recurring workflows.

## Quick Start

### Install

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

#### Autonomous Mode

Want to walk away and come back to a finished article? Just say:

```
Autonomous mode, write an article about the attention economy for Xiaohongshu
```

The AI runs the entire workflow start-to-finish — no interaction needed. It makes every decision autonomously, logs everything, and only stops when a strict Completion Gate checklist is fully satisfied.

More examples:

```
全自动写一篇公众号文章，主题是注意力经济，写完发到公众号
Write three XHS articles on different angles of AI productivity
自主模式，把 inbox 里的选题都写了
```

## What It Does

### Writing Workflow (11 steps, fully guided or fully autonomous)

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

Two execution modes: **interactive** (default, step-by-step with user) or **autonomous** (fully hands-off).

### Scheduled Tasks

| Command | What it does |
|---------|-------------|
| "Every day at 9am, monitor trends" | Create a recurring cron task |
| "First monitor trends, then develop topics" | Create a multi-step pipeline |
| "Show scheduled tasks" | View all scheduled tasks |
| "Execution history" | View past execution logs |
| "Pause schedule cron-001" | Pause a scheduled task |
| "Resume schedule cron-001" | Resume a paused task |
| "Delete schedule cron-001" | Remove a scheduled task |

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

**Autonomous Mode (New in 2.1)**
- Send one instruction, walk away, come back to a finished article
- AI makes all decisions autonomously — platform, title, structure, style — and logs every choice
- Failure-resilient: tool failures are recorded and skipped, never blocking the workflow
- Stuck detection: auto-detects and escapes hung operations
- Completion Gate: strict 7-point checklist (G1-G7) that must ALL pass before stopping — guarantees nothing is left unfinished
- Supports batch execution: "write all topics in inbox", "write 3 articles", etc.
- Full transparency: Autonomous Decision Log + execution summary for post-hoc review
- Images skipped by default in autonomous mode (opt-in with explicit request)

**Scheduled Tasks (New in 2.2)**
- Natural language driven: "every day at 9am monitor trends" → crontab entry
- Two task forms: **single task** (one cron trigger → one execution) and **pipeline** (one cron trigger → serial multi-step execution with shared context)
- Pipeline context awareness: each step reads a `pipeline-context.md` with the overall goal and completed step outputs, enabling natural context flow between steps
- Full lifecycle management: create, view, pause, resume, modify, delete
- Execution history with live logs, step-by-step output, and system notifications
- Concurrency control via lock files — prevents overlapping executions
- End conditions: unlimited, count-limited (`count:N`), or date-limited (`until:YYYY-MM-DD`)
- One-time tasks auto-cleanup after execution
- Runs via `claude CLI` with `--dangerously-skip-permissions` for unattended execution

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
| xiaohongshu | Xiaohongshu content creation, search & publish |
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
│   ├── experience-tracker.md      # Correction tracking + lessons
│   └── scheduler.md               # Scheduled task management
├── scripts/                       # Automation scripts
│   ├── check-env.sh               # Environment pre-check
│   ├── cron-runner.sh             # Task execution engine
│   ├── install-schedule.sh        # Register crontab entries
│   └── uninstall-schedule.sh      # Remove crontab entries
├── schedules/                     # Scheduled task data
│   ├── schedule-registry.md       # Task registry
│   ├── tasks/                     # Task definition files
│   └── history/                   # Execution history per task
├── assets/                        # System-level defaults
├── references/                    # System-level reference library
│   ├── authors/                   # Author profiles & styles
│   ├── by-element/                # Writing elements (cases)
│   └── techniques/                # Methodologies (principles)
├── dependencies/                  # Bundled dependency skills
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

### 2.2.0 (2026-02-24)

Scheduled Tasks — automate recurring workflows with natural language cron scheduling.

- Scheduler sub-skill: natural language driven task scheduling ("every day at 9am monitor trends" → crontab)
- Two task forms: single task and multi-step pipeline with shared context
- Pipeline context awareness: `pipeline-context.md` passes goal, step summaries, and outputs between steps
- Full lifecycle: create, view, pause, resume, modify, delete scheduled tasks
- Execution engine (`cron-runner.sh`): handles validation, locking, timeout, stream processing, and history recording
- Live execution logs with real-time tool call tracking
- Heartbeat notifications for long-running tasks
- Concurrency control via lock files — prevents overlapping runs
- End conditions: unlimited, count-limited, or date-limited with auto-cleanup
- One-time tasks auto-remove from crontab after execution
- System notifications (macOS/Linux) on task completion or failure
- Execution history: per-run output files, pipeline summaries, and step-level detail

### 2.1.0 (2026-02-22)

Autonomous Mode — send one instruction, walk away, come back to a finished article.

- Autonomous mode: fully hands-off execution from idea to final article
- Natural language completion conditions ("write 3 articles", "write all inbox topics", etc.)
- Completion Gate: mandatory 7-point checklist (G1-G7) enforced before stopping
- Autonomous Decision Log: every AI decision recorded with reasoning and alternatives
- Failure-resilient execution: tool failures logged and skipped, never blocking
- Stuck detection: auto-escapes hung operations with fallback strategies
- Autonomous capability boundary: auto-skips operations requiring user participation (login, scan, etc.)
- Images skipped by default in autonomous mode for speed (opt-in)
- Batch execution: multiple articles with independent progress trackers and cross-article learning
- Execution summary: structured post-hoc report with key decisions, outputs, failures, and review recommendations

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
