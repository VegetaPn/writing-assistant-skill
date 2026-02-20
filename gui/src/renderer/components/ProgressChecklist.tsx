import React from 'react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import type { StepStatus } from '../../shared/types';

interface ProgressChecklistProps {
  steps: Array<{
    id: number;
    label: string;
    status: StepStatus;
    notes?: string;
  }>;
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function ProgressChecklist({
  steps,
  currentStep,
  onStepClick,
  className,
}: ProgressChecklistProps) {
  const completed = steps.filter((s) => s.status === 'completed').length;
  const total = steps.length;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>进度: {completed}/{total}</span>
        <span>{Math.round((completed / total) * 100)}%</span>
      </div>

      {steps.map((step) => (
        <button
          key={step.id}
          className={cn(
            'flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors',
            step.id === currentStep && 'bg-accent font-medium',
            step.status === 'completed' && 'text-muted-foreground',
            step.status === 'skipped' && 'text-muted-foreground line-through',
            onStepClick ? 'cursor-pointer hover:bg-accent' : 'cursor-default'
          )}
          onClick={() => onStepClick?.(step.id)}
        >
          <StepIcon status={step.status} isCurrent={step.id === currentStep} />
          <span className="flex-1 truncate">
            {step.id}. {step.label}
          </span>
          {step.notes && (
            <Badge variant="outline" className="text-[9px]">
              备注
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

function StepIcon({ status, isCurrent }: { status: StepStatus; isCurrent: boolean }) {
  if (status === 'completed') {
    return (
      <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (status === 'in_progress' || isCurrent) {
    return <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-blue-500" />;
  }

  if (status === 'skipped') {
    return (
      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
      </svg>
    );
  }

  return <div className="h-3 w-3 shrink-0 rounded-full border-2 border-gray-300" />;
}
