#!/usr/bin/env bash
# install-schedule.sh — Register a crontab entry for a scheduled task
#
# Usage: install-schedule.sh <task-id> <cron-expression> <project-dir>
#
# Adds a crontab entry that calls cron-runner.sh with the given task ID.
# Each entry is tagged with a comment "# writing-assistant:<task-id>" for identification.

set -uo pipefail

TASK_ID="${1:-}"
CRON_EXPR="${2:-}"
PROJECT_DIR="${3:-}"

if [ -z "$TASK_ID" ] || [ -z "$CRON_EXPR" ] || [ -z "$PROJECT_DIR" ]; then
  echo "Usage: install-schedule.sh <task-id> <cron-expression> <project-dir>" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNNER_PATH="$SCRIPT_DIR/cron-runner.sh"

if [ ! -f "$RUNNER_PATH" ]; then
  echo "ERROR: cron-runner.sh not found at $RUNNER_PATH" >&2
  exit 1
fi

# Ensure runner is executable
chmod +x "$RUNNER_PATH"

# Build the crontab line
CRON_LINE="${CRON_EXPR} ${RUNNER_PATH} ${TASK_ID} ${PROJECT_DIR} >> ${PROJECT_DIR}/schedules/history/${TASK_ID}/cron.log 2>&1 # writing-assistant:${TASK_ID}"

# Check if entry already exists
EXISTING=$(crontab -l 2>/dev/null | grep "# writing-assistant:${TASK_ID}$" || true)
if [ -n "$EXISTING" ]; then
  echo "WARNING: crontab entry for ${TASK_ID} already exists, replacing it"
  # Remove existing entry first
  crontab -l 2>/dev/null | grep -v "# writing-assistant:${TASK_ID}$" | crontab -
fi

# Add new entry
(crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -

echo "OK: installed crontab entry for ${TASK_ID}"
echo "  ${CRON_LINE}"
