# Writing Assistant 迭代计划 v3

> 上一版本：`dev/archived/iteration-plan-v2.md`（多平台适配 + 轻量数据记录）

## 一、当前系统状态

### 已具备的能力

| 能力 | 说明 | 所在文件 |
|------|------|---------|
| 端到端写作流程 | 从想法到发布的 10 步流程 | SKILL.md |
| 参考库系统 | 作者风格 + 写作元素（标题/开头/结构/钩子）+ 心理学方法论 | references/ |
| 动态积累 | 搜索爆款和分析爆款时自动沉淀模式到 references/by-element/ | search-workflow.md, topic-manager.md |
| 三层内容层级 | system / user / project 三层读写协议 | SKILL.md, 各 sub-skill |
| 选题管理 | 收集箱 → 深化 → 写作的选题生命周期 | skills/topic-manager.md |
| 爆款对标 | 分析爆款 / 监控爆款 / 后台监控 / 爆款转选题 | skills/topic-manager.md |
| 标题生成 | 平台规范 + 去 AI 味 + 类型分布 | skills/title-generator.md |
| 经验系统 | 用户纠正自动记录为 case，提炼 lessons | skills/experience-tracker.md |
| 多平台适配 | 四平台（微信/小红书/X/抖音）独立 Spec + 重组式适配 | skills/content-adapter.md |
| 数据记录 | 发布后手动记录各平台指标，追加式快照 + 趋势对比 | skills/topic-manager.md (Commands 8-9) |
| 执行日志 + 复盘 | 每步记录 AI 执行过程，会话结束时复盘，问题录入经验系统 | progress-template.md, SKILL.md, experience-tracker.md |
| 流程合规 | 进度文件、强制 Skill 调用、自检、透明度报告 | SKILL.md |

### 未解决的痛点

| # | 痛点 | 来源 |
|---|------|------|
| #1 | **选题→写作上下文断裂** — 深化选题时已找到的爆款分析、大纲、标题候选，写作 Step 2 又重新搜索一遍 | 实际使用 |
| #2 | **数据记了但没用** — metrics.md 只能看，不能反哺方法论（哪种标题效果好？哪种结构更有效？） | v2 阶段二遗留 |
| #3 | **参考库即将不可扩展** — 动态积累持续增长，全文读取的方式接近瓶颈（~20-30 条后） | v2 已决定暂不做 |
| #4 | **去 AI 味只管标题** — anti-AI 规则只在 title-generator 中执行，正文/开头/适配内容没有系统性检查 | 实际使用 |

### 已决定暂不做

| 功能 | 原因 |
|------|------|
| 素材沉淀系统（金句库/概念库） | 写作量不够（需 20+ 篇发布文章），动态积累已覆盖外部爆款模式 |
| 数据驱动的方法论自动迭代 | 数据量不够（需 10+ 篇有 metrics 的文章），先把数据分析做出来 |
| 会话上下文跨 session 延续 | 依赖推荐引擎和参考库搜索，优先级低 |

## 二、本版本目标

### 阶段零：执行日志 + 流程复盘（基础设施）

> **核心价值**：记录 AI 在每步做了什么，会话结束时复盘发现问题，问题录入经验系统形成闭环

#### 已完成 ✅

**变更：**
- `assets/progress-template.md` — 每步新增 `**Execution Log** updated` checkbox；新增 Execution Log 区域（每步记录 actions/decisions/skips/friction）+ 复盘记录区域
- `SKILL.md` — 新增"Execution Logging（每步必做）"说明；每步的 `> **End:**` 增加 Execution Log 更新提醒；流程自检升级为"流程自检 + 复盘"
- `references/steps-polish-to-publish.md` — Steps 6-10 每步 End 增加 Execution Log 提醒；流程自检升级为含复盘的完整协议
- `skills/experience-tracker.md` — When to Use 新增复盘触发；Root Cause 新增 5 类复盘问题类型；With Other Skills 新增复盘反馈环
- `CLAUDE.md` — 更新 progress-template 描述、experience-tracker 描述、Experience System 描述

### 阶段一：选题→写作上下文传递（解决痛点 #1）

> **核心价值**：消除重复搜索，深化选题的成果直接传入写作流程

#### 当前状况

- topic-manager "深化选题" 产出 `developing/{topic-slug}.md`，包含 Benchmark References、Outline、Title Candidates
- writing-assistant Step 1 读取 developing/ 文件，但 Step 2 仍然从零开始搜索参考库和平台
- 已识别的爆款参考、已选的技巧、已生成的标题候选没有被复用

#### 目标

Step 2 检测到来自 developing/ 的选题时，复用已有的搜索成果，只补充缺失部分。

#### 待设计

- [ ] developing/ 文件中需要增加哪些字段供 Step 2 消费？（已选技巧？已搜索平台？）
- [ ] Step 2 的"增量搜索"逻辑：哪些部分跳过，哪些部分仍需执行？
- [ ] 是否需要在 developing/ 文件中记录"上次搜索时间"以判断时效性？

---

### 阶段二：数据分析（解决痛点 #2）

> **核心价值**：让记录的数据产生洞察——哪种方法有效，哪种无效

#### 当前状况

- topic-manager Command 8 记录 metrics 到 `outputs/{slug}/metrics.md`
- Command 9 展示单篇趋势对比
- 但没有跨文章分析：无法回答"对比型标题是否比提问式表现更好"

#### 目标

新增"分析数据"命令，能跨文章聚合数据、关联写作方法（标题类型、结构类型、平台、技巧）和效果指标。

#### 待设计

- [ ] 数据源：从各 `outputs/*/metrics.md` 聚合，还是维护一个汇总文件？
- [ ] 关联维度：需要从 progress 文件中提取哪些元数据（标题类型、结构、技巧、平台）？
- [ ] 输出形式：排行榜？对比表？文字洞察？
- [ ] 最低数据量要求：几篇文章才能产出有意义的分析？
- [ ] 是否自动建议方法论更新（如"对比型标题平均互动高 40%，建议 title-generator 提高对比型比例"），还是仅展示数据？

---

### 阶段三：参考库搜索和过滤（解决痛点 #3）

> **核心价值**：参考库条目增多后，精准找到相关模式而非全文阅读

#### 当前状况

- 动态积累机制持续向 `references/by-element/` 追加条目
- 当前全文读取，条目少时可行
- 每个类别（titles/openings/hooks/structures）接近 20-30 条时需要索引

#### 目标

为参考库增加轻量索引和搜索能力，让 Step 2 和 Step 4 能快速找到最相关的 N 条。

#### 待设计

- [ ] 索引方案：每个类别维护一个 index.md（一行一条摘要）？还是依赖文件内搜索？
- [ ] 搜索维度：按平台？按标题类型？按话题？按来源作者？
- [ ] 触发条件：条目超过多少时自动切换到索引模式？
- [ ] 是否需要给条目打标签（平台、话题、效果数据）？

---

### 阶段四：去 AI 味全覆盖（解决痛点 #4）

> **核心价值**：从"标题去 AI 味"扩展到全文去 AI 味，系统性提升内容自然度

#### 当前状况

- title-generator 有完整的 Anti-AI Rules（禁用词 + 禁用句式 + 对照案例 + 核心原则）
- content-adapter Step 6 有 anti-AI check，但引用的是 title-generator 的规则，没有正文专用规则
- SKILL.md Step 6（Polish）依赖 content-research-writer 技能，没有 anti-AI 检查点

#### 目标

建立正文级别的 anti-AI 规则，在润色和适配环节系统性检查。

#### 待设计

- [ ] 正文 anti-AI 规则放在哪：扩展 title-generator 的 Anti-AI Rules？还是独立文件 `references/anti-ai-rules.md`？
- [ ] 正文级别需要检查哪些模式？（段落结构模板化、过度使用连接词、说教语气等）
- [ ] 在哪些步骤执行检查：Step 6 润色后？Step 9b 适配后？两者都要？
- [ ] 是否需要自动检测 + 修复，还是仅标记让用户决定？

---

## 三、实施路径

> 按优先级排序。每个阶段完成后记录到"已完成记录"。

| 顺序 | 阶段 | 前置条件 |
|------|------|---------|
| 0 | ~~执行日志 + 流程复盘~~ | ✅ 已完成 |
| 1 | 选题→写作上下文传递 | 无 |
| 2 | 数据分析 | 需要有 metrics 数据的文章（≥3 篇） |
| 3 | 参考库搜索和过滤 | 参考库条目接近 20-30 条 |
| 4 | 去 AI 味全覆盖 | 无（可与阶段 1 并行） |

**说明：** 阶段 2 和 3 有数据量前置条件，实际执行时机取决于积累进度。阶段 1 和 4 无前置条件，可以立即开始。

## 四、已完成记录

### 阶段零：执行日志 + 流程复盘 ✅

**完成时间:** 2026-02-18

**变更清单：**
- 修改 `assets/progress-template.md` — 新增 Execution Log 区域 + 复盘记录区域
- 修改 `SKILL.md` — 新增 Execution Logging 说明 + 每步 End 增加日志提醒 + 流程自检升级为复盘
- 修改 `references/steps-polish-to-publish.md` — Steps 6-10 增加日志提醒 + 流程自检升级
- 修改 `skills/experience-tracker.md` — 新增复盘触发 + Root Cause 扩展 + 双反馈环
- 修改 `CLAUDE.md` — 更新相关描述

**设计决策：**
- 记录范围：AI 执行过程（决策、使用的参考、跳过的步骤、摩擦点）
- 问题去向：录入经验系统（lessons.md），不进 iteration-plan
- 每步记录，不事后回忆——避免遗漏

## 五、参考资料

- 上一版本迭代计划：`dev/archived/iteration-plan-v2.md`
- v1 迭代计划：`dev/archived/iteration-plan-v1.md`（Phase 1-13，参考库 + 流程可靠性 + 动态积累）
- v2 阶段一（多平台适配）完成记录：`dev/archived/iteration-plan-v2.md` 阶段一
- v2 阶段二（轻量数据记录）完成记录：`dev/archived/iteration-plan-v2.md` 阶段二
