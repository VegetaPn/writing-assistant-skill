// Application-wide constants

export const APP_NAME = 'Writing Assistant';
export const APP_VERSION = '0.1.0';

// IPC Channel names
export const IPC_CHANNELS = {
  // Agent SDK
  AGENT_QUERY: 'agent:query',
  AGENT_QUERY_STREAM: 'agent:query:stream',
  AGENT_QUERY_CANCEL: 'agent:query:cancel',
  AGENT_QUERY_PERMISSION: 'agent:query:permission',
  AGENT_QUERY_COMPLETE: 'agent:query:complete',
  AGENT_QUERY_ERROR: 'agent:query:error',

  // File System
  FS_READ_3L: 'fs:read3l',
  FS_WRITE_USER: 'fs:writeUser',
  FS_WRITE_PROJECT: 'fs:writeProject',
  FS_READ_FILE: 'fs:readFile',
  FS_WRITE_FILE: 'fs:writeFile',
  FS_LIST_DIR: 'fs:listDir',
  FS_EXISTS: 'fs:exists',
  FS_WATCH: 'fs:watch',
  FS_UNWATCH: 'fs:unwatch',
  FS_CHANGE: 'fs:change',

  // Subprocess
  SUBPROCESS_EXEC: 'subprocess:exec',
  SUBPROCESS_EXEC_STREAM: 'subprocess:exec:stream',
  SUBPROCESS_KILL: 'subprocess:kill',
  SUBPROCESS_LIST: 'subprocess:list',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:getAll',

  // Environment
  ENV_CHECK: 'env:check',
  ENV_CHECK_RESULT: 'env:check:result',

  // Notifications
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_CLICKED: 'notification:clicked',

  // Background Monitor
  MONITOR_START: 'monitor:start',
  MONITOR_STOP: 'monitor:stop',
  MONITOR_STATUS: 'monitor:status',
  MONITOR_RESULT: 'monitor:result',

  // App
  APP_GET_INFO: 'app:getInfo',
  APP_GET_PROJECT_PATH: 'app:getProjectPath',
  APP_SET_PROJECT_PATH: 'app:setProjectPath',
  APP_QUIT: 'app:quit',
  APP_MINIMIZE_TO_TRAY: 'app:minimizeToTray',
} as const;

// Navigation pages
export const PAGES = {
  DASHBOARD: '/',
  WRITING_STUDIO: '/writing',
  TOPIC_MANAGER: '/topics',
  BENCHMARKING: '/benchmarking',
  REFERENCE_LIBRARY: '/references',
  EXPERIENCE_SYSTEM: '/experience',
  METRICS: '/metrics',
  SETTINGS: '/settings',
} as const;

export const PAGE_LABELS: Record<string, string> = {
  [PAGES.DASHBOARD]: '仪表盘',
  [PAGES.WRITING_STUDIO]: '写作工作台',
  [PAGES.TOPIC_MANAGER]: '选题管理',
  [PAGES.BENCHMARKING]: '热点监控',
  [PAGES.REFERENCE_LIBRARY]: '参考库',
  [PAGES.EXPERIENCE_SYSTEM]: '经验中心',
  [PAGES.METRICS]: '数据指标',
  [PAGES.SETTINGS]: '设置',
};

// Writing workflow steps
export const WRITING_STEPS = [
  { id: 0, label: '初始化', key: 'init' },
  { id: 1, label: '选模式/平台', key: 'mode-platform' },
  { id: 2, label: '搜索参考', key: 'search-refs' },
  { id: 3, label: '收集澄清', key: 'collect-clarify' },
  { id: 4, label: '要素精炼', key: 'element-refine' },
  { id: 5, label: '处理草稿', key: 'process-draft' },
  { id: 6, label: '润色', key: 'polish' },
  { id: 7, label: '配图', key: 'illustrations' },
  { id: 8, label: '终稿', key: 'final' },
  { id: 9, label: '审阅/适配', key: 'review-adapt' },
  { id: 10, label: '发布', key: 'publish' },
  { id: 11, label: '复盘', key: 'retrospective' },
] as const;

// Platforms
export const PLATFORMS = {
  XIAOHONGSHU: 'xiaohongshu',
  WECHAT: 'wechat',
  DOUYIN: 'douyin',
  X: 'x',
} as const;

export const PLATFORM_LABELS: Record<string, string> = {
  [PLATFORMS.XIAOHONGSHU]: '小红书',
  [PLATFORMS.WECHAT]: '微信公众号',
  [PLATFORMS.DOUYIN]: '抖音',
  [PLATFORMS.X]: 'X / Twitter',
};

// Three-level content system levels
export const CONTENT_LEVELS = {
  SYSTEM: 'system',
  USER: 'user',
  PROJECT: 'project',
} as const;

// Default proxy configuration
export const DEFAULT_PROXY = '127.0.0.1:7890';

// Background monitor defaults
export const MONITOR_DEFAULTS = {
  INTERVAL_MINUTES: 240,
  MAX_CONCURRENT_PROCESSES: 3,
  SCAN_RETENTION_DAYS: 30,
};
