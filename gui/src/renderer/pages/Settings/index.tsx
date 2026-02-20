import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../lib/utils';
import type { EnvCheckResult, EnvCheckItem } from '../../../shared/types';

export default function Settings() {
  const envStatus = useAppStore((s) => s.envStatus);
  const setEnvStatus = useAppStore((s) => s.setEnvStatus);

  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [proxyAddress, setProxyAddress] = useState('127.0.0.1:7890');
  const [proxyEnabled, setProxyEnabled] = useState(true);
  const [projectPath, setProjectPath] = useState('');
  const [envChecking, setEnvChecking] = useState(false);
  const [dependencies, setDependencies] = useState<Array<{ name: string; installed: boolean }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!window.electronAPI) return;

    try {
      const settings = await window.electronAPI.settings.getAll();
      setApiKey(settings.openrouterApiKey || '');
      setProxyAddress(settings.proxyAddress || '127.0.0.1:7890');
      setProxyEnabled(settings.proxyEnabled ?? true);
      setProjectPath(settings.projectPath || '');
    } catch {
      // Use defaults
    }

    try {
      const path = await window.electronAPI.app.getProjectPath();
      if (!projectPath) setProjectPath(path);
    } catch { /* empty */ }
  };

  const handleEnvCheck = async () => {
    if (!window.electronAPI) return;

    setEnvChecking(true);
    try {
      const result = await window.electronAPI.env.check();
      setEnvStatus(result);
    } catch (error) {
      console.error('Env check failed:', error);
    } finally {
      setEnvChecking(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!window.electronAPI) return;

    setSaving(true);
    try {
      await window.electronAPI.settings.set('openrouterApiKey', apiKey);
      await window.electronAPI.settings.set('proxyAddress', proxyAddress);
      await window.electronAPI.settings.set('proxyEnabled', proxyEnabled);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Environment Check */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">环境检查</CardTitle>
              <CardDescription>检查所有必要的依赖和配置</CardDescription>
            </div>
            <Button onClick={handleEnvCheck} disabled={envChecking}>
              {envChecking ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  检查中...
                </>
              ) : (
                '运行检查'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {envStatus ? (
            <div className="space-y-3">
              {/* Overall status */}
              <div className="flex items-center gap-2 rounded-md border p-3">
                <StatusDot status={envStatus.overall} />
                <span className="font-medium">
                  {envStatus.overall === 'ok'
                    ? '所有检查通过'
                    : envStatus.overall === 'warning'
                    ? '部分项目需要注意'
                    : '存在错误'}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(envStatus.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>

              {/* Individual items */}
              <div className="space-y-2">
                {envStatus.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <StatusDot status={item.status} />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              点击"运行检查"以验证环境配置
            </p>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API 密钥</CardTitle>
          <CardDescription>配置外部服务的 API 密钥</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">OPENROUTER_API_KEY</label>
            <div className="flex gap-2">
              <Input
                type={apiKeyVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
              >
                {apiKeyVisible ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              用于图片生成等服务
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Network Proxy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">网络代理</CardTitle>
          <CardDescription>配置外网访问代理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">启用代理</label>
            <Switch checked={proxyEnabled} onCheckedChange={setProxyEnabled} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">代理地址</label>
            <Input
              value={proxyAddress}
              onChange={(e) => setProxyAddress(e.target.value)}
              placeholder="127.0.0.1:7890"
              disabled={!proxyEnabled}
            />
            <p className="text-xs text-muted-foreground">
              用于 bird CLI、WebSearch 等外网抓取
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Project Path */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">项目路径</CardTitle>
          <CardDescription>Writing Assistant Skill 的工作目录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="/path/to/writing-assistant-skill"
            />
            <Button variant="outline">浏览</Button>
          </div>
        </CardContent>
      </Card>

      {/* Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">依赖管理</CardTitle>
          <CardDescription>已注册的技能依赖</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              'content-research-writer',
              'baoyu-xhs-images',
              'xiaohongshu-mcp',
              'wechat-article-search',
              'generate-image',
              'baoyu-post-to-wechat',
              'baoyu-post-to-x',
            ].map((dep) => (
              <div
                key={dep}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">{dep}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    已注册
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'ok'
      ? 'bg-green-500'
      : status === 'warning'
      ? 'bg-yellow-500'
      : status === 'error'
      ? 'bg-red-500'
      : 'bg-gray-400';

  return <div className={cn('h-2.5 w-2.5 rounded-full', color)} />;
}
