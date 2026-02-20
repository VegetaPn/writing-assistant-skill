import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { useProjectPath, useWriteFile } from '../../hooks/use-file-system';

interface ArticleData {
  slug: string;
  title: string;
  platform: string;
  publishedAt: string;
  metrics: Record<string, number>;
  metricsPath: string;
  hasMetrics: boolean;
}

export default function Metrics() {
  const { data: projectPath } = useProjectPath();
  const writeFile = useWriteFile();
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<string>('');
  const [formData, setFormData] = useState({ reads: '', likes: '', bookmarks: '', comments: '', shares: '' });

  const loadArticles = useCallback(async () => {
    if (!projectPath || !window.electronAPI) return;
    setLoading(true);

    const outputsDir = `${projectPath}/outputs`;
    const loaded: ArticleData[] = [];

    try {
      const exists = await window.electronAPI.fs.exists(outputsDir);
      if (!exists) { setLoading(false); return; }

      const dirs = await window.electronAPI.fs.listDir(outputsDir);
      for (const dir of dirs) {
        if (!dir.isDirectory) continue;

        const slug = dir.name;
        let title = slug;
        let platform = '';
        let publishedAt = dir.modifiedAt.split('T')[0];
        const metrics: Record<string, number> = {};
        let hasMetrics = false;

        // Try to get title from final or polished article
        for (const suffix of ['-final.md', '-polished.md', '.md']) {
          try {
            const content = await window.electronAPI.fs.readFile(`${dir.path}/${slug}${suffix}`);
            const match = content.match(/^#\s+(.+)/m);
            if (match) { title = match[1]; break; }
          } catch { /* skip */ }
        }

        // Try to read metrics.md
        const metricsPath = `${dir.path}/metrics.md`;
        try {
          const metricsExists = await window.electronAPI.fs.exists(metricsPath);
          if (metricsExists) {
            hasMetrics = true;
            const content = await window.electronAPI.fs.readFile(metricsPath);

            const platformMatch = content.match(/(?:平台|platform)[:：]\s*(.+)/i);
            if (platformMatch) platform = platformMatch[1].trim();

            const dateMatch = content.match(/(?:发布日期|published)[:：]\s*(\d{4}-\d{2}-\d{2})/i);
            if (dateMatch) publishedAt = dateMatch[1];

            // Parse metric entries like "阅读量: 1234" or "| 阅读量 | 1234 |"
            const metricPatterns = [
              /(?:阅读量|reads?|views?)[:：\|]\s*(\d+)/gi,
              /(?:点赞|likes?)[:：\|]\s*(\d+)/gi,
              /(?:收藏|bookmarks?|saves?)[:：\|]\s*(\d+)/gi,
              /(?:评论|comments?)[:：\|]\s*(\d+)/gi,
              /(?:转发|分享|shares?)[:：\|]\s*(\d+)/gi,
            ];
            const metricNames = ['reads', 'likes', 'bookmarks', 'comments', 'shares'];

            for (let i = 0; i < metricPatterns.length; i++) {
              const match = metricPatterns[i].exec(content);
              if (match) metrics[metricNames[i]] = parseInt(match[1], 10);
            }
          }
        } catch { /* skip */ }

        loaded.push({ slug, title, platform, publishedAt, metrics, metricsPath, hasMetrics });
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    }

    setArticles(loaded.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
    setLoading(false);
  }, [projectPath]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleSaveMetrics = async () => {
    if (!selectedArticle || !projectPath) return;

    const article = articles.find(a => a.slug === selectedArticle);
    if (!article) return;

    const date = new Date().toISOString().split('T')[0];
    const content = `# ${article.title} - 数据记录

平台: ${article.platform || '未指定'}
发布日期: ${article.publishedAt}
记录日期: ${date}

## 数据指标

| 指标 | 数值 |
|------|------|
| 阅读量 | ${formData.reads || 0} |
| 点赞数 | ${formData.likes || 0} |
| 收藏数 | ${formData.bookmarks || 0} |
| 评论数 | ${formData.comments || 0} |
| 转发数 | ${formData.shares || 0} |
`;

    try {
      await writeFile.mutateAsync({ path: article.metricsPath, content });
      await loadArticles();
      setFormData({ reads: '', likes: '', bookmarks: '', comments: '', shares: '' });
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  };

  // Aggregate data for comparison
  const metricsKeys = ['reads', 'likes', 'bookmarks', 'comments', 'shares'];
  const metricsLabels: Record<string, string> = {
    reads: '阅读量', likes: '点赞', bookmarks: '收藏', comments: '评论', shares: '转发',
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">文章列表 ({articles.length})</TabsTrigger>
          <TabsTrigger value="record">记录数据</TabsTrigger>
          <TabsTrigger value="compare">跨文章对比</TabsTrigger>
        </TabsList>

        {/* Article list */}
        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">已发布文章</CardTitle>
              <CardDescription>从 outputs/ 目录加载，指标来自各目录下的 metrics.md</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  暂无文章 — 通过写作工作台完成文章后会出现在这里
                </p>
              ) : (
                <ScrollArea className="max-h-[calc(100vh-18rem)]">
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <div
                        key={article.slug}
                        className="flex items-center gap-3 rounded-md border p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{article.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{article.publishedAt}</span>
                            {article.platform && (
                              <Badge variant="outline" className="text-[10px]">{article.platform}</Badge>
                            )}
                          </div>
                        </div>
                        {article.hasMetrics ? (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {article.metrics.reads !== undefined && <span>阅读 {article.metrics.reads}</span>}
                            {article.metrics.likes !== undefined && <span>赞 {article.metrics.likes}</span>}
                            {article.metrics.bookmarks !== undefined && <span>藏 {article.metrics.bookmarks}</span>}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">未记录</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Record data */}
        <TabsContent value="record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">记录数据</CardTitle>
              <CardDescription>为已发布文章录入平台数据，保存到 outputs/&lt;slug&gt;/metrics.md</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">选择文章</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={selectedArticle}
                  onChange={(e) => {
                    setSelectedArticle(e.target.value);
                    const article = articles.find(a => a.slug === e.target.value);
                    if (article?.hasMetrics) {
                      setFormData({
                        reads: String(article.metrics.reads || ''),
                        likes: String(article.metrics.likes || ''),
                        bookmarks: String(article.metrics.bookmarks || ''),
                        comments: String(article.metrics.comments || ''),
                        shares: String(article.metrics.shares || ''),
                      });
                    } else {
                      setFormData({ reads: '', likes: '', bookmarks: '', comments: '', shares: '' });
                    }
                  }}
                >
                  <option value="">选择文章...</option>
                  {articles.map((a) => (
                    <option key={a.slug} value={a.slug}>{a.title} ({a.slug})</option>
                  ))}
                </select>
              </div>
              {selectedArticle && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {metricsKeys.map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{metricsLabels[key]}</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={(formData as Record<string, string>)[key]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveMetrics} disabled={writeFile.isPending}>
                    {writeFile.isPending ? '保存中...' : '保存数据'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">跨文章对比</CardTitle>
              <CardDescription>对比不同文章的表现</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const withMetrics = articles.filter(a => a.hasMetrics);
                if (withMetrics.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      暂无指标数据 — 为文章记录数据后可对比
                    </p>
                  );
                }
                return (
                  <div className="space-y-6">
                    {metricsKeys.map((metric) => {
                      const items = withMetrics
                        .filter(a => a.metrics[metric] !== undefined)
                        .sort((a, b) => (b.metrics[metric] || 0) - (a.metrics[metric] || 0));
                      if (items.length === 0) return null;
                      const max = items[0].metrics[metric] || 1;

                      return (
                        <div key={metric}>
                          <h4 className="text-sm font-medium mb-2">{metricsLabels[metric]}</h4>
                          <div className="space-y-2">
                            {items.map((article) => (
                              <div key={article.slug} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="truncate max-w-[60%]">{article.title}</span>
                                  <span className="text-muted-foreground">{article.metrics[metric]}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${((article.metrics[metric] || 0) / max) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
