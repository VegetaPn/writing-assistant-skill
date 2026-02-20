// ProxyManager - Network proxy configuration

import type { AppSettings } from '../../shared/types';
import { DEFAULT_PROXY } from '../../shared/constants';

const DEFAULT_SETTINGS: AppSettings = {
  projectPath: '',
  proxyAddress: DEFAULT_PROXY,
  proxyEnabled: true,
  openrouterApiKey: '',
  monitorConfig: {
    enabled: false,
    intervalMinutes: 240,
    keywords: [],
    platforms: ['xiaohongshu', 'wechat', 'x'],
    thresholds: {},
  },
  theme: 'system',
  language: 'zh',
};

export class ProxyManager {
  private settings: AppSettings;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  getProxyUrl(): string | undefined {
    if (!this.settings.proxyEnabled || !this.settings.proxyAddress) {
      return undefined;
    }
    const addr = this.settings.proxyAddress;
    if (addr.startsWith('http://') || addr.startsWith('https://') || addr.startsWith('socks5://')) {
      return addr;
    }
    return `http://${addr}`;
  }

  getProxyEnv(): Record<string, string> {
    const proxyUrl = this.getProxyUrl();
    if (!proxyUrl) return {};

    return {
      HTTP_PROXY: proxyUrl,
      HTTPS_PROXY: proxyUrl,
      http_proxy: proxyUrl,
      https_proxy: proxyUrl,
    };
  }

  getSetting(key: string): unknown {
    return (this.settings as unknown as Record<string, unknown>)[key];
  }

  setSetting(key: string, value: unknown): void {
    (this.settings as unknown as Record<string, unknown>)[key] = value;
  }

  getAllSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(partial: Partial<AppSettings>): void {
    Object.assign(this.settings, partial);
  }
}
