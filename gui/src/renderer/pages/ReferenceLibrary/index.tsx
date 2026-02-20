import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { useProjectPath } from '../../hooks/use-file-system';

interface AuthorInfo {
  name: string;
  slug: string;
  summary: string;
  articleCount: number;
  source: 'system' | 'user';
  profilePath: string;
}

interface RefSection {
  content: string;
  loading: boolean;
}

export default function ReferenceLibrary() {
  const { data: projectPath } = useProjectPath();
  const [search, setSearch] = useState('');
  const [authors, setAuthors] = useState<AuthorInfo[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorInfo | null>(null);
  const [authorDetail, setAuthorDetail] = useState('');
  const [sections, setSections] = useState<Record<string, RefSection>>({
    titles: { content: '', loading: true },
    openings: { content: '', loading: true },
    structures: { content: '', loading: true },
    hooks: { content: '', loading: true },
    techniques: { content: '', loading: true },
  });

  const loadData = useCallback(async () => {
    if (!projectPath || !window.electronAPI) return;

    // Load authors from references/authors/
    const authorsLoaded: AuthorInfo[] = [];

    // System level
    const sysAuthorsDir = `${projectPath}/references/authors`;
    try {
      const dirs = await window.electronAPI.fs.listDir(sysAuthorsDir);
      for (const dir of dirs) {
        if (!dir.isDirectory) continue;
        let summary = '';
        let articleCount = 0;
        try {
          const profile = await window.electronAPI.fs.readFile(`${dir.path}/profile.md`);
          const summaryMatch = profile.match(/(?:简介|summary|描述)[:：]\s*(.+)/i);
          summary = summaryMatch ? summaryMatch[1] : profile.split('\n').filter(l => l.trim()).slice(0, 2).join(' ').substring(0, 80);
        } catch { /* no profile */ }
        try {
          const articles = await window.electronAPI.fs.listDir(`${dir.path}/articles`);
          articleCount = articles.filter(f => f.name.endsWith('.md')).length;
        } catch { /* no articles dir */ }
        authorsLoaded.push({
          name: dir.name,
          slug: dir.name,
          summary,
          articleCount,
          source: 'system',
          profilePath: `${dir.path}/profile.md`,
        });
      }
    } catch { /* dir may not exist */ }

    // User level (assets/ authors if different structure - skip for now, same root)
    setAuthors(authorsLoaded);

    // Load reference sections
    const refPaths: Record<string, string[]> = {
      titles: ['references/by-element/titles/titles-index.md'],
      openings: ['references/by-element/openings/openings-index.md'],
      structures: ['references/by-element/structures/structure-templates.md'],
      hooks: ['references/by-element/hooks/hook-examples.md'],
      techniques: ['references/techniques/psychology/psychology-index.md'],
    };

    const newSections: Record<string, RefSection> = {};
    for (const [key, paths] of Object.entries(refPaths)) {
      let combined = '';
      for (const relPath of paths) {
        const fullPath = `${projectPath}/${relPath}`;
        try {
          const exists = await window.electronAPI.fs.exists(fullPath);
          if (exists) {
            const content = await window.electronAPI.fs.readFile(fullPath);
            combined += content + '\n\n';
          }
        } catch { /* skip */ }
      }

      // Also try 3L read for merged content
      if (!combined) {
        try {
          const merged = await window.electronAPI.fs.read3L(paths[0]);
          combined = merged.merged;
        } catch { /* skip */ }
      }

      newSections[key] = { content: combined.trim(), loading: false };
    }
    setSections(newSections);
  }, [projectPath]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectAuthor = async (author: AuthorInfo) => {
    setSelectedAuthor(author);
    if (window.electronAPI) {
      try {
        const content = await window.electronAPI.fs.readFile(author.profilePath);
        setAuthorDetail(content);
      } catch {
        setAuthorDetail('');
      }
    }
  };

  const filteredAuthors = search
    ? authors.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.summary.includes(search))
    : authors;

  return (
    <div className="space-y-6">
      <div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索参考库..."
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="authors">
        <TabsList>
          <TabsTrigger value="authors">作者 ({authors.length})</TabsTrigger>
          <TabsTrigger value="titles">标题</TabsTrigger>
          <TabsTrigger value="openings">开头</TabsTrigger>
          <TabsTrigger value="structures">结构</TabsTrigger>
          <TabsTrigger value="hooks">金句/钩子</TabsTrigger>
          <TabsTrigger value="techniques">方法论</TabsTrigger>
        </TabsList>

        <TabsContent value="authors" className="space-y-4">
          {filteredAuthors.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>{authors.length === 0 ? '未找到作者档案' : '无匹配结果'}</p>
                <p className="text-xs mt-1">作者档案位于 references/authors/&lt;name&gt;/profile.md</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4">
              <div className="grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-3 content-start">
                {filteredAuthors.map((author) => (
                  <Card
                    key={author.slug}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSelectAuthor(author)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{author.name}</CardTitle>
                        <Badge
                          variant={author.source === 'system' ? 'secondary' : 'default'}
                          className="text-[10px]"
                        >
                          {author.source}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{author.summary || '暂无简介'}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{author.articleCount} 篇参考文章</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedAuthor && authorDetail && (
                <div className="w-96 shrink-0">
                  <Card className="h-[calc(100vh-16rem)]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{selectedAuthor.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-20rem)]">
                        <MarkdownPreview content={authorDetail} />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {(['titles', 'openings', 'structures', 'hooks', 'techniques'] as const).map((key) => {
          const labels: Record<string, { title: string; desc: string }> = {
            titles: { title: '标题模式库', desc: 'references/by-element/titles/' },
            openings: { title: '开头案例库', desc: 'references/by-element/openings/' },
            structures: { title: '结构模板', desc: 'references/by-element/structures/' },
            hooks: { title: '金句和钩子', desc: 'references/by-element/hooks/' },
            techniques: { title: '写作方法论', desc: 'references/techniques/psychology/' },
          };
          const info = labels[key];
          const section = sections[key];

          return (
            <TabsContent key={key} value={key} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{info.title}</CardTitle>
                  <CardDescription>{info.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  {section?.loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-4 animate-pulse rounded bg-muted" />
                      ))}
                    </div>
                  ) : section?.content ? (
                    <ScrollArea className="max-h-[calc(100vh-20rem)]">
                      <MarkdownPreview content={
                        search ? highlightSearch(section.content, search) : section.content
                      } />
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      暂无数据 — 文件尚未创建
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function highlightSearch(content: string, term: string): string {
  // Just return content as-is — MarkdownPreview doesn't support HTML highlighting
  // The search filters are handled at the tab level
  return content;
}
