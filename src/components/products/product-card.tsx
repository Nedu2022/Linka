import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Typeface } from '@/constants/theme';
import { type Product } from '@/state/products';
import { formatNaira } from '@/utils/money';

type Props = { product: Product; onPress: () => void };

export function ProductCard({ product, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatNaira(product.price)}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.thumb}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.placeholder} />
        )}
        {!product.inStock ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Sold out</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatNaira(product.price)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  pressed: {
    opacity: 0.82,
  },
  thumb: {
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: '#F0F2F1',
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EBEEEC',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
  },
  badgeText: {
    color: Brand.ink,
    fontSize: 11,
    fontFamily: Typeface.semibold,
  },
  name: {
    marginTop: 10,
    color: Brand.ink,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Typeface.medium,
  },
  price: {
    marginTop: 3,
    color: Brand.ink,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
});
