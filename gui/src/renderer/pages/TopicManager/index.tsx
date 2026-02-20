import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { cn } from '../../lib/utils';
import { useProjectPath, useWriteFile } from '../../hooks/use-file-system';

type TopicColumn = 'inbox' | 'developing' | 'ready';

interface TopicItem {
  id: string;
  title: string;
  status: TopicColumn;
  summary?: string;
  createdAt: string;
  filePath?: string;
  content?: string;
}

export default function TopicManager() {
  const { data: projectPath } = useProjectPath();
  const writeFile = useWriteFile();
  const [newTopicInput, setNewTopicInput] = useState('');
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);
  const [topicContent, setTopicContent] = useState<string>('');

  const loadTopics = useCallback(async () => {
    if (!projectPath || !window.electronAPI) return;
    setLoading(true);
    const loaded: TopicItem[] = [];

    try {
      // Load inbox.md
      const inboxPath = `${projectPath}/assets/topics/inbox.md`;
      const inboxExists = await window.electronAPI.fs.exists(inboxPath);
      if (inboxExists) {
        const content = await window.electronAPI.fs.readFile(inboxPath);
        const lines = content.split('\n');
        let currentTitle = '';
        let currentSummary = '';
        let idx = 0;

        for (const line of lines) {
          if (line.startsWith('## ')) {
            if (currentTitle) {
              loaded.push({
                id: `inbox_${idx++}`,
                title: currentTitle,
                status: 'inbox',
                summary: currentSummary.trim(),
                createdAt: '',
                filePath: inboxPath,
              });
            }
            currentTitle = line.replace('## ', '').trim();
            currentSummary = '';
          } else if (line.startsWith('- ')) {
            // Simple list-style entries
            loaded.push({
              id: `inbox_${idx++}`,
              title: line.replace(/^-\s*(\[.\]\s*)?/, '').trim(),
              status: 'inbox',
              createdAt: '',
              filePath: inboxPath,
            });
          } else if (currentTitle && line.trim()) {
            currentSummary += line + '\n';
          }
        }
        if (currentTitle) {
          loaded.push({
            id: `inbox_${idx}`,
            title: currentTitle,
            status: 'inbox',
            summary: currentSummary.trim(),
            createdAt: '',
            filePath: inboxPath,
          });
        }
      }

      // Load developing/ dir
      const devDir = `${projectPath}/assets/topics/developing`;
      const devExists = await window.electronAPI.fs.exists(devDir);
      if (devExists) {
        const devFiles = await window.electronAPI.fs.listDir(devDir);
        for (const file of devFiles) {
          if (!file.name.endsWith('.md')) continue;
          try {
            const content = await window.electronAPI.fs.readFile(file.path);
            const titleMatch = content.match(/^#\s+(.+)/m);
            const title = titleMatch ? titleMatch[1] : file.name.replace('.md', '');
            // If file has "状态: 可写作" or similar, mark as ready
            const isReady = /状态[:：]\s*(可写作|ready)/i.test(content);
            loaded.push({
              id: `dev_${file.name}`,
              title,
              status: isReady ? 'ready' : 'developing',
              summary: content.split('\n').slice(1, 4).join(' ').trim().substring(0, 100),
              createdAt: file.modifiedAt,
              filePath: file.path,
              content,
            });
          } catch { /* skip */ }
        }
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }

    setTopics(loaded);
  }, [projectPath]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const handleAddTopic = async () => {
    if (!newTopicInput.trim() || !projectPath || !window.electronAPI) return;

    const inboxPath = `${projectPath}/assets/topics/inbox.md`;
    let existing = '';
    try {
      existing = await window.electronAPI.fs.readFile(inboxPath);
    } catch { /* file may not exist */ }

    const date = new Date().toISOString().split('T')[0];
    const newEntry = `\n- ${newTopicInput.trim()} (${date})\n`;
    await writeFile.mutateAsync({ path: inboxPath, content: existing + newEntry });

    setNewTopicInput('');
    await loadTopics();
  };

  const handleSelectTopic = async (topic: TopicItem) => {
    setSelectedTopic(topic);
    if (topic.filePath && window.electronAPI) {
      try {
        const content = await window.electronAPI.fs.readFile(topic.filePath);
        setTopicContent(content);
      } catch {
        setTopicContent('');
      }
    }
  };

  const columns: { key: TopicColumn; label: string; color: string }[] = [
    { key: 'inbox', label: '收件箱', color: 'bg-blue-500' },
    { key: 'developing', label: '深化中', color: 'bg-yellow-500' },
    { key: 'ready', label: '可写作', color: 'bg-green-500' },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left: Kanban */}
      <div className="flex-1 space-y-4 overflow-hidden">
        {/* Quick input */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                placeholder="快速记录选题想法...（回车保存到 inbox.md）"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
              />
              <Button onClick={handleAddTopic} disabled={writeFile.isPending}>
                {writeFile.isPending ? '保存中...' : '记录选题'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kanban board */}
        <div className="grid h-[calc(100%-5rem)] grid-cols-3 gap-4">
          {columns.map((col) => {
            const columnTopics = topics.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', col.color)} />
                  <span className="text-sm font-medium">{col.label}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {columnTopics.length}
                  </Badge>
                </div>
                <ScrollArea className="flex-1 rounded-md border border-dashed p-2">
                  {loading ? (
                    <div className="space-y-2 py-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                      ))}
                    </div>
                  ) : columnTopics.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      暂无选题
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {columnTopics.map((topic) => (
                        <Card
                          key={topic.id}
                          className={cn(
                            'cursor-pointer p-3 hover:bg-accent',
                            selectedTopic?.id === topic.id && 'border-primary bg-accent'
                          )}
                          onClick={() => handleSelectTopic(topic)}
                        >
                          <p className="text-sm font-medium">{topic.title}</p>
                          {topic.summary && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {topic.summary}
                            </p>
                          )}
                          {topic.createdAt && (
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {new Date(topic.createdAt).toLocaleDateString('zh-CN')}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Detail panel */}
      {selectedTopic && (
        <div className="w-96 shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{selectedTopic.title}</CardTitle>
              <CardDescription>
                {selectedTopic.filePath?.replace(projectPath || '', '') || ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {topicContent ? (
                  <MarkdownPreview content={topicContent} />
                ) : (
                  <p className="text-sm text-muted-foreground">无详情</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
