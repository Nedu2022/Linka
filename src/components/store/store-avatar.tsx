import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { Brand, Typeface } from '@/constants/theme';
import { storeInitials } from '@/state/store-profile';

type Props = { name: string; logo: string | null; size: number; round?: boolean };

export function StoreAvatar({ name, logo, size, round }: Props) {
  const radius = round ? size / 2 : Math.round(size * 0.29);

  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: radius }]}>
      {logo ? (
        <Image source={{ uri: logo }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.36) }]}>{storeInitials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: AUTH_GREEN,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Brand.white,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.5,
  },
});
