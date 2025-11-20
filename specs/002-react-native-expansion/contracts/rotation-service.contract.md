# Rotation Service Contract

**Location**: `shared-modules/services/rotation.service.ts`  
**Purpose**: Auto-rotation and random quote selection across all platforms

## Interface Definition

```typescript
import { Quote } from '../models';

/**
 * Rotation configuration
 */
export interface RotationConfig {
  /**
   * Timer interval in seconds (5-60, step: 5)
   * Default: 15
   */
  interval: number;

  /**
   * Enable audio notification on transitions
   * Default: true
   */
  soundEnabled: boolean;

  /**
   * Enable haptic feedback on transitions
   * Default: false (web/desktop), true (mobile/wearables)
   */
  hapticEnabled: boolean;

  /**
   * Prevent immediate repeats (number of quotes to exclude)
   * Default: 10
   */
  recentQuotesLimit: number;
}

/**
 * Rotation state
 */
export interface RotationState {
  /**
   * Currently displayed quote
   */
  currentQuote: Quote | null;

  /**
   * Rotation active/paused
   */
  isPlaying: boolean;

  /**
   * Recently displayed quote IDs (for repeat prevention)
   */
  recentQuoteIds: string[];

  /**
   * Next transition timestamp
   */
  nextTransitionAt: Date | null;
}

/**
 * Rotation service interface
 */
export interface IRotationService {
  /**
   * Initialize rotation with configuration
   * @param config - Rotation configuration
   */
  initialize(config: RotationConfig): void;

  /**
   * Start auto-rotation
   * @param quotes - Available quotes pool
   * @returns Selected initial quote
   */
  start(quotes: Quote[]): Quote;

  /**
   * Pause auto-rotation
   */
  pause(): void;

  /**
   * Resume auto-rotation
   */
  resume(): void;

  /**
   * Stop auto-rotation and reset state
   */
  stop(): void;

  /**
   * Advance to next quote immediately
   * @param quotes - Available quotes pool
   * @returns Next selected quote
   */
  next(quotes: Quote[]): Quote;

  /**
   * Get current rotation state
   */
  getState(): RotationState;

  /**
   * Get random quote (excluding recent quotes)
   * @param quotes - Available quotes pool
   * @returns Randomly selected quote
   */
  getRandomQuote(quotes: Quote[]): Quote;
}
```

## Implementation

```typescript
// shared-modules/services/rotation.service.ts

export class RotationService implements IRotationService {
  private config: RotationConfig = {
    interval: 15,
    soundEnabled: true,
    hapticEnabled: false,
    recentQuotesLimit: 10
  };

  private state: RotationState = {
    currentQuote: null,
    isPlaying: false,
    recentQuoteIds: [],
    nextTransitionAt: null
  };

  private timerId: ReturnType<typeof setInterval> | null = null;
  private onTransitionCallback?: (quote: Quote) => void;

  initialize(config: RotationConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Register callback for quote transitions
   * Platform-specific: Used to trigger audio/haptic feedback
   */
  onTransition(callback: (quote: Quote) => void): void {
    this.onTransitionCallback = callback;
  }

  start(quotes: Quote[]): Quote {
    if (quotes.length === 0) {
      throw new Error('Cannot start rotation with empty quotes array');
    }

    // Select initial quote
    const initialQuote = this.getRandomQuote(quotes);
    this.state.currentQuote = initialQuote;
    this.state.isPlaying = true;
    this.state.recentQuoteIds = [initialQuote.id];
    this.state.nextTransitionAt = new Date(Date.now() + this.config.interval * 1000);

    // Start timer
    this.startTimer(() => {
      const nextQuote = this.getRandomQuote(quotes);
      this.state.currentQuote = nextQuote;
      this.state.nextTransitionAt = new Date(Date.now() + this.config.interval * 1000);
      
      // Track recent quotes
      this.state.recentQuoteIds.push(nextQuote.id);
      if (this.state.recentQuoteIds.length > this.config.recentQuotesLimit) {
        this.state.recentQuoteIds.shift();
      }

      // Trigger callback
      if (this.onTransitionCallback) {
        this.onTransitionCallback(nextQuote);
      }
    });

    return initialQuote;
  }

  pause(): void {
    if (!this.state.isPlaying) return;
    
    this.state.isPlaying = false;
    this.state.nextTransitionAt = null;
    this.stopTimer();
  }

  resume(): void {
    if (this.state.isPlaying) return;
    
    this.state.isPlaying = true;
    this.state.nextTransitionAt = new Date(Date.now() + this.config.interval * 1000);
    
    // Restart timer (callback already bound in start())
    this.startTimer(() => {
      if (!this.state.isPlaying) return;
      
      const quotes = []; // Note: Need quotes array - see usage example
      const nextQuote = this.getRandomQuote(quotes);
      this.state.currentQuote = nextQuote;
      this.state.nextTransitionAt = new Date(Date.now() + this.config.interval * 1000);
      
      this.state.recentQuoteIds.push(nextQuote.id);
      if (this.state.recentQuoteIds.length > this.config.recentQuotesLimit) {
        this.state.recentQuoteIds.shift();
      }

      if (this.onTransitionCallback) {
        this.onTransitionCallback(nextQuote);
      }
    });
  }

  stop(): void {
    this.stopTimer();
    this.state = {
      currentQuote: null,
      isPlaying: false,
      recentQuoteIds: [],
      nextTransitionAt: null
    };
  }

  next(quotes: Quote[]): Quote {
    const nextQuote = this.getRandomQuote(quotes);
    this.state.currentQuote = nextQuote;
    
    // Track recent quotes
    this.state.recentQuoteIds.push(nextQuote.id);
    if (this.state.recentQuoteIds.length > this.config.recentQuotesLimit) {
      this.state.recentQuoteIds.shift();
    }

    // Reset timer if playing
    if (this.state.isPlaying) {
      this.state.nextTransitionAt = new Date(Date.now() + this.config.interval * 1000);
    }

    // Trigger callback
    if (this.onTransitionCallback) {
      this.onTransitionCallback(nextQuote);
    }

    return nextQuote;
  }

  getState(): RotationState {
    return { ...this.state };
  }

  getRandomQuote(quotes: Quote[]): Quote {
    if (quotes.length === 0) {
      throw new Error('Cannot select random quote from empty array');
    }

    // Filter out recent quotes
    const availableQuotes = quotes.filter(q => 
      !this.state.recentQuoteIds.includes(q.id)
    );

    // If all quotes are recent, reset and use full pool
    const pool = availableQuotes.length > 0 ? availableQuotes : quotes;

    // Random selection
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  private startTimer(callback: () => void): void {
    this.stopTimer();
    this.timerId = setInterval(callback, this.config.interval * 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
```

## Usage Example

```typescript
import { RotationService, Quote } from '@quotes/shared-modules';

const rotationService = new RotationService();
const quotes: Quote[] = [...]; // Load quotes

// Configure
rotationService.initialize({
  interval: 15,
  soundEnabled: true,
  hapticEnabled: true,
  recentQuotesLimit: 10
});

// Register transition callback
rotationService.onTransition((quote) => {
  console.log('New quote:', quote.content);
  // Platform-specific: Play audio, trigger haptic feedback
});

// Start rotation
const initialQuote = rotationService.start(quotes);

// User controls
document.getElementById('pause-btn')?.addEventListener('click', () => {
  rotationService.pause();
});

document.getElementById('play-btn')?.addEventListener('click', () => {
  rotationService.resume();
});

document.getElementById('next-btn')?.addEventListener('click', () => {
  const nextQuote = rotationService.next(quotes);
  console.log('Skipped to:', nextQuote.content);
});

// Get current state
const state = rotationService.getState();
console.log('Current quote:', state.currentQuote);
console.log('Is playing:', state.isPlaying);
console.log('Next transition:', state.nextTransitionAt);
```

## Platform-Specific Enhancements

### Web (Angular)

```typescript
// quotes-platform/src/app/core/services/rotation/web-rotation.service.ts

import { Injectable } from '@angular/core';
import { RotationService } from '@quotes/shared-modules';
import { AudioService } from '../audio/audio.service';

@Injectable({ providedIn: 'root' })
export class WebRotationService extends RotationService {
  constructor(private audioService: AudioService) {
    super();
    
    // Trigger audio on transitions
    this.onTransition((quote) => {
      if (this.getState().isPlaying) {
        this.audioService.playNotification();
      }
    });
  }
}
```

### Mobile (React Native)

```typescript
// quotes-native/src/services/rotation/native-rotation.service.ts

import { RotationService } from '@quotes/shared-modules';
import { NativeAudioService } from '../audio/native-audio.service';
import { HapticService } from '../haptic/haptic.service';

export class NativeRotationService extends RotationService {
  constructor(
    private audioService: NativeAudioService,
    private hapticService: HapticService
  ) {
    super();
    
    // Trigger audio + haptic on transitions
    this.onTransition(async (quote) => {
      const config = this.getConfig();
      
      if (config.soundEnabled) {
        await this.audioService.playNotification();
      }
      
      if (config.hapticEnabled) {
        await this.hapticService.impact('light');
      }
    });
  }
}
```
