/**
 * Unit tests for HapticService
 * Tests Expo Haptics integration for tactile feedback
 */

import * as Haptics from 'expo-haptics';
import { HapticService, BatteryAwareHapticService } from '../../../src/services/haptic/HapticService';
import { HapticFeedbackType, HapticError } from '@quotes/shared-modules';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

describe('HapticService', () => {
  let service: HapticService;

  beforeEach(() => {
    service = new HapticService();
    jest.clearAllMocks();
  });

  describe('impact', () => {
    it('should trigger light impact feedback', async () => {
      await service.impact(HapticFeedbackType.Light);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should trigger medium impact feedback', async () => {
      await service.impact(HapticFeedbackType.Medium);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should trigger heavy impact feedback', async () => {
      await service.impact(HapticFeedbackType.Heavy);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('should trigger success notification', async () => {
      await service.impact(HapticFeedbackType.Success);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    });

    it('should trigger warning notification', async () => {
      await service.impact(HapticFeedbackType.Warning);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);
    });

    it('should trigger error notification', async () => {
      await service.impact(HapticFeedbackType.Error);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
    });

    it('should trigger selection feedback', async () => {
      await service.impact(HapticFeedbackType.Selection);
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should not trigger if service is disabled', async () => {
      service.setEnabled(false);
      await service.impact(HapticFeedbackType.Light);
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should handle haptic errors', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptic not supported'));

      try {
        await service.impact(HapticFeedbackType.Light);
        fail('Should have thrown HapticError');
      } catch (error) {
        expect(error).toBeInstanceOf(HapticError);
        expect((error as HapticError).message).toContain('Haptic feedback failed');
      }
    });

    it('should warn on unknown feedback type', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      await service.impact('UnknownType' as any);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown haptic feedback type'));
      consoleWarnSpy.mockRestore();
    });
  });

  describe('isAvailable', () => {
    it('should return true (Expo Haptics works on all devices)', async () => {
      const available = await service.isAvailable();
      expect(available).toBe(true);
    });
  });

  describe('setEnabled', () => {
    it('should enable/disable haptic feedback', async () => {
      service.setEnabled(false);
      await service.impact(HapticFeedbackType.Light);
      expect(Haptics.impactAsync).not.toHaveBeenCalled();

      service.setEnabled(true);
      await service.impact(HapticFeedbackType.Light);
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('isEnabled', () => {
    it('should return current enabled state', () => {
      expect(service.isEnabled()).toBe(true);

      service.setEnabled(false);
      expect(service.isEnabled()).toBe(false);

      service.setEnabled(true);
      expect(service.isEnabled()).toBe(true);
    });
  });
});

describe('BatteryAwareHapticService', () => {
  let innerService: HapticService;
  let batteryAwareService: BatteryAwareHapticService;
  let mockGetBatteryLevel: jest.Mock;

  beforeEach(() => {
    innerService = new HapticService();
    mockGetBatteryLevel = jest.fn();
    batteryAwareService = new BatteryAwareHapticService(innerService, mockGetBatteryLevel);
    jest.clearAllMocks();
  });

  describe('impact with battery awareness', () => {
    it('should trigger normal feedback at high battery (>20%)', async () => {
      mockGetBatteryLevel.mockResolvedValue(0.8); // 80%
      
      await batteryAwareService.impact(HapticFeedbackType.Heavy);
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('should downgrade to Light at low battery (<20%)', async () => {
      mockGetBatteryLevel.mockResolvedValue(0.15); // 15%
      
      await batteryAwareService.impact(HapticFeedbackType.Heavy);
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should downgrade Medium to Light at low battery', async () => {
      mockGetBatteryLevel.mockResolvedValue(0.18); // 18%
      
      await batteryAwareService.impact(HapticFeedbackType.Medium);
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should disable haptic at critical battery (<10%)', async () => {
      mockGetBatteryLevel.mockResolvedValue(0.05); // 5%
      
      await batteryAwareService.impact(HapticFeedbackType.Heavy);
      
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should not downgrade Light feedback', async () => {
      mockGetBatteryLevel.mockResolvedValue(0.15); // 15%
      
      await batteryAwareService.impact(HapticFeedbackType.Light);
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should not downgrade notification types', async () => {
      mockGetBatteryLevel.mockResolvedValue(0.15); // 15%
      
      await batteryAwareService.impact(HapticFeedbackType.Success);
      
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    });
  });

  describe('delegation methods', () => {
    it('should delegate isAvailable to inner service', async () => {
      const available = await batteryAwareService.isAvailable();
      expect(available).toBe(true);
    });

    it('should delegate setEnabled to inner service', () => {
      batteryAwareService.setEnabled(false);
      expect(innerService.isEnabled()).toBe(false);
    });

    it('should delegate isEnabled to inner service', () => {
      innerService.setEnabled(false);
      expect(batteryAwareService.isEnabled()).toBe(false);
    });
  });
});
