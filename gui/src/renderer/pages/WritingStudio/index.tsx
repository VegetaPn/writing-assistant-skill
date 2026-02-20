import React, { useState, useEffect, useCallback } from 'react';
import { WRITING_STEPS, PLATFORMS, PLATFORM_LABELS } from '../../../shared/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { AgentChat } from '../../components/AgentChat';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { useProjectPath } from '../../hooks/use-file-system';
import { useActivityLogStore } from '../../stores/activity-log-store';
import { cn } from '../../lib/utils';
import type { StepStatus, WritingMode } from '../../../shared/types';

interface StepState {
  id: number;
  label: string;
  key: string;
  status: StepStatus;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export default function WritingStudio() {
  const { data: projectPath } = useProjectPath();
  const log = useActivityLogStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepState[]>(
    WRITING_STEPS.map((s) => ({ ...s, status: 'pending' as StepStatus }))
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<WritingMode | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionSlug, setSessionSlug] = useState('');
  const [topicInput, setTopicInput] = useState('');

  // Step-specific data
  const [initDone, setInitDone] = useState(false);
  const [searchResult, setSearchResult] = useState('');
  const [titleCandidates, setTitleCandidates] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [finalArticle, setFinalArticle] = useState('');
  const [progressContent, setProgressContent] = useState('');
  const [existingTopics, setExistingTopics] = useState<{ name: string; path: string }[]>([]);

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = (completedSteps / steps.length) * 100;

  // Load existing topics for "from topic" mode
  useEffect(() => {
    if (!projectPath || !window.electronAPI) return;
    (async () => {
      try {
        const devDir = `${projectPath}/assets/topics/developing`;
        const exists = await window.electronAPI.fs.exists(devDir);
        if (exists) {
          const files = await window.electronAPI.fs.listDir(devDir);
          setExistingTopics(files.filter(f => f.name.endsWith('.md')).map(f => ({ name: f.name.replace('.md', ''), path: f.path })));
        }
      } catch { /* skip */ }
    })();
  }, [projectPath]);

  const updateStepStatus = (stepId: number, status: StepStatus) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status } : s))
    );
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep || steps[stepId].status === 'completed') {
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

  const outputDir = projectPath && sessionSlug ? `${projectPath}/outputs/${sessionSlug}` : '';

  const startSession = async () => {
    if (!selectedMode || !selectedPlatform || !projectPath) return;

    const slug = sessionSlug || slugify(topicInput || `article-${Date.now()}`);
    setSessionSlug(slug);
    setSessionStarted(true);
    updateStepStatus(0, 'in_progress');

    // Step 0: Create progress tracker
    if (window.electronAPI) {
      try {
        const dir = `${projectPath}/outputs/${slug}`;
        const progressPath = `${dir}/${slug}-progress.md`;

        // Read template
        let template = '';
        try {
          template = await window.electronAPI.fs.readFile(`${projectPath}/assets/progress-template.md`);
        } catch {
          template = `# ${topicInput || slug} - 进度追踪\n\n平台: ${PLATFORM_LABELS[selectedPlatform]}\n模式: ${selectedMode}\n开始时间: ${new Date().toISOString()}\n\n## 步骤清单\n\n${WRITING_STEPS.map(s => `- [ ] Step ${s.id}: ${s.label}`).join('\n')}\n\n## 执行日志\n\n## 纠正记录\n`;
        }

        // Customize template
        const customized = template
          .replace(/\{topic\}/g, topicInput || slug)
          .replace(/\{platform\}/g, PLATFORM_LABELS[selectedPlatform] || selectedPlatform)
          .replace(/\{mode\}/g, selectedMode)
          .replace(/\{date\}/g, new Date().toISOString().split('T')[0]);

        await window.electronAPI.fs.writeFile(progressPath, customized);
        setProgressContent(customized);
        setInitDone(true);
        log.addEntry('success', '写作工作台', `进度追踪器已创建: outputs/${slug}/${slug}-progress.md`);
        updateStepStatus(0, 'completed');
        setCurrentStep(1);
        updateStepStatus(1, 'in_progress');
      } catch (error) {
        console.error('Failed to create progress tracker:', error);
      }
    }
  };

  // Step 2: Search references
  const runSearch = useCallback(async () => {
    if (!window.electronAPI || !projectPath) return;
    setSearchResult('');
    log.addEntry('info', '写作工作台', 'Step 2: 搜索参考资料...');
    log.incrementActive();
    try {
      const sessionId = await window.electronAPI.agent.query({
        prompt: `搜索参考 - 主题: ${topicInput || sessionSlug}, 平台: ${selectedPlatform}`,
        systemPrompt: `你是写作助手。当前在执行 Step 2: 搜索参考。请搜索参考库(references/)中的相关资料、爆款案例和写作方法论。目标平台: ${PLATFORM_LABELS[selectedPlatform || '']}。请简洁输出找到的参考要点。`,
        cwd: projectPath,
      });

      const unsub = window.electronAPI.agent.onStream((_sid, msg) => {
        if (msg.role === 'assistant' && msg.content) {
          setSearchResult(prev => prev + msg.content);
        }
      });

      window.electronAPI.agent.onComplete(() => { unsub(); log.decrementActive(); log.addEntry('success', '写作工作台', 'Step 2: 搜索完成'); });
      window.electronAPI.agent.onError((_sid, err) => { unsub(); log.decrementActive(); log.addEntry('error', '写作工作台', `搜索失败: ${err}`); });
    } catch { log.decrementActive(); }
  }, [projectPath, topicInput, sessionSlug, selectedPlatform, log]);

  // Step 4: Generate titles
  const generateTitles = useCallback(async () => {
    if (!window.electronAPI || !projectPath) return;
    setTitleCandidates([]);
    log.addEntry('info', '写作工作台', 'Step 4: 生成标题候选...');
    log.incrementActive();
    try {
      let result = '';
      const sessionId = await window.electronAPI.agent.query({
        prompt: `生成标题 - 主题: ${topicInput || sessionSlug}, 平台: ${PLATFORM_LABELS[selectedPlatform || '']}`,
        systemPrompt: `你是标题生成助手。请为以下主题生成 5 个平台优化的标题候选。目标平台: ${PLATFORM_LABELS[selectedPlatform || '']}。每个标题一行，用数字编号。`,
        cwd: projectPath,
      });

      const unsub = window.electronAPI.agent.onStream((_sid, msg) => {
        if (msg.role === 'assistant' && msg.content) {
          result += msg.content;
        }
      });

      window.electronAPI.agent.onComplete(() => {
        unsub();
        log.decrementActive();
        const titles = result.split('\n')
          .map(l => l.replace(/^\d+[\.\)、]\s*/, '').trim())
          .filter(l => l.length > 2 && l.length < 100);
        setTitleCandidates(titles.slice(0, 10));
        log.addEntry('success', '写作工作台', `Step 4: 生成了 ${titles.length} 个标题候选`);
      });
      window.electronAPI.agent.onError((_sid, err) => { unsub(); log.decrementActive(); log.addEntry('error', '写作工作台', `标题生成失败: ${err}`); });
    } catch { log.decrementActive(); }
  }, [projectPath, topicInput, sessionSlug, selectedPlatform, log]);

  // Step 7: Generate images
  const generateImages = useCallback(async () => {
    if (!window.electronAPI || !projectPath || !outputDir) return;
    try {
      await window.electronAPI.agent.query({
        prompt: `为文章生成配图 - 输出目录: ${outputDir}/xhs-images/`,
        systemPrompt: '你是配图生成助手。请使用 baoyu-xhs-images 技能为文章生成配图。',
        cwd: projectPath,
      });

      // After generation, scan images dir
      window.electronAPI.agent.onComplete(async () => {
        try {
          const imgDir = `${outputDir}/xhs-images`;
          const exists = await window.electronAPI.fs.exists(imgDir);
          if (exists) {
            const files = await window.electronAPI.fs.listDir(imgDir);
            setImages(files.filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f.name)).map(f => f.path));
          }
        } catch { /* skip */ }
      });
    } catch { /* skip */ }
  }, [projectPath, outputDir]);

  // Step 8: Load final article
  const loadFinal = useCallback(async () => {
    if (!window.electronAPI || !outputDir || !sessionSlug) return;
    for (const suffix of ['-final.md', '-polished.md', '.md']) {
      try {
        const path = `${outputDir}/${sessionSlug}${suffix}`;
        const exists = await window.electronAPI.fs.exists(path);
        if (exists) {
          const content = await window.electronAPI.fs.readFile(path);
          setFinalArticle(content);
          return;
        }
      } catch { /* skip */ }
    }
  }, [outputDir, sessionSlug]);

  // Load progress tracker for Step 11
  const loadProgress = useCallback(async () => {
    if (!window.electronAPI || !outputDir || !sessionSlug) return;
    try {
      const path = `${outputDir}/${sessionSlug}-progress.md`;
      const exists = await window.electronAPI.fs.exists(path);
      if (exists) {
        const content = await window.electronAPI.fs.readFile(path);
        setProgressContent(content);
      }
    } catch { /* skip */ }
  }, [outputDir, sessionSlug]);

  // Trigger step-specific actions when entering a step
  useEffect(() => {
    if (!sessionStarted) return;
    const step = steps[currentStep];
    if (step.status !== 'in_progress') return;

    switch (currentStep) {
      case 2: runSearch(); break;
      case 4: generateTitles(); break;
      case 7: generateImages(); break;
      case 8: loadFinal(); break;
      case 11: loadProgress(); break;
    }
  }, [currentStep, sessionStarted, steps, runSearch, generateTitles, generateImages, loadFinal, loadProgress]);

  const platformLabel = selectedPlatform ? PLATFORM_LABELS[selectedPlatform] : '';
  const modeLabel = selectedMode === 'topic' ? '选题' : selectedMode === 'material' ? '素材' : '草稿';

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
            {sessionSlug && (
              <p className="text-[10px] text-muted-foreground truncate" title={sessionSlug}>
                {sessionSlug}
              </p>
            )}
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
                      (step.id <= currentStep || step.status === 'completed')
                        ? 'cursor-pointer hover:bg-accent'
                        : 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() => handleStepClick(step.id)}
                    disabled={step.id > currentStep && step.status !== 'completed'}
                  >
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
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">开始写作</h2>
                <p className="mt-2 text-muted-foreground">
                  选择模式和目标平台来开始一篇新文章
                </p>
              </div>

              {/* Mode selection */}
              <div className="space-y-3 w-full max-w-2xl">
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
                        'flex-1 cursor-pointer p-4 transition-colors hover:border-primary',
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

              {/* Topic input / selector */}
              {selectedMode === 'topic' && existingTopics.length > 0 && (
                <div className="space-y-2 w-full max-w-2xl">
                  <h3 className="text-sm font-medium">选择已深化的选题</h3>
                  <div className="flex flex-wrap gap-2">
                    {existingTopics.map((t) => (
                      <Badge
                        key={t.name}
                        variant={topicInput === t.name ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => { setTopicInput(t.name); setSessionSlug(slugify(t.name)); }}
                      >
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full max-w-2xl space-y-2">
                <h3 className="text-sm font-medium">
                  {selectedMode === 'topic' ? '或输入新主题' : '描述你的写作内容'}
                </h3>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={topicInput}
                  onChange={(e) => { setTopicInput(e.target.value); setSessionSlug(slugify(e.target.value)); }}
                  placeholder={selectedMode === 'draft' ? '粘贴草稿标题或描述...' : '输入主题...'}
                />
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
                disabled={!selectedMode || !selectedPlatform || !topicInput.trim()}
                onClick={startSession}
              >
                开始写作流程
              </Button>
            </div>
          ) : (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Step {steps[currentStep].id}: {steps[currentStep].label}
                    </CardTitle>
                    <CardDescription>{getStepDescription(currentStep)}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{modeLabel}</Badge>
                    <Badge variant="outline">{platformLabel}</Badge>
                    {currentStep > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
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
                  platformLabel={platformLabel}
                  mode={selectedMode!}
                  projectPath={projectPath || ''}
                  sessionSlug={sessionSlug}
                  topicInput={topicInput}
                  outputDir={outputDir}
                  initDone={initDone}
                  searchResult={searchResult}
                  titleCandidates={titleCandidates}
                  selectedTitle={selectedTitle}
                  onSelectTitle={setSelectedTitle}
                  images={images}
                  finalArticle={finalArticle}
                  progressContent={progressContent}
                  onRunSearch={runSearch}
                  onGenerateTitles={generateTitles}
                  onGenerateImages={generateImages}
                  onLoadFinal={loadFinal}
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
  stepId, platform, platformLabel, mode, projectPath, sessionSlug, topicInput, outputDir,
  initDone, searchResult, titleCandidates, selectedTitle, onSelectTitle,
  images, finalArticle, progressContent,
  onRunSearch, onGenerateTitles, onGenerateImages, onLoadFinal,
}: {
  stepId: number; platform: string; platformLabel: string; mode: string;
  projectPath: string; sessionSlug: string; topicInput: string; outputDir: string;
  initDone: boolean; searchResult: string;
  titleCandidates: string[]; selectedTitle: string; onSelectTitle: (t: string) => void;
  images: string[]; finalArticle: string; progressContent: string;
  onRunSearch: () => void; onGenerateTitles: () => void;
  onGenerateImages: () => void; onLoadFinal: () => void;
}) {
  switch (stepId) {
    case 0:
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            {initDone ? (
              <>
                <svg className="mx-auto mb-4 h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">初始化完成</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  进度追踪器已创建: outputs/{sessionSlug}/{sessionSlug}-progress.md
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">正在创建进度追踪器...</p>
              </>
            )}
          </div>
        </div>
      );

    case 1:
      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg font-medium">模式和平台已选择</p>
            <div className="mt-4 flex justify-center gap-3">
              <Badge variant="secondary">模式: {mode === 'topic' ? '选题' : mode === 'material' ? '素材' : '草稿'}</Badge>
              <Badge variant="secondary">平台: {platformLabel}</Badge>
              <Badge variant="secondary">主题: {topicInput}</Badge>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">参考资料搜索结果</h3>
            <Button variant="outline" size="sm" onClick={onRunSearch}>重新搜索</Button>
          </div>
          <ScrollArea className="flex-1">
            {searchResult ? (
              <MarkdownPreview content={searchResult} />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span>正在搜索参考资料和爆款案例...</span>
              </div>
            )}
          </ScrollArea>
        </div>
      );

    case 3:
    case 5:
    case 6:
      return (
        <AgentChat
          className="h-full"
          systemPrompt={getAgentSystemPrompt(stepId, platform, platformLabel, mode, topicInput, sessionSlug, projectPath)}
          placeholder={getAgentPlaceholder(stepId)}
          onComplete={() => {}}
        />
      );

    case 4:
      return (
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">标题候选</h3>
            <Button variant="outline" size="sm" onClick={onGenerateTitles}>重新生成</Button>
          </div>
          <ScrollArea className="flex-1">
            {titleCandidates.length > 0 ? (
              <div className="space-y-2">
                {titleCandidates.map((title, i) => (
                  <Card
                    key={i}
                    className={cn(
                      'cursor-pointer p-3 hover:border-primary',
                      selectedTitle === title && 'border-primary bg-primary/5'
                    )}
                    onClick={() => onSelectTitle(title)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{title}</span>
                      {selectedTitle === title && (
                        <Badge variant="default" className="text-[10px]">已选</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span>正在生成标题候选...</span>
              </div>
            )}
          </ScrollArea>
        </div>
      );

    case 7:
      return (
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">配图</h3>
            <Button variant="outline" size="sm" onClick={onGenerateImages}>生成配图</Button>
          </div>
          <ScrollArea className="flex-1">
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-md border overflow-hidden">
                    <img src={`file://${img}`} alt={`配图 ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p className="text-sm">点击"生成配图"使用 baoyu-xhs-images 生成插图</p>
                <p className="text-xs mt-1">图片将保存到 outputs/{sessionSlug}/xhs-images/</p>
              </div>
            )}
          </ScrollArea>
        </div>
      );

    case 8:
      return (
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">终稿预览</h3>
            <Button variant="outline" size="sm" onClick={onLoadFinal}>刷新</Button>
          </div>
          <ScrollArea className="flex-1">
            {finalArticle ? (
              <MarkdownPreview content={finalArticle} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                完成润色步骤后，终稿将显示在这里
                <br />
                <span className="text-xs">文件: outputs/{sessionSlug}/{sessionSlug}-final.md</span>
              </p>
            )}
          </ScrollArea>
        </div>
      );

    case 9:
      return (
        <AgentChat
          className="h-full"
          systemPrompt={`你是写作审阅助手。当前文章: outputs/${sessionSlug}/, 目标平台: ${platformLabel}。请审阅文章质量，检查标题、结构、节奏。用户可以要求你做多平台适配（通过 content-adapter 技能）。`}
          placeholder="审阅文章，或要求适配到其他平台..."
          onComplete={() => {}}
        />
      );

    case 10:
      return (
        <AgentChat
          className="h-full"
          systemPrompt={`你是发布助手。当前文章在 outputs/${sessionSlug}/。可用发布渠道: 微信公众号(baoyu-post-to-wechat), X/Twitter(baoyu-post-to-x)。请根据用户指令发布文章。`}
          placeholder="输入发布指令，如'发布到微信'..."
          onComplete={() => {}}
        />
      );

    case 11:
      return (
        <div className="flex h-full flex-col p-6">
          <h3 className="text-sm font-medium mb-4">会话复盘</h3>
          <ScrollArea className="flex-1">
            {progressContent ? (
              <MarkdownPreview content={progressContent} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                进度追踪器内容将显示在这里
              </p>
            )}
          </ScrollArea>
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

function getAgentSystemPrompt(stepId: number, platform: string, platformLabel: string, mode: string, topic: string, slug: string, projectPath: string): string {
  const base = `你是写作助手。当前项目: ${projectPath}, 文章目录: outputs/${slug}/, 主题: ${topic}, 目标平台: ${platformLabel}, 模式: ${mode}。`;

  switch (stepId) {
    case 3:
      return base + ' 当前执行 Step 3: 收集澄清。请通过提问深入了解用户的写作意图、目标读者、核心论点。应用已搜索到的参考资料和方法论。';
    case 5:
      return base + ' 当前执行 Step 5: 处理草稿。请根据之前收集的信息和选定的结构，生成或处理文章草稿。将结果写入 outputs/' + slug + '/' + slug + '.md。';
    case 6:
      return base + ' 当前执行 Step 6: 润色。请使用 content-research-writer 技能润色文章。输入文件: outputs/' + slug + '/' + slug + '.md, 输出文件: outputs/' + slug + '/' + slug + '-polished.md。';
    default:
      return base;
  }
}

function getAgentPlaceholder(stepId: number): string {
  switch (stepId) {
    case 3: return '描述你想写什么，想传达的核心观点...';
    case 5: return '对草稿提出修改意见...';
    case 6: return '对润色结果提出调整意见...';
    default: return '输入消息...';
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
