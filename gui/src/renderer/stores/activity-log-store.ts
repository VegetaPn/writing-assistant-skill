import { create } from 'zustand';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'agent';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  detail?: string;
}

interface ActivityLogState {
  entries: LogEntry[];
  isOpen: boolean;
  activeOperations: number;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addEntry: (level: LogLevel, source: string, message: string, detail?: string) => void;
  incrementActive: () => void;
  decrementActive: () => void;
  clear: () => void;
}

export const useActivityLogStore = create<ActivityLogState>((set) => ({
  entries: [],
  isOpen: false,
  activeOperations: 0,

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  addEntry: (level, source, message, detail) =>
    set((s) => ({
      entries: [
        ...s.entries,
        {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          level,
          source,
          message,
          detail,
        },
      ].slice(-500), // Keep last 500 entries
    })),

  incrementActive: () => set((s) => ({ activeOperations: s.activeOperations + 1 })),
  decrementActive: () => set((s) => ({ activeOperations: Math.max(0, s.activeOperations - 1) })),
  clear: () => set({ entries: [] }),
}));
