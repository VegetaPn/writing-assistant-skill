# Writing Assistant Skill

[English](README.md) | 简体中文

一个 Claude Code 技能，编排从构思到发布的端到端写作流程——自动生成配图、内置选题管理、爆款对标、经验沉淀和多平台发布。

## 快速开始

### 安装

让 Claude Code 帮你安装：

```
Install the writing-assistant skill from https://github.com/VegetaPn/writing-assistant-skill to my project directory
```

<details>
<summary>手动安装</summary>

```bash
curl -L https://github.com/VegetaPn/writing-assistant-skill/archive/refs/heads/main.zip -o writing-assistant-skill.zip
mkdir -p .claude/skills
unzip writing-assistant-skill.zip -d .claude/skills/
mv .claude/skills/writing-assistant-skill-main .claude/skills/writing-assistant
rm writing-assistant-skill.zip
```

</details>

### 使用

```
/writing-assistant
```

或者直接跟 Claude 说：

```
我想写一篇关于注意力经济的文章，发小红书
```

就这样，技能会交互式引导你完成整个流程。

## 功能一览

### 写作工作流（11 步，全程引导）

| 阶段 | 做什么 |
|------|--------|
| **准备** | 环境检查、进度追踪器、选择目标平台 |
| **调研** | 搜索引用库、分析平台热门内容、选择写作方法论 |
| **成稿** | 交互式提问澄清意图 → 应用方法论生成结构化初稿 |
| **精炼** | 元素级优化（标题、开头、结构、钩子） |
| **润色** | 通过 content-research-writer 专业级润色 |
| **配图** | 通过 baoyu-xhs-images + generate-image 自动生成插图 |
| **发布** | 审阅 → 多平台适配 → 发布到微信公众号 / 小红书 / X |

三种起始模式：**主题构思**、**零散素材**、**现有草稿**。

### 选题管理

| 命令 | 说明 |
|------|------|
| `记录选题：{想法}` | 保存灵感到收集箱 |
| `看选题` | 查看选题管线 |
| `深化选题：{选题}` | 对标爆款、生成大纲和标题候选 |

### 爆款对标

| 命令 | 说明 |
|------|------|
| `分析爆款` + URL | 深度分析一条爆款内容 |
| `监控爆款` / `看热点` | 批量扫描各平台热门内容 |
| `启动爆款监控` | 启动后台长期监控 |

### 标题生成

| 命令 | 说明 |
|------|------|
| `生成标题` / `帮我起标题` | 生成平台优化的标题候选 |

### 经验系统

| 命令 | 说明 |
|------|------|
| `看经验` | 查看提炼的经验教训和最近案例 |
| `总结经验` | 从所有案例重新提炼规则 |

## 核心特性

**内容创作**
- 三种输入模式：主题构思 / 零散素材 / 现有草稿
- 智能提问——根据具体内容定制问题，不套模板
- 心理学写作方法论（内容漏斗、情绪钩子）贯穿全文
- 从一开始就感知平台——长度、语气、结构自动适配目标平台

**引用与学习系统**
- 三层内容体系（系统 → 用户 → 项目），读取时自动合并
- 引用库：作者风格、标题模式、开头技巧、结构模板
- 爆款对标：分析爆款、提取模式，引用库自然增长
- 经验沉淀：自动记录纠正 → 提炼教训 → 避免重复犯错

**生产流水线**
- 通过 content-research-writer 专业润色
- 通过 baoyu-xhs-images + generate-image 自动生成插图
- 每次会话独立的进度追踪器，含逐步 checklist
- 多平台发布：微信公众号、小红书、X/Twitter
- 一篇文章 → 多平台适配，自动调整风格和格式

## 配置

### 图片生成（可选）

要生成实际图片（而不仅是描述），需配置 OPENROUTER API：

1. 在 [OpenRouter](https://openrouter.ai/) 获取 API 密钥
2. 在项目根目录的 `.env` 文件中添加：
   ```
   OPENROUTER_API_KEY=你的密钥
   ```
3. 将 `.env` 加入 `.gitignore`

不配置也能正常使用——第七步会生成图片描述，你可以手动创建图片。

## 依赖项

所有依赖已**打包在仓库中**，首次运行时自动安装：

| 技能 | 用途 |
|------|------|
| content-research-writer | 内容润色 |
| baoyu-xhs-images | 插图生成 |
| generate-image | AI 图片生成（需 OPENROUTER API） |
| xiaohongshu | 小红书文案创作、搜索与发布 |
| wechat-article-search | 微信公众号文章搜索 |
| baoyu-post-to-wechat | 微信公众号发布 |
| baoyu-post-to-x | X/Twitter 发布 |

<details>
<summary>手动安装依赖</summary>

```bash
mkdir -p .claude/skills
cp -r dependencies/<skill-name> .claude/skills/
```

</details>

## 架构

<details>
<summary>文件结构</summary>

```
writing-assistant-skill/
├── SKILL.md                       # 主工作流编排器
├── skills/                        # 子技能（项目本地，无需安装）
│   ├── title-generator.md         # 平台优化标题生成
│   ├── content-adapter.md         # 多平台内容适配
│   ├── topic-manager.md           # 选题生命周期 + 爆款对标
│   └── experience-tracker.md      # 纠正记录 + 经验提炼
├── assets/                        # 系统层默认值
├── references/                    # 系统层引用库
│   ├── authors/                   # 作者档案与风格
│   ├── by-element/                # 写作元素（案例）
│   └── techniques/                # 方法论（原理）
├── dependencies/                  # 打包的依赖技能
└── outputs/                       # 生成的文章
```

</details>

<details>
<summary>三层内容系统</summary>

资产和引用采用三层层级结构，读取时自动合并，冲突时低层覆盖高层。

| 层级 | 位置 | 用途 |
|------|------|------|
| **System** | `{skill-dir}/assets/`、`{skill-dir}/references/` | Skill 自带默认值（只读） |
| **User** | `{project-root}/assets/`、`{project-root}/references/` | 用户积累的知识 |
| **Project** | `outputs/{topic-slug}/assets/`、`outputs/{topic-slug}/references/` | 单篇文章 override |

</details>

<details>
<summary>输出目录</summary>

```
outputs/{topic-slug}/
├── {topic-slug}-progress.md      # 进度追踪器
├── {topic-slug}.md               # 初稿
├── {topic-slug}-polished.md      # 润色版本
├── {topic-slug}-final.md         # 最终版本
├── {topic-slug}-{platform}.md    # 平台适配版本
└── xhs-images/                   # 插图
```

</details>

## 贡献

欢迎贡献、问题反馈和功能请求，请访问 [issues 页面](https://github.com/VegetaPn/writing-assistant-skill/issues)。

## 许可证

MIT License

## 作者

[VegetaPn](https://github.com/VegetaPn)

## 更新日志

### 2.0.0 (2026-02-17)

架构全面升级——从线性写作工具进化为可持续沉淀的内容创作系统。

- 子技能架构（title-generator、topic-manager、experience-tracker）
- 三层内容系统与合并协议
- 选题管理：收集箱 → 深化 → 写作工作流
- 爆款对标：单条分析、批量扫描、后台监控
- 经验沉淀：自动检测纠正 → 案例 → 提炼教训
- 心理学写作方法论整合
- 写作前实时搜索目标平台热门内容
- 多平台适配
- 进度追踪器（含执行日志和流程复盘）

### 1.2.0 (2026-02-04)

- 引用库系统（作者档案、写作元素、方法论）
- 元素级精炼（标题、开头、结构、钩子）

### 1.1.0 (2026-01-31)

- 打包依赖项，支持自动安装
- 图片生成支持（OPENROUTER）

### 1.0.0

- 初始发布：三种起始模式、内容润色、图片生成、微信/X 发布
