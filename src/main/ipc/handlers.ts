import { ipcMain, BrowserWindow, app } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { systemService } from '../services/systemService';
import { chatService } from '../services/chatService';
import { credentialStorageService } from '../services/credentialStorageService';
import { aiProviderManager } from '../services/aiProviderManager';
import { aiConfigService } from '../services/aiConfigService';
import type { AIProviderId, ProviderConfig } from '../../shared/types';

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // Window management
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow.close();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    return mainWindow.isMaximized();
  });

  // Telemetry
  ipcMain.handle(IPC_CHANNELS.TELEMETRY_GET, () => {
    return systemService.getTelemetry();
  });

  // Chat & AI Assistant
  ipcMain.handle(IPC_CHANNELS.CHAT_SEND, async (_event, text: string) => {
    if (typeof text !== 'string') {
      throw new Error('Invalid input format');
    }
    return await chatService.handleUserMessage(text);
  });

  ipcMain.handle(IPC_CHANNELS.CHAT_CLEAR, () => {
    chatService.clearHistory();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.CHAT_GET_HISTORY, () => {
    return chatService.getSavedMessages();
  });

  // Diagnostics
  ipcMain.handle(IPC_CHANNELS.DIAGNOSTIC_RUN, () => {
    return systemService.runDiagnostics();
  });

  // Application Info
  ipcMain.handle(IPC_CHANNELS.APP_INFO, () => {
    return {
      name: 'J.A.R.V.I.S. Desktop',
      version: app.getVersion() || '1.0.0',
      electronVersion: process.versions.electron,
    };
  });

  // Multi-AI Neural Status & Configuration (with safeStorage DPAPI encryption)
  ipcMain.handle(IPC_CHANNELS.AI_STATUS, () => {
    return aiProviderManager.getStatus();
  });

  ipcMain.handle(IPC_CHANNELS.AI_SET_CONFIG, (_event, config: Partial<ProviderConfig>) => {
    if (!config || typeof config !== 'object') {
      return aiConfigService.getConfig();
    }
    return aiConfigService.updateConfig(config);
  });

  ipcMain.handle(IPC_CHANNELS.AI_SET_KEY, (_event, providerOrKey: string, maybeKey?: string) => {
    let provider: AIProviderId = 'gemini';
    let key = '';

    if (maybeKey !== undefined) {
      provider = providerOrKey as AIProviderId;
      key = maybeKey;
    } else {
      key = providerOrKey;
    }

    if (typeof key !== 'string') {
      return { success: false, error: 'Invalid key payload type.' };
    }
    return credentialStorageService.saveApiKey(provider, key);
  });

  ipcMain.handle(IPC_CHANNELS.AI_DELETE_KEY, (_event, provider?: AIProviderId) => {
    return credentialStorageService.deleteApiKey(provider || 'gemini');
  });

  ipcMain.handle(IPC_CHANNELS.AI_TEST_PROVIDER, (_event, provider: AIProviderId) => {
    return aiProviderManager.testProvider(provider || 'gemini');
  });

  // Broadcast telemetry update stream every 2 seconds
  const telemetryInterval = setInterval(() => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.TELEMETRY_STREAM, systemService.getTelemetry());
    }
  }, 2000);

  mainWindow.on('closed', () => {
    clearInterval(telemetryInterval);
  });
}
