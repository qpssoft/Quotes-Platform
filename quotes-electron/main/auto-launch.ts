import { app } from 'electron';

/**
 * AutoLaunchManager - Manages application auto-launch on system startup
 * 
 * Features:
 * - Cross-platform support (Windows, macOS, Linux)
 * - Start minimized to tray
 * - Enable/disable via settings
 */
export class AutoLaunchManager {
  /**
   * Enable or disable auto-launch on system startup
   * @param enabled - Whether to enable auto-launch
   * @param openAsHidden - Whether to start minimized to tray (default: true)
   */
  static setAutoLaunch(enabled: boolean, openAsHidden: boolean = true): void {
    try {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        openAsHidden: openAsHidden,
        // On Windows, specify path to executable (optional)
        path: app.getPath('exe'),
        // On macOS, provide app name (optional)
        name: 'Buddhist Quotes',
      });

      console.log(`✓ Auto-launch ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to set auto-launch:', error);
    }
  }

  /**
   * Check if auto-launch is currently enabled
   * @returns true if auto-launch is enabled
   */
  static isAutoLaunchEnabled(): boolean {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  }

  /**
   * Get current auto-launch settings
   * @returns Login item settings
   */
  static getSettings(): Electron.LoginItemSettings {
    return app.getLoginItemSettings();
  }
}
