import { BrowserWindow } from 'electron';

/**
 * AlwaysOnTopManager - Manages window always-on-top behavior
 * 
 * Features:
 * - Toggle always-on-top mode
 * - Persist state
 * - Visual indicator support
 */
export class AlwaysOnTopManager {
  private window: BrowserWindow;
  private isOnTop: boolean = false;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  /**
   * Enable or disable always-on-top mode
   * @param enabled - Whether to enable always-on-top
   */
  setAlwaysOnTop(enabled: boolean): void {
    this.isOnTop = enabled;
    this.window.setAlwaysOnTop(enabled);
    console.log(`✓ Always-on-top ${enabled ? 'enabled' : 'disabled'}`);
    
    // Notify renderer for UI update
    this.window.webContents.send('window:always-on-top-changed', enabled);
  }

  /**
   * Toggle always-on-top mode
   * @returns New state (true if enabled)
   */
  toggle(): boolean {
    this.setAlwaysOnTop(!this.isOnTop);
    return this.isOnTop;
  }

  /**
   * Check if always-on-top is enabled
   * @returns true if enabled
   */
  isEnabled(): boolean {
    return this.isOnTop;
  }
}
