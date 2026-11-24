import React from 'react';
import { Activity, ShieldCheck, Terminal, HelpCircle, RefreshCw } from 'lucide-react';
import { soundFx } from '../common/AudioSynthesizer';

interface QuickActionChipsProps {
  onSelectAction: (command: string) => void;
}

export const QuickActionChips: React.FC<QuickActionChipsProps> = ({ onSelectAction }) => {
  const actions = [
    { label: 'RUN DIAGNOSTICS', cmd: '/diagnostics', icon: Activity },
    { label: 'TELEMETRY STATUS', cmd: '/status', icon: RefreshCw },
    { label: 'DEFENSE PROTOCOL', cmd: 'Verify perimeter defense protocol and threat matrix', icon: ShieldCheck },
    { label: 'COMMAND DIRECTIVES', cmd: '/help', icon: HelpCircle },
    { label: 'CLEAR BUFFER', cmd: '/clear', icon: Terminal },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        padding: '8px 16px',
        margin: '12px 0',
      }}
    >
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <button
            key={idx}
            onClick={() => {
              soundFx.playClick();
              onSelectAction(act.cmd);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 243, 255, 0.05)',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              color: '#9edcf0',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.16)';
              e.currentTarget.style.borderColor = '#00f3ff';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.2)';
              e.currentTarget.style.color = '#9edcf0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Icon size={12} color="#00f3ff" />
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
};
