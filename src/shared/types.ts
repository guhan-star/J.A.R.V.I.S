/**
 * J.A.R.V.I.S. Shared Contract Types
 * Used across Electron Main, Preload bridge, and React Renderer.
 */

export interface SystemTelemetry {
  cpu: {
    usagePercent: number;
    model: string;
    cores: number;
    speedMHz: number;
    isRealHardware: boolean;
  };
  memory: {
    totalGB: number;
    usedGB: number;
    freeGB: number;
    usagePercent: number;
    isRealHardware: boolean;
  };
  battery: {
    percent: number;
    isCharging: boolean;
    powerState: 'AC_POWER' | 'BATTERY_OPTIMAL' | 'BATTERY_LOW' | 'SIMULATED_ARC_CELL';
    timeRemainingMinutes?: number;
    isRealHardware: boolean;
  };
  system: {
    platform: string;
    arch: string;
    hostname: string;
    uptimeSeconds: number;
    osVersion: string;
    protocolState: 'OPTIMAL' | 'ELEVATED' | 'DEFENSE' | 'DIAGNOSTIC';
    threatLevel: 'DEFCON 5' | 'DEFCON 4' | 'DEFCON 3';
    reactorFluxPercent: number;
  };
  timestamp: number;
}

export type CoreVisualState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  content: string;
  timestamp: string;
  type?: 'text' | 'protocol' | 'diagnostic' | 'warning';
  metadata?: {
    confidenceScore?: number;
    executionTimeMs?: number;
    affectedSubsystems?: string[];
    provider?: string;
    modelUsed?: string;
    failoverOccurred?: boolean;
    primaryError?: string;
  };
}

export interface WindowControlPayload {
  action: 'minimize' | 'maximize' | 'close' | 'is-maximized';
}

export interface DiagnosticResult {
  subsystem: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  integrity: number;
  detail: string;
}

export type AIProviderId = 'gemini' | 'groq';

export interface ProviderConfig {
  primaryProvider: AIProviderId;
  backupProvider: AIProviderId | 'none';
  autoFailover: boolean;
  geminiModel: string;
  groqModel: string;
}

export interface ProviderStatus {
  id: AIProviderId;
  name: string;
  model: string;
  hasKey: boolean;
  maskedKey: string | null;
  isEncrypted: boolean;
  storageType: 'WINDOWS_DPAPI' | 'NONE';
}

export interface MultiAIStatus {
  config: ProviderConfig;
  providers: Record<AIProviderId, ProviderStatus>;
}

export interface TestProviderResult {
  success: boolean;
  latencyMs: number;
  message: string;
  error?: string;
}

export interface SetKeyResult {
  success: boolean;
  error?: string;
}

export interface JarvisAPI {
  // Window Operations
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;

  // Telemetry Operations
  getSystemTelemetry: () => Promise<SystemTelemetry>;
  onTelemetryUpdate: (callback: (telemetry: SystemTelemetry) => void) => () => void;

  // AI Assistant Operations
  sendMessage: (text: string) => Promise<ChatMessage>;
  clearChatHistory: () => Promise<void>;
  getChatHistory: () => Promise<ChatMessage[]>;
  runDiagnostic: () => Promise<DiagnosticResult[]>;
  getAppInfo: () => Promise<{ name: string; version: string; electronVersion: string }>;

  // AI Neural Link Status & Configuration
  getAIStatus: () => Promise<MultiAIStatus>;
  setAIConfig: (config: Partial<ProviderConfig>) => Promise<ProviderConfig>;
  setApiKey: (provider: AIProviderId, key: string) => Promise<SetKeyResult>;
  deleteApiKey: (provider: AIProviderId) => Promise<boolean>;
  testProvider: (provider: AIProviderId) => Promise<TestProviderResult>;
}

declare global {
  interface Window {
    jarvisAPI: JarvisAPI;
  }
}
