import React, { useEffect, useRef } from 'react';
import type { CoreVisualState } from '@shared/types';
import { soundFx } from '../common/AudioSynthesizer';

interface ArcReactorCoreProps {
  state: CoreVisualState;
  onCoreClick?: () => void;
  size?: number;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  state,
  onCoreClick,
  size = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotationAngle = 0;
    let counterRotation = 0;
    let pulsePhase = 0;
    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const center = size / 2;

      // Adjust animation speeds based on state
      const speedMultiplier =
        state === 'processing'
          ? 3.2
          : state === 'listening'
          ? 2.0
          : state === 'speaking'
          ? 1.6
          : 0.8;

      rotationAngle += 0.008 * speedMultiplier;
      counterRotation -= 0.012 * speedMultiplier;
      pulsePhase += 0.04 * speedMultiplier;
      waveOffset += 0.08 * speedMultiplier;

      const pulseGlow = Math.sin(pulsePhase) * 0.25 + 0.75;

      // 1. Outer Coordinate Tick Ring (R ~ 98)
      const outerR = size * 0.44;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotationAngle * 0.4);

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, outerR, 0, Math.PI * 2);
      ctx.stroke();

      // Tick markers around the rim
      const totalTicks = 36;
      for (let i = 0; i < totalTicks; i++) {
        const angle = (i * Math.PI * 2) / totalTicks;
        const isMajor = i % 9 === 0;
        const tickLength = isMajor ? 8 : 4;
        ctx.strokeStyle = isMajor ? '#00f3ff' : 'rgba(0, 243, 255, 0.4)';
        ctx.lineWidth = isMajor ? 1.5 : 1;

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (outerR - tickLength), Math.sin(angle) * (outerR - tickLength));
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Segmented Arc Reactor Blocks (R ~ 82)
      const segR = size * 0.36;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(counterRotation);

      const segments = 10;
      for (let i = 0; i < segments; i++) {
        const startA = (i * Math.PI * 2) / segments + 0.08;
        const endA = ((i + 1) * Math.PI * 2) / segments - 0.08;

        ctx.strokeStyle =
          state === 'listening'
            ? 'rgba(0, 255, 170, 0.8)'
            : state === 'processing'
            ? 'rgba(0, 243, 255, 0.95)'
            : 'rgba(0, 150, 255, 0.65)';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = state === 'listening' ? 12 : 6;

        ctx.beginPath();
        ctx.arc(0, 0, segR, startA, endA);
        ctx.stroke();

        // Inner glowing mini notch
        ctx.strokeStyle = 'rgba(230, 250, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, segR - 4, startA + 0.06, endA - 0.06);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Counter-Rotating Chevron Ring (R ~ 60)
      const innerR = size * 0.27;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotationAngle * 1.4);

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Central Arc Reactor Core
      ctx.save();
      ctx.translate(center, center);

      // Core Outer Glow Gradient
      const coreR = size * 0.18;
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, coreR * 1.8);
      if (state === 'listening') {
        grad.addColorStop(0, 'rgba(0, 255, 170, 0.9)');
        grad.addColorStop(0.4, 'rgba(0, 243, 255, 0.6)');
        grad.addColorStop(1, 'rgba(0, 243, 255, 0)');
      } else if (state === 'processing') {
        grad.addColorStop(0, 'rgba(230, 250, 255, 1)');
        grad.addColorStop(0.4, 'rgba(0, 200, 255, 0.8)');
        grad.addColorStop(1, 'rgba(0, 100, 255, 0)');
      } else {
        grad.addColorStop(0, 'rgba(0, 243, 255, 0.85)');
        grad.addColorStop(0.5, 'rgba(0, 119, 255, 0.4)');
        grad.addColorStop(1, 'rgba(0, 50, 150, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, coreR * 1.8 * pulseGlow, 0, Math.PI * 2);
      ctx.fill();

      // Core Disc
      ctx.fillStyle = '#050a12';
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = state === 'listening' ? '#00ffaa' : '#00f3ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10 * pulseGlow;
      ctx.stroke();

      // Interactive audio wave or center symbol
      if (state === 'speaking' || state === 'listening') {
        // Dynamic simulated audio frequency bars inside core
        const barCount = 7;
        const barWidth = 2.5;
        const totalW = barCount * 5;
        const startX = -totalW / 2;

        ctx.fillStyle = state === 'listening' ? '#00ffaa' : '#e6f9ff';
        for (let b = 0; b < barCount; b++) {
          const h = (Math.sin(waveOffset + b * 0.9) * 0.5 + 0.5) * (coreR * 1.1) + 4;
          ctx.fillRect(startX + b * 5, -h / 2, barWidth, h);
        }
      } else {
        // Center triangular reactor pattern
        ctx.rotate(rotationAngle * 0.6);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let p = 0; p < 3; p++) {
          const pAngle = (p * Math.PI * 2) / 3;
          const px = Math.cos(pAngle) * (coreR * 0.55);
          const py = Math.sin(pAngle) * (coreR * 0.55);
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner glowing dot
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state, size]);

  const handleClick = () => {
    soundFx.playClick();
    onCoreClick?.();
  };

  return (
    <div
      onClick={handleClick}
      title="J.A.R.V.I.S. Neural Core (Click to toggle voice mode)"
      role="button"
      tabIndex={0}
      aria-label={`Arc Reactor Core: ${state}. Click to activate voice listening.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Ambient Holographic Halo Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${size * 0.95}px`,
          height: `${size * 0.95}px`,
          borderRadius: '50%',
          background:
            state === 'listening'
              ? 'radial-gradient(circle, rgba(0, 255, 170, 0.25) 0%, rgba(0, 255, 170, 0.06) 50%, transparent 75%)'
              : state === 'processing'
              ? 'radial-gradient(circle, rgba(255, 170, 0, 0.25) 0%, rgba(255, 170, 0, 0.06) 50%, transparent 75%)'
              : state === 'speaking'
              ? 'radial-gradient(circle, rgba(0, 119, 255, 0.28) 0%, rgba(0, 243, 255, 0.08) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(0, 243, 255, 0.18) 0%, rgba(0, 243, 255, 0.04) 50%, transparent 75%)',
          pointerEvents: 'none',
          transition: 'all 0.5s ease',
          zIndex: 0,
        }}
      />

      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ display: 'block', position: 'relative', zIndex: 1 }}
      />

      {/* Floating State Telemetry Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '-24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 10px',
          borderRadius: '12px',
          backgroundColor: 'rgba(5, 12, 22, 0.85)',
          border:
            state === 'listening'
              ? '1px solid #00ffaa'
              : state === 'processing'
              ? '1px solid #ffaa00'
              : '1px solid rgba(0, 243, 255, 0.3)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor:
              state === 'listening'
                ? '#00ffaa'
                : state === 'processing'
                ? '#ffaa00'
                : '#00f3ff',
            boxShadow:
              state === 'listening'
                ? '0 0 8px #00ffaa'
                : state === 'processing'
                ? '0 0 8px #ffaa00'
                : '0 0 8px #00f3ff',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '1.5px',
            color:
              state === 'listening'
                ? '#00ffaa'
                : state === 'processing'
                ? '#ffaa00'
                : '#b3e8f8',
            textTransform: 'uppercase',
          }}
        >
          {state}
        </span>
      </div>
    </div>
  );
};
