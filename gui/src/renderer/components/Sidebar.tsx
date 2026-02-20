import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PAGES, PAGE_LABELS } from '../../shared/constants';
import { useAppStore } from '../stores/app-store';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: PAGES.DASHBOARD, label: PAGE_LABELS[PAGES.DASHBOARD], icon: 'home' },
  { path: PAGES.WRITING_STUDIO, label: PAGE_LABELS[PAGES.WRITING_STUDIO], icon: 'edit' },
  { path: PAGES.TOPIC_MANAGER, label: PAGE_LABELS[PAGES.TOPIC_MANAGER], icon: 'lightbulb' },
  { path: PAGES.BENCHMARKING, label: PAGE_LABELS[PAGES.BENCHMARKING], icon: 'trending' },
  { path: PAGES.REFERENCE_LIBRARY, label: PAGE_LABELS[PAGES.REFERENCE_LIBRARY], icon: 'library' },
  { path: PAGES.EXPERIENCE_SYSTEM, label: PAGE_LABELS[PAGES.EXPERIENCE_SYSTEM], icon: 'brain' },
  { path: PAGES.METRICS, label: PAGE_LABELS[PAGES.METRICS], icon: 'chart' },
  { path: PAGES.SETTINGS, label: PAGE_LABELS[PAGES.SETTINGS], icon: 'settings' },
];

// Simple SVG icons to avoid external dependency issues
const icons: Record<string, React.ReactNode> = {
  home: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  edit: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  lightbulb: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  trending: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  library: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  brain: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a3.168 3.168 0 01-1.03.666m-4-3.136V19.5m0-4.5l-2.47 2.47a3.168 3.168 0 01-1.03.666" />
    </svg>
  ),
  chart: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  collapse: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  ),
  expand: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  ),
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header / Logo area - draggable for frameless window */}
      {/* Extra height + bottom-aligned content to clear macOS traffic light buttons */}
      <div className="drag-region flex h-[72px] items-end pb-3 px-4">
        {!collapsed && (
          <h1 className="no-drag text-lg font-semibold tracking-tight">
            Writing Assistant
          </h1>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.slice(0, 7).map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              collapsed && 'justify-center px-2'
            )}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            {icons[item.icon]}
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      <Separator />

      {/* Bottom section: Settings + Collapse */}
      <div className="space-y-1 p-2">
        {/* Settings */}
        <Button
          variant={location.pathname === PAGES.SETTINGS ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start gap-3',
            collapsed && 'justify-center px-2'
          )}
          onClick={() => navigate(PAGES.SETTINGS)}
          title={PAGE_LABELS[PAGES.SETTINGS]}
        >
          {icons.settings}
          {!collapsed && <span>{PAGE_LABELS[PAGES.SETTINGS]}</span>}
        </Button>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3',
            collapsed && 'justify-center px-2'
          )}
          onClick={toggleSidebar}
          title={collapsed ? '展开侧栏' : '收起侧栏'}
        >
          {collapsed ? icons.expand : icons.collapse}
          {!collapsed && <span>收起侧栏</span>}
        </Button>
      </div>
    </div>
  );
}
