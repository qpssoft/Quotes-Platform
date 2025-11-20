/**
 * Native Audio Service (React Native Implementation)
 * Uses Expo Audio API for playing notification sounds
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { IAudioService, AudioError } from '@quotes/shared-modules';

export class NativeAudioService implements IAudioService {
  private sound: Audio.Sound | null = null;
  private volume: number = 0.7;
  private isLoaded: boolean = false;
  private playing: boolean = false;

  async load(audioPath: string): Promise<void> {
    try {
      // Configure audio mode for iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load sound - audioPath should be a require() result for Expo
      const { sound } = await Audio.Sound.createAsync(
        audioPath as any, // Expo requires static paths via require()
        { volume: this.volume },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.isLoaded = true;
    } catch (error) {
      throw new AudioError(
        `Failed to load audio file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LOAD_FAILED'
      );
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      this.playing = status.isPlaying;
    }
  };

  async playNotification(): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      throw new AudioError('Audio not loaded', 'NOT_LOADED');
    }

    try {
      await this.sound.setPositionAsync(0); // Reset to start
      await this.sound.playAsync();
    } catch (error) {
      throw new AudioError(
        `Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PLAYBACK_FAILED'
      );
    }
  }

  async stop(): Promise<void> {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.stopAsync();
        await this.sound.setPositionAsync(0);
      } catch (error) {
        console.error('Failed to stop audio:', error);
      }
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.setVolumeAsync(this.volume);
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  async release(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        console.error('Failed to release audio:', error);
      } finally {
        this.sound = null;
        this.isLoaded = false;
        this.playing = false;
      }
    }
  }
}

// Export singleton instance
export const audioService = new NativeAudioService();
