import React from 'react';
import { Battery, BatteryCharging, Zap } from 'lucide-react';

interface PowerWidgetProps {
  percent: number;
  isCharging: boolean;
  powerState: string;
  isRealHardware: boolean;
  fluxPercent: number;
}

const PowerWidgetComponent: React.FC<PowerWidgetProps> = ({
  percent,
  isCharging,
  powerState,
  isRealHardware,
  fluxPercent,
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
          {isCharging ? (
            <BatteryCharging size={15} color="#00ffaa" />
          ) : (
            <Battery size={15} color="#00f3ff" />
          )}
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#e6f9ff',
            }}
          >
            POWER GRID & CELLS
          </span>
        </div>

        {/* Hardware / Mock Verification Pill */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            padding: '1px 5px',
            borderRadius: '2px',
            backgroundColor: isRealHardware ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255, 170, 0, 0.1)',
            border: isRealHardware ? '1px solid rgba(0, 255, 170, 0.3)' : '1px solid rgba(255, 170, 0, 0.3)',
            color: isRealHardware ? '#00ffaa' : '#ffaa00',
            letterSpacing: '0.8px',
          }}
        >
          {isRealHardware ? 'HOST BATTERY' : 'SIMULATED CELL'}
        </span>
      </div>

      {/* Main Battery Meter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#00ffaa',
              textShadow: '0 0 8px rgba(0, 255, 170, 0.5)',
            }}
          >
            {percent}%
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#6aa3bd',
            }}
          >
            {powerState}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Zap size={13} color="#00f3ff" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#00f3ff',
            }}
          >
            FLUX: {fluxPercent}%
          </span>
        </div>
      </div>

      {/* Visual Battery Level Bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(0, 243, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #0088ff 0%, #00ffaa 100%)',
            boxShadow: '0 0 8px rgba(0, 255, 170, 0.6)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Secondary Telemetry Details */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: '#558096',
          marginTop: '2px',
        }}
      >
        <span>STATUS: {isCharging ? 'CHARGING VIA BUS' : 'DISCHARGE'}</span>
        <span>DRAIN: 14.2W</span>
      </div>
    </div>
  );
};

export const PowerWidget = React.memo(PowerWidgetComponent);
