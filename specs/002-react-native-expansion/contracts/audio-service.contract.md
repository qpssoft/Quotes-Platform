# Audio Service Contract

**Purpose**: Audio notification playback for quote transitions (web, mobile, desktop)

## Interface Definition

```typescript
/**
 * Audio notification service interface
 * Platform-specific implementations for web, mobile, desktop
 */
export interface IAudioService {
  /**
   * Load audio file for playback
   * @param audioPath - Path to audio file (relative to assets)
   * @throws AudioError if file cannot be loaded
   */
  load(audioPath: string): Promise<void>;

  /**
   * Play notification sound
   * @throws AudioError if playback fails
   */
  playNotification(): Promise<void>;

  /**
   * Stop current playback
   */
  stop(): Promise<void>;

  /**
   * Set volume (0.0 - 1.0)
   * @param volume - Volume level (0 = mute, 1 = max)
   */
  setVolume(volume: number): Promise<void>;

  /**
   * Get current volume
   * @returns Volume level (0.0 - 1.0)
   */
  getVolume(): number;

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean;

  /**
   * Release audio resources
   */
  release(): Promise<void>;
}

/**
 * Audio error
 */
export class AudioError extends Error {
  constructor(
    message: string,
    public readonly code: 'LOAD_FAILED' | 'PLAYBACK_FAILED' | 'NOT_LOADED'
  ) {
    super(message);
    this.name = 'AudioError';
  }
}
```

## Platform Implementations

### Web (Angular) - Web Audio API

```typescript
// quotes-platform/src/app/core/services/audio/web-audio.service.ts

import { Injectable } from '@angular/core';
import { IAudioService, AudioError } from '@quotes/shared-modules';

@Injectable({ providedIn: 'root' })
export class WebAudioService implements IAudioService {
  private audio: HTMLAudioElement | null = null;
  private volume: number = 0.7;

  async load(audioPath: string): Promise<void> {
    try {
      this.audio = new Audio(audioPath);
      this.audio.volume = this.volume;
      await this.audio.load();
    } catch (error) {
      throw new AudioError(
        `Failed to load audio file: ${audioPath}`,
        'LOAD_FAILED'
      );
    }
  }

  async playNotification(): Promise<void> {
    if (!this.audio) {
      throw new AudioError('Audio not loaded', 'NOT_LOADED');
    }

    try {
      this.audio.currentTime = 0; // Reset to start
      await this.audio.play();
    } catch (error) {
      throw new AudioError('Failed to play audio', 'PLAYBACK_FAILED');
    }
  }

  async stop(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  async release(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}
```

### Mobile (React Native) - Expo Audio

```typescript
// quotes-native/src/services/audio/native-audio.service.ts

import { Audio } from 'expo-av';
import { IAudioService, AudioError } from '@quotes/shared-modules';

export class NativeAudioService implements IAudioService {
  private sound: Audio.Sound | null = null;
  private volume: number = 0.7;
  private isLoaded: boolean = false;

  async load(audioPath: string): Promise<void> {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false
      });

      // Load sound
      const { sound } = await Audio.Sound.createAsync(
        require(audioPath), // Expo requires static paths
        { volume: this.volume }
      );

      this.sound = sound;
      this.isLoaded = true;
    } catch (error) {
      throw new AudioError(
        `Failed to load audio file: ${audioPath}`,
        'LOAD_FAILED'
      );
    }
  }

  async playNotification(): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      throw new AudioError('Audio not loaded', 'NOT_LOADED');
    }

    try {
      await this.sound.setPositionAsync(0); // Reset to start
      await this.sound.playAsync();
    } catch (error) {
      throw new AudioError('Failed to play audio', 'PLAYBACK_FAILED');
    }
  }

  async stop(): Promise<void> {
    if (this.sound && this.isLoaded) {
      await this.sound.stopAsync();
      await this.sound.setPositionAsync(0);
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.sound && this.isLoaded) {
      await this.sound.setVolumeAsync(this.volume);
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isPlaying(): boolean {
    // Note: Expo Audio doesn't provide isPlaying() directly
    // Track state manually or use getStatusAsync()
    return false; // Simplified implementation
  }

  async release(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.isLoaded = false;
    }
  }
}
```

## Usage Example

```typescript
import { IAudioService } from '@quotes/shared-modules';

// Angular
import { WebAudioService } from './web-audio.service';
const audioService: IAudioService = new WebAudioService();

// React Native
import { NativeAudioService } from './native-audio.service';
const audioService: IAudioService = new NativeAudioService();

// Load audio file
await audioService.load('assets/audio/notification.mp3');

// Play notification
await audioService.playNotification();

// Adjust volume
await audioService.setVolume(0.5); // 50%

// Clean up
await audioService.release();
```
