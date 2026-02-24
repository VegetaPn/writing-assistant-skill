#!/usr/bin/env bash
# cron-runner.sh — Core execution script for scheduled tasks
# Called by crontab. Handles single tasks and pipelines.
#
# Usage: cron-runner.sh <task-id> <project-dir>
#
# Exit codes:
#   0 - success
#   1 - task definition not found or invalid
#   2 - lock conflict (previous run still in progress)
#   3 - task expired or completed
#   4 - execution failure

set -uo pipefail

# --- Args ---
TASK_ID="${1:-}"
PROJECT_DIR="${2:-}"

if [ -z "$TASK_ID" ] || [ -z "$PROJECT_DIR" ]; then
  echo "Usage: cron-runner.sh <task-id> <project-dir>" >&2
  exit 1
fi

# --- Environment setup ---
# crontab runs with a minimal environment; add common paths for CLI tools.
# NOTE: Do NOT source .zshrc/.bashrc — they often contain interactive shell
# plugins (oh-my-zsh, etc.) that hang in non-interactive bash scripts.
# Instead, source non-interactive profiles and add common tool paths.
for profile in "$HOME/.zprofile" "$HOME/.bash_profile" "$HOME/.profile"; do
  if [ -f "$profile" ]; then
    source "$profile" 2>/dev/null || true
    break
  fi
done
# Ensure common tool locations are in PATH (Homebrew, npm global, etc.)
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/bin:$PATH"

# --- Paths ---
SCHEDULES_DIR="$PROJECT_DIR/schedules"
TASK_FILE="$SCHEDULES_DIR/tasks/${TASK_ID}.md"
HISTORY_DIR="$SCHEDULES_DIR/history/${TASK_ID}"
LOCK_FILE="$SCHEDULES_DIR/tasks/.${TASK_ID}.lock"
REGISTRY_FILE="$SCHEDULES_DIR/schedule-registry.md"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Logging ---
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [${TASK_ID}] $1"
}

# --- Notification ---
send_notification() {
  local title="$1"
  local message="$2"
  if command -v terminal-notifier &>/dev/null; then
    terminal-notifier -title "$title" -message "$message" -sound default 2>/dev/null || true
  elif command -v osascript &>/dev/null; then
    osascript -e "display notification \"$message\" with title \"$title\"" 2>/dev/null || true
  elif command -v notify-send &>/dev/null; then
    notify-send "$title" "$message" 2>/dev/null || true
  fi
}

# --- Status file ---
STATUS_FILE="$SCHEDULES_DIR/tasks/.${TASK_ID}.status"

write_status() {
  local task_name="$1"
  local pid="$2"
  local start_time="$3"
  local live_log="${4:-}"
  local start_epoch
  start_epoch=$(date +%s)
  cat > "$STATUS_FILE" <<EOF
Task: ${task_name}
Status: running
Started: ${start_time}
PID: ${pid}
Live log: ${live_log}
EOF
}

clear_status() {
  rm -f "$STATUS_FILE"
}

# --- Heartbeat ---
HEARTBEAT_PID=""

start_heartbeat() {
  local task_name="$1"
  local cmd_pid="$2"
  (
    elapsed=0
    while kill -0 "$cmd_pid" 2>/dev/null; do
      sleep 180
      elapsed=$((elapsed + 3))
      if kill -0 "$cmd_pid" 2>/dev/null; then
        send_notification "Task Running" "\"${task_name}\" still running... ${elapsed}m elapsed"
        # Update elapsed in status file
        if [ -f "$STATUS_FILE" ]; then
          sed -i '' "s/^Status: running.*/Status: running (${elapsed}m elapsed)/" "$STATUS_FILE" 2>/dev/null || true
        fi
      fi
    done
  ) &
  HEARTBEAT_PID=$!
}

stop_heartbeat() {
  if [ -n "$HEARTBEAT_PID" ]; then
    kill "$HEARTBEAT_PID" 2>/dev/null; wait "$HEARTBEAT_PID" 2>/dev/null || true
    HEARTBEAT_PID=""
  fi
}

# --- Stream processor ---
# Reads claude --output-format stream-json from stdin.
# Writes human-readable progress to live_log, final text to output_file.
process_claude_stream() {
  local live_log="$1"
  local output_file="$2"
  > "$output_file"
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    # Extract type field
    local msg_type
    msg_type=$(printf '%s' "$line" | jq -r '.type // empty' 2>/dev/null) || true
    if [ -z "$msg_type" ]; then
      # Not JSON — append raw to live log
      echo "$line" >> "$live_log"
      continue
    fi
    case "$msg_type" in
      assistant)
        # tool_use: log tool name + truncated input
        local tool_name
        tool_name=$(printf '%s' "$line" | jq -r '
          .message.content[-1].name // empty
        ' 2>/dev/null) || true
        if [ -n "$tool_name" ]; then
          local tool_input_brief
          tool_input_brief=$(printf '%s' "$line" | jq -r '
            .message.content[-1].input | tostring
          ' 2>/dev/null | head -c 120) || true
          echo "[$(date '+%H:%M:%S')] Tool: ${tool_name}  ${tool_input_brief}..." >> "$live_log"
        fi
        ;;
      result)
        # Final result — extract the text content, write to output file
        printf '%s' "$line" | jq -r '
          if .result then .result
          elif .message.content then
            [.message.content[] | select(.type=="text") | .text] | join("\n")
          else empty end
        ' 2>/dev/null > "$output_file" || true
        echo "[$(date '+%H:%M:%S')] Result received" >> "$live_log"
        ;;
    esac
  done
}

# --- Lock management ---
acquire_lock() {
  if [ -f "$LOCK_FILE" ]; then
    local lock_pid
    lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$lock_pid" ] && kill -0 "$lock_pid" 2>/dev/null; then
      log "SKIP: previous run (PID $lock_pid) still in progress"
      echo "skipped: previous run still in progress" >> "$HISTORY_DIR/${TIMESTAMP}-skipped.log" 2>/dev/null || true
      return 1
    else
      log "WARN: stale lock file found (PID $lock_pid no longer running), removing"
      rm -f "$LOCK_FILE"
    fi
  fi
  echo $$ > "$LOCK_FILE"
  return 0
}

release_lock() {
  rm -f "$LOCK_FILE"
}

# --- Parse task definition ---
# Extracts a field value from the task markdown file.
# Looks for **Field:** value pattern.
parse_field() {
  local file="$1"
  local field="$2"
  grep -m1 "^\*\*${field}:\*\*" "$file" 2>/dev/null | sed "s/^\*\*${field}:\*\* *//" | sed 's/ *$//'
}

# Extract the prompt block from a section.
# Reads the blockquote (lines starting with >) after **Prompt:** in the given section.
parse_prompt() {
  local file="$1"
  local section_marker="${2:-## Task}"
  awk -v marker="$section_marker" '
    BEGIN { in_section=0; in_prompt=0 }
    $0 ~ marker { in_section=1; next }
    in_section && /\*\*Prompt:\*\*/ { in_prompt=1; next }
    in_section && in_prompt && /^>/ { gsub(/^> ?/, ""); print; next }
    in_section && in_prompt && !/^>/ && !/^$/ { exit }
    in_section && /^## / { exit }
  ' "$file"
}

# Parse pipeline steps — returns step count
parse_step_count() {
  local file="$1"
  grep -c "^### Step [0-9]" "$file" 2>/dev/null || echo "0"
}

# Parse a specific step's prompt
parse_step_prompt() {
  local file="$1"
  local step_num="$2"
  awk -v step="### Step ${step_num}:" '
    BEGIN { in_step=0; in_prompt=0 }
    index($0, step) { in_step=1; next }
    in_step && /^\*\*Prompt:\*\*/ { in_prompt=1; next }
    in_step && in_prompt && /^>/ { gsub(/^> ?/, ""); print; next }
    in_step && in_prompt && !/^>/ && !/^$/ { exit }
    in_step && /^### Step [0-9]/ { exit }
    in_step && /^## / { exit }
  ' "$file"
}

# Parse step description (the text after "### Step N: ")
parse_step_description() {
  local file="$1"
  local step_num="$2"
  grep -m1 "^### Step ${step_num}:" "$file" 2>/dev/null | sed "s/^### Step ${step_num}: *//"
}

# --- Validate task ---
validate_task() {
  if [ ! -f "$TASK_FILE" ]; then
    log "ERROR: task definition not found: $TASK_FILE"
    exit 1
  fi

  local status
  status=$(parse_field "$TASK_FILE" "Status")
  if [ "$status" != "active" ]; then
    log "SKIP: task status is '$status', not 'active'"
    exit 3
  fi

  # Check end condition
  local task_type
  task_type=$(parse_field "$TASK_FILE" "Type")
  local end_condition
  end_condition=$(parse_field "$TASK_FILE" "End Condition")

  # Check until date
  if [[ "$end_condition" == until:* ]]; then
    local end_date="${end_condition#until:}"
    local today
    today=$(date +"%Y-%m-%d")
    if [[ "$today" > "$end_date" ]]; then
      log "EXPIRED: end date $end_date has passed"
      # Update task status
      sed -i '' "s/^\*\*Status:\*\* active/\*\*Status:\*\* completed/" "$TASK_FILE" 2>/dev/null || true
      bash "$SCRIPT_DIR/uninstall-schedule.sh" "$TASK_ID" 2>/dev/null || true
      exit 3
    fi
  fi

  # Check execution count
  if [[ "$end_condition" == count:* ]]; then
    local max_count="${end_condition#count:}"
    local current_count
    current_count=$(grep -c "^| [0-9]" "$TASK_FILE" 2>/dev/null; true)
    current_count=${current_count:-0}
    if [ "$current_count" -ge "$max_count" ]; then
      log "COMPLETED: reached execution count limit ($max_count)"
      sed -i '' "s/^\*\*Status:\*\* active/\*\*Status:\*\* completed/" "$TASK_FILE" 2>/dev/null || true
      bash "$SCRIPT_DIR/uninstall-schedule.sh" "$TASK_ID" 2>/dev/null || true
      exit 3
    fi
  fi
}

# --- Execute single task ---
execute_single() {
  local prompt
  prompt=$(parse_prompt "$TASK_FILE" "## Task")
  local timeout
  timeout=$(parse_field "$TASK_FILE" "Timeout" | sed 's/s$//')
  timeout="${timeout:-600}"

  local proxy
  proxy=$(parse_field "$TASK_FILE" "Proxy")

  local exec_file="$HISTORY_DIR/${TIMESTAMP}.md"
  local start_time
  start_time=$(date +"%Y-%m-%d %H:%M:%S")
  local start_epoch
  start_epoch=$(date +%s)

  log "START: single task execution"

  # Send start notification
  local task_name
  task_name=$(parse_field "$TASK_FILE" "Name")
  send_notification "Scheduled Task Started" "Task \"${task_name}\" is now running..."

  # Initialize live log
  local LIVE_LOG="$HISTORY_DIR/live.log"
  echo "[$(date '+%H:%M:%S')] Task \"${task_name}\" started..." > "$LIVE_LOG"
  echo "[$(date '+%H:%M:%S')] Timeout: ${timeout}s" >> "$LIVE_LOG"
  echo "---" >> "$LIVE_LOG"

  # Build claude command (run from project dir)
  cd "$PROJECT_DIR"
  local cmd="claude -p \"$prompt\" --verbose --output-format stream-json --dangerously-skip-permissions"
  if [ -n "$proxy" ] && [ "$proxy" != "(optional)" ]; then
    cmd="HTTPS_PROXY=http://$proxy $cmd"
  fi

  # Execute with timeout + stream processing + heartbeat + status
  local output=""
  local exit_code=0
  local stderr_file
  stderr_file=$(mktemp)
  local stream_output_file
  stream_output_file=$(mktemp)

  if command -v timeout &>/dev/null; then
    eval timeout "${timeout}" "$cmd" 2>"$stderr_file" | process_claude_stream "$LIVE_LOG" "$stream_output_file" &
    local cmd_pid=$!
    write_status "$task_name" "$cmd_pid" "$start_time" "$LIVE_LOG"
    start_heartbeat "$task_name" "$cmd_pid"
    wait "$cmd_pid" 2>/dev/null || exit_code=$?
    output=$(cat "$stream_output_file" 2>/dev/null || true)
  elif command -v gtimeout &>/dev/null; then
    eval gtimeout "${timeout}" "$cmd" 2>"$stderr_file" | process_claude_stream "$LIVE_LOG" "$stream_output_file" &
    local cmd_pid=$!
    write_status "$task_name" "$cmd_pid" "$start_time" "$LIVE_LOG"
    start_heartbeat "$task_name" "$cmd_pid"
    wait "$cmd_pid" 2>/dev/null || exit_code=$?
    output=$(cat "$stream_output_file" 2>/dev/null || true)
  else
    # macOS fallback: run with background kill timer
    eval "$cmd" 2>"$stderr_file" | process_claude_stream "$LIVE_LOG" "$stream_output_file" &
    local cmd_pid=$!
    write_status "$task_name" "$cmd_pid" "$start_time" "$LIVE_LOG"
    start_heartbeat "$task_name" "$cmd_pid"
    ( sleep "${timeout}" && kill -9 "$cmd_pid" 2>/dev/null ) &
    local timer_pid=$!
    wait "$cmd_pid" 2>/dev/null || exit_code=$?
    kill "$timer_pid" 2>/dev/null; wait "$timer_pid" 2>/dev/null || true
    output=$(cat "$stream_output_file" 2>/dev/null || true)
  fi
  rm -f "$stream_output_file"

  # Stop heartbeat and clear status
  stop_heartbeat
  clear_status

  local stderr_output
  stderr_output=$(cat "$stderr_file" 2>/dev/null || true)
  rm -f "$stderr_file"

  local end_time
  end_time=$(date +"%Y-%m-%d %H:%M:%S")
  local end_epoch
  end_epoch=$(date +%s)
  local duration=$(( end_epoch - start_epoch ))
  local duration_str="${duration}s"
  if [ "$duration" -ge 60 ]; then
    duration_str="$(( duration / 60 ))m$(( duration % 60 ))s"
  fi

  local status_str="success"
  if [ "$exit_code" -ne 0 ]; then
    status_str="failed (exit code: $exit_code)"
  fi

  # Append completion to live log
  echo "---" >> "$LIVE_LOG"
  echo "[$(date '+%H:%M:%S')] Task finished: ${status_str} (${duration_str})" >> "$LIVE_LOG"

  # Write execution record
  mkdir -p "$(dirname "$exec_file")"
  cat > "$exec_file" <<EOF
# Execution: ${TASK_ID} @ ${start_time}

- **Start:** ${start_time}
- **End:** ${end_time}
- **Duration:** ${duration_str}
- **Exit Code:** ${exit_code}
- **Live Log:** history/${TASK_ID}/live.log

## Output
${output}

## Errors
${stderr_output:-None}
EOF

  # Update history table in task file
  local run_number
  run_number=$(grep -c "^| [0-9]" "$TASK_FILE" 2>/dev/null; true)
  run_number=$(( ${run_number:-0} + 1 ))
  local history_line="| ${run_number} | ${start_time} | ${duration_str} | ${status_str} | history/${TASK_ID}/${TIMESTAMP}.md |"

  # Append to history table
  if grep -q "^| # |" "$TASK_FILE" 2>/dev/null; then
    # Find the last line of the history table and append after it
    echo "$history_line" >> "$TASK_FILE"
  fi

  log "END: ${status_str} (${duration_str})"

  # Send notification with result file path
  if [ "$exit_code" -eq 0 ]; then
    send_notification "Scheduled Task Complete" "Task \"${task_name}\" done (${duration_str}). Output: ${exec_file}"
  else
    send_notification "Scheduled Task Failed" "Task \"${task_name}\" failed (exit code: ${exit_code}). See ${exec_file}"
  fi

  return "$exit_code"
}

# --- Pipeline context management ---

# Initialize pipeline context file
write_pipeline_context() {
  local context_file="$1"
  local goal="$2"
  local total_steps="$3"

  cat > "$context_file" <<EOF
# Pipeline Context

## Pipeline Goal
${goal}

## All Steps
EOF

  local i
  for i in $(seq 1 "$total_steps"); do
    local desc
    desc=$(parse_step_description "$TASK_FILE" "$i")
    echo "${i}. ${desc}" >> "$context_file"
  done

  cat >> "$context_file" <<EOF

## Current Execution: (not started)

## Completed Steps
(none yet)
EOF
}

# Update pipeline context with completed step info
update_pipeline_context() {
  local context_file="$1"
  local current_step="$2"
  shift 2
  local completed_outputs=("$@")

  local goal
  goal=$(awk '/^## Pipeline Goal/{getline; print; exit}' "$context_file")

  local total_steps
  total_steps=$(parse_step_count "$TASK_FILE")

  # Rewrite the context file
  local tmp_file
  tmp_file=$(mktemp)

  cat > "$tmp_file" <<EOF
# Pipeline Context

## Pipeline Goal
${goal}

## All Steps
EOF

  local i
  for i in $(seq 1 "$total_steps"); do
    local desc
    desc=$(parse_step_description "$TASK_FILE" "$i")
    echo "${i}. ${desc}" >> "$tmp_file"
  done

  echo "" >> "$tmp_file"
  echo "## Current Execution: Step ${current_step}" >> "$tmp_file"
  echo "" >> "$tmp_file"
  echo "## Completed Steps" >> "$tmp_file"

  if [ ${#completed_outputs[@]} -eq 0 ]; then
    echo "(none yet)" >> "$tmp_file"
  else
    for i in $(seq 0 $(( ${#completed_outputs[@]} - 1 )) ); do
      local step_num=$(( i + 1 ))
      local step_desc
      step_desc=$(parse_step_description "$TASK_FILE" "$step_num")
      local step_file="${completed_outputs[$i]}"
      local step_status="success"

      # Check if the step output file exists and is non-empty
      if [ ! -s "$step_file" ]; then
        step_status="failed or empty"
      fi

      cat >> "$tmp_file" <<EOF
### Step ${step_num}: ${step_desc}
- **Status:** ${step_status}
- **Output File:** ${step_file}
EOF
    done
  fi

  mv "$tmp_file" "$context_file"
}

# --- Execute pipeline ---
execute_pipeline() {
  local total_steps
  total_steps=$(parse_step_count "$TASK_FILE")

  if [ "$total_steps" -eq 0 ]; then
    log "ERROR: no pipeline steps found in task definition"
    return 1
  fi

  local pipeline_goal
  pipeline_goal=$(awk '/^## Pipeline Goal/{getline; print; exit}' "$TASK_FILE")
  local timeout
  timeout=$(parse_field "$TASK_FILE" "Timeout" | sed 's/s$//' | sed 's/ .*//')
  timeout="${timeout:-1800}"

  local proxy
  proxy=$(parse_field "$TASK_FILE" "Proxy")

  local on_failure
  on_failure=$(parse_field "$TASK_FILE" "On Step Failure")
  on_failure="${on_failure:-stop}"

  local exec_dir="$HISTORY_DIR/${TIMESTAMP}"
  mkdir -p "$exec_dir"

  local context_file="$exec_dir/pipeline-context.md"
  local summary_file="$exec_dir/pipeline-summary.md"
  local start_time
  start_time=$(date +"%Y-%m-%d %H:%M:%S")
  local start_epoch
  start_epoch=$(date +%s)

  log "START: pipeline execution (${total_steps} steps)"

  # Send start notification
  local task_name
  task_name=$(parse_field "$TASK_FILE" "Name")
  send_notification "Pipeline Started" "Pipeline \"${task_name}\" is now running (${total_steps} steps)..."

  # Initialize live log
  local LIVE_LOG="$exec_dir/live.log"
  echo "[$(date '+%H:%M:%S')] Pipeline \"${task_name}\" started (${total_steps} steps)" > "$LIVE_LOG"
  echo "[$(date '+%H:%M:%S')] Total timeout: ${timeout}s" >> "$LIVE_LOG"
  echo "---" >> "$LIVE_LOG"

  # Write status file
  write_status "$task_name" "$$" "$start_time" "$LIVE_LOG"

  # Start heartbeat for the whole pipeline (using current shell PID)
  start_heartbeat "$task_name" "$$"

  # Ensure we're in the project directory
  cd "$PROJECT_DIR"

  # Initialize pipeline context
  write_pipeline_context "$context_file" "$pipeline_goal" "$total_steps"

  local completed_outputs=()
  local completed_count=0
  local pipeline_status="success"
  local failed_step=""

  for i in $(seq 1 "$total_steps"); do
    local step_desc
    step_desc=$(parse_step_description "$TASK_FILE" "$i")
    local step_prompt
    step_prompt=$(parse_step_prompt "$TASK_FILE" "$i")
    local step_file="$exec_dir/step-${i}.md"
    local step_start
    step_start=$(date +%s)

    log "STEP ${i}/${total_steps}: ${step_desc}"

    # Step-level notification and live log
    send_notification "Pipeline Step ${i}/${total_steps}" "Started: ${step_desc}"
    echo "" >> "$LIVE_LOG"
    echo "[$(date '+%H:%M:%S')] === Step ${i}/${total_steps}: ${step_desc} ===" >> "$LIVE_LOG"

    # Update status file with current step
    if [ -f "$STATUS_FILE" ]; then
      sed -i '' "s/^Status: .*/Status: running (step ${i}\/${total_steps}: ${step_desc})/" "$STATUS_FILE" 2>/dev/null || true
    fi

    # Update pipeline context
    update_pipeline_context "$context_file" "$i" "${completed_outputs[@]+"${completed_outputs[@]}"}"

    # Build the full prompt with pipeline context
    local full_prompt="You are executing a scheduled pipeline task.
Please first read the pipeline context file: ${context_file}
This file contains the overall pipeline goal, all step summaries, and output file paths for completed steps.
Based on the full context, execute the current step (Step ${i}).

Current step task:
${step_prompt}"

    # Build claude command
    local cmd="claude -p \"$full_prompt\" --verbose --output-format stream-json --dangerously-skip-permissions"
    if [ -n "$proxy" ] && [ "$proxy" != "(optional)" ]; then
      cmd="HTTPS_PROXY=http://$proxy $cmd"
    fi

    # Calculate per-step timeout (total / steps, minimum 120s)
    local step_timeout=$(( timeout / total_steps ))
    if [ "$step_timeout" -lt 120 ]; then
      step_timeout=120
    fi

    # Execute with stream processing
    local output=""
    local exit_code=0
    local stderr_file
    stderr_file=$(mktemp)
    local stream_output_file
    stream_output_file=$(mktemp)

    if command -v timeout &>/dev/null; then
      eval timeout "${step_timeout}" "$cmd" 2>"$stderr_file" | process_claude_stream "$LIVE_LOG" "$stream_output_file" &
      local cmd_pid=$!
      wait "$cmd_pid" 2>/dev/null || exit_code=$?
      output=$(cat "$stream_output_file" 2>/dev/null || true)
    elif command -v gtimeout &>/dev/null; then
      eval gtimeout "${step_timeout}" "$cmd" 2>"$stderr_file" | process_claude_stream "$LIVE_LOG" "$stream_output_file" &
      local cmd_pid=$!
      wait "$cmd_pid" 2>/dev/null || exit_code=$?
      output=$(cat "$stream_output_file" 2>/dev/null || true)
    else
      # macOS fallback: run with background kill timer
      eval "$cmd" 2>"$stderr_file" | process_claude_stream "$LIVE_LOG" "$stream_output_file" &
      local cmd_pid=$!
      ( sleep "${step_timeout}" && kill -9 "$cmd_pid" 2>/dev/null ) &
      local timer_pid=$!
      wait "$cmd_pid" 2>/dev/null || exit_code=$?
      kill "$timer_pid" 2>/dev/null; wait "$timer_pid" 2>/dev/null || true
      output=$(cat "$stream_output_file" 2>/dev/null || true)
    fi
    rm -f "$stream_output_file"

    local stderr_output
    stderr_output=$(cat "$stderr_file" 2>/dev/null || true)
    rm -f "$stderr_file"

    local step_end
    step_end=$(date +%s)
    local step_duration=$(( step_end - step_start ))
    local step_duration_str="${step_duration}s"
    if [ "$step_duration" -ge 60 ]; then
      step_duration_str="$(( step_duration / 60 ))m$(( step_duration % 60 ))s"
    fi

    # Step completion in live log
    echo "[$(date '+%H:%M:%S')] Step ${i}/${total_steps} finished (${step_duration_str}, exit: ${exit_code})" >> "$LIVE_LOG"

    # Write step output
    cat > "$step_file" <<EOF
# Step ${i}: ${step_desc}

- **Start:** $(date -r "$step_start" +"%Y-%m-%d %H:%M:%S" 2>/dev/null || date +"%Y-%m-%d %H:%M:%S")
- **Duration:** ${step_duration_str}
- **Exit Code:** ${exit_code}

## Output
${output}

## Errors
${stderr_output:-None}
EOF

    if [ "$exit_code" -ne 0 ]; then
      log "STEP ${i} FAILED (exit code: ${exit_code})"
      send_notification "Pipeline Step ${i}/${total_steps} Failed" "Step \"${step_desc}\" failed (${step_duration_str})"
      if [ "$on_failure" = "stop" ]; then
        pipeline_status="failed at step ${i}"
        failed_step="$i"
        break
      else
        # continue mode: mark as failed but keep going
        pipeline_status="partial (step ${i} failed)"
      fi
    else
      send_notification "Pipeline Step ${i}/${total_steps} Done" "Step \"${step_desc}\" completed (${step_duration_str})"
    fi

    completed_outputs+=("$step_file")
    completed_count=$((completed_count + 1))
    log "STEP ${i} DONE (${step_duration_str})"
  done

  # Stop heartbeat and clear status
  stop_heartbeat
  clear_status

  local end_time
  end_time=$(date +"%Y-%m-%d %H:%M:%S")
  local end_epoch
  end_epoch=$(date +%s)
  local total_duration=$(( end_epoch - start_epoch ))
  local total_duration_str="${total_duration}s"
  if [ "$total_duration" -ge 60 ]; then
    total_duration_str="$(( total_duration / 60 ))m$(( total_duration % 60 ))s"
  fi

  # Pipeline completion in live log
  echo "---" >> "$LIVE_LOG"
  echo "[$(date '+%H:%M:%S')] Pipeline finished: ${pipeline_status} (${total_duration_str}, ${completed_count}/${total_steps} steps)" >> "$LIVE_LOG"

  # Final context update
  update_pipeline_context "$context_file" "done" "${completed_outputs[@]+"${completed_outputs[@]}"}"

  # Write pipeline summary
  cat > "$summary_file" <<EOF
# Pipeline Summary: ${TASK_ID} @ ${start_time}

- **Pipeline Goal:** ${pipeline_goal}
- **Start:** ${start_time}
- **End:** ${end_time}
- **Duration:** ${total_duration_str}
- **Steps Completed:** ${completed_count}/${total_steps}
- **Status:** ${pipeline_status}
- **Live Log:** history/${TASK_ID}/${TIMESTAMP}/live.log

## Step Results
EOF

  for i in $(seq 1 "$total_steps"); do
    local desc
    desc=$(parse_step_description "$TASK_FILE" "$i")
    if [ "$i" -le "$completed_count" ] || ([ -n "$failed_step" ] && [ "$i" -eq "$failed_step" ]); then
      if [ -n "$failed_step" ] && [ "$i" -eq "$failed_step" ]; then
        echo "| ${i} | ${desc} | failed |" >> "$summary_file"
      else
        echo "| ${i} | ${desc} | success |" >> "$summary_file"
      fi
    else
      echo "| ${i} | ${desc} | skipped |" >> "$summary_file"
    fi
  done

  # Update history table in task file
  local run_number
  run_number=$(grep -c "^| [0-9]" "$TASK_FILE" 2>/dev/null; true)
  run_number=$(( ${run_number:-0} + 1 ))
  local history_line="| ${run_number} | ${start_time} | ${total_duration_str} | ${pipeline_status} | ${completed_count}/${total_steps} | history/${TASK_ID}/${TIMESTAMP}/ |"

  if grep -q "^| # |" "$TASK_FILE" 2>/dev/null; then
    echo "$history_line" >> "$TASK_FILE"
  fi

  log "END: pipeline ${pipeline_status} (${total_duration_str}, ${completed_count}/${total_steps} steps)"

  # Send notification with output path
  if [ "$pipeline_status" = "success" ]; then
    send_notification "Pipeline Complete" "Pipeline \"${task_name}\" done (${completed_count}/${total_steps} steps, ${total_duration_str}). Output: ${exec_dir}/"
  else
    send_notification "Pipeline Failed" "Pipeline \"${task_name}\" ${pipeline_status}. See ${exec_dir}/"
  fi

  if [ "$pipeline_status" != "success" ]; then
    return 4
  fi
  return 0
}

# --- One-time task cleanup ---
cleanup_onetime() {
  local task_type
  task_type=$(parse_field "$TASK_FILE" "Type")
  if [ "$task_type" = "one-time" ]; then
    log "One-time task completed, cleaning up crontab entry"
    sed -i '' "s/^\*\*Status:\*\* active/\*\*Status:\*\* completed/" "$TASK_FILE" 2>/dev/null || true
    bash "$SCRIPT_DIR/uninstall-schedule.sh" "$TASK_ID" 2>/dev/null || true
  fi
}

# ===================
# MAIN
# ===================

# Validate
validate_task

# Create history directory
mkdir -p "$HISTORY_DIR"

# Acquire lock
if ! acquire_lock; then
  exit 2
fi

# Ensure lock is released and cleanup on exit
cleanup_on_exit() {
  stop_heartbeat
  clear_status
  release_lock
}
trap cleanup_on_exit EXIT

# Determine task form and execute
TASK_FORM=$(parse_field "$TASK_FILE" "Form")
exit_code=0

case "$TASK_FORM" in
  single)
    execute_single
    exit_code=$?
    ;;
  pipeline)
    execute_pipeline
    exit_code=$?
    ;;
  *)
    log "ERROR: unknown task form '$TASK_FORM'"
    exit 1
    ;;
esac

# One-time cleanup
if [ "$exit_code" -eq 0 ]; then
  cleanup_onetime
fi

exit "$exit_code"
