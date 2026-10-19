import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon, MinusIcon, PlusIcon } from '@/components/icons';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { type Product } from '@/state/products';
import { formatNaira } from '@/utils/money';

type Props = {
  product: Product | null;
  quantityInCart: number;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
};

export function StorefrontProductModal({ product, quantityInCart, onClose, onAddToCart }: Props) {
  const [qty, setQty] = useState(quantityInCart > 0 ? quantityInCart : 1);

  if (!product) return null;

  const isOutOfStock = !product.inStock;

  const handleAdd = () => {
    if (isOutOfStock) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAddToCart(product, qty);
    onClose();
  };

  return (
    <Modal visible={!!product} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12} accessibilityRole="button">
              <CloseIcon size={20} color={Surface.ink} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.imageWrap}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderEmoji}>🛍️</Text>
                </View>
              )}
            </View>

            <View style={styles.body}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatNaira(product.price)}</Text>
                <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeOut]}>
                  <Text style={[styles.stockText, isOutOfStock && styles.stockTextOut]}>
                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </Text>
                </View>
              </View>

              <Text style={styles.name}>{product.name}</Text>

              {product.description ? (
                <View style={styles.descSection}>
                  <Text style={styles.descTitle}>Description</Text>
                  <Text style={styles.desc}>{product.description}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {!isOutOfStock && (
              <View style={styles.stepperWrap}>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setQty(Math.max(1, qty - 1));
                  }}
                  style={styles.stepBtn}>
                  <MinusIcon size={16} color="#05614E" />
                </Pressable>
                <Text style={styles.stepQty}>{qty}</Text>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setQty(qty + 1);
                  }}
                  style={styles.stepBtn}>
                  <PlusIcon size={16} color="#05614E" />
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={handleAdd}
              disabled={isOutOfStock}
              style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}>
              <Text style={[styles.addBtnText, isOutOfStock && styles.addBtnTextDisabled]}>
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : `Add to Bag · ${formatNaira(product.price * qty)}`}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
    position: 'relative',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9DFDC',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F5F8F7',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  body: {
    gap: 8,
    paddingBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 22,
    fontFamily: Typeface.extrabold,
    color: Brand.ink,
    letterSpacing: -0.4,
  },
  stockBadge: {
    backgroundColor: '#E7F7F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeOut: {
    backgroundColor: '#FEECEC',
  },
  stockText: {
    fontSize: 12,
    fontFamily: Typeface.semibold,
    color: '#05614E',
  },
  stockTextOut: {
    color: '#E5484D',
  },
  name: {
    fontSize: 18,
    fontFamily: Typeface.bold,
    color: Brand.ink,
    lineHeight: 24,
  },
  descSection: {
    marginTop: 12,
    gap: 6,
  },
  descTitle: {
    fontSize: 13,
    fontFamily: Typeface.semibold,
    color: '#8A9590',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 14,
    fontFamily: Typeface.regular,
    color: Brand.body,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F4',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 12,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  stepQty: {
    fontSize: 16,
    fontFamily: Typeface.bold,
    color: Brand.ink,
    minWidth: 20,
    textAlign: 'center',
  },
  addBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#05614E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#E4EAE7',
  },
  addBtnText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
  addBtnTextDisabled: {
    color: '#97A39D',
  },
});
