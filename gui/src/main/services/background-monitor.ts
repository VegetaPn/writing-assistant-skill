// BackgroundMonitor - Scheduled viral content scanning

import * as cron from 'node-cron';
import type { MonitorConfig, MonitorScanResult, MonitorStatus } from '../../shared/types';
import { FileSystemService } from './file-system-service';
import { SubprocessManager } from './subprocess-manager';
import { NotificationService } from './notification-service';
import { MONITOR_DEFAULTS } from '../../shared/constants';

export class BackgroundMonitor {
  private fsService: FileSystemService;
  private subprocessManager: SubprocessManager;
  private notificationService: NotificationService;
  private cronJob: cron.ScheduledTask | null = null;
  private status: MonitorStatus = 'idle';
  private lastScan: string | null = null;
  private config: MonitorConfig = {
    enabled: false,
    intervalMinutes: MONITOR_DEFAULTS.INTERVAL_MINUTES,
    keywords: [],
    platforms: ['xiaohongshu', 'wechat', 'x'],
    thresholds: {},
  };
  private resultCallbacks: Array<(result: MonitorScanResult) => void> = [];

  constructor(
    fsService: FileSystemService,
    subprocessManager: SubprocessManager,
    notificationService: NotificationService
  ) {
    this.fsService = fsService;
    this.subprocessManager = subprocessManager;
    this.notificationService = notificationService;
  }

  start(config?: Partial<MonitorConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.config.enabled = true;
    this.status = 'running';

    // Schedule scanning based on interval
    const minutes = this.config.intervalMinutes || MONITOR_DEFAULTS.INTERVAL_MINUTES;
    // node-cron: minute-level granularity
    const cronExpression = minutes < 60
      ? `*/${minutes} * * * *`       // Every N minutes
      : `0 */${Math.round(minutes / 60)} * * *`;  // Every N hours

    if (this.cronJob) {
      this.cronJob.stop();
    }

    this.cronJob = cron.schedule(cronExpression, () => {
      this.scan();
    });

    // Run initial scan
    this.scan();
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.config.enabled = false;
    this.status = 'idle';
  }

  pause(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }
    this.status = 'paused';
  }

  resume(): void {
    if (this.config.enabled && this.cronJob) {
      this.cronJob.start();
      this.status = 'running';
    }
  }

  getStatus(): { status: string; lastScan?: string; nextScan?: string } {
    return {
      status: this.status,
      lastScan: this.lastScan || undefined,
      nextScan: this.cronJob ? this.getNextScanTime() : undefined,
    };
  }

  onResult(callback: (result: MonitorScanResult) => void): () => void {
    this.resultCallbacks.push(callback);
    return () => {
      this.resultCallbacks = this.resultCallbacks.filter(cb => cb !== callback);
    };
  }

  private async scan(): Promise<void> {
    if (this.status === 'paused') return;
    if (!this.subprocessManager.canSpawn()) {
      // Too many processes running, skip this scan
      return;
    }

    this.status = 'scanning';

    try {
      // Load monitor config from file
      await this.loadConfig();

      const results: MonitorScanResult[] = [];

      for (const platform of this.config.platforms) {
        try {
          const result = await this.scanPlatform(platform);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          console.error(`Scan failed for ${platform}:`, error);
        }
      }

      this.lastScan = new Date().toISOString();

      // Notify about new trends
      for (const result of results) {
        this.resultCallbacks.forEach(cb => cb(result));

        if (result.newTrends.length > 0) {
          this.notificationService.send({
            type: 'monitor',
            title: `发现 ${result.newTrends.length} 条新热点`,
            body: `平台: ${result.platform}\n${result.newTrends.map(t => t.title).join('\n')}`,
            actionable: true,
            actions: [
              { label: '深度分析', action: 'analyze' },
              { label: '转选题', action: 'toTopic' },
              { label: '忽略', action: 'dismiss' },
            ],
            data: { scanResult: result },
          });
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
      this.status = 'error';
      return;
    }

    this.status = this.config.enabled ? 'running' : 'idle';
  }

  private async scanPlatform(platform: string): Promise<MonitorScanResult | null> {
    // This is a placeholder - actual scanning would use subprocess manager
    // to run platform-specific commands (bird, xhs_client, etc.)
    const result: MonitorScanResult = {
      id: `scan_${Date.now()}_${platform}`,
      timestamp: new Date().toISOString(),
      platform,
      items: [],
      newTrends: [],
    };

    return result;
  }

  private async loadConfig(): Promise<void> {
    try {
      const configContent = await this.fsService.readFile(
        `${this.fsService.getProjectPath()}/assets/topics/benchmarks/monitor-config.md`
      );
      // Parse config from markdown - simplified
      const keywordsMatch = configContent.match(/keywords?:\s*(.+)/i);
      if (keywordsMatch) {
        this.config.keywords = keywordsMatch[1].split(',').map(k => k.trim());
      }
    } catch {
      // Use defaults
    }
  }

  private getNextScanTime(): string {
    const minutes = this.config.intervalMinutes || MONITOR_DEFAULTS.INTERVAL_MINUTES;
    const next = new Date();
    next.setMinutes(next.getMinutes() + minutes);
    return next.toISOString();
  }
}
