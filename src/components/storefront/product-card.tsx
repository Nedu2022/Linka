import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MinusIcon, PlusIcon } from '@/components/icons';
import { Brand, Typeface } from '@/constants/theme';
import { type Product } from '@/state/products';
import { formatNaira } from '@/utils/money';

type Props = {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onPress: (product: Product) => void;
};

export function StorefrontProductCard({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onPress,
}: Props) {
  const isOutOfStock = !product.inStock;

  const handleAdd = (e: any) => {
    e.stopPropagation?.();
    if (isOutOfStock) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddToCart(product);
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation?.();
    Haptics.selectionAsync();
    onUpdateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation?.();
    Haptics.selectionAsync();
    onUpdateQuantity(product.id, quantityInCart - 1);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatNaira(product.price)}`}>
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🛍️</Text>
          </View>
        )}

        {isOutOfStock ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatNaira(product.price)}</Text>

          {isOutOfStock ? (
            <View style={styles.disabledBtn}>
              <Text style={styles.disabledBtnText}>Unavailable</Text>
            </View>
          ) : quantityInCart === 0 ? (
            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to bag`}>
              <PlusIcon size={14} color={Brand.white} />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          ) : (
            <View style={styles.stepper}>
              <Pressable onPress={handleDecrement} style={styles.stepBtn} hitSlop={8}>
                <MinusIcon size={13} color="#05614E" />
              </Pressable>
              <Text style={styles.stepperCount}>{quantityInCart}</Text>
              <Pressable onPress={handleIncrement} style={styles.stepBtn} hitSlop={8}>
                <PlusIcon size={13} color="#05614E" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Brand.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F0',
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.96,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F8F7',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(23, 28, 25, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outOfStockText: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: Typeface.semibold,
  },
  content: {
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: Typeface.medium,
    color: Brand.ink,
    lineHeight: 18,
    minHeight: 36,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  price: {
    fontSize: 15,
    fontFamily: Typeface.bold,
    color: Brand.ink,
    letterSpacing: -0.2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#05614E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: Typeface.semibold,
  },
  disabledBtn: {
    backgroundColor: '#EEF2F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  disabledBtnText: {
    color: '#8A9590',
    fontSize: 11,
    fontFamily: Typeface.regular,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F7F2',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontSize: 13,
    fontFamily: Typeface.bold,
    color: '#05614E',
    minWidth: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});

