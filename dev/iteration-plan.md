# Writing Assistant 迭代计划

## 一、背景与愿景

### 灵感来源
参考 dontbesilent 的内容生产系统（见 `dev/reference/best_practice_reference.md`），核心理念：
- **系统化 vs 碎片化** - 每次创作都在沉淀，而不是一次性消耗
- **素材复用** - AI 先检索素材库，避免重复造轮子
- **数据闭环** - 从选题→创作→发布→数据复盘→方法论沉淀
- **记忆系统** - AI 知道你以前写过什么，能建议复用

### 当前系统状态
- 线性工作流：从想法到发布的单向流程
- 每次创作都是独立的
- 没有素材库和知识沉淀机制
- 没有数据复盘和方法论迭代

### 目标愿景
构建一个**可持续沉淀、积累的写作系统**，让每次创作都成为系统资产。

## 二、核心痛点

> 来源：项目实践 + dontbesilent 系统对比分析（见 `dev/dev_reference_materials/dontbesilent/Claude Code：我和 dontbesilent 相处的三个星期.md`）

### 痛点 #1：没有参考 ✅ 已解决（Phase 1）
- **问题**：没有优秀作者风格参考，导致写出来的内容 AI 味很重
- **影响**：内容质量不稳定，缺乏个性和吸引力
- **状态**：已建立参考库，导入 Dan Koe 风格，验证有效

### 痛点 #2：没有沉淀
- **问题**：写过、搜集过的素材无法复用
- **影响**：每次都重新造轮子，效率低下
- **对标**：dontbesilent 有推文库(10,672)、金句库、核心概念库、爆款文稿库，AI 创作前先检索素材库

### 痛点 #3：没有对标
- **问题**：仅靠自己和 AI 思考标题、封面，无法写出爆款
- **影响**：不知道什么样的标题、开头更容易获得流量

### 痛点 #4：没有分析
- **问题**：发表完成后数据没有闭环，不知道写作效果
- **影响**：无法针对性提升，不知道哪些方法有效

### 痛点 #5：参考库缺少中文语境 ⭐ 新发现
- **问题**：当前参考库只有 Dan Koe（英文作者），缺乏中文内容创作的风格参考和平台规范
- **影响**：写中文小红书/公众号时，参考库帮助有限
- **对标**：dontbesilent 有明确的中文平台规范（小红书标题 ≤20字、类型分布比例、"去爹味"反面案例等）

### 痛点 #6：Skill 粒度太粗 ⭐ 新发现
- **问题**：只有 1 个大 skill（writing-assistant, 328 行），覆盖所有场景
- **影响**：无法针对性调用（只想生成标题也要走完整流程）、无法独立迭代、无法批量操作
- **对标**：dontbesilent 有 27 个细粒度 skill，每个解决一个具体问题，有独立版本号和更新日志

### 痛点 #7：没有选题管理 ⭐ 新发现
- **问题**：没有选题生命周期管理，用户每次来都要重新描述想写什么
- **影响**：碎片想法容易丢失，AI 不知道用户的选题积累
- **对标**：dontbesilent 有完整选题流转（碎片想法→待深化→待拍摄→已发布+数据+复盘）

### 痛点 #8：没有多平台适配 ⭐ 新发现
- **问题**：只输出一种格式的文章，没有内容适配逻辑
- **影响**：无法"一鱼多吃"，同一内容需要手动改写才能发不同平台
- **对标**：dontbesilent 同一内容自动适配微信（长文深度）、小红书（短笔记吸睛）、抖音（短段落手机阅读）、推特（精简+数据）

## 三、解决方案设计

### 阶段一：建立参考库系统（解决痛点 #1）

#### 参考库结构

```
references/
├── authors/                    # 按作者分类
│   ├── dontbesilent/
│   │   ├── profile.md          # 作者风格分析
│   │   │   # 包含：写作风格、常用结构、语言特点、核心理念等
│   │   └── articles/           # 文章合集
│   │       ├── article-001.md
│   │       └── article-002.md
│   │
│   └── dan-koe/
│       ├── profile.md
│       └── articles/
│
├── by-element/                 # 按写作元素分类
│   ├── titles/                 # 优秀标题库
│   │   ├── titles-index.md    # 标题合集，标注来源、主题、数据表现
│   │   └── title-patterns.md  # 标题套路分析
│   │
│   ├── openings/               # 优秀开头库
│   │   ├── openings-index.md  # 开头合集
│   │   └── opening-patterns.md
│   │
│   ├── structures/             # 内容结构
│   │   └── structure-templates.md  # 常见结构模板
│   │
│   └── hooks/                  # 吸引人的钩子
│       └── hook-examples.md
│
└── by-topic/                   # 按主题分类（可选）
    ├── AI/
    ├── writing/
    └── productivity/
```

#### 参考库建立方式

**方式 A：手动导入**
- 用户提供优秀文章链接或文本
- AI 自动分析并归档到参考库
- 提取标题、开头、结构等元素

**方式 B：半自动抓取**
- 用户提供作者名字或平台账号
- AI 自动抓取作者的公开内容
- 批量分析并归档

**实施策略：**先实现 A（快速建立基础库），再实现 B（提升效率）

#### 参考库使用场景

**场景 1：写初稿前检索参考**
- 用户提供选题后，AI 自动检索参考库
- 找到类似主题的优秀案例
- 提示："Dan Koe 写过类似的，采用了这样的结构..."
- 询问是否参考该结构

**场景 3：特定环节参考**
- **写标题时**：检索 `by-element/titles/`，提供优秀标题案例和套路
- **写开头时**：检索 `by-element/openings/`，提供吸引人的开头模板
- **搭建结构时**：检索 `by-element/structures/`，提供经验证的结构模板

#### Workflow 改造

**原流程：**
```
Step 1: 选择模式 (Topic/Materials/Draft)
Step 2: 收集和澄清 (Modes 1 & 2)
Step 3: 处理草稿 (Mode 3)
Step 4: 润色草稿
Step 5: 生成插图
Step 6: 创建最终文章
Step 7: 下一步
Step 8: 发布
```

**新流程（增加参考环节）：**
```
Step 1: 选择模式 (Topic/Materials/Draft)

[NEW] Step 1.5: 检索参考库
- 根据选题/主题检索 references/
- 展示相关优秀案例
- 询问是否参考特定风格或结构

Step 2: 收集和澄清 (Modes 1 & 2)

[ENHANCED] Step 2.5: 特定元素参考
- 写标题时：展示优秀标题库
- 写开头时：展示优秀开头库
- 搭建结构时：展示结构模板库

Step 3: 处理草稿 (Mode 3)
Step 4: 润色草稿
Step 5: 生成插图
Step 6: 创建最终文章
Step 7: 下一步
Step 8: 发布
```

### 阶段二：素材沉淀系统（解决痛点 #2）

> **状态：待决策** | 关联痛点：#2 没有沉淀
> **核心价值**：从"每次从零创作"变成"先检索后创作"，这是从"工具"变成"系统"的关键转折点

#### 目标
让每次创作的产出成为系统资产，下次创作时可检索复用。

#### 素材库结构

```
materials/
├── concepts/              # 核心概念库：可复用的理论框架
│   └── {concept-name}.md  # 如 "生产型兴趣.md"、"注意力资产.md"
│
├── quotes/                # 金句库：高质量表达
│   └── quotes-index.md    # 按主题分类的金句合集
│
├── proven-content/        # 已验证内容库：发布过且效果好的内容结构
│   └── {title}.md         # 保留完整文稿 + 数据表现标注
│
└── raw/                   # 原始素材：推文、笔记、录音转写等
    └── {source}/          # 按来源分类
```

#### 工作流改造

**创作前——素材检索（集成到 Step 1.5）：**
1. 用户提供选题后，AI 先检索 `materials/` 目录
2. 查找相关概念、金句、已发布内容
3. 提示：「你之前写过类似内容，要不要复用这个框架？」
4. 然后再检索 `references/` 参考库

**创作后——素材沉淀（新增 Step 6.5）：**
1. 文章完成后，自动提取核心概念 → 存入 `concepts/`
2. 提取金句 → 存入 `quotes/`
3. 询问用户是否将此文标记为"已验证内容" → 存入 `proven-content/`

#### 待确认
- [ ] 素材库目录结构是否合适？
- [ ] 自动提取的粒度：是 AI 自动提取还是用户手动确认？
- [ ] 是否需要导入用户已有的素材（如推文库、笔记等）？

---

### 阶段三：中文参考库 + 去 AI 味（解决痛点 #5）

> **状态：待决策** | 关联痛点：#5 参考库缺少中文语境
> **核心价值**：参考库从"只有英文作者"扩展到"覆盖中文内容创作场景"

#### 目标
增加中文作者风格参考、平台特定规范、以及"去 AI 味"的具体指南。

#### 具体内容

**3a. 添加中文作者参考**
- 添加 dontbesilent 作者 profile + 文章（素材已在 `dev/dev_reference_materials/dontbesilent/`）
- 可选：添加其他中文内容创作者

**3b. 添加平台特定规范到 `by-element/`**
- 小红书标题规范：≤20字、必须留悬念不给答案、张力要素（对比/数字/悬念/冲突至少2项）
- 标题类型分布：数据发现型 20-30%、认知冲突型 20-30%、金句型 15-25%、对比型 10-20%、提问式 10-20%
- 各平台内容差异指南（微信 vs 小红书 vs 抖音 vs 推特）

**3c. 添加"去 AI 味"反面案例库**
- 建立 `references/by-element/anti-patterns/` 或在现有文件中增加
- 收录典型 AI 味写法 vs 正确写法对照：
  - ❌「通过以下三个步骤，您可以有效提升内容质量」→ ✅「90% 的人在第一步就错了」
  - ❌「建议您采用数据驱动的方法进行选题」→ ✅「我用这个方法，一年涨粉 70 万」
  - ❌「综上所述，我们可以得出结论」→ ✅「说白了就一句话」
- 核心原则：像个人说话，不像教科书

#### 待确认
- [ ] 先做哪个：3a（中文作者）、3b（平台规范）、还是 3c（去 AI 味）？
- [ ] dontbesilent 的哪些文章适合导入参考库？
- [ ] 是否需要更多中文作者参考？

---

### 阶段四：Skill 拆分与细化（解决痛点 #6）

> **状态：待决策** | 关联痛点：#6 Skill 粒度太粗
> **核心价值**：从 1 个大 skill 拆分为多个可独立调用、独立迭代的子 skill

#### 目标
用户可以只调用需要的能力（如只生成标题），而不是每次走完整流程。每个 skill 可独立版本化和迭代。

#### 拆分方案

保留 `writing-assistant` 作为**编排层**，新增以下独立子 skill：

| 子 Skill | 功能 | 独立使用场景 |
|----------|------|-------------|
| `title-generator` | 标题生成，含平台规范和方法论 | 「帮我给这篇文章想 5 个小红书标题」 |
| `topic-manager` | 选题记录、检索、生命周期管理 | 「记录一个选题想法」「看看我有什么待深化的选题」 |
| `content-adapter` | 一篇内容适配多个平台格式 | 「把这篇公众号文章改成小红书笔记」 |
| `material-extractor` | 从内容中提取金句/概念/框架存入素材库 | 「从这篇文章里提取金句存到素材库」 |
| `batch-producer` | 批量内容生产（如从推文库批量生成小红书笔记） | 「从这 50 条推文里筛选出适合发小红书的」 |

#### Skill 版本化
每个 skill 文件包含：
- 触发条件
- 核心规则
- 工作流程
- 注意事项
- **更新日志**（版本号 + 每次迭代的改进记录）

#### 待确认
- [ ] 是否同意拆分思路？还是更倾向保持单一 skill？
- [ ] 哪些子 skill 优先级高？
- [ ] 是否需要 `batch-producer`（批量生产能力）？

---

### 阶段五：选题管理系统（解决痛点 #7）

> **状态：待决策** | 关联痛点：#7 没有选题管理
> **核心价值**：碎片想法不再丢失，选题有完整生命周期

#### 目标
建立选题从"灵感"到"发布+复盘"的完整流转。

#### 选题目录结构

```
topics/
├── inbox.md               # 碎片想法快速记录（收集箱）
├── developing/            # 正在深化的选题
│   └── {topic-name}.md    # 包含：想法、素材检索结果、初步大纲
├── ready/                 # 已完成待发布
│   └── {topic-name}.md
└── published/             # 已发布（含数据+复盘）
    └── {topic-name}.md    # 包含：发布时间、平台、数据、复盘思考
```

#### 工作流
1. 用户说「记录选题：xxx」→ AI 追加到 `topics/inbox.md`
2. 用户说「深化选题：xxx」→ AI 检索素材库 → 生成初步大纲 → 移入 `developing/`
3. 创作完成 → 移入 `ready/`
4. 发布后 → 移入 `published/`，记录数据

#### 待确认
- [ ] 是否需要这套选题管理？还是目前手动管理就够了？
- [ ] 选题数据记录的粒度：简单记录还是详细复盘？

---

### 阶段六：多平台适配（解决痛点 #8）

> **状态：待决策** | 关联痛点：#8 没有多平台适配
> **核心价值**："一鱼多吃"，同一内容高效分发到多个平台

#### 目标
一篇内容自动生成适配不同平台的版本。

#### 适配规则

| 平台 | 格式特点 | 适配重点 |
|------|---------|---------|
| 微信公众号 | 长文，深度分析 | 完整论述，配图，引用 |
| 小红书 | 短笔记，≤1000字 | 标题 ≤20字，留悬念，口语化 |
| 抖音 | 短段落，适合手机阅读 | 前5秒吸引力，短句，数据 |
| 推特/X | 精简版，配数据 | 280字限制，核心观点 |

#### 实现方式
- 可作为独立子 skill（`content-adapter`）
- 也可集成到 writing-assistant 的 Step 7 中：完成文章后询问「要适配到哪些平台？」

#### 待确认
- [ ] 目前实际运营几个平台？哪些需要优先支持？
- [ ] 独立 skill 还是集成到主流程？

---

### 阶段七：爆款对标系统（解决痛点 #3）

> **状态：待决策** | 关联痛点：#3 没有对标
> **原阶段三，保留原有思路并补充细节**

#### 目标
建立爆款案例库，让 AI 能分析爆款规律并指导创作。

#### 核心思路
- 建立爆款案例库：收集高流量内容的标题、开头、结构
- 分析爆款规律：对比流量好 vs 流量差的选题/标题特征
- 生成方法论文档：从数据中提炼可复用的规律
- 对标分析：参考头部创作者（如 Dan Koe）的选题策略

#### 待确认
- [ ] 是否有现成的数据可以导入（如已有的数据统计表）？
- [ ] 优先对标哪些平台的爆款？

---

### 阶段八：数据闭环系统（解决痛点 #4）

> **状态：待决策** | 关联痛点：#4 没有分析
> **原阶段四，保留原有思路并补充细节**

#### 目标
发布后记录数据，数据反哺方法论，让方法论是"活的"。

#### 核心思路
- **数据记录**：发布后记录播放量、点赞、评论、完播率等
- **定期复盘**：每周/月汇总分析，哪些内容表现好/差
- **方法论更新**：根据数据更新标题方法论、选题策略等
- **Skill 迭代**：根据复盘结果更新 skill 规则（如 dontbesilent 的 v1.0→v1.1→v1.2）

#### 待确认
- [ ] 数据来源：手动记录还是需要自动抓取？
- [ ] 复盘频率：每周还是每月？
- [ ] 方法论更新：AI 自动建议还是用户手动触发？

## 四、实施路径

### 步骤 1：建立参考库基础 ✅ 已完成

**目标：快速验证参考库价值**

**完成情况：**

1. ✅ **创建目录结构**
   ```
   references/
   ├── authors/dan-koe/
   │   ├── profile.md
   │   └── articles/
   ├── by-element/
   │   ├── titles/
   │   ├── openings/
   │   ├── structures/
   │   └── hooks/
   └── by-topic/
   ```

2. ✅ **导入种子内容**
   - 导入 2 篇 Dan Koe 文章（使用 bird CLI 抓取）
   - "The future of work when work is meaningless"
   - "The most important skill to learn in the next 10 years"

3. ✅ **提取写作元素**
   - `titles/titles-index.md` - 2 个标题分析 + 套路模板
   - `openings/openings-index.md` - 2 个开头分析 + 技巧拆解
   - `structures/structure-templates.md` - 文章结构模板
   - `hooks/hook-examples.md` - 17 个钩子案例

4. ✅ **生成作者风格档案**
   - `authors/dan-koe/profile.md` - 7 个维度的深度分析

### 步骤 2：改造 Workflow ✅ 已完成

**目标：在写作流程中集成参考库**

**完成情况：**

1. ✅ **修改 SKILL.md**
   - 新增 Step 1.5：检索参考库
   - 新增 Step 2.5：特定元素参考（标题、开头、结构、钩子）
   - 更新 Step 3：Draft 模式也经过元素参考
   - 更新 Best Practices：增加参考库使用建议

2. ✅ **实现检索逻辑**
   - Workflow 中定义了检索流程
   - 明确了参考库目录结构

3. ✅ **测试完整流程**
   - 测试选题：「未来五年最值得投资的资产：你的注意力」
   - 参考风格：Dan Koe
   - 验证结果：
     - Step 1.5（检索参考库）✓ 成功识别并展示 Dan Koe 风格
     - Step 2.5（元素级参考）✓ 标题套路、开头技巧、结构模板都有效
     - 完整流程到发布 ✓ 文章已发布到微信公众号
   - 结论：**参考库系统有效降低 AI 味**

### 步骤 3：完善参考库功能

**功能清单：**
- [ ] 实现半自动抓取（方式 B）
- [ ] 增加更多作者和文章（如 dontbesilent）
- [ ] 标题/开头的数据标注（点击率、完播率等）
- [ ] 参考库搜索和过滤功能

## 五、关键决策

### 为什么先做参考库？
1. **痛点最迫切**：AI 味太重直接影响内容质量
2. **见效最快**：手动导入几篇文章就能验证价值
3. **基础设施**：参考库也是后续素材库的基础

### 为什么不完全照搬 dontbesilent？
1. **场景不同**：dontbesilent 运营 7 个平台，我们可能更简单
2. **渐进式**：先解决最痛的问题，再逐步完善
3. **灵活性**：保留调整空间，根据实际使用反馈迭代

### 为什么选择 A+B 的建立方式？
1. **A（手动）快速启动**：不需要开发复杂的爬虫，立即可用
2. **B（自动）提升效率**：内容积累到一定程度后，自动化更高效
3. **先验证再投入**：避免过度开发不需要的功能

## 六、待决策清单

> 以下是所有待实施的改进项。请决定：做/不做/优先级顺序。
> 标记方式：✅ 做 | ❌ 不做 | 🔜 以后再说

### 阶段级决策

| # | 阶段 | 解决的痛点 | 状态 |
|---|------|-----------|------|
| 2 | 素材沉淀系统 | #2 每次从零创作，无法复用 | 待决策 |
| 3 | 中文参考库 + 去 AI 味 | #5 参考库只有英文，缺中文平台规范 | ✅ 部分完成：去 AI 味规则已内嵌到 title-generator；中文参考内容改为动态建立（通过爆款分析自动沉淀） |
| 4 | Skill 拆分与细化 | #6 只有 1 个大 skill，无法灵活调用 | ✅ 已完成：拆分为 title-generator + topic-manager + experience-tracker |
| 5 | 选题管理系统 | #7 碎片想法无处记录，无生命周期 | ✅ 已完成：skills/topic-manager.md + assets/topics/ |
| 6 | 多平台适配 | #8 无法一鱼多吃 | 待决策 |
| 7 | 爆款对标系统 | #3 不知道什么内容容易火 | ✅ 已完成：合并到 topic-manager 中（分析爆款/监控爆款/后台监控/爆款转选题） |
| 8 | 数据闭环系统 | #4 发布后无数据反馈 | 待决策 |

### 阶段一遗留项

| 项目 | 说明 | 状态 |
|------|------|------|
| 半自动抓取（方式 B） | 自动抓取作者公开内容并归档 | ✅ 已通过爆款分析实现（动态建立参考内容） |
| 增加更多作者和文章 | 如 dontbesilent（素材已就绪） | 待决策（改为动态积累，不预先导入） |
| 标题/开头的数据标注 | 给参考库内容标注点击率、完播率等 | 待决策 |
| 参考库搜索和过滤 | 提升检索效率 | 待决策 |

## 七、已完成记录

1. ✅ 创建 references/ 目录结构
2. ✅ 导入 Dan Koe 2 篇文章并分析
3. ✅ 提取写作元素（标题、开头、结构、钩子）
4. ✅ 生成 Dan Koe 风格档案
5. ✅ 改造 SKILL.md 集成参考库
6. ✅ 测试新 workflow（选题：注意力资产，已发布到微信公众号）
7. ✅ 添加心理学方法论参考（`techniques/psychology/`）
8. ✅ 三层内容层级系统（system / user / project），SKILL.md + 三个 sub-skill + CLAUDE.md 全部更新

### Phase 9: 流程可靠性修复 (2026-02-16)

**触发事件**: ai-solopreneur-paradox 完整流程暴露多个系统性问题

**修复内容**:
1. 进度文件优先原则 — 强制为第一个动作
2. 初始化只做一次 — 增加标记，避免重复
3. 环境预检 — Step 0 中一次性检查所有依赖和 API key
4. 输出目录规范 — outputs/{topic-slug}/ 统一存放
5. Step 2 热门搜索必做 — 搜索+拆解+沉淀不可跳过
6. Step 9 适配增加对标 — 新平台必须先搜索热门再适配
7. Experience Check 当场闭环 — 禁止 Pending，立即创建 case
8. Bird CLI chrome 配置 — 记录到 lessons.md
9. 补录 5 条 Pending corrections 为 case 文件并总结经验

### Phase 10: 三层内容层级系统 (2026-02-16)

**目标**: 将 assets/ 和 references/ 从扁平结构改为 system / user / project 三层层级

**变更内容**:
1. 定义三层位置：system（skill 目录）、user（项目根目录）、project（文章输出目录）
2. 定义 READ 协议（`READ:3L`）：读取时三层合并，冲突时 project > user > system
3. 定义 WRITE 协议：每个写操作指定目标层级，默认 WRITE:user
4. SKILL.md 新增 "Three-Level Reference System" section
5. SKILL.md 所有 assets/ 和 references/ 路径引用标注层级（~30 处）
6. 三个 sub-skill 添加协议说明并更新路径引用
7. CLAUDE.md 替换 Content Assets + Reference Library 为 Three-Level Content System
8. assets/experiences/ 保留作为 system-level 默认值
9. 当前 references/ 全部保留为 system-level seed content

**修改文件**: SKILL.md, skills/title-generator.md, skills/topic-manager.md, skills/experience-tracker.md, CLAUDE.md, dev/iteration-plan.md

### Phase 11: 流程合规 + 监控透明度 + 工具配置 (2026-02-17)

**触发事件**: chunwan-tech-roadshow 完整流程复盘，发现 9 个系统性问题

**状态**: ✅ 已完成

**问题清单**:

| # | 问题 | 严重度 | 类别 |
|---|------|--------|------|
| 1 | Step 6 没有调用 content-research-writer 技能，手动润色代替 | HIGH | 流程合规 |
| 2 | Step 7 没有调用 baoyu-xhs-images 技能，手动写 prompt 代替 | MEDIUM | 流程合规 |
| 3 | Step 9 整个步骤被跳过，进度文件 5 个 checkbox 全空 | HIGH | 流程合规 |
| 4 | Step 8 Experience Check 标注"无用户交互"并跳过 | MEDIUM | 流程合规 |
| 5 | 监控爆款行为不一致，不同指令措辞导致不同执行结果 | HIGH | 监控透明度 |
| 6 | 监控过程信息不透明，用户看不到在监控什么、怎么监控的 | HIGH | 监控透明度 |
| 7 | bird CLI 仍然尝试读取 Safari cookie（尽管 lessons.md 已有规则） | MEDIUM | 工具配置 |
| 8 | Step 2【必做】搜索爆款/拆解/对标，用户无法确认是否执行 | HIGH | 流程合规 |
| 9 | 全流程完成后没有回头检查进度文件，遗漏未被发现 | MEDIUM | 流程合规 |

---

#### 修复 1: Step 6 必须通过 Skill 工具调用 content-research-writer

**根因**: SKILL.md 写了"Invoke: content-research-writer skill"但语义模糊，AI 理解为"应用该技能的原则"而非"用 Skill 工具正式调用"。

**修改文件**: `SKILL.md` Step 6

**修改内容**:
1. 将 Step 6 中的调用说明从伪代码改为明确的强制指令：
   ```
   **【强制】使用 Skill 工具调用 content-research-writer**，不得手动润色代替。

   调用前，先编译以下指令作为 Skill 参数传入：
   1. 目标平台 + 平台风格要求
   2. 已选技巧清单及核心原则
   3. 技巧专属润色检查清单（如 TOFU: "每段通过'给父母看'测试"）
   4. 作者风格参考（如有）
   5. lessons.md 中的相关规则

   ❌ 禁止：自己直接修改草稿文件来完成润色
   ✅ 正确：编译指令 → 调用 Skill → 技能产出 polished.md
   ```
2. 增加验证点：润色产出文件应包含 content-research-writer 的特征产出（引用、数据补充、逐段改进说明）

---

#### 修复 2: Step 7 必须通过 Skill 工具调用 baoyu-xhs-images

**根因**: 同修复 1，"Invoke: baoyu-xhs-images skill"被理解为手动执行而非正式调用。

**修改文件**: `SKILL.md` Step 7

**修改内容**:
1. 将调用说明改为强制指令：
   ```
   **【强制】使用 Skill 工具调用 baoyu-xhs-images**，传入 polished.md 内容。

   技能会自动完成：内容分析 → 风格/布局选择 → outline 生成 → prompt 文件生成。
   然后根据 prompt 文件调用 generate-image 生成实际图片。

   ❌ 禁止：手动编写 outline.md 和 prompt 文件
   ✅ 正确：调用 Skill → 技能自动产出 outline + prompts → 再生成图片
   ```

---

#### 修复 3: Step 9 不可跳过，即使用户主动要求发布

**根因**: 用户在 Step 8 输出后直接说"发布到微信"，AI 将其解读为跳到 Step 10。Step 9 作为审稿缓冲层被绕过。

**修改文件**: `SKILL.md` Step 8 末尾 + Step 9 开头

**修改内容**:
1. Step 8 末尾增加硬性卡点：
   ```
   > **⚠️ STOP: 不得直接跳到 Step 10。**
   > 即使用户在此步说"发布"，也必须先执行 Step 9。
   > Step 9 是审稿缓冲层，确保用户在发布前正式审阅最终图文排版。
   ```
2. Step 9 开头增加说明：
   ```
   > **本步骤不可跳过。** 即使用户已表达发布意图，仍需执行 9a（呈现总结 + 问修改意见）。
   > 如果用户确认无修改，可以快速通过 9b 和 9c 直接进入 Step 10。
   ```
3. Step 9 进度模板中标注 `← 不可跳过`

---

#### 修复 4: Step 8 Experience Check 必须呈现文章并等待反馈

**根因**: Step 8 列在"需要用户交互的步骤"中，但 AI 认为"创建文件"这个动作不涉及交互。

**修改文件**: `SKILL.md` Step 8

**修改内容**:
1. 明确 Step 8 的交互要求：
   ```
   **呈现最终文章：** 创建 final.md 后，必须：
   1. 告知用户最终文件路径
   2. 简要说明图片插入位置（哪张图在哪个段落）
   3. **等待用户确认**再继续到 Step 9

   用户确认可以是：明确说"好的/可以/继续"，或直接给出修改意见。
   不得在用户未回复时就标记 Experience Check 为完成。
   ```

---

#### 修复 5: 监控爆款 — 指令一致性 + 执行可预测性

**根因（两层）**:

**第一层：命名不一致**
- topic-manager.md 注册的触发词是"分析爆款""监控爆款""启动爆款监控"
- 用户实际说的是"看热点""监控热点"
- "热点"从未出现在 trigger 列表中，导致 AI 走了自由发挥路径而非标准流程

**第二层：规则散落，AI 难以稳定遵守**
- `bird home` vs `bird search` 的区分写在 Prerequisites 里，不在命令流程本体中
- `--cookie-source chrome` 只记录在 lessons.md 中，不在 topic-manager.md 的命令示例里
- 用户不同的措辞触发不同的理解路径，导致有时用 `bird home`（正确），有时用 `bird search`（错误）

**修改文件**: `skills/topic-manager.md`

**修改内容**:

1. **扩展触发词**，覆盖用户常用表达：
   ```yaml
   description: >
     ... Use when users say "记录选题", "看选题", "深化选题",
     "分析爆款", "监控爆款", "启动爆款监控",
     "看热点", "监控热点", "热点", "有什么热点".
   ```

2. **在每个 bird 命令示例中内嵌 `--cookie-source chrome`**，不依赖 lessons.md：
   ```
   bird home --cookie-source chrome
   bird read <url> --cookie-source chrome
   bird search "query" --cookie-source chrome
   ```

3. **在 Command 5（监控爆款）流程中内嵌关键规则，而非只放在 Prerequisites**：
   ```
   1. X/Twitter: 执行 `bird home --cookie-source chrome`（至少 20 条）
      ⚠️ 必须用 `bird home`，不得用 `bird search`。bird search 是关键词搜索，会错过自然趋势。
   ```

---

#### 修复 6: 监控过程透明化

**根因**: 用户执行"监控爆款"或"启动爆款监控"后，完全看不到：
- 扫描了哪些平台
- 每个平台抓了多少条
- 用了什么筛选条件
- 中间结果是什么
- 最终怎么判断的"热门"

**修改文件**: `skills/topic-manager.md` Command 5 + Command 6

**修改内容**:

1. **Command 5（监控爆款）增加透明度报告模板**：
   ```
   执行完毕后，必须向用户呈现以下报告（不可省略）：

   ---
   ## 监控报告

   **扫描时间**: YYYY-MM-DD HH:MM
   **扫描范围**:
   | 平台 | 命令 | 抓取条数 | 筛选条件 |
   |------|------|---------|---------|
   | X/Twitter | bird home | {N} 条 | 原始 timeline |
   | 小红书 | xhs search "{keywords}" | {N} 条 | 关键词: {keywords} |
   | 微信公众号 | search_wechat "{keywords}" | {N} 条 | 关键词: {keywords} |

   **扫描结果**:
   - 共扫描 {total} 条内容
   - 高互动内容（点赞 > {threshold}）: {N} 条
   - 高频话题: {topic1}, {topic2}, ...

   **Top 10 高互动内容**:
   | # | 平台 | 标题 | 互动数据 | 话题 |
   ...

   **新趋势/新话题**: ...
   ---

   然后问："要深入分析哪几条？"
   ```

2. **Command 6（启动爆款监控）增加进度可见性**：
   ```
   后台监控每完成一轮扫描，必须输出简报：

   "[监控] 第 {N} 轮扫描完成 | X: {n1}条 小红书: {n2}条 微信: {n3}条 |
    新发现高互动: {count}条 | 累计数据: {total}条"

   发现潜在爆款时，通知必须包含判断依据：
   "发现热门趋势：{topic}
   - 依据：{N}条相关内容，平均互动{avg}，最高互动{max}
   - 时间跨度：最早{date1}，最新{date2}
   - 代表内容：{title1}, {title2}"
   ```

3. **monitor-config.md 增加用户可控参数**：
   ```markdown
   ## 筛选配置
   抓取源: bird home (X timeline), xhs search, wechat search
   每次抓取条数: 20
   筛选阈值:
   - X/Twitter: 点赞 > 100 或 转发 > 50
   - 小红书: 点赞 > 500 或 收藏 > 200
   - 微信公众号: 在看 > 100
   监控频率: 每 4 小时（后台模式）

   ## 监控关键词（可选，留空则只读 timeline）
   - AI
   - 写作
   - ...

   ## 排除关键词
   - ...
   ```

---

#### 修复 7: bird CLI 全局配置 cookie-source

**根因**: lessons.md 记录了"用 `--cookie-source chrome`"的规则，但：
- topic-manager.md 的命令示例没有加这个 flag
- SKILL.md Step 2 的 bird search 也没有加
- AI 不一定每次都读 lessons.md 并应用到 bird 命令上

**修改方案（双保险）**:

1. **创建全局 bird 配置文件** `~/.config/bird/config.json5`：
   ```json5
   {
     cookieSource: "chrome"
   }
   ```
   这样所有 bird 命令自动使用 Chrome cookie，不需要每次加 flag。

2. **更新技能文件中所有 bird 命令示例**（已包含在修复 5 中）：
   - `skills/topic-manager.md`: 所有 bird 命令加 `--cookie-source chrome`
   - `SKILL.md` Step 2: `bird search` 加 `--cookie-source chrome`

---

#### 修复 8: Step 2【必做】搜索爆款必须有可见产出

**根因**: SKILL.md 标注了"【必做】Search target platform for popular content on the same topic"，进度文件也打了勾，但用户完全无法验证这一步到底做了没有、做了多深。进度文件只写"Searched target platform for popular content on the same topic"，没有任何搜索结果的记录。

**问题本质**: 进度文件的 checkbox 只记录了"声称做了"，没有记录"做了什么"。一个没有证据的 checkbox 等于没有 checkbox。

**修改文件**: `SKILL.md` Step 2

**修改内容**:

1. **搜索结果必须写入进度文件的 Session Notes**：
   ```
   **【必做】搜索完成后，必须在进度文件 Session Notes 中记录以下信息：**

   ### Step 2 平台搜索记录
   **平台**: {platform}
   **搜索命令**:
   - `{actual command executed 1}`
   - `{actual command executed 2}`
   **搜索关键词**: {keywords used}
   **返回结果数**: {N} 条
   **筛选后高互动内容**: {N} 条

   **Top 3-5 高互动内容**:
   | # | 标题 | 作者 | 互动数据 | 有参考价值的点 |
   |---|------|------|---------|-------------|
   | 1 | ... | ... | ... | 标题用了对比句式 |
   | 2 | ... | ... | ... | 开头用数据冲击 |

   **提取的模式/发现**:
   - {pattern 1}
   - {pattern 2}

   如果搜索结果为空或无高互动内容，也必须记录：
   "搜索 {platform} 关键词 '{keywords}'，返回 {N} 条，无明显高互动内容。"
   ```

2. **如果用户要求深入分析某条搜索结果**，调用 topic-manager 的"分析爆款"流程，产出物保存到 `assets/topics/benchmarks/`

3. **进度文件 checklist 从单行改为多行**：
   ```
   - [ ] Searched target platform: {platform name}
   - [ ] Search results recorded in Session Notes (commands, keywords, top results)
   - [ ] Patterns extracted and noted
   ```
   替换原来的单行：
   ```
   - [ ] Searched target platform for popular content on the same topic
   ```

---

#### 修复 9: 全流程完成后强制自检进度文件

**根因**: chunwan-tech-roadshow 会话中，Step 9 的 5 个 checkbox 全部未勾，但流程直接进入了 Step 10 并完成发布。没有任何机制在最后一步检查进度文件的完整性。

**问题本质**: 进度文件是"路线图"，但只有起点处读取、中途更新，没有终点处校验。缺少闭环。

**修改文件**: `SKILL.md` Step 10 末尾 + 进度文件模板

**修改内容**:

1. **在 Step 10 末尾（或最后执行的步骤之后）增加强制自检**：
   ```
   ### 流程完成自检（不可跳过）

   > **在标记会话完成之前，必须执行以下自检：**
   >
   > 1. **读取进度文件**，逐步检查所有 checkbox
   > 2. **标记遗漏**：如果发现任何应勾未勾的 checkbox：
   >    - 如果是确实执行了但忘记标记 → 补标并注明"自检时补标"
   >    - 如果是确实跳过了 → 在 Session Notes 中记录原因，并询问用户是否需要补做
   > 3. **检查 Corrections Log**：确认所有 correction 都有 Case File，没有 Pending
   > 4. **检查 Step 9**：确认 Step 9 所有子步骤已执行（Step 9 不可跳过）
   > 5. **向用户报告自检结果**：
   >    - "自检完成，所有步骤已执行。" 或
   >    - "自检发现以下遗漏：{list}。需要补做吗？"
   ```

2. **在进度文件模板末尾增加自检区域**：
   ```markdown
   ## 流程自检
   - [ ] 所有 Step checkbox 已核对
   - [ ] 无未闭合的 Corrections Log 条目
   - [ ] Step 9 已执行（不可跳过）
   - [ ] 自检结果已告知用户
   **自检时间**: ____
   **自检结果**: ____
   ```

---

#### 实施计划

| 优先级 | 修复 | 修改文件 | 工作量 |
|--------|------|---------|-------|
| P0 | #7 bird 全局配置 | ~/.config/bird/config.json5 | 1 行 |
| P0 | #5 监控指令一致性 | skills/topic-manager.md | 中 |
| P0 | #6 监控透明度 | skills/topic-manager.md, monitor-config.md | 大 |
| P0 | #8 Step 2 搜索可见产出 | SKILL.md | 中 |
| P1 | #3 Step 9 不可跳过 | SKILL.md | 小 |
| P1 | #1 Step 6 强制调用技能 | SKILL.md | 小 |
| P1 | #2 Step 7 强制调用技能 | SKILL.md | 小 |
| P1 | #9 流程完成自检 | SKILL.md | 小 |
| P2 | #4 Step 8 交互要求 | SKILL.md | 小 |

**修改文件总览**:
- `SKILL.md` — Step 2, 6, 7, 8, 9, 10 修改 + 进度模板更新（修复 1, 2, 3, 4, 8, 9）
- `skills/topic-manager.md` — trigger 扩展 + 命令内嵌规则 + 透明度报告（修复 5, 6）
- `assets/topics/benchmarks/monitor-config.md` — 增加分平台阈值和关键词配置（修复 6）
- `~/.config/bird/config.json5` — 新建全局配置（修复 7）

### Phase 12: 实时热点 + 命令失败记录 + 依赖前置预检 (2026-02-17)

**触发事件**: ai-spring-war-all-lose 完整流程用户反馈

**状态**: ✅ 已完成

**用户反馈 3 条**:

| # | 反馈 | 类别 |
|---|------|------|
| 1 | 热点不要按月搜索，要当下实时的热点 | 搜索策略 |
| 2 | 命令执行失败要记录，用于后续迭代修复 | 系统健壮性 |
| 3 | 小红书/微信依赖未安装导致搜索缺数据 | 依赖管理 |

---

#### 修复 1: 热点搜索实时化

**根因**: WebSearch 补充搜索时使用了"2月AI热点""本月趋势"等月度总结类搜索词，返回的是回顾性内容而非实时热点。

**修改文件**: `skills/topic-manager.md` Command 5 (监控爆款) Step 2

**修改内容**:
1. 新增 **实时性原则** 规则块，明确禁止搜索月度/周度总结
2. 所有平台搜索不加时间限定词，直接搜关键词获取最新内容
3. 优先使用 feeds/timeline 类接口（天然返回实时内容）
4. WebSearch 补充时禁止 "X月热点总结" 类查询，改用 "AI 热点 今天" 等实时搜索
5. 内容时效性标注：超过 3 天的标注为"非实时"
6. 透明度报告增加"发布时间"列，让用户可以验证时效性

---

#### 修复 2: 命令失败日志系统

**根因**: 命令执行失败后无记录，下次会话重复踩坑，无法追踪哪些依赖/配置有问题。

**修改文件**: `skills/topic-manager.md` (新增 "Command Failure Log" section) + `assets/experiences/command-failures.md` (新建)

**修改内容**:
1. 新增 "Command Failure Log" 规范，定义记录格式（命令、错误、原因、影响、修复建议、状态）
2. 创建 `assets/experiences/command-failures.md` 模板文件
3. 每次会话开始时读取并检查未修复 (🔴) 的问题
4. 透明度报告新增"命令失败记录"表格

---

#### 修复 3: 依赖前置预检（topic-manager 级别）

**根因**: 依赖检查只在 writing-assistant 的 Step 0 执行。topic-manager 的"看热点"命令独立运行时不经过 Step 0，导致缺失依赖时直接执行失败、静默跳过平台。

**修改文件**: `skills/topic-manager.md` (新增 "Dependency Pre-Check" section)

**修改内容**:
1. 新增 "Dependency Pre-Check" 流程，所有命令执行前必做
2. 检查各平台依赖可用性（bird CLI、xiaohongshu-mcp、wechat-article-search）
3. 缺失依赖时主动从 `dependencies/` 安装（告知用户）
4. 平台不可用时不静默跳过，必须在报告中标明
5. 透明度报告新增"平台可用性"表格
6. 在 Command 5 (监控爆款) 开头新增 "Step 0: 依赖预检"

---

**修改文件总览**:
- `skills/topic-manager.md` — 新增依赖预检 + 命令失败日志 + 实时搜索原则 + 透明度报告增强
- `assets/experiences/command-failures.md` — 新建命令失败日志文件

## 八、参考资料

- dontbesilent 系统架构：`dev/dev_reference_materials/dontbesilent/best_practice_reference.md`
- dontbesilent 三周协作分析：`dev/dev_reference_materials/dontbesilent/Claude Code：我和 dontbesilent 相处的三个星期.md`
- 当前 SKILL.md：`SKILL.md`
- README：`README.md`
