// FileSystemService - Three-level content system implementation

import * as fs from 'fs';
import * as path from 'path';
import chokidar from 'chokidar';
import type { MergedContent, ThreeLevelContent, FileInfo, FileChangeEvent, ContentLevel } from '../../shared/types';

export class FileSystemService {
  private projectPath: string;
  private watcher: chokidar.FSWatcher | null = null;
  private changeCallbacks: Array<(event: FileChangeEvent) => void> = [];

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Three-level read: system → user → project
   * Content merges on read; lower levels override higher on conflict.
   */
  async read3L(relativePath: string, projectSlug?: string): Promise<MergedContent> {
    const sources: ThreeLevelContent[] = [];

    // System level: {skill-dir}/assets/ or {skill-dir}/references/
    const systemPath = path.join(this.projectPath, relativePath);
    const systemContent = await this.safeReadFile(systemPath);
    if (systemContent !== null) {
      sources.push({ content: systemContent, source: 'system', path: systemPath });
    }

    // User level: {project-root}/assets/ or {project-root}/references/
    // In this project, user-level is the same as system-level (project root)
    // so we skip duplication. In a real multi-project setup, these would differ.

    // Project level: outputs/{topic-slug}/assets/ or outputs/{topic-slug}/references/
    if (projectSlug) {
      const projectPath = path.join(this.projectPath, 'outputs', projectSlug, relativePath);
      const projectContent = await this.safeReadFile(projectPath);
      if (projectContent !== null) {
        sources.push({ content: projectContent, source: 'project', path: projectPath });
      }
    }

    // Merge: last source wins (project > user > system)
    const merged = sources.length > 0
      ? sources[sources.length - 1].content
      : '';

    return { merged, sources };
  }

  async readFile(absolutePath: string): Promise<string> {
    return fs.promises.readFile(absolutePath, 'utf-8');
  }

  async writeFile(absolutePath: string, content: string): Promise<void> {
    await fs.promises.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.promises.writeFile(absolutePath, content, 'utf-8');
  }

  async writeUser(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.projectPath, relativePath);
    await this.writeFile(fullPath, content);
  }

  async writeProject(relativePath: string, projectSlug: string, content: string): Promise<void> {
    const fullPath = path.join(this.projectPath, 'outputs', projectSlug, relativePath);
    await this.writeFile(fullPath, content);
  }

  async listDir(absolutePath: string): Promise<FileInfo[]> {
    try {
      const entries = await fs.promises.readdir(absolutePath, { withFileTypes: true });
      const results: FileInfo[] = [];

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const fullPath = path.join(absolutePath, entry.name);
        try {
          const stat = await fs.promises.stat(fullPath);
          results.push({
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            size: stat.size,
            modifiedAt: stat.mtime.toISOString(),
          });
        } catch {
          // Skip files we can't stat
        }
      }

      return results.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    } catch {
      return [];
    }
  }

  async exists(absolutePath: string): Promise<boolean> {
    try {
      await fs.promises.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  watch(paths: string[]): void {
    if (this.watcher) {
      this.watcher.close();
    }

    const absolutePaths = paths.map(p =>
      path.isAbsolute(p) ? p : path.join(this.projectPath, p)
    );

    this.watcher = chokidar.watch(absolutePaths, {
      ignoreInitial: true,
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });

    this.watcher.on('all', (eventType, filePath) => {
      const event: FileChangeEvent = {
        type: eventType as FileChangeEvent['type'],
        path: filePath,
      };
      this.changeCallbacks.forEach(cb => cb(event));
    });
  }

  unwatch(paths: string[]): void {
    if (this.watcher) {
      const absolutePaths = paths.map(p =>
        path.isAbsolute(p) ? p : path.join(this.projectPath, p)
      );
      this.watcher.unwatch(absolutePaths);
    }
  }

  onFileChange(callback: (event: FileChangeEvent) => void): () => void {
    this.changeCallbacks.push(callback);
    return () => {
      this.changeCallbacks = this.changeCallbacks.filter(cb => cb !== callback);
    };
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  getProjectPath(): string {
    return this.projectPath;
  }

  setProjectPath(newPath: string): void {
    this.projectPath = newPath;
  }

  // Scan outputs directory for writing sessions
  async scanOutputs(): Promise<Array<{ slug: string; path: string; modifiedAt: string }>> {
    const outputsDir = path.join(this.projectPath, 'outputs');
    try {
      const entries = await fs.promises.readdir(outputsDir, { withFileTypes: true });
      const results = [];

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const dirPath = path.join(outputsDir, entry.name);
          const stat = await fs.promises.stat(dirPath);
          results.push({
            slug: entry.name,
            path: dirPath,
            modifiedAt: stat.mtime.toISOString(),
          });
        }
      }

      return results.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    } catch {
      return [];
    }
  }

  // Scan topics
  async scanTopics(): Promise<{ inbox: number; developing: number }> {
    const inboxPath = path.join(this.projectPath, 'assets', 'topics', 'inbox.md');
    const developingDir = path.join(this.projectPath, 'assets', 'topics', 'developing');

    let inboxCount = 0;
    let developingCount = 0;

    try {
      const inboxContent = await this.safeReadFile(inboxPath);
      if (inboxContent) {
        // Count topic entries (lines starting with ## or - [ ])
        const lines = inboxContent.split('\n');
        inboxCount = lines.filter(l => l.match(/^##\s|^-\s\[/)).length;
      }
    } catch { /* empty */ }

    try {
      const devEntries = await fs.promises.readdir(developingDir, { withFileTypes: true });
      developingCount = devEntries.filter(e => e.name.endsWith('.md')).length;
    } catch { /* empty */ }

    return { inbox: inboxCount, developing: developingCount };
  }

  private async safeReadFile(filePath: string): Promise<string | null> {
    try {
      return await fs.promises.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }
}
