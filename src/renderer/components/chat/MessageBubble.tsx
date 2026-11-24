import React, { useState } from 'react';
import type { ChatMessage } from '@shared/types';
import { User, Cpu, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { TacticalMarkdownRenderer } from './TacticalMarkdownRenderer';
import { soundFx } from '../common/AudioSynthesizer';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        position: 'relative',
      }}
    >
      {/* Sender Header / Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: isUser ? '#6ba4c4' : '#00f3ff',
          letterSpacing: '1px',
        }}
      >
        {isUser ? (
          <>
            <span>{message.timestamp}</span>
            <span>//</span>
            <span style={{ fontWeight: 600 }}>OPERATOR</span>
            <User size={12} color="#0088ff" />
          </>
        ) : (
          <>
            <Cpu size={12} color="#00f3ff" />
            <span style={{ fontWeight: 600 }}>J.A.R.V.I.S. CORE</span>
            <span>//</span>
            <span>{message.timestamp}</span>
            {message.metadata?.failoverOccurred ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: '#ffaa00',
                  backgroundColor: 'rgba(255, 170, 0, 0.15)',
                  border: '1px solid rgba(255, 170, 0, 0.35)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontWeight: 700,
                }}
              >
                FAILOVER // {message.metadata?.provider?.toUpperCase()}
              </span>
            ) : message.metadata?.provider ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: '#00f3ff',
                  backgroundColor: 'rgba(0, 243, 255, 0.1)',
                  border: '1px solid rgba(0, 243, 255, 0.25)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                {message.metadata.provider.toUpperCase()}
              </span>
            ) : null}
            {message.type === 'diagnostic' && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: '#00ffaa',
                  backgroundColor: 'rgba(0, 255, 170, 0.1)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                <ShieldCheck size={10} /> DIAGNOSTIC
              </span>
            )}
            {message.type === 'warning' && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: '#ff2a4b',
                  backgroundColor: 'rgba(255, 42, 75, 0.1)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                <AlertCircle size={10} /> ALERT
              </span>
            )}
          </>
        )}
      </div>

      {/* Message Card Body */}
      <div
        className={isUser ? 'hud-corner-cut-sm' : 'hud-panel hud-corner-cut-sm'}
        style={{
          padding: '12px 16px',
          backgroundColor: isUser
            ? 'rgba(0, 119, 255, 0.16)'
            : 'rgba(5, 14, 25, 0.75)',
          border: isUser
            ? '1px solid rgba(0, 119, 255, 0.4)'
            : '1px solid rgba(0, 243, 255, 0.28)',
          borderRadius: '4px',
          color: '#e6f9ff',
          fontSize: '14px',
          lineHeight: '1.55',
          fontFamily: 'var(--font-rajdhani)',
          boxShadow: isUser
            ? '0 0 12px rgba(0, 119, 255, 0.15)'
            : '0 0 15px rgba(0, 243, 255, 0.08)',
          wordBreak: 'break-word',
          position: 'relative',
        }}
      >
        {/* Floating Message Copy Action */}
        {isHovered && (
          <button
            type="button"
            onClick={handleCopy}
            title="Copy message to clipboard"
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: 'rgba(5, 12, 22, 0.85)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              borderRadius: '3px',
              color: copied ? '#00ffaa' : '#7db0c9',
              padding: '2px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              zIndex: 10,
              boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)',
            }}
          >
            {copied ? <Check size={10} color="#00ffaa" /> : <Copy size={10} />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        )}

        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        ) : (
          <TacticalMarkdownRenderer content={message.content} />
        )}

        {/* Subsystem Chips if present */}
        {message.metadata?.affectedSubsystems && message.metadata.affectedSubsystems.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(0, 243, 255, 0.12)',
            }}
          >
            {message.metadata.affectedSubsystems.map((sub, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(0, 243, 255, 0.06)',
                  border: '1px solid rgba(0, 243, 255, 0.18)',
                  color: '#8ec7de',
                  letterSpacing: '0.8px',
                }}
              >
                {sub}
              </span>
            ))}
            {message.metadata.executionTimeMs !== undefined && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  color: '#4f7d99',
                  marginLeft: 'auto',
                }}
              >
                LATENCY {message.metadata.executionTimeMs}ms
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
