// Electron Main Process Entry Point

import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import * as path from 'path';
import { FileSystemService } from './services/file-system-service';
import { SubprocessManager } from './services/subprocess-manager';
import { ProxyManager } from './services/proxy-manager';
import { EnvChecker } from './services/env-checker';
import { NotificationService } from './services/notification-service';
import { AgentSDKManager } from './services/agent-sdk-manager';
import { BackgroundMonitor } from './services/background-monitor';
import { registerAgentIPC } from './ipc/agent-ipc';
import { registerFsIPC } from './ipc/fs-ipc';
import { registerSubprocessIPC } from './ipc/subprocess-ipc';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Services
let fsService: FileSystemService;
let subprocessManager: SubprocessManager;
let proxyManager: ProxyManager;
let envChecker: EnvChecker;
let notificationService: NotificationService;
let agentManager: AgentSDKManager;
let backgroundMonitor: BackgroundMonitor;

function getProjectPath(): string {
  // Default: go up from dist/main/main/ to the gui/ dir, then up to skill root
  return path.resolve(__dirname, '..', '..', '..', '..');
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Writing Assistant',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  // Create a simple tray icon (16x16 transparent placeholder)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: '后台监控',
      submenu: [
        {
          label: '启动监控',
          click: () => backgroundMonitor.start(),
        },
        {
          label: '停止监控',
          click: () => backgroundMonitor.stop(),
        },
      ],
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Writing Assistant');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow?.show();
    }
  });
}

function initializeServices(): void {
  const projectPath = getProjectPath();

  fsService = new FileSystemService(projectPath);
  proxyManager = new ProxyManager();
  subprocessManager = new SubprocessManager(proxyManager);
  envChecker = new EnvChecker(projectPath);
  notificationService = new NotificationService();
  agentManager = new AgentSDKManager(projectPath);
  backgroundMonitor = new BackgroundMonitor(
    fsService,
    subprocessManager,
    notificationService
  );
}

function registerIPC(): void {
  if (!mainWindow) return;

  registerAgentIPC(ipcMain, mainWindow, agentManager);
  registerFsIPC(ipcMain, mainWindow, fsService);
  registerSubprocessIPC(ipcMain, subprocessManager);

  // Settings
  ipcMain.handle('settings:get', async (_event, key: string) => {
    return proxyManager.getSetting(key);
  });

  ipcMain.handle('settings:set', async (_event, key: string, value: unknown) => {
    proxyManager.setSetting(key, value);
  });

  ipcMain.handle('settings:getAll', async () => {
    return proxyManager.getAllSettings();
  });

  // Environment check
  ipcMain.handle('env:check', async () => {
    return envChecker.check();
  });

  // Monitor
  ipcMain.handle('monitor:start', async () => {
    backgroundMonitor.start();
  });

  ipcMain.handle('monitor:stop', async () => {
    backgroundMonitor.stop();
  });

  ipcMain.handle('monitor:status', async () => {
    return backgroundMonitor.getStatus();
  });

  // App
  ipcMain.handle('app:getInfo', async () => {
    return {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      projectPath: getProjectPath(),
    };
  });

  ipcMain.handle('app:getProjectPath', async () => {
    return getProjectPath();
  });

  ipcMain.handle('app:quit', async () => {
    isQuitting = true;
    app.quit();
  });

  ipcMain.handle('app:minimizeToTray', async () => {
    mainWindow?.hide();
  });
}

// App lifecycle
app.whenReady().then(() => {
  initializeServices();
  createWindow();
  createTray();
  registerIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  backgroundMonitor?.stop();
  subprocessManager?.killAll();
  fsService?.stopWatching();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
