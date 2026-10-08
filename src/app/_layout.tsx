import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="phone-number" options={{ animation: 'fade' }} />
        <Stack.Screen name="verify" />
        <Stack.Screen name="profile" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="store-setup" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="payout" />
        <Stack.Screen name="store-preview" />
        <Stack.Screen name="share-store" />
        <Stack.Screen name="dashboard" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="products" options={{ animation: 'fade' }} />
        <Stack.Screen name="product-edit" />
        <Stack.Screen name="product-bulk" />
        <Stack.Screen name="product-detail" />
      </Stack>
    </ThemeProvider>
  );
}
