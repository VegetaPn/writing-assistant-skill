import React, { useEffect, useRef } from 'react';
import { useActivityLogStore, type LogLevel } from '../stores/activity-log-store';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const levelStyles: Record<LogLevel, { bg: string; label: string }> = {
  info: { bg: 'bg-blue-500/10 text-blue-600', label: 'INFO' },
  success: { bg: 'bg-green-500/10 text-green-600', label: 'OK' },
  warning: { bg: 'bg-yellow-500/10 text-yellow-700', label: 'WARN' },
  error: { bg: 'bg-red-500/10 text-red-600', label: 'ERR' },
  agent: { bg: 'bg-purple-500/10 text-purple-600', label: 'AI' },
};

export function ActivityLog() {
  const { entries, isOpen, activeOperations, toggleOpen, clear } = useActivityLogStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries come in
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length, isOpen]);

  return (
    <div className="border-t bg-background flex flex-col">
      {/* Toggle bar - always visible */}
      <button
        className="flex h-8 items-center justify-between px-4 hover:bg-accent transition-colors text-xs"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2">
          <svg
            className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="font-medium">活动日志</span>
          {activeOperations > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-muted-foreground">{activeOperations} 进行中</span>
            </span>
          )}
          {!isOpen && entries.length > 0 && (
            <span className="text-muted-foreground">
              — {entries[entries.length - 1].message}
            </span>
          )}
        </div>
        <span className="text-muted-foreground">{entries.length} 条</span>
      </button>

      {/* Log panel */}
      {isOpen && (
        <div className="flex flex-col" style={{ height: '240px' }}>
          {/* Toolbar */}
          <div className="flex items-center justify-end gap-2 border-t px-4 py-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clear}>
              清除
            </Button>
          </div>

          {/* Log entries */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 pb-2 font-mono text-xs"
          >
            {entries.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">暂无活动记录</p>
            ) : (
              <div className="space-y-0.5">
                {entries.map((entry) => {
                  const style = levelStyles[entry.level];
                  return (
                    <div key={entry.id} className="flex items-start gap-2 py-0.5">
                      <span className="text-muted-foreground shrink-0 w-[72px]">
                        {new Date(entry.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('shrink-0 text-[9px] px-1 py-0 leading-4 font-mono', style.bg)}
                      >
                        {style.label}
                      </Badge>
                      <span className="text-muted-foreground shrink-0 w-16 truncate">{entry.source}</span>
                      <span className={cn(
                        'flex-1',
                        entry.level === 'error' && 'text-red-600',
                        entry.level === 'success' && 'text-green-600',
                      )}>
                        {entry.message}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
