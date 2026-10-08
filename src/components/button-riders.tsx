import { StyleSheet } from 'react-native';
import Animated, { interpolate, type SharedValue, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { MovingVan } from '@/components/brand/moving-van';
import { VAN_WIDTH } from '@/components/brand/van';
import { Brand } from '@/constants/theme';

export type RiderProps = { progress: SharedValue<number>; trackWidth: SharedValue<number> };

const BUBBLE_WIDTH = 34;
const TRAIL = 'rgba(255,255,255,0.55)';

export function VanRider({ progress, trackWidth }: RiderProps) {
  const x = useDerivedValue(() => interpolate(progress.get(), [0, 1], [-VAN_WIDTH - 30, trackWidth.get() + 20]));
  const driveStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <Animated.View style={[styles.track, driveStyle]} pointerEvents="none">
      <MovingVan x={x} tone="light" exhaustColor="rgba(255,255,255,0.75)" />
    </Animated.View>
  );
}

export function MessageRider({ progress, trackWidth }: RiderProps) {
  const flightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.get(), [0, 1], [-BUBBLE_WIDTH - 30, trackWidth.get() + 20]) },
      { translateY: interpolate(progress.get(), [0, 0.5, 1], [10, 0, -14]) },
      { rotate: `${interpolate(progress.get(), [0, 0.5, 1], [-8, 0, -12])}deg` },
      { scale: interpolate(progress.get(), [0, 0.5, 1], [0.8, 1, 0.9]) },
    ],
  }));
  const trailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.15, 0.8, 1], [0, 1, 1, 0]),
  }));

  return (
    <Animated.View style={[styles.track, flightStyle]} pointerEvents="none">
      <Animated.View style={trailStyle}>
        <Svg width={22} height={8}>
          <Circle cx={3} cy={4} r={1.5} fill="rgba(255,255,255,0.3)" />
          <Circle cx={10} cy={4} r={2} fill="rgba(255,255,255,0.5)" />
          <Circle cx={18} cy={4} r={2.5} fill={TRAIL} />
        </Svg>
      </Animated.View>
      <Svg width={BUBBLE_WIDTH} height={26} viewBox="0 0 34 26">
        <Rect x={1} y={1} width={32} height={19} rx={9} fill={Brand.white} />
        <Path d="M8 19 L6 25 L14 19 Z" fill={Brand.white} />
        <Circle cx={11} cy={10.5} r={2} fill={Brand.green} />
        <Circle cx={17} cy={10.5} r={2} fill={Brand.green} />
        <Circle cx={23} cy={10.5} r={2} fill={Brand.green} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
