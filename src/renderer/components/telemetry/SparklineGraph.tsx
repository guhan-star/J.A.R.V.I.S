import React from 'react';

interface SparklineGraphProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
}

export const SparklineGraph: React.FC<SparklineGraphProps> = ({
  data,
  width = 160,
  height = 24,
  color = '#00f3ff',
  fillColor = 'rgba(0, 243, 255, 0.12)',
}) => {
  if (!data || data.length < 2) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: '#3e6275',
        }}
      >
        BUFFERING TELEMETRY...
      </div>
    );
  }

  const min = 0;
  const max = 100;
  const range = max - min || 1;

  // Generate SVG path coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const clampedVal = Math.max(min, Math.min(max, val));
    const y = height - ((clampedVal - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Gradient Area Fill */}
        <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />

        {/* Crisp Neon Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />

        {/* Latest Reading Indicator Dot */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="2"
            fill="#ffffff"
            stroke={color}
            strokeWidth="1"
          />
        )}
      </svg>
    </div>
  );
};
