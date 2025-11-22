import { contextBridge, ipcRenderer } from 'electron';

// Define the API surface exposed to renderer
export interface ElectronAPI {
  // Window controls
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
  
  // Tray controls
  tray: {
    setStatus: (status: 'playing' | 'paused') => Promise<void>;
    updateMenu: () => Promise<void>;
  };
  
  // Overlay controls
  overlay: {
    show: (quote: { text: string; author: string; category?: string }, position?: string) => Promise<boolean>;
    hide: () => Promise<boolean>;
    updateConfig: (config: Record<string, unknown>) => Promise<boolean>;
    getConfig: () => Promise<Record<string, unknown> | null>;
  };
  
  // Preferences
  prefs: {
    save: (prefs: Record<string, unknown>) => Promise<void>;
    load: () => Promise<Record<string, unknown>>;
  };
  
  // Shortcuts
  shortcuts: {
    getRegistered: () => Promise<Array<{ key: string; action: string; description: string }>>;
    getFailed: () => Promise<string[]>;
    register: (key: string, action: string, description: string) => Promise<boolean>;
    unregister: (action: string) => Promise<boolean>;
  };
  
  // Auto-launch
  autoLaunch: {
    set: (enabled: boolean) => Promise<boolean>;
    get: () => Promise<boolean>;
  };
  
  // Always-on-top
  alwaysOnTop: {
    set: (enabled: boolean) => Promise<boolean>;
    toggle: () => Promise<boolean>;
    get: () => Promise<boolean>;
  };
  
  // Auto-updater
  updater: {
    checkForUpdates: () => Promise<{ available: boolean; reason?: string }>;
    checkForUpdatesSilent: () => Promise<{ available: boolean; reason?: string }>;
    getVersion: () => Promise<string>;
    onStatus: (callback: (message: string) => void) => void;
    onProgress: (callback: (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => void;
  };
  
  // Internal IPC for overlay window
  internal: {
    send: (channel: string, ...args: unknown[]) => void;
    on: (channel: string, callback: (...args: unknown[]) => void) => void;
  };
  
  // Event listeners for Angular app
  events: {
    onRotationNext: (callback: () => void) => void;
    onRotationToggle: (callback: () => void) => void;
    onNavigateSettings: (callback: () => void) => void;
    onAlwaysOnTopChanged: (callback: (enabled: boolean) => void) => void;
    onOverlayRequestCurrentQuote: (callback: () => void) => void;
  };
}

// Expose protected methods to renderer process
const electronAPI: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  },
  
  tray: {
    setStatus: (status) => ipcRenderer.invoke('tray:set-status', status),
    updateMenu: () => ipcRenderer.invoke('tray:update-menu'),
  },
  
  overlay: {
    show: (quote, position) => ipcRenderer.invoke('overlay:show', quote, position),
    hide: () => ipcRenderer.invoke('overlay:hide'),
    updateConfig: (config) => ipcRenderer.invoke('overlay:update-config', config),
    getConfig: () => ipcRenderer.invoke('overlay:get-config'),
  },
  
  prefs: {
    save: (prefs) => ipcRenderer.invoke('prefs:save', prefs),
    load: () => ipcRenderer.invoke('prefs:load'),
  },
  
  shortcuts: {
    getRegistered: () => ipcRenderer.invoke('shortcuts:get-registered'),
    getFailed: () => ipcRenderer.invoke('shortcuts:get-failed'),
    register: (key, action, description) => ipcRenderer.invoke('shortcuts:register', key, action, description),
    unregister: (action) => ipcRenderer.invoke('shortcuts:unregister', action),
  },
  
  // Auto-launch
  autoLaunch: {
    set: (enabled) => ipcRenderer.invoke('auto-launch:set', enabled),
    get: () => ipcRenderer.invoke('auto-launch:get'),
  },
  
  // Always-on-top
  alwaysOnTop: {
    set: (enabled) => ipcRenderer.invoke('always-on-top:set', enabled),
    toggle: () => ipcRenderer.invoke('always-on-top:toggle'),
    get: () => ipcRenderer.invoke('always-on-top:get'),
  },
  
  // Auto-updater
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
    checkForUpdatesSilent: () => ipcRenderer.invoke('updater:check-for-updates-silent'),
    getVersion: () => ipcRenderer.invoke('updater:get-version'),
    onStatus: (callback) => {
      ipcRenderer.on('update:status', (_event, message) => callback(message));
    },
    onProgress: (callback) => {
      ipcRenderer.on('update:progress', (_event, progress) => callback(progress));
    },
  },
  
  // Internal IPC for overlay and other windows
  internal: {
    send: (channel, ...args) => {
      // Whitelist allowed channels
      const allowedChannels = ['overlay:clicked', 'overlay:fade-complete'];
      if (allowedChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },
    on: (channel, callback) => {
      // Whitelist allowed channels
      const allowedChannels = ['overlay:display-quote', 'overlay:fade-out'];
      if (allowedChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => callback(...args));
      }
    },
  },
  
  // Event listeners for Angular app
  events: {
    onRotationNext: (callback) => {
      ipcRenderer.on('rotation:next', () => callback());
    },
    onRotationToggle: (callback) => {
      ipcRenderer.on('rotation:toggle', () => callback());
    },
    onNavigateSettings: (callback) => {
      ipcRenderer.on('navigate:settings', () => callback());
    },
    onAlwaysOnTopChanged: (callback) => {
      ipcRenderer.on('window:always-on-top-changed', (_event, enabled) => callback(enabled));
    },
    onOverlayRequestCurrentQuote: (callback) => {
      ipcRenderer.on('overlay:request-current-quote', () => callback());
    },
  },
};

// Expose API to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Expose development helpers
if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow');
}
