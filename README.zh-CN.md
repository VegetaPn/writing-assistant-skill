# Writing Assistant Skill - 写作助手技能

[English](README.md) | 简体中文

一个为 Claude Code 打造的端到端写作工作流技能，可将想法、素材或初稿转化为精美配图、可直接发布的文章。

## 概述

Writing Assistant 编排了从构思到发布的完整多步骤写作流程，帮助用户为博客、文章和社交媒体平台创建专业内容。

## 功能特性

- **多模式支持**：可从主题构思、整理素材或现有草稿开始
- **引用库系统**：内置写作风格、标题模式、开头技巧和文章结构的参考库，提供灵感
- **交互式问答**：智能提问系统,理解用户意图并收集必要细节
- **元素级精炼**：基于验证有效的模式提供标题、开头段落和结构建议
- **研究整合**：自动进行网络研究,用可信来源补充内容
- **内容润色**：集成 content-research-writer 进行专业级内容精炼
- **视觉增强**：使用 baoyu-xhs-images 自动生成插图
- **多平台发布**：支持直接发布到微信公众号或 X (Twitter)

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

**如果跳过此配置**：工作流程仍然可以运行，但第四步（插图生成）只会生成图片的文字描述。你需要手动创建实际图片或使用其他工具。

## 使用方法

在 Claude Code 中调用技能：

```
/writing-assistant
```

或直接向 Claude 请求写作任务：
- "我想写一篇关于...的文章"
- "帮我润色这篇草稿..."
- "我有一些素材想整理成博客文章..."

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

**按主题组织：**
- "把这篇文章保存到引用库的 AI 主题下"
- "创建一个新的生产力文章主题文件夹"

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
├── by-element/                 # 写作元素
│   ├── titles/                 # 标题模式
│   ├── openings/               # 开头技巧
│   ├── structures/             # 文章结构
│   └── hooks/                  # 吸引读者的钩子
│
└── by-topic/                   # 按主题分类的示例
```

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

### 可选技能

- **generate-image** - 使用 AI 模型从描述生成实际图片（需要 OPENROUTER API 密钥）。**重要**：如果没有此技能，`baoyu-xhs-images` 只会生成图片的文字描述，而不是实际的图片文件。
- **baoyu-post-to-wechat** - 发布到微信公众号
- **baoyu-post-to-x** - 发布到 X/Twitter

### 图片生成要求

要生成**实际图片**（而不仅仅是描述）：
1. 安装 `generate-image` 技能（已包含在 dependencies 中）
2. 配置 OPENROUTER API 密钥（参见上面的配置部分）

如果没有 `generate-image`，工作流程仍然可以运行，但第四步只会生成图片描述，你需要手动创建图片。

### 手动安装

如果自动安装不起作用或你希望手动控制，可以直接复制技能：

```bash
# 从 writing-assistant 仓库根目录
# 项目本地安装
mkdir -p .claude/skills
cp -r dependencies/content-research-writer .claude/skills/
cp -r dependencies/baoyu-xhs-images .claude/skills/

# 或全局安装（对所有项目可用）
cp -r dependencies/content-research-writer ~/.claude/skills/
cp -r dependencies/baoyu-xhs-images ~/.claude/skills/
```

## 文件命名规范

工作流程使用一致的命名：
- 初稿：`{主题或标题}.md`
- 润色版本：`{主题或标题}-polished.md`
- 最终版本：`{主题或标题}-final.md`

## 最佳实践

1. **耐心回答问题**：花时间充分回答澄清性问题以获得最佳结果
2. **提供上下文**：提供的上下文越多，输出质量越好
3. **各阶段审阅**：在发布前检查草稿、润色版本和最终文章
4. **图片平衡**：图片应增强而非淹没内容
5. **平台考量**：发布前审阅特定平台的要求

## 示例

### 从主题开始

```
用户：我想写一篇关于人工智能在医疗保健领域未来的文章
技能：[询问关于受众、角度、要点的澄清问题]
用户：[提供答案]
技能：[研究、起草、润色、添加图片、创建最终文章]
```

### 精炼现有素材

```
用户：我有一些关于最近参加会议经历的笔记
技能：[询问文件路径、分析素材、澄清空白]
用户：[提供额外上下文]
技能：[整理成草稿、润色、用图片增强]
```

### 润色草稿

```
用户：我写了这篇草稿但需要改进 [提供文件]
技能：[直接进行润色和增强]
```

## 文件结构

```
writing-assistant-skill/
├── README.md                # 英文文档
├── README.zh-CN.md          # 中文文档
├── SKILL.md                 # Claude Code 的技能定义
├── writing-assistant.skill  # 打包的技能文件
├── references/              # 风格指导的引用库
│   ├── authors/             # 作者档案和写作风格
│   ├── by-element/          # 写作元素（标题、开头、结构、钩子）
│   └── by-topic/            # 按主题分类的文章示例
└── dependencies/            # 打包的依赖技能
    ├── content-research-writer/
    ├── baoyu-xhs-images/
    ├── generate-image/
    ├── baoyu-post-to-wechat/
    └── baoyu-post-to-x/
```

## 贡献

欢迎贡献、问题反馈和功能请求。如果你想贡献，请随时查看 issues 页面。

## 许可证

MIT License

## 作者

[VegetaPn GitHub](https://github.com/VegetaPn)

## 更新日志

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
