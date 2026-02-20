# Writing Assistant - 桌面应用

[English](README.md) | 简体中文

Writing Assistant 的桌面 GUI —— CLI 技能的全部能力，加上可视化界面，覆盖完整写作流程、选题管理、热点监控和经验沉淀。

## 前置条件

- **Node.js** >= 18
- **npm** >= 9
- **Claude Code CLI**（`claude`）已安装并认证 —— 应用在底层调用它完成所有 AI 交互

可选（完整功能需要）：

- **Python 3** —— 小红书 MCP 客户端
- **bird CLI** —— X/Twitter 热点扫描
- **OPENROUTER_API_KEY** —— AI 图片生成

## 快速开始

```bash
# 安装依赖
npm install

# 构建
npm run build

# 启动
npm start
```

应用会作为原生桌面窗口打开。

## 开发

```bash
# 同时启动主进程监听和 Vite 开发服务器
npm run dev
```

并行运行两个进程：
- **主进程**：`tsc --watch` 编译 `src/main/` 到 `dist/main/`
- **渲染进程**：Vite 开发服务器运行在 `http://localhost:5173`，支持热更新

开发模式下 Electron 窗口连接 Vite 开发服务器，UI 变更即时生效。

### 构建命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发模式（主进程监听 + Vite HMR） |
| `npm run build` | 生产构建（主进程 + 渲染进程） |
| `npm run build:main` | 仅构建主进程 |
| `npm run build:renderer` | 仅构建渲染进程 |
| `npm start` | 启动已构建的应用 |
| `npm run pack` | 打包应用（未压缩，用于测试） |
| `npm run dist` | 打包应用（可分发的 DMG/NSIS/AppImage） |

## 架构

```
Electron 主进程
├── AgentSDKManager     — 调用 `claude` CLI 进行 AI 交互
├── FileSystemService   — 三层内容读写（system/user/project）
├── SubprocessManager   — 子进程管理，支持代理
├── BackgroundMonitor   — 定时热点扫描（node-cron，支持分钟级）
├── ProxyManager        — HTTP/SOCKS 代理配置
├── NotificationService — 应用内 + 系统级通知
└── EnvChecker          — 环境依赖检查

IPC 桥接（contextBridge / preload.ts）

Electron 渲染进程（React + TypeScript）
├── 页面：仪表盘、写作工作台、选题管理、热点监控、
│        参考库、经验中心、数据指标、设置
├── 状态：Zustand（应用状态）+ TanStack Query（数据获取）
└── UI：shadcn/ui（Radix + Tailwind CSS）
```

### 关键设计决策

- **Claude CLI 作为后端**：应用通过 `claude --print --output-format stream-json` 启动子进程。不直接调 API —— 所有 AI 交互走 Claude Code，继承其工具使用、权限和技能系统。
- **三层内容系统**：与 CLI 技能相同的协议。系统默认 → 用户积累 → 单篇覆盖，读取时合并。
- **共享数据**：GUI 读写与 CLI 技能相同的 `assets/`、`references/`、`outputs/` 目录。CLI 和 GUI 可以自由切换。

### 项目结构

```
src/
├── main/                   # Electron 主进程
│   ├── index.ts            # 应用入口、窗口/托盘管理
│   ├── preload.ts          # contextBridge API
│   ├── services/           # 核心服务
│   └── ipc/                # IPC 处理注册
├── renderer/               # React 应用
│   ├── pages/              # 8 个页面模块
│   ├── components/         # 共享 UI 组件
│   ├── stores/             # Zustand 状态仓库
│   ├── hooks/              # TanStack Query hooks
│   └── lib/                # 工具函数（markdown、进度解析等）
└── shared/                 # 跨进程共享的类型和常量
```

## 技术栈

| 层级 | 选型 |
|------|------|
| 桌面框架 | Electron |
| 前端 | React 18 + TypeScript |
| UI 组件 | shadcn/ui（Radix + Tailwind CSS） |
| 状态管理 | Zustand + TanStack Query |
| AI 交互 | Claude Code CLI（`claude --print`） |
| 构建 | Vite（渲染进程）+ tsc（主进程） |
| 打包 | electron-builder |
| 定时调度 | node-cron |
| 文件监听 | chokidar |
| 图表 | recharts |

## 配置

所有配置通过应用内的**设置**页面管理：

- **项目路径** —— writing-assistant-skill 安装的根目录
- **代理** —— HTTP 代理地址（默认 `127.0.0.1:7890`），用于外网请求
- **API 密钥** —— OPENROUTER_API_KEY，用于图片生成
- **监控** —— 扫描频率（1-1440 分钟）、关键词、目标平台

## 打包分发

构建可分发安装包：

```bash
# macOS DMG
npm run dist -- --mac

# Windows 安装程序
npm run dist -- --win

# Linux AppImage
npm run dist -- --linux
```

输出到 `release/` 目录。

## 许可证

MIT
