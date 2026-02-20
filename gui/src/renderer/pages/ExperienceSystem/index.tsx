import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { useProjectPath } from '../../hooks/use-file-system';

interface CaseItem {
  fileName: string;
  filePath: string;
  title: string;
  date: string;
  category: string;
  preview: string;
}

export default function ExperienceSystem() {
  const { data: projectPath } = useProjectPath();
  const [lessons, setLessons] = useState<string>('');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [caseContent, setCaseContent] = useState('');

  const loadData = useCallback(async () => {
    if (!projectPath || !window.electronAPI) return;
    setLoading(true);

    // Load lessons.md
    const lessonsPath = `${projectPath}/assets/experiences/lessons.md`;
    try {
      const exists = await window.electronAPI.fs.exists(lessonsPath);
      if (exists) {
        const content = await window.electronAPI.fs.readFile(lessonsPath);
        setLessons(content);
      }
    } catch { /* skip */ }

    // Load cases
    const casesDir = `${projectPath}/assets/experiences/cases`;
    const loadedCases: CaseItem[] = [];
    try {
      const exists = await window.electronAPI.fs.exists(casesDir);
      if (exists) {
        const files = await window.electronAPI.fs.listDir(casesDir);
        for (const file of files) {
          if (!file.name.endsWith('.md')) continue;
          try {
            const content = await window.electronAPI.fs.readFile(file.path);
            const titleMatch = content.match(/^#\s+(.+)/m);
            const dateMatch = content.match(/(?:日期|date)[:：]\s*(\d{4}-\d{2}-\d{2})/i)
              || file.name.match(/(\d{4}-\d{2}-\d{2})/);
            const categoryMatch = content.match(/(?:类别|category|分类|根因)[:：]\s*(.+)/i);

            loadedCases.push({
              fileName: file.name,
              filePath: file.path,
              title: titleMatch ? titleMatch[1] : file.name.replace('.md', ''),
              date: dateMatch ? dateMatch[1] : file.modifiedAt.split('T')[0],
              category: categoryMatch ? categoryMatch[1].trim() : '未分类',
              preview: content.split('\n').slice(1, 5).join(' ').trim().substring(0, 100),
            });
          } catch { /* skip */ }
        }
      }
    } catch { /* skip */ }

    setCases(loadedCases.sort((a, b) => b.date.localeCompare(a.date)));
    setLoading(false);
  }, [projectPath]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectCase = async (c: CaseItem) => {
    setSelectedCase(c);
    if (window.electronAPI) {
      try {
        const content = await window.electronAPI.fs.readFile(c.filePath);
        setCaseContent(content);
      } catch {
        setCaseContent('');
      }
    }
  };

  const handleSummarize = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.agent.query({
        prompt: '请根据 assets/experiences/cases/ 中的所有纠正案例，重新总结经验规则，更新 assets/experiences/lessons.md。',
        systemPrompt: '你是经验沉淀助手。请分析所有案例，按类别分组提炼经验规则。',
      });
    } catch (error) {
      console.error('Failed to summarize:', error);
    }
  };

  // Category stats for root cause analysis
  const categoryStats = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">经验规则</TabsTrigger>
          <TabsTrigger value="cases">纠正案例 ({cases.length})</TabsTrigger>
          <TabsTrigger value="analysis">根因分析</TabsTrigger>
        </TabsList>

        {/* Lessons */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">已蒸馏的经验规则</h3>
            <Button size="sm" onClick={handleSummarize}>总结经验</Button>
          </div>
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : lessons ? (
            <Card>
              <CardContent className="pt-6">
                <ScrollArea className="max-h-[calc(100vh-16rem)]">
                  <MarkdownPreview content={lessons} />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>暂无经验规则</p>
                <p className="text-xs mt-1">积累纠正案例后点击"总结经验"自动生成</p>
                <p className="text-xs mt-1">文件位置: assets/experiences/lessons.md</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cases */}
        <TabsContent value="cases" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">纠正案例时间线</CardTitle>
                  <CardDescription>AI 输出被用户纠正的记录 (assets/experiences/cases/)</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                      ))}
                    </div>
                  ) : cases.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      暂无纠正案例 — 在写作过程中纠正 AI 输出时会自动记录
                    </p>
                  ) : (
                    <ScrollArea className="max-h-[calc(100vh-20rem)]">
                      <div className="space-y-2">
                        {cases.map((c) => (
                          <div
                            key={c.fileName}
                            className={`flex items-center gap-3 rounded-md border p-3 hover:bg-accent cursor-pointer ${
                              selectedCase?.fileName === c.fileName ? 'border-primary bg-accent' : ''
                            }`}
                            onClick={() => handleSelectCase(c)}
                          >
                            <span className="text-xs text-muted-foreground shrink-0">{c.date}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm block truncate">{c.title}</span>
                              {c.preview && (
                                <span className="text-xs text-muted-foreground block truncate">{c.preview}</span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">{c.category}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedCase && caseContent && (
              <div className="w-96 shrink-0">
                <Card className="h-[calc(100vh-16rem)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{selectedCase.title}</CardTitle>
                    <CardDescription>{selectedCase.fileName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[calc(100vh-22rem)]">
                      <MarkdownPreview content={caseContent} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Root cause analysis */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">根因分析</CardTitle>
              <CardDescription>按根因类型聚合的统计（基于 {cases.length} 个案例）</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  积累纠正案例后将显示根因分析
                </p>
              ) : (
                <div className="space-y-3">
                  {sortedCategories.map(([category, count]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{category}</span>
                        <span className="text-muted-foreground">{count} 次</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
