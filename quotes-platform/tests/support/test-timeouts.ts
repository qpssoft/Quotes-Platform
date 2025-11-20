/**
 * Centralized timeout constants for e2e tests
 * All values are in milliseconds
 */
export enum TestTimeout {
  /** Short delay for quick UI updates (100ms) */
  SHORT = 100,

  /** Short-medium delay for debounce and minor transitions (300ms) */
  SHORT_MEDIUM = 300,

  /** Medium delay for standard UI operations (500ms) */
  MEDIUM = 500,

  /** Medium-long delay for search debounce (600ms) */
  MEDIUM_DEBOUNCE = 600,

  /** Standard delay for component initialization (1000ms / 1s) */
  STANDARD = 1000,

  /** Long delay for empty state rendering (1500ms / 1.5s) */
  EMPTY_STATE = 1500,

  /** Extra long delay for rotation service startup (2000ms / 2s) */
  ROTATION_STARTUP = 2000,

  /** Very long delay for error scenarios (3000ms / 3s) */
  ERROR_SCENARIO = 3000,

  /** Quote rotation interval with buffer (16000ms / 16s = 15s timer + 1s buffer) */
  ROTATION_INTERVAL = 16000,

  /** Maximum wait for pause button to appear (20000ms / 20s) */
  PAUSE_BUTTON_MAX = 20000,

  /** Grid visibility timeout (30000ms / 30s) */
  GRID_VISIBILITY = 30000,
}

/**
 * Helper function to convert seconds to milliseconds for dynamic timeouts
 * @param seconds - Number of seconds
 * @param bufferMs - Optional buffer to add (default: 0)
 * @returns Timeout in milliseconds
 */
export function secondsToMs(seconds: number, bufferMs: number = 0): number {
  return seconds * 1000 + bufferMs;
}
