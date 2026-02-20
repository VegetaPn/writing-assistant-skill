import React, { useState } from 'react';
import { WRITING_STEPS, PLATFORMS, PLATFORM_LABELS } from '../../../shared/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { AgentChat } from '../../components/AgentChat';
import { cn } from '../../lib/utils';
import type { StepStatus, WritingMode } from '../../../shared/types';

interface StepState {
  id: number;
  label: string;
  key: string;
  status: StepStatus;
}

export default function WritingStudio() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepState[]>(
    WRITING_STEPS.map((s) => ({ ...s, status: 'pending' as StepStatus }))
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<WritingMode | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = (completedSteps / steps.length) * 100;

  const updateStepStatus = (stepId: number, status: StepStatus) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status } : s))
    );
  };

  const handleStepClick = (stepId: number) => {
    const step = steps[stepId];
    if (step.status === 'completed' || step.status === 'in_progress' || stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleNextStep = () => {
    updateStepStatus(currentStep, 'completed');
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      updateStepStatus(next, 'in_progress');
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    updateStepStatus(0, 'in_progress');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left: Step progress sidebar */}
      <div className="w-56 shrink-0">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">写作进度</CardTitle>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedSteps}/{steps.length} 步完成
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-0.5 px-3 pb-3">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                      step.id === currentStep && 'bg-accent',
                      step.status === 'completed' && 'text-muted-foreground',
                      step.status === 'skipped' && 'text-muted-foreground line-through',
                      step.id <= currentStep
                        ? 'cursor-pointer hover:bg-accent'
                        : 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() => handleStepClick(step.id)}
                    disabled={step.id > currentStep}
                  >
                    {/* Status indicator */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {step.status === 'completed' ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.status === 'in_progress' ? (
                        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
                      ) : step.status === 'skipped' ? (
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-gray-300" />
                      )}
                    </span>

                    <span className="flex-1 truncate">
                      <span className="text-xs text-muted-foreground">{step.id}. </span>
                      {step.label}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: Step content */}
      <div className="flex-1 overflow-hidden">
        <Card className="flex h-full flex-col">
          {!sessionStarted ? (
            /* Pre-session: Start prompt */
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">开始写作</h2>
                <p className="mt-2 text-muted-foreground">
                  选择模式和目标平台来开始一篇新文章
                </p>
              </div>

              {/* Mode selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">选择起始模式</h3>
                <div className="flex gap-3">
                  {[
                    { key: 'topic' as WritingMode, label: '从选题开始', desc: '从已深化的选题开始写作' },
                    { key: 'material' as WritingMode, label: '从素材开始', desc: '提供素材/参考内容' },
                    { key: 'draft' as WritingMode, label: '从草稿开始', desc: '已有初稿需要润色' },
                  ].map((mode) => (
                    <Card
                      key={mode.key}
                      className={cn(
                        'cursor-pointer p-4 transition-colors hover:border-primary',
                        selectedMode === mode.key && 'border-primary bg-primary/5'
                      )}
                      onClick={() => setSelectedMode(mode.key)}
                    >
                      <p className="font-medium">{mode.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{mode.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Platform selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">目标平台</h3>
                <div className="flex gap-2">
                  {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedPlatform === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPlatform(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                disabled={!selectedMode || !selectedPlatform}
                onClick={startSession}
              >
                开始写作流程
              </Button>
            </div>
          ) : (
            /* Active session: Show current step content */
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Step {steps[currentStep].id}: {steps[currentStep].label}
                    </CardTitle>
                    <CardDescription>
                      {getStepDescription(currentStep)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        上一步
                      </Button>
                    )}
                    <Button size="sm" onClick={handleNextStep}>
                      {currentStep === steps.length - 1 ? '完成' : '下一步'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <div className="flex-1 overflow-hidden">
                <StepContent
                  stepId={currentStep}
                  platform={selectedPlatform!}
                  mode={selectedMode!}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function StepContent({
  stepId,
  platform,
  mode,
}: {
  stepId: number;
  platform: string;
  mode: WritingMode;
}) {
  switch (stepId) {
    case 0:
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">初始化完成</p>
            <p className="mt-1 text-sm text-muted-foreground">
              进度追踪器已创建，环境检查通过
            </p>
          </div>
        </div>
      );

    case 1:
      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg font-medium">模式和平台已选择</p>
            <div className="mt-4 flex justify-center gap-3">
              <Badge variant="secondary">
                模式: {mode === 'topic' ? '选题' : mode === 'material' ? '素材' : '草稿'}
              </Badge>
              <Badge variant="secondary">
                平台: {PLATFORM_LABELS[platform]}
              </Badge>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>搜索中</Badge>
              <span className="text-sm text-muted-foreground">正在搜索参考资料和爆款案例...</span>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-muted-foreground">
              搜索参考文献、爆款案例和写作技巧
            </p>
          </div>
        </div>
      );

    case 3:
    case 5:
    case 6:
      return (
        <AgentChat
          className="h-full"
          systemPrompt={`You are a writing assistant. Current step: ${stepId}. Platform: ${platform}. Mode: ${mode}.`}
          placeholder="与 Claude 交流以完善内容..."
        />
      );

    case 4:
      return (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium">标题候选</h3>
            <div className="grid gap-2">
              {['候选标题 1', '候选标题 2', '候选标题 3', '候选标题 4', '候选标题 5'].map((title, i) => (
                <Card key={i} className="cursor-pointer p-3 hover:border-primary">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{title}</span>
                    <Badge variant="outline" className="text-[10px]">待生成</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );

    case 7:
      return (
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-md border bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">配图 {i}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 8:
      return (
        <ScrollArea className="h-full p-6">
          <div className="prose max-w-none dark:prose-invert">
            <p className="text-muted-foreground">终稿预览区域 - 完成前面步骤后显示完整文章</p>
          </div>
        </ScrollArea>
      );

    case 9:
      return (
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-medium">审阅摘要</h3>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">审阅检查清单将在这里显示</p>
          </Card>
          <h3 className="text-sm font-medium">平台适配预览</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
              <Card key={key} className="p-4">
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">适配版本预览</p>
              </Card>
            ))}
          </div>
        </div>
      );

    case 10:
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">发布到平台</h3>
            <div className="flex justify-center gap-3">
              <Button>发布到微信</Button>
              <Button variant="outline">发布到 X</Button>
            </div>
          </div>
        </div>
      );

    case 11:
      return (
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-medium">会话复盘</h3>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">执行日志和复盘分析将在这里显示</p>
          </Card>
        </div>
      );

    default:
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">未知步骤</p>
        </div>
      );
  }
}

function getStepDescription(stepId: number): string {
  const descriptions: Record<number, string> = {
    0: '创建进度追踪器，检查环境状态',
    1: '选择起始模式（选题/素材/草稿）和目标发布平台',
    2: '搜索参考文献、爆款案例和写作技巧',
    3: '与 Claude 交流，澄清写作方向和要点',
    4: '精炼标题、开头和文章结构',
    5: '处理和修改草稿内容',
    6: '使用 content-research-writer 润色文章',
    7: '使用 baoyu-xhs-images 生成配图',
    8: '合并文字和配图，生成终稿',
    9: '审阅文章质量，可选多平台适配',
    10: '发布到微信公众号或 X',
    11: '回顾执行日志，记录经验教训',
  };
  return descriptions[stepId] || '';
}
