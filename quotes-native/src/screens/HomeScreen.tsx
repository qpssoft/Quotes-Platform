/**
 * HomeScreen
 * Main quotes screen with continuous display and auto-rotation
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { QuoteCard } from '../components/QuoteCard';
import { RotationControls } from '../components/RotationControls';
import { useQuotes } from '../hooks/useQuotes';
import { useRotation } from '../hooks/useRotation';
import { usePreferences } from '../hooks/usePreferences';
import { Colors } from '../constants/Colors';
import { HapticService } from '../services/haptic/HapticService';
import { NativeAudioService } from '../services/audio/NativeAudioService';

const hapticService = new HapticService();
const audioService = new NativeAudioService();

// Preload audio notification (optional - may not exist in development)
let notificationAudio: any = null;
try {
  notificationAudio = require('../../assets/audio/notification.mp3');
} catch (error) {
  console.warn('Audio notification file not found. Audio features will be disabled.');
}

export function HomeScreen() {
  const { quotes, loading, error } = useQuotes();
  const { preferences, updateTimerInterval } = usePreferences();
  const {
    currentQuote,
    isPlaying,
    intervalSeconds,
    play,
    pause,
    next,
    setInterval,
  } = useRotation(quotes, preferences.timerInterval);

  // Initialize audio service
  useEffect(() => {
    if (notificationAudio) {
      audioService.load(notificationAudio).catch((error) => {
        console.error('Failed to load audio:', error);
      });
    }

    return () => {
      if (notificationAudio) {
        audioService.release().catch((error) => {
          console.error('Failed to release audio:', error);
        });
      }
    };
  }, []);

  // Sync interval with preferences
  useEffect(() => {
    if (intervalSeconds !== preferences.timerInterval) {
      setInterval(preferences.timerInterval);
    }
  }, [preferences.timerInterval]);

  // Handle play with haptic feedback
  const handlePlay = useCallback(async () => {
    play();
    if (preferences.hapticEnabled) {
      await hapticService.impact('Light' as any);
    }
  }, [play, preferences.hapticEnabled]);

  // Handle pause with haptic feedback
  const handlePause = useCallback(async () => {
    pause();
    if (preferences.hapticEnabled) {
      await hapticService.impact('Light' as any);
    }
  }, [pause, preferences.hapticEnabled]);

  // Handle next with haptic and audio
  const handleNext = useCallback(async () => {
    next();
    
    // Haptic feedback
    if (preferences.hapticEnabled) {
      await hapticService.impact('Medium' as any);
    }
    
    // Audio notification
    if (preferences.soundEnabled) {
      try {
        await audioService.playNotification();
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  }, [next, preferences.hapticEnabled, preferences.soundEnabled]);

  // Handle interval change
  const handleIntervalChange = useCallback(
    async (seconds: number) => {
      setInterval(seconds);
      await updateTimerInterval(seconds);
      
      if (preferences.hapticEnabled) {
        await hapticService.impact('Selection' as any);
      }
    },
    [setInterval, updateTimerInterval, preferences.hapticEnabled]
  );

  // Trigger haptic and audio on auto-rotation
  useEffect(() => {
    if (!currentQuote || !isPlaying) return;

    const triggerFeedback = async () => {
      // Haptic feedback
      if (preferences.hapticEnabled) {
        await hapticService.impact('Light' as any);
      }
      
      // Audio notification
      if (preferences.soundEnabled) {
        try {
          await audioService.playNotification();
        } catch (error) {
          console.error('Failed to play audio:', error);
        }
      }
    };

    triggerFeedback();
  }, [currentQuote?.id, isPlaying]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading quotes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load quotes</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuote) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No quotes available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.content}>
        <View style={styles.quoteContainer}>
          <QuoteCard quote={currentQuote} animate={isPlaying} />
        </View>

        <RotationControls
          isPlaying={isPlaying}
          intervalSeconds={intervalSeconds}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onIntervalChange={handleIntervalChange}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
