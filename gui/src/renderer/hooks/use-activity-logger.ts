import { useEffect } from 'react';
import { useActivityLogStore } from '../stores/activity-log-store';

/**
 * Global hook that listens to all IPC events and logs them.
 * Should be mounted once at the app root.
 */
export function useActivityLogger() {
  const { addEntry, incrementActive, decrementActive } = useActivityLogStore();

  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanups: Array<() => void> = [];

    // Agent stream events
    cleanups.push(
      window.electronAPI.agent.onStream((_sessionId, message) => {
        if (message.role === 'assistant' && message.toolCalls?.length) {
          for (const tool of message.toolCalls) {
            const status = tool.status === 'running' ? 'info' : tool.status === 'completed' ? 'success' : 'error';
            addEntry(
              status === 'info' ? 'agent' : status,
              'Agent',
              `工具调用: ${tool.name} [${tool.status}]`,
              tool.input ? JSON.stringify(tool.input).substring(0, 200) : undefined
            );
          }
        } else if (message.role === 'system' && message.content) {
          addEntry('warning', 'Agent', message.content.substring(0, 200));
        }
        // Skip assistant text chunks to avoid flooding
      })
    );

    // Agent completion
    cleanups.push(
      window.electronAPI.agent.onComplete((sessionId, _result) => {
        decrementActive();
        addEntry('success', 'Agent', `会话完成: ${sessionId.substring(0, 20)}...`);
      })
    );

    // Agent errors
    cleanups.push(
      window.electronAPI.agent.onError((sessionId, error) => {
        decrementActive();
        addEntry('error', 'Agent', `会话错误: ${error}`, sessionId);
      })
    );

    // Monitor results
    cleanups.push(
      window.electronAPI.monitor.onResult((result) => {
        addEntry('info', 'Monitor', `扫描完成: 发现 ${result.findings?.length || 0} 条结果`);
      })
    );

    // File change events
    cleanups.push(
      window.electronAPI.fs.onChange((event) => {
        addEntry('info', 'FS', `文件${event.type === 'add' ? '新增' : event.type === 'change' ? '修改' : '删除'}: ${event.path.split('/').slice(-2).join('/')}`);
      })
    );

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, [addEntry, incrementActive, decrementActive]);
}
