#!/usr/bin/env bash
# uninstall-schedule.sh — Remove a crontab entry for a scheduled task
#
# Usage: uninstall-schedule.sh <task-id>
#
# Removes the crontab entry identified by the comment tag "# writing-assistant:<task-id>".

set -uo pipefail

TASK_ID="${1:-}"

if [ -z "$TASK_ID" ]; then
  echo "Usage: uninstall-schedule.sh <task-id>" >&2
  exit 1
fi

# Check if entry exists
EXISTING=$(crontab -l 2>/dev/null | grep "# writing-assistant:${TASK_ID}$" || true)
if [ -z "$EXISTING" ]; then
  echo "INFO: no crontab entry found for ${TASK_ID}"
  exit 0
fi

# Remove the entry
crontab -l 2>/dev/null | grep -v "# writing-assistant:${TASK_ID}$" | crontab -

echo "OK: removed crontab entry for ${TASK_ID}"
