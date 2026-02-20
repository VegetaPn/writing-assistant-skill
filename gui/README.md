# Writing Assistant - Desktop App

[English](README.md) | [简体中文](README.zh-CN.md)

The desktop GUI for Writing Assistant — all the power of the CLI skill, with a visual interface for the entire writing workflow, topic management, trend monitoring, and experience tracking.

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Claude Code CLI** (`claude`) installed and authenticated — the app calls it under the hood for all AI interactions

Optional (for full feature support):

- **Python 3** — for Xiaohongshu MCP client
- **bird CLI** — for X/Twitter trend scanning
- **OPENROUTER_API_KEY** — for AI image generation

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Launch
npm start
```

That's it. The app opens as a native desktop window.

## Development

```bash
# Start both main process watcher and Vite dev server
npm run dev
```

This runs two processes concurrently:
- **Main process**: `tsc --watch` compiles `src/main/` to `dist/main/`
- **Renderer**: Vite dev server at `http://localhost:5173` with HMR

In development mode the Electron window connects to the Vite dev server, so UI changes are reflected instantly.

### Build Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev mode (main watcher + Vite HMR) |
| `npm run build` | Production build (main + renderer) |
| `npm run build:main` | Build main process only |
| `npm run build:renderer` | Build renderer only |
| `npm start` | Launch the built app |
| `npm run pack` | Package app (unpacked, for testing) |
| `npm run dist` | Package app (distributable DMG/NSIS/AppImage) |

## Architecture

```
Electron Main Process
├── AgentSDKManager     — spawns `claude` CLI for AI interactions
├── FileSystemService   — three-level content read/write (system/user/project)
├── SubprocessManager   — child process management with proxy support
├── BackgroundMonitor   — scheduled trend scanning (node-cron, minute-level)
├── ProxyManager        — HTTP/SOCKS proxy configuration
├── NotificationService — in-app + OS-level notifications
└── EnvChecker          — environment dependency verification

IPC Bridge (contextBridge / preload.ts)

Electron Renderer (React + TypeScript)
├── Pages: Dashboard, Writing Studio, Topic Manager, Trend Monitor,
│          Reference Library, Experience Center, Metrics, Settings
├── Stores: Zustand (app state) + TanStack Query (data fetching)
└── UI: shadcn/ui (Radix + Tailwind CSS)
```

### Key Design Decisions

- **Claude CLI as backend**: The app spawns `claude --print --output-format stream-json` as a child process. No direct API calls — all AI interaction goes through Claude Code, inheriting its tool use, permissions, and skill system.
- **Three-level content system**: Same protocol as the CLI skill. System defaults → user knowledge → per-article overrides, merged on read.
- **Shared data**: The GUI reads and writes the same `assets/`, `references/`, and `outputs/` directories as the CLI skill. You can switch between CLI and GUI freely.

### Project Structure

```
src/
├── main/                   # Electron main process
│   ├── index.ts            # App entry, window/tray management
│   ├── preload.ts          # contextBridge API
│   ├── services/           # Core services
│   └── ipc/                # IPC handler registration
├── renderer/               # React app
│   ├── pages/              # 8 page modules
│   ├── components/         # Shared UI components
│   ├── stores/             # Zustand state stores
│   ├── hooks/              # TanStack Query hooks
│   └── lib/                # Utilities (markdown, progress parser, etc.)
└── shared/                 # Types and constants shared across processes
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Desktop framework | Electron |
| Frontend | React 18 + TypeScript |
| UI components | shadcn/ui (Radix + Tailwind CSS) |
| State | Zustand + TanStack Query |
| AI interaction | Claude Code CLI (`claude --print`) |
| Build | Vite (renderer) + tsc (main) |
| Packaging | electron-builder |
| Scheduling | node-cron |
| File watching | chokidar |
| Charts | recharts |

## Configuration

All configuration is managed through the **Settings** page in the app:

- **Project path** — root directory of your writing-assistant-skill installation
- **Proxy** — HTTP proxy address (default `127.0.0.1:7890`), used for outbound requests
- **API keys** — OPENROUTER_API_KEY for image generation
- **Monitor** — scan frequency (1-1440 minutes), keywords, target platforms

## Packaging

Build distributable packages:

```bash
# macOS DMG
npm run dist -- --mac

# Windows installer
npm run dist -- --win

# Linux AppImage
npm run dist -- --linux
```

Output goes to `release/`.

## License

MIT
