import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { MessageRider, VanRider } from '@/components/button-riders';
import { ArrowRightIcon } from '@/components/icons';
import { Brand, Typeface } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  rider?: 'none' | 'van' | 'message';
};

const RIDE_MS = 1200;
const FIRE_AT_MS = 1000;
const RADIUS = 18;
const BUTTON_GREEN = '#05614E';
const DISABLED_BG = '#E4EAE7';
const DISABLED_TEXT = '#97A39D';

export function PrimaryButton({ label, onPress, disabled = false, loading = false, rider = 'none' }: Props) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const content = useSharedValue(1);
  const pressed = useSharedValue(0);
  const enabled = useSharedValue(disabled ? 0 : 1);
  const pop = useSharedValue(1);
  const wasDisabled = useRef(disabled);
  const trackWidth = useSharedValue(0);
  const [riding, setRiding] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    enabled.set(withTiming(disabled ? 0 : 1, { duration: 240 }));
    if (wasDisabled.current && !disabled) {
      pop.set(withSequence(withTiming(1.035, { duration: 140 }), withSpring(1, { damping: 12, stiffness: 220 })));
    }
    wasDisabled.current = disabled;
  }, [disabled, enabled, pop]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (reduceMotion || rider === 'none') {
      onPress();
      return;
    }

    setRiding(true);
    content.set(withTiming(0, { duration: 140 }));
    progress.set(withTiming(1, { duration: RIDE_MS, easing: Easing.inOut(Easing.quad) }));

    timers.current = [
      setTimeout(onPress, FIRE_AT_MS),
      setTimeout(() => {
        progress.set(0);
        content.set(withTiming(1, { duration: 220 }));
        setRiding(false);
      }, RIDE_MS + 80),
    ];
  };

  const containerStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(enabled.get(), [0, 1], [0, 0.22]),
    transform: [{ scale: pop.get() }],
  }));

  const disabledLayerStyle = useAnimatedStyle(() => ({ opacity: 1 - enabled.get() }));
  const labelColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(enabled.get(), [0, 1], [DISABLED_TEXT, Brand.white]),
  }));
  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(enabled.get(), [0, 1], ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.16)']),
  }));
  const arrowOnStyle = useAnimatedStyle(() => ({ opacity: enabled.get() }));

  const pressOverlayStyle = useAnimatedStyle(() => ({ opacity: pressed.get() * 0.14 }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: content.get(),
    transform: [{ scale: interpolate(content.get(), [0, 1], [0.94, 1]) }],
  }));

  const isInactive = disabled || loading;
  const Rider = rider === 'message' ? MessageRider : VanRider;
  const hasRider = rider !== 'none';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive || riding}
      onPressIn={() => pressed.set(withTiming(1, { duration: 80 }))}
      onPressOut={() => pressed.set(withTiming(0, { duration: 180 }))}
      onPress={handlePress}>
      <Animated.View style={[styles.shadow, containerStyle]}>
        <View style={styles.surface} onLayout={(e) => trackWidth.set(e.nativeEvent.layout.width)}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="primaryButtonFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#0A6D58" />
                <Stop offset="1" stopColor={BUTTON_GREEN} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#primaryButtonFill)" />
          </Svg>
          <Animated.View style={[styles.disabledLayer, disabledLayerStyle]} pointerEvents="none" />
          <Animated.View style={[styles.pressOverlay, pressOverlayStyle]} pointerEvents="none" />
          <View style={styles.innerBorder} pointerEvents="none" />

          {loading ? (
            <ActivityIndicator color={Brand.white} />
          ) : (
            <Animated.View style={[styles.content, contentStyle]}>
              <Animated.Text style={[styles.label, labelColorStyle]}>{label}</Animated.Text>
              <Animated.View style={[styles.chip, chipStyle]}>
                <ArrowRightIcon size={18} color={DISABLED_TEXT} />
                <Animated.View style={[styles.arrowOn, arrowOnStyle]}>
                  <ArrowRightIcon size={18} color={Brand.white} />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          )}

          {riding && hasRider && <Rider progress={progress} trackWidth={trackWidth} />}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  shadow: {
    borderRadius: RADIUS,
    backgroundColor: BUTTON_GREEN,
    shadowColor: '#033F33',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  surface: {
    height: 58,
    borderRadius: RADIUS,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledLayer: {
    ...fill,
    backgroundColor: DISABLED_BG,
  },
  arrowOn: {
    ...fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressOverlay: {
    ...fill,
    backgroundColor: '#000000',
  },
  innerBorder: {
    ...fill,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: Brand.white,
    fontSize: 17,
    fontFamily: Typeface.bold,
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
