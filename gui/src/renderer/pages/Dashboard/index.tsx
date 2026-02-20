import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '../../../shared/constants';
import { useAppStore } from '../../stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

interface RecentSession {
  slug: string;
  path: string;
  modifiedAt: string;
}

interface TopicCounts {
  inbox: number;
  developing: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const envStatus = useAppStore((s) => s.envStatus);
  const setEnvStatus = useAppStore((s) => s.setEnvStatus);
  const monitorStatus = useAppStore((s) => s.monitorStatus);
  const notifications = useAppStore((s) => s.notifications);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [topicCounts, setTopicCounts] = useState<TopicCounts>({ inbox: 0, developing: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        // Load recent sessions by listing outputs dir
        const projectPath = await window.electronAPI.app.getProjectPath();
        const outputsDir = `${projectPath}/outputs`;

        const exists = await window.electronAPI.fs.exists(outputsDir);
        if (exists) {
          const files = await window.electronAPI.fs.listDir(outputsDir);
          setRecentSessions(
            files
              .filter((f) => f.isDirectory)
              .slice(0, 5)
              .map((f) => ({
                slug: f.name,
                path: f.path,
                modifiedAt: f.modifiedAt,
              }))
          );
        }

        // Load topic counts
        const inboxPath = `${projectPath}/assets/topics/inbox.md`;
        const devDir = `${projectPath}/assets/topics/developing`;

        let inbox = 0;
        let developing = 0;

        try {
          const inboxContent = await window.electronAPI.fs.readFile(inboxPath);
          inbox = (inboxContent.match(/^##\s|^-\s\[/gm) || []).length;
        } catch { /* empty */ }

        try {
          const devFiles = await window.electronAPI.fs.listDir(devDir);
          developing = devFiles.filter((f) => f.name.endsWith('.md')).length;
        } catch { /* empty */ }

        setTopicCounts({ inbox, developing });

        // Run env check if not done
        if (!envStatus) {
          const result = await window.electronAPI.env.check();
          setEnvStatus(result);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentNotifications = notifications
    .filter((n) => n.type === 'monitor')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate(PAGES.WRITING_STUDIO)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新建文章
        </Button>
        <Button variant="outline" onClick={() => navigate(PAGES.TOPIC_MANAGER)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          记录选题
        </Button>
        <Button variant="outline" onClick={() => navigate(PAGES.BENCHMARKING)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          扫描热点
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Topic Pipeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>选题管线</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline">{topicCounts.inbox}</Badge>
                <span className="text-xs text-muted-foreground">收件箱</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary">{topicCounts.developing}</Badge>
                <span className="text-xs text-muted-foreground">深化中</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent sessions count */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>写作会话</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentSessions.length}</div>
            <p className="text-xs text-muted-foreground">篇文章</p>
          </CardContent>
        </Card>

        {/* Environment status */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>环境状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  !envStatus
                    ? 'bg-gray-400'
                    : envStatus.overall === 'ok'
                    ? 'bg-green-500'
                    : envStatus.overall === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
              />
              <span className="text-sm font-medium">
                {!envStatus
                  ? '未检查'
                  : envStatus.overall === 'ok'
                  ? '正常'
                  : envStatus.overall === 'warning'
                  ? '部分异常'
                  : '异常'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monitor status */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>后台监控</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  monitorStatus === 'running' ? 'bg-green-500' :
                  monitorStatus === 'scanning' ? 'bg-green-500 animate-pulse' :
                  monitorStatus === 'paused' ? 'bg-yellow-500' :
                  'bg-gray-400'
                )}
              />
              <span className="text-sm font-medium">
                {monitorStatus === 'running' ? '运行中' :
                 monitorStatus === 'scanning' ? '扫描中' :
                 monitorStatus === 'paused' ? '已暂停' :
                 '未启动'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近写作</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无写作会话</p>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <div
                    key={session.slug}
                    className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
                    onClick={() => navigate(PAGES.WRITING_STUDIO)}
                  >
                    <div>
                      <p className="text-sm font-medium">{session.slug}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.modifiedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent monitoring findings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近发现</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无监控发现</p>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((notif) => (
                  <div key={notif.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(notif.timestamp).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
