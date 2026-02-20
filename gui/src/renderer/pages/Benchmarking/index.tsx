import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { useAppStore } from '../../stores/app-store';
import { useActivityLogStore } from '../../stores/activity-log-store';
import { useProjectPath, useSettings, useUpdateSetting } from '../../hooks/use-file-system';
import { cn } from '../../lib/utils';
import type { MonitorConfig } from '../../../shared/types';

export default function Benchmarking() {
  const monitorStatus = useAppStore((s) => s.monitorStatus);
  const setMonitorStatus = useAppStore((s) => s.setMonitorStatus);
  const log = useActivityLogStore();
  const { data: projectPath } = useProjectPath();
  const { data: settings } = useSettings();
  const updateSetting = useUpdateSetting();

  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [benchmarkIndex, setBenchmarkIndex] = useState('');
  const [indexLoading, setIndexLoading] = useState(true);

  // Monitor config state
  const [intervalMinutes, setIntervalMinutes] = useState(240);
  const [keywords, setKeywords] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['xiaohongshu', 'wechat', 'x']);

  // Load settings into local state
  useEffect(() => {
    if (settings?.monitorConfig) {
      setIntervalMinutes(settings.monitorConfig.intervalMinutes || 240);
      setKeywords(settings.monitorConfig.keywords?.join(', ') || '');
      setPlatforms(settings.monitorConfig.platforms || ['xiaohongshu', 'wechat', 'x']);
    }
  }, [settings]);

  // Load benchmark index
  const loadIndex = useCallback(async () => {
    if (!projectPath || !window.electronAPI) return;
    setIndexLoading(true);
    try {
      const indexPath = `${projectPath}/assets/topics/benchmarks/benchmarks-index.md`;
      const exists = await window.electronAPI.fs.exists(indexPath);
      if (exists) {
        const content = await window.electronAPI.fs.readFile(indexPath);
        setBenchmarkIndex(content);
      }
    } catch { /* skip */ }
    setIndexLoading(false);
  }, [projectPath]);

  useEffect(() => {
    loadIndex();
  }, [loadIndex]);

  const handleAnalyze = async () => {
    if (!analyzeUrl.trim() || !window.electronAPI) return;
    setAnalyzing(true);
    setAnalysisResult('');
    log.addEntry('info', '爆款分析', `开始分析: ${analyzeUrl}`);
    log.incrementActive();
    try {
      const sessionId = await window.electronAPI.agent.query({
        prompt: `分析爆款 ${analyzeUrl}`,
        systemPrompt: '你是爆款分析助手。请深度分析这条内容的标题、结构、钩子、情绪节奏等要素，提取可复用的模式。',
      });
      log.addEntry('info', '爆款分析', `Agent 会话已启动: ${sessionId.substring(0, 20)}...`);

      const unsub = window.electronAPI.agent.onStream((_sid, msg) => {
        if (msg.role === 'assistant' && msg.content) {
          setAnalysisResult(prev => prev + msg.content);
        }
      });

      const unsubComplete = window.electronAPI.agent.onComplete(() => {
        setAnalyzing(false);
        log.decrementActive();
        log.addEntry('success', '爆款分析', '分析完成');
        unsub();
        unsubComplete();
        loadIndex();
      });

      const unsubError = window.electronAPI.agent.onError((_sid, err) => {
        setAnalyzing(false);
        log.decrementActive();
        log.addEntry('error', '爆款分析', `分析失败: ${err}`);
        unsub();
        unsubError();
      });
    } catch (e) {
      setAnalyzing(false);
      log.decrementActive();
      log.addEntry('error', '爆款分析', `启动失败: ${e}`);
    }
  };

  const handleManualScan = async () => {
    if (!window.electronAPI) return;
    setScanning(true);
    setScanResult('');
    log.addEntry('info', '手动扫描', '开始跨平台热点扫描...');
    log.incrementActive();
    try {
      const sessionId = await window.electronAPI.agent.query({
        prompt: '监控爆款',
        systemPrompt: '你是热点监控助手。请扫描各平台热门内容，找出与用户关注领域相关的爆款。',
      });
      log.addEntry('info', '手动扫描', `Agent 会话已启动: ${sessionId.substring(0, 20)}...`);

      const unsub = window.electronAPI.agent.onStream((_sid, msg) => {
        if (msg.role === 'assistant' && msg.content) {
          setScanResult(prev => prev + msg.content);
        }
      });

      const unsubComplete = window.electronAPI.agent.onComplete(() => {
        setScanning(false);
        log.decrementActive();
        log.addEntry('success', '手动扫描', '扫描完成');
        unsub();
        unsubComplete();
        loadIndex();
      });

      const unsubError = window.electronAPI.agent.onError((_sid, err) => {
        setScanning(false);
        log.decrementActive();
        log.addEntry('error', '手动扫描', `扫描失败: ${err}`);
        unsub();
        unsubError();
      });
    } catch (e) {
      setScanning(false);
      log.decrementActive();
      log.addEntry('error', '手动扫描', `启动失败: ${e}`);
    }
  };

  const handleStartMonitor = async () => {
    if (!window.electronAPI) return;
    try {
      const config: MonitorConfig = {
        enabled: true,
        intervalMinutes,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        platforms,
        thresholds: {},
      };
      await updateSetting.mutateAsync({ key: 'monitorConfig', value: config });
      await window.electronAPI.monitor.start(config);
      setMonitorStatus('running');
      log.addEntry('success', '后台监控', `已启动，每 ${intervalMinutes} 分钟扫描一次`);
    } catch (error) {
      log.addEntry('error', '后台监控', `启动失败: ${error}`);
    }
  };

  const handleStopMonitor = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.monitor.stop();
      setMonitorStatus('idle');
      log.addEntry('info', '后台监控', '已停止');
    } catch (error) {
      log.addEntry('error', '后台监控', `停止失败: ${error}`);
    }
  };

  const handleSaveConfig = async () => {
    const config: MonitorConfig = {
      enabled: monitorStatus === 'running' || monitorStatus === 'scanning',
      intervalMinutes,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      platforms,
      thresholds: {},
    };
    await updateSetting.mutateAsync({ key: 'monitorConfig', value: config });
  };

  const togglePlatform = (p: string) => {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const isRunning = monitorStatus === 'running' || monitorStatus === 'scanning';

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analyze">
        <TabsList>
          <TabsTrigger value="analyze">分析爆款</TabsTrigger>
          <TabsTrigger value="scan">手动扫描</TabsTrigger>
          <TabsTrigger value="monitor">后台监控</TabsTrigger>
          <TabsTrigger value="index">爆款索引</TabsTrigger>
        </TabsList>

        {/* Analyze */}
        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">分析爆款内容</CardTitle>
              <CardDescription>输入文章 URL，Claude 会深度分析其成功要素</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={analyzeUrl}
                  onChange={(e) => setAnalyzeUrl(e.target.value)}
                  placeholder="输入文章 URL..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <Button onClick={handleAnalyze} disabled={!analyzeUrl.trim() || analyzing}>
                  {analyzing ? '分析中...' : '分析'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {analyzing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span>Claude 正在分析...</span>
                </div>
              ) : analysisResult ? (
                <ScrollArea className="max-h-[calc(100vh-24rem)]">
                  <MarkdownPreview content={analysisResult} />
                </ScrollArea>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  输入 URL 并点击"分析"查看结果
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual scan */}
        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">手动扫描</CardTitle>
              <CardDescription>让 Claude 跨平台扫描热门内容</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={handleManualScan} disabled={scanning}>
                  {scanning ? '扫描中...' : '开始扫描'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(scanning || scanResult) && (
            <Card>
              <CardContent className="pt-6">
                {scanning ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span>扫描进行中...</span>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[calc(100vh-24rem)]">
                    <MarkdownPreview content={scanResult} />
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Background monitor */}
        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">后台监控</CardTitle>
                  <CardDescription>自动定时扫描热点内容，配置保存到 settings</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        isRunning ? 'bg-green-500' : 'bg-gray-400',
                        monitorStatus === 'scanning' && 'animate-pulse'
                      )}
                    />
                    <span className="text-sm">
                      {monitorStatus === 'running' ? '运行中' :
                       monitorStatus === 'scanning' ? '扫描中' : '已停止'}
                    </span>
                  </div>
                  <Switch
                    checked={isRunning}
                    onCheckedChange={(checked) => {
                      if (checked) handleStartMonitor();
                      else handleStopMonitor();
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">扫描频率</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">每</span>
                    <Input
                      type="number"
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 240)}
                      min={1}
                      max={1440}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">分钟扫描一次</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    最低 1 分钟，建议不低于 10 分钟以避免被平台限流。常用值：10、30、60、240 分钟
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">监控关键词</label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="关键词1, 关键词2, ..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">监控平台</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'xiaohongshu', label: '小红书' },
                      { key: 'wechat', label: '微信' },
                      { key: 'x', label: 'X' },
                    ].map((p) => (
                      <Badge
                        key={p.key}
                        variant={platforms.includes(p.key) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => togglePlatform(p.key)}
                      >
                        {p.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveConfig}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? '保存中...' : '保存配置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Index */}
        <TabsContent value="index" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">爆款索引</CardTitle>
                  <CardDescription>已分析的爆款内容库 (assets/topics/benchmarks/benchmarks-index.md)</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadIndex}>
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {indexLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : benchmarkIndex ? (
                <ScrollArea className="max-h-[calc(100vh-18rem)]">
                  <MarkdownPreview content={benchmarkIndex} />
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无爆款记录</p>
                  <p className="text-xs mt-1">分析或扫描爆款内容后将在这里显示</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
