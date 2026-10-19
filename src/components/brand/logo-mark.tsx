import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const TILE = '#F4A62A';
const BAG = '#FBF4E8';
const INK = '#0A3D30';

/** Linka's mark: a shopping bag with an "L", on an orange tile. */
export function LogoMark({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: TILE,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ShoppingBag size={size * 0.74} />
    </View>
  );
}

function ShoppingBag({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M24 22 v-5 a8 8 0 0 1 16 0 v5" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <Path d="M15 22 h34 l-2.5 28 a4 4 0 0 1 -4 3.6 h-21 a4 4 0 0 1 -4 -3.6 z" fill={BAG} />
      <Path
        d="M25 33 v11 h13"
        fill="none"
        stroke={INK}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
