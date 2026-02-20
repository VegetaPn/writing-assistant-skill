import React from 'react';
import { cn } from '../lib/utils';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: { old?: number; new?: number };
}

interface DiffViewProps {
  oldContent: string;
  newContent: string;
  className?: string;
}

/**
 * Simple side-by-side diff view.
 * For a production app, consider using a library like diff2html.
 */
export function DiffView({ oldContent, newContent, className }: DiffViewProps) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  return (
    <div className={cn('grid grid-cols-2 gap-0 overflow-auto rounded-md border', className)}>
      {/* Old content */}
      <div className="border-r">
        <div className="sticky top-0 border-b bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
          原文
        </div>
        <pre className="p-3 text-xs">
          {oldLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'px-1',
                !newLines.includes(line) && 'bg-red-50 dark:bg-red-900/10'
              )}
            >
              <span className="mr-3 inline-block w-6 text-right text-muted-foreground">
                {i + 1}
              </span>
              {line}
            </div>
          ))}
        </pre>
      </div>

      {/* New content */}
      <div>
        <div className="sticky top-0 border-b bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
          修改后
        </div>
        <pre className="p-3 text-xs">
          {newLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'px-1',
                !oldLines.includes(line) && 'bg-green-50 dark:bg-green-900/10'
              )}
            >
              <span className="mr-3 inline-block w-6 text-right text-muted-foreground">
                {i + 1}
              </span>
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
