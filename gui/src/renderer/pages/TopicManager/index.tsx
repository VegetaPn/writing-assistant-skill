import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../lib/utils';

type TopicView = 'board' | 'list';
type TopicColumn = 'inbox' | 'developing' | 'ready';

interface TopicItem {
  id: string;
  title: string;
  status: TopicColumn;
  summary?: string;
  createdAt: string;
}

export default function TopicManager() {
  const [view, setView] = useState<TopicView>('board');
  const [newTopicInput, setNewTopicInput] = useState('');
  const [topics, setTopics] = useState<TopicItem[]>([]);

  const handleAddTopic = () => {
    if (!newTopicInput.trim()) return;
    const newTopic: TopicItem = {
      id: `topic_${Date.now()}`,
      title: newTopicInput,
      status: 'inbox',
      createdAt: new Date().toISOString(),
    };
    setTopics([...topics, newTopic]);
    setNewTopicInput('');
  };

  const columns: { key: TopicColumn; label: string; color: string }[] = [
    { key: 'inbox', label: '收件箱', color: 'bg-blue-500' },
    { key: 'developing', label: '深化中', color: 'bg-yellow-500' },
    { key: 'ready', label: '可写作', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              value={newTopicInput}
              onChange={(e) => setNewTopicInput(e.target.value)}
              placeholder="快速记录选题想法..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
            />
            <Button onClick={handleAddTopic}>记录选题</Button>
          </div>
        </CardContent>
      </Card>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">选题看板</h3>
        <div className="flex gap-1">
          <Button
            variant={view === 'board' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('board')}
          >
            看板
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            列表
          </Button>
        </div>
      </div>

      {/* Board view */}
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => {
          const columnTopics = topics.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn('h-2 w-2 rounded-full', col.color)} />
                <span className="text-sm font-medium">{col.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {columnTopics.length}
                </Badge>
              </div>
              <div className="min-h-[200px] space-y-2 rounded-md border border-dashed p-2">
                {columnTopics.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    暂无选题
                  </p>
                ) : (
                  columnTopics.map((topic) => (
                    <Card key={topic.id} className="cursor-pointer p-3 hover:bg-accent">
                      <p className="text-sm font-medium">{topic.title}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(topic.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
