import { Tray, Menu, BrowserWindow, nativeImage, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private isPlaying: boolean = true;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  public create(): void {
    const iconPath = this.getIconPath();
    
    // Create icon from path or use empty image as fallback
    let icon: Electron.NativeImage;
    if (fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath);
      icon = icon.resize({ width: 16, height: 16 });
    } else {
      // Create a simple colored square as fallback
      console.warn(`Tray icon not found at ${iconPath}, using fallback`);
      icon = nativeImage.createEmpty();
    }
    
    this.tray = new Tray(icon);
    this.tray.setToolTip('Buddhist Quotes');
    
    // Left-click: Show/Hide window
    this.tray.on('click', () => {
      this.toggleWindow();
    });
    
    // Right-click: Show context menu (will be implemented in T202)
    this.tray.on('right-click', () => {
      this.showContextMenu();
    });
  }

  public updateStatus(status: 'playing' | 'paused'): void {
    this.isPlaying = status === 'playing';
    
    if (!this.tray) return;
    
    const tooltip = this.isPlaying
      ? 'Buddhist Quotes - Playing' 
      : 'Buddhist Quotes - Paused';
    
    this.tray.setToolTip(tooltip);
    
    // Update menu to reflect new status
    this.updateContextMenu();
  }

  public updateContextMenu(): void {
    if (!this.tray) return;
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: this.mainWindow?.isVisible() ? 'Hide' : 'Show',
        click: () => {
          this.toggleWindow();
        }
      },
      { type: 'separator' },
      {
        label: this.isPlaying ? 'Pause Rotation' : 'Resume Rotation',
        click: () => {
          this.togglePlayback();
        }
      },
      {
        label: 'Next Quote',
        accelerator: 'CommandOrControl+Shift+N',
        click: () => {
          this.nextQuote();
        }
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => {
          this.openSettings();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'CommandOrControl+Q',
        click: () => {
          app.quit();
        }
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  private toggleWindow(): void {
    if (!this.mainWindow) return;
    
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  private showContextMenu(): void {
    this.updateContextMenu();
  }

  private togglePlayback(): void {
    // Send IPC message to renderer to toggle playback
    this.mainWindow?.webContents.send('rotation:toggle');
    
    // Toggle local state (will be synced back from renderer)
    this.isPlaying = !this.isPlaying;
    this.updateContextMenu();
  }

  private nextQuote(): void {
    // Send IPC message to renderer to show next quote
    this.mainWindow?.webContents.send('rotation:next');
  }

  private openSettings(): void {
    // Show window and navigate to settings (will be implemented later)
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
      this.mainWindow.webContents.send('navigate:settings');
    }
  }

  private getIconPath(): string {
    // Determine platform-specific icon
    const platform = process.platform;
    let iconName = 'tray-icon.png';
    
    if (platform === 'win32') {
      iconName = 'tray-icon.ico';
    } else if (platform === 'darwin') {
      iconName = 'tray-iconTemplate.png'; // macOS template icon
    }
    
    const isDev = !app.isPackaged;
    const iconPath = isDev
      ? path.join(__dirname, '../../assets', iconName)
      : path.join(process.resourcesPath, 'assets', iconName);
    
    return iconPath;
  }
}
