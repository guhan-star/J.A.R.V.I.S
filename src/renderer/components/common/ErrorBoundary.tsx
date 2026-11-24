import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { soundFx } from './AudioSynthesizer';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    soundFx.playDiagnosticPulse();
    console.error('Tactical UI Subsystem Crash caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    soundFx.playClick();
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: 'rgba(6, 10, 18, 0.95)',
          }}
        >
          <div
            className="hud-panel hud-corner-cut-sm"
            style={{
              maxWidth: '650px',
              width: '100%',
              padding: '28px',
              backgroundColor: 'rgba(15, 6, 10, 0.9)',
              border: '1px solid #ff2a4b',
              boxShadow: '0 0 24px rgba(255, 42, 75, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 42, 75, 0.15)',
                  border: '1px solid rgba(255, 42, 75, 0.4)',
                }}
              >
                <ShieldAlert size={24} color="#ff2a4b" />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-orbitron)',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#ff6b82',
                    letterSpacing: '1.5px',
                  }}
                >
                  {this.props.fallbackTitle || 'SUBSYSTEM RENDERING FAULT'}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#8da6b5',
                    marginTop: '2px',
                  }}
                >
                  ANOMALOUS EXCEPTION TRAPPED // PERIMETER ISOLATION ENGAGED
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(3, 5, 8, 0.85)',
                border: '1px solid rgba(255, 42, 75, 0.25)',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#ffcdd5',
                maxHeight: '160px',
                overflowY: 'auto',
                lineHeight: '1.5',
              }}
            >
              {this.state.error?.message || 'An unexpected rendering error interrupted this subsystem view.'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="hud-corner-cut-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  backgroundColor: 'rgba(255, 42, 75, 0.2)',
                  border: '1px solid #ff2a4b',
                  color: '#ffffff',
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <RefreshCw size={12} />
                <span>RE-ENGAGE SUBSYSTEM</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
