import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAppStore } from '../../stores/app-store';
import { cn } from '../../lib/utils';

export default function Benchmarking() {
  const monitorStatus = useAppStore((s) => s.monitorStatus);
  const setMonitorStatus = useAppStore((s) => s.setMonitorStatus);
  const [analyzeUrl, setAnalyzeUrl] = useState('');

  const handleStartMonitor = async () => {
    try {
      await window.electronAPI?.monitor.start();
      setMonitorStatus('running');
    } catch (error) {
      console.error('Failed to start monitor:', error);
    }
  };

  const handleStopMonitor = async () => {
    try {
      await window.electronAPI?.monitor.stop();
      setMonitorStatus('idle');
    } catch (error) {
      console.error('Failed to stop monitor:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analyze">
        <TabsList>
          <TabsTrigger value="analyze">分析爆款</TabsTrigger>
          <TabsTrigger value="scan">手动扫描</TabsTrigger>
          <TabsTrigger value="monitor">后台监控</TabsTrigger>
          <TabsTrigger value="index">爆款索引</TabsTrigger>
        </TabsList>

        {/* Analyze viral content */}
        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">分析爆款内容</CardTitle>
              <CardDescription>输入文章 URL 进行深度分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={analyzeUrl}
                  onChange={(e) => setAnalyzeUrl(e.target.value)}
                  placeholder="输入文章 URL..."
                />
                <Button disabled={!analyzeUrl.trim()}>分析</Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis results area */}
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>输入 URL 并点击"分析"查看结果</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual scan */}
        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">手动扫描</CardTitle>
              <CardDescription>跨平台热点内容扫描</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button>开始扫描</Button>
                <Button variant="outline">查看上次结果</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background monitor */}
        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">后台监控</CardTitle>
                  <CardDescription>自动定时扫描热点内容</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        monitorStatus === 'running' || monitorStatus === 'scanning'
                          ? 'bg-green-500'
                          : 'bg-gray-400',
                        monitorStatus === 'scanning' && 'animate-pulse'
                      )}
                    />
                    <span className="text-sm">
                      {monitorStatus === 'running'
                        ? '运行中'
                        : monitorStatus === 'scanning'
                        ? '扫描中'
                        : '已停止'}
                    </span>
                  </div>
                  <Switch
                    checked={monitorStatus === 'running' || monitorStatus === 'scanning'}
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
                    <Input type="number" defaultValue={240} min={1} max={1440} className="w-24" />
                    <span className="text-sm text-muted-foreground">分钟扫描一次</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    最低 1 分钟，建议不低于 10 分钟以避免被平台限流。常用值：10 分钟、30 分钟、60 分钟、240 分钟（4小时）
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">监控关键词</label>
                  <Input placeholder="关键词1, 关键词2, ..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">监控平台</label>
                  <div className="flex gap-2">
                    {['小红书', '微信', 'X'].map((platform) => (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className="cursor-pointer"
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Index */}
        <TabsContent value="index" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">爆款索引</CardTitle>
              <CardDescription>已分析的爆款内容库</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input placeholder="搜索爆款..." />
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无爆款记录</p>
                <p className="text-xs mt-1">分析或扫描爆款内容后将在这里显示</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
