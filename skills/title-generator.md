---
name: title-generator
description: Generate platform-optimized titles for Chinese social media (小红书/公众号/抖音/X). Applies platform rules, title type distribution, and anti-AI-flavor guidelines. Use when users say "生成标题", "帮我起标题", or "优化标题".
---

# Title Generator

Generate platform-optimized titles for Chinese social media content. Independently callable — does not require the full writing-assistant workflow.

> **Three-Level Protocol:** This skill follows the three-level reference system (system / user / project). All `assets/` and `references/` reads use `READ:3L` — check system, user, and project levels, merge content. See SKILL.md "Three-Level Reference System" for details.

## When to Use

- User says "生成标题" / "帮我起标题" / "优化标题"
- User asks for title suggestions for a specific platform
- Called by `writing-assistant` (Step 4) or `topic-manager` (深化选题)

## Workflow

### Step 0: Check Experience Library

Before generating, read `assets/experiences/lessons.md` (`READ:3L`) if it exists. Note any title-related lessons and apply them throughout this workflow.

### Step 1: Understand the Content

Read the provided article, topic, or materials. Extract:
- Key data points (numbers, percentages, timelines)
- People or brands mentioned
- Core cognitive conflict or insight
- Memorable quotes or phrases
- Target audience pain points

### Step 2: Determine Platform

Ask the user which platform, or infer from context. Apply the corresponding rules from the Platform Rules section below.

### Step 3: Search References

Before generating, check available references for inspiration (`READ:3L` for all):
1. `references/by-element/titles/` — existing title patterns and analysis
2. `assets/topics/benchmarks/` — proven viral title patterns from benchmark analyses
3. `references/authors/` — author-specific title style (if user chose a style reference)

Note any relevant patterns found for use in generation.

### Step 4: Generate 5 Candidate Titles

Each title must use a **different type** from the Title Type Distribution. For each title, output:

```
[N]. [标题文字]
    类型: [type name]
    张力要素: [which tension elements used]
    字数: [count]
    逻辑: [one sentence explaining why this title works]
```

### Step 5: Validate Each Title

Run every candidate through this checklist:

- [ ] Character count within platform limit
- [ ] Contains suspense — does NOT give away the answer
- [ ] Tension elements ≥ 2 (对比/数字/悬念/冲突)
- [ ] No banned AI-flavor words or patterns (see Anti-AI Rules below)
- [ ] At least 3 different title types across the 5 candidates
- [ ] No more than 2 titles of the same type

Replace any title that fails validation.

### Step 6: Present to User

Show all 5 titles with their analysis. If reference patterns were found in Step 3, mention: "标题 N 参考了 [source] 的 [pattern name] 模式".

Ask user to pick one, combine elements, or request more options.

---

## Platform Rules

### 小红书
- **字数**: ≤ 20字（含标点和 emoji）
- **悬念**: 必须留悬念，不给答案
- **张力**: 对比/数字/悬念/冲突，至少 2 项
- **范围**: 话题范围广，避免缩窄词（"自媒体"、"知识付费"、"个人IP"）
- **emoji**: 可选，不超过 2 个，不计入字数

### 公众号
- **字数**: ≤ 30字
- **风格**: 可以更完整、更有深度
- **副标题**: 允许使用副标题补充信息
- **适合**: 深度思辨、系列文章、观点输出

### 抖音
- **字数**: ≤ 15字（更短更冲击）
- **前 5 字**: 必须直接抓住注意力
- **风格**: 口语化、情绪化、短句

### X/Twitter
- **中文**: ≤ 50字
- **英文**: ≤ 100 characters
- **风格**: 配合 thread 开头，简洁有力

---

## Title Type Distribution

When generating 5 titles, distribute across types. At least 3 different types, no more than 2 of any single type.

| 类型 | 目标比例 | 核心机制 | 示例 |
|------|---------|---------|------|
| 数据+发现型 | 20-30% | 数据制造可信度和冲击力 | 我用这个方法，一年涨粉 70 万 |
| 认知冲突型 | 20-30% | 挑战常识，制造"不可能"的感觉 | 为什么学了那么多还是不赚钱 |
| 金句型 | 15-25% | 精炼表达，一句话说透本质 | 说白了就一句话 |
| 对比型 | 10-20% | 两个事物的差距制造张力 | 月薪 3 千和 3 万的人，差在这一点 |
| 提问式 | 10-20% | 引发好奇，驱动点击 | 你有没有想过，为什么越努力越穷 |

**注意**: 提问式不要超过 30%。如果生成 5 个标题，最多 1 个提问式。

---

## Anti-AI Rules (去 AI 味 / 去爹味)

### Banned Words (禁用词)

以下词语/短语一律不得出现在标题中：

> 综上所述、在当今社会、不可否认、值得注意的是、让我们来看看、
> 全面解析、深度剖析、系统性思维、可持续增长、赋能、
> 底层逻辑（除非反讽使用）、认知升级、破局、颠覆式创新

### Banned Patterns (禁用句式)

- "建议您..." / "您可以..."（用"你"，且不要说教）
- "通过以下 N 个步骤..."
- "如何通过 X 实现 Y"（太模板化）
- "[身份] 必读：如何..."（爹味经典结构）

### Contrast Examples (对照案例)

| ❌ AI 味 | ✅ 人味 | 问题出在哪 |
|---------|--------|-----------|
| 创业者必读：如何通过系统化思维提升商业认知，实现可持续增长 | 为什么学了那么多还是不赚钱 | 说教感、堆砌术语、不留悬念 |
| 通过以下三个步骤，您可以有效提升内容质量 | 90% 的人在第一步就错了 | 教科书句式、用"您"、给了答案 |
| 建议您采用数据驱动的方法进行选题 | 我用这个方法，一年涨粉 70 万 | 说教、抽象、没有具体画面 |
| 深入解析自媒体创业的核心方法论 | 做了三年自媒体，我只后悔一件事 | 缩窄词+术语堆砌 vs 个人故事+悬念 |

### Core Principle

**像个人说话，不像教科书。** 标题要让人想点进来，不是让人觉得"又是 AI 写的"。

好标题的特征：
- 有具体画面（数字、时间、人）
- 有情绪（好奇、焦虑、共鸣、惊讶）
- 有缺口（说了一半，不说另一半）
- 像朋友聊天时会说的话