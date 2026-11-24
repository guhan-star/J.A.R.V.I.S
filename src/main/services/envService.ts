import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { credentialStorageService, type SaveKeyResult } from './credentialStorageService';

class EnvService {
  private envPath: string;

  constructor() {
    const rootPath = app?.isPackaged
      ? path.join(app.getPath('userData'), '.env')
      : path.join(process.cwd(), '.env');
    this.envPath = rootPath;
    this.loadEnv();
  }

  public loadEnv(): void {
    try {
      const candidatePaths = [
        this.envPath,
        path.join(process.cwd(), '.env'),
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf-8');
          this.parseEnv(content);
          this.envPath = p;
          break;
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  private parseEnv(content: string): void {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx > 0) {
        const key = trimmed.substring(0, equalsIdx).trim();
        let value = trimmed.substring(equalsIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        // Only load non-secret configuration like models into process.env
        if (key !== 'GEMINI_API_KEY' && key !== 'GROQ_API_KEY' && !process.env[key] && value) {
          process.env[key] = value;
        }
      }
    }
  }

  public getApiKey(provider: import('../../shared/types').AIProviderId = 'gemini'): string | null {
    return credentialStorageService.getApiKey(provider);
  }

  public getModel(): string {
    return process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
  }

  public setApiKey(provider: import('../../shared/types').AIProviderId, apiKey: string): SaveKeyResult {
    return credentialStorageService.saveApiKey(provider, apiKey);
  }

  public deleteApiKey(provider: import('../../shared/types').AIProviderId = 'gemini'): boolean {
    return credentialStorageService.deleteApiKey(provider);
  }
}

export const envService = new EnvService();
