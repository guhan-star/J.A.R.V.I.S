import { contextBridge, ipcRenderer } from 'electron';
import type {
  JarvisAPI,
  SystemTelemetry,
  ChatMessage,
  DiagnosticResult,
  MultiAIStatus,
  ProviderConfig,
  SetKeyResult,
  TestProviderResult,
  AIProviderId,
} from '../shared/types';

// Inlined IPC channel constants for strict sandboxed preload compatibility
// (Sandboxed preloads cannot use relative CommonJS requires)
const IPC = {
  WINDOW_MINIMIZE: 'jarvis:window:minimize',
  WINDOW_MAXIMIZE: 'jarvis:window:maximize',
  WINDOW_CLOSE: 'jarvis:window:close',
  WINDOW_IS_MAXIMIZED: 'jarvis:window:is-maximized',

  TELEMETRY_GET: 'jarvis:telemetry:get',
  TELEMETRY_STREAM: 'jarvis:telemetry:stream',

  CHAT_SEND: 'jarvis:chat:send',
  CHAT_CLEAR: 'jarvis:chat:clear',
  CHAT_GET_HISTORY: 'jarvis:chat:get-history',
  DIAGNOSTIC_RUN: 'jarvis:diagnostic:run',
  APP_INFO: 'jarvis:app:info',

  AI_STATUS: 'jarvis:ai:status',
  AI_SET_CONFIG: 'jarvis:ai:set-config',
  AI_SET_KEY: 'jarvis:ai:set-key',
  AI_DELETE_KEY: 'jarvis:ai:delete-key',
  AI_TEST_PROVIDER: 'jarvis:ai:test-provider',
} as const;

const api: JarvisAPI = {
  minimize: async () => {
    await ipcRenderer.invoke(IPC.WINDOW_MINIMIZE);
  },
  maximize: async () => {
    await ipcRenderer.invoke(IPC.WINDOW_MAXIMIZE);
  },
  close: async () => {
    await ipcRenderer.invoke(IPC.WINDOW_CLOSE);
  },
  isMaximized: async () => {
    return await ipcRenderer.invoke(IPC.WINDOW_IS_MAXIMIZED);
  },

  getSystemTelemetry: async (): Promise<SystemTelemetry> => {
    return await ipcRenderer.invoke(IPC.TELEMETRY_GET);
  },
  onTelemetryUpdate: (callback: (telemetry: SystemTelemetry) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, telemetry: SystemTelemetry) => {
      callback(telemetry);
    };
    ipcRenderer.on(IPC.TELEMETRY_STREAM, subscription);
    return () => {
      ipcRenderer.removeListener(IPC.TELEMETRY_STREAM, subscription);
    };
  },

  sendMessage: async (text: string): Promise<ChatMessage> => {
    return await ipcRenderer.invoke(IPC.CHAT_SEND, text);
  },
  clearChatHistory: async (): Promise<void> => {
    await ipcRenderer.invoke(IPC.CHAT_CLEAR);
  },
  getChatHistory: async (): Promise<ChatMessage[]> => {
    return await ipcRenderer.invoke(IPC.CHAT_GET_HISTORY);
  },
  runDiagnostic: async (): Promise<DiagnosticResult[]> => {
    return await ipcRenderer.invoke(IPC.DIAGNOSTIC_RUN);
  },
  getAppInfo: async () => {
    return await ipcRenderer.invoke(IPC.APP_INFO);
  },

  getAIStatus: async (): Promise<MultiAIStatus> => {
    return await ipcRenderer.invoke(IPC.AI_STATUS);
  },
  setAIConfig: async (config: Partial<ProviderConfig>): Promise<ProviderConfig> => {
    return await ipcRenderer.invoke(IPC.AI_SET_CONFIG, config);
  },
  setApiKey: async (provider: AIProviderId, key: string): Promise<SetKeyResult> => {
    return await ipcRenderer.invoke(IPC.AI_SET_KEY, provider, key);
  },
  deleteApiKey: async (provider: AIProviderId): Promise<boolean> => {
    return await ipcRenderer.invoke(IPC.AI_DELETE_KEY, provider);
  },
  testProvider: async (provider: AIProviderId): Promise<TestProviderResult> => {
    return await ipcRenderer.invoke(IPC.AI_TEST_PROVIDER, provider);
  },
};

// Secure bridge exposure into the renderer's main world
contextBridge.exposeInMainWorld('jarvisAPI', api);
