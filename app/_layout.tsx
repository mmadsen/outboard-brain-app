import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { colors, spacing } from '@/constants/Theme';
import { getApiKey } from '@/lib/api-key-store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// AIDEV-NOTE: Custom dark theme matching the app's color palette
const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // AIDEV-NOTE: Re-check API key every time the active segment changes (e.g. after
  // settings saves a key and navigates to tabs). Without this, hasKey stays stale
  // and the guard redirects back to settings in a loop.
  useEffect(() => {
    (async () => {
      const key = await getApiKey();
      setHasKey(!!key);
    })();
  }, [segments]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Keep branded splash visible for 3 seconds after assets load
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  // AIDEV-NOTE: First-launch gate — redirect to settings if no API key stored
  useEffect(() => {
    if (hasKey === null || !loaded) return; // still loading

    const inSettings = segments[0] === 'settings';

    if (!hasKey && !inSettings) {
      router.replace('/settings');
    }
  }, [hasKey, segments, loaded]);

  if (!loaded || hasKey === null || showSplash) {
    return (
      <View style={splashStyles.container}>
        <Image
          source={require('../assets/images/brain.png')}
          style={splashStyles.icon}
          resizeMode="contain"
        />
        <Text style={splashStyles.title}>Mark Madsen's</Text>
        <Text style={splashStyles.subtitle}>Outboard Brain</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={appTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: true,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    tintColor: colors.primary,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
});
