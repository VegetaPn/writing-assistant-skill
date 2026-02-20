// Preload script - exposes safe APIs to renderer via contextBridge

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { ElectronAPI } from '../shared/ipc-types';
import type {
  AgentQueryOptions,
  PermissionResult,
  AgentMessage,
  PermissionRequest,
  MergedContent,
  FileInfo,
  FileChangeEvent,
  SubprocessExecOptions,
  SubprocessResult,
  SubprocessInfo,
  EnvCheckResult,
  AppSettings,
  AppInfo,
  MonitorScanResult,
  AppNotification,
} from '../shared/types';

const api: ElectronAPI = {
  agent: {
    query(options: AgentQueryOptions): Promise<string> {
      return ipcRenderer.invoke(IPC_CHANNELS.AGENT_QUERY, options);
    },
    onStream(callback: (sessionId: string, message: AgentMessage) => void): () => void {
      const handler = (_event: Electron.IpcRendererEvent, sessionId: string, message: AgentMessage) => {
        callback(sessionId, message);
      };
      ipcRenderer.on(IPC_CHANNELS.AGENT_QUERY_STREAM, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_QUERY_STREAM, handler);
    },
    onPermissionRequest(callback: (request: PermissionRequest) => void): () => void {
      const handler = (_event: Electron.IpcRendererEvent, request: PermissionRequest) => {
        callback(request);
      };
      ipcRenderer.on(IPC_CHANNELS.AGENT_QUERY_PERMISSION, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_QUERY_PERMISSION, handler);
    },
    respondPermission(requestId: string, result: PermissionResult): Promise<void> {
      return ipcRenderer.invoke('agent:respondPermission', requestId, result);
    },
    onComplete(callback: (sessionId: string, result: string) => void): () => void {
      const handler = (_event: Electron.IpcRendererEvent, sessionId: string, result: string) => {
        callback(sessionId, result);
      };
      ipcRenderer.on(IPC_CHANNELS.AGENT_QUERY_COMPLETE, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_QUERY_COMPLETE, handler);
    },
    onError(callback: (sessionId: string, error: string) => void): () => void {
      const handler = (_event: Electron.IpcRendererEvent, sessionId: string, error: string) => {
        callback(sessionId, error);
      };
      ipcRenderer.on(IPC_CHANNELS.AGENT_QUERY_ERROR, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_QUERY_ERROR, handler);
    },
    cancel(sessionId: string): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.AGENT_QUERY_CANCEL, sessionId);
    },
  },

  fs: {
    read3L(relativePath: string, projectSlug?: string): Promise<MergedContent> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_READ_3L, relativePath, projectSlug);
    },
    readFile(absolutePath: string): Promise<string> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, absolutePath);
    },
    writeFile(absolutePath: string, content: string): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, absolutePath, content);
    },
    writeUser(relativePath: string, content: string): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_USER, relativePath, content);
    },
    writeProject(relativePath: string, projectSlug: string, content: string): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_PROJECT, relativePath, projectSlug, content);
    },
    listDir(absolutePath: string): Promise<FileInfo[]> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_LIST_DIR, absolutePath);
    },
    exists(absolutePath: string): Promise<boolean> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_EXISTS, absolutePath);
    },
    watch(paths: string[]): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_WATCH, paths);
    },
    unwatch(paths: string[]): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.FS_UNWATCH, paths);
    },
    onChange(callback: (event: FileChangeEvent) => void): () => void {
      const handler = (_event: Electron.IpcRendererEvent, changeEvent: FileChangeEvent) => {
        callback(changeEvent);
      };
      ipcRenderer.on(IPC_CHANNELS.FS_CHANGE, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.FS_CHANGE, handler);
    },
  },

  subprocess: {
    exec(options: SubprocessExecOptions): Promise<SubprocessResult> {
      return ipcRenderer.invoke(IPC_CHANNELS.SUBPROCESS_EXEC, options);
    },
    execStream(
      options: SubprocessExecOptions,
      onData: (data: string) => void
    ): Promise<SubprocessResult> {
      const streamChannel = `${IPC_CHANNELS.SUBPROCESS_EXEC_STREAM}:${Date.now()}`;
      const handler = (_event: Electron.IpcRendererEvent, data: string) => {
        onData(data);
      };
      ipcRenderer.on(streamChannel, handler);
      return ipcRenderer.invoke(IPC_CHANNELS.SUBPROCESS_EXEC, {
        ...options,
        streamChannel,
      }).finally(() => {
        ipcRenderer.removeListener(streamChannel, handler);
      });
    },
    kill(processId: string): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.SUBPROCESS_KILL, processId);
    },
    list(): Promise<SubprocessInfo[]> {
      return ipcRenderer.invoke(IPC_CHANNELS.SUBPROCESS_LIST);
    },
  },

  settings: {
    get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, key);
    },
    set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, key, value);
    },
    getAll(): Promise<AppSettings> {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_ALL);
    },
  },

  env: {
    check(): Promise<EnvCheckResult> {
      return ipcRenderer.invoke(IPC_CHANNELS.ENV_CHECK);
    },
  },

  monitor: {
    start(): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_START);
    },
    stop(): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_STOP);
    },
    getStatus(): Promise<{ status: string; lastScan?: string; nextScan?: string }> {
      return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_STATUS);
    },
    onResult(callback: (result: MonitorScanResult) => void): () => void {
      const handler = (_event: Electron.IpcRendererEvent, result: MonitorScanResult) => {
        callback(result);
      };
      ipcRenderer.on(IPC_CHANNELS.MONITOR_RESULT, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.MONITOR_RESULT, handler);
    },
  },

  notification: {
    send(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SEND, notification);
    },
    onClicked(callback: (notificationId: string, action?: string) => void): () => void {
      const handler = (_event: Electron.IpcRendererEvent, id: string, action?: string) => {
        callback(id, action);
      };
      ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_CLICKED, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION_CLICKED, handler);
    },
  },

  app: {
    getInfo(): Promise<AppInfo> {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_INFO);
    },
    getProjectPath(): Promise<string> {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PROJECT_PATH);
    },
    setProjectPath(path: string): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_SET_PROJECT_PATH, path);
    },
    quit(): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT);
    },
    minimizeToTray(): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_MINIMIZE_TO_TRAY);
    },
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
