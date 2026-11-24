# J.A.R.V.I.S. Desktop // Mark IV Interface

A futuristic Windows desktop AI assistant application inspired by JARVIS from Iron Man. Built with **Electron**, **React**, **TypeScript**, **Vite**, and high-performance **HTML5 Canvas / CSS HUD animations**.

---

## ⚡ Features

- **Futuristic HUD Aesthetics**: Dark matte-black background (`#03060a`), electric cyan (`#00f3ff`) and arc blue (`#0077ff`) lighting, subtle CRT scanlines, and angular chamfered borders.
- **Central Animated Arc Reactor AI Core**: Multi-ring concentric rotating visualization with real-time responsive states (`IDLE`, `LISTENING`, `PROCESSING`, and `SPEAKING`).
- **Tactical Audio Synthesizer**: Zero-dependency Web Audio API sound generator for sci-fi chimes, alerts, and clicks (fully toggleable/mutable).
- **Secure Electron Architecture**: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and strictly typed IPC channels via `contextBridge`.
- **Operating System Telemetry**: Live CPU thread loads and physical RAM allocation directly probed from Node.js `os` bindings, transparently labeled alongside simulated auxiliary power metrics.
- **Left Navigation Deck**: Quick directive creation, conversation history selector, System Monitor, Applications launcher, Diagnostics suite, and Settings.
- **Central Holographic Chat Stream**: Interactive message logs with timestamp tags, subsystem badges, and prompt directive chips.
- **Right Diagnostics Panel**: Real-time circular metric gauges for CPU & RAM, Battery state & power flux, tactical chronometer (Local & UTC), and defense threat matrix (`DEFCON 5`).
- **Bottom Command Omnibar**: Terminal prompt (`JARVIS:~$ `), command dispatch, connection ping status, and microphone voice toggle with animated frequency waveforms.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+ or v11+)

### Installation
Dependencies are already installed in this directory:
```bash
npm install
```

### Running in Development (with HMR)
Starts the Vite dev server and launches Electron with live hot reload:
```bash
npm run dev
```

### Running the Production Desktop Application
Builds the bundle and runs the native desktop app:
```bash
npm run build
npm start
```

---

## 📂 Project Architecture

```
JArvis/
├── package.json               # Scripts, Electron, React & devDependencies
├── tsconfig.json              # Renderer TypeScript configuration
├── tsconfig.node.json         # Main & Preload TypeScript configuration
├── vite.config.ts             # Vite build & bundle configuration
├── index.html                 # HTML shell with strict CSP & HUD fonts
├── dist/                      # Compiled production binaries & assets
└── src/
    ├── main/                  # Electron Main Process (Node.js)
    │   ├── index.ts           # Frameless window lifecycle & setup
    │   ├── ipc/               # Secure registered IPC handlers
    │   └── services/          # Real OS telemetry & AI response engine
    ├── preload/               # Secure Sandboxed Bridge
    │   └── index.ts           # Exposes window.jarvisAPI via contextBridge
    ├── shared/                # Shared TypeScript contracts & schemas
    │   ├── types.ts           # Strongly typed telemetry, chat, and API models
    │   └── constants.ts       # IPC channel constants
    └── renderer/              # React 19 Frontend
        ├── App.tsx            # Main layout orchestrator
        ├── styles/            # HUD variables, scanline filters, neon glows
        ├── components/
        │   ├── common/        # TitleBar, Sci-Fi Audio Synthesizer
        │   ├── core/          # ArcReactorCore, CoreStatusGreeting
        │   ├── sidebar/       # LeftSidebar & conversation history
        │   ├── chat/          # ChatInterface, MessageBubble, QuickActionChips
        │   ├── telemetry/     # RightPanel, MetricGauge, PowerWidget, ClockWidget
        │   ├── command/       # BottomCommandBar & animated waveform
        │   └── views/         # MonitorView, ApplicationsView, DiagnosticsView, SettingsView
        └── index.tsx          # React DOM entry
```

---

## 🛡️ Security Model

- **No Unrestricted Shell Access**: The renderer cannot execute arbitrary terminal commands.
- **Strict Isolation**: Render processes are sandboxed and completely decoupled from Node internals.
- **Content Security Policy (CSP)**: Blocks unauthorized external scripts and assets.
