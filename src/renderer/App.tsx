import React, { useState, useEffect, useCallback } from 'react';
import type { SystemTelemetry, ChatMessage, CoreVisualState, DiagnosticResult } from '@shared/types';
import { TitleBar } from './components/common/TitleBar';
import { LeftSidebar, type NavView } from './components/sidebar/LeftSidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { MonitorView } from './components/views/MonitorView';
import { ApplicationsView } from './components/views/ApplicationsView';
import { DiagnosticsView } from './components/views/DiagnosticsView';
import { SettingsView } from './components/views/SettingsView';
import { RightPanel } from './components/telemetry/RightPanel';
import { BottomCommandBar } from './components/command/BottomCommandBar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { BackgroundParticles } from './components/common/BackgroundParticles';
import { soundFx } from './components/common/AudioSynthesizer';
import './styles/globals.css';

export const App: React.FC = () => {
  // Navigation View
  const [currentView, setCurrentView] = useState<NavView>('chat');

  // Core Visual State: 'idle' | 'listening' | 'processing' | 'speaking'
  const [coreState, setCoreState] = useState<CoreVisualState>('idle');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  // System Telemetry
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);

  // Holographic Scanlines
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);

  // Chat Messages & History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'jarvis',
      content:
        'Good morning, Sir. All Mark IV systems are online and fully operational. Local hardware telemetry is actively synced via secure IPC channels. How may I direct your workflow?',
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'protocol',
      metadata: {
        confidenceScore: 0.998,
        affectedSubsystems: ['CORE_AI', 'HOST_TELEMETRY', 'AUDIO_TACTICAL'],
      },
    },
  ]);

  const [historyItems, setHistoryItems] = useState([
    { id: 'sess-1', title: 'System Diagnostics & Perimeter Scan', time: '09:22:15', active: true },
    { id: 'sess-2', title: 'Arc Reactor Flux Calibration', time: '08:45:00', active: false },
    { id: 'sess-3', title: 'Defense Clearance Protocol 4', time: 'Yesterday', active: false },
  ]);

  // Subscribe to real-time system telemetry and load persistent conversation history
  useEffect(() => {
    // Initial fetch telemetry
    if (window.jarvisAPI?.getSystemTelemetry) {
      window.jarvisAPI.getSystemTelemetry().then(setTelemetry).catch(() => {});
    }

    // Load persistent chat history if available
    if (window.jarvisAPI?.getChatHistory) {
      window.jarvisAPI.getChatHistory().then((saved) => {
        if (saved && saved.length > 0) {
          setMessages(saved);
        }
      }).catch(() => {});
    }

    // Live stream listener
    if (window.jarvisAPI?.onTelemetryUpdate) {
      const unsubscribe = window.jarvisAPI.onTelemetryUpdate((data) => {
        setTelemetry(data);
      });
      return unsubscribe;
    }
  }, []);

  // Handle User Message Dispatch
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCoreState('processing');

    try {
      if (window.jarvisAPI?.sendMessage) {
        const response = await window.jarvisAPI.sendMessage(text);
        setCoreState('speaking');
        soundFx.playMessageChime();
        setMessages((prev) => [...prev, response]);

        // Return to idle after speech interval
        setTimeout(() => {
          setCoreState('idle');
        }, 2200);
      } else {
        // Fallback simulation in dev preview
        setTimeout(() => {
          setCoreState('speaking');
          soundFx.playMessageChime();
          setMessages((prev) => [
            ...prev,
            {
              id: `jarvis-${Date.now()}`,
              sender: 'jarvis',
              content: `Acknowledged, Sir. Executing directive for "${text}". Subsystems reporting normal throughput.`,
              timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              type: 'text',
              metadata: { confidenceScore: 0.99, affectedSubsystems: ['CORE_AI'] },
            },
          ]);
          setTimeout(() => setCoreState('idle'), 1800);
        }, 900);
      }
    } catch {
      setCoreState('idle');
    }
  }, []);

  // Handle Voice Toggle
  const handleToggleVoice = useCallback(() => {
    if (!isVoiceActive) {
      setIsVoiceActive(true);
      setCoreState('listening');

      // Simulated voice prompt recognition after 3 seconds of listening
      const voiceTimer = setTimeout(() => {
        handleSendMessage('Run full diagnostics and verify defense perimeter');
        setIsVoiceActive(false);
      }, 3500);

      return () => clearTimeout(voiceTimer);
    } else {
      setIsVoiceActive(false);
      setCoreState('idle');
    }
  }, [isVoiceActive, handleSendMessage]);

  // Handle New Conversation
  const handleNewConversation = () => {
    window.jarvisAPI?.clearChatHistory?.();
    setMessages([
      {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        content: 'New tactical directive buffer initialized. Standing by for instructions.',
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'protocol',
        metadata: { confidenceScore: 1.0, affectedSubsystems: ['DIRECTIVE_BUFFER'] },
      },
    ]);
    const newSessionId = `sess-${Date.now()}`;
    setHistoryItems((prev) => [
      {
        id: newSessionId,
        title: `Directive Session #${prev.length + 1}`,
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        active: true,
      },
      ...prev.map((i) => ({ ...i, active: false })),
    ]);
    setCurrentView('chat');
  };

  // Handle Clear History
  const handleClearHistory = () => {
    window.jarvisAPI?.clearChatHistory?.();
    setHistoryItems([]);
    setMessages([]);
  };

  const handleSelectHistoryItem = (id: string) => {
    setHistoryItems((prev) =>
      prev.map((item) => ({
        ...item,
        active: item.id === id,
      }))
    );
    setCurrentView('chat');
  };

  // Run Diagnostics callback for DiagnosticView
  const handleRunDiagnostics = async (): Promise<DiagnosticResult[]> => {
    if (window.jarvisAPI?.runDiagnostic) {
      return await window.jarvisAPI.runDiagnostic();
    }
    return [];
  };

  // App launch simulation
  const handleLaunchApp = (appName: string) => {
    handleSendMessage(`Initialize tactical module: ${appName}`);
    setCurrentView('chat');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#03060a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background HUD Grid */}
      <div className="hud-grid-background" />

      {/* Optional CRT Scanlines */}
      {scanlinesEnabled && <div className="scanline-overlay" />}

      {/* Ambient Neural Background Particles */}
      <BackgroundParticles />

      {/* Top Windows 11 HUD Title Bar */}
      <TitleBar />

      {/* Main Multi-Column HUD Layout */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Sidebar */}
        <LeftSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewConversation={handleNewConversation}
          onClearHistory={handleClearHistory}
          historyItems={historyItems}
          onSelectHistoryItem={handleSelectHistoryItem}
        />

        {/* Central Area: Dynamic Views */}
        <main style={{ flex: 1, height: '100%', display: 'flex', overflow: 'hidden' }}>
          <ErrorBoundary fallbackTitle={`${currentView.toUpperCase()} VIEW SUBSYSTEM FAILURE`}>
            <div key={currentView} className="view-transition-container">
              {currentView === 'chat' && (
                <ChatInterface
                  messages={messages}
                  coreState={coreState}
                  onCoreClick={handleToggleVoice}
                  onSelectAction={handleSendMessage}
                />
              )}

              {currentView === 'monitor' && <MonitorView telemetry={telemetry} />}

              {currentView === 'apps' && <ApplicationsView onLaunchApp={handleLaunchApp} />}

              {currentView === 'diagnostics' && (
                <DiagnosticsView onRunDiagnostics={handleRunDiagnostics} />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  scanlinesEnabled={scanlinesEnabled}
                  onToggleScanlines={setScanlinesEnabled}
                />
              )}
            </div>
          </ErrorBoundary>
        </main>

        {/* Right Telemetry Diagnostics Panel */}
        <RightPanel telemetry={telemetry} />
      </div>

      {/* Bottom Command Omnibar & Voice Controller */}
      <BottomCommandBar
        onSendMessage={handleSendMessage}
        coreState={coreState}
        onToggleVoice={handleToggleVoice}
        isVoiceActive={isVoiceActive}
      />
    </div>
  );
};
export default App;
