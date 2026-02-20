import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export default function Metrics() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">文章列表</TabsTrigger>
          <TabsTrigger value="record">记录数据</TabsTrigger>
          <TabsTrigger value="trends">趋势图表</TabsTrigger>
          <TabsTrigger value="compare">跨文章对比</TabsTrigger>
        </TabsList>

        {/* Article list */}
        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">已发布文章</CardTitle>
              <CardDescription>所有已发布文章及其指标</CardDescription>
            </CardHeader>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>从 outputs/*/metrics.md 加载文章指标数据</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Record data */}
        <TabsContent value="record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">记录数据</CardTitle>
              <CardDescription>为已发布文章录入平台数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">选择文章</label>
                <Input placeholder="选择或搜索文章..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">阅读量</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">点赞数</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">收藏数</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">评论数</label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <Button>保存数据</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">趋势图表</CardTitle>
              <CardDescription>文章指标随时间变化的趋势</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>积累数据后将显示 recharts 趋势图</p>
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
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>选择多篇文章进行对比分析</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
