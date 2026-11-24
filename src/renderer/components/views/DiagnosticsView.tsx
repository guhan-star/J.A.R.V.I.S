import React, { useState } from 'react';
import type { DiagnosticResult } from '@shared/types';
import { Activity, ShieldCheck, CheckCircle2, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { soundFx } from '../common/AudioSynthesizer';

interface DiagnosticsViewProps {
  onRunDiagnostics: () => Promise<DiagnosticResult[]>;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ onRunDiagnostics }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([
    {
      subsystem: 'NEURAL_CORE_AI',
      status: 'ONLINE',
      integrity: 99.4,
      detail: 'Inference channels synchronized. Latency 1.2ms.',
    },
    {
      subsystem: 'HARDWARE_HOST_TELEMETRY',
      status: 'ONLINE',
      integrity: 100,
      detail: 'Probed host CPU & RAM hardware metrics.',
    },
    {
      subsystem: 'ARC_REACTOR_POWER_GRID',
      status: 'ONLINE',
      integrity: 98.7,
      detail: 'Clean power delivery. Simulated auxiliary cell standby.',
    },
    {
      subsystem: 'DEFENSE_FIREWALL_MATRIX',
      status: 'ONLINE',
      integrity: 99.9,
      detail: 'Zero intrusion anomalies detected.',
    },
  ]);

  const handleExecute = async () => {
    setIsRunning(true);
    soundFx.playDiagnosticPulse();

    try {
      const res = await onRunDiagnostics();
      setResults(res);
      soundFx.playMessageChime();
    } catch {
      // fallback
    } finally {
      setIsRunning(false);
    }
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
      {/* Header Banner */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(0, 243, 255, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#00f3ff" />
            <h2
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: '18px',
                fontWeight: 800,
                color: '#e6f9ff',
                letterSpacing: '1.5px',
              }}
            >
              SUBSYSTEM INTEGRITY MATRIX
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
            Execute real-time integrity verification across neural models, IPC pipelines, and defense layers.
          </p>
        </div>

        <button
          onClick={handleExecute}
          disabled={isRunning}
          className="hud-corner-cut-sm"
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? 'rgba(0, 243, 255, 0.08)' : 'rgba(0, 243, 255, 0.18)',
            border: '1px solid #00f3ff',
            color: '#e6f9ff',
            fontFamily: 'var(--font-orbitron)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            cursor: isRunning ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.25)',
            transition: 'all 0.2s',
          }}
        >
          {isRunning ? (
            <>
              <RefreshCw size={15} className="animate-spin-slow" />
              <span>SCANNING...</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>RUN FULL DIAGNOSTIC</span>
            </>
          )}
        </button>
      </div>

      {/* Results Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {results.map((item, idx) => (
          <div
            key={idx}
            className="hud-panel hud-corner-cut-sm"
            style={{
              padding: '16px',
              backgroundColor: 'rgba(6, 14, 25, 0.75)',
              border: '1px solid rgba(0, 243, 255, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#00f3ff',
                }}
              >
                {item.subsystem}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: item.status === 'ONLINE' ? '#00ffaa' : '#ffaa00',
                  backgroundColor:
                    item.status === 'ONLINE'
                      ? 'rgba(0, 255, 170, 0.1)'
                      : 'rgba(255, 170, 0, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                {item.status === 'ONLINE' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {item.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#689bb3' }}>
                INTEGRITY INDEX:
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#e6f9ff',
                }}
              >
                {item.integrity}%
              </span>
            </div>

            {/* Integrity bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${item.integrity}%`,
                  height: '100%',
                  backgroundColor: item.integrity > 90 ? '#00ffaa' : '#ffaa00',
                  boxShadow: `0 0 6px ${item.integrity > 90 ? '#00ffaa' : '#ffaa00'}`,
                }}
              />
            </div>

            <p
              style={{
                fontFamily: 'var(--font-rajdhani)',
                fontSize: '13px',
                color: '#90bdd4',
                marginTop: '4px',
                lineHeight: 1.4,
              }}
            >
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
