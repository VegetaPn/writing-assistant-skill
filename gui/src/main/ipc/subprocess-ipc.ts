// Subprocess IPC handlers

import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { SubprocessManager } from '../services/subprocess-manager';
import type { SubprocessExecOptions } from '../../shared/types';

export function registerSubprocessIPC(
  ipcMain: IpcMain,
  subprocessManager: SubprocessManager
): void {
  ipcMain.handle(
    IPC_CHANNELS.SUBPROCESS_EXEC,
    async (_event, options: SubprocessExecOptions) => {
      return subprocessManager.exec(options);
    }
  );

  ipcMain.handle(IPC_CHANNELS.SUBPROCESS_KILL, async (_event, processId: string) => {
    return subprocessManager.kill(processId);
  });

  ipcMain.handle(IPC_CHANNELS.SUBPROCESS_LIST, async () => {
    return subprocessManager.list();
  });
}
