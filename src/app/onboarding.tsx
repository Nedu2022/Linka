import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolateColor,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JourneyRoad } from '@/components/onboarding/journey-road';
import { OnboardingSlide, SLIDES, STAGE_INSET } from '@/components/onboarding/onboarding-slide';
import { PrimaryButton } from '@/components/primary-button';
import { Brand, Typeface } from '@/constants/theme';

const TRAVEL_MS = 1150;
const EXIT_MS = 1000;
const HEADER_HEIGHT = 52;
const STAGE_COLORS = SLIDES.map((slide) => slide.stageColor);

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const stageHeight = Math.min(height * 0.4, 360);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const autoX = useSharedValue(0);
  const autoScrolling = useSharedValue(false);
  const exit = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isLast = index === SLIDES.length - 1;
  const pages = SLIDES.map((_, i) => i * width);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useDerivedValue(() => {
    if (autoScrolling.get()) scrollTo(scrollRef, autoX.get(), 0, false);
  });

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.set(event.contentOffset.x);
  });

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const goTo = (target: number) => {
    if (busy.current) return;
    setIndex(target);
    if (reduceMotion) {
      scrollRef.current?.scrollTo({ x: target * width, animated: true });
      return;
    }
    busy.current = true;
    autoX.set(scrollX.get());
    autoScrolling.set(true);
    autoX.set(
      withTiming(target * width, { duration: TRAVEL_MS, easing: Easing.bezier(0.55, 0, 0.2, 1) }, () => {
        autoScrolling.set(false);
      }),
    );
    later(() => (busy.current = false), TRAVEL_MS);
  };

  const getStarted = () => {
    if (busy.current) return;
    if (reduceMotion) {
      router.replace('/phone-number');
      return;
    }
    busy.current = true;
    exit.set(withTiming(1, { duration: EXIT_MS, easing: Easing.bezier(0.5, 0, 0.9, 0.6) }));
    later(() => router.replace('/phone-number'), EXIT_MS - 150);
  };

  const skip = () => {
    Haptics.selectionAsync();
    router.replace('/phone-number');
  };

  const stageStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollX.get(), pages, STAGE_COLORS),
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.counter}>
          <Animated.Text key={index} entering={FadeIn.duration(300)} style={styles.counterCurrent}>
            {String(index + 1).padStart(2, '0')}
          </Animated.Text>
          <Text style={styles.counterTotal}> / {String(SLIDES.length).padStart(2, '0')}</Text>
        </View>
        <Pressable
          onPress={skip}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          style={({ pressed }) => [styles.skip, pressed && styles.skipPressed]}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.pager}>
        <Animated.View style={[styles.stageCard, { height: stageHeight }, stageStyle]} />
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
          {SLIDES.map((slide, i) => (
            <OnboardingSlide
              key={slide.key}
              slide={slide}
              index={i}
              scrollX={scrollX}
              pageWidth={width}
              stageHeight={stageHeight}
            />
          ))}
        </Animated.ScrollView>
      </View>

      <View style={styles.footer}>
        <JourneyRoad scrollX={scrollX} pageWidth={width} roadWidth={width - 72} exit={exit} />
        <PrimaryButton label={isLast ? 'Get Started' : 'Next'} onPress={isLast ? getStarted : () => goTo(index + 1)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.canvas,
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterCurrent: {
    color: Brand.green,
    fontSize: 17,
    fontFamily: Typeface.extrabold,
  },
  counterTotal: {
    color: Brand.muted,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  skip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Brand.greenSoft,
  },
  skipPressed: {
    opacity: 0.6,
  },
  skipText: {
    color: Brand.green,
    fontSize: 13.5,
    fontFamily: Typeface.semibold,
  },
  pager: {
    flex: 1,
  },
  stageCard: {
    position: 'absolute',
    top: 0,
    left: STAGE_INSET,
    right: STAGE_INSET,
    borderRadius: 32,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 18,
  },
});
