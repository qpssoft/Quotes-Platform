/**
 * Haptic feedback types
 */
export enum HapticFeedbackType {
  /** Light impact (subtle) */
  Light = 'light',
  /** Medium impact (moderate) */
  Medium = 'medium',
  /** Heavy impact (strong) */
  Heavy = 'heavy',
  /** Success notification */
  Success = 'success',
  /** Warning notification */
  Warning = 'warning',
  /** Error notification */
  Error = 'error',
  /** Selection change */
  Selection = 'selection'
}

/**
 * Haptic service interface
 * Platform: Mobile (iOS/Android), Wearables (watchOS/Wear OS)
 * Not implemented: Web, Desktop (no haptic hardware)
 */
export interface IHapticService {
  /**
   * Trigger haptic feedback
   * @param type - Haptic feedback type
   * @throws HapticError if feedback fails
   */
  impact(type: HapticFeedbackType): Promise<void>;

  /**
   * Check if haptic feedback is available on device
   * @returns true if device supports haptic feedback
   */
  isAvailable(): Promise<boolean>;

  /**
   * Enable/disable haptic feedback
   * @param enabled - Enable or disable
   */
  setEnabled(enabled: boolean): void;

  /**
   * Check if haptic feedback is enabled
   */
  isEnabled(): boolean;
}

/**
 * Haptic error
 */
export class HapticError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_AVAILABLE' | 'FAILED'
  ) {
    super(message);
    this.name = 'HapticError';
  }
}
