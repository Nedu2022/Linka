import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ChevronLeftIcon } from '@/components/icons';
import { Brand, Typeface } from '@/constants/theme';

export const AUTH_GREEN = '#05614E';

type Props = { onBack: () => void; step: number; total: number };

export function AuthTopBar({ onBack, step, total }: Props) {
  const progress = useSharedValue((step - 1) / total);

  useEffect(() => {
    progress.set(withTiming(step / total, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [progress, step, total]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  return (
    <View>
      <View style={styles.bar}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}>
          <ChevronLeftIcon size={22} color={Brand.ink} />
        </Pressable>
        <Text style={styles.step}>
          {step} of {total}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    backgroundColor: '#F1F3F2',
  },
  step: {
    paddingRight: 8,
    color: Brand.muted,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  track: {
    height: 3,
    marginHorizontal: 24,
    borderRadius: 2,
    backgroundColor: '#EEF1EF',
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: AUTH_GREEN,
  },
});
