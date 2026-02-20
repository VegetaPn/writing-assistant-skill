// File System IPC handlers

import { IpcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { FileSystemService } from '../services/file-system-service';

export function registerFsIPC(
  ipcMain: IpcMain,
  mainWindow: BrowserWindow,
  fsService: FileSystemService
): void {
  // Three-level read
  ipcMain.handle(
    IPC_CHANNELS.FS_READ_3L,
    async (_event, relativePath: string, projectSlug?: string) => {
      return fsService.read3L(relativePath, projectSlug);
    }
  );

  // Read file
  ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_event, absolutePath: string) => {
    return fsService.readFile(absolutePath);
  });

  // Write file
  ipcMain.handle(
    IPC_CHANNELS.FS_WRITE_FILE,
    async (_event, absolutePath: string, content: string) => {
      return fsService.writeFile(absolutePath, content);
    }
  );

  // Write to user level
  ipcMain.handle(
    IPC_CHANNELS.FS_WRITE_USER,
    async (_event, relativePath: string, content: string) => {
      return fsService.writeUser(relativePath, content);
    }
  );

  // Write to project level
  ipcMain.handle(
    IPC_CHANNELS.FS_WRITE_PROJECT,
    async (_event, relativePath: string, projectSlug: string, content: string) => {
      return fsService.writeProject(relativePath, projectSlug, content);
    }
  );

  // List directory
  ipcMain.handle(IPC_CHANNELS.FS_LIST_DIR, async (_event, absolutePath: string) => {
    return fsService.listDir(absolutePath);
  });

  // Check existence
  ipcMain.handle(IPC_CHANNELS.FS_EXISTS, async (_event, absolutePath: string) => {
    return fsService.exists(absolutePath);
  });

  // Watch paths
  ipcMain.handle(IPC_CHANNELS.FS_WATCH, async (_event, paths: string[]) => {
    fsService.watch(paths);

    // Forward file change events to renderer
    fsService.onFileChange((changeEvent) => {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send(IPC_CHANNELS.FS_CHANGE, changeEvent);
      }
    });
  });

  // Unwatch paths
  ipcMain.handle(IPC_CHANNELS.FS_UNWATCH, async (_event, paths: string[]) => {
    fsService.unwatch(paths);
  });
}
