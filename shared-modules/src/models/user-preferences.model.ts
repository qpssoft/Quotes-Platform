/**
 * Shared location: shared-modules/models/user-preferences.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 */

import { SyncState } from './sync-state.model';

export enum NotificationPosition {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  MiddleLeft = 'middle-left',
  MiddleCenter = 'middle-center',
  MiddleRight = 'middle-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right'
}

export enum KeyboardShortcut {
  ShowQuote_CtrlC = 'ctrl+c',
  ShowQuote_CtrlX = 'ctrl+x',
  NextQuote_CtrlV = 'ctrl+v',
  NextQuote_CtrlN = 'ctrl+n'
}

export interface KeyboardShortcuts {
  /**
   * Shortcut to show quote overlay (desktop only)
   * Options: Ctrl+C or Ctrl+X (user choice)
   */
  showQuote: KeyboardShortcut.ShowQuote_CtrlC | KeyboardShortcut.ShowQuote_CtrlX;

  /**
   * Shortcut to advance to next quote (desktop only)
   * Options: Ctrl+V or Ctrl+N (user choice)
   */
  nextQuote: KeyboardShortcut.NextQuote_CtrlV | KeyboardShortcut.NextQuote_CtrlN;
}

export interface UserPreferences {
  /**
   * User identifier (UUID v4)
   * Phase 2: Generated locally per device (deviceId)
   * V3+: Firebase Auth UID for cross-device sync
   */
  userId: string;

  /**
   * Auto-rotation timer interval (seconds)
   * Range: 5-60 seconds, step: 5 seconds
   * Default: 15 seconds
   */
  timerInterval: number;

  /**
   * Enable audio notification on quote transitions
   * Default: true (all platforms except wearables)
   */
  soundEnabled: boolean;

  /**
   * Enable haptic feedback on quote transitions
   * Default: true (mobile, wearables), false (web, desktop)
   */
  hapticEnabled: boolean;

  /**
   * Enable background auto-rotation (mobile only)
   * Default: false (requires user permission, battery impact)
   * Requires: iOS background audio permission, Android foreground service
   */
  backgroundMode: boolean;

  /**
   * Favorited quote IDs
   * Stored locally per device in Phase 2
   * V3+: Synced via Firebase Firestore
   */
  favorites: string[];

  /**
   * Reading history (last 100 viewed quotes)
   * Stored locally per device in Phase 2
   * V3+: Synced via Firebase Firestore
   */
  readingHistory: string[];

  /**
   * Notification position (desktop only)
   * Default: BottomRight
   */
  notificationPosition: NotificationPosition;

  /**
   * Keyboard shortcuts (desktop only)
   * Default: { showQuote: 'ctrl+c', nextQuote: 'ctrl+v' }
   */
  keyboardShortcuts: KeyboardShortcuts;

  /**
   * Cloud sync state (V3+ Firebase integration)
   * Phase 2: Null (no sync)
   */
  syncState: SyncState | null;

  /**
   * ISO 8601 timestamp (creation date)
   */
  createdAt: Date;

  /**
   * ISO 8601 timestamp (last modification date)
   */
  updatedAt: Date;
}

/**
 * Type guard for runtime validation
 */
export function isUserPreferences(obj: unknown): obj is UserPreferences {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const p = obj as Partial<UserPreferences>;
  return (
    typeof p.userId === 'string' &&
    typeof p.timerInterval === 'number' &&
    p.timerInterval >= 5 && p.timerInterval <= 60 &&
    typeof p.soundEnabled === 'boolean' &&
    typeof p.hapticEnabled === 'boolean' &&
    typeof p.backgroundMode === 'boolean' &&
    Array.isArray(p.favorites) &&
    p.favorites.every(f => typeof f === 'string') &&
    Array.isArray(p.readingHistory) &&
    p.readingHistory.every(h => typeof h === 'string') &&
    Object.values(NotificationPosition).includes(p.notificationPosition as NotificationPosition) &&
    p.createdAt instanceof Date &&
    p.updatedAt instanceof Date
  );
}

/**
 * Default preferences factory
 */
export function createDefaultPreferences(userId: string, isMobile: boolean = false): UserPreferences {
  const now = new Date();
  return {
    userId,
    timerInterval: 15,
    soundEnabled: true,
    hapticEnabled: isMobile, // Platform-specific default (true on mobile/wearables)
    backgroundMode: false,
    favorites: [],
    readingHistory: [],
    notificationPosition: NotificationPosition.BottomRight,
    keyboardShortcuts: {
      showQuote: KeyboardShortcut.ShowQuote_CtrlC,
      nextQuote: KeyboardShortcut.NextQuote_CtrlV
    },
    syncState: null,
    createdAt: now,
    updatedAt: now
  };
}
