// Agent SDK IPC handlers

import { IpcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { AgentSDKManager } from '../services/agent-sdk-manager';
import type { AgentQueryOptions } from '../../shared/types';

export function registerAgentIPC(
  ipcMain: IpcMain,
  mainWindow: BrowserWindow,
  agentManager: AgentSDKManager
): void {
  // Forward streaming messages to renderer
  agentManager.onStream((sessionId, message) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.AGENT_QUERY_STREAM, sessionId, message);
    }
  });

  // Forward permission requests to renderer
  agentManager.onPermissionRequest((request) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.AGENT_QUERY_PERMISSION, request);
    }
  });

  // Forward completion events
  agentManager.onComplete((sessionId, result) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.AGENT_QUERY_COMPLETE, sessionId, result);
    }
  });

  // Forward error events
  agentManager.onError((sessionId, error) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.AGENT_QUERY_ERROR, sessionId, error);
    }
  });

  // Handle query requests from renderer
  ipcMain.handle(IPC_CHANNELS.AGENT_QUERY, async (_event, options: AgentQueryOptions) => {
    return agentManager.query(options);
  });

  // Handle cancel requests
  ipcMain.handle(IPC_CHANNELS.AGENT_QUERY_CANCEL, async (_event, sessionId: string) => {
    agentManager.cancel(sessionId);
  });

  // Handle permission responses
  ipcMain.handle('agent:respondPermission', async (_event, requestId: string, result: string) => {
    agentManager.respondPermission(requestId, result);
  });
}
