import type { IAIProvider, ConversationTurn, ProviderExecutionResult } from './types';
import type { TestProviderResult } from '../../../shared/types';

export class GroqProvider implements IAIProvider {
  public readonly id = 'groq';
  public readonly displayName = 'Groq Cloud';
  public readonly defaultModel = 'llama-3.3-70b-versatile';

  public async generateResponse(
    apiKey: string,
    model: string,
    systemPrompt: string,
    history: ConversationTurn[],
    userMessage: string
  ): Promise<ProviderExecutionResult> {
    const targetModel = model?.trim() || this.defaultModel;

    // Build OpenAI-compatible chat messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    const recentHistory = history.slice(-10);
    for (const turn of recentHistory) {
      messages.push({
        role: turn.role === 'model' ? 'assistant' : 'user',
        content: turn.text,
      });
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    const requestBody = {
      model: targetModel,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    };

    const maxAttempts = 2;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const status = response.status;
          const apiErrorMsg = (errorData as any)?.error?.message || '';

          if ((status === 503 || status === 500 || status === 502) && attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
            continue;
          }

          if (status === 429) {
            return {
              success: false,
              statusCode: 429,
              isQuotaError: true,
              rawError: apiErrorMsg,
              content: `Sir, Groq Cloud rate limit / token quota exceeded (HTTP 429). Details: ${apiErrorMsg || 'Rate limit reached'}.`,
              subsystems: ['GROQ_RATE_LIMITED'],
            };
          }

          if (status === 401 || status === 403) {
            return {
              success: false,
              statusCode: status,
              isAuthError: true,
              rawError: apiErrorMsg,
              content: `Groq Cloud authorization rejected (HTTP ${status}): Invalid or inactive Groq API key. Details: ${apiErrorMsg || 'Unauthorized'}.`,
              subsystems: ['GROQ_AUTH_FAILURE'],
            };
          }

          if (status >= 500) {
            return {
              success: false,
              statusCode: status,
              isTemporaryServerError: true,
              rawError: apiErrorMsg,
              content: `Groq Cloud infrastructure alert (HTTP ${status}): Remote LPU service unavailable. Details: ${apiErrorMsg || 'Internal server error'}.`,
              subsystems: ['GROQ_SERVER_ERROR'],
            };
          }

          return {
            success: false,
            statusCode: status,
            rawError: apiErrorMsg,
            content: `Groq Cloud transmission error (HTTP ${status}): ${apiErrorMsg || 'Request failed'}.`,
            subsystems: ['GROQ_REQUEST_ERROR'],
          };
        }

        const data = (await response.json()) as any;
        const candidateText =
          data?.choices?.[0]?.message?.content?.trim() ||
          'Directive acknowledged, Sir. Empty content payload returned by Groq LPU engine.';

        return {
          success: true,
          statusCode: 200,
          content: candidateText,
          subsystems: ['GROQ_LPU_UPLINK', 'COGNITIVE_CORE'],
        };
      } catch (err: any) {
        clearTimeout(timeout);
        const isTimeout = err?.name === 'AbortError';

        if (attempt < maxAttempts && !isTimeout) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }

        return {
          success: false,
          isTemporaryServerError: isTimeout,
          rawError: err?.message,
          content: isTimeout
            ? 'Groq Cloud neural uplink latency timeout (15.0s).'
            : `Groq Cloud network connection unreachable: ${err?.message || 'Network anomaly'}.`,
          subsystems: ['NET_ANOMALY'],
        };
      }
    }

    return {
      success: false,
      isTemporaryServerError: true,
      content: `Groq Cloud retry exhaustion for model '${targetModel}'.`,
      subsystems: ['RETRY_EXHAUSTION'],
    };
  }

  public async testConnection(apiKey: string, model: string): Promise<TestProviderResult> {
    const startTime = performance.now();
    const targetModel = model?.trim() || this.defaultModel;

    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Ping test. Reply with one word: READY.' }],
          max_tokens: 10,
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const data = (await response.json()) as any;
        const reply = data?.choices?.[0]?.message?.content?.trim() || 'READY';
        return {
          success: true,
          latencyMs,
          message: `Uplink Verified (HTTP 200). Latency: ${latencyMs}ms. Response: "${reply}"`,
        };
      }

      const errData = await response.json().catch(() => ({}));
      const msg = (errData as any)?.error?.message || `HTTP ${response.status}`;
      return {
        success: false,
        latencyMs,
        message: `Uplink Failed (HTTP ${response.status})`,
        error: msg,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        message: 'Connection Unreachable',
        error: err?.message || 'Host network error',
      };
    }
  }
}

export const groqProvider = new GroqProvider();
