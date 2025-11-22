import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

/**
 * Electron-specific preferences
 */
export interface ElectronPreferences {
  // System Tray
  systemTray: {
    enabled: boolean;
    minimizeToTray: boolean;
  };
  
  // Keyboard Shortcuts
  shortcuts: {
    toggleOverlay: string;
    nextQuote: string;
    pauseResume: string;
    openSettings: string;
    toggleWindow: string;
  };
  
  // Quote Overlay
  overlay: {
    enabled: boolean;
    position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    duration: number; // seconds (5-30)
    transparency: number; // 0-100
  };
  
  // Auto-launch
  autoLaunch: {
    enabled: boolean;
    startMinimized: boolean;
  };
  
  // Window
  window: {
    alwaysOnTop: boolean;
  };
  
  // Updates
  updates: {
    checkAutomatically: boolean;
  };
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: ElectronPreferences = {
  systemTray: {
    enabled: true,
    minimizeToTray: true,
  },
  shortcuts: {
    toggleOverlay: 'CommandOrControl+Shift+Q',
    nextQuote: 'CommandOrControl+Shift+N',
    pauseResume: 'CommandOrControl+Shift+P',
    openSettings: 'CommandOrControl+Shift+S',
    toggleWindow: 'CommandOrControl+Shift+W',
  },
  overlay: {
    enabled: true,
    position: 'top-right',
    duration: 5,
    transparency: 90,
  },
  autoLaunch: {
    enabled: false,
    startMinimized: true,
  },
  window: {
    alwaysOnTop: false,
  },
  updates: {
    checkAutomatically: true,
  },
};

/**
 * Preferences store with file-based persistence
 */
export class PreferencesStore {
  private filePath: string;
  private preferences: ElectronPreferences;

  constructor(filename: string = 'electron-preferences.json') {
    this.filePath = path.join(app.getPath('userData'), filename);
    this.preferences = this.load();
  }

  /**
   * Load preferences from file
   */
  private load(): ElectronPreferences {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const loaded = JSON.parse(data) as Partial<ElectronPreferences>;
        
        // Merge with defaults to handle new preference fields
        return this.mergeWithDefaults(loaded);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    
    // Return defaults if file doesn't exist or loading failed
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Merge loaded preferences with defaults
   */
  private mergeWithDefaults(loaded: Partial<ElectronPreferences>): ElectronPreferences {
    return {
      systemTray: { ...DEFAULT_PREFERENCES.systemTray, ...loaded.systemTray },
      shortcuts: { ...DEFAULT_PREFERENCES.shortcuts, ...loaded.shortcuts },
      overlay: { ...DEFAULT_PREFERENCES.overlay, ...loaded.overlay },
      autoLaunch: { ...DEFAULT_PREFERENCES.autoLaunch, ...loaded.autoLaunch },
      window: { ...DEFAULT_PREFERENCES.window, ...loaded.window },
      updates: { ...DEFAULT_PREFERENCES.updates, ...loaded.updates },
    };
  }

  /**
   * Save preferences to file
   */
  private save(): boolean {
    try {
      const data = JSON.stringify(this.preferences, null, 2);
      fs.writeFileSync(this.filePath, data, 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }

  /**
   * Get all preferences
   */
  getAll(): ElectronPreferences {
    return { ...this.preferences };
  }

  /**
   * Get a specific preference by path
   */
  get<K extends keyof ElectronPreferences>(
    section: K
  ): ElectronPreferences[K];
  get<K extends keyof ElectronPreferences, S extends keyof ElectronPreferences[K]>(
    section: K,
    key: S
  ): ElectronPreferences[K][S];
  get<K extends keyof ElectronPreferences, S extends keyof ElectronPreferences[K]>(
    section: K,
    key?: S
  ): ElectronPreferences[K] | ElectronPreferences[K][S] {
    if (key === undefined) {
      return this.preferences[section];
    }
    return this.preferences[section][key];
  }

  /**
   * Set preferences (partial update)
   */
  set(prefs: Partial<ElectronPreferences>): boolean {
    // Merge new preferences with existing ones
    this.preferences = this.mergeWithDefaults(prefs as Partial<ElectronPreferences>);
    return this.save();
  }

  /**
   * Update a specific section
   */
  setSection<K extends keyof ElectronPreferences>(
    section: K,
    value: Partial<ElectronPreferences[K]>
  ): boolean {
    this.preferences[section] = { ...this.preferences[section], ...value };
    return this.save();
  }

  /**
   * Update a specific preference
   */
  setSingle<K extends keyof ElectronPreferences, S extends keyof ElectronPreferences[K]>(
    section: K,
    key: S,
    value: ElectronPreferences[K][S]
  ): boolean {
    this.preferences[section][key] = value;
    return this.save();
  }

  /**
   * Reset all preferences to defaults
   */
  reset(): boolean {
    this.preferences = { ...DEFAULT_PREFERENCES };
    return this.save();
  }

  /**
   * Reset a specific section to defaults
   */
  resetSection<K extends keyof ElectronPreferences>(section: K): boolean {
    this.preferences[section] = { ...DEFAULT_PREFERENCES[section] };
    return this.save();
  }

  /**
   * Validate preferences (basic validation)
   */
  validate(prefs: Partial<ElectronPreferences>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate overlay duration (5-30 seconds)
    if (prefs.overlay?.duration !== undefined) {
      if (prefs.overlay.duration < 5 || prefs.overlay.duration > 30) {
        errors.push('Overlay duration must be between 5 and 30 seconds');
      }
    }

    // Validate overlay transparency (0-100)
    if (prefs.overlay?.transparency !== undefined) {
      if (prefs.overlay.transparency < 0 || prefs.overlay.transparency > 100) {
        errors.push('Overlay transparency must be between 0 and 100');
      }
    }

    // Validate overlay position
    if (prefs.overlay?.position !== undefined) {
      const validPositions = [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-center', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ];
      if (!validPositions.includes(prefs.overlay.position)) {
        errors.push(`Invalid overlay position: ${prefs.overlay.position}`);
      }
    }

    // Validate shortcuts (basic check for format)
    if (prefs.shortcuts) {
      Object.entries(prefs.shortcuts).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length < 3) {
          errors.push(`Invalid shortcut for ${key}: ${value}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get file path (for debugging)
   */
  getFilePath(): string {
    return this.filePath;
  }
}

// Export singleton instance
let storeInstance: PreferencesStore | null = null;

export function getPreferencesStore(): PreferencesStore {
  if (!storeInstance) {
    storeInstance = new PreferencesStore();
  }
  return storeInstance;
}

export function resetPreferencesStore(): void {
  storeInstance = null;
}
