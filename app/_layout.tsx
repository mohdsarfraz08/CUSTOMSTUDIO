import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { OutfitProvider } from '../src/context/OutfitContext';
import { RemoteControlProvider } from '../src/context/RemoteControlContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { PixelRatio, Platform, Dimensions } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const { width, height } = PixelRatio.getPixelSizeForLayoutSize ? { width: Dimensions.get('window').width, height: Dimensions.get('window').height } : Dimensions.get('window');
    const isTabletOrTV = Math.min(width, height) >= 600 || Platform.isTV || (Platform.OS === 'android' && PixelRatio.get() <= 1.5);

    if (isTabletOrTV) {
      // Allow rotation on tablets and TVs
      ScreenOrientation.unlockAsync();
    } else {
      // Lock mobile phones to portrait
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OutfitProvider>
          <RemoteControlProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="tv" options={{ headerShown: false }} />
              <Stack.Screen name="scan" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
              <Stack.Screen name="explore" options={{ headerShown: false }} />
            </Stack>
          </RemoteControlProvider>
        </OutfitProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
