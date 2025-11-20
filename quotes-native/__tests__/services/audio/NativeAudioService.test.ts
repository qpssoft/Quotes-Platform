/**
 * Unit tests for NativeAudioService
 * Tests Expo Audio integration for notification sounds
 */

import { Audio } from 'expo-av';
import { NativeAudioService } from '../../../src/services/audio/NativeAudioService';
import { AudioError } from '@quotes/shared-modules';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

describe('NativeAudioService', () => {
  let service: NativeAudioService;
  let mockSound: any;

  beforeEach(() => {
    // Create mock sound instance
    mockSound = {
      playAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      setPositionAsync: jest.fn().mockResolvedValue(undefined),
      setVolumeAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
    };

    // Mock Audio.Sound.createAsync
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
      status: { isLoaded: true },
    });
    
    // Mock Audio.setAudioModeAsync
    (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);

    service = new NativeAudioService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('should load audio file from assets', async () => {
      const mockAudioPath = 'path/to/audio';
      await service.load(mockAudioPath);

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });

    it('should handle loading errors', async () => {
      (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
        new Error('File not found')
      );

      await expect(service.load('invalid')).rejects.toThrow(AudioError);
    });

    it('should set initial volume when loading', async () => {
      await service.setVolume(0.5);
      await service.load('audio');

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ volume: 0.5 }),
        expect.any(Function)
      );
    });
  });

  describe('playNotification', () => {
    it('should play loaded sound', async () => {
      await service.load('notification');
      await service.playNotification();

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    it('should throw error if sound not loaded', async () => {
      await expect(service.playNotification()).rejects.toThrow(AudioError);
      await expect(service.playNotification()).rejects.toThrow('Audio not loaded');
    });

    it('should handle playback errors', async () => {
      mockSound.playAsync.mockRejectedValueOnce(new Error('Playback failed'));

      await service.load('notification');
      await expect(service.playNotification()).rejects.toThrow(AudioError);
    });

    it('should reset position before playing', async () => {
      await service.load('notification');
      await service.playNotification();

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
    });
  });

  describe('stop', () => {
    it('should stop playing sound and reset position', async () => {
      await service.load('notification');
      await service.playNotification();
      await service.stop();

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
    });

    it('should handle stop errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSound.stopAsync.mockRejectedValueOnce(new Error('Already stopped'));

      await service.load('notification');
      await service.stop();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should do nothing if sound not loaded', async () => {
      await service.stop();
      expect(mockSound.stopAsync).not.toHaveBeenCalled();
    });
  });

  describe('setVolume', () => {
    it('should set volume in valid range (0.0-1.0)', async () => {
      await service.load('notification');
      await service.setVolume(0.7);

      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0.7);
    });

    it('should clamp volume to 0.0 minimum', async () => {
      await service.load('notification');
      await service.setVolume(-0.5);

      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0.0);
    });

    it('should clamp volume to 1.0 maximum', async () => {
      await service.load('notification');
      await service.setVolume(1.5);

      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(1.0);
    });

    it('should update volume before loading', async () => {
      await service.setVolume(0.3);
      expect(service.getVolume()).toBe(0.3);
    });
  });

  describe('getVolume', () => {
    it('should return current volume level', () => {
      expect(service.getVolume()).toBe(0.7); // Default volume
      
      service.setVolume(0.5);
      expect(service.getVolume()).toBe(0.5);
    });
  });

  describe('isPlaying', () => {
    it('should return playing state', () => {
      expect(service.isPlaying()).toBe(false);
    });
  });

  describe('release', () => {
    it('should unload sound and free resources', async () => {
      await service.load('notification');
      await service.release();

      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });

    it('should handle unload errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSound.unloadAsync.mockRejectedValueOnce(new Error('Unload failed'));

      await service.load('notification');
      await service.release();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should reset internal state after release', async () => {
      await service.load('notification');
      await service.release();

      // Should throw error when trying to play after release
      await expect(service.playNotification()).rejects.toThrow('Audio not loaded');
    });

    it('should do nothing if no sound loaded', async () => {
      await service.release();
      expect(mockSound.unloadAsync).not.toHaveBeenCalled();
    });
  });
});
