import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Activity } from 'lucide-react';

interface ClockWidgetProps {
  uptimeSeconds?: number;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ uptimeSeconds = 0 }) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const localTimeStr = time.toLocaleTimeString([], { hour12: false });
  const utcTimeStr = time.toISOString().substring(11, 19) + ' UTC';
  const dateStr = time.toLocaleDateString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div
      className="hud-panel hud-corner-cut-sm"
      style={{
        padding: '12px 14px',
        backgroundColor: 'rgba(5, 12, 22, 0.7)',
        border: '1px solid rgba(0, 243, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="#00f3ff" />
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#e6f9ff',
            }}
          >
            TACTICAL CHRONOMETER
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#00f3ff',
            letterSpacing: '0.5px',
          }}
        >
          {utcTimeStr}
        </span>
      </div>

      {/* Main Big Time Display */}
      <div
        style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '2px',
          color: '#e6f9ff',
          textShadow: '0 0 10px rgba(0, 243, 255, 0.5)',
          marginTop: '2px',
        }}
      >
        {localTimeStr}
      </div>

      {/* Date & Uptime Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px solid rgba(0, 243, 255, 0.1)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#6596ad',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={12} color="#00f3ff" />
          <span>{dateStr}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} color="#00ffaa" />
          <span>UP: {formatUptime(uptimeSeconds)}</span>
        </div>
      </div>
    </div>
  );
};
