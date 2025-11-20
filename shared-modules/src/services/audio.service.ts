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
