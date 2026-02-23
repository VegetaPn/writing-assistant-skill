---
name: title-generator
description: Generate platform-optimized titles for Chinese social media (小红书/公众号/抖音/X). Uses dual-axis system (Structure × Mechanism) with 4-factor validation. Use when users say "生成标题", "帮我起标题", or "优化标题".
---

# Title Generator

Generate platform-optimized titles for Chinese social media content. Independently callable — does not require the full writing-assistant workflow.

> **Three-Level Protocol:** This skill follows the three-level reference system (system / user / project). All `assets/` and `references/` reads use `READ:3L` — check system, user, and project levels, merge content. See `references/three-level-protocol.md` for details.

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
1. `references/by-element/titles/` — existing title patterns and analysis (incl. dontbesilent 153 条标题双轴分类)
2. `assets/topics/benchmarks/` — proven viral title patterns from benchmark analyses
3. `references/authors/` — author-specific title style (if user chose a style reference)
4. `references/techniques/psychology/` — relevant psychological mechanisms for title design
5. `references/techniques/hooks/` — 4-factor scoring system and hook hierarchy

Note any relevant patterns found for use in generation.

### Step 4: Generate 5 Candidate Titles

Each title is defined by two axes: **Structure (句式结构)** and **Mechanism (心理机制)**. See the Dual-Axis Title System section below for definitions.

For each title, output:

```
[N]. [标题文字]
    结构: [structure name]
    机制: [mechanism name(s), comma-separated]
    底层 Factor: [corresponding 4-factor(s)]
    字数: [count]
    逻辑: [one sentence explaining why this title works]
```

**Coverage constraint**: 5 titles must collectively cover **≥3 different structures** AND **≥3 different mechanisms**. No more than 2 titles may share the same structure. 提问式结构不超过 1 个。

### Step 5: Validate Each Title

Run every candidate through this checklist:

- [ ] Character count within platform limit
- [ ] Contains suspense — does NOT give away the answer
- [ ] Tension elements ≥ 2 (对比/数字/悬念/冲突)
- [ ] No banned AI-flavor words or patterns (see Anti-AI Rules below)
- [ ] At least 3 different structures across the 5 candidates
- [ ] At least 3 different mechanisms across the 5 candidates
- [ ] No more than 2 titles of the same structure
- [ ] 提问式结构不超过 1 个

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

## Dual-Axis Title System

### Axis 1: Structure (句式结构)

每个标题都有一个句式结构。5 种结构如下：

| 结构 | 定义 | 核心特征 | 示例 |
|------|------|---------|------|
| 陈述/宣言 | 直接断言，大胆宣称 | 第一句就给出观点，不解释不铺垫 | 副业思维锁死了一个人的财富上限 / 所有教你先做内容再变现的人都是耍流氓 |
| 等式/公式 | A = B 或 A 不是 B 而是 C | 用等号或否定重新定义概念 | 内耗 = 心理资本匮乏 / AI 不是新范式，是 1960s 分工模式的低成本实现 |
| 叙事/事件钩子 | 个人经历或具体事件开场 | 有"我"、有时间、有场景 | 出版社让我出书，我说今年戒掉了读书 / 卖了几百万货我发现：人买的不是货，是幻想 |
| 对比/并列 | 两个事物并置，制造反差 | 前后两半句形成张力 | 像素级复制，年入百万。搬运抄袭，颗粒无收 / 成本 ¥17 我卖 ¥18，同行卖 ¥3.9 |
| 提问 | 问句形式 | 以？结尾，引发好奇 | 为什么每次都那么凑巧错过发财的机会？ |

### Axis 2: Mechanism (心理机制)

每个标题至少运用一种心理机制，可以叠加。7 种机制如下（标注底层 4-Factor，详见 `references/techniques/hooks/4-factor-scoring.md`）：

| 机制 | 底层 Factor | 定义 | 示例 |
|------|------------|------|------|
| 反常识 | 破坏预测 | 挑战读者的默认假设 | 一个人赚不到钱的核心原因就是：上班上多了 |
| 信息缺口 | 奖励 | 说了一半，扣住另一半 | 去年涨粉 70 万后，我所有方法压缩成了一句话 |
| 根因揭示 | 破坏预测 | "真正的原因是..." | 赚不到钱的根源，是对商业信息的过度简化 |
| 社会证明 | 奖励 | 个人成就或数据背书 | 连续 8 个月每天涨粉 1 千，我是如何做到的 |
| 时间压缩 | 奖励 | 短时间 → 高回报感 | 3 个月，我设计出了一种不内耗的赚钱方式 |
| 情绪共鸣 | 损失厌恶 | 直接击中读者情绪 | 人在没钱的时候，唯一的翻身机会就是愤怒 |
| 命名 | 命名 | 给模糊感受一个精确名字 | 不相信自己能赚到钱，是一种习得性无助 |

### Generation Constraint

生成 5 个标题时：
- 覆盖 **≥3 种不同结构** + **≥3 种不同机制**
- 同一结构不超过 2 个标题
- 提问式结构不超过 1 个
- 每个标题的机制可以叠加（如 反常识 + 社会证明）

### 高频组合参考

根据 dontbesilent 153 条标题统计（详见 `references/by-element/titles/dontbesilent-collection.md`）：

| 组合 | 效果 | 示例 |
|------|------|------|
| 陈述 × 反常识 | 一句话颠覆认知，冲击力最强 | 副业思维锁死了一个人的财富上限 |
| 叙事 × 社会证明 + 信息缺口 | 用经验建立信任，用悬念驱动点击 | 去年涨粉 70 万后，我所有方法压缩成了一句话 |
| 陈述 × 反常识 + 根因揭示 | 冒号分割法：前半句设局，后半句颠覆 | 一个人赚不到钱的核心原因就是：上班上多了 |
| 等式 × 命名 + 反常识 | 重新定义概念，给出"真相" | 打工思维 = 对任何事都一头雾水的大脑 |
| 对比 × 反常识 | 两个反差制造双重冲击 | 像素级复制，年入百万。搬运抄袭，颗粒无收 |

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

### Title-Specific Anti-AI Patterns

以下标题模式虽然不含禁用词，但仍然散发 AI 味，必须避免：

| ❌ AI 味标题模式 | 问题 | ✅ 改法 |
|----------------|------|---------|
| "如何通过 X 实现 Y 的 Z 增长" | 三层嵌套、公式化 | 拆开，只说一半 |
| "N 个 [名词] 帮你 [动词] [目标]" | 太工整、无情绪 | 用个人经历引入 |
| "[群体] 必看：[宏大命题]" | 爹味+泛化 | 缩小到具体场景 |
| "深度解读 [热点事件] 的 [N] 个启示" | 总结体、教科书感 | 用一个反常识切入 |

### 人味检验法

生成标题后，用以下 3 秒测试：
1. **朋友圈测试**：这句话发在朋友圈，像人说的还是像推文模板？
2. **饭桌测试**：吃饭时你会这样跟朋友说吗？
3. **停顿测试**：读完后你会不会"嗯？"一下？如果不会，标题缺乏张力。

---

## Techniques Reference (标题技巧速查)

以下技巧从 dontbesilent 的标题中提炼。生成标题时可选择性运用。详见 `references/authors/dontbesilent/profile.md`。

### 技巧 1: 冒号分割法
前半句设局（场景/经历/数据），冒号后颠覆或揭示。
- 例：一个人赚不到钱的核心原因就是：上班上多了
- 适合结构：陈述/宣言、叙事/事件钩子
- 适合机制：根因揭示、反常识

### 技巧 2: 经验牌开局
以"我 + 数据/时间 + 发现/之后"开头，先建立信任再抛观点。
- 例：卖了几百万货我发现：人买的不是货，是幻想
- 适合结构：叙事/事件钩子
- 适合机制：社会证明 + 信息缺口

### 技巧 3: 反定义法
"X 不是 Y，是/而是 Z" —— 否定常识定义，给出新定义。
- 例：AI 不是新范式，是 1960s 分工模式的低成本实现
- 适合结构：等式/公式
- 适合机制：反常识

### 技巧 4: 对仗反差
前后两个短句，结构对称，含义反转。
- 例：像素级复制，年入百万。搬运抄袭，颗粒无收
- 适合结构：对比/并列
- 适合机制：反常识

### 技巧 5: 时间+成果锚定
"[短时间]，[具体成果]" —— 用时间压缩制造效率感。
- 例：3 个月，我设计出了一种不内耗的赚钱方式
- 适合结构：叙事/事件钩子、陈述/宣言
- 适合机制：时间压缩 + 社会证明

### 技巧 6: 概念命名法
给读者心中模糊的感受起一个精确的名字。
- 例：不相信自己能赚到钱，是一种习得性无助
- 适合结构：等式/公式、陈述/宣言
- 适合机制：命名
- **要点**：命名越精准，共情越强。参考心理学/商业概念，但用大白话表达