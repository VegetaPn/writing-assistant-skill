// SubprocessManager - Child process management with proxy support

import { spawn, ChildProcess } from 'child_process';
import type { SubprocessExecOptions, SubprocessResult, SubprocessInfo } from '../../shared/types';
import { ProxyManager } from './proxy-manager';

interface ManagedProcess {
  id: string;
  process: ChildProcess;
  info: SubprocessInfo;
}

export class SubprocessManager {
  private processes = new Map<string, ManagedProcess>();
  private proxyManager: ProxyManager;
  private maxConcurrent = 3;

  constructor(proxyManager: ProxyManager) {
    this.proxyManager = proxyManager;
  }

  async exec(options: SubprocessExecOptions): Promise<SubprocessResult> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const env = {
        ...process.env,
        ...(options.useProxy ? this.proxyManager.getProxyEnv() : {}),
        ...(options.env || {}),
      };

      const child = spawn(options.command, options.args || [], {
        cwd: options.cwd,
        env,
        shell: true,
        timeout: options.timeout,
      });

      const info: SubprocessInfo = {
        id,
        command: options.command,
        args: options.args || [],
        pid: child.pid,
        status: 'running',
        startedAt: new Date().toISOString(),
      };

      this.processes.set(id, { id, process: child, info });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        info.status = code === 0 ? 'completed' : 'error';
        info.exitCode = code ?? 1;
        this.processes.delete(id);
        resolve({ stdout, stderr, exitCode: code ?? 1 });
      });

      child.on('error', (err) => {
        info.status = 'error';
        this.processes.delete(id);
        reject(err);
      });
    });
  }

  async execStream(
    options: SubprocessExecOptions,
    onData: (data: string) => void
  ): Promise<SubprocessResult> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const env = {
        ...process.env,
        ...(options.useProxy ? this.proxyManager.getProxyEnv() : {}),
        ...(options.env || {}),
      };

      const child = spawn(options.command, options.args || [], {
        cwd: options.cwd,
        env,
        shell: true,
        timeout: options.timeout,
      });

      const info: SubprocessInfo = {
        id,
        command: options.command,
        args: options.args || [],
        pid: child.pid,
        status: 'running',
        startedAt: new Date().toISOString(),
      };

      this.processes.set(id, { id, process: child, info });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data: Buffer) => {
        const str = data.toString();
        stdout += str;
        onData(str);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const str = data.toString();
        stderr += str;
        onData(str);
      });

      child.on('close', (code) => {
        info.status = code === 0 ? 'completed' : 'error';
        info.exitCode = code ?? 1;
        this.processes.delete(id);
        resolve({ stdout, stderr, exitCode: code ?? 1 });
      });

      child.on('error', (err) => {
        info.status = 'error';
        this.processes.delete(id);
        reject(err);
      });
    });
  }

  kill(processId: string): boolean {
    const managed = this.processes.get(processId);
    if (managed) {
      managed.process.kill('SIGTERM');
      managed.info.status = 'killed';
      this.processes.delete(processId);
      return true;
    }
    return false;
  }

  killAll(): void {
    for (const [id, managed] of this.processes) {
      managed.process.kill('SIGTERM');
      managed.info.status = 'killed';
    }
    this.processes.clear();
  }

  list(): SubprocessInfo[] {
    return Array.from(this.processes.values()).map(m => m.info);
  }

  getRunningCount(): number {
    return this.processes.size;
  }

  canSpawn(): boolean {
    return this.processes.size < this.maxConcurrent;
  }

  private generateId(): string {
    return `proc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
