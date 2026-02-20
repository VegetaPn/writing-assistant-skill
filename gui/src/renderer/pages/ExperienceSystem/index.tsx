import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export default function ExperienceSystem() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">经验规则</TabsTrigger>
          <TabsTrigger value="cases">纠正案例</TabsTrigger>
          <TabsTrigger value="analysis">根因分析</TabsTrigger>
        </TabsList>

        {/* Lessons */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">已蒸馏的经验规则</h3>
            <Button size="sm">总结经验</Button>
          </div>
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>经验规则从 assets/experiences/lessons.md 加载</p>
              <p className="text-xs mt-1">规则按类别分组，每条关联源案例</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases */}
        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">纠正案例时间线</CardTitle>
              <CardDescription>AI 输出被用户纠正的记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '2026-02-16', title: 'Dan Koe 风格不匹配', category: '风格' },
                  { date: '2026-02-16', title: '需按进度步骤执行', category: '流程' },
                  { date: '2026-02-16', title: 'Manus AI 案例不适合', category: '选材' },
                  { date: '2026-02-16', title: '标题反馈', category: '标题' },
                  { date: '2026-02-16', title: '时间表述模糊', category: '用词' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent cursor-pointer">
                    <span className="text-xs text-muted-foreground">{c.date}</span>
                    <span className="text-sm flex-1">{c.title}</span>
                    <Badge variant="outline" className="text-xs">{c.category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Root cause analysis */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">根因分析</CardTitle>
              <CardDescription>按根因类型聚合的统计</CardDescription>
            </CardHeader>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>根因分析图表将在案例积累后显示</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
