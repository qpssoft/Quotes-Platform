/**
 * Buddhist-inspired design tokens and color palette
 * Calming, serene colors for mindfulness application
 */

export const Colors = {
  // Primary palette - Earth tones
  primary: '#8B7355', // Warm brown (Buddhist robe color)
  primaryLight: '#A89278',
  primaryDark: '#6B5642',

  // Secondary palette - Calming blues
  secondary: '#5F8FA3', // Serene blue
  secondaryLight: '#7FADC2',
  secondaryDark: '#4A7084',

  // Accent - Lotus flower pink
  accent: '#D4A5A5',
  accentLight: '#E3C0C0',
  accentDark: '#B88B8B',

  // Neutrals
  background: '#F5F5F0', // Off-white with warmth
  backgroundDark: '#E8E8E0',
  surface: '#FFFFFF',
  surfaceDark: '#F0F0EA',
  cardBackground: '#FFFFFF',

  // Text colors
  text: '#2C2C2C',
  textSecondary: '#666666',
  textLight: '#999999',
  textInverse: '#FFFFFF',

  // Semantic colors
  success: '#7FA582', // Soft green
  warning: '#D4A574', // Warm amber
  error: '#C98686', // Soft red
  info: '#5F8FA3', // Matches secondary

  // Borders and dividers
  border: '#D9D9D4',
  divider: '#E8E8E0',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
