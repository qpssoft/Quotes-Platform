/**
 * useRotation Hook
 * Manages auto-rotation timer logic for quote display
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RotationService } from '@quotes/shared-modules';
import { Quote } from '@quotes/shared-modules';

export interface UseRotationResult {
  currentQuote: Quote | null;
  isPlaying: boolean;
  intervalSeconds: number;
  play: () => void;
  pause: () => void;
  next: () => void;
  setInterval: (seconds: number) => void;
  reset: () => void;
}

export function useRotation(quotes: Quote[], initialInterval: number = 15): UseRotationResult {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(initialInterval);
  
  const rotationService = useRef(new RotationService()).current;

  // Initialize rotation service with config
  useEffect(() => {
    rotationService.initialize({
      interval: intervalSeconds,
      soundEnabled: false, // Handled externally
      hapticEnabled: false, // Handled externally
      recentQuotesLimit: 10,
    });
  }, [intervalSeconds, rotationService]);

  // Set up transition callback
  useEffect(() => {
    rotationService.onTransition((quote) => {
      setCurrentQuote(quote);
    });
  }, [rotationService]);

  // Initialize with first quote when quotes are loaded
  useEffect(() => {
    if (quotes.length > 0 && !currentQuote) {
      setCurrentQuote(quotes[0]);
    }
  }, [quotes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      rotationService.stop();
    };
  }, [rotationService]);

  // Start auto-rotation
  const play = useCallback(() => {
    if (quotes.length === 0) return;
    
    try {
      const initialQuote = rotationService.start(quotes);
      setCurrentQuote(initialQuote);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start rotation:', error);
    }
  }, [quotes, rotationService]);

  // Pause auto-rotation
  const pause = useCallback(() => {
    rotationService.pause();
    setIsPlaying(false);
  }, [rotationService]);

  // Skip to next quote immediately
  const next = useCallback(() => {
    if (quotes.length === 0) return;
    
    try {
      const nextQuote = rotationService.next(quotes);
      setCurrentQuote(nextQuote);
    } catch (error) {
      console.error('Failed to get next quote:', error);
    }
  }, [quotes, rotationService]);

  // Update interval and restart if playing
  const updateInterval = useCallback((seconds: number) => {
    const clampedInterval = Math.max(5, Math.min(60, seconds)); // Clamp to 5-60s
    setIntervalSeconds(clampedInterval);
    
    if (isPlaying) {
      pause();
      // Will restart with new interval after state update
      setTimeout(() => play(), 0);
    }
  }, [isPlaying, play, pause]);

  // Reset rotation state
  const reset = useCallback(() => {
    rotationService.stop();
    setCurrentQuote(null);
    setIsPlaying(false);
  }, [rotationService]);

  return {
    currentQuote,
    isPlaying,
    intervalSeconds,
    play,
    pause,
    next,
    setInterval: updateInterval,
    reset,
  };
}
