---
name: experience-tracker
description: Records user corrections as cases and distills lessons learned. Auto-triggers when user corrects AI output. Use when users say "记录经验", "看经验", or "总结经验".
---

# Experience Tracker

记录用户纠正和反馈，形成经验库 (Case Library)，持续从中总结、提炼经验。核心理念：同样的错误不犯第二次。

> **Three-Level Protocol:** 经验记录主要在 user-level。读取使用 `READ:3L`（合并 system/user/project 三层）。写入分两种：
> - **通用经验** → `WRITE:user`（适用于所有文章）
> - **文章特定经验** → `WRITE:project`（仅适用于当前文章，存入 `outputs/{topic-slug}/assets/experiences/`）
> 记录经验后，询问用户："这条经验是通用的还是仅针对本文？" 据此决定写入层级。
> 详见 `references/three-level-protocol.md`。

## When to Use

- **自动触发**: 当检测到用户在纠正 AI 的输出时（如"不是这样"、"太 AI 了"、"爹味"、"不对"、"应该是..."、"别这样"、直接改写 AI 的结果等）
- **复盘触发**: 流程结束时的复盘（流程自检 + 复盘）发现的执行问题（流程遗漏、技巧脱节、质量问题等）
- "记录经验" — 手动触发记录一条经验
- "看经验" / "经验库" — 查看已积累的经验
- "总结经验" — 从所有 cases 中提炼规则，更新 lessons.md

## Directory Structure

```
assets/experiences/
├── cases/                      # 个案记录：每次纠正一个文件
│   └── {YYYY-MM-DD}-{slug}.md  # 单次纠正的完整上下文
└── lessons.md                  # 从 cases 中提炼的经验总结
```

## Initialize Workspace

Before executing any command, ensure required directories and files exist. Create any that are missing; never overwrite existing files.

---

## Commands

### 1. 记录经验

**Trigger:** 自动检测到用户纠正，或用户说 "记录经验"

**Detection signals (自动触发信号):**
- 用户直接否定: "不是这样"、"不对"、"错了"
- 用户指出风格问题: "太 AI 了"、"爹味"、"太正式了"、"不自然"
- 用户给出正确示范: "应该是..."、"改成..."、"我要的是..."
- 用户表达不满: "别这样写"、"这不是我想要的"
- 用户直接改写了 AI 的输出（而非接受）

**复盘触发信号:**
- 流程复盘中发现的执行问题（Execution Log 审阅）
- 问题类型：流程遗漏、参考未用、技巧脱节、工具问题、质量问题、效率问题
- Case 的 `Skill/Step` 字段标注"流程复盘"，`Root Cause` 使用对应的问题类型

**Action:**
1. When a correction is detected, create `assets/experiences/cases/{YYYY-MM-DD}-{slug}.md` (`WRITE:user`):

```markdown
# Case: {brief description}

**Date:** YYYY-MM-DD
**Skill/Step:** {which skill or workflow step was being executed}

## Context
{what the user was trying to do}

## AI Output
{what AI produced (brief excerpt)}

## User Correction
{what the user said / how they corrected it}

## Root Cause
{why the error happened — classify as one of:}
- 误解需求: AI misunderstood what user wanted
- 错误方法: AI used wrong approach
- 过度修改: AI changed too much
- AI 味: output sounded artificial
- 风格偏差: didn't match user's voice/style
- 流程遗漏: step or sub-step was improperly skipped (from retrospective)
- 参考未用: available reference not used (from retrospective)
- 技巧脱节: selected technique not applied in practice (from retrospective)
- 工具问题: dependency unavailable or command failed (from retrospective)
- 效率问题: redundant operations or context loss (from retrospective)
- 其他: {describe}

## Lesson
{one sentence takeaway — what to do differently next time}
```

2. Confirm to user: "已记录这条经验。"
3. If this is a repeated pattern (similar to existing cases), mention: "这和之前的 [case] 类似，建议运行'总结经验'来更新经验规则。"

### 2. 看经验

**Trigger:** "看经验" / "经验库"

**Action:**
1. Show `assets/experiences/lessons.md` content (`READ:3L`, merge all levels)
2. Show recent cases from `assets/experiences/cases/` (`READ:user`)
3. Show stats: "共 N 条经验案例，已提炼 M 条规则"

### 3. 总结经验

**Trigger:**
- 手动: "总结经验"
- **自动**: 每记录 5 条新 case 后自动触发一次总结

**Action:**
1. Read all files in `assets/experiences/cases/` (`READ:user`)
2. Group by Root Cause category
3. Identify patterns:
   - Recurring corrections (same lesson appearing multiple times)
   - New lessons not yet in `lessons.md`
   - Trends (e.g., most corrections are about AI味)
4. Update `assets/experiences/lessons.md` (`WRITE:user`) with distilled rules, organized by category:

```markdown
# Lessons Learned

## 标题相关
- {lesson} (来源: cases/{file1}.md, cases/{file2}.md)

## 风格相关
- {lesson}

## 内容结构相关
- {lesson}

## 流程相关
- {lesson}
```

5. Each lesson should reference its source case(s)
6. Present the update to user for confirmation before saving

---

## With Other Skills

All skills should check `assets/experiences/lessons.md` (`READ:3L`) at the start of their workflow:

- **title-generator** → Step 0: Check title-related lessons before generating
- **topic-manager** → "深化选题": Check lessons before research and outline
- **writing-assistant** → Each step: Check relevant lessons before executing
- **writing-assistant** → 流程复盘: Review Execution Log, create cases for process issues found

This creates two feedback loops:
```
Loop 1 (real-time): AI produces output → User corrects → Case recorded → Lessons distilled → Skills check lessons → Better output
Loop 2 (retrospective): AI executes workflow → Execution Log recorded → Retrospective reviews log → Process issues found → Cases recorded → Lessons distilled → Better execution
```
