/**
 * RotationControls Component
 * Play/Pause/Next buttons and timer interval picker
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/Colors';

export interface RotationControlsProps {
  isPlaying: boolean;
  intervalSeconds: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onIntervalChange?: (seconds: number) => void;
}

const INTERVAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export function RotationControls({
  isPlaying,
  intervalSeconds,
  onPlay,
  onPause,
  onNext,
  onIntervalChange,
}: RotationControlsProps) {
  return (
    <View style={styles.container}>
      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={onNext}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonTextSecondary}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={isPlaying ? onPause : onPlay}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonTextPrimary}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
      </View>

      {/* Interval Picker */}
      {onIntervalChange && (
        <View style={styles.intervalContainer}>
          <Text style={styles.intervalLabel}>Timer Interval</Text>
          <View style={styles.intervalOptions}>
            {INTERVAL_OPTIONS.map((seconds) => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.intervalOption,
                  intervalSeconds === seconds && styles.intervalOptionActive,
                ]}
                onPress={() => onIntervalChange(seconds)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.intervalText,
                    intervalSeconds === seconds && styles.intervalTextActive,
                  ]}
                >
                  {seconds}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  intervalContainer: {
    marginTop: Spacing.lg,
  },
  intervalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  intervalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  intervalOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDark,
    minWidth: 50,
    alignItems: 'center',
  },
  intervalOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  intervalText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  intervalTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
