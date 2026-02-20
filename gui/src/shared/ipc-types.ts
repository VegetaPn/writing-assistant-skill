// IPC type definitions - shared between main and renderer

import type {
  AgentQueryOptions,
  PermissionRequest,
  PermissionResult,
  AgentMessage,
  MergedContent,
  FileInfo,
  FileChangeEvent,
  SubprocessExecOptions,
  SubprocessResult,
  SubprocessInfo,
  EnvCheckResult,
  AppSettings,
  AppInfo,
  MonitorConfig,
  MonitorScanResult,
  AppNotification,
} from './types';

// ============ API exposed to renderer via contextBridge ============

export interface ElectronAPI {
  agent: AgentAPI;
  fs: FileSystemAPI;
  subprocess: SubprocessAPI;
  settings: SettingsAPI;
  env: EnvAPI;
  monitor: MonitorAPI;
  notification: NotificationAPI;
  app: AppAPI;
}

export interface AgentAPI {
  query(options: AgentQueryOptions): Promise<string>; // returns session ID
  onStream(callback: (sessionId: string, message: AgentMessage) => void): () => void;
  onPermissionRequest(callback: (request: PermissionRequest) => void): () => void;
  respondPermission(requestId: string, result: PermissionResult): Promise<void>;
  onComplete(callback: (sessionId: string, result: string) => void): () => void;
  onError(callback: (sessionId: string, error: string) => void): () => void;
  cancel(sessionId: string): Promise<void>;
}

export interface FileSystemAPI {
  read3L(relativePath: string, projectSlug?: string): Promise<MergedContent>;
  readFile(absolutePath: string): Promise<string>;
  writeFile(absolutePath: string, content: string): Promise<void>;
  writeUser(relativePath: string, content: string): Promise<void>;
  writeProject(relativePath: string, projectSlug: string, content: string): Promise<void>;
  listDir(absolutePath: string): Promise<FileInfo[]>;
  exists(absolutePath: string): Promise<boolean>;
  watch(paths: string[]): Promise<void>;
  unwatch(paths: string[]): Promise<void>;
  onChange(callback: (event: FileChangeEvent) => void): () => void;
}

export interface SubprocessAPI {
  exec(options: SubprocessExecOptions): Promise<SubprocessResult>;
  execStream(
    options: SubprocessExecOptions,
    onData: (data: string) => void
  ): Promise<SubprocessResult>;
  kill(processId: string): Promise<void>;
  list(): Promise<SubprocessInfo[]>;
}

export interface SettingsAPI {
  get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]>;
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void>;
  getAll(): Promise<AppSettings>;
}

export interface EnvAPI {
  check(): Promise<EnvCheckResult>;
}

export interface MonitorAPI {
  start(config?: Partial<MonitorConfig>): Promise<void>;
  stop(): Promise<void>;
  getStatus(): Promise<{ status: string; lastScan?: string; nextScan?: string }>;
  onResult(callback: (result: MonitorScanResult) => void): () => void;
}

export interface NotificationAPI {
  send(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<void>;
  onClicked(callback: (notificationId: string, action?: string) => void): () => void;
}

export interface AppAPI {
  getInfo(): Promise<AppInfo>;
  getProjectPath(): Promise<string>;
  setProjectPath(path: string): Promise<void>;
  quit(): Promise<void>;
  minimizeToTray(): Promise<void>;
}

// Augment the Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
