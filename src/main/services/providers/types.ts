import type { AIProviderId, TestProviderResult } from '../../../shared/types';

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ProviderExecutionResult {
  success: boolean;
  content: string;
  statusCode?: number;
  isQuotaError?: boolean;
  isTemporaryServerError?: boolean;
  isAuthError?: boolean;
  subsystems?: string[];
  rawError?: string;
}

export interface IAIProvider {
  readonly id: AIProviderId;
  readonly displayName: string;
  readonly defaultModel: string;

  generateResponse(
    apiKey: string,
    model: string,
    systemPrompt: string,
    history: ConversationTurn[],
    userMessage: string
  ): Promise<ProviderExecutionResult>;

  testConnection(apiKey: string, model: string): Promise<TestProviderResult>;
}
