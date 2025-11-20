/**
 * Rotation service for auto-rotation and random quote selection
 * Shared location: shared-modules/services/rotation.service.ts
 */

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
 * Rotation service implementation
 */
export class RotationService {
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
  private quotesPool: Quote[] = [];

  /**
   * Initialize rotation with configuration
   * @param config - Rotation configuration
   */
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

  /**
   * Start auto-rotation
   * @param quotes - Available quotes pool
   * @returns Selected initial quote
   */
  start(quotes: Quote[]): Quote {
    if (quotes.length === 0) {
      throw new Error('Cannot start rotation with empty quotes array');
    }

    this.quotesPool = quotes;

    // Select initial quote
    const initialQuote = this.getRandomQuote(quotes);
    this.state.currentQuote = initialQuote;
    this.state.isPlaying = true;
    this.state.recentQuoteIds = [initialQuote.id];
    this.state.nextTransitionAt = new Date(Date.now() + this.config.interval * 1000);

    // Start timer
    this.startTimer(() => {
      const nextQuote = this.getRandomQuote(this.quotesPool);
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

  /**
   * Pause auto-rotation
   */
  pause(): void {
    if (!this.state.isPlaying) return;
    
    this.state.isPlaying = false;
    this.state.nextTransitionAt = null;
    this.stopTimer();
  }

  /**
   * Resume auto-rotation
   */
  resume(): void {
    if (this.state.isPlaying) return;
    
    this.state.isPlaying = true;
    this.state.nextTransitionAt = new Date(Date.now() + this.config.interval * 1000);
    
    // Restart timer
    this.startTimer(() => {
      if (!this.state.isPlaying) return;
      
      const nextQuote = this.getRandomQuote(this.quotesPool);
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

  /**
   * Stop auto-rotation and reset state
   */
  stop(): void {
    this.stopTimer();
    this.state = {
      currentQuote: null,
      isPlaying: false,
      recentQuoteIds: [],
      nextTransitionAt: null
    };
    this.quotesPool = [];
  }

  /**
   * Advance to next quote immediately
   * @param quotes - Available quotes pool
   * @returns Next selected quote
   */
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

  /**
   * Get current rotation state
   */
  getState(): RotationState {
    return { ...this.state };
  }

  /**
   * Get random quote (excluding recent quotes)
   * @param quotes - Available quotes pool
   * @returns Randomly selected quote
   */
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
