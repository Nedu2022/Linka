import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Brand } from '@/constants/theme';

type Props = { size: number; variant?: 'glass' | 'solid' | 'deep' };

export function LogoMark({ size, variant = 'glass' }: Props) {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.28 },
        styles[variant],
      ]}>
      <Svg width={size * 0.58} height={size * 0.5} viewBox="0 0 58 50">
        <Rect x={0} y={4} width={58} height={38} rx={10} fill="#000000" fillOpacity={0.12} />
        <Rect x={0} y={0} width={58} height={38} rx={10} fill={Brand.orange} />
        <Path d="M23 37 L29 46 L35 37 Z" fill={Brand.orange} />
        <Path
          d="M20 31 V8 L38 31 V8"
          stroke={Brand.white}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path d="M14 16 H44 M14 23 H44" stroke={Brand.white} strokeWidth={3} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  solid: {
    backgroundColor: Brand.green,
  },
  deep: {
    backgroundColor: '#0A4D3C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
