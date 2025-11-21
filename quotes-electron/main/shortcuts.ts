import { globalShortcut, BrowserWindow, dialog } from 'electron';
import type { OverlayManager } from './overlay';

/**
 * ShortcutManager - Manages global keyboard shortcuts for the application
 * 
 * Features:
 * - Register and unregister shortcuts
 * - Conflict detection
 * - Default shortcuts configuration
 * - Customization support via IPC
 */

export interface ShortcutConfig {
  key: string;
  action: string;
  description: string;
  callback: () => void;
}

export class ShortcutManager {
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private mainWindow: BrowserWindow;
  private failedShortcuts: string[] = [];
  private overlayManager: OverlayManager | null = null;

  constructor(mainWindow: BrowserWindow, overlayManager?: OverlayManager) {
    this.mainWindow = mainWindow;
    this.overlayManager = overlayManager || null;
  }

  /**
   * Set overlay manager (can be set after construction)
   */
  setOverlayManager(overlayManager: OverlayManager): void {
    this.overlayManager = overlayManager;
  }

  /**
   * Register a keyboard shortcut
   * @param key - Accelerator string (e.g., 'Ctrl+Shift+Q')
   * @param action - Action identifier
   * @param description - Human-readable description
   * @param callback - Function to execute when shortcut is triggered
   * @returns true if successful, false if failed
   */
  register(key: string, action: string, description: string, callback: () => void): boolean {
    try {
      // Check if already registered
      if (this.shortcuts.has(action)) {
        console.warn(`Shortcut for action "${action}" already registered`);
        return false;
      }

      // Try to register the shortcut
      const success = globalShortcut.register(key, () => {
        console.log(`Shortcut triggered: ${key} (${action})`);
        callback();
      });

      if (success) {
        this.shortcuts.set(action, { key, action, description, callback });
        console.log(`✓ Registered shortcut: ${key} → ${description}`);
        return true;
      } else {
        console.warn(`✗ Failed to register shortcut: ${key} (may be in use by another app)`);
        this.failedShortcuts.push(key);
        return false;
      }
    } catch (error) {
      console.error(`Error registering shortcut ${key}:`, error);
      this.failedShortcuts.push(key);
      return false;
    }
  }

  /**
   * Unregister a specific shortcut by action name
   */
  unregister(action: string): boolean {
    const shortcut = this.shortcuts.get(action);
    if (!shortcut) {
      console.warn(`No shortcut found for action: ${action}`);
      return false;
    }

    globalShortcut.unregister(shortcut.key);
    this.shortcuts.delete(action);
    console.log(`✓ Unregistered shortcut: ${shortcut.key}`);
    return true;
  }

  /**
   * Unregister all shortcuts
   */
  unregisterAll(): void {
    globalShortcut.unregisterAll();
    this.shortcuts.clear();
    this.failedShortcuts = [];
    console.log('✓ All shortcuts unregistered');
  }

  /**
   * Register default application shortcuts
   */
  registerDefaults(): void {
    console.log('Registering default shortcuts...');

    const defaults: Array<Omit<ShortcutConfig, 'callback'> & { callbackFn: () => void }> = [
      {
        key: 'Ctrl+Shift+Q',
        action: 'overlay:show',
        description: 'Show overlay with current quote',
        callbackFn: () => this.showOverlay(),
      },
      {
        key: 'Ctrl+Shift+N',
        action: 'rotation:next',
        description: 'Show next quote',
        callbackFn: () => this.nextQuote(),
      },
      {
        key: 'Ctrl+Shift+P',
        action: 'rotation:toggle',
        description: 'Play/Pause rotation',
        callbackFn: () => this.toggleRotation(),
      },
      {
        key: 'Ctrl+Shift+S',
        action: 'settings:open',
        description: 'Open settings',
        callbackFn: () => this.openSettings(),
      },
      {
        key: 'Ctrl+Shift+W',
        action: 'window:toggle',
        description: 'Show/Hide main window',
        callbackFn: () => this.toggleWindow(),
      },
    ];

    // Register each shortcut
    defaults.forEach(({ key, action, description, callbackFn }) => {
      this.register(key, action, description, callbackFn);
    });

    // Show warning if any shortcuts failed
    if (this.failedShortcuts.length > 0) {
      this.showConflictWarning();
    } else {
      console.log(`✓ All ${defaults.length} shortcuts registered successfully`);
    }
  }

  /**
   * Get list of registered shortcuts
   */
  getRegistered(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values()).map(({ key, action, description }) => ({
      key,
      action,
      description,
      callback: () => {}, // Don't expose callbacks
    }));
  }

  /**
   * Get list of failed shortcuts
   */
  getFailed(): string[] {
    return [...this.failedShortcuts];
  }

  /**
   * Show conflict warning dialog
   */
  private showConflictWarning(): void {
    const message = `Some keyboard shortcuts could not be registered:\n\n${this.failedShortcuts.join('\n')}\n\nThese shortcuts may be in use by another application. You can customize shortcuts in Settings.`;

    dialog.showMessageBox(this.mainWindow, {
      type: 'warning',
      title: 'Shortcut Conflicts Detected',
      message: 'Keyboard Shortcut Conflicts',
      detail: message,
      buttons: ['OK', 'Open Settings'],
    }).then((result) => {
      if (result.response === 1) {
        this.openSettings();
      }
    });
  }

  // ============================================================================
  // Shortcut Action Handlers
  // ============================================================================

  private showOverlay(): void {
    console.log('Action: Show overlay');
    
    // Request current quote from renderer, then show overlay
    this.mainWindow.webContents.send('overlay:request-current-quote');
  }

  private nextQuote(): void {
    console.log('Action: Next quote');
    this.mainWindow.webContents.send('rotation:next');
  }

  private toggleRotation(): void {
    console.log('Action: Toggle rotation');
    this.mainWindow.webContents.send('rotation:toggle');
  }

  private openSettings(): void {
    console.log('Action: Open settings');
    this.mainWindow.webContents.send('navigate:settings');
    this.mainWindow.show();
  }

  private toggleWindow(): void {
    console.log('Action: Toggle window');
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }
}
