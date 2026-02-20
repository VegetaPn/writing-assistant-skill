#!/usr/bin/env bash
# check-env.sh — Environment pre-check for writing-assistant skill
# Checks all required dependencies and outputs structured key=value results.
# Exit code: 0 if all required checks pass, 1 if any required check fails.
#
# Usage: bash scripts/check-env.sh [project-root]
#   project-root defaults to current working directory.

set -uo pipefail

PROJECT_ROOT="${1:-$(pwd)}"

PASS_COUNT=0
FAIL_COUNT=0
RESULTS=""

report() {
  local key="$1"
  local status="$2"
  local detail="${3:-}"
  if [ -n "$detail" ]; then
    RESULTS="${RESULTS}${key}=${status}|${detail}\n"
  else
    RESULTS="${RESULTS}${key}=${status}\n"
  fi
  if [ "$status" = "PASS" ]; then
    ((PASS_COUNT++)) || true
  else
    ((FAIL_COUNT++)) || true
  fi
}

# --- Check 1: OPENROUTER_API_KEY in .env ---
if [ -f "$PROJECT_ROOT/.env" ]; then
  KEY_VALUE=$(grep -m1 "OPENROUTER_API_KEY" "$PROJECT_ROOT/.env" 2>/dev/null | cut -d'=' -f2- | tr -d ' "'"'"'' || true)
  if [ -n "$KEY_VALUE" ]; then
    report "OPENROUTER_API_KEY" "PASS"
  else
    report "OPENROUTER_API_KEY" "FAIL" "Not found or empty in .env"
  fi
else
  report "OPENROUTER_API_KEY" "FAIL" ".env file not found"
fi

# --- Check 2: bird CLI ---
if command -v bird &>/dev/null; then
  # Portable timeout: run bird in background, kill after 10s
  BIRD_OUTPUT=""
  bird whoami --cookie-source chrome > /tmp/bird_check_$$ 2>&1 &
  BIRD_PID=$!
  ( sleep 10 && kill "$BIRD_PID" 2>/dev/null ) &
  SLEEP_PID=$!
  if wait "$BIRD_PID" 2>/dev/null; then
    kill "$SLEEP_PID" 2>/dev/null; wait "$SLEEP_PID" 2>/dev/null
    BIRD_OUTPUT=$(cat /tmp/bird_check_$$ 2>/dev/null || true)
  else
    kill "$SLEEP_PID" 2>/dev/null; wait "$SLEEP_PID" 2>/dev/null
    BIRD_OUTPUT="timed out"
  fi
  rm -f /tmp/bird_check_$$
  if [ "$BIRD_OUTPUT" = "timed out" ] || [ -z "$BIRD_OUTPUT" ]; then
    report "BIRD_CLI" "FAIL" "bird available but whoami timed out (possibly blocked in China, try setting HTTPS_PROXY=http://127.0.0.1:7890 or user-provided proxy)"
  elif echo "$BIRD_OUTPUT" | grep -qi "error\|fail\|not found\|unauthorized"; then
    report "BIRD_CLI" "FAIL" "bird available but auth failed: $(echo "$BIRD_OUTPUT" | head -1)"
  else
    report "BIRD_CLI" "PASS" "cookie-source=chrome"
  fi
else
  report "BIRD_CLI" "FAIL" "bird command not found"
fi

# --- Check 3: config/bird.json5 -> .birdrc.json5 ---
if [ -f "$PROJECT_ROOT/config/bird.json5" ]; then
  if [ -f "$PROJECT_ROOT/.birdrc.json5" ]; then
    report "BIRD_CONFIG" "PASS" "already exists"
  else
    cp "$PROJECT_ROOT/config/bird.json5" "$PROJECT_ROOT/.birdrc.json5"
    report "BIRD_CONFIG" "PASS" "copied from config/bird.json5"
  fi
else
  report "BIRD_CONFIG" "PASS" "no config/bird.json5 to propagate"
fi

# --- Check 4: Required skills ---
SKILLS_DIR="$PROJECT_ROOT/.claude/skills"

check_skill() {
  local skill="$1"
  local required="$2"
  if [ -d "$SKILLS_DIR/$skill" ]; then
    report "SKILL_${skill}" "PASS"
    return 0
  else
    local detail="not installed"
    if [ -d "$PROJECT_ROOT/dependencies/$skill" ]; then
      detail="not installed, bundled version available in dependencies/"
    fi
    if [ "$required" = "required" ]; then
      report "SKILL_${skill}" "FAIL" "$detail"
    else
      report "SKILL_${skill}" "WARN" "$detail"
    fi
    return 1
  fi
}

for skill in content-research-writer baoyu-xhs-images xiaohongshu wechat-article-search generate-image baoyu-post-to-wechat; do
  check_skill "$skill" "required"
done

# At least one X publisher needed
X_FOUND=false
for skill in baoyu-post-to-x x-article-publisher; do
  if [ -d "$SKILLS_DIR/$skill" ]; then
    X_FOUND=true
    report "SKILL_${skill}" "PASS"
  fi
done
if [ "$X_FOUND" = false ]; then
  report "SKILL_x-publisher" "FAIL" "neither baoyu-post-to-x nor x-article-publisher installed"
fi

# --- Check 5: baoyu-post-to-wechat npm dependencies ---
NPM_DEPS="front-matter marked highlight.js reading-time fflate"
MISSING_DEPS=""

for dep in $NPM_DEPS; do
  FOUND=false
  for check_dir in "$PROJECT_ROOT/node_modules/$dep" "$SKILLS_DIR/baoyu-post-to-wechat/node_modules/$dep"; do
    if [ -d "$check_dir" ]; then
      FOUND=true
      break
    fi
  done
  if [ "$FOUND" = false ]; then
    MISSING_DEPS="${MISSING_DEPS} ${dep}"
  fi
done

if [ -z "$MISSING_DEPS" ]; then
  report "WECHAT_NPM_DEPS" "PASS"
else
  report "WECHAT_NPM_DEPS" "FAIL" "missing:${MISSING_DEPS}"
fi

# --- Output ---
echo "=== ENVIRONMENT CHECK RESULTS ==="
echo -e "$RESULTS"
echo "PASS_COUNT=${PASS_COUNT}"
echo "FAIL_COUNT=${FAIL_COUNT}"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "STATUS=INCOMPLETE"
  exit 1
else
  echo "STATUS=OK"
  exit 0
fi
