/**
 * App Root
 * Buddhist Quotes Mobile Application
 */

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors, Typography } from './src/constants/Colors';

export default function App() {
  const theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: Colors.primary,
      background: Colors.background,
      card: Colors.surface,
      text: Colors.text,
      border: Colors.divider,
      notification: Colors.accent,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: Typography.weights.regular,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: Typography.weights.medium,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: Typography.weights.bold,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: Typography.weights.bold,
      },
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <AppNavigator />
    </NavigationContainer>
  );
}
