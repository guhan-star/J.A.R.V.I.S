import { systemService } from './systemService';
import { credentialStorageService } from './credentialStorageService';
import { aiConfigService } from './aiConfigService';
import { geminiProvider } from './providers/geminiProvider';
import { groqProvider } from './providers/groqProvider';
import type { IAIProvider, ConversationTurn } from './providers/types';
import type {
  AIProviderId,
  MultiAIStatus,
  ProviderConfig,
  ProviderStatus,
  TestProviderResult,
} from '../../shared/types';

export interface AIResponse {
  success: boolean;
  content: string;
  latencyMs: number;
  provider: AIProviderId | 'offline_heuristic';
  providerName: string;
  modelUsed: string;
  failoverOccurred?: boolean;
  primaryAttempted?: AIProviderId;
  primaryError?: string;
  subsystems?: string[];
}

class AIProviderManager {
  private providers: Record<AIProviderId, IAIProvider> = {
    gemini: geminiProvider,
    groq: groqProvider,
  };

  private getSystemInstruction(): string {
    const telemetry = systemService.getTelemetry();
    return `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the advanced personal AI assistant inspired by Iron Man, running as a Windows desktop application (Mark IV System).

Key directives:
1. Tone: Refined, highly intelligent, disciplined, witty yet respectful. Address the user as "Sir" (or with equivalent professional courtesy).
2. Brevity & HUD Aesthetic: Keep responses concise, articulate, and direct. Avoid rambling or unsolicited filler paragraphs. Format lists with clear tactical bullet points where appropriate.
3. Live Host Telemetry Awareness:
   - Host machine: ${telemetry.system.hostname} running ${telemetry.system.osVersion} (${telemetry.system.arch})
   - Host CPU: ${telemetry.cpu.model} (${telemetry.cpu.cores} threads), current live load: ${telemetry.cpu.usagePercent}%
   - Host Memory: ${telemetry.memory.usedGB} GB allocated of ${telemetry.memory.totalGB} GB total (${telemetry.memory.freeGB} GB available)
   - Arc Reactor power flux: ${telemetry.system.reactorFluxPercent}% stable
   - System Uptime: ${Math.floor(telemetry.system.uptimeSeconds / 60)} minutes
   - Threat Level: ${telemetry.system.threatLevel} (Perimeter Secure)
   When the user asks about the host, hardware, memory, or system status, reference these real live numbers.
4. Security: Never simulate or encourage dangerous, unauthorized, or destructive behavior.`;
  }

  public getProvider(id: AIProviderId): IAIProvider {
    const p = this.providers[id];
    if (!p) throw new Error(`Unknown AI provider '${id}'`);
    return p;
  }

  public getModelForProvider(id: AIProviderId, config: ProviderConfig): string {
    if (id === 'gemini') {
      return config.geminiModel || this.providers.gemini.defaultModel;
    }
    return config.groqModel || this.providers.groq.defaultModel;
  }

  public getStatus(): MultiAIStatus {
    const config = aiConfigService.getConfig();
    const providersStatus: Record<AIProviderId, ProviderStatus> = {
      gemini: {
        id: 'gemini',
        name: this.providers.gemini.displayName,
        model: this.getModelForProvider('gemini', config),
        ...credentialStorageService.getStorageStatus('gemini'),
      },
      groq: {
        id: 'groq',
        name: this.providers.groq.displayName,
        model: this.getModelForProvider('groq', config),
        ...credentialStorageService.getStorageStatus('groq'),
      },
    };

    return {
      config,
      providers: providersStatus,
    };
  }

  public async generateResponse(
    history: ConversationTurn[],
    userMessage: string
  ): Promise<AIResponse> {
    const startTime = performance.now();
    const config = aiConfigService.getConfig();
    const primaryId = config.primaryProvider || 'gemini';
    const backupId = config.backupProvider;
    const systemPrompt = this.getSystemInstruction();

    const primaryKey = credentialStorageService.getApiKey(primaryId);
    const backupKey = backupId && backupId !== 'none' ? credentialStorageService.getApiKey(backupId) : null;

    // If primary provider has no key configured
    if (!primaryKey) {
      // Check if backup provider has a key and auto-failover is possible
      if (config.autoFailover && backupKey && backupId && backupId !== 'none') {
        const backupProvider = this.getProvider(backupId);
        const backupModel = this.getModelForProvider(backupId, config);
        const result = await backupProvider.generateResponse(
          backupKey,
          backupModel,
          systemPrompt,
          history,
          userMessage
        );
        const latencyMs = Math.round(performance.now() - startTime);

        if (result.success) {
          return {
            success: true,
            content: result.content,
            latencyMs,
            provider: backupId,
            providerName: backupProvider.displayName,
            modelUsed: backupModel,
            failoverOccurred: true,
            primaryAttempted: primaryId,
            primaryError: `Primary provider (${primaryId}) has no API key configured.`,
            subsystems: ['AUTOMATIC_FAILOVER_ENGAGED', 'SECONDARY_UPLINK_ACTIVE', ...(result.subsystems || [])],
          };
        }
      }

      // Neither available
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        provider: 'offline_heuristic',
        providerName: 'Auxiliary Heuristics',
        modelUsed: 'none',
        content: `Sir, the primary neural brain (${this.getProvider(primaryId).displayName}) is disconnected. An active credential is required in Settings to engage full cognitive inference.\n\nStanding by on auxiliary heuristic protocols.`,
        latencyMs,
        subsystems: ['NEURAL_CORE_OFFLINE', 'HEURISTIC_BACKUP'],
      };
    }

    // Step 1: Send request to primary provider
    const primaryProvider = this.getProvider(primaryId);
    const primaryModel = this.getModelForProvider(primaryId, config);

    const primaryResult = await primaryProvider.generateResponse(
      primaryKey,
      primaryModel,
      systemPrompt,
      history,
      userMessage
    );

    // If primary succeeds, return immediately
    if (primaryResult.success) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        content: primaryResult.content,
        latencyMs,
        provider: primaryId,
        providerName: primaryProvider.displayName,
        modelUsed: primaryModel,
        subsystems: primaryResult.subsystems,
      };
    }

    // Step 2: Evaluate failover condition
    const isFailoverTrigger =
      primaryResult.isQuotaError ||
      primaryResult.isTemporaryServerError ||
      primaryResult.statusCode === 429 ||
      primaryResult.statusCode === 503 ||
      primaryResult.statusCode === 500;

    const canFailover =
      config.autoFailover &&
      isFailoverTrigger &&
      backupId &&
      backupId !== 'none' &&
      backupKey;

    if (canFailover) {
      const backupProvider = this.getProvider(backupId);
      const backupModel = this.getModelForProvider(backupId, config);

      const backupResult = await backupProvider.generateResponse(
        backupKey,
        backupModel,
        systemPrompt,
        history,
        userMessage
      );

      const latencyMs = Math.round(performance.now() - startTime);

      if (backupResult.success) {
        return {
          success: true,
          content: backupResult.content,
          latencyMs,
          provider: backupId,
          providerName: backupProvider.displayName,
          modelUsed: backupModel,
          failoverOccurred: true,
          primaryAttempted: primaryId,
          primaryError: primaryResult.content,
          subsystems: [
            'AUTOMATIC_FAILOVER_ENGAGED',
            `BACKUP_${backupId.toUpperCase()}_ENGAGED`,
            ...(backupResult.subsystems || []),
          ],
        };
      }

      // Both failed: Return honest dual-failure error report
      return {
        success: false,
        content: `Sir, both neural uplinks experienced critical connectivity issues:\n\n• Primary (${primaryProvider.displayName}): ${primaryResult.content}\n• Secondary Backup (${backupProvider.displayName}): ${backupResult.content}\n\nBoth cognitive streams have been throttled. Standing by on auxiliary host diagnostics.`,
        latencyMs,
        provider: primaryId,
        providerName: primaryProvider.displayName,
        modelUsed: primaryModel,
        failoverOccurred: true,
        primaryAttempted: primaryId,
        primaryError: primaryResult.content,
        subsystems: ['DUAL_NEURAL_SATURATION', 'TACTICAL_ALERT'],
      };
    }

    // No failover: Return primary error directly
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      content: primaryResult.content,
      latencyMs,
      provider: primaryId,
      providerName: primaryProvider.displayName,
      modelUsed: primaryModel,
      subsystems: primaryResult.subsystems || ['UPLINK_ANOMALY'],
    };
  }

  public async testProvider(providerId: AIProviderId): Promise<TestProviderResult> {
    const key = credentialStorageService.getApiKey(providerId);
    if (!key) {
      return {
        success: false,
        latencyMs: 0,
        message: 'No Credential Configured',
        error: `Please save an encrypted ${this.getProvider(providerId).displayName} API key first.`,
      };
    }

    const config = aiConfigService.getConfig();
    const model = this.getModelForProvider(providerId, config);
    return await this.getProvider(providerId).testConnection(key, model);
  }
}

export const aiProviderManager = new AIProviderManager();
