import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Brand } from '@/constants/theme';

type AnimatedViewStyle = ComponentProps<typeof Animated.View>['style'];

const TONES = {
  light: { body: Brand.white, cabin: Brand.white, window: '#A9D9C4', wheel: '#0C3B2C', hub: Brand.white },
  brand: { body: Brand.green, cabin: Brand.greenDark, window: '#BFE6D4', wheel: '#1E2723', hub: '#E8ECEA' },
} as const;

export const VAN_WIDTH = 50;

type Props = { tone: keyof typeof TONES; bodyStyle?: AnimatedViewStyle; wheelStyle?: AnimatedViewStyle };

export function Van({ tone, bodyStyle, wheelStyle }: Props) {
  const c = TONES[tone];

  return (
    <View style={styles.van}>
      <Animated.View style={bodyStyle}>
        <Svg width={VAN_WIDTH} height={22} viewBox="0 0 50 22">
          <Rect x={1} y={1} width={30} height={17} rx={3} fill={c.body} />
          <Rect x={9} y={5} width={13} height={9} rx={1.5} fill={Brand.orange} />
          <Path d="M15.5 5 V14" stroke={Brand.white} strokeWidth={1.4} />
          <Path d="M31 5 H40 L47 12 V18 H31 Z" fill={c.cabin} />
          <Path d="M33 7.5 H39 L43.5 12 H33 Z" fill={c.window} />
          <Rect x={44.5} y={13.5} width={2.5} height={2} rx={1} fill={Brand.orange} />
        </Svg>
      </Animated.View>
      {[5, 35].map((left) => (
        <Animated.View key={left} style={[styles.wheel, { left }, wheelStyle]}>
          <Svg width={10} height={10} viewBox="0 0 10 10">
            <Circle cx={5} cy={5} r={5} fill={c.wheel} />
            <Circle cx={5} cy={5} r={2} fill={c.hub} />
            <Rect x={4.4} y={0.8} width={1.2} height={2.2} rx={0.6} fill={c.hub} />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  van: {
    width: VAN_WIDTH,
    height: 27,
  },
  wheel: {
    position: 'absolute',
    top: 17,
    width: 10,
    height: 10,
  },
});
