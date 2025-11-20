/**
 * Haptic Service (React Native Implementation)
 * Uses Expo Haptics API for tactile feedback on mobile devices
 */

import * as Haptics from 'expo-haptics';
import { IHapticService, HapticFeedbackType, HapticError } from '@quotes/shared-modules';

export class HapticService implements IHapticService {
  private enabled: boolean = true;

  async impact(type: HapticFeedbackType): Promise<void> {
    if (!this.enabled) return;

    try {
      switch (type) {
        case HapticFeedbackType.Light:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticFeedbackType.Medium:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticFeedbackType.Heavy:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticFeedbackType.Success:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticFeedbackType.Warning:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticFeedbackType.Error:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case HapticFeedbackType.Selection:
          await Haptics.selectionAsync();
          break;
        default:
          console.warn(`Unknown haptic feedback type: ${type}`);
      }
    } catch (error) {
      throw new HapticError(
        `Haptic feedback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FAILED'
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    // Expo Haptics works on all iOS and Android devices with vibration hardware
    // No explicit availability check in Expo Haptics API
    // Assume available on physical devices
    return true;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Battery-aware haptic service wrapper
 * Reduces or disables haptic feedback at low battery levels
 */
export class BatteryAwareHapticService implements IHapticService {
  constructor(
    private innerService: IHapticService,
    private getBatteryLevel: () => Promise<number>
  ) {}

  async impact(type: HapticFeedbackType): Promise<void> {
    const batteryLevel = await this.getBatteryLevel();

    // Disable haptic at critical battery (<10%)
    if (batteryLevel < 0.1) {
      return;
    }

    // Reduce intensity at low battery (<20%)
    if (batteryLevel < 0.2) {
      // Downgrade to Light intensity
      if (type === HapticFeedbackType.Medium || type === HapticFeedbackType.Heavy) {
        type = HapticFeedbackType.Light;
      }
    }

    await this.innerService.impact(type);
  }

  async isAvailable(): Promise<boolean> {
    return this.innerService.isAvailable();
  }

  setEnabled(enabled: boolean): void {
    this.innerService.setEnabled(enabled);
  }

  isEnabled(): boolean {
    return this.innerService.isEnabled();
  }
}

// Export singleton instance
export const hapticService = new HapticService();
