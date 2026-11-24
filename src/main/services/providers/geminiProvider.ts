import type { IAIProvider, ConversationTurn, ProviderExecutionResult } from './types';
import type { TestProviderResult } from '../../../shared/types';

export class GeminiProvider implements IAIProvider {
  public readonly id = 'gemini';
  public readonly displayName = 'Google Gemini';
  public readonly defaultModel = 'gemini-3.8-flash';

  public async generateResponse(
    apiKey: string,
    model: string,
    systemPrompt: string,
    history: ConversationTurn[],
    userMessage: string
  ): Promise<ProviderExecutionResult> {
    const targetModel = model?.trim() || this.defaultModel;

    // Format conversation history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

    const recentHistory = history.slice(-10);
    for (const turn of recentHistory) {
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const maxAttempts = 2;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const status = response.status;
          const apiErrorMsg = (errorData as any)?.error?.message || '';

          if (status === 503 && attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1200 * attempt));
            continue;
          }

          if (status === 429) {
            return {
              success: false,
              statusCode: 429,
              isQuotaError: true,
              rawError: apiErrorMsg,
              content: `Sir, the primary Google Gemini neural uplink has reached bandwidth / quota saturation (HTTP 429). Details: ${apiErrorMsg || 'Quota exceeded'}.`,
              subsystems: ['GEMINI_QUOTA_SATURATION', 'BANDWIDTH_THROTTLE'],
            };
          }

          if (status === 503) {
            return {
              success: false,
              statusCode: 503,
              isTemporaryServerError: true,
              rawError: apiErrorMsg,
              content: `Google Gemini neural cluster capacity alert (HTTP 503): High demand spike. Details: ${apiErrorMsg || 'Service Unavailable'}.`,
              subsystems: ['GEMINI_CAPACITY_SPIKE'],
            };
          }

          if (status === 401 || status === 403) {
            return {
              success: false,
              statusCode: status,
              isAuthError: true,
              rawError: apiErrorMsg,
              content: `Google Gemini authentication failure (HTTP ${status}): The stored API key was rejected. Details: ${apiErrorMsg || 'Access denied'}.`,
              subsystems: ['AUTH_REJECTED'],
            };
          }

          return {
            success: false,
            statusCode: status,
            rawError: apiErrorMsg,
            content: `Google Gemini transmission error (HTTP ${status}): ${apiErrorMsg || 'Service error'}.`,
            subsystems: ['GEMINI_ERROR'],
          };
        }

        const data = (await response.json()) as any;
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          'Directive acknowledged, Sir. No explicit textual data payload was returned by the inference model.';

        return {
          success: true,
          statusCode: 200,
          content: candidateText,
          subsystems: ['GEMINI_NEURAL_UPLINK', 'COGNITIVE_CORE'],
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
            ? 'Google Gemini neural uplink latency timeout (15.0s).'
            : `Google Gemini network connection unreachable: ${err?.message || 'Network anomaly'}.`,
          subsystems: ['NET_ANOMALY'],
        };
      }
    }

    return {
      success: false,
      isTemporaryServerError: true,
      content: `Google Gemini neural uplink retry exhaustion for model '${targetModel}'.`,
      subsystems: ['RETRY_EXHAUSTION'],
    };
  }

  public async testConnection(apiKey: string, model: string): Promise<TestProviderResult> {
    const startTime = performance.now();
    const targetModel = model?.trim() || this.defaultModel;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping test. Reply with one word: READY.' }] }],
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const data = (await response.json()) as any;
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'READY';
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

export const geminiProvider = new GeminiProvider();
