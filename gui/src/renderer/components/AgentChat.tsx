import React, { useEffect, useRef, useState } from 'react';
import { useAgentChatStore } from '../stores/agent-chat-store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import type { AgentMessage, ToolCallInfo } from '../../shared/types';

interface AgentChatProps {
  systemPrompt?: string;
  placeholder?: string;
  className?: string;
  onComplete?: (result: string) => void;
}

export function AgentChat({ systemPrompt, placeholder, className, onComplete }: AgentChatProps) {
  const {
    activeSessionId,
    setActiveSessionId,
    messages,
    addMessage,
    isStreaming,
    setIsStreaming,
    pendingPermission,
    setPendingPermission,
    inputValue,
    setInputValue,
  } = useAgentChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sessionMessages = activeSessionId ? messages[activeSessionId] || [] : [];

  // Set up IPC listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubStream = window.electronAPI.agent.onStream((sessionId, message) => {
      addMessage(sessionId, message);
    });

    const unsubPermission = window.electronAPI.agent.onPermissionRequest((request) => {
      setPendingPermission(request);
    });

    const unsubComplete = window.electronAPI.agent.onComplete((sessionId, result) => {
      setIsStreaming(false);
      onComplete?.(result);
    });

    const unsubError = window.electronAPI.agent.onError((sessionId, error) => {
      setIsStreaming(false);
      addMessage(sessionId, {
        id: `error_${Date.now()}`,
        role: 'system',
        content: `Error: ${error}`,
        timestamp: new Date().toISOString(),
      });
    });

    return () => {
      unsubStream();
      unsubPermission();
      unsubComplete();
      unsubError();
    };
  }, [addMessage, setPendingPermission, setIsStreaming, onComplete]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessionMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: AgentMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setIsStreaming(true);
    setInputValue('');

    try {
      if (window.electronAPI) {
        const sessionId = await window.electronAPI.agent.query({
          prompt: inputValue,
          systemPrompt,
          sessionId: activeSessionId || undefined,
        });

        if (!activeSessionId) {
          setActiveSessionId(sessionId);
        }
        addMessage(sessionId, userMessage);
      }
    } catch (error) {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePermissionResponse = async (result: 'allow' | 'deny') => {
    if (pendingPermission && window.electronAPI) {
      await window.electronAPI.agent.respondPermission(pendingPermission.id, result);
      setPendingPermission(null);
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {sessionMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span>Claude 正在思考...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Permission request */}
      {pendingPermission && (
        <div className="border-t bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="mb-2 text-sm font-medium">权限请求</p>
          <p className="mb-2 text-sm text-muted-foreground">
            工具 <code className="rounded bg-muted px-1">{pendingPermission.tool}</code>: {pendingPermission.description}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handlePermissionResponse('allow')}>
              允许
            </Button>
            <Button size="sm" variant="outline" onClick={() => handlePermissionResponse('deny')}>
              拒绝
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || '输入消息...'}
            disabled={isStreaming}
          />
          <Button onClick={handleSend} disabled={isStreaming || !inputValue.trim()}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : isSystem
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted'
        )}
      >
        {/* Content */}
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tool, idx) => (
              <ToolCallDisplay key={idx} toolCall={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCallDisplay({ toolCall }: { toolCall: ToolCallInfo }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor =
    toolCall.status === 'completed'
      ? 'success'
      : toolCall.status === 'error'
      ? 'destructive'
      : toolCall.status === 'running'
      ? 'warning'
      : 'secondary';

  return (
    <div className="rounded border bg-background/50 p-2">
      <div
        className="flex cursor-pointer items-center gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <Badge variant={statusColor as any} className="text-[10px]">
          {toolCall.status}
        </Badge>
        <span className="text-xs font-medium">{toolCall.name}</span>
        <svg
          className={cn('ml-auto h-3 w-3 transition-transform', expanded && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-2 space-y-1">
          {toolCall.input && Object.keys(toolCall.input).length > 0 && (
            <div>
              <span className="text-[10px] text-muted-foreground">输入:</span>
              <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-1 text-[10px]">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.output && (
            <div>
              <span className="text-[10px] text-muted-foreground">输出:</span>
              <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-1 text-[10px]">
                {toolCall.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
