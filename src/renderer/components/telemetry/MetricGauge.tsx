import React from 'react';
import { Cpu, HardDrive } from 'lucide-react';
import { SparklineGraph } from './SparklineGraph';

interface MetricGaugeProps {
  type: 'cpu' | 'memory';
  title: string;
  percent: number;
  subtitle: string;
  detail: string;
  isRealHardware: boolean;
  history?: number[];
}

const MetricGaugeComponent: React.FC<MetricGaugeProps> = ({
  type,
  title,
  percent,
  subtitle,
  detail,
  isRealHardware,
  history,
}) => {
  const Icon = type === 'cpu' ? Cpu : HardDrive;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Determine color based on threshold
  const gaugeColor = percent > 85 ? '#ff2a4b' : percent > 65 ? '#ffaa00' : '#00f3ff';

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
          <Icon size={14} color="#00f3ff" />
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#e6f9ff',
            }}
          >
            {title}
          </span>
        </div>

        {/* Hardware Status Tag */}
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
          {isRealHardware ? 'REAL OS' : 'SIMULATED'}
        </span>
      </div>

      {/* Main Meter Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Circular SVG Meter */}
        <div style={{ position: 'relative', width: '78px', height: '78px', flexShrink: 0 }}>
          <svg width="78" height="78" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="39"
              cy="39"
              r={radius}
              stroke="rgba(0, 243, 255, 0.1)"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Animated Gauge Arc */}
            <circle
              cx="39"
              cy="39"
              r={radius}
              stroke={gaugeColor}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
                filter: `drop-shadow(0 0 4px ${gaugeColor})`,
              }}
            />
          </svg>

          {/* Centered Percentage */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#e6f9ff',
                textShadow: `0 0 6px ${gaugeColor}`,
              }}
            >
              {percent}%
            </span>
          </div>
        </div>

        {/* Detailed Spec Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#d1f4ff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#5e8da3',
              lineHeight: 1.3,
            }}
          >
            {detail}
          </span>

          {/* Historical Trend Sparkline */}
          {history && history.length > 1 && (
            <div style={{ marginTop: '4px' }}>
              <SparklineGraph data={history} color={gaugeColor} width={150} height={20} />
            </div>
          )}

          {/* Activity Bar Segments */}
          <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const active = i < Math.round((percent / 100) * 12);
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '1px',
                    backgroundColor: active ? gaugeColor : 'rgba(0, 243, 255, 0.1)',
                    boxShadow: active ? `0 0 3px ${gaugeColor}` : 'none',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MetricGauge = React.memo(MetricGaugeComponent);
