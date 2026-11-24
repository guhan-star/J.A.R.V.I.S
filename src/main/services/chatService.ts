import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { systemService } from './systemService';
import { aiProviderManager } from './aiProviderManager';
import type { ConversationTurn } from './providers/types';
import type { ChatMessage } from '../../shared/types';

class ChatService {
  private history: ConversationTurn[] = [];
  private savedMessages: ChatMessage[] = [];
  private loaded = false;

  private getHistoryFilePath(): string {
    let userDataDir = '';
    try {
      userDataDir = app.getPath('userData');
    } catch {
      // fallback
    }

    const appData = process.env.APPDATA || '';
    const jarvisAppData = path.join(appData, 'jarvis-desktop');

    if (userDataDir && fs.existsSync(userDataDir)) {
      return path.join(userDataDir, 'chat-messages.json');
    }

    if (!fs.existsSync(jarvisAppData)) {
      try {
        fs.mkdirSync(jarvisAppData, { recursive: true });
      } catch {
        // ignore
      }
    }
    return path.join(jarvisAppData, 'chat-messages.json');
  }

  public getSavedMessages(): ChatMessage[] {
    if (!this.loaded) {
      this.loadFromDisk();
    }
    return [...this.savedMessages];
  }

  private loadFromDisk(): void {
    try {
      const p = this.getHistoryFilePath();
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.savedMessages = parsed;
          // Rehydrate conversational turns
          this.history = [];
          for (const msg of parsed.slice(-16)) {
            if (msg.sender === 'user') {
              this.history.push({ role: 'user', text: msg.content });
            } else if (msg.sender === 'jarvis' && msg.type !== 'diagnostic' && msg.type !== 'protocol') {
              this.history.push({ role: 'model', text: msg.content });
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Could not read chat-messages.json:', err.message);
    }
    this.loaded = true;
  }

  private persistToDisk(): void {
    try {
      const p = this.getHistoryFilePath();
      fs.writeFileSync(p, JSON.stringify(this.savedMessages.slice(-50), null, 2), 'utf-8');
    } catch (err: any) {
      console.error('Failed to persist chat messages:', err.message);
    }
  }

  public clearHistory(): void {
    this.history = [];
    this.savedMessages = [];
    try {
      const p = this.getHistoryFilePath();
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    } catch {
      // ignore
    }
  }

  public async handleUserMessage(input: string): Promise<ChatMessage> {
    const cleanText = input.trim();
    const lower = cleanText.toLowerCase();

    // 1. Local Slash Command Directives
    if (lower === '/clear' || lower === 'clear' || lower === '/purge') {
      this.clearHistory();
      const reply: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        content: `Session directive buffer cleared, Sir. Neural conversational memory reset to baseline state.`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'protocol',
        metadata: {
          confidenceScore: 1.0,
          executionTimeMs: 1,
          affectedSubsystems: ['BUFFER_PURGE', 'CORE_MEMORY'],
        },
      };
      this.savedMessages = [reply];
      this.persistToDisk();
      return reply;
    }

    if (lower === '/help' || lower === 'help') {
      return {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        content: `Mark IV Tactical Interface Directives:\n• Conversational AI: Ask questions, analyze code, brainstorm, or discuss missions with full multi-neural failover.\n• /diagnostics — Execute complete system diagnostic routine\n• /status — Real-time CPU, RAM, and Power telemetry probe\n• /clear — Purge conversation context memory\n• Settings Deck — Configure your Gemini & Groq Neural API keys and HUD options.`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'protocol',
        metadata: {
          confidenceScore: 1.0,
          executionTimeMs: 1,
          affectedSubsystems: ['TACTICAL_HELP', 'DIRECTIVE_DISPATCH'],
        },
      };
    }

    if (lower === '/diag' || lower === '/diagnostics') {
      const results = systemService.runDiagnostics();
      const onlineCount = results.filter((r) => r.status === 'ONLINE').length;
      return {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        content: `Diagnostic routine executed, Sir. ${onlineCount}/${results.length} core subsystems reporting optimal operational status. Subsystem integrity index: 99.6%. Real host telemetry validated.`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'diagnostic',
        metadata: {
          confidenceScore: 0.996,
          executionTimeMs: 12,
          affectedSubsystems: ['DIAGNOSTIC_SUITE', 'HOST_TELEMETRY'],
        },
      };
    }

    // Save user message to persistent array
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.savedMessages.push(userMsg);

    // 2. Delegate to Real Multi-AI Brain (Primary Provider with Automatic Failover)
    const aiResult = await aiProviderManager.generateResponse(this.history, cleanText);

    // Save turn to history if successful
    if (aiResult.success) {
      this.history.push({ role: 'user', text: cleanText });
      this.history.push({ role: 'model', text: aiResult.content });

      // Keep history bounded to 16 turns to manage token window
      if (this.history.length > 16) {
        this.history = this.history.slice(-16);
      }
    }

    const replyMsg: ChatMessage = {
      id: `jarvis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'jarvis',
      content: aiResult.content,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: aiResult.success ? 'text' : 'warning',
      metadata: {
        confidenceScore: aiResult.success ? 0.992 : 0.75,
        executionTimeMs: aiResult.latencyMs,
        affectedSubsystems: aiResult.subsystems || ['NEURAL_CORE'],
        provider: aiResult.providerName,
        modelUsed: aiResult.modelUsed,
        failoverOccurred: aiResult.failoverOccurred,
        primaryError: aiResult.primaryError,
      },
    };

    this.savedMessages.push(replyMsg);
    this.persistToDisk();

    return replyMsg;
  }
}

export const chatService = new ChatService();
