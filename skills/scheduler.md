---
name: scheduler
description: 自然语言定时任务调度。Use when users say "定时", "每天", "每周", "每月", "计划任务", "取消定时", "查看定时", "看计划", "暂停定时", "恢复定时", "执行历史", "看历史", "流水线", "先...然后...", "cron", "scheduled", "schedule" 等。
---

# Scheduler

自然语言驱动的定时/周期任务调度系统。将用户的自然语言调度请求解析为 crontab 定时任务，支持单任务和流水线（多步串行）两种形态。

> **解析协议:** 完整的 NL 解析规则、命令映射表、确认模板见 `references/scheduler-protocol.md`。

## When to Use

**创建定时任务:**
- "定时..." / "每天..." / "每周..." / "每月..."
- "先X然后Y" / "先...再..." / "...之后..."（流水线）
- "明天下午3点..." / "下周一..."（一次性任务）

**管理定时任务:**
- "查看定时" / "看计划" / "有哪些定时任务"
- "执行历史" / "看历史" / "上次执行结果"
- "暂停定时 {id/name}" / "恢复定时 {id/name}"
- "修改定时" / "把X改成Y"
- "取消定时" / "删除定时 {id/name}"

## Directory Structure

```
schedules/
├── schedule-registry.md        # 任务注册表
├── tasks/                      # 任务定义文件
│   ├── cron-001.md
│   └── cron-002.md
└── history/                    # 执行历史
    ├── cron-001/               # 单任务历史
    │   └── YYYY-MM-DD-HHMMSS.md
    └── cron-002/               # 流水线历史
        └── YYYY-MM-DD-HHMMSS/
            ├── pipeline-context.md
            ├── pipeline-summary.md
            ├── step-1.md
            └── step-2.md
```

## Prerequisites

- **claude CLI** — Required for task execution. Each scheduled task runs `claude -p "..." --print --dangerously-skip-permissions --project-dir <dir>`.
- **crontab** — System cron service must be available. On macOS, grant Full Disk Access to cron if prompted.

## Initialize Workspace

Before executing any command, ensure the schedules directory structure exists:

```
{project-root}/schedules/
├── schedule-registry.md
├── tasks/
└── history/
```

Create any missing directories and files silently. Never overwrite existing files.

---

## Commands

### 1. Create Scheduled Task (创建定时任务)

**Trigger:** "定时..."/"每天..."/"每周..."/"每月..."/"先X然后Y"

**Action:**

**Step 1: Parse natural language**

Read `references/scheduler-protocol.md` for the full NL parsing protocol. Use the command mapping table to map task keywords to existing skills/commands.

Parse the user's request into structured parameters:
- Task Form: single or pipeline
- Task description and mapping
- Steps (if pipeline): each step's skill, command, and prompt
- Pipeline Goal (if pipeline)
- Schedule type: one-time, recurring, or recurring-with-end
- Cron expression
- Start date (default: now)
- End condition: none, count:N, or until:YYYY-MM-DD

**Step 2: Confirm with user**

Present the parsed parameters using the confirmation template from `references/scheduler-protocol.md`. Must include:
- Task name and mapped skill/command
- Human-readable schedule + cron expression
- Type and end condition
- For pipelines: all steps with descriptions
- Warning about `--dangerously-skip-permissions`

Wait for user confirmation before proceeding.

**Step 3: Generate task ID**

Read `schedules/schedule-registry.md` to find the next available ID. Format: `cron-NNN` (zero-padded 3 digits).

**Step 4: Create task definition file**

Create `schedules/tasks/{task-id}.md` following the task definition format.

**Single task template:**

```markdown
# Scheduled Task: {task-id}

**Name:** {task name}
**Created:** {YYYY-MM-DD HH:MM}
**Status:** active
**Form:** single

## Schedule

- **Type:** {one-time|recurring|recurring-with-end}
- **Cron Expression:** `{cron expression}`
- **Human Readable:** {human readable schedule}
- **Start Date:** {YYYY-MM-DD}
- **End Condition:** {none|count:N|until:YYYY-MM-DD}

## Execution

- **Working Directory:** {project root absolute path}
- **Timeout:** {timeout}s
- **Proxy:** (optional)

## Task

- **Skill:** {skill name}
- **Command:** {command name}
- **Prompt:**

> {full prompt text for claude -p}

## History

| # | Time | Duration | Status | Output |
|---|------|----------|--------|--------|
```

**Pipeline task template:**

```markdown
# Scheduled Task: {task-id}

**Name:** {task name}
**Created:** {YYYY-MM-DD HH:MM}
**Status:** active
**Form:** pipeline

## Schedule

- **Type:** {one-time|recurring|recurring-with-end}
- **Cron Expression:** `{cron expression}`
- **Human Readable:** {human readable schedule}
- **Start Date:** {YYYY-MM-DD}
- **End Condition:** {none|count:N|until:YYYY-MM-DD}

## Execution

- **Working Directory:** {project root absolute path}
- **Timeout:** {total timeout}s
- **On Step Failure:** stop

## Pipeline Goal

{overall pipeline goal description}

## Steps

### Step 1: {step 1 description}
- **Skill:** {skill name}
- **Command:** {command name}
- **Prompt:**

> {prompt for this step}

### Step 2: {step 2 description}
- **Skill:** {skill name}
- **Command:** {command name}
- **Prompt:**

> {prompt for this step}

## History

| # | Time | Duration | Status | Steps | Output Dir |
|---|------|----------|--------|-------|------------|
```

**Step 5: Register in schedule-registry.md**

Append a row to the registry table in `schedules/schedule-registry.md`.

**Step 6: Install crontab entry**

Run:
```bash
bash scripts/install-schedule.sh {task-id} "{cron-expression}" "{project-dir}"
```

Ensure the history directory exists:
```bash
mkdir -p schedules/history/{task-id}
```

**Step 7: Confirm to user**

Report:
- Task ID and name
- Next scheduled run time
- How to check status: "查看定时" or "执行历史"
- How to pause/cancel: "暂停定时 {id}" or "取消定时 {id}"

---

### 2. View Scheduled Tasks (查看定时任务)

**Trigger:** "查看定时"/"看计划"/"有哪些定时任务"

**Action:**

1. Read `schedules/schedule-registry.md`
2. Display the registry table, filtering out `deleted` entries
3. For `active` tasks, calculate and display next run time from cron expression
4. Summary: "共 N 个定时任务（M 个活跃）"

---

### 3. View Execution History (查看执行历史)

**Trigger:** "执行历史"/"看历史"/"上次执行结果"

**Action:**

1. If user specifies a task ID or name, show history for that task
2. Otherwise, list all tasks with their last execution status
3. Read the task definition file's History table
4. For detailed view: read the specific execution record from `schedules/history/`
5. For pipelines: show the pipeline summary and offer to display individual step outputs

**Display format:**

```
## 执行历史: {task name} ({task-id})

| # | 时间 | 耗时 | 状态 | 详情 |
|---|------|------|------|------|
| 3 | 2026-02-27 09:00 | 3m42s | success | history/cron-001/2026-02-27-090000.md |
| 2 | 2026-02-26 09:00 | 4m15s | success | history/cron-001/2026-02-26-090000.md |
| 1 | 2026-02-25 09:00 | 3m50s | failed | history/cron-001/2026-02-25-090000.md |

要查看某次执行的详细输出吗？
```

---

### 4. Pause Scheduled Task (暂停定时任务)

**Trigger:** "暂停定时 {id/name}"

**Action:**

1. Identify the task (by ID or fuzzy name match from registry)
2. Confirm: "确认暂停「{task name}」？暂停后不会执行，但可以随时恢复。"
3. Run: `bash scripts/uninstall-schedule.sh {task-id}`
4. Update task definition: `**Status:** active` → `**Status:** paused`
5. Update registry: Status → `paused`
6. Confirm: "已暂停。恢复方式：'恢复定时 {task-id}'"

---

### 5. Resume Scheduled Task (恢复定时任务)

**Trigger:** "恢复定时 {id/name}"

**Action:**

1. Identify the task
2. Verify current status is `paused`
3. Read the cron expression from task definition
4. Run: `bash scripts/install-schedule.sh {task-id} "{cron-expression}" "{project-dir}"`
5. Update task definition: `**Status:** paused` → `**Status:** active`
6. Update registry: Status → `active`
7. Confirm: "已恢复。下次执行时间：{next run}"

---

### 6. Modify Scheduled Task (修改定时任务)

**Trigger:** "修改定时"/"把X改成Y"

**Action:**

1. Identify the task and the modification request
2. Parse what needs to change (schedule, prompt, steps, etc.)
3. Present the changes for confirmation:
   ```
   修改「{task name}」:
   - 时间: {old} → {new}
   - ...
   确认修改？
   ```
4. Remove old crontab entry: `bash scripts/uninstall-schedule.sh {task-id}`
5. Update the task definition file
6. Re-install with new schedule: `bash scripts/install-schedule.sh {task-id} "{new-cron}" "{project-dir}"`
7. Update registry
8. Confirm: "已修改。"

---

### 7. Delete Scheduled Task (删除定时任务)

**Trigger:** "取消定时"/"删除定时 {id/name}"

**Action:**

1. Identify the task
2. Confirm: "确认删除「{task name}」？执行历史将保留。"
3. Run: `bash scripts/uninstall-schedule.sh {task-id}`
4. Update task definition: `**Status:** active/paused` → `**Status:** deleted`
5. Update registry: Status → `deleted`
6. Confirm: "已删除。执行历史仍保留在 schedules/history/{task-id}/。"

---

## Task Execution Details

### Execution Engine

Tasks are executed by `scripts/cron-runner.sh`, called by crontab. The runner:
1. Validates the task (status check, expiry check)
2. Acquires a lock file to prevent concurrent execution
3. For single tasks: runs `claude -p "{prompt}" --print --dangerously-skip-permissions --project-dir {dir}`
4. For pipelines: creates `pipeline-context.md`, then runs each step sequentially with context awareness
5. Records execution output to `schedules/history/`
6. Updates the task definition's History table
7. Sends a system notification on completion/failure
8. For one-time tasks: auto-removes the crontab entry after execution

### Pipeline Context Awareness

Each pipeline step receives a `pipeline-context.md` file containing:
- The overall pipeline goal
- Summary of all steps
- Current step number
- Completed steps with their output file paths and status

Each step's Claude instance reads this context file first, then executes its task. This allows natural context flow between steps without hardcoded data passing.

### Concurrency Control

Lock file at `schedules/tasks/.{task-id}.lock` prevents overlapping executions. If a previous run is still active, the new run is skipped with a log entry.

### Notifications

On macOS: `osascript` display notification. On Linux: `notify-send`. Both success and failure are reported.

---

## With Other Skills

- **→ topic-manager**: Scheduled tasks commonly invoke topic-manager commands (监控爆款, 分析爆款, 深化选题)
- **→ experience-tracker**: Scheduled "总结经验" invokes experience-tracker
- **→ writing-assistant**: Scheduled autonomous writing invokes the full writing workflow
- **← writing-assistant**: Users may create schedules after establishing a writing workflow pattern
