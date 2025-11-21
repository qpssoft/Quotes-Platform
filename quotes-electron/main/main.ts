import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { TrayManager } from './tray';
import { ShortcutManager } from './shortcuts';
import { OverlayManager, OverlayPosition } from './overlay';
import { AutoLaunchManager } from './auto-launch';
import { AlwaysOnTopManager } from './always-on-top';
import { MenuManager } from './menu';
import { WindowStateManager } from './window-state';

let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let shortcutManager: ShortcutManager | null = null;
let overlayManager: OverlayManager | null = null;
let alwaysOnTopManager: AlwaysOnTopManager | null = null;
let menuManager: MenuManager | null = null;
let windowStateManager: WindowStateManager | null = null;
let isQuitting = false;

function createWindow(): void {
  console.log('Creating main window...');
  
  // Initialize window state manager
  const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Buddhist Quotes',
    show: false, // Don't show until state is applied
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
  });

  // Setup window state persistence
  windowStateManager = new WindowStateManager(mainWindow, stateFilePath);
  windowStateManager.applyState();
  windowStateManager.track();
  
  // Show window after state is applied
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load Angular app
  const rendererPath = path.join(__dirname, '../../renderer/index.html');
  console.log('Loading renderer from:', rendererPath);
  console.log('Renderer exists:', require('fs').existsSync(rendererPath));
  
  mainWindow.loadFile(rendererPath)
    .then(() => console.log('✓ Renderer loaded successfully'))
    .catch((err: Error) => console.error('✗ Failed to load renderer:', err));

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    trayManager = null;
  });

  // Handle close button - minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      console.log('Window hidden to tray');
    }
  });

  // Create system tray
  console.log('Creating system tray...');
  trayManager = new TrayManager(mainWindow);
  trayManager.create();
  console.log('✓ System tray created');

  // Setup global keyboard shortcuts
  console.log('Setting up keyboard shortcuts...');
  shortcutManager = new ShortcutManager(mainWindow);
  shortcutManager.registerDefaults();
  console.log('✓ Keyboard shortcuts registered');

  // Create overlay window (hidden)
  console.log('Creating overlay window...');
  overlayManager = new OverlayManager();
  overlayManager.create();
  console.log('✓ Overlay window ready');

  // Connect overlay to shortcut manager
  shortcutManager.setOverlayManager(overlayManager);

  // Setup always-on-top manager
  alwaysOnTopManager = new AlwaysOnTopManager(mainWindow);
  console.log('✓ Always-on-top manager initialized');

  // Create application menu
  menuManager = new MenuManager(mainWindow);
  menuManager.create();
  console.log('✓ Application menu created');
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, recreate window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before quit, set flag to allow window close
app.on('before-quit', () => {
  isQuitting = true;
  // Clean up shortcuts
  if (shortcutManager) {
    shortcutManager.unregisterAll();
  }
  // Clean up overlay
  if (overlayManager) {
    overlayManager.destroy();
  }
});

// Setup IPC handlers for tray menu actions
ipcMain.on('rotation:status', (_event, status: 'playing' | 'paused') => {
  trayManager?.updateStatus(status);
});

// IPC handlers for shortcut management
ipcMain.handle('shortcuts:get-registered', () => {
  return shortcutManager?.getRegistered() || [];
});

ipcMain.handle('shortcuts:get-failed', () => {
  return shortcutManager?.getFailed() || [];
});

ipcMain.handle('shortcuts:register', (_event, key: string, action: string, description: string) => {
  if (!shortcutManager) return false;
  // For custom shortcuts, we'd need to map actions to callbacks
  // This is a placeholder for future settings UI
  console.log(`Custom shortcut registration requested: ${key} → ${action}`);
  return false; // Not implemented yet
});

ipcMain.handle('shortcuts:unregister', (_event, action: string) => {
  return shortcutManager?.unregister(action) || false;
});

// IPC handlers for overlay window
ipcMain.handle('overlay:show', (_event, quote: { text: string; author: string; category?: string }, position?: string) => {
  if (!overlayManager) return false;
  
  // Convert position string to enum if provided
  const overlayPosition = position ? (position as OverlayPosition) : undefined;
  
  overlayManager.show(quote, overlayPosition);
  return true;
});

ipcMain.handle('overlay:hide', () => {
  if (!overlayManager) return false;
  overlayManager.hide();
  return true;
});

ipcMain.handle('overlay:update-config', (_event, config: any) => {
  if (!overlayManager) return false;
  overlayManager.updateConfig(config);
  return true;
});

ipcMain.handle('overlay:get-config', () => {
  return overlayManager?.getConfig() || null;
});

// IPC handlers for auto-launch
ipcMain.handle('auto-launch:set', (_event, enabled: boolean) => {
  AutoLaunchManager.setAutoLaunch(enabled);
  return true;
});

ipcMain.handle('auto-launch:get', () => {
  return AutoLaunchManager.isAutoLaunchEnabled();
});

// IPC handlers for always-on-top
ipcMain.handle('always-on-top:set', (_event, enabled: boolean) => {
  alwaysOnTopManager?.setAlwaysOnTop(enabled);
  return true;
});

ipcMain.handle('always-on-top:toggle', () => {
  return alwaysOnTopManager?.toggle() || false;
});

ipcMain.handle('always-on-top:get', () => {
  return alwaysOnTopManager?.isEnabled() || false;
});

// IPC handlers for window state
ipcMain.handle('window:get-state', () => {
  return windowStateManager?.getCurrentState() || null;
});

ipcMain.handle('window:save-state', () => {
  windowStateManager?.saveState();
  return true;
});
