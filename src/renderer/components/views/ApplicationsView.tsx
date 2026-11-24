import React from 'react';
import { Layers, Terminal, Shield, Globe, Cpu, Database, ExternalLink } from 'lucide-react';
import { soundFx } from '../common/AudioSynthesizer';

interface AppItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  status: 'READY' | 'ACTIVE' | 'STANDBY';
}

interface ApplicationsViewProps {
  onLaunchApp: (appName: string) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({ onLaunchApp }) => {
  const apps: AppItem[] = [
    {
      id: 'terminal',
      name: 'TACTICAL TERMINAL DECK',
      category: 'SYSTEM RUNTIME',
      description: 'Direct interactive prompt for Mark IV low-level directive dispatch and IPC bus inspection.',
      icon: Terminal,
      status: 'READY',
    },
    {
      id: 'defense',
      name: 'DEFENSE MATRIX & FIREWALL',
      category: 'SECURITY',
      description: 'Continuous port and memory intrusion detection suite with automated perimeter locks.',
      icon: Shield,
      status: 'ACTIVE',
    },
    {
      id: 'orbital',
      name: 'GLOBAL TELEMETRY LINK',
      category: 'NETWORKING',
      description: 'Synchronized satellite telemetry, GPS coordinates, and global secure relay protocols.',
      icon: Globe,
      status: 'STANDBY',
    },
    {
      id: 'neural',
      name: 'NEURAL WEIGHTS INSPECTOR',
      category: 'AI COGNITION',
      description: 'Inference latency metrics, tokenizer throughput, and memory-mapped model cache monitors.',
      icon: Cpu,
      status: 'READY',
    },
    {
      id: 'vault',
      name: 'ENCRYPTED ARCHIVE VAULT',
      category: 'DATA STORAGE',
      description: 'Zero-knowledge encrypted local storage for mission logs, mission briefs, and system caches.',
      icon: Database,
      status: 'ACTIVE',
    },
    {
      id: 'suit',
      name: 'MARK IV PROTOCOL SUITE',
      category: 'HARDWARE INTEGRATION',
      description: 'Auxiliary flight telemetry, hydraulic actuator pressure checks, and repulsor diagnostics.',
      icon: Layers,
      status: 'READY',
    },
  ];

  const handleLaunch = (appName: string) => {
    soundFx.playClick();
    onLaunchApp(appName);
  };

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        padding: '28px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: 'rgba(3, 7, 13, 0.5)',
      }}
    >
      {/* Header */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '20px 24px',
          border: '1px solid rgba(0, 243, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#00f3ff" />
            <h2
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: '18px',
                fontWeight: 800,
                color: '#e6f9ff',
                letterSpacing: '1.5px',
              }}
            >
              INTEGRATED TACTICAL APPLICATIONS
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
            Authorized modules and command tools linked with J.A.R.V.I.S. core environment.
          </p>
        </div>
      </div>

      {/* Grid of Applications */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="hud-panel hud-corner-cut-sm"
              style={{
                padding: '18px',
                border: '1px solid rgba(0, 243, 255, 0.18)',
                backgroundColor: 'rgba(6, 14, 25, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 243, 255, 0.1)',
                        border: '1px solid rgba(0, 243, 255, 0.3)',
                      }}
                    >
                      <Icon size={16} color="#00f3ff" />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#5b8fa8' }}>
                      {app.category}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      backgroundColor:
                        app.status === 'ACTIVE'
                          ? 'rgba(0, 255, 170, 0.1)'
                          : 'rgba(0, 243, 255, 0.1)',
                      border:
                        app.status === 'ACTIVE'
                          ? '1px solid rgba(0, 255, 170, 0.3)'
                          : '1px solid rgba(0, 243, 255, 0.3)',
                      color: app.status === 'ACTIVE' ? '#00ffaa' : '#00f3ff',
                    }}
                  >
                    {app.status}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-orbitron)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#e6f9ff',
                    letterSpacing: '0.8px',
                    marginBottom: '6px',
                  }}
                >
                  {app.name}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-rajdhani)',
                    fontSize: '13px',
                    color: '#8cbcd4',
                    lineHeight: 1.4,
                  }}
                >
                  {app.description}
                </p>
              </div>

              <button
                onClick={() => handleLaunch(app.name)}
                className="hud-corner-cut-sm"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0, 243, 255, 0.1)',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  color: '#00f3ff',
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.22)';
                  e.currentTarget.style.borderColor = '#00f3ff';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)';
                  e.currentTarget.style.color = '#00f3ff';
                }}
              >
                <span>INITIALIZE MODULE</span>
                <ExternalLink size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
