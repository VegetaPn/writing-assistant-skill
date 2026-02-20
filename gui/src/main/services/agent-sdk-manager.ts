// AgentSDKManager - Wraps claude CLI for programmatic AI interaction
//
// Uses `claude` CLI with --print flag for non-interactive mode.
// The CLI outputs streaming JSON when invoked programmatically.

import { spawn, ChildProcess } from 'child_process';
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

export class AgentSDKManager {
  private projectPath: string;
  private sessions = new Map<string, AgentSession>();
  private streamCallbacks: Array<(sessionId: string, message: AgentMessage) => void> = [];
  private permissionCallbacks: Array<(request: PermissionRequest) => void> = [];
  private completeCallbacks: Array<(sessionId: string, result: string) => void> = [];
  private errorCallbacks: Array<(sessionId: string, error: string) => void> = [];

  constructor(projectPath: string) {
    this.projectPath = projectPath;
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

      const child = spawn('claude', args, {
        cwd: options.cwd || this.projectPath,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      session.process = child;

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
        // Claude CLI may output progress/status to stderr
        if (text.trim()) {
          const message: AgentMessage = {
            id: this.generateMessageId(),
            role: 'system',
            content: text,
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
          this.errorCallbacks.forEach(cb => cb(sessionId, err.message));
          reject(err);
        });
      });
    } catch (error: unknown) {
      session.isActive = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.errorCallbacks.forEach(cb => cb(sessionId, errorMessage));
    }
  }

  private processStreamEvent(event: Record<string, unknown>): AgentMessage | null {
    const timestamp = new Date().toISOString();
    const type = event.type as string;

    switch (type) {
      case 'assistant':
      case 'text':
      case 'content_block_delta':
        return {
          id: this.generateMessageId(),
          role: 'assistant',
          content: (event.content || event.text || event.delta || '') as string,
          timestamp,
          isStreaming: true,
        };

      case 'tool_use':
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

      case 'tool_result':
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
          content: (event.result || event.content || '') as string,
          timestamp,
          isStreaming: false,
        };

      default:
        // Unknown event type - skip
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
    // Permission handling would need stdin interaction with the CLI
    // For now, this is a placeholder - the --print flag auto-accepts
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

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
