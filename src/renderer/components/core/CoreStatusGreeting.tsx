import React, { useState, useEffect } from 'react';
import type { CoreVisualState } from '@shared/types';

interface CoreStatusGreetingProps {
  state: CoreVisualState;
}

export const CoreStatusGreeting: React.FC<CoreStatusGreetingProps> = ({ state }) => {
  const getGreetingText = (): string => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return 'Good morning, Sir. All systems operational.';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon, Sir. Tactical telemetry synced.';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening, Sir. Perimeter defense secure.';
    } else {
      return 'Systems operational, Sir. Late-watch protocol active.';
    }
  };

  const fullGreeting = getGreetingText();
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const timer = setInterval(() => {
      if (index <= fullGreeting.length) {
        setDisplayedText(fullGreeting.slice(0, index));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 40);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: '28px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-orbitron)',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '2px',
          color: '#e6f9ff',
          textShadow: '0 0 12px rgba(0, 243, 255, 0.4)',
        }}
      >
        <span>{displayedText}</span>
        {!isTypingComplete && (
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '20px',
              backgroundColor: '#00f3ff',
              boxShadow: '0 0 8px #00f3ff',
              animation: 'typingBlink 0.8s infinite',
            }}
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#5e94b0',
          letterSpacing: '1px',
        }}
      >
        <span>CLEARANCE: LEVEL 5</span>
        <span style={{ color: 'rgba(0, 243, 255, 0.3)' }}>|</span>
        <span>DEFENSE GRID: STANDBY</span>
        <span style={{ color: 'rgba(0, 243, 255, 0.3)' }}>|</span>
        <span
          style={{
            color:
              state === 'listening'
                ? '#00ffaa'
                : state === 'processing'
                ? '#ffaa00'
                : state === 'speaking'
                ? '#00f3ff'
                : '#78c6e0',
          }}
        >
          CORE STATUS: {state.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
