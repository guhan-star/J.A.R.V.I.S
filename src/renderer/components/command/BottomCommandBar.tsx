import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Terminal, Wifi, CornerDownLeft } from 'lucide-react';
import type { CoreVisualState } from '@shared/types';
import { soundFx } from '../common/AudioSynthesizer';

interface BottomCommandBarProps {
  onSendMessage: (text: string) => void;
  coreState: CoreVisualState;
  onToggleVoice: () => void;
  isVoiceActive: boolean;
}

export const BottomCommandBar: React.FC<BottomCommandBarProps> = ({
  onSendMessage,
  coreState,
  onToggleVoice,
  isVoiceActive,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    soundFx.playClick();
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = () => {
    if (!isVoiceActive) {
      soundFx.playActivateVoice();
    } else {
      soundFx.playClick();
    }
    onToggleVoice();
  };

  return (
    <footer
      style={{
        height: '68px',
        width: '100%',
        backgroundColor: '#03070d',
        borderTop: '1px solid rgba(0, 243, 255, 0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        gap: '16px',
        zIndex: 50,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Left: Connection Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: '200px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 243, 255, 0.05)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
          }}
        >
          <Wifi size={13} color="#00ffaa" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 600,
                color: '#00ffaa',
                letterSpacing: '0.8px',
              }}
            >
              IPC BRIDGE ONLINE
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: '#4e7b94',
              }}
            >
              127.0.0.1 // LOCAL HOST
            </span>
          </div>
        </div>
      </div>

      {/* Center: Command Input Bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          flex: 1,
          maxWidth: '780px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          className="hud-corner-cut-sm"
          style={{
            width: '100%',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(7, 16, 28, 0.9)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            padding: '0 12px',
            gap: '10px',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.08)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={() => {
            // glow effect
          }}
        >
          <Terminal size={16} color="#00f3ff" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#00f3ff',
              fontWeight: 700,
            }}
          >
            JARVIS:~$
          </span>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isVoiceActive
                ? 'Voice recognition active. Speak directive...'
                : 'Enter directive, query, or command (/diag, /status, /help)...'
            }
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-rajdhani)',
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}
          />

          {/* Quick Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              background: inputText.trim() ? 'rgba(0, 243, 255, 0.2)' : 'transparent',
              border: inputText.trim() ? '1px solid #00f3ff' : '1px solid transparent',
              borderRadius: '4px',
              color: inputText.trim() ? '#00f3ff' : '#3d6175',
              cursor: inputText.trim() ? 'pointer' : 'default',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-orbitron)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>DISPATCH</span>
            <CornerDownLeft size={12} />
          </button>
        </div>
      </form>

      {/* Right: Microphone Activation & Animated Listening Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          minWidth: '200px',
          justifyContent: 'flex-end',
        }}
      >
        {/* Animated Waveform when listening */}
        {isVoiceActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {[14, 22, 10, 26, 18, 12].map((height, i) => (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: `${height}px`,
                  backgroundColor: '#00ffaa',
                  boxShadow: '0 0 6px #00ffaa',
                  animation: `pulseGlow 0.8s infinite ease-in-out ${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleMicClick}
          title={isVoiceActive ? 'Disengage Voice Subsystem' : 'Engage Voice Recognition'}
          className="hud-corner-cut-sm"
          style={{
            height: '42px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isVoiceActive
              ? 'rgba(0, 255, 170, 0.2)'
              : 'rgba(0, 243, 255, 0.08)',
            border: isVoiceActive ? '1px solid #00ffaa' : '1px solid rgba(0, 243, 255, 0.3)',
            color: isVoiceActive ? '#00ffaa' : '#00f3ff',
            fontFamily: 'var(--font-orbitron)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: 'pointer',
            boxShadow: isVoiceActive
              ? '0 0 16px rgba(0, 255, 170, 0.4)'
              : '0 0 8px rgba(0, 243, 255, 0.1)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            if (!isVoiceActive) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.18)';
              e.currentTarget.style.borderColor = '#00f3ff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isVoiceActive) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)';
            }
          }}
        >
          {isVoiceActive ? <Mic size={16} /> : <MicOff size={16} />}
          <span>{isVoiceActive ? 'LISTENING' : 'VOICE'}</span>
        </button>
      </div>
    </footer>
  );
};
