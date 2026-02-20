// AgentSDKManager - Wraps claude CLI for programmatic AI interaction
//
// Uses `claude` CLI with --print flag for non-interactive mode.
// The CLI outputs streaming JSON when invoked programmatically.

import { spawn, execSync, ChildProcess } from 'child_process';
import * as fs from 'fs';
import type {
  AgentMessage,
  AgentQueryOptions,
  PermissionRequest,
} from '../../shared/types';

interface AgentSession {
  id: string;
  messages: AgentMessage[];
  isActive: boolean;
  process: ChildProcess | null;
}

/**
 * Resolve the full path to the `claude` binary.
 * Electron GUI apps on macOS don't inherit the shell's PATH,
 * so we need to find it manually.
 */
function resolveClaudePath(): string {
  // 1. Try common locations
  const candidates = [
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
    `${process.env.HOME}/.npm-global/bin/claude`,
    `${process.env.HOME}/.nvm/versions/node/current/bin/claude`,
  ];

  // Also check NVM versions
  try {
    const nvmDir = `${process.env.HOME}/.nvm/versions/node`;
    if (fs.existsSync(nvmDir)) {
      const versions = fs.readdirSync(nvmDir).sort().reverse();
      for (const v of versions) {
        candidates.push(`${nvmDir}/${v}/bin/claude`);
      }
    }
  } catch { /* skip */ }

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch { /* skip */ }
  }

  // 2. Try `which claude` via shell
  try {
    const result = execSync('which claude', {
      encoding: 'utf-8',
      env: { ...process.env, PATH: getExtendedPath() },
      timeout: 5000,
    }).trim();
    if (result && fs.existsSync(result)) return result;
  } catch { /* skip */ }

  // 3. Fallback — let spawn try with extended PATH
  return 'claude';
}

/**
 * Build an extended PATH that includes common binary locations.
 */
function getExtendedPath(): string {
  const home = process.env.HOME || '';
  const extra = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    `${home}/.npm-global/bin`,
    `${home}/.nvm/versions/node/current/bin`,
  ];
  const existing = process.env.PATH || '';
  return [...extra, ...existing.split(':')].filter(Boolean).join(':');
}

export class AgentSDKManager {
  private projectPath: string;
  private claudePath: string;
  private sessions = new Map<string, AgentSession>();
  private streamCallbacks: Array<(sessionId: string, message: AgentMessage) => void> = [];
  private permissionCallbacks: Array<(request: PermissionRequest) => void> = [];
  private completeCallbacks: Array<(sessionId: string, result: string) => void> = [];
  private errorCallbacks: Array<(sessionId: string, error: string) => void> = [];

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.claudePath = resolveClaudePath();
    console.log(`[AgentSDK] Claude binary resolved to: ${this.claudePath}`);
  }

  async query(options: AgentQueryOptions): Promise<string> {
    const sessionId = options.sessionId || this.generateSessionId();

    const session: AgentSession = {
      id: sessionId,
      messages: [],
      isActive: true,
      process: null,
    };

    this.sessions.set(sessionId, session);

    // Emit a startup message so the UI knows something is happening
    const startMsg: AgentMessage = {
      id: this.generateMessageId(),
      role: 'system',
      content: `启动 Claude CLI: ${this.claudePath}`,
      timestamp: new Date().toISOString(),
    };
    this.streamCallbacks.forEach(cb => cb(sessionId, startMsg));

    // Run query in background
    this.runQuery(sessionId, options).catch((error) => {
      this.errorCallbacks.forEach(cb => cb(sessionId, error.message));
    });

    return sessionId;
  }

  private async runQuery(sessionId: string, options: AgentQueryOptions): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      // Build claude CLI args
      const args: string[] = [
        '--print',  // Non-interactive, print output
        '--verbose',  // Required for stream-json output format
        '--output-format', 'stream-json',  // Stream JSON events
      ];

      if (options.systemPrompt) {
        args.push('--system-prompt', options.systemPrompt);
      }

      if (options.allowedTools && options.allowedTools.length > 0) {
        args.push('--allowedTools', options.allowedTools.join(','));
      }

      // The prompt goes last
      args.push(options.prompt);

      const cwd = options.cwd || this.projectPath;
      console.log(`[AgentSDK] Spawning: ${this.claudePath} ${args.slice(0, 3).join(' ')} ... (cwd: ${cwd})`);

      const child = spawn(this.claudePath, args, {
        cwd,
        env: { ...process.env, PATH: getExtendedPath() },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      session.process = child;

      // Close stdin immediately so claude doesn't wait for input
      child.stdin?.end();

      // Notify that process has started with PID
      const pidMsg: AgentMessage = {
        id: this.generateMessageId(),
        role: 'system',
        content: `进程已启动 (PID: ${child.pid})`,
        timestamp: new Date().toISOString(),
      };
      this.streamCallbacks.forEach(cb => cb(sessionId, pidMsg));

      let buffer = '';

      child.stdout?.on('data', (data: Buffer) => {
        if (!session.isActive) return;

        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const event = JSON.parse(line);
            const message = this.processStreamEvent(event);
            if (message) {
              session.messages.push(message);
              this.streamCallbacks.forEach(cb => cb(sessionId, message));
            }
          } catch {
            // Not JSON - treat as plain text output
            const message: AgentMessage = {
              id: this.generateMessageId(),
              role: 'assistant',
              content: line,
              timestamp: new Date().toISOString(),
              isStreaming: true,
            };
            session.messages.push(message);
            this.streamCallbacks.forEach(cb => cb(sessionId, message));
          }
        }
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        if (text.trim()) {
          console.log(`[AgentSDK] stderr: ${text.trim()}`);
          const message: AgentMessage = {
            id: this.generateMessageId(),
            role: 'system',
            content: `[stderr] ${text.trim()}`,
            timestamp: new Date().toISOString(),
          };
          session.messages.push(message);
          this.streamCallbacks.forEach(cb => cb(sessionId, message));
        }
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          session.isActive = false;
          session.process = null;

          console.log(`[AgentSDK] Process exited with code ${code}`);

          const finalContent = session.messages
            .filter(m => m.role === 'assistant')
            .map(m => m.content)
            .join('\n');

          if (code === 0) {
            this.completeCallbacks.forEach(cb => cb(sessionId, finalContent));
            resolve();
          } else {
            const error = `Claude CLI exited with code ${code}`;
            this.errorCallbacks.forEach(cb => cb(sessionId, error));
            reject(new Error(error));
          }
        });

        child.on('error', (err) => {
          session.isActive = false;
          session.process = null;
          console.error(`[AgentSDK] Process error: ${err.message}`);

          let hint = '';
          if (err.message.includes('ENOENT')) {
            hint = ' — claude 命令未找到，请确认已安装 Claude Code CLI（npm install -g @anthropic-ai/claude-code）';
          }

          this.errorCallbacks.forEach(cb => cb(sessionId, err.message + hint));
          reject(err);
        });
      });
    } catch (error: unknown) {
      session.isActive = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.errorCallbacks.forEach(cb => cb(sessionId, errorMessage));
    }
  }

  /**
   * Extract text content from a claude stream-json event.
   *
   * The `assistant` event wraps an Anthropic API message:
   *   { type: "assistant", message: { content: [{ type: "text", text: "..." }, ...] } }
   *
   * Tool-use blocks appear inside the same content array:
   *   { type: "tool_use", id: "...", name: "Bash", input: { command: "..." } }
   */
  private processStreamEvent(event: Record<string, unknown>): AgentMessage | null {
    const timestamp = new Date().toISOString();
    const type = event.type as string;

    switch (type) {
      case 'assistant': {
        // Full assistant message with content blocks
        const message = event.message as Record<string, unknown> | undefined;
        if (!message) return null;

        const contentBlocks = message.content as Array<Record<string, unknown>> | undefined;
        if (!contentBlocks || !Array.isArray(contentBlocks)) return null;

        const textParts: string[] = [];
        const toolCalls: Array<{ name: string; input: Record<string, unknown>; status: 'pending' | 'running' | 'completed' | 'error' }> = [];

        for (const block of contentBlocks) {
          if (block.type === 'text') {
            textParts.push(block.text as string);
          } else if (block.type === 'tool_use') {
            toolCalls.push({
              name: (block.name || 'unknown') as string,
              input: (block.input || {}) as Record<string, unknown>,
              status: 'running',
            });
          }
        }

        const content = textParts.join('') || (toolCalls.length > 0 ? `Using tool: ${toolCalls[0].name}` : '');

        return {
          id: this.generateMessageId(),
          role: 'assistant',
          content,
          timestamp,
          isStreaming: true,
          ...(toolCalls.length > 0 ? { toolCalls } : {}),
        };
      }

      case 'content_block_start':
      case 'content_block_delta': {
        // Streaming delta — extract partial text
        const delta = event.delta as Record<string, unknown> | undefined;
        const contentBlock = event.content_block as Record<string, unknown> | undefined;
        const text = (delta?.text || contentBlock?.text || event.text || '') as string;
        if (!text) return null;
        return {
          id: this.generateMessageId(),
          role: 'assistant',
          content: text,
          timestamp,
          isStreaming: true,
        };
      }

      case 'tool_use': {
        return {
          id: this.generateMessageId(),
          role: 'assistant',
          content: `Using tool: ${event.name || event.tool}`,
          timestamp,
          toolCalls: [{
            name: (event.name || event.tool || 'unknown') as string,
            input: (event.input || {}) as Record<string, unknown>,
            status: 'running',
          }],
        };
      }

      case 'tool_result': {
        return {
          id: this.generateMessageId(),
          role: 'assistant',
          content: (event.content || event.output || '') as string,
          timestamp,
          toolCalls: [{
            name: (event.name || event.tool || 'unknown') as string,
            input: {},
            output: (event.content || event.output || '') as string,
            status: 'completed',
          }],
        };
      }

      case 'error':
        return {
          id: this.generateMessageId(),
          role: 'system',
          content: (event.error || event.message || 'Unknown error') as string,
          timestamp,
        };

      case 'result':
        return {
          id: this.generateMessageId(),
          role: 'assistant',
          content: (event.result || '') as string,
          timestamp,
          isStreaming: false,
        };

      case 'system':
        // Init event — log but don't surface as chat content
        console.log(`[AgentSDK] System event: subtype=${event.subtype}, model=${event.model}`);
        return null;

      default:
        // Unknown event type — skip silently
        return null;
    }
  }

  cancel(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      if (session.process) {
        session.process.kill('SIGTERM');
        session.process = null;
      }
    }
  }

  respondPermission(requestId: string, _result: string): void {
    console.log(`Permission response for ${requestId}: ${_result}`);
  }

  onStream(callback: (sessionId: string, message: AgentMessage) => void): () => void {
    this.streamCallbacks.push(callback);
    return () => {
      this.streamCallbacks = this.streamCallbacks.filter(cb => cb !== callback);
    };
  }

  onPermissionRequest(callback: (request: PermissionRequest) => void): () => void {
    this.permissionCallbacks.push(callback);
    return () => {
      this.permissionCallbacks = this.permissionCallbacks.filter(cb => cb !== callback);
    };
  }

  onComplete(callback: (sessionId: string, result: string) => void): () => void {
    this.completeCallbacks.push(callback);
    return () => {
      this.completeCallbacks = this.completeCallbacks.filter(cb => cb !== callback);
    };
  }

  onError(callback: (sessionId: string, error: string) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }

  getClaudePath(): string {
    return this.claudePath;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
