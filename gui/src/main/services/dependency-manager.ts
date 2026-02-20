// DependencyManager - Manage skill dependencies

import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface DependencyInfo {
  name: string;
  installed: boolean;
  path: string;
  description?: string;
}

export class DependencyManager {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async listDependencies(): Promise<DependencyInfo[]> {
    const depsDir = path.join(this.projectPath, 'dependencies');
    const results: DependencyInfo[] = [];

    try {
      const entries = await fs.promises.readdir(depsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          results.push({
            name: entry.name,
            installed: await this.isInstalled(entry.name),
            path: path.join(depsDir, entry.name),
          });
        }
      }
    } catch {
      // dependencies dir doesn't exist
    }

    return results;
  }

  private async isInstalled(skillName: string): Promise<boolean> {
    // Check if skill is installed in .claude/skills or equivalent
    const skillDir = path.join(this.projectPath, '.claude', 'skills', skillName);
    try {
      await fs.promises.access(skillDir);
      return true;
    } catch {
      return false;
    }
  }

  async installDependency(name: string): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      exec(
        `claude skill install "${name}"`,
        { cwd: this.projectPath, timeout: 60000 },
        (error, stdout, stderr) => {
          resolve({
            success: !error,
            output: stdout + stderr,
          });
        }
      );
    });
  }
}
