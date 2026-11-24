import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Volume2, VolumeX, Shield, Activity } from 'lucide-react';
import { soundFx } from './AudioSynthesizer';

interface TitleBarProps {
  onMuteToggle?: (muted: boolean) => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onMuteToggle }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check initial window state
    if (window.jarvisAPI?.isMaximized) {
      window.jarvisAPI.isMaximized().then(setIsMaximized).catch(() => {});
    }
  }, []);

  const handleMinimize = () => {
    soundFx.playClick();
    window.jarvisAPI?.minimize();
  };

  const handleMaximize = () => {
    soundFx.playClick();
    window.jarvisAPI?.maximize().then(() => {
      setIsMaximized(!isMaximized);
    });
  };

  const handleClose = () => {
    soundFx.playClick();
    window.jarvisAPI?.close();
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundFx.setMuted(nextState);
    if (!nextState) soundFx.playClick();
    onMuteToggle?.(nextState);
  };

  return (
    <header
      style={{
        height: '38px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        backgroundColor: '#03060a',
        borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
        userSelect: 'none',
        WebkitAppRegion: 'drag' as any,
        zIndex: 1000,
        position: 'relative',
      }}
    >
      {/* Brand & Emblem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: '2px solid #00f3ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(0, 243, 255, 0.6)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#00f3ff',
              boxShadow: '0 0 6px #00f3ff',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: '#00f3ff',
              textShadow: '0 0 8px rgba(0, 243, 255, 0.5)',
            }}
          >
            J.A.R.V.I.S.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#4f7d99',
              letterSpacing: '1px',
            }}
          >
            // MARK-IV SYSTEM
          </span>
        </div>
      </div>

      {/* Middle Telemetry Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          WebkitAppRegion: 'no-drag' as any,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 243, 255, 0.05)',
            border: '1px solid rgba(0, 243, 255, 0.18)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#b3e8f8',
          }}
        >
          <Activity size={12} color="#00f3ff" />
          <span>LINK: 1.2ms</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 255, 170, 0.05)',
            border: '1px solid rgba(0, 255, 170, 0.2)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#00ffaa',
          }}
        >
          <Shield size={12} color="#00ffaa" />
          <span>SECURE // ISOLATED</span>
        </div>

        {/* Audio Mute Button */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute HUD Audio' : 'Mute HUD Audio'}
          style={{
            background: 'none',
            border: 'none',
            color: isMuted ? '#598399' : '#00f3ff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s',
          }}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Windows 11 Native Action Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          WebkitAppRegion: 'no-drag' as any,
          height: '100%',
        }}
      >
        <button
          onClick={handleMinimize}
          className="titlebar-btn"
          title="Minimize"
          style={{
            width: '40px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            color: '#7ba9c2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.12)';
            e.currentTarget.style.color = '#00f3ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#7ba9c2';
          }}
        >
          <Minus size={14} />
        </button>

        <button
          onClick={handleMaximize}
          className="titlebar-btn"
          title={isMaximized ? 'Restore' : 'Maximize'}
          style={{
            width: '40px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            color: '#7ba9c2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.12)';
            e.currentTarget.style.color = '#00f3ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#7ba9c2';
          }}
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>

        <button
          onClick={handleClose}
          className="titlebar-btn-close"
          title="Close"
          style={{
            width: '44px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            color: '#7ba9c2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e81123';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#7ba9c2';
          }}
        >
          <X size={15} />
        </button>
      </div>
    </header>
  );
};
