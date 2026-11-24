import React from 'react';
import {
  MessageSquarePlus,
  Radio,
  Cpu,
  Layers,
  Settings,
  ShieldAlert,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { soundFx } from '../common/AudioSynthesizer';

export type NavView = 'chat' | 'monitor' | 'apps' | 'diagnostics' | 'settings';

interface LeftSidebarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  onNewConversation: () => void;
  onClearHistory: () => void;
  historyItems: Array<{ id: string; title: string; time: string; active?: boolean }>;
  onSelectHistoryItem: (id: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentView,
  onViewChange,
  onNewConversation,
  onClearHistory,
  historyItems,
  onSelectHistoryItem,
}) => {
  const handleNavClick = (view: NavView) => {
    soundFx.playNavigation();
    onViewChange(view);
  };

  const handleNewChat = () => {
    soundFx.playClick();
    onNewConversation();
  };

  return (
    <aside
      className="hud-panel"
      style={{
        width: '260px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0, 243, 255, 0.15)',
        backgroundColor: 'rgba(5, 10, 18, 0.88)',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* Top Header / JARVIS Emblem */}
      <div
        style={{
          padding: '18px 16px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 243, 255, 0.08)',
            border: '1px solid #00f3ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0, 243, 255, 0.25)',
          }}
        >
          <Sparkles size={20} color="#00f3ff" />
        </div>

        <div>
          <h1
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '2px',
              color: '#e6f9ff',
              lineHeight: 1.1,
            }}
          >
            J.A.R.V.I.S.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#00f3ff',
              letterSpacing: '1px',
              marginTop: '3px',
            }}
          >
            AI PERSONAL ASSISTANT
          </p>
        </div>
      </div>

      {/* New Conversation Button */}
      <div style={{ padding: '14px 16px 8px 16px' }}>
        <button
          onClick={handleNewChat}
          className="hud-corner-cut-sm"
          style={{
            width: '100%',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'rgba(0, 243, 255, 0.12)',
            border: '1px solid #00f3ff',
            color: '#e6f9ff',
            fontFamily: 'var(--font-orbitron)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(0, 243, 255, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.25)';
            e.currentTarget.style.boxShadow = '0 0 18px rgba(0, 243, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.12)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 243, 255, 0.2)';
          }}
        >
          <MessageSquarePlus size={15} color="#00f3ff" />
          <span>NEW DIRECTIVE</span>
        </button>
      </div>

      {/* Main Navigation Menu */}
      <nav aria-label="Tactical Navigation" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[
          { id: 'chat' as const, label: 'DIRECTIVES // CHAT', icon: Radio },
          { id: 'monitor' as const, label: 'SYSTEM MONITOR', icon: Cpu },
          { id: 'apps' as const, label: 'APPLICATIONS', icon: Layers },
          { id: 'diagnostics' as const, label: 'DIAGNOSTICS', icon: ShieldAlert },
          { id: 'settings' as const, label: 'SETTINGS', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '4px',
                border: isActive ? '1px solid rgba(0, 243, 255, 0.45)' : '1px solid transparent',
                borderLeft: isActive ? '3px solid #00f3ff' : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
                color: isActive ? '#00f3ff' : '#82a9be',
                cursor: 'pointer',
                fontFamily: 'var(--font-rajdhani)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
                textAlign: 'left',
                boxShadow: isActive ? '0 0 12px rgba(0, 243, 255, 0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#00f3ff' : '#689bb3'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && (
                <div
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#00f3ff',
                    boxShadow: '0 0 6px #00f3ff',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Chat History Section */}
      <div
        style={{
          marginTop: '12px',
          padding: '10px 16px 4px 16px',
          borderTop: '1px solid rgba(0, 243, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '1.5px',
            color: '#4e7b94',
            textTransform: 'uppercase',
          }}
        >
          SESSION LOGS
        </span>
        <button
          onClick={() => {
            soundFx.playClick();
            onClearHistory();
          }}
          title="Clear Session History"
          style={{
            background: 'none',
            border: 'none',
            color: '#4e7b94',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff2a4b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#4e7b94';
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Scrollable History List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {historyItems.length === 0 ? (
          <div
            style={{
              padding: '18px 12px',
              textAlign: 'center',
              color: '#3d6175',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            NO PREVIOUS LOGS
          </div>
        ) : (
          historyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                onSelectHistoryItem(item.id);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: '4px',
                border: item.active ? '1px solid rgba(0, 243, 255, 0.35)' : '1px solid rgba(0, 243, 255, 0.06)',
                backgroundColor: item.active ? 'rgba(0, 243, 255, 0.08)' : 'rgba(8, 16, 28, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'rgba(8, 16, 28, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.06)';
                }
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: item.active ? '#00f3ff' : '#9ec5d9',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '3px',
                  fontSize: '10px',
                  color: '#4e7b94',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <Clock size={10} />
                <span>{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Neural Connectivity Badge */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(0, 243, 255, 0.12)',
          backgroundColor: 'rgba(3, 7, 13, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00ffaa',
              boxShadow: '0 0 6px #00ffaa',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#8ec7de',
              letterSpacing: '1px',
            }}
          >
            NEURAL MESH: 99.8%
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#436d82',
          }}
        >
          v1.0.4
        </span>
      </div>
    </aside>
  );
};
