import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/brand/logo-mark';
import { LegalFootnote } from '@/components/auth/legal-footnote';
import { PrimaryButton } from '@/components/primary-button';
import { MarketScene, SCENE_HEIGHT, SCENE_WIDTH } from '@/components/welcome/market-scene';
import { AppName, Brand, Surface, Typeface } from '@/constants/theme';
import { getStoreProfile } from '@/state/store-profile';

export default function Index() {
  // Vendors who already set up a store go straight to their dashboard.
  if (getStoreProfile()) return <Redirect href="/dashboard" />;
  return <WelcomeScreen />;
}

// Must match `imageWidth` of the expo-splash-screen plugin in app.json.
const SPLASH_LOGO = 96;
const BRAND_LOGO = 34;
const BRAND_INSET = 24;
const BRAND_TOP = 8;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// Launch choreography in ms, measured from the moment the native splash starts fading.
const LOGO = { delay: 160, duration: 720 };
const SHEET = { delay: 300, duration: 760 };
const WORDMARK = { delay: 540, duration: 420 };
// The illustration starts telling its story as the sheet comes up.
const SCENE_DELAY = 420;

function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [screen, setScreen] = useState<{ width: number; height: number } | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);

  const initial = reduceMotion ? 1 : 0;
  const logo = useSharedValue(initial);
  const sheet = useSharedValue(initial);
  const wordmark = useSharedValue(initial);
  const [showcase, setShowcase] = useState<{ width: number; height: number } | null>(null);

  const ready = screen !== null && sheetHeight > 0;

  // The first frame is a pixel match for the native splash: same green, same logo, same spot. Once it has been
  // laid out, hide the splash (an invisible swap) and let the logo travel into the header as the page assembles.
  useEffect(() => {
    if (!ready) return;
    SplashScreen.hide();
    if (reduceMotion) return;
    const run = (value: SharedValue<number>, { delay, duration }: { delay: number; duration: number }) =>
      value.set(withDelay(delay, withTiming(1, { duration, easing: EASE_OUT })));
    run(logo, LOGO);
    run(sheet, SHEET);
    run(wordmark, WORDMARK);
  }, [ready, reduceMotion, logo, sheet, wordmark]);

  const size = screen ?? window;
  const endX = BRAND_INSET + BRAND_LOGO / 2;
  const endY = insets.top + BRAND_TOP + BRAND_LOGO / 2;
  const travelX = size.width / 2 - endX;
  const travelY = size.height / 2 - endY;

  const logoStyle = useAnimatedStyle(() => {
    const p = logo.get();
    return {
      transform: [
        { translateX: (1 - p) * travelX },
        { translateY: (1 - p) * travelY },
        { scale: 1 + p * (BRAND_LOGO / SPLASH_LOGO - 1) },
      ],
    };
  });

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.get(),
    transform: [{ translateX: (1 - wordmark.get()) * -10 }],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - sheet.get()) * (sheetHeight || size.height) }],
  }));

  const sceneScale = showcase
    ? Math.min((showcase.width - 32) / SCENE_WIDTH, (showcase.height - 24) / SCENE_HEIGHT, 1.3)
    : 1;

  const onScreenLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setScreen({ width, height });
  };

  const start = () => router.push('/phone-number');

  const signIn = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/phone-number', params: { mode: 'login' } });
  };

  return (
    <View style={styles.screen} onLayout={onScreenLayout}>
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} style={styles.hero}>
        <View style={styles.brand}>
          {/* The logo itself is drawn by the travelling mark below; this keeps its slot. */}
          <View style={styles.brandSlot} />
          <Animated.Text style={[styles.wordmark, wordmarkStyle]}>{AppName}</Animated.Text>
        </View>

        <View
          style={styles.showcase}
          onLayout={(e) => setShowcase({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
          {showcase && <MarketScene play={ready} delay={SCENE_DELAY} reduceMotion={reduceMotion} scale={sceneScale} />}
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.sheet, sheetStyle]} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
        <SafeAreaView edges={['bottom']} style={styles.sheetInner}>
          <View style={styles.copy}>
            <Text style={styles.title}>Your shop,{'\n'}one link away.</Text>
            <Text style={styles.body}>
              Set up a store in minutes, share it on WhatsApp and Instagram, and get paid.
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Get started" onPress={start} />
            <Pressable
              onPress={signIn}
              hitSlop={8}
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
              <Text style={styles.secondaryText}>I already have a store</Text>
            </Pressable>
            <LegalFootnote />
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.travellingLogo, { left: endX - SPLASH_LOGO / 2, top: endY - SPLASH_LOGO / 2 }, logoStyle]}>
        <LogoMark size={SPLASH_LOGO} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Surface.green,
  },
  hero: {
    flex: 1,
  },
  brand: {
    paddingHorizontal: BRAND_INSET,
    paddingTop: BRAND_TOP,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandSlot: {
    width: BRAND_LOGO,
    height: BRAND_LOGO,
  },
  travellingLogo: {
    position: 'absolute',
    width: SPLASH_LOGO,
    height: SPLASH_LOGO,
  },
  wordmark: {
    color: Brand.white,
    fontSize: 22,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.6,
  },
  showcase: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Room for the sheet's rounded corners to overlap.
    paddingBottom: 12,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: Surface.card,
  },
  sheetInner: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 12,
    gap: 28,
  },
  copy: {
    gap: 12,
  },
  title: {
    color: Surface.ink,
    fontSize: 34,
    lineHeight: 39,
    fontFamily: Typeface.extrabold,
    letterSpacing: -1.2,
  },
  body: {
    color: Brand.body,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
  actions: {
    gap: 16,
  },
  secondary: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: Surface.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  pressed: {
    opacity: 0.6,
  },
});
