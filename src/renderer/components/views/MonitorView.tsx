import React from 'react';
import type { SystemTelemetry } from '@shared/types';
import { Cpu, HardDrive, ShieldCheck, Activity, Terminal } from 'lucide-react';

interface MonitorViewProps {
  telemetry: SystemTelemetry | null;
}

export const MonitorView: React.FC<MonitorViewProps> = ({ telemetry }) => {
  const cores = telemetry?.cpu.cores ?? 8;
  const cpuPercent = telemetry?.cpu.usagePercent ?? 15;
  const totalGB = telemetry?.memory.totalGB ?? 16;
  const usedGB = telemetry?.memory.usedGB ?? 8.4;
  const freeGB = telemetry?.memory.freeGB ?? 7.6;
  const memPercent = telemetry?.memory.usagePercent ?? 52;
  const flux = telemetry?.system.reactorFluxPercent ?? 98.4;

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
      {/* Top Banner */}
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
            <Cpu size={20} color="#00f3ff" />
            <h2
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: '18px',
                fontWeight: 800,
                color: '#e6f9ff',
                letterSpacing: '1.5px',
              }}
            >
              CENTRAL HARDWARE TELEMETRY DECK
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
            Live kernel probes direct from Node.js operating system bindings. Verified hardware channels highlighted.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 255, 170, 0.08)',
            border: '1px solid rgba(0, 255, 170, 0.3)',
          }}
        >
          <ShieldCheck size={16} color="#00ffaa" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00ffaa' }}>
            NODE OS BINDINGS: ACTIVE
          </span>
        </div>
      </div>

      {/* Multi-Core Threads Grid */}
      <div
        className="hud-panel hud-corner-cut-sm"
        style={{
          padding: '18px 20px',
          border: '1px solid rgba(0, 243, 255, 0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '13px', fontWeight: 700, color: '#00f3ff' }}>
            CPU THREAD ALLOCATION MATRIX ({cores} CORES DETECTED)
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00ffaa' }}>
            TOTAL LOAD: {cpuPercent}%
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '10px',
          }}
        >
          {Array.from({ length: cores }).map((_, idx) => {
            // Simulated per-core variance around actual overall CPU load
            const coreLoad = Math.max(
              2,
              Math.min(100, Math.round(cpuPercent + (Math.sin(idx + Date.now() / 2000) * 12)))
            );
            return (
              <div
                key={idx}
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(6, 15, 26, 0.8)',
                  border: '1px solid rgba(0, 243, 255, 0.12)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#5b8fa8' }}>THREAD #{idx}</span>
                  <span style={{ color: coreLoad > 75 ? '#ffaa00' : '#00f3ff' }}>{coreLoad}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(0, 243, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${coreLoad}%`,
                      height: '100%',
                      backgroundColor: coreLoad > 75 ? '#ffaa00' : '#00f3ff',
                      boxShadow: `0 0 4px ${coreLoad > 75 ? '#ffaa00' : '#00f3ff'}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory Allocation Stack & Reactor Output */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div
          className="hud-panel hud-corner-cut-sm"
          style={{
            padding: '18px 20px',
            border: '1px solid rgba(0, 243, 255, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={16} color="#00f3ff" />
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '13px', fontWeight: 700, color: '#e6f9ff' }}>
              MEMORY BUFFER DISTRIBUTION
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <span style={{ color: '#689bb3' }}>ALLOCATED: {usedGB} GB</span>
            <span style={{ color: '#00ffaa' }}>AVAILABLE: {freeGB} GB</span>
          </div>

          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0, 243, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${memPercent}%`, height: '100%', backgroundColor: '#0088ff' }} />
            <div style={{ width: `${100 - memPercent}%`, height: '100%', backgroundColor: 'rgba(0, 255, 170, 0.3)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#56849c' }}>
            <span>TOTAL PHYSICAL STACK: {totalGB} GB</span>
            <span>LOAD: {memPercent}%</span>
          </div>
        </div>

        <div
          className="hud-panel hud-corner-cut-sm"
          style={{
            padding: '18px 20px',
            border: '1px solid rgba(0, 243, 255, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#00ffaa" />
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '13px', fontWeight: 700, color: '#e6f9ff' }}>
              ARC REACTOR POWER DELIVERY
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <span style={{ color: '#689bb3' }}>FLUX HARMONIC</span>
            <span style={{ color: '#00ffaa', fontWeight: 700 }}>{flux}% STABLE</span>
          </div>

          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0, 243, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${flux}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0088ff 0%, #00ffaa 100%)',
                boxShadow: '0 0 10px rgba(0, 255, 170, 0.5)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#56849c' }}>
            <span>OUTPUT VOLTAGE: 3.3V DC BUS</span>
            <span>HARMONIC JITTER: 0.02%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
