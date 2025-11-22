import { autoUpdater, UpdateInfo } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import * as log from 'electron-log';

/**
 * Auto-updater manager for the Buddhist Quotes application.
 * 
 * Handles checking for updates, downloading updates, and notifying users.
 * Uses electron-updater with GitHub Releases as the update server.
 */
export class UpdaterManager {
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupLogging();
    this.setupAutoUpdater();
  }

  /**
   * Configure electron-log for auto-updater
   */
  private setupLogging(): void {
    // Configure logging
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
  }

  /**
   * Setup auto-updater configuration and event handlers
   */
  private setupAutoUpdater(): void {
    // Configure auto-updater
    autoUpdater.autoDownload = false; // Ask user before downloading
    autoUpdater.autoInstallOnAppQuit = true; // Install when app quits
    
    // Allow prerelease updates (optional, disable in production)
    // autoUpdater.allowPrerelease = false;

    // Event: Checking for update
    autoUpdater.on('checking-for-update', () => {
      this.sendStatusToRenderer('Checking for updates...');
      log.info('Checking for updates...');
    });

    // Event: Update available
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.sendStatusToRenderer(`Update available: ${info.version}`);
      log.info('Update available:', info);
      
      this.promptForUpdate(info);
    });

    // Event: Update not available
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.sendStatusToRenderer('You are running the latest version.');
      log.info('Update not available. Current version:', info.version);
    });

    // Event: Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      const message = `Downloaded ${Math.round(progressObj.percent)}%`;
      this.sendStatusToRenderer(message);
      this.sendProgressToRenderer(progressObj);
      log.info(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
    });

    // Event: Update downloaded
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.sendStatusToRenderer('Update downloaded. Restart to install.');
      log.info('Update downloaded:', info);
      
      this.promptForRestart(info);
    });

    // Event: Error
    autoUpdater.on('error', (error) => {
      this.sendStatusToRenderer('Error checking for updates.');
      log.error('Error in auto-updater:', error);
      
      // Optionally show error dialog
      // this.showErrorDialog(error);
    });
  }

  /**
   * Send update status to renderer process
   */
  private sendStatusToRenderer(message: string): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update:status', message);
    }
  }

  /**
   * Send download progress to renderer process
   */
  private sendProgressToRenderer(progress: any): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update:progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      });
    }
  }

  /**
   * Show dialog asking user if they want to download the update
   */
  private async promptForUpdate(info: UpdateInfo): Promise<void> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    const releaseNotes = typeof info.releaseNotes === 'string' 
      ? info.releaseNotes 
      : Array.isArray(info.releaseNotes) 
        ? info.releaseNotes.map((note: any) => note.note || '').join('\n')
        : 'No release notes available.';

    const response = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: `Release Notes:\n${releaseNotes}\n\nWould you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });

    if (response.response === 0) {
      // User clicked Download
      this.sendStatusToRenderer('Downloading update...');
      autoUpdater.downloadUpdate();
    }
  }

  /**
   * Show dialog asking user if they want to restart and install the update
   */
  private async promptForRestart(info: UpdateInfo): Promise<void> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    const response = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded.`,
      detail: 'The update will be installed when you restart the application. Would you like to restart now?',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });

    if (response.response === 0) {
      // User clicked Restart Now
      autoUpdater.quitAndInstall(false, true);
    }
  }

  /**
   * Show error dialog (optional)
   */
  private async showErrorDialog(error: Error): Promise<void> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    await dialog.showMessageBox(this.mainWindow, {
      type: 'error',
      title: 'Update Error',
      message: 'Failed to check for updates',
      detail: error.message,
      buttons: ['OK'],
    });
  }

  /**
   * Check for updates manually
   */
  public checkForUpdates(): void {
    log.info('Manual update check triggered');
    autoUpdater.checkForUpdates();
  }

  /**
   * Check for updates and notify user
   * This will show a dialog even if no updates are available
   */
  public async checkForUpdatesAndNotify(): Promise<void> {
    log.info('Check for updates and notify triggered');
    
    try {
      const result = await autoUpdater.checkForUpdates();
      
      if (result && !result.updateInfo) {
        // No updates available, show dialog
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          await dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'No Updates',
            message: 'You are running the latest version.',
            buttons: ['OK'],
          });
        }
      }
    } catch (error) {
      log.error('Error checking for updates:', error);
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        await dialog.showMessageBox(this.mainWindow, {
          type: 'error',
          title: 'Update Check Failed',
          message: 'Failed to check for updates. Please try again later.',
          detail: error instanceof Error ? error.message : String(error),
          buttons: ['OK'],
        });
      }
    }
  }

  /**
   * Setup automatic update checking (every 12 hours)
   */
  public setupAutoCheck(intervalHours: number = 12): void {
    // Check on startup (after 10 seconds)
    setTimeout(() => {
      this.checkForUpdates();
    }, 10000);

    // Check periodically
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    log.info(`Auto-update check configured: every ${intervalHours} hours`);
  }

  /**
   * Stop automatic update checking
   */
  public stopAutoCheck(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
      log.info('Auto-update check stopped');
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopAutoCheck();
    this.mainWindow = null;
  }
}
