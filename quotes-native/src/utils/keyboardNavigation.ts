/**
 * Keyboard Navigation Utilities
 * Provides keyboard navigation support for desktop platforms
 */

import { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';

export interface KeyboardNavigationConfig {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onSpace?: () => void;
}

/**
 * Hook to add keyboard navigation to a component
 */
export function useKeyboardNavigation(config: KeyboardNavigationConfig) {
  const isDesktop = Platform.OS === 'windows' || Platform.OS === 'macos';
  
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          if (config.onEnter) {
            event.preventDefault();
            config.onEnter();
          }
          break;
        case 'Escape':
          if (config.onEscape) {
            event.preventDefault();
            config.onEscape();
          }
          break;
        case 'ArrowUp':
          if (config.onArrowUp) {
            event.preventDefault();
            config.onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (config.onArrowDown) {
            event.preventDefault();
            config.onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (config.onArrowLeft) {
            event.preventDefault();
            config.onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (config.onArrowRight) {
            event.preventDefault();
            config.onArrowRight();
          }
          break;
        case 'Tab':
          if (config.onTab) {
            event.preventDefault();
            config.onTab();
          }
          break;
        case ' ':
          if (config.onSpace) {
            event.preventDefault();
            config.onSpace();
          }
          break;
      }
    };

    // Add event listener to document (web-like behavior)
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [config, isDesktop]);
}

/**
 * Hook for managing focus order in a list or grid
 */
export function useFocusableList(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setFocusedIndex(current => {
      switch (direction) {
        case 'up':
        case 'left':
          return current > 0 ? current - 1 : current;
        case 'down':
        case 'right':
          return current < itemCount - 1 ? current + 1 : current;
        default:
          return current;
      }
    });
  }, [itemCount]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyNavigation,
  };
}

/**
 * Hook for grid navigation (2D)
 */
export function useFocusableGrid(rows: number, columns: number) {
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedColumn, setFocusedColumn] = useState(0);

  const handleKeyNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    switch (direction) {
      case 'up':
        setFocusedRow(current => Math.max(0, current - 1));
        break;
      case 'down':
        setFocusedRow(current => Math.min(rows - 1, current + 1));
        break;
      case 'left':
        setFocusedColumn(current => Math.max(0, current - 1));
        break;
      case 'right':
        setFocusedColumn(current => Math.min(columns - 1, current + 1));
        break;
    }
  }, [rows, columns]);

  const focusedIndex = focusedRow * columns + focusedColumn;

  return {
    focusedRow,
    focusedColumn,
    focusedIndex,
    handleKeyNavigation,
    setFocusedRow,
    setFocusedColumn,
  };
}

/**
 * Check if current platform supports keyboard navigation
 */
export function supportsKeyboardNavigation(): boolean {
  return Platform.OS === 'windows' || Platform.OS === 'macos';
}
