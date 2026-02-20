import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PAGES, PAGE_LABELS } from '../../shared/constants';
import { useAppStore } from '../stores/app-store';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  action: () => void;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    ...Object.entries(PAGE_LABELS).map(([path, label]) => ({
      id: `nav:${path}`,
      label: `前往 ${label}`,
      category: '导航',
      action: () => { navigate(path); setOpen(false); },
    })),
    // Actions
    {
      id: 'action:new-article',
      label: '新建文章',
      category: '操作',
      action: () => { navigate(PAGES.WRITING_STUDIO); setOpen(false); },
    },
    {
      id: 'action:record-topic',
      label: '记录选题',
      category: '操作',
      action: () => { navigate(PAGES.TOPIC_MANAGER); setOpen(false); },
    },
    {
      id: 'action:scan-trends',
      label: '扫描热点',
      category: '操作',
      action: () => { navigate(PAGES.BENCHMARKING); setOpen(false); },
    },
    {
      id: 'action:env-check',
      label: '检查环境',
      category: '操作',
      action: () => { navigate(PAGES.SETTINGS); setOpen(false); },
    },
  ];

  const filtered = query
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-popover shadow-lg">
        {/* Search input */}
        <div className="flex items-center border-b px-3">
          <svg className="mr-2 h-4 w-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="输入命令或搜索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {category}
              </div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={item.action}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              未找到匹配的命令
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
