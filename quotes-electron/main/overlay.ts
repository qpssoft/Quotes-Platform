import { BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';

/**
 * Position enum for overlay placement
 */
export enum OverlayPosition {
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  TOP_RIGHT = 'top-right',
  MIDDLE_LEFT = 'middle-left',
  MIDDLE_CENTER = 'middle-center',
  MIDDLE_RIGHT = 'middle-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center',
  BOTTOM_RIGHT = 'bottom-right',
}

/**
 * Quote interface for overlay display
 */
export interface Quote {
  text: string;
  author: string;
  category?: string;
}

/**
 * Overlay configuration
 */
interface OverlayConfig {
  position: OverlayPosition;
  displayDuration: number; // milliseconds
  width: number;
  height: number;
  margin: number; // pixels from edge
  opacity: number; // 0.0 to 1.0
  clickThrough: boolean;
}

/**
 * OverlayManager - Manages the floating quote overlay window
 * 
 * Features:
 * - Frameless transparent window
 * - 9-position grid placement
 * - Multi-monitor support
 * - Auto-dismiss timer
 * - Click-to-dismiss
 * - Smooth animations
 */
export class OverlayManager {
  private overlayWindow: BrowserWindow | null = null;
  private autoDismissTimer: NodeJS.Timeout | null = null;
  private config: OverlayConfig = {
    position: OverlayPosition.TOP_RIGHT,
    displayDuration: 5000, // 5 seconds default
    width: 500,
    height: 200,
    margin: 20,
    opacity: 0.95,
    clickThrough: false,
  };

  /**
   * Create the overlay window (hidden initially)
   */
  create(): void {
    if (this.overlayWindow) {
      console.log('Overlay window already exists');
      return;
    }

    console.log('Creating overlay window...');

    this.overlayWindow = new BrowserWindow({
      width: this.config.width,
      height: this.config.height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      show: false, // Start hidden
      focusable: !this.config.clickThrough,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/preload.js'),
      },
    });

    // Load overlay HTML
    const overlayPath = path.join(__dirname, '../../overlay/index.html');
    this.overlayWindow.loadFile(overlayPath)
      .then(() => console.log('✓ Overlay window created'))
      .catch((err: Error) => console.error('✗ Failed to load overlay:', err));

    // Set click-through if enabled
    if (this.config.clickThrough) {
      this.overlayWindow.setIgnoreMouseEvents(true);
    }

    // Handle window closed
    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
      if (this.autoDismissTimer) {
        clearTimeout(this.autoDismissTimer);
        this.autoDismissTimer = null;
      }
    });

    // Setup IPC listeners
    this.setupIpcListeners();
  }

  /**
   * Show the overlay with a quote
   */
  show(quote: Quote, position?: OverlayPosition): void {
    if (!this.overlayWindow) {
      console.error('Overlay window not created yet');
      return;
    }

    console.log(`Showing overlay: "${quote.text.substring(0, 50)}..."`);

    // Update position if provided
    if (position) {
      this.config.position = position;
    }

    // Calculate and set position
    const { x, y } = this.calculatePosition();
    this.overlayWindow.setPosition(x, y);

    // Set opacity
    this.overlayWindow.setOpacity(this.config.opacity);

    // Send quote data to overlay renderer
    this.overlayWindow.webContents.send('overlay:display-quote', quote);

    // Show window with fade-in animation
    this.overlayWindow.showInactive(); // Show without stealing focus

    // Setup auto-dismiss timer
    this.setupAutoDismiss();
  }

  /**
   * Hide the overlay
   */
  hide(): void {
    if (!this.overlayWindow) {
      return;
    }

    console.log('Hiding overlay');

    // Clear auto-dismiss timer
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }

    // Trigger fade-out animation
    this.overlayWindow.webContents.send('overlay:fade-out');

    // Hide after animation (300ms)
    setTimeout(() => {
      if (this.overlayWindow) {
        this.overlayWindow.hide();
      }
    }, 300);
  }

  /**
   * Update overlay configuration
   */
  updateConfig(config: Partial<OverlayConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('Overlay config updated:', this.config);

    // Update window properties if it exists
    if (this.overlayWindow) {
      if (config.width || config.height) {
        this.overlayWindow.setSize(this.config.width, this.config.height);
      }
      if (config.opacity !== undefined) {
        this.overlayWindow.setOpacity(this.config.opacity);
      }
      if (config.clickThrough !== undefined) {
        this.overlayWindow.setIgnoreMouseEvents(config.clickThrough);
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): OverlayConfig {
    return { ...this.config };
  }

  /**
   * Destroy the overlay window
   */
  destroy(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }

    if (this.overlayWindow) {
      this.overlayWindow.destroy();
      this.overlayWindow = null;
      console.log('✓ Overlay window destroyed');
    }
  }

  /**
   * Calculate overlay position based on config and screen
   */
  private calculatePosition(): { x: number; y: number } {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight, x: screenX, y: screenY } = primaryDisplay.workArea;

    const { width, height, margin, position } = this.config;

    let x = screenX;
    let y = screenY;

    // Calculate horizontal position
    switch (position) {
      case OverlayPosition.TOP_LEFT:
      case OverlayPosition.MIDDLE_LEFT:
      case OverlayPosition.BOTTOM_LEFT:
        x = screenX + margin;
        break;
      case OverlayPosition.TOP_CENTER:
      case OverlayPosition.MIDDLE_CENTER:
      case OverlayPosition.BOTTOM_CENTER:
        x = screenX + (screenWidth - width) / 2;
        break;
      case OverlayPosition.TOP_RIGHT:
      case OverlayPosition.MIDDLE_RIGHT:
      case OverlayPosition.BOTTOM_RIGHT:
        x = screenX + screenWidth - width - margin;
        break;
    }

    // Calculate vertical position
    switch (position) {
      case OverlayPosition.TOP_LEFT:
      case OverlayPosition.TOP_CENTER:
      case OverlayPosition.TOP_RIGHT:
        y = screenY + margin;
        break;
      case OverlayPosition.MIDDLE_LEFT:
      case OverlayPosition.MIDDLE_CENTER:
      case OverlayPosition.MIDDLE_RIGHT:
        y = screenY + (screenHeight - height) / 2;
        break;
      case OverlayPosition.BOTTOM_LEFT:
      case OverlayPosition.BOTTOM_CENTER:
      case OverlayPosition.BOTTOM_RIGHT:
        y = screenY + screenHeight - height - margin;
        break;
    }

    console.log(`Overlay position: ${position} at (${x}, ${y})`);
    return { x, y };
  }

  /**
   * Setup auto-dismiss timer
   */
  private setupAutoDismiss(): void {
    // Clear existing timer
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }

    // Set new timer
    this.autoDismissTimer = setTimeout(() => {
      console.log('Auto-dismissing overlay');
      this.hide();
    }, this.config.displayDuration);
  }

  /**
   * Setup IPC listeners for overlay interaction
   */
  private setupIpcListeners(): void {
    // Click to dismiss
    ipcMain.on('overlay:clicked', () => {
      console.log('Overlay clicked, dismissing');
      this.hide();
    });

    // Notify when fade-out complete
    ipcMain.on('overlay:fade-complete', () => {
      console.log('Overlay fade-out complete');
    });
  }
}
