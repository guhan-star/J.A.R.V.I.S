import { app, safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { AIProviderId, SetKeyResult as SaveKeyResult } from '../../shared/types';

export interface StorageStatus {
  hasKey: boolean;
  isEncrypted: boolean;
  storageType: 'WINDOWS_DPAPI' | 'NONE';
  maskedKey: string | null;
}

export { SaveKeyResult };

interface VaultPayload {
  version: number;
  credentials: Partial<Record<AIProviderId, string>>;
}

class CredentialStorageService {
  private inMemoryKeys: Partial<Record<AIProviderId, string>> = {};

  public getVaultPath(): string {
    let userDataDir = '';
    try {
      userDataDir = app.getPath('userData');
    } catch {
      // fallback
    }

    // Ensure we check jarvis-desktop AppData folder if running standalone or dev
    const appData = process.env.APPDATA || '';
    const jarvisAppData = path.join(appData, 'jarvis-desktop');

    if (fs.existsSync(path.join(jarvisAppData, 'credentials.enc'))) {
      userDataDir = jarvisAppData;
    } else if (!userDataDir) {
      userDataDir = jarvisAppData;
    }

    if (!fs.existsSync(userDataDir)) {
      try {
        fs.mkdirSync(userDataDir, { recursive: true });
      } catch (err: any) {
        throw new Error(`Failed to initialize secure storage directory: ${err.message}`);
      }
    }
    return path.join(userDataDir, 'credentials.enc');
  }

  /**
   * Checks if Electron safeStorage DPAPI encryption is available
   */
  public isEncryptionAvailable(): boolean {
    try {
      return typeof safeStorage !== 'undefined' && safeStorage.isEncryptionAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Internal reader: Decrypts vault file and returns the credentials dictionary.
   * Seamlessly handles automatic migration from legacy single-string format.
   */
  private readVault(): Partial<Record<AIProviderId, string>> {
    try {
      const vaultPath = this.getVaultPath();
      if (!fs.existsSync(vaultPath)) {
        return {};
      }

      if (!this.isEncryptionAvailable()) {
        console.error('Cannot decrypt credential: safeStorage encryption is unavailable on this system.');
        return {};
      }

      const encryptedBuffer = fs.readFileSync(vaultPath);
      if (!encryptedBuffer || encryptedBuffer.length === 0) {
        return {};
      }

      const decrypted = safeStorage.decryptString(encryptedBuffer);
      if (!decrypted || !decrypted.trim()) {
        return {};
      }

      const trimmed = decrypted.trim();

      // Check if it's the new JSON multi-key schema
      try {
        const parsed = JSON.parse(trimmed) as VaultPayload;
        if (parsed && typeof parsed === 'object' && parsed.credentials) {
          return parsed.credentials;
        }
      } catch {
        // Not JSON - this is a legacy raw Gemini key. Migrate it to v2 schema!
      }

      // Legacy string migration
      const migrated: Partial<Record<AIProviderId, string>> = { gemini: trimmed };
      this.writeVault(migrated);
      return migrated;
    } catch (err: any) {
      console.error('Error reading encrypted vault:', err.message);
      return {};
    }
  }

  /**
   * Internal writer: Encrypts the entire credentials dictionary with safeStorage DPAPI
   */
  private writeVault(credentials: Partial<Record<AIProviderId, string>>): boolean {
    if (!this.isEncryptionAvailable()) {
      return false;
    }

    const payload: VaultPayload = {
      version: 2,
      credentials,
    };

    const jsonStr = JSON.stringify(payload);
    const encryptedBuffer = safeStorage.encryptString(jsonStr);
    const vaultPath = this.getVaultPath();
    fs.writeFileSync(vaultPath, encryptedBuffer);
    return true;
  }

  /**
   * Retrieves the active API key for a specified provider (defaults to 'gemini')
   */
  public getApiKey(provider: AIProviderId = 'gemini'): string | null {
    if (this.inMemoryKeys[provider]) {
      return this.inMemoryKeys[provider] || null;
    }

    const allKeys = this.readVault();
    const key = allKeys[provider]?.trim();
    if (key) {
      this.inMemoryKeys[provider] = key;
      return key;
    }

    return null;
  }

  /**
   * Encrypts and saves the API key for a specified provider using safeStorage DPAPI.
   * Strictly avoids storing plaintext credentials on disk.
   */
  public saveApiKey(provider: AIProviderId, apiKey: string): SaveKeyResult {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return { success: false, error: 'API key cannot be empty or whitespace.' };
    }

    if (!this.isEncryptionAvailable()) {
      return {
        success: false,
        error: 'Windows DPAPI encryption (safeStorage) is not available on this system.',
      };
    }

    try {
      const allKeys = this.readVault();
      allKeys[provider] = cleanKey;

      const ok = this.writeVault(allKeys);
      if (!ok) {
        return { success: false, error: 'Encryption failed.' };
      }

      this.inMemoryKeys[provider] = cleanKey;
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to encrypt and store credential: ${err.message || 'Filesystem error'}`,
      };
    }
  }

  /**
   * Purges the stored encrypted credential for a specified provider
   */
  public deleteApiKey(provider: AIProviderId = 'gemini'): boolean {
    delete this.inMemoryKeys[provider];

    try {
      const allKeys = this.readVault();
      delete allKeys[provider];

      const remainingKeys = Object.keys(allKeys).filter((k) => !!allKeys[k as AIProviderId]);

      if (remainingKeys.length === 0) {
        // No credentials remain, delete the vault file
        const vaultPath = this.getVaultPath();
        if (fs.existsSync(vaultPath)) {
          fs.unlinkSync(vaultPath);
        }
      } else {
        // Rewrite updated vault without deleted provider
        this.writeVault(allKeys);
      }
      return true;
    } catch (err: any) {
      console.error(`Failed to purge credential for ${provider}:`, err.message);
      return false;
    }
  }

  /**
   * Reports storage status for a specific provider without revealing the key
   */
  public getStorageStatus(provider: AIProviderId = 'gemini'): StorageStatus {
    const key = this.getApiKey(provider);
    let hasVaultFile = false;

    try {
      hasVaultFile = fs.existsSync(this.getVaultPath());
    } catch {
      hasVaultFile = false;
    }

    const isEncrypted = hasVaultFile && this.isEncryptionAvailable();
    const storageType: StorageStatus['storageType'] = isEncrypted ? 'WINDOWS_DPAPI' : 'NONE';

    let maskedKey: string | null = null;
    if (key && key.length > 8) {
      maskedKey = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    } else if (key) {
      maskedKey = '****';
    }

    return {
      hasKey: !!key,
      isEncrypted,
      storageType,
      maskedKey,
    };
  }
}

export const credentialStorageService = new CredentialStorageService();
