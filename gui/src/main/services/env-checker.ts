// EnvChecker - Environment validation service

import * as path from 'path';
import { exec } from 'child_process';
import type { EnvCheckResult, EnvCheckItem, EnvCheckStatus } from '../../shared/types';

export class EnvChecker {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async check(): Promise<EnvCheckResult> {
    const items: EnvCheckItem[] = [];

    // Run check-env.sh if available
    const scriptPath = path.join(this.projectPath, 'scripts', 'check-env.sh');
    try {
      const scriptResult = await this.execCommand(`bash "${scriptPath}"`, this.projectPath);
      const parsed = this.parseCheckEnvOutput(scriptResult.stdout + scriptResult.stderr);
      items.push(...parsed);
    } catch {
      // Script not available or failed, do manual checks
      items.push(...(await this.manualChecks()));
    }

    const overall = this.computeOverall(items);

    return {
      overall,
      items,
      timestamp: new Date().toISOString(),
    };
  }

  private async manualChecks(): Promise<EnvCheckItem[]> {
    const items: EnvCheckItem[] = [];

    // Check OPENROUTER_API_KEY
    items.push({
      name: 'OPENROUTER_API_KEY',
      status: process.env.OPENROUTER_API_KEY ? 'ok' : 'warning',
      message: process.env.OPENROUTER_API_KEY
        ? 'API key is set'
        : 'OPENROUTER_API_KEY not set in environment',
    });

    // Check bird CLI
    try {
      await this.execCommand('which bird');
      items.push({ name: 'bird CLI', status: 'ok', message: 'bird CLI found' });
    } catch {
      items.push({ name: 'bird CLI', status: 'warning', message: 'bird CLI not found' });
    }

    // Check Node.js
    try {
      const result = await this.execCommand('node --version');
      items.push({ name: 'Node.js', status: 'ok', message: `Node.js ${result.stdout.trim()}` });
    } catch {
      items.push({ name: 'Node.js', status: 'error', message: 'Node.js not found' });
    }

    // Check Python
    try {
      const result = await this.execCommand('python3 --version');
      items.push({ name: 'Python', status: 'ok', message: result.stdout.trim() });
    } catch {
      items.push({ name: 'Python', status: 'warning', message: 'Python 3 not found' });
    }

    return items;
  }

  private parseCheckEnvOutput(output: string): EnvCheckItem[] {
    const items: EnvCheckItem[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let status: EnvCheckStatus = 'ok';
      let message = trimmed;

      if (trimmed.includes('✓') || trimmed.includes('[OK]') || trimmed.includes('PASS')) {
        status = 'ok';
      } else if (trimmed.includes('✗') || trimmed.includes('[FAIL]') || trimmed.includes('ERROR')) {
        status = 'error';
      } else if (trimmed.includes('⚠') || trimmed.includes('[WARN]')) {
        status = 'warning';
      } else {
        continue; // Skip non-status lines
      }

      // Extract name from the line
      const nameMatch = trimmed.match(/(?:✓|✗|⚠|\[OK\]|\[FAIL\]|\[WARN\])\s*(.+)/);
      const name = nameMatch ? nameMatch[1].split(':')[0].trim() : trimmed;
      message = nameMatch ? nameMatch[1].trim() : trimmed;

      items.push({ name, status, message });
    }

    return items;
  }

  private computeOverall(items: EnvCheckItem[]): EnvCheckStatus {
    if (items.some(i => i.status === 'error')) return 'error';
    if (items.some(i => i.status === 'warning')) return 'warning';
    return 'ok';
  }

  private execCommand(
    command: string,
    cwd?: string
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      exec(command, { cwd, timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }
}
