# Progress Tracker Template

> Instantiate this template for each writing session.
> Replace all `{topic-slug}` with the actual topic slug.
> Fill in environment pre-check results in Session Metadata.
> This is the system-level default. Create a user-level override at `{project-root}/assets/progress-template.md` to customize.

---

# Progress Tracker: {topic-slug}

## Session Metadata
**Session Started:** YYYY-MM-DD HH:MM
**Platform:** (pending - determined in Step 1)
**Mode:** (pending - determined in Step 1)
**Topic:** (pending - determined in Step 1)
**Autonomous Mode:** disabled
**Execution Scope:** (自主模式下记录用户意图解析：写什么、发到哪、完成条件；非自主模式留空)
**Batch Progress:** N/A
**Initialization:** ✅ completed (不需要重复)
**Output Directory:** outputs/{topic-slug}/
**Environment:**
- OPENROUTER_API_KEY: ✅ / ❌
- bird CLI: ✅ (cookie-source: chrome) / ❌
- wechat dependencies: ✅ / ❌

**Reference Levels:**
- System: {skill-dir path} ✅ / ❌
- User: {project-root path} ✅ / ❌
- Project: outputs/{topic-slug}/ (created on demand)

## Applied References & Techniques
- **Author Style:** (pending)
- **Selected Techniques:** (pending)
- **Key Benchmarks:** (pending)

## Autonomous Decision Log

> 仅在自主模式下使用。记录每个决策点的选择、理由和替代方案。

| Step | Decision Point | Choice Made | Reasoning | Alternatives Considered |
|------|---------------|-------------|-----------|------------------------|

## Step Checklist

### Step 0: Create Progress Tracker
- [x] Created output directory: outputs/{topic-slug}/
- [x] Created progress tracker file
- [x] Environment pre-check completed (results recorded above)

### Step 1: Choose Starting Mode + Platform
- [ ] Determined target platform
- [ ] Checked `assets/topics/developing/` (`READ:user`) for ready topics
- [ ] Selected starting mode
- [ ] Updated session metadata above
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 2: Search References & Techniques
- [ ] Checked lessons.md (`READ:3L`)
- [ ] Searched `references/authors/` (`READ:3L`) for style matches
- [ ] Searched `references/by-element/` (`READ:3L`) for element patterns
- [ ] Searched `references/techniques/` (`READ:3L`) for writing methodologies
- [ ] Searched `assets/topics/benchmarks/` (`READ:3L`) for viral cases
- [ ] Searched target platform: {platform name}
- [ ] Search results recorded in Session Notes (commands, keywords, top results, patterns)
- [ ] Recorded matched techniques in "Applied References & Techniques" above
- [ ] **Execution Log** updated

### Step 3: Collect & Clarify (Modes 1 & 2)
- [ ] Checked lessons.md (`READ:3L`)
- [ ] Analyzed provided content
- [ ] Asked clarifying questions
- [ ] Supplemented with research if needed
- [ ] Applied selected techniques to content organization
- [ ] Organized into initial draft
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 4: Element-Level Reference
- [ ] Checked lessons.md (`READ:3L`)
- [ ] Title: invoked title-generator with platform rules
- [ ] Opening: referenced openings-index.md + techniques
- [ ] Structure: referenced structure-templates.md + techniques
- [ ] Hooks: referenced hook-examples.md + planned placement
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 5: Process Draft (Mode 3 only)
- [ ] Checked lessons.md (`READ:3L`)
- [ ] Analyzed existing draft
- [ ] Applied element refinements (Step 4)
- [ ] Applied selected techniques throughout article body
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 6: Polish
- [ ] Checked lessons.md (`READ:3L`)
- [ ] Compiled technique-aware instructions for polishing
- [ ] Invoked content-research-writer
- [ ] Verified platform-specific style applied
- [ ] Output: outputs/{topic-slug}/{topic-slug}-polished.md
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 7: Generate Illustrations
- [ ] Invoked baoyu-xhs-images
- [ ] Generated appropriate illustrations
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 8: Create Final Article
- [ ] Combined polished content + images
- [ ] Verified layout and formatting
- [ ] Output: outputs/{topic-slug}/{topic-slug}-final.md
- [ ] Presented final article to user (file path + image placement summary)
- [ ] User confirmed or gave feedback
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 9: Review & Platform Adaptation ← 不可跳过
- [ ] Presented summary to user
- [ ] Asked about revisions
- [ ] Asked about additional platform adaptations
- [ ] If adapting: invoked content-adapter
- [ ] **Experience Check** completed
- [ ] **Execution Log** updated

### Step 10: Publish
- [ ] User confirmed platform and content
- [ ] Invoked publishing skill
- [ ] Publication result: ____
- [ ] Reminded user about data recording ("记录数据")
- [ ] **Execution Log** updated

### 流程自检 + 复盘（不可跳过）
- [ ] 所有 Step checkbox 已核对
- [ ] 无未闭合的 Corrections Log 条目
- [ ] Step 9 已执行
- [ ] **复盘完成**: 审阅 Execution Log，识别问题
- [ ] 发现的问题已记录到 experience 系统
- [ ] 自检 + 复盘结果已告知用户
**自检时间**: ____
**自检结果**: ____
**复盘发现问题数**: ____

## Corrections Log

> 自主模式下此表通常为空（无用户交互 = 无纠错），每步记录 "Autonomous mode — no interaction"。

| Step | What User Said | Case Recorded? | Case File |
|------|----------------|----------------|-----------|

## Execution Log

> 每个 Step 完成后填写。记录 AI 实际做了什么、怎么做的、跳过了什么。
> 复盘时审阅此日志，识别流程和方法论问题。

### Step 1 Log
**选择了什么**: (平台、模式、是否用了 developing/ 选题)
**跳过了什么**: (如有，说明原因)
**摩擦点**: (执行中遇到的障碍或不顺)
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 2 Log
**搜索了哪些来源**: (列出实际搜索的参考库路径和平台命令)
**选择了哪些技巧**: (选中的 techniques 和原因)
**匹配到的参考**: (使用了哪些 benchmarks / author styles / element patterns)
**跳过了什么**: (如有，说明原因)
**摩擦点**: (搜索无结果？参考库太空？工具不可用？)
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 3 Log
**问了哪些问题**: (关键问题摘要)
**补充研究了什么**: (WebSearch/WebFetch 的内容)
**技巧如何应用**: (选中的技巧在内容组织中怎么体现的)
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 4 Log
**标题**: 选了哪个类型，用了什么参考
**开头**: 选了哪种技巧
**结构**: 选了什么模板
**钩子**: 计划放在哪些位置
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 5 Log (Mode 3 only)
**修改了什么**: (对原稿做了哪些调整)
**保留了什么**: (用户原稿中保留不动的部分)
**技巧应用**: (techniques 如何影响正文)
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 6 Log
**传给 polishing skill 的指令摘要**: (technique-aware instructions 的关键点)
**润色前后主要变化**: (结构调整？语气变化？长度变化？)
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 7 Log
**生成了几张图**: (数量和位置)
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 8 Log
**图文结合方式**: (图片插入了哪些位置)
**用户反馈摘要**: (用户确认还是修改)
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 9 Log
**用户修改意见**: (如有)
**适配了哪些平台**: (如有，每个平台用了什么调整策略)
**发布决定**: (用户选择发布/不发布/稍后)
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

### Step 10 Log
**发布到哪个平台**: (平台名)
**发布结果**: (成功/失败/跳过)
**跳过了什么**:
**摩擦点**:
**自主决策摘要**: (仅自主模式)
**失败/跳过项**: (仅自主模式，如有)

## 复盘记录

> 流程自检完成后填写。审阅上方 Execution Log，识别可改进的问题。

### 发现的问题
| # | 问题描述 | 类型 | 记录到 |
|---|---------|------|--------|

**问题类型说明:**
- **流程遗漏**: 某个步骤或子步骤被跳过，不应该跳过
- **参考未用**: 有可用参考但没使用，或使用了不相关的参考
- **技巧脱节**: 选了技巧但实际写作中没体现
- **工具问题**: 依赖不可用、命令失败
- **质量问题**: 产出不符合预期（AI 味、结构松散、不符合平台规范等）
- **效率问题**: 重复操作、不必要的搜索、上下文丢失

### 复盘总结
(一段话总结本次写作流程的整体表现和主要改进方向)

## Session Notes
(Add notes as the session progresses)

## 自主模式执行摘要

> 仅在自主模式下使用。全部执行完毕后填写。

### Completion Gate Checklist（停止前必须全部通过）

> **⚠️ 以下所有条件必须全部勾选才能停止执行。任何一项未通过，必须回到对应步骤补完。**

- [ ] **G1** `{topic-slug}-final.md` 文件已创建且非空
- [ ] **G2** Step 0-9 所有 checkbox 已标记 `[x]`
- [ ] **G3** Step 10 已执行或已标记为"跳过"（含跳过理由）
- [ ] **G4** Execution Log 每个步骤都有记录（无空白步骤）
- [ ] **G5** Autonomous Decision Log 至少有 3 条记录
- [ ] **G6** 流程自检 + 复盘已完成
- [ ] **G7** 下方执行摘要已填写（所有 pending 已替换为实际内容）

**Gate 结果:** ____（全部通过 / 未通过：缺 G_）

**文章标题:** (pending)
**目标平台:** (pending)
**完成状态:** (pending)

### 关键决策 (Top 3-5)
(pending)

### 产出文件
(pending)

### 跳过/失败项
(pending — 如无则写"无")

### 建议复查点
(pending — AI 自评哪些决策最可能需要用户调整)
