# Writing Assistant Skill - 写作助手技能

[English](README.md) | 简体中文

一个为 Claude Code 打造的端到端写作工作流技能，可将想法、素材或初稿转化为精美配图、可直接发布的文章——内置选题管理、爆款对标、经验沉淀和多平台发布能力。

## 概述

Writing Assistant 编排了从构思到发布的完整多步骤写作流程，帮助用户为博客、文章和社交媒体平台创建专业内容。它不仅是一个写作工具，更是一个**可持续沉淀的内容创作系统**——每次创作都在积累知识、参考和经验。

## 功能特性

- **多模式支持**：可从主题构思、整理素材或现有草稿开始
- **子技能架构**：模块化设计，子技能可独立调用（标题生成、选题管理、经验记录）
- **三层内容系统**：System → User → Project 层级结构，自动合并参考和资产，冲突时低层覆盖高层
- **选题管理**：完整选题生命周期，从灵感收集（inbox）到深化研究，整合爆款对标
- **引用库系统**：内置写作风格、标题模式、开头技巧、文章结构及心理学写作方法论
- **经验沉淀**：自动记录用户纠正，提炼经验教训，避免重复犯错
- **实时平台搜索**：写作前强制搜索目标平台当下热门内容
- **交互式问答**：智能提问系统，理解用户意图并收集必要细节
- **元素级精炼**：基于验证有效的模式和方法论提供标题、开头段落和结构建议
- **研究整合**：自动进行网络研究，用可信来源补充内容
- **内容润色**：集成 content-research-writer 进行专业级内容精炼
- **视觉增强**：使用 baoyu-xhs-images + generate-image 自动生成插图
- **进度追踪**：每次会话独立的进度追踪器，含逐步 checklist、纠正记录和流程完成自检
- **多平台发布**：支持直接发布到微信公众号、小红书或 X (Twitter)
- **多平台适配**：一篇文章适配多个平台，自动调整风格、长度和语气

## 安装

### 方式一：让 Claude Code 帮你安装（推荐）

直接向 Claude Code 请求安装此技能：

```
Install the writing-assistant skill from https://github.com/VegetaPn/writing-assistant-skill to my project directory
```

Claude 会自动下载并设置该技能及所有打包的依赖项。

### 方式二：手动安装

下载并解压技能到你的项目：

```bash
# 下载最新版本
curl -L https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip -o writing-assistant-skill.zip

# 解压到项目的 .claude/skills 目录
mkdir -p .claude/skills
unzip writing-assistant-skill.zip -d .claude/skills/
mv .claude/skills/writing-assistant-skill-main .claude/skills/writing-assistant

# 清理
rm writing-assistant-skill.zip
```

或者手动下载：
1. 访问 https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip
2. 下载并解压 ZIP 文件
3. 将解压后的文件夹移动到项目目录下的 `.claude/skills/writing-assistant/`

## 配置

### 图片生成环境设置

**重要说明**：`baoyu-xhs-images` 技能生成图片描述和布局。要将这些描述转换为实际图片，你需要配合使用 `generate-image` 技能和 OPENROUTER API。

**如果你想生成实际图片**（而不仅仅是描述），请按照以下步骤操作：

1. **获取 OPENROUTER API 密钥**：
   - 访问 [OpenRouter](https://openrouter.ai/)
   - 注册或登录你的账户
   - 从仪表板生成 API 密钥

2. **在项目根目录创建 `.env` 文件**：
   ```bash
   # 创建 .env 文件
   touch .env
   ```

3. **将 OPENROUTER API 密钥添加到 `.env` 文件**：
   ```bash
   OPENROUTER_API_KEY=你的API密钥
   ```

4. **验证配置**：
   ```bash
   # 检查 .env 文件是否存在并包含密钥
   cat .env
   ```

**安全提示**：将 `.env` 添加到你的 `.gitignore` 以保护 API 密钥安全：
```bash
echo ".env" >> .gitignore
```

**如果跳过此配置**：工作流程仍然可以运行，但第七步（插图生成）只会生成图片的文字描述。你需要手动创建实际图片或使用其他工具。

## 使用方法

### 写作工作流

在 Claude Code 中调用技能：

```
/writing-assistant
```

或直接向 Claude 请求写作任务：
- "我想写一篇关于...的文章"
- "帮我润色这篇草稿..."
- "我有一些素材想整理成博客文章..."

### 选题管理

使用选题管理器捕捉和深化灵感：
- "记录选题：{你的想法}" — 保存到收集箱
- "看选题" — 查看选题管线
- "深化选题：{选题}" — 研究选题，对标爆款，生成大纲和标题候选

### 爆款对标

分析和监控热门内容：
- "分析爆款" + URL — 深度分析一条爆款内容
- "监控爆款" / "看热点" — 批量扫描各平台当前热门内容
- "启动爆款监控" — 启动后台长期监控进程

### 标题生成

独立生成平台优化标题：
- "生成标题" / "帮我起标题" — 为你的内容生成标题候选

### 经验管理

查看和管理积累的写作经验：
- "看经验" — 查看提炼的经验教训和最近的案例
- "总结经验" — 从所有案例中重新提炼规则

## 工作流程步骤

写作工作流包含 11 个步骤（Step 0–10）：

| 步骤 | 名称 | 说明 |
|------|------|------|
| 0 | 创建进度追踪器 | 初始化会话追踪文件、环境预检 |
| 1 | 选择模式 + 平台 | 从选题管线加载或全新开始；选定目标平台 |
| 2 | 搜索参考与方法论 | 搜索引用库、对标库、方法论，以及**目标平台**当下热门内容 |
| 3 | 收集与澄清 | 交互式提问（模式1和2），应用选定方法论 |
| 4 | 元素级参考 | 标题（通过 title-generator）、开头、结构、钩子——交叉引用方法论 |
| 5 | 处理草稿 | 仅模式3——在全文中应用方法论 |
| 6 | 润色 | 调用 content-research-writer，传入方法论指令 |
| 7 | 生成插图 | 调用 baoyu-xhs-images + generate-image |
| 8 | 创建最终文章 | 合并内容+图片，呈现给用户确认 |
| 9 | 审阅与平台适配 | 审阅、可选多平台适配（不可跳过） |
| 10 | 发布 | 可选——发布到微信、小红书或 X |

Step 10 之后，**强制执行流程自检**，核对进度追踪器完整性。

## 三层内容系统

资产（`assets/`）和引用（`references/`）遵循三层层级结构。读取时自动合并内容；冲突时低层覆盖高层。

| 层级 | 位置 | 用途 |
|------|------|------|
| **System** | `{skill-dir}/assets/`、`{skill-dir}/references/` | Skill 自带默认值，不可修改 |
| **User** | `{project-root}/assets/`、`{project-root}/references/` | 用户积累（经验、选题、对标、参考） |
| **Project** | `outputs/{topic-slug}/assets/`、`outputs/{topic-slug}/references/` | 单篇文章 override（按需创建） |

**读取协议（`READ:3L`）**：检查三层，合并内容，标注来源。冲突解决：project > user > system。

**写入协议**：每个操作指定目标层级——`WRITE:user`（默认）或 `WRITE:project`（文章特定）。

## 引用库

引用库（`references/`）提供写作风格指导、写作模式和灵感来源。你可以通过与 Claude Code 自然对话来构建和使用它。

### 构建引用库

直接告诉 Claude Code 你想添加什么：

**添加作者写作风格：**
- "分析 Dan Koe 的写作风格并添加到我的引用库"
- "把这篇文章添加到我的引用库，并提取写作模式"
- "基于这些文章为{作者名}创建一个风格档案：{URL或文件路径}"

**添加写作元素：**
- "从这篇文章中提取标题模式，添加到我的标题引用"
- "分析这个开头段落并保存为引用"
- "把这篇文章的结构作为模板添加到我的引用库"

**通过爆款分析自动充实：**
当你分析爆款内容（"分析爆款"）时，系统会自动提取模式并添加到引用库——标题模式、开头技巧和结构模板自然增长。

### 使用引用库

在写作工作流程中，技能会自动搜索你的引用库。你也可以明确请求特定风格：

- "用 Dan Koe 的风格写这篇文章"
- "使用我引用库中的假设颠覆式标题模式"
- "应用焦虑共鸣的开头技巧"
- "显示我有哪些可用的作者风格"
- "我的引用库中有哪些标题模式？"

### 引用库结构

```
references/
├── authors/                    # 作者档案和文章
│   └── {作者名}/
│       ├── profile.md          # 写作风格分析
│       └── articles/           # 示例文章
│
├── by-element/                 # 写作元素（案例驱动）
│   ├── titles/                 # 标题模式
│   ├── openings/               # 开头技巧
│   ├── structures/             # 文章结构
│   └── hooks/                  # 吸引读者的钩子
│
└── techniques/                 # 方法论层面的技巧说明（原理驱动）
    └── psychology/             # 心理学方法论
        ├── psychology-index.md # 方法论索引（结构化汇总）
        └── content-funnel.md   # 内容营销漏斗方法论
```

**案例库 vs 方法论库的区别：**
- `by-element/`（案例库）：这篇文章的标题是什么，为什么好
- `techniques/`（方法论库）：什么是好标题的底层原理，如何系统性地创造好内容

**方法论条目格式：**
每个方法论包含：核心框架 → 心理学机制 → 为什么有效 → 应用场景 → 实践指南 → 案例分析

## 子技能

技能采用主编排器（`SKILL.md`）+ 可独立调用的子技能架构：

| 子技能 | 文件 | 功能 | 独立使用场景 |
|--------|------|------|-------------|
| **标题生成器** | `skills/title-generator.md` | 平台优化标题生成（小红书/公众号/抖音/X），去 AI 味规则，标题类型分布 | "帮我给这篇文章想 5 个小红书标题" |
| **选题管理器** | `skills/topic-manager.md` | 选题生命周期（inbox → developing）+ 爆款对标（分析爆款/监控爆款/后台监控） | "记录选题" "看热点" |
| **经验追踪器** | `skills/experience-tracker.md` | 自动记录用户纠正为案例，提炼经验教训 | "看经验" "总结经验" |

子技能为项目本地技能——无需安装。它们位于 `skills/` 目录中，可以直接调用或作为写作工作流的一部分使用。

## 依赖项

此技能需要几个其他技能才能正常工作。这些依赖项已**打包在仓库中**以方便使用，并会在需要时自动安装。

### 自动安装

当你运行 `/writing-assistant` 时，技能会自动：
1. 检查哪些依赖项已安装
2. 提供从打包版本安装缺失依赖项的选项
3. 在你同意后将它们复制到项目的 `.claude/skills/` 目录

这确保了无缝体验，无需手动查找和安装每个依赖项。

### 必需技能

- **content-research-writer** - 以专业写作质量润色和精炼内容
- **baoyu-xhs-images** - 生成小红书风格的插图描述和布局
- **xiaohongshu-mcp** - 小红书搜索、分析和发布（需要本地 MCP server 运行）
- **wechat-article-search** - 微信公众号文章搜索
- **generate-image** - 使用 AI 模型从描述生成实际图片（需要 OPENROUTER API 密钥）
- **baoyu-post-to-wechat** - 发布到微信公众号
- **baoyu-post-to-x** - 发布到 X/Twitter

### 图片生成要求

要生成**实际图片**（而不仅仅是描述）：
1. 安装 `generate-image` 技能（已包含在 dependencies 中）
2. 配置 OPENROUTER API 密钥（参见上面的配置部分）

如果没有 `generate-image`，工作流程仍然可以运行，但第七步只会生成图片描述，你需要手动创建图片。

### 手动安装

如果自动安装不起作用或你希望手动控制，可以直接复制技能：

```bash
# 从 writing-assistant 仓库根目录
# 项目本地安装
mkdir -p .claude/skills
cp -r dependencies/content-research-writer .claude/skills/
cp -r dependencies/baoyu-xhs-images .claude/skills/
cp -r dependencies/xiaohongshu-mcp .claude/skills/
cp -r dependencies/wechat-article-search .claude/skills/

# 或全局安装（对所有项目可用）
cp -r dependencies/content-research-writer ~/.claude/skills/
cp -r dependencies/baoyu-xhs-images ~/.claude/skills/
```

## 输出目录规范

所有输出文件存储在 `outputs/{topic-slug}/` 下：

```
outputs/{topic-slug}/
├── {topic-slug}-progress.md      # 进度追踪器
├── {topic-slug}.md               # 初稿
├── {topic-slug}-polished.md      # 润色版本
├── {topic-slug}-final.md         # 最终版本
├── {topic-slug}-{platform}.md    # 平台适配版本
└── xhs-images/                   # 插图
    ├── outline.md
    ├── prompts/
    └── *.png
```

## 文件结构

```
writing-assistant-skill/
├── README.md                      # 英文文档
├── README.zh-CN.md                # 中文文档
├── CLAUDE.md                      # Claude Code 的代码库说明
├── SKILL.md                       # 主写作工作流（"大脑"）
│
├── skills/                        # 子技能（项目本地，无需安装）
│   ├── title-generator.md         # 平台优化标题生成
│   ├── topic-manager.md           # 选题生命周期 + 爆款对标
│   └── experience-tracker.md      # 纠正记录 + 经验提炼
│
├── assets/                        # 系统层默认值（随 skill 一起发布）
│   ├── topics/
│   │   ├── inbox.md
│   │   ├── developing/
│   │   └── benchmarks/
│   │       ├── benchmarks-index.md
│   │       └── monitor-config.md
│   └── experiences/
│       ├── cases/
│       ├── lessons.md
│       └── command-failures.md
│
├── references/                    # 系统层引用库
│   ├── authors/                   # 作者档案和写作风格
│   │   └── dan-koe/
│   ├── by-element/                # 写作元素（标题、开头、结构、钩子）
│   └── techniques/                # 方法论层面的技巧说明
│       └── psychology/
│
├── config/                        # 工具配置
│
├── dependencies/                  # 打包的依赖技能
│   ├── content-research-writer/
│   ├── baoyu-xhs-images/
│   ├── generate-image/
│   ├── xiaohongshu-mcp/
│   ├── wechat-article-search/
│   ├── baoyu-post-to-wechat/
│   └── baoyu-post-to-x/
│
└── dev/                           # 开发文档和迭代计划
    └── iteration-plan.md
```

## 最佳实践

1. **耐心回答问题**：花时间充分回答澄清性问题以获得最佳结果
2. **提供上下文**：提供的上下文越多，输出质量越好
3. **各阶段审阅**：在发布前检查草稿、润色版本和最终文章
4. **图片平衡**：图片应增强而非淹没内容
5. **平台考量**：发布前审阅特定平台的要求
6. **积累引用库**：定期分析爆款内容，让引用库自然增长
7. **写作前查看经验**：系统会自动检查经验教训，你也可以用"看经验"主动查看
8. **善用选题管线**：灵感来了就"记录选题"，之后再深化——不要错过灵感

## 示例

### 从主题开始

```
用户：我想写一篇关于人工智能在医疗保健领域未来的文章
技能：[创建进度追踪器，询问平台，搜索参考库和平台热门内容]
技能：[询问关于受众、角度、要点的澄清问题]
用户：[提供答案]
技能：[生成标题选项，精炼开头和结构]
技能：[润色草稿，生成插图，创建最终文章]
技能：[与用户审阅，可选平台适配，发布]
```

### 使用选题管线

```
用户：记录选题：AI 正在让每个人都变成创作者
技能：[保存到 inbox.md]
...之后...
用户：深化选题：AI 创作者
技能：[搜索对标库，研究选题，生成大纲和标题候选]
...之后...
用户：/writing-assistant
技能：[找到已深化的选题，进入写作工作流]
```

### 监控热点

```
用户：看热点
技能：[扫描 X 时间线、小红书、微信公众号的热门内容]
技能：[呈现透明度报告：平台可用性、扫描结果、热门内容排行]
用户：深入分析第 3 条
技能：[执行爆款深度分析，提取模式，提供转化为选题的选项]
```

## 贡献

欢迎贡献、问题反馈和功能请求。如果你想贡献，请随时查看 issues 页面。

## 许可证

MIT License

## 作者

[VegetaPn GitHub](https://github.com/VegetaPn)

## 更新日志

### 版本 2.0.0 (2026-02-17)

**架构全面升级——从线性写作工具进化为可持续沉淀的内容创作系统。**

- **子技能架构**：将单体技能拆分为模块化子技能（title-generator、topic-manager、experience-tracker），每个可独立调用
- **三层内容系统**：引入 system/user/project 层级结构，支持 `READ:3L` 合并协议和 `WRITE:user`/`WRITE:project` 定向写入
- **选题管理系统**：完整选题生命周期——灵感收集箱、选题深化（含对标和大纲）、与写作工作流无缝对接
- **爆款对标**：深度分析单条爆款内容、跨平台批量扫描热门内容（X、小红书、微信）、后台监控并生成透明度报告
- **经验沉淀**：自动检测用户纠正、记录案例、提炼教训——形成反馈闭环，避免重复犯错
- **进度追踪器**：每次会话独立的 checklist，含逐步追踪、纠正记录和强制流程完成自检
- **写作方法论整合**：心理学方法论（内容营销漏斗）贯穿整个写作过程，而非仅应用于元素层面
- **实时平台搜索**：写作前强制搜索目标平台当下热门内容（Step 2）
- **多平台适配**：一篇文章适配多个平台，重新评估方法论并应用平台特定风格
- **扩展工作流**：11 步流程（Step 0–10），每个交互步骤后设有经验检查点
- **新增依赖**：添加 xiaohongshu-mcp（小红书搜索/发布）和 wechat-article-search（微信文章搜索）
- **可靠性改进**：强制通过 Skill 工具调用技能（Step 6、7）、不可跳过的 Step 9 审阅、Step 8 用户确认、命令失败日志、依赖前置预检
- **输出目录规范**：所有输出统一存放在 `outputs/{topic-slug}/` 下

### 版本 1.2.0 (2026-02-04)
- **引用库系统**：添加 `references/` 目录，包含作者档案、写作元素和主题示例
- **风格指导**：搜索并应用参考作者的写作风格
- **元素级精炼**：基于验证有效的模式精炼标题、开头和文章结构
- **Hook 整合**：在文章中规划和整合引人入胜的钩子

### 版本 1.1.0 (2026-01-31)
- **打包依赖项**：所有必需技能现在都包含在仓库中，包括 generate-image 用于实际图片生成
- **自动依赖安装**：技能自动检查并将缺失的依赖项安装到项目目录
- **改进用户体验**：用户不再需要手动查找和安装依赖项
- **增强文档**：提供多种选项的全面安装指南，包括 OPENROUTER 配置说明
- **项目本地安装**：依赖项安装到 `.claude/skills/` 以实现特定项目的设置
- **图片生成支持**：添加了 generate-image 技能和配置指南，支持生成实际图片

### 版本 1.0.0
- 初始发布
- 支持三种起始模式（主题、素材、草稿）
- 集成 content-research-writer 和 baoyu-xhs-images
- 支持发布到微信和 X 平台