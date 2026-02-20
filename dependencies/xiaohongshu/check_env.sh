#!/bin/bash
# 小红书 MCP 环境检查脚本
# 用法: bash ~/.openclaw/skills/xiaohongshu/check_env.sh

MCP_URL="${XHS_MCP_URL:-http://localhost:18060/mcp}"
MCP_BIN=~/xiaohongshu-mcp/xiaohongshu-mcp-linux-amd64

echo "=== 1. 检查 MCP 是否安装 ==="
if [ -x "$MCP_BIN" ]; then
  echo "✅ MCP 已安装"
else
  echo "❌ MCP 未安装，请先执行安装流程"
  exit 1
fi

echo "=== 2. 检查 Xvfb 虚拟显示 ==="
if systemctl is-active --quiet xvfb 2>/dev/null; then
  echo "✅ Xvfb 服务运行中 (systemd)"
elif pgrep -x Xvfb > /dev/null; then
  echo "✅ Xvfb 运行中 (手动)"
else
  echo "⚠️ Xvfb 未运行，尝试启动 systemd 服务..."
  systemctl start xvfb 2>/dev/null
  sleep 1
  if systemctl is-active --quiet xvfb 2>/dev/null; then
    echo "✅ Xvfb 服务已启动"
  else
    echo "⚠️ systemd 服务不存在，手动启动..."
    Xvfb :99 -screen 0 1920x1080x24 &
    sleep 1
    echo "✅ Xvfb 已启动（非守护模式）"
  fi
fi

echo "=== 3. 检查 MCP 服务是否运行 ==="
if systemctl is-active --quiet xhs-mcp 2>/dev/null; then
  echo "✅ MCP 服务运行中 (systemd 守护)"
elif pgrep -f xiaohongshu-mcp-linux > /dev/null; then
  echo "✅ MCP 服务运行中 (手动)"
else
  echo "⚠️ MCP 服务未运行，尝试启动 systemd 服务..."
  systemctl start xhs-mcp 2>/dev/null
  sleep 2
  if systemctl is-active --quiet xhs-mcp 2>/dev/null; then
    echo "✅ MCP 服务已启动 (systemd)"
  else
    echo "⚠️ systemd 服务不存在，手动启动..."
    cd ~/xiaohongshu-mcp && DISPLAY=:99 nohup ./xiaohongshu-mcp-linux-amd64 > mcp.log 2>&1 &
    sleep 3
    if pgrep -f xiaohongshu-mcp-linux > /dev/null; then
      echo "✅ MCP 服务已启动（非守护模式）"
    else
      echo "❌ MCP 服务启动失败，请检查 ~/xiaohongshu-mcp/mcp.log"
      exit 1
    fi
  fi
fi

echo "=== 4. 检查登录状态 ==="
SESSION_ID=$(curl -s -D /tmp/xhs_headers -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"openclaw","version":"1.0"}},"id":1}' > /dev/null && grep -i 'Mcp-Session-Id' /tmp/xhs_headers | tr -d '\r' | awk '{print $2}')

curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}' > /dev/null

LOGIN_RESULT=$(curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"check_login_status","arguments":{}},"id":2}')

echo "$LOGIN_RESULT"

if echo "$LOGIN_RESULT" | grep -q "未登录"; then
  echo "❌ 未登录，需要扫码登录"
  exit 2
else
  echo "✅ 已登录，可以正常使用"
  exit 0
fi
