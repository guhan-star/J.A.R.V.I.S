import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage, CoreVisualState } from '@shared/types';
import { ArcReactorCore } from '../core/ArcReactorCore';
import { CoreStatusGreeting } from '../core/CoreStatusGreeting';
import { QuickActionChips } from './QuickActionChips';
import { MessageBubble } from './MessageBubble';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  coreState: CoreVisualState;
  onCoreClick: () => void;
  onSelectAction: (command: string) => void;
}

const PROCESSING_STATUSES = [
  'ENGAGING MULTI-NEURAL COGNITIVE CLUSTER...',
  'SYNTHESIZING TACTICAL PARAMETERS...',
  'EVALUATING SYSTEM TELEMETRY & DIRECTIVE STREAM...',
  'FORMULATING STRATEGIC RESPONSE MATRIX...',
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  coreState,
  onCoreClick,
  onSelectAction,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    if (coreState !== 'processing') return;
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % PROCESSING_STATUSES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [coreState]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, coreState]);

  const hasMessages = messages.length > 0;

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(3, 7, 13, 0.4)',
      }}
    >
      {/* Scrollable Center Container */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px 16px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Core Visualization & Status Greeting */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: hasMessages ? '16px 0' : '36px 0 16px 0',
            transition: 'all 0.3s ease',
          }}
        >
          <ArcReactorCore
            state={coreState}
            onCoreClick={onCoreClick}
            size={hasMessages ? 180 : 230}
          />

          <CoreStatusGreeting state={coreState} />
        </div>

        {/* Quick Action Directives */}
        <QuickActionChips onSelectAction={onSelectAction} />

        {/* Holographic Divider Line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0, 243, 255, 0.3) 50%, transparent 100%)',
            margin: '12px 0 20px 0',
          }}
        />

        {/* Message Stream */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {coreState === 'processing' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#00f3ff',
                padding: '9px 14px',
                backgroundColor: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                borderRadius: '4px',
                alignSelf: 'flex-start',
                animation: 'pulseGlow 1.8s infinite',
                boxShadow: '0 0 12px rgba(0, 243, 255, 0.1)',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#00f3ff',
                  boxShadow: '0 0 8px #00f3ff',
                }}
              />
              <span style={{ letterSpacing: '1px' }}>
                {PROCESSING_STATUSES[statusIdx]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
