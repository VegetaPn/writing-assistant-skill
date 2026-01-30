# Writing Assistant Skill - 写作助手技能

[English](README.md) | 简体中文

一个为 Claude Code 打造的端到端写作工作流技能，可将想法、素材或初稿转化为精美配图、可直接发布的文章。

## 概述

Writing Assistant 编排了从构思到发布的完整多步骤写作流程，帮助用户为博客、文章和社交媒体平台创建专业内容。

## 功能特性

- **多模式支持**：可从主题构思、整理素材或现有草稿开始
- **交互式问答**：智能提问系统,理解用户意图并收集必要细节
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

## 使用方法

在 Claude Code 中调用技能：

```
/writing-assistant
```

或直接向 Claude 请求写作任务：
- "我想写一篇关于...的文章"
- "帮我润色这篇草稿..."
- "我有一些素材想整理成博客文章..."

## 工作流程

### 第一步：选择起点

技能支持三种模式：

**模式 1：基于主题**
- 仅从主题或话题开始
- 适合从零开始头脑风暴

**模式 2：基于素材**
- 提供松散组织的笔记、参考资料或研究材料
- 适合将现有素材整理成连贯内容

**模式 3：基于草稿**
- 从未润色的初稿开始
- 适合精炼和改进现有内容

### 第二步：交互式问答（模式 1 和 2）

技能将：
1. 分析你提供的内容
2. 提出针对性的、与内容相关的问题
3. 如有需要进行补充研究
4. 将所有内容整理成初稿

### 第三步：润色与精炼

使用 `content-research-writer` 技能：
- 改进结构和流畅度
- 增强吸引力和参与度
- 添加引用和研究资料
- 提升写作质量

### 第四步：添加插图

使用 `baoyu-xhs-images` 技能：
- 生成合适的视觉元素
- 创建信息图风格的图片
- 用视觉元素强化关键要点

### 第五步：最终组装

将润色后的内容与生成的图片组合成可直接发布的文章。

### 第六步：发布（可选）

支持直接发布到：
- **微信公众号** 通过 `baoyu-post-to-wechat`
- **X/Twitter** 通过 `baoyu-post-to-x` 或 `x-article-publisher`

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
- **baoyu-xhs-images** - 生成小红书风格的插图和信息图

### 可选技能

- **baoyu-post-to-wechat** - 发布到微信公众号
- **baoyu-post-to-x** - 发布到 X/Twitter

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
└── dependencies/            # 打包的依赖技能
    ├── content-research-writer/
    ├── baoyu-xhs-images/
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

### 版本 1.1.0 (2026-01-31)
- **打包依赖项**：所有必需技能现在都包含在仓库中
- **自动依赖安装**：技能自动检查并将缺失的依赖项安装到项目目录
- **改进用户体验**：用户不再需要手动查找和安装依赖项
- **增强文档**：提供多种选项的全面安装指南
- **项目本地安装**：依赖项安装到 `.claude/skills/` 以实现特定项目的设置

### 版本 1.0.0
- 初始发布
- 支持三种起始模式（主题、素材、草稿）
- 集成 content-research-writer 和 baoyu-xhs-images
- 支持发布到微信和 X 平台
