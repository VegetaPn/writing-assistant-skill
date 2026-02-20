import React from 'react';
import { Badge } from './ui/badge';
import type { ContentLevel } from '../../shared/types';
import { getLevelBadgeVariant, getLevelLabel } from '../lib/three-level-merge';
import { cn } from '../lib/utils';

interface ThreeLevelIndicatorProps {
  level: ContentLevel;
  className?: string;
}

/**
 * Visual badge indicating which content level a piece of data comes from.
 */
export function ThreeLevelIndicator({ level, className }: ThreeLevelIndicatorProps) {
  const variant = getLevelBadgeVariant(level);
  const label = getLevelLabel(level);

  return (
    <Badge
      variant={variant as any}
      className={cn('text-[10px]', className)}
    >
      {label}
    </Badge>
  );
}

/**
 * Show all source levels for a merged piece of content.
 */
export function ThreeLevelSources({
  sources,
  className,
}: {
  sources: Array<{ source: ContentLevel; path: string }>;
  className?: string;
}) {
  if (sources.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {sources.map((s, i) => (
        <ThreeLevelIndicator key={i} level={s.source} />
      ))}
    </div>
  );
}
