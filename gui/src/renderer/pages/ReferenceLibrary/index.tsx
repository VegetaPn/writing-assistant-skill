import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export default function ReferenceLibrary() {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Input placeholder="搜索参考库..." className="max-w-md" />
      </div>

      <Tabs defaultValue="authors">
        <TabsList>
          <TabsTrigger value="authors">作者</TabsTrigger>
          <TabsTrigger value="titles">标题</TabsTrigger>
          <TabsTrigger value="openings">开头</TabsTrigger>
          <TabsTrigger value="structures">结构</TabsTrigger>
          <TabsTrigger value="hooks">金句/钩子</TabsTrigger>
          <TabsTrigger value="techniques">方法论</TabsTrigger>
        </TabsList>

        <TabsContent value="authors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AuthorCard
              name="Dan Koe"
              articles={2}
              source="system"
              summary="个人成长、内容创业、认知提升领域作者"
            />
          </div>
        </TabsContent>

        <TabsContent value="titles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">标题模式库</CardTitle>
              <CardDescription>从参考文章中提取的标题模式</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                数据从 references/by-element/titles/titles-index.md 加载
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">开头案例库</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                数据从 references/by-element/openings/openings-index.md 加载
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">结构模板</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                数据从 references/by-element/structures/structure-templates.md 加载
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">金句和钩子</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                数据从 references/by-element/hooks/hook-examples.md 加载
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="techniques" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">写作方法论</CardTitle>
              <CardDescription>心理学原理和写作技巧</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                数据从 references/techniques/psychology/ 加载
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AuthorCard({
  name,
  articles,
  source,
  summary,
}: {
  name: string;
  articles: number;
  source: string;
  summary: string;
}) {
  return (
    <Card className="cursor-pointer hover:bg-accent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{name}</CardTitle>
          <Badge
            variant={source === 'system' ? 'secondary' : source === 'user' ? 'default' : 'outline'}
            className="text-[10px]"
          >
            {source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{summary}</p>
        <p className="mt-2 text-xs text-muted-foreground">{articles} 篇参考文章</p>
      </CardContent>
    </Card>
  );
}
