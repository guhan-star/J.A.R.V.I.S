import { app, BrowserWindow, shell, globalShortcut } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipc/handlers';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 880,
    minWidth: 1100,
    minHeight: 720,
    frame: false, // Frameless for custom futuristic HUD titlebar
    backgroundColor: '#04070c',
    show: false, // Prevent white flash before content is ready
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  // Register secure IPC handlers
  registerIpcHandlers(mainWindow);

  // Show window smoothly when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Load URL or File
  if (isDev) {
    const loadDevServer = () => {
      mainWindow?.loadURL('http://localhost:5173').catch(() => {
        // Retry after 500ms if Vite dev server is still starting
        setTimeout(loadDevServer, 500);
      });
    };
    loadDevServer();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    // Register global shortcut to summon J.A.R.V.I.S. (Ctrl+Shift+J)
    try {
      globalShortcut.register('CommandOrControl+Shift+J', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          if (!mainWindow.isVisible()) mainWindow.show();
          mainWindow.focus();
        }
      });
    } catch (err: any) {
      console.warn('Could not register global summon shortcut:', err?.message);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
