import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { ProviderConfig, AIProviderId } from '../../shared/types';

const DEFAULT_CONFIG: ProviderConfig = {
  primaryProvider: 'gemini',
  backupProvider: 'groq',
  autoFailover: true,
  geminiModel: 'gemini-3.8-flash',
  groqModel: 'llama-3.3-70b-versatile',
};

class AIConfigService {
  private config: ProviderConfig = { ...DEFAULT_CONFIG };
  private configLoaded = false;

  private getConfigPath(): string {
    let userDataDir = '';
    try {
      userDataDir = app.getPath('userData');
    } catch {
      // fallback
    }

    const appData = process.env.APPDATA || '';
    const jarvisAppData = path.join(appData, 'jarvis-desktop');

    if (userDataDir && fs.existsSync(userDataDir)) {
      return path.join(userDataDir, 'ai-config.json');
    }

    if (!fs.existsSync(jarvisAppData)) {
      try {
        fs.mkdirSync(jarvisAppData, { recursive: true });
      } catch {
        // ignore
      }
    }
    return path.join(jarvisAppData, 'ai-config.json');
  }

  public getConfig(): ProviderConfig {
    if (!this.configLoaded) {
      this.loadConfig();
    }
    return { ...this.config };
  }

  public loadConfig(): void {
    try {
      const configPath = this.getConfigPath();
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsed,
        };
      }
    } catch (err: any) {
      console.warn('Could not read ai-config.json, using defaults:', err.message);
    }
    this.configLoaded = true;
  }

  public updateConfig(partial: Partial<ProviderConfig>): ProviderConfig {
    this.config = {
      ...this.getConfig(),
      ...partial,
    };

    try {
      const configPath = this.getConfigPath();
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('Failed to save ai-config.json:', err.message);
    }

    return { ...this.config };
  }
}

export const aiConfigService = new AIConfigService();
