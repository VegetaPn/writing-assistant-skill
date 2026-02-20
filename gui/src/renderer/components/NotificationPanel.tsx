import React from 'react';
import { useAppStore } from '../stores/app-store';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import type { NotificationType } from '../../shared/types';

const typeColors: Record<NotificationType, string> = {
  info: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
  monitor: 'default',
};

export function NotificationPanel() {
  const notifications = useAppStore((s) => s.notifications);
  const setNotificationPanelOpen = useAppStore((s) => s.setNotificationPanelOpen);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllRead);

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20"
        onClick={() => setNotificationPanelOpen(false)}
      />

      {/* Panel */}
      <div className="relative ml-auto w-80 border-l bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">通知</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              全部已读
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setNotificationPanelOpen(false)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Notification list */}
        <ScrollArea className="h-[calc(100vh-64px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm">暂无通知</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'rounded-md p-3 transition-colors hover:bg-accent',
                    !notification.read && 'bg-accent/50'
                  )}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      variant={typeColors[notification.type] as any}
                      className="mt-0.5 shrink-0 text-[10px]"
                    >
                      {notification.type}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Action buttons */}
                  {notification.actionable && notification.actions && (
                    <div className="mt-2 flex gap-2">
                      {notification.actions.map((action) => (
                        <Button
                          key={action.action}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
