import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/app-store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { NotificationPanel } from './NotificationPanel';
import { ActivityLog } from './ActivityLog';
import { ScrollArea } from './ui/scroll-area';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const notificationPanelOpen = useAppStore((s) => s.notificationPanelOpen);

  // Keyboard shortcut: Cmd/Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <ScrollArea className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </ScrollArea>

        {/* Activity Log (bottom panel) */}
        <ActivityLog />
      </div>

      {/* Command Palette */}
      {commandPaletteOpen && <CommandPalette />}

      {/* Notification Panel */}
      {notificationPanelOpen && <NotificationPanel />}
    </div>
  );
}
