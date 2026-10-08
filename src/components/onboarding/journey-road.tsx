import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { MovingVan } from '@/components/brand/moving-van';
import { VAN_WIDTH } from '@/components/brand/van';
import { LinkIcon, NairaIcon, ShopIcon } from '@/components/icons';
import { Brand } from '@/constants/theme';

type IconComponent = ComponentType<{ size?: number; color: string }>;

const STOP_ICONS: IconComponent[] = [ShopIcon, LinkIcon, NairaIcon];
const TRACK_TOP = 30;
const TRACK_HEIGHT = 4;

type Props = { scrollX: SharedValue<number>; pageWidth: number; roadWidth: number; exit: SharedValue<number> };

export function JourneyRoad({ scrollX, pageWidth, roadWidth, exit }: Props) {
  const stopXs = STOP_ICONS.map((_, i) => 10 + (i * (roadWidth - 20)) / (STOP_ICONS.length - 1));
  const pages = STOP_ICONS.map((_, i) => i * pageWidth);

  const vanX = useDerivedValue(
    () => interpolate(scrollX.get(), pages, stopXs, Extrapolation.CLAMP) + exit.get() * (VAN_WIDTH + 80),
  );

  const vanStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exit.get(), [0.55, 1], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateX: vanX.get() - VAN_WIDTH / 2 }],
  }));
  const fillStyle = useAnimatedStyle(() => ({ width: Math.min(vanX.get(), roadWidth) }));

  return (
    <View style={[styles.road, { width: roadWidth }]} accessible={false}>
      <View style={styles.track} />
      <Animated.View style={[styles.track, styles.fill, fillStyle]} />

      {stopXs.map((x, i) => (
        <Stop key={i} index={i} x={x} Icon={STOP_ICONS[i]} scrollX={scrollX} pageWidth={pageWidth} />
      ))}

      <Animated.View style={[styles.van, vanStyle]}>
        <MovingVan x={vanX} tone="brand" exhaustColor="#C3CEC9" />
      </Animated.View>
    </View>
  );
}

type StopProps = {
  index: number;
  x: number;
  Icon: IconComponent;
  scrollX: SharedValue<number>;
  pageWidth: number;
};

function Stop({ index, x, Icon, scrollX, pageWidth }: StopProps) {
  const arriveAt = index * pageWidth;
  const range = [arriveAt - pageWidth * 0.5, arriveAt - pageWidth * 0.15];

  const dotStyle = useAnimatedStyle(() => ({
    backgroundColor:
      index === 0 ? Brand.green : interpolateColor(scrollX.get(), range, [Brand.mint, Brand.green]),
  }));
  const reachedStyle = useAnimatedStyle(() => ({
    opacity: index === 0 ? 1 : interpolate(scrollX.get(), range, [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <>
      <Animated.View style={[styles.dot, { left: x - 5 }, dotStyle]} />
      <View style={[styles.stopIcon, { left: x - 10 }]}>
        <Icon size={20} color={Brand.muted} />
        <Animated.View style={[StyleSheet.absoluteFill, reachedStyle]}>
          <Icon size={20} color={Brand.green} />
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  road: {
    height: 64,
    alignSelf: 'center',
  },
  track: {
    position: 'absolute',
    top: TRACK_TOP,
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: Brand.mint,
  },
  fill: {
    right: undefined,
    backgroundColor: Brand.green,
  },
  dot: {
    position: 'absolute',
    top: TRACK_TOP - 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Brand.canvas,
  },
  stopIcon: {
    position: 'absolute',
    top: TRACK_TOP + 14,
    width: 20,
    height: 20,
  },
  van: {
    position: 'absolute',
    top: TRACK_TOP - 28,
    left: 0,
  },
});
