// AIDEV-NOTE: Shared theme constants for the Outboard Brain iPad app
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#4a90d9',
  primaryDark: '#3a7bc8',
  background: '#1a1a2e',
  surface: '#16213e',
  surfaceLight: '#1f2b47',
  text: '#e8e8e8',
  textSecondary: '#a0a0b0',
  textMuted: '#6c6c80',
  accent: '#e94560',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  border: '#2a2a4a',
  white: '#ffffff',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  stat: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.primary,
  },
});

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
};
