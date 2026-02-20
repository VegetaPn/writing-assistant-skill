// Shared type definitions for the Writing Assistant GUI

// ============ Three-Level Content System ============

export type ContentLevel = 'system' | 'user' | 'project';

export interface ThreeLevelContent {
  content: string;
  source: ContentLevel;
  path: string;
}

export interface MergedContent {
  merged: string;
  sources: ThreeLevelContent[];
}

// ============ Topic System ============

export type TopicStatus = 'inbox' | 'developing' | 'ready';

export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  filePath: string;
  platforms?: string[];
  benchmarks?: string[];
  titleCandidates?: string[];
}

// ============ Writing Session ============

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface WritingStep {
  id: number;
  label: string;
  key: string;
  status: StepStatus;
}

export type WritingMode = 'topic' | 'material' | 'draft';

export interface WritingSession {
  id: string;
  slug: string;
  title: string;
  platform: string;
  mode: WritingMode;
  currentStep: number;
  steps: WritingStep[];
  createdAt: string;
  updatedAt: string;
  outputDir: string;
}

// ============ Agent SDK ============

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallInfo[];
  isStreaming?: boolean;
}

export interface ToolCallInfo {
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface AgentQueryOptions {
  prompt: string;
  systemPrompt?: string;
  allowedTools?: string[];
  cwd?: string;
  sessionId?: string;
}

export interface PermissionRequest {
  id: string;
  tool: string;
  description: string;
  input: Record<string, unknown>;
}

export type PermissionResult = 'allow' | 'deny' | 'allow_always';

// ============ Subprocess ============

export interface SubprocessInfo {
  id: string;
  command: string;
  args: string[];
  pid?: number;
  status: 'running' | 'completed' | 'error' | 'killed';
  startedAt: string;
  exitCode?: number;
}

export interface SubprocessExecOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  useProxy?: boolean;
  timeout?: number;
}

export interface SubprocessResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// ============ Environment Check ============

export type EnvCheckStatus = 'ok' | 'warning' | 'error';

export interface EnvCheckItem {
  name: string;
  status: EnvCheckStatus;
  message: string;
  detail?: string;
}

export interface EnvCheckResult {
  overall: EnvCheckStatus;
  items: EnvCheckItem[];
  timestamp: string;
}

// ============ Background Monitor ============

export type MonitorStatus = 'idle' | 'running' | 'scanning' | 'paused' | 'error';

export interface MonitorConfig {
  enabled: boolean;
  intervalMinutes: number;
  keywords: string[];
  platforms: string[];
  thresholds: Record<string, number>;
}

export interface MonitorScanResult {
  id: string;
  timestamp: string;
  platform: string;
  items: MonitorItem[];
  newTrends: MonitorItem[];
}

export interface MonitorItem {
  id: string;
  platform: string;
  title: string;
  url?: string;
  metrics: Record<string, number>;
  matchedKeywords: string[];
  isNew: boolean;
  timestamp: string;
}

// ============ Notifications ============

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'monitor';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actions?: NotificationAction[];
  data?: Record<string, unknown>;
}

export interface NotificationAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

// ============ Settings ============

export interface AppSettings {
  projectPath: string;
  proxyAddress: string;
  proxyEnabled: boolean;
  openrouterApiKey: string;
  monitorConfig: MonitorConfig;
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
}

// ============ Reference Library ============

export interface Author {
  name: string;
  slug: string;
  profilePath: string;
  articleCount: number;
  summary?: string;
}

export interface ReferenceEntry {
  id: string;
  type: 'title' | 'opening' | 'structure' | 'hook' | 'technique';
  content: string;
  source: ContentLevel;
  analysis?: string;
  pattern?: string;
  tags?: string[];
}

// ============ Experience System ============

export interface ExperienceCase {
  id: string;
  date: string;
  title: string;
  rootCause: string;
  category: string;
  aiOutput: string;
  userCorrection: string;
  lesson: string;
  filePath: string;
}

export interface ExperienceLesson {
  id: string;
  rule: string;
  category: string;
  sourceCases: string[];
  createdAt: string;
}

// ============ Metrics ============

export interface ArticleMetrics {
  slug: string;
  title: string;
  platform: string;
  publishedAt: string;
  metrics: Record<string, number>;
  filePath: string;
}

// ============ File System ============

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
}

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
}

// ============ App Info ============

export interface AppInfo {
  version: string;
  platform: string;
  arch: string;
  electronVersion: string;
  nodeVersion: string;
  projectPath: string;
}
