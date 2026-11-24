import React from 'react';
import { Shield, Radio, CheckCircle, AlertTriangle } from 'lucide-react';

interface SystemStatusCardProps {
  threatLevel: string;
  protocolState: string;
  hostname: string;
  osVersion: string;
}

const SystemStatusCardComponent: React.FC<SystemStatusCardProps> = ({
  threatLevel,
  protocolState,
  hostname,
  osVersion,
}) => {
  return (
    <div
      className="hud-panel hud-corner-cut-sm"
      style={{
        padding: '12px 14px',
        backgroundColor: 'rgba(5, 12, 22, 0.7)',
        border: '1px solid rgba(0, 243, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="#00ffaa" />
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#e6f9ff',
            }}
          >
            SECURITY & PROTOCOL
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            padding: '1px 6px',
            borderRadius: '2px',
            backgroundColor: 'rgba(0, 255, 170, 0.1)',
            border: '1px solid rgba(0, 255, 170, 0.3)',
            color: '#00ffaa',
            letterSpacing: '0.8px',
          }}
        >
          {protocolState}
        </span>
      </div>

      {/* Threat Status Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          backgroundColor: 'rgba(0, 243, 255, 0.05)',
          border: '1px solid rgba(0, 243, 255, 0.18)',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} color="#00f3ff" />
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '13px',
              fontWeight: 700,
              color: '#00f3ff',
              letterSpacing: '1px',
            }}
          >
            {threatLevel}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#00ffaa',
          }}
        >
          PERIMETER SECURE
        </span>
      </div>

      {/* System Subsystems Checklist */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8dc2d9' }}>
          <CheckCircle size={11} color="#00ffaa" />
          <span>FIREWALL // ACTIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8dc2d9' }}>
          <CheckCircle size={11} color="#00ffaa" />
          <span>IPC LINK // PASS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8dc2d9' }}>
          <CheckCircle size={11} color="#00ffaa" />
          <span>NEURAL NET // SYNC</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8dc2d9' }}>
          <CheckCircle size={11} color="#00ffaa" />
          <span>SANDBOX // SECURE</span>
        </div>
      </div>

      {/* Host Meta */}
      <div
        style={{
          paddingTop: '6px',
          borderTop: '1px solid rgba(0, 243, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: '#49748a',
        }}
      >
        <span>HOST: {hostname}</span>
        <span>{osVersion}</span>
      </div>
    </div>
  );
};

export const SystemStatusCard = React.memo(SystemStatusCardComponent);
