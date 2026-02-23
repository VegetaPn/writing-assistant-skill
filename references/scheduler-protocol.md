# Scheduler Protocol — 自然语言定时任务解析协议

> 由 `skills/scheduler.md` 引用。定义自然语言到调度参数的解析规则。

## NL 解析器

Claude 自身作为自然语言解析器，将用户的中文/英文调度请求转化为结构化参数。

## 解析输出模板

```
Task Form:     single | pipeline
Task:          {任务描述 — 映射到已有命令或自定义 prompt}
Steps:         (pipeline only) [{step1}, {step2}, ...]
Pipeline Goal: (pipeline only) {流水线整体目标描述}
Type:          one-time | recurring | recurring-with-end
Schedule:      {cron 表达式}
Start:         {起始日期，默认立即}
End:           {截止条件: none | count:N | until:YYYY-MM-DD}
Mapping:       {映射到的 skill 和命令}
Prompt:        {传给 claude -p 的完整 prompt}
```

## 已有命令映射表

| 任务关键词 | Skill | Command | Prompt 模板 |
|-----------|-------|---------|------------|
| 监控爆款 / 看热点 | topic-manager | 监控爆款 | `读取 skills/topic-manager.md，执行"监控爆款"命令。` |
| 分析爆款 | topic-manager | 分析爆款 | `读取 skills/topic-manager.md，执行"分析爆款"命令。` |
| 记录数据 | topic-manager | 记录数据 | `读取 skills/topic-manager.md，执行"记录数据"命令。` |
| 深化选题 | topic-manager | 深化选题 | `读取 skills/topic-manager.md，执行"深化选题"命令。` |
| 总结经验 | experience-tracker | 总结经验 | `读取 skills/experience-tracker.md，执行"总结经验"命令。` |
| 自主写作 / 写文章 | writing-assistant | 自主模式 | `自主模式，{用户指定的主题和平台}。` |
| 自定义 | — | — | `{用户自定义 prompt}` |

## NL 解析示例 — 单任务

| 用户输入 | Form | Type | Schedule | Mapping |
|---------|------|------|----------|---------|
| "每天早上9点监控爆款" | single | recurring | `0 9 * * *` | topic-manager/监控爆款 |
| "每周一三五上午10点看热点" | single | recurring | `0 10 * * 1,3,5` | topic-manager/监控爆款 |
| "明天下午3点发布文章" | single | one-time | `0 15 {day} {month} *` | 自定义 |
| "每月1号总结经验" | single | recurring | `0 9 1 * *` | experience-tracker/总结经验 |
| "每2小时监控一次" | single | recurring | `0 */2 * * *` | topic-manager/监控爆款 |
| "工作日每天早上8点" | single | recurring | `0 8 * * 1-5` | (由上下文决定) |

## NL 解析示例 — 流水线

| 用户输入 | Steps | Schedule | Goal |
|---------|-------|----------|------|
| "每天8点先监控爆款分析爆款，然后基于分析结果写文章" | 2步: 监控+分析 → 自主写作 | `0 8 * * *` | 每日爆款监控→写作 |
| "每天先看热点，再深化有潜力的选题" | 2步: 监控爆款 → 深化选题 | (由上下文决定时间) | 热点→选题深化 |
| "每周一先总结经验，再基于经验优化写作策略" | 2步: 总结经验 → 自定义优化 | `0 9 * * 1` | 经验总结→策略优化 |

### 流水线识别词

以下关键词表明用户想要的是流水线（多步串行）而非单任务：
- "先...然后..."
- "先...再..."
- "...之后..."
- "第一步...第二步..."
- "基于结果..."
- "...完了之后..."

## Cron 表达式速查

| 中文 | Cron 表达式 |
|------|------------|
| 每天早上 N 点 | `0 N * * *` |
| 每天下午 N 点 | `0 {N+12} * * *` |
| 工作日每天 | `0 H * * 1-5` |
| 每周一 | `0 H * * 1` |
| 每周一三五 | `0 H * * 1,3,5` |
| 每月 N 号 | `0 H N * *` |
| 每 N 小时 | `0 */N * * *` |
| 每 N 分钟 | `*/N * * * *` |

> H = 用户指定的小时数，默认为 9（早上9点）。

## 确认模板 — 单任务

```
我理解的计划是：
- 任务：{task_name}（{skill_name}）
- 时间：{human_readable}（cron: {cron_expression}）
- 类型：{recurring/one-time}
- 开始：{start_date}
- 截止：{end_condition}
- 执行完成/失败时会发送系统通知

⚠️ 定时任务使用 --dangerously-skip-permissions 无人值守执行。
确认安装？
```

## 确认模板 — 流水线

```
我理解的计划是一个流水线任务：
- 时间：{human_readable}（cron: {cron_expression}）
- 类型：{recurring/one-time}
- 整体目标：{pipeline_goal}

步骤：
  1. {step1_description}（{skill1}）
  2. {step2_description}（{skill2}）
  ...

执行方式：每步独立调用 Claude，通过 pipeline-context.md 共享上下文。
后续步骤会自然读取前序步骤的完整输出来决定行动。
如果某步失败，整个流水线停止。

⚠️ 定时任务使用 --dangerously-skip-permissions 无人值守执行。
确认安装？
```

## 截止条件解析

| 用户表达 | 解析 |
|---------|------|
| 无截止相关表达 | `none` |
| "执行3次" / "跑3轮" | `count:3` |
| "到月底" / "到2月28号" | `until:2026-02-28` |
| "就这一次" / "明天下午" | one-time（执行后自动移除） |
