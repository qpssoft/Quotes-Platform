# Haptic Service Contract

**Purpose**: Haptic feedback for quote transitions (mobile, wearables only)

## Interface Definition

```typescript
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
```

## Platform Implementations

### Mobile (React Native) - Expo Haptics

```typescript
// quotes-native/src/services/haptic/haptic.service.ts

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
      }
    } catch (error) {
      throw new HapticError('Haptic feedback failed', 'FAILED');
    }
  }

  async isAvailable(): Promise<boolean> {
    // Expo Haptics works on all iOS and Android devices with vibration hardware
    // No explicit availability check in Expo Haptics
    return true;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
```

### Wearables (Apple Watch) - WatchKit Haptic Engine

```swift
// quotes-native/ios/QuotesWatch Extension/WatchHapticService.swift

import WatchKit

enum WatchHapticType: String {
    case notification
    case directionUp
    case directionDown
    case success
    case failure
    case retry
}

class WatchHapticService {
    static let shared = WatchHapticService()
    private var enabled: Bool = true
    
    func impact(type: WatchHapticType) {
        guard enabled else { return }
        
        let hapticType: WKHapticType
        switch type {
        case .notification:
            hapticType = .notification
        case .directionUp:
            hapticType = .directionUp
        case .directionDown:
            hapticType = .directionDown
        case .success:
            hapticType = .success
        case .failure:
            hapticType = .failure
        case .retry:
            hapticType = .retry
        }
        
        WKInterfaceDevice.current().play(hapticType)
    }
    
    func setEnabled(_ enabled: Bool) {
        self.enabled = enabled
    }
    
    func isEnabled() -> Bool {
        return enabled
    }
}
```

### Wearables (Android Wear) - Vibrator API

```kotlin
// quotes-native/android/wear/HapticService.kt

import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator

enum class WearHapticType {
    LIGHT, MEDIUM, HEAVY, SUCCESS, WARNING, ERROR
}

class HapticService(private val context: Context) {
    private val vibrator: Vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    private var enabled: Boolean = true

    fun impact(type: WearHapticType) {
        if (!enabled || !vibrator.hasVibrator()) return

        val effect = when (type) {
            WearHapticType.LIGHT -> 
                VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE)
            WearHapticType.MEDIUM -> 
                VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE)
            WearHapticType.HEAVY -> 
                VibrationEffect.createOneShot(150, VibrationEffect.DEFAULT_AMPLITUDE)
            WearHapticType.SUCCESS -> 
                VibrationEffect.createWaveform(longArrayOf(0, 50, 50, 50), -1)
            WearHapticType.WARNING -> 
                VibrationEffect.createWaveform(longArrayOf(0, 100, 100, 100), -1)
            WearHapticType.ERROR -> 
                VibrationEffect.createWaveform(longArrayOf(0, 150, 50, 150), -1)
        }

        vibrator.vibrate(effect)
    }

    fun isAvailable(): Boolean {
        return vibrator.hasVibrator()
    }

    fun setEnabled(enabled: Boolean) {
        this.enabled = enabled
    }

    fun isEnabled(): Boolean {
        return enabled
    }
}
```

## Usage Example

```typescript
import { IHapticService, HapticFeedbackType } from '@quotes/shared-modules';
import { HapticService } from './haptic.service';

const hapticService: IHapticService = new HapticService();

// Check availability
const available = await hapticService.isAvailable();
if (!available) {
  console.warn('Haptic feedback not available on this device');
}

// Light impact on quote transition
await hapticService.impact(HapticFeedbackType.Light);

// Success notification
await hapticService.impact(HapticFeedbackType.Success);

// Disable haptic feedback
hapticService.setEnabled(false);

// Check if enabled
if (hapticService.isEnabled()) {
  await hapticService.impact(HapticFeedbackType.Medium);
}
```

## Battery Optimization (Wearables)

```typescript
// Reduce haptic intensity at low battery
export class BatteryAwareHapticService implements IHapticService {
  constructor(
    private innerService: IHapticService,
    private batteryService: IBatteryService
  ) {}

  async impact(type: HapticFeedbackType): Promise<void> {
    const batteryLevel = await this.batteryService.getLevel();

    // Disable haptic at critical battery (<10%)
    if (batteryLevel < 0.10) {
      return; // No haptic feedback
    }

    // Reduce intensity at low battery (<20%)
    if (batteryLevel < 0.20) {
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
```
