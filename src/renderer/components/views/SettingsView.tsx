import React, { useState, useEffect } from 'react';
import {
  Settings,
  Volume2,
  Monitor,
  Shield,
  Info,
  Check,
  Key,
  Sparkles,
  RefreshCw,
  Lock,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Activity,
  ArrowRightLeft,
  Zap,
} from 'lucide-react';
import { soundFx } from '../common/AudioSynthesizer';
import type { MultiAIStatus, AIProviderId, ProviderConfig, TestProviderResult } from '@shared/types';

interface SettingsViewProps {
  scanlinesEnabled: boolean;
  onToggleScanlines: (enabled: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  scanlinesEnabled,
  onToggleScanlines,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(!soundFx.getMuted());
  const [appInfo, setAppInfo] = useState({
    name: 'J.A.R.V.I.S. Desktop',
    version: '1.0.0',
    electronVersion: 'v35.x',
  });

  const [aiStatus, setAiStatus] = useState<MultiAIStatus>({
    config: {
      primaryProvider: 'gemini',
      backupProvider: 'groq',
      autoFailover: true,
      geminiModel: 'gemini-3.8-flash',
      groqModel: 'llama-3.3-70b-versatile',
    },
    providers: {
      gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        model: 'gemini-3.8-flash',
        hasKey: false,
        maskedKey: null,
        isEncrypted: false,
        storageType: 'NONE',
      },
      groq: {
        id: 'groq',
        name: 'Groq Cloud',
        model: 'llama-3.3-70b-versatile',
        hasKey: false,
        maskedKey: null,
        isEncrypted: false,
        storageType: 'NONE',
      },
    },
  });

  const [inputKeys, setInputKeys] = useState<Record<AIProviderId, string>>({
    gemini: '',
    groq: '',
  });

  const [saveStatuses, setSaveStatuses] = useState<
    Record<AIProviderId, 'idle' | 'saving' | 'saved' | 'error'>
  >({
    gemini: 'idle',
    groq: 'idle',
  });

  const [errorMessages, setErrorMessages] = useState<Record<AIProviderId, string | null>>({
    gemini: null,
    groq: null,
  });

  const [purgeStatuses, setPurgeStatuses] = useState<Record<AIProviderId, string | null>>({
    gemini: null,
    groq: null,
  });

  const [testResults, setTestResults] = useState<
    Record<AIProviderId, { testing: boolean; result?: TestProviderResult }>
  >({
    gemini: { testing: false },
    groq: { testing: false },
  });

  const fetchAIStatus = async () => {
    try {
      if (window.jarvisAPI?.getAIStatus) {
        const status = await window.jarvisAPI.getAIStatus();
        if (status && status.providers && status.config) {
          setAiStatus(status);
        }
      }
    } catch (err) {
      console.error('Failed to query AI status:', err);
    }
  };

  useEffect(() => {
    if (window.jarvisAPI?.getAppInfo) {
      window.jarvisAPI.getAppInfo().then(setAppInfo).catch(() => {});
    }
    fetchAIStatus();
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setMuted(!next);
    if (next) soundFx.playClick();
  };

  const handleToggleScan = () => {
    soundFx.playClick();
    onToggleScanlines(!scanlinesEnabled);
  };

  const handleUpdateConfig = async (partial: Partial<ProviderConfig>) => {
    soundFx.playClick();
    try {
      if (window.jarvisAPI?.setAIConfig) {
        const updated = await window.jarvisAPI.setAIConfig(partial);
        setAiStatus((prev) => ({
          ...prev,
          config: updated,
        }));
      }
    } catch (err) {
      console.error('Failed to update AI config:', err);
    }
  };

  const handleSaveKey = async (provider: AIProviderId, e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKeys[provider].trim();
    if (!cleanKey || saveStatuses[provider] === 'saving') return;

    setSaveStatuses((prev) => ({ ...prev, [provider]: 'saving' }));
    setErrorMessages((prev) => ({ ...prev, [provider]: null }));
    soundFx.playClick();

    try {
      if (!window.jarvisAPI?.setApiKey) {
        throw new Error('IPC Bridge unavailable.');
      }

      const result = await window.jarvisAPI.setApiKey(provider, cleanKey);
      if (result && result.success) {
        setSaveStatuses((prev) => ({ ...prev, [provider]: 'saved' }));
        soundFx.playMessageChime();
        setInputKeys((prev) => ({ ...prev, [provider]: '' }));
        await fetchAIStatus();
        setTimeout(() => {
          setSaveStatuses((prev) => ({ ...prev, [provider]: 'idle' }));
        }, 3000);
      } else {
        setSaveStatuses((prev) => ({ ...prev, [provider]: 'error' }));
        setErrorMessages((prev) => ({
          ...prev,
          [provider]: result?.error || 'Failed to encrypt credential with Windows DPAPI.',
        }));
      }
    } catch (err: any) {
      setSaveStatuses((prev) => ({ ...prev, [provider]: 'error' }));
      setErrorMessages((prev) => ({
        ...prev,
        [provider]: err?.message || 'Error communicating with Electron main process.',
      }));
    } finally {
      setTimeout(() => {
        setSaveStatuses((prev) => (prev[provider] === 'error' ? { ...prev, [provider]: 'idle' } : prev));
      }, 4000);
    }
  };

  const handlePurgeKey = async (provider: AIProviderId) => {
    soundFx.playClick();
    try {
      if (window.jarvisAPI?.deleteApiKey) {
        const ok = await window.jarvisAPI.deleteApiKey(provider);
        if (ok) {
          setPurgeStatuses((prev) => ({ ...prev, [provider]: 'CREDENTIAL PURGED' }));
          await fetchAIStatus();
          setTimeout(() => {
            setPurgeStatuses((prev) => ({ ...prev, [provider]: null }));
          }, 3000);
        }
      }
    } catch {
      setPurgeStatuses((prev) => ({ ...prev, [provider]: 'PURGE FAILED' }));
      setTimeout(() => {
        setPurgeStatuses((prev) => ({ ...prev, [provider]: null }));
      }, 3000);
    }
  };

  const handleTestConnection = async (provider: AIProviderId) => {
    soundFx.playClick();
    setTestResults((prev) => ({
      ...prev,
      [provider]: { testing: true },
    }));

    try {
      if (!window.jarvisAPI?.testProvider) {
        throw new Error('testProvider IPC channel not available.');
      }
      const res = await window.jarvisAPI.testProvider(provider);
      setTestResults((prev) => ({
        ...prev,
        [provider]: { testing: false, result: res },
      }));
      if (res.success) {
        soundFx.playMessageChime();
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          testing: false,
          result: {
            success: false,
            latencyMs: 0,
            message: 'Probe Error',
            error: err?.message || 'Diagnostic failed',
          },
        },
      }));
    }
  };

  const gemini = aiStatus.providers.gemini;
  const groq = aiStatus.providers.groq;
  const config = aiStatus.config;

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        backgroundColor: 'rgba(3, 7, 13, 0.5)',
      }}
    >
      {/* Header */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '18px 22px',
          border: '1px solid rgba(0, 243, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#00f3ff" />
            <h2
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: '18px',
                fontWeight: 800,
                color: '#e6f9ff',
                letterSpacing: '1.5px',
              }}
            >
              SYSTEM CONFIGURATION & PREFERENCES
            </h2>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-rajdhani)',
              fontSize: '14px',
              color: '#6aa3bd',
              marginTop: '4px',
            }}
          >
            Manage Multi-AI Neural Uplinks, automatic failover orchestration, and Windows DPAPI credential vaults.
          </p>
        </div>
      </div>

      {/* Main Multi-AI Neural Deck */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '20px',
          backgroundColor: 'rgba(6, 14, 25, 0.85)',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 0 16px rgba(0, 243, 255, 0.08)',
        }}
      >
        {/* Deck Header & Failover Master Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
              }}
            >
              <Zap size={18} color="#00f3ff" />
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '14px', color: '#e6f9ff', letterSpacing: '1px' }}>
                MULTI-AI NEURAL ARCHITECTURE
              </h4>
              <p style={{ fontFamily: 'var(--font-rajdhani)', fontSize: '13px', color: '#7ba9c2', marginTop: '2px' }}>
                Primary cognition core with automatic secondary failover on HTTP 429 quota exhaustion or server spikes.
              </p>
            </div>
          </div>

          {/* Master Routing Configuration Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Primary Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6ba4c4' }}>PRIMARY:</span>
              <select
                value={config.primaryProvider}
                onChange={(e) => handleUpdateConfig({ primaryProvider: e.target.value as AIProviderId })}
                style={{
                  background: 'rgba(3, 8, 16, 0.9)',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  color: '#00f3ff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="gemini">Google Gemini</option>
                <option value="groq">Groq Cloud</option>
              </select>
            </div>

            {/* Backup Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6ba4c4' }}>BACKUP:</span>
              <select
                value={config.backupProvider}
                onChange={(e) => handleUpdateConfig({ backupProvider: e.target.value as AIProviderId | 'none' })}
                style={{
                  background: 'rgba(3, 8, 16, 0.9)',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  color: '#00f3ff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="groq">Groq Cloud</option>
                <option value="gemini">Google Gemini</option>
                <option value="none">None (Disabled)</option>
              </select>
            </div>

            {/* Auto-Failover Toggle */}
            <button
              onClick={() => handleUpdateConfig({ autoFailover: !config.autoFailover })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '3px',
                backgroundColor: config.autoFailover ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 42, 75, 0.15)',
                border: config.autoFailover ? '1px solid #00ffaa' : '1px solid #ff2a4b',
                color: config.autoFailover ? '#00ffaa' : '#ff2a4b',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              <ArrowRightLeft size={12} />
              <span>AUTO-FAILOVER: {config.autoFailover ? 'ENABLED' : 'DISABLED'}</span>
            </button>
          </div>
        </div>

        {/* Dual Provider Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* 1. GOOGLE GEMINI CARD */}
          <div
            className="hud-panel hud-corner-cut-sm"
            style={{
              padding: '16px',
              backgroundColor: 'rgba(3, 8, 16, 0.7)',
              border:
                config.primaryProvider === 'gemini'
                  ? '1px solid rgba(0, 243, 255, 0.4)'
                  : '1px solid rgba(0, 243, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Top Row: Provider identity, Role tag & Connection Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color={gemini.hasKey ? '#00ffaa' : '#ffaa00'} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '12px', fontWeight: 700, color: '#e6f9ff' }}>
                      GOOGLE GEMINI
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '2px',
                        backgroundColor: config.primaryProvider === 'gemini' ? 'rgba(0, 243, 255, 0.15)' : 'rgba(120, 150, 170, 0.15)',
                        color: config.primaryProvider === 'gemini' ? '#00f3ff' : '#88b0c4',
                        border: config.primaryProvider === 'gemini' ? '1px solid #00f3ff' : '1px solid #507085',
                      }}
                    >
                      {config.primaryProvider === 'gemini' ? 'PRIMARY' : config.backupProvider === 'gemini' ? 'BACKUP' : 'STANDBY'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#689bb3' }}>
                    Model: {gemini.model}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: gemini.hasKey ? 'rgba(0, 255, 170, 0.12)' : 'rgba(255, 170, 0, 0.12)',
                  border: gemini.hasKey ? '1px solid #00ffaa' : '1px solid #ffaa00',
                  color: gemini.hasKey ? '#00ffaa' : '#ffaa00',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                }}
              >
                {gemini.hasKey ? 'CONNECTED' : 'KEY REQUIRED'}
              </span>
            </div>

            {/* Credential Status Row */}
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'rgba(2, 5, 10, 0.6)',
                border: '1px solid rgba(0, 243, 255, 0.1)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={12} color="#00f3ff" />
                <span style={{ color: '#689bb3' }}>VAULT:</span>
                <span style={{ color: gemini.hasKey ? '#00ffaa' : '#ffaa00' }}>
                  {gemini.maskedKey ? `MASKED (${gemini.maskedKey})` : 'UNCONFIGURED'}
                </span>
              </div>

              {gemini.hasKey && (
                <button
                  type="button"
                  onClick={() => handlePurgeKey('gemini')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff2a4b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <Trash2 size={11} />
                  <span>{purgeStatuses.gemini || 'PURGE'}</span>
                </button>
              )}
            </div>

            {/* Key Input Form */}
            <form onSubmit={(e) => handleSaveKey('gemini', e)} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={inputKeys.gemini}
                onChange={(e) => setInputKeys((prev) => ({ ...prev, gemini: e.target.value }))}
                disabled={saveStatuses.gemini === 'saving'}
                placeholder="Paste Gemini API Key (AIzaSy...)"
                style={{
                  flex: 1,
                  background: 'rgba(2, 5, 10, 0.8)',
                  border: errorMessages.gemini ? '1px solid #ff2a4b' : '1px solid rgba(0, 243, 255, 0.25)',
                  padding: '6px 10px',
                  borderRadius: '3px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!inputKeys.gemini.trim() || saveStatuses.gemini === 'saving'}
                style={{
                  padding: '6px 12px',
                  borderRadius: '3px',
                  backgroundColor:
                    saveStatuses.gemini === 'saved'
                      ? 'rgba(0, 255, 170, 0.2)'
                      : saveStatuses.gemini === 'error'
                      ? 'rgba(255, 42, 75, 0.2)'
                      : inputKeys.gemini.trim()
                      ? 'rgba(0, 243, 255, 0.2)'
                      : 'rgba(0, 243, 255, 0.05)',
                  border:
                    saveStatuses.gemini === 'saved'
                      ? '1px solid #00ffaa'
                      : saveStatuses.gemini === 'error'
                      ? '1px solid #ff2a4b'
                      : inputKeys.gemini.trim()
                      ? '1px solid #00f3ff'
                      : '1px solid rgba(0, 243, 255, 0.15)',
                  color:
                    saveStatuses.gemini === 'saved'
                      ? '#00ffaa'
                      : saveStatuses.gemini === 'error'
                      ? '#ff2a4b'
                      : inputKeys.gemini.trim()
                      ? '#e6f9ff'
                      : '#496f82',
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: inputKeys.gemini.trim() && saveStatuses.gemini !== 'saving' ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {saveStatuses.gemini === 'saving' && <RefreshCw size={11} className="animate-spin-slow" />}
                {saveStatuses.gemini === 'saved' && <Check size={11} color="#00ffaa" />}
                <span>
                  {saveStatuses.gemini === 'saved'
                    ? 'ENCRYPTED'
                    : saveStatuses.gemini === 'saving'
                    ? 'ENCRYPTING...'
                    : 'ENCRYPT & SAVE'}
                </span>
              </button>
            </form>

            {/* Error Message if any */}
            {errorMessages.gemini && (
              <div style={{ color: '#ff6b82', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                {errorMessages.gemini}
              </div>
            )}

            {/* Test Uplink Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => handleTestConnection('gemini')}
                disabled={!gemini.hasKey || testResults.gemini.testing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  backgroundColor: gemini.hasKey ? 'rgba(0, 243, 255, 0.1)' : 'rgba(50, 70, 85, 0.1)',
                  border: gemini.hasKey ? '1px solid rgba(0, 243, 255, 0.3)' : '1px solid rgba(50, 70, 85, 0.3)',
                  color: gemini.hasKey ? '#00f3ff' : '#4f6f80',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  cursor: gemini.hasKey && !testResults.gemini.testing ? 'pointer' : 'default',
                }}
              >
                {testResults.gemini.testing ? (
                  <RefreshCw size={11} className="animate-spin-slow" />
                ) : (
                  <Activity size={11} />
                )}
                <span>{testResults.gemini.testing ? 'PROBING...' : 'TEST UPLINK'}</span>
              </button>

              {testResults.gemini.result && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: testResults.gemini.result.success ? '#00ffaa' : '#ffaa00',
                  }}
                >
                  {testResults.gemini.result.message}
                </span>
              )}
            </div>
          </div>

          {/* 2. GROQ CLOUD CARD */}
          <div
            className="hud-panel hud-corner-cut-sm"
            style={{
              padding: '16px',
              backgroundColor: 'rgba(3, 8, 16, 0.7)',
              border:
                config.primaryProvider === 'groq'
                  ? '1px solid rgba(0, 243, 255, 0.4)'
                  : '1px solid rgba(0, 243, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Top Row: Provider identity, Role tag & Connection Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color={groq.hasKey ? '#00ffaa' : '#ffaa00'} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '12px', fontWeight: 700, color: '#e6f9ff' }}>
                      GROQ CLOUD
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '2px',
                        backgroundColor: config.primaryProvider === 'groq' ? 'rgba(0, 243, 255, 0.15)' : 'rgba(120, 150, 170, 0.15)',
                        color: config.primaryProvider === 'groq' ? '#00f3ff' : '#88b0c4',
                        border: config.primaryProvider === 'groq' ? '1px solid #00f3ff' : '1px solid #507085',
                      }}
                    >
                      {config.primaryProvider === 'groq' ? 'PRIMARY' : config.backupProvider === 'groq' ? 'BACKUP' : 'STANDBY'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#689bb3' }}>
                    Model: {groq.model}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: groq.hasKey ? 'rgba(0, 255, 170, 0.12)' : 'rgba(255, 170, 0, 0.12)',
                  border: groq.hasKey ? '1px solid #00ffaa' : '1px solid #ffaa00',
                  color: groq.hasKey ? '#00ffaa' : '#ffaa00',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                }}
              >
                {groq.hasKey ? 'CONNECTED' : 'KEY REQUIRED'}
              </span>
            </div>

            {/* Credential Status Row */}
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'rgba(2, 5, 10, 0.6)',
                border: '1px solid rgba(0, 243, 255, 0.1)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={12} color="#00f3ff" />
                <span style={{ color: '#689bb3' }}>VAULT:</span>
                <span style={{ color: groq.hasKey ? '#00ffaa' : '#ffaa00' }}>
                  {groq.maskedKey ? `MASKED (${groq.maskedKey})` : 'UNCONFIGURED'}
                </span>
              </div>

              {groq.hasKey && (
                <button
                  type="button"
                  onClick={() => handlePurgeKey('groq')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff2a4b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <Trash2 size={11} />
                  <span>{purgeStatuses.groq || 'PURGE'}</span>
                </button>
              )}
            </div>

            {/* Key Input Form */}
            <form onSubmit={(e) => handleSaveKey('groq', e)} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={inputKeys.groq}
                onChange={(e) => setInputKeys((prev) => ({ ...prev, groq: e.target.value }))}
                disabled={saveStatuses.groq === 'saving'}
                placeholder="Paste Groq API Key (gsk_...)"
                style={{
                  flex: 1,
                  background: 'rgba(2, 5, 10, 0.8)',
                  border: errorMessages.groq ? '1px solid #ff2a4b' : '1px solid rgba(0, 243, 255, 0.25)',
                  padding: '6px 10px',
                  borderRadius: '3px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!inputKeys.groq.trim() || saveStatuses.groq === 'saving'}
                style={{
                  padding: '6px 12px',
                  borderRadius: '3px',
                  backgroundColor:
                    saveStatuses.groq === 'saved'
                      ? 'rgba(0, 255, 170, 0.2)'
                      : saveStatuses.groq === 'error'
                      ? 'rgba(255, 42, 75, 0.2)'
                      : inputKeys.groq.trim()
                      ? 'rgba(0, 243, 255, 0.2)'
                      : 'rgba(0, 243, 255, 0.05)',
                  border:
                    saveStatuses.groq === 'saved'
                      ? '1px solid #00ffaa'
                      : saveStatuses.groq === 'error'
                      ? '1px solid #ff2a4b'
                      : inputKeys.groq.trim()
                      ? '1px solid #00f3ff'
                      : '1px solid rgba(0, 243, 255, 0.15)',
                  color:
                    saveStatuses.groq === 'saved'
                      ? '#00ffaa'
                      : saveStatuses.groq === 'error'
                      ? '#ff2a4b'
                      : inputKeys.groq.trim()
                      ? '#e6f9ff'
                      : '#496f82',
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: inputKeys.groq.trim() && saveStatuses.groq !== 'saving' ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {saveStatuses.groq === 'saving' && <RefreshCw size={11} className="animate-spin-slow" />}
                {saveStatuses.groq === 'saved' && <Check size={11} color="#00ffaa" />}
                <span>
                  {saveStatuses.groq === 'saved'
                    ? 'ENCRYPTED'
                    : saveStatuses.groq === 'saving'
                    ? 'ENCRYPTING...'
                    : 'ENCRYPT & SAVE'}
                </span>
              </button>
            </form>

            {/* Error Message if any */}
            {errorMessages.groq && (
              <div style={{ color: '#ff6b82', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                {errorMessages.groq}
              </div>
            )}

            {/* Test Uplink Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => handleTestConnection('groq')}
                disabled={!groq.hasKey || testResults.groq.testing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  backgroundColor: groq.hasKey ? 'rgba(0, 243, 255, 0.1)' : 'rgba(50, 70, 85, 0.1)',
                  border: groq.hasKey ? '1px solid rgba(0, 243, 255, 0.3)' : '1px solid rgba(50, 70, 85, 0.3)',
                  color: groq.hasKey ? '#00f3ff' : '#4f6f80',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  cursor: groq.hasKey && !testResults.groq.testing ? 'pointer' : 'default',
                }}
              >
                {testResults.groq.testing ? (
                  <RefreshCw size={11} className="animate-spin-slow" />
                ) : (
                  <Activity size={11} />
                )}
                <span>{testResults.groq.testing ? 'PROBING...' : 'TEST UPLINK'}</span>
              </button>

              {testResults.groq.result && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: testResults.groq.result.success ? '#00ffaa' : '#ffaa00',
                  }}
                >
                  {testResults.groq.result.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security / DPAPI Description Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-rajdhani)',
            fontSize: '12px',
            color: '#6596ad',
            paddingTop: '6px',
            borderTop: '1px solid rgba(0, 243, 255, 0.1)',
          }}
        >
          <ShieldCheck size={15} color="#00ffaa" />
          <span>
            All provider credentials are encrypted using <strong>Windows DPAPI (Data Protection API)</strong>. Ciphertext is stored exclusively in Electron user data and is inaccessible to web contexts or outside the host operating system user account.
          </span>
        </div>
      </div>

      {/* Audio Setting */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '18px 20px',
          backgroundColor: 'rgba(6, 14, 25, 0.75)',
          border: '1px solid rgba(0, 243, 255, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 243, 255, 0.1)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
            }}
          >
            <Volume2 size={18} color="#00f3ff" />
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '13px', color: '#e6f9ff' }}>
              TACTICAL HUD ACOUSTIC FEEDBACK
            </h4>
            <p style={{ fontFamily: 'var(--font-rajdhani)', fontSize: '13px', color: '#7ba9c2', marginTop: '2px' }}>
              Real-time Web Audio API synthesized frequencies for clicks, alerts, and reactor pulses.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleSound}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            backgroundColor: soundEnabled ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 42, 75, 0.15)',
            border: soundEnabled ? '1px solid #00ffaa' : '1px solid #ff2a4b',
            color: soundEnabled ? '#00ffaa' : '#ff2a4b',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          {soundEnabled ? 'ENABLED' : 'MUTED'}
        </button>
      </div>

      {/* Scanlines Setting */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '18px 20px',
          backgroundColor: 'rgba(6, 14, 25, 0.75)',
          border: '1px solid rgba(0, 243, 255, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 243, 255, 0.1)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
            }}
          >
            <Monitor size={18} color="#00f3ff" />
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '13px', color: '#e6f9ff' }}>
              CRT SCANLINE & HOLOGRAPHIC FILTER
            </h4>
            <p style={{ fontFamily: 'var(--font-rajdhani)', fontSize: '13px', color: '#7ba9c2', marginTop: '2px' }}>
              Overlay subtle retro-futuristic CRT beam scanlines over the application window.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleScan}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            backgroundColor: scanlinesEnabled ? 'rgba(0, 243, 255, 0.15)' : 'rgba(80, 110, 130, 0.15)',
            border: scanlinesEnabled ? '1px solid #00f3ff' : '1px solid #506e82',
            color: scanlinesEnabled ? '#00f3ff' : '#7ba9c2',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          {scanlinesEnabled ? 'ACTIVE' : 'DISABLED'}
        </button>
      </div>

      {/* Security & Runtime Card */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '18px 20px',
          backgroundColor: 'rgba(6, 14, 25, 0.75)',
          border: '1px solid rgba(0, 243, 255, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="#00ffaa" />
          <h4 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '13px', color: '#e6f9ff' }}>
            ELECTRON RUNTIME SECURITY SANDBOX
          </h4>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ffaa' }}>
            <Check size={14} />
            <span>contextIsolation: ENABLED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ffaa' }}>
            <Check size={14} />
            <span>nodeIntegration: DISABLED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ffaa' }}>
            <Check size={14} />
            <span>Credential Vault: WINDOWS DPAPI (safeStorage)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ffaa' }}>
            <Check size={14} />
            <span>Multi-AI Automatic Failover: ARMED</span>
          </div>
        </div>
      </div>

      {/* About Card */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '18px 20px',
          backgroundColor: 'rgba(6, 14, 25, 0.75)',
          border: '1px solid rgba(0, 243, 255, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={16} color="#00f3ff" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#88b5cc' }}>
            {appInfo.name} — Core Build {appInfo.version} // Electron {appInfo.electronVersion}
          </span>
        </div>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#4a748a' }}>
          WIN32 x64 DEPLOYMENT
        </span>
      </div>
    </div>
  );
};
