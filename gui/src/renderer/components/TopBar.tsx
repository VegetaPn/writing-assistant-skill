import React from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_LABELS } from '../../shared/constants';
import { useAppStore } from '../stores/app-store';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export function TopBar() {
  const location = useLocation();
  const envStatus = useAppStore((s) => s.envStatus);
  const monitorStatus = useAppStore((s) => s.monitorStatus);
  const unreadCount = useAppStore((s) => s.unreadCount);
  const setNotificationPanelOpen = useAppStore((s) => s.setNotificationPanelOpen);
  const notificationPanelOpen = useAppStore((s) => s.notificationPanelOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);

  const currentPageLabel = PAGE_LABELS[location.pathname] || '未知页面';

  const envColor = !envStatus
    ? 'bg-gray-400'
    : envStatus.overall === 'ok'
    ? 'bg-green-500'
    : envStatus.overall === 'warning'
    ? 'bg-yellow-500'
    : 'bg-red-500';

  const monitorColor =
    monitorStatus === 'running' || monitorStatus === 'scanning'
      ? 'bg-green-500'
      : monitorStatus === 'paused'
      ? 'bg-yellow-500'
      : monitorStatus === 'error'
      ? 'bg-red-500'
      : 'bg-gray-400';

  return (
    <div className="drag-region flex h-[72px] items-end justify-between border-b px-6 pb-3">
      {/* Left: Page title */}
      <div className="no-drag flex items-center gap-4">
        <h2 className="text-lg font-semibold">{currentPageLabel}</h2>
      </div>

      {/* Right: Status indicators + actions */}
      <div className="no-drag flex items-center gap-3">
        {/* Command palette trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground sm:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">搜索...</span>
          <kbd className="pointer-events-none ml-2 hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </Button>

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {/* Environment status */}
          <div className="flex items-center gap-1.5" title={`环境: ${envStatus?.overall || '未检查'}`}>
            <div className={cn('h-2 w-2 rounded-full', envColor)} />
            <span className="text-xs text-muted-foreground">环境</span>
          </div>

          {/* Monitor status */}
          <div className="flex items-center gap-1.5" title={`监控: ${monitorStatus}`}>
            <div className={cn(
              'h-2 w-2 rounded-full',
              monitorColor,
              (monitorStatus === 'scanning') && 'animate-pulse'
            )} />
            <span className="text-xs text-muted-foreground">监控</span>
          </div>
        </div>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
