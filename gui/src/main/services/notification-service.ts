// NotificationService - OS-level and in-app notifications

import { Notification, BrowserWindow } from 'electron';
import type { AppNotification, NotificationType } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';

export class NotificationService {
  private notifications: AppNotification[] = [];
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  send(options: {
    type: NotificationType;
    title: string;
    body: string;
    actionable?: boolean;
    actions?: Array<{ label: string; action: string; data?: Record<string, unknown> }>;
    data?: Record<string, unknown>;
  }): AppNotification {
    const notification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type: options.type,
      title: options.title,
      body: options.body,
      timestamp: new Date().toISOString(),
      read: false,
      actionable: options.actionable || false,
      actions: options.actions,
      data: options.data,
    };

    this.notifications.unshift(notification);

    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Send to renderer
    this.mainWindow?.webContents.send(IPC_CHANNELS.NOTIFICATION_SEND, notification);

    // Show OS notification if window is not focused
    if (!this.mainWindow?.isFocused()) {
      this.showOSNotification(notification);
    }

    return notification;
  }

  private showOSNotification(notification: AppNotification): void {
    if (!Notification.isSupported()) return;

    const osNotif = new Notification({
      title: notification.title,
      body: notification.body,
      silent: false,
    });

    osNotif.on('click', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
      this.mainWindow?.webContents.send(
        IPC_CHANNELS.NOTIFICATION_CLICKED,
        notification.id
      );
    });

    osNotif.show();
  }

  getAll(): AppNotification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markRead(notificationId: string): void {
    const notif = this.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  }

  markAllRead(): void {
    this.notifications.forEach(n => { n.read = true; });
  }

  clear(): void {
    this.notifications = [];
  }
}
