import { Injectable, NgZone, inject } from '@angular/core';
import { RotationService } from './rotation.service';

/**
 * ElectronService - Bridge between Angular and Electron main process
 * 
 * Provides:
 * - Access to Electron APIs via window.electronAPI
 * - Event listeners for shortcuts and menu actions
 * - Type-safe wrapper around IPC communication
 */
@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private electronAPI: any;
  private rotationService = inject(RotationService);

  constructor(private ngZone: NgZone) {
    // Check if running in Electron
    this.electronAPI = (window as any).electronAPI;
    
    if (this.isElectron()) {
      console.log('✓ Electron API available');
      this.setupEventListeners();
    } else {
      console.log('Running in browser mode (no Electron API)');
    }
  }

  /**
   * Check if running in Electron environment
   */
  isElectron(): boolean {
    return !!this.electronAPI;
  }

  /**
   * Setup event listeners for Electron IPC events
   */
  private setupEventListeners(): void {
    // Listen for rotation:next from shortcuts/menu
    this.electronAPI.events.onRotationNext(() => {
      this.ngZone.run(() => {
        console.log('Electron event: rotation:next');
        // Dispatch custom event for rotation component to handle
        window.dispatchEvent(new CustomEvent('electron:rotation:next'));
      });
    });

    // Listen for rotation:toggle from shortcuts/menu
    this.electronAPI.events.onRotationToggle(() => {
      this.ngZone.run(() => {
        console.log('Electron event: rotation:toggle');
        // Dispatch custom event for rotation component to handle
        window.dispatchEvent(new CustomEvent('electron:rotation:toggle'));
      });
    });

    // Listen for navigate:settings from shortcuts/menu
    this.electronAPI.events.onNavigateSettings(() => {
      this.ngZone.run(() => {
        console.log('Electron event: navigate:settings');
        // Dispatch custom event for app component to handle
        window.dispatchEvent(new CustomEvent('electron:navigate:settings'));
      });
    });

    // Listen for always-on-top changes
    this.electronAPI.events.onAlwaysOnTopChanged((enabled: boolean) => {
      this.ngZone.run(() => {
        console.log('Electron event: always-on-top-changed', enabled);
        window.dispatchEvent(new CustomEvent('electron:always-on-top-changed', { 
          detail: { enabled } 
        }));
      });
    });

    // Listen for overlay request current quote
    this.electronAPI.events.onOverlayRequestCurrentQuote(() => {
      this.ngZone.run(() => {
        console.log('Electron event: overlay:request-current-quote');
        const quote = this.rotationService.currentQuote();
        if (quote) {
          console.log('Showing overlay with current quote:', quote.content.substring(0, 50) + '...');
          // Map Quote model to overlay format
          this.electronAPI.overlay.show({
            text: quote.content,
            author: quote.author,
            category: quote.type
          });
        } else {
          console.warn('No current quote available to show');
        }
      });
    });

    console.log('✓ Electron event listeners registered');
  }

  // ============================================================================
  // Overlay API
  // ============================================================================

  async showOverlay(quote: { text: string; author: string; category?: string }, position?: string): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.overlay.show(quote, position);
  }

  async hideOverlay(): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.overlay.hide();
  }

  async updateOverlayConfig(config: any): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.overlay.updateConfig(config);
  }

  async getOverlayConfig(): Promise<any> {
    if (!this.isElectron()) return null;
    return await this.electronAPI.overlay.getConfig();
  }

  // ============================================================================
  // Auto-Launch API
  // ============================================================================

  async setAutoLaunch(enabled: boolean): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.autoLaunch.set(enabled);
  }

  async getAutoLaunch(): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.autoLaunch.get();
  }

  // ============================================================================
  // Always-on-Top API
  // ============================================================================

  async setAlwaysOnTop(enabled: boolean): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.alwaysOnTop.set(enabled);
  }

  async toggleAlwaysOnTop(): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.alwaysOnTop.toggle();
  }

  async getAlwaysOnTop(): Promise<boolean> {
    if (!this.isElectron()) return false;
    return await this.electronAPI.alwaysOnTop.get();
  }

  // ============================================================================
  // Shortcuts API
  // ============================================================================

  async getRegisteredShortcuts(): Promise<Array<{ key: string; action: string; description: string }>> {
    if (!this.isElectron()) return [];
    return await this.electronAPI.shortcuts.getRegistered();
  }

  async getFailedShortcuts(): Promise<string[]> {
    if (!this.isElectron()) return [];
    return await this.electronAPI.shortcuts.getFailed();
  }
}
