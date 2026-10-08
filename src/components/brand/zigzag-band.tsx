import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Mask, Path, Pattern, Rect, Stop } from 'react-native-svg';

type Props = { id: string; height: number; opacity?: number };

export function ZigzagBand({ id, height, opacity = 0.08 }: Props) {
  return (
    <View style={{ height }} pointerEvents="none">
      <Svg width="100%" height={height}>
        <Defs>
          <Pattern id={`${id}-pattern`} patternUnits="userSpaceOnUse" width={28} height={20}>
            <Path
              d="M0 14 L7 6 L14 14 L21 6 L28 14"
              stroke="#FFFFFF"
              strokeOpacity={opacity}
              strokeWidth={2}
              strokeLinejoin="round"
              fill="none"
            />
            <Path d="M14 0 L16.5 2.5 L14 5 L11.5 2.5 Z" fill="#FFFFFF" fillOpacity={opacity} />
          </Pattern>
          <LinearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={1} />
          </LinearGradient>
          <Mask id={`${id}-mask`}>
            <Rect width="100%" height={height} fill={`url(#${id}-fade)`} />
          </Mask>
        </Defs>
        <Rect width="100%" height={height} fill={`url(#${id}-pattern)`} mask={`url(#${id}-mask)`} />
      </Svg>
    </View>
  );
}
