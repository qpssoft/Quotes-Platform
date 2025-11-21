import { BrowserWindow, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Window state (position, size, display)
 */
interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
  displayBounds?: { x: number; y: number; width: number; height: number };
}

/**
 * WindowStateManager - Manages window position and size persistence
 * 
 * Features:
 * - Save window bounds on close
 * - Restore window bounds on startup
 * - Handle multi-monitor scenarios
 * - Validate bounds (ensure window is on-screen)
 */
export class WindowStateManager {
  private window: BrowserWindow;
  private statePath: string;
  private state: WindowState;

  constructor(window: BrowserWindow, statePath: string) {
    this.window = window;
    this.statePath = statePath;
    this.state = this.loadState();
  }

  /**
   * Load saved window state from disk
   */
  private loadState(): WindowState {
    try {
      if (fs.existsSync(this.statePath)) {
        const data = fs.readFileSync(this.statePath, 'utf-8');
        const state = JSON.parse(data) as WindowState;
        
        // Validate state
        if (this.isValidState(state)) {
          console.log('✓ Window state loaded:', state);
          return state;
        }
      }
    } catch (error) {
      console.warn('Failed to load window state:', error);
    }

    // Return default state
    return this.getDefaultState();
  }

  /**
   * Get default window state
   */
  private getDefaultState(): WindowState {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    return {
      x: Math.floor(width * 0.1), // 10% from left
      y: Math.floor(height * 0.1), // 10% from top
      width: Math.floor(width * 0.8), // 80% of screen width
      height: Math.floor(height * 0.8), // 80% of screen height
      isMaximized: false,
      isFullScreen: false,
    };
  }

  /**
   * Validate window state (ensure window is on-screen)
   */
  private isValidState(state: WindowState): boolean {
    // Check if window position is within any display bounds
    const displays = screen.getAllDisplays();
    
    for (const display of displays) {
      const { x, y, width, height } = display.bounds;
      
      // Check if window center is within this display
      const windowCenterX = state.x + state.width / 2;
      const windowCenterY = state.y + state.height / 2;
      
      if (
        windowCenterX >= x &&
        windowCenterX <= x + width &&
        windowCenterY >= y &&
        windowCenterY <= y + height
      ) {
        return true;
      }
    }

    console.warn('Window state is off-screen, using defaults');
    return false;
  }

  /**
   * Apply saved state to window
   */
  applyState(): void {
    // Set bounds
    this.window.setBounds({
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      height: this.state.height,
    });

    // Restore maximized state
    if (this.state.isMaximized) {
      this.window.maximize();
    }

    // Restore fullscreen state
    if (this.state.isFullScreen) {
      this.window.setFullScreen(true);
    }

    console.log('✓ Window state applied');
  }

  /**
   * Save current window state to disk
   */
  saveState(): void {
    try {
      // Get current window bounds
      const bounds = this.window.getBounds();
      const isMaximized = this.window.isMaximized();
      const isFullScreen = this.window.isFullScreen();

      // Get display bounds for validation
      const display = screen.getDisplayMatching(bounds);

      const state: WindowState = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized,
        isFullScreen,
        displayBounds: display.bounds,
      };

      // Ensure directory exists
      const dir = path.dirname(this.statePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to disk
      fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2), 'utf-8');
      console.log('✓ Window state saved');
    } catch (error) {
      console.error('Failed to save window state:', error);
    }
  }

  /**
   * Start tracking window state changes
   */
  track(): void {
    // Save state on window resize/move (debounced)
    let saveTimeout: NodeJS.Timeout | null = null;
    
    const debouncedSave = () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => this.saveState(), 500);
    };

    this.window.on('resize', debouncedSave);
    this.window.on('move', debouncedSave);
    this.window.on('maximize', () => this.saveState());
    this.window.on('unmaximize', () => this.saveState());
    this.window.on('enter-full-screen', () => this.saveState());
    this.window.on('leave-full-screen', () => this.saveState());

    // Save on close
    this.window.on('close', () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      this.saveState();
    });

    console.log('✓ Window state tracking enabled');
  }

  /**
   * Get current window state
   */
  getCurrentState(): WindowState {
    const bounds = this.window.getBounds();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: this.window.isMaximized(),
      isFullScreen: this.window.isFullScreen(),
    };
  }
}
