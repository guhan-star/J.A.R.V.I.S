import React, { useState, useEffect } from 'react';
import type { SystemTelemetry } from '@shared/types';
import { MetricGauge } from './MetricGauge';
import { PowerWidget } from './PowerWidget';
import { ClockWidget } from './ClockWidget';
import { SystemStatusCard } from './SystemStatusCard';
import { Activity } from 'lucide-react';

interface RightPanelProps {
  telemetry: SystemTelemetry | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({ telemetry }) => {
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 14, 11, 15, 12]);
  const [memHistory, setMemHistory] = useState<number[]>([42, 42, 43, 42, 42]);

  useEffect(() => {
    if (!telemetry) return;
    setCpuHistory((prev) => [...prev.slice(-19), telemetry.cpu.usagePercent]);
    setMemHistory((prev) => [...prev.slice(-19), telemetry.memory.usagePercent]);
  }, [telemetry]);
  // Graceful fallback values before initial telemetry stream
  const cpuPercent = telemetry?.cpu.usagePercent ?? 12;
  const cpuModel = telemetry?.cpu.model ?? 'Multi-Core Microarchitecture';
  const cpuDetail = `${telemetry?.cpu.cores ?? 8} Cores @ ${telemetry?.cpu.speedMHz ?? 3200} MHz`;
  const isCpuReal = telemetry?.cpu.isRealHardware ?? true;

  const memPercent = telemetry?.memory.usagePercent ?? 42;
  const memSubtitle = `${telemetry?.memory.usedGB ?? 8.4} GB / ${telemetry?.memory.totalGB ?? 16.0} GB`;
  const memDetail = `Free: ${telemetry?.memory.freeGB ?? 7.6} GB Available`;
  const isMemReal = telemetry?.memory.isRealHardware ?? true;

  const batteryPercent = telemetry?.battery.percent ?? 94;
  const isCharging = telemetry?.battery.isCharging ?? true;
  const powerState = telemetry?.battery.powerState ?? 'AC_POWER';
  const isBatteryReal = telemetry?.battery.isRealHardware ?? false;
  const fluxPercent = telemetry?.system.reactorFluxPercent ?? 98.4;

  const uptimeSec = telemetry?.system.uptimeSeconds ?? 3600;
  const threatLevel = telemetry?.system.threatLevel ?? 'DEFCON 5';
  const protocolState = telemetry?.system.protocolState ?? 'OPTIMAL';
  const hostname = telemetry?.system.hostname ?? 'MARK-IV-TERMINAL';
  const osVersion = telemetry?.system.osVersion ?? 'Windows 11 x64';

  return (
    <aside
      className="hud-panel"
      style={{
        width: '320px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid rgba(0, 243, 255, 0.15)',
        backgroundColor: 'rgba(5, 10, 18, 0.88)',
        zIndex: 10,
        userSelect: 'none',
        overflowY: 'auto',
      }}
    >
      {/* Top Telemetry Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="#00f3ff" />
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: '#e6f9ff',
            }}
          >
            SYSTEM TELEMETRY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#00ffaa',
              boxShadow: '0 0 6px #00ffaa',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#00ffaa',
            }}
          >
            ACTIVE STREAM
          </span>
        </div>
      </div>

      {/* Widget Column */}
      <div
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
        }}
      >
        {/* Clock & Chronometer */}
        <ClockWidget uptimeSeconds={uptimeSec} />

        {/* CPU Telemetry */}
        <MetricGauge
          type="cpu"
          title="CPU ALLOCATION"
          percent={cpuPercent}
          subtitle={cpuModel}
          detail={cpuDetail}
          isRealHardware={isCpuReal}
          history={cpuHistory}
        />

        {/* Memory Telemetry */}
        <MetricGauge
          type="memory"
          title="MEMORY STACK"
          percent={memPercent}
          subtitle={memSubtitle}
          detail={memDetail}
          isRealHardware={isMemReal}
          history={memHistory}
        />

        {/* Power Grid & Battery */}
        <PowerWidget
          percent={batteryPercent}
          isCharging={isCharging}
          powerState={powerState}
          isRealHardware={isBatteryReal}
          fluxPercent={fluxPercent}
        />

        {/* Security & System Status */}
        <SystemStatusCard
          threatLevel={threatLevel}
          protocolState={protocolState}
          hostname={hostname}
          osVersion={osVersion}
        />
      </div>
    </aside>
  );
};
