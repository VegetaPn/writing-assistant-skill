// Main application state store

import { create } from 'zustand';
import type { AppNotification, EnvCheckResult, WritingSession, MonitorStatus } from '../../shared/types';

interface AppState {
  // Project
  projectPath: string;
  setProjectPath: (path: string) => void;

  // Navigation
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  notificationPanelOpen: boolean;
  addNotification: (notification: AppNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  setNotificationPanelOpen: (open: boolean) => void;

  // Environment
  envStatus: EnvCheckResult | null;
  setEnvStatus: (status: EnvCheckResult) => void;

  // Monitor
  monitorStatus: MonitorStatus;
  setMonitorStatus: (status: MonitorStatus) => void;

  // Active writing session
  activeSession: WritingSession | null;
  setActiveSession: (session: WritingSession | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Project
  projectPath: '',
  setProjectPath: (path) => set({ projectPath: path }),

  // Navigation
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Notifications
  notifications: [],
  unreadCount: 0,
  notificationPanelOpen: false,
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, 100),
      unreadCount: s.unreadCount + 1,
    })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),

  // Environment
  envStatus: null,
  setEnvStatus: (status) => set({ envStatus: status }),

  // Monitor
  monitorStatus: 'idle',
  setMonitorStatus: (status) => set({ monitorStatus: status }),

  // Active writing session
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
}));
