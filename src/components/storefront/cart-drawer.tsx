import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowRightIcon, BagIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { type CartItem } from '@/state/cart';
import { formatNaira } from '@/utils/money';

type Props = {
  visible: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
};

export function StorefrontCartDrawer({
  visible,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: Props) {
  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onProceedToCheckout();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.title}>Your Bag</Text>
                {totalItems > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{totalItems}</Text>
                  </View>
                )}
              </View>

              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12} accessibilityRole="button">
                <CloseIcon size={20} color={Surface.ink} />
              </Pressable>
            </View>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <BagIcon size={36} color="#8A9590" />
              </View>
              <Text style={styles.emptyTitle}>Your bag is empty</Text>
              <Text style={styles.emptySubtitle}>Explore the catalog and add items to place your order.</Text>
              <Pressable onPress={onClose} style={styles.shopBtn}>
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
                {items.map(({ product, quantity }) => (
                  <View key={product.id} style={styles.itemRow}>
                    <View style={styles.itemImageWrap}>
                      {product.image ? (
                        <Image source={{ uri: product.image }} style={styles.itemImage} contentFit="cover" />
                      ) : (
                        <View style={styles.itemImagePlaceholder}>
                          <Text style={{ fontSize: 18 }}>🛍️</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={styles.itemPrice}>{formatNaira(product.price)}</Text>

                      <View style={styles.itemActions}>
                        <View style={styles.stepper}>
                          <Pressable
                            onPress={() => {
                              Haptics.selectionAsync();
                              onUpdateQuantity(product.id, quantity - 1);
                            }}
                            style={styles.stepBtn}>
                            <MinusIcon size={12} color="#05614E" />
                          </Pressable>
                          <Text style={styles.stepCount}>{quantity}</Text>
                          <Pressable
                            onPress={() => {
                              Haptics.selectionAsync();
                              onUpdateQuantity(product.id, quantity + 1);
                            }}
                            style={styles.stepBtn}>
                            <PlusIcon size={12} color="#05614E" />
                          </Pressable>
                        </View>

                        <Pressable
                          onPress={() => {
                            Haptics.selectionAsync();
                            onRemoveItem(product.id);
                          }}
                          style={styles.removeBtn}
                          hitSlop={8}>
                          <TrashIcon size={16} color="#8A9590" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.footer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatNaira(totalAmount)}</Text>
                </View>
                <Text style={styles.shippingNotice}>Delivery fee will be calculated at checkout.</Text>

                <Pressable onPress={handleCheckout} style={styles.checkoutBtn} accessibilityRole="button">
                  <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                  <View style={styles.checkoutPriceTag}>
                    <Text style={styles.checkoutPriceText}>{formatNaira(totalAmount)}</Text>
                    <ArrowRightIcon size={16} color={Brand.white} />
                  </View>
                </Pressable>
              </View>
            </>
          )}
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
    maxHeight: '88%',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9DFDC',
    alignSelf: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  badge: {
    backgroundColor: '#E7F7F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Typeface.bold,
    color: '#05614E',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemList: {
    paddingHorizontal: 20,
    maxHeight: 380,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F6F4',
    gap: 14,
    alignItems: 'center',
  },
  itemImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F5F8F7',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 15,
    fontFamily: Typeface.semibold,
    color: Brand.ink,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: Typeface.bold,
    color: '#05614E',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F4',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontSize: 13,
    fontFamily: Typeface.bold,
    color: Brand.ink,
    minWidth: 14,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: Typeface.medium,
    color: Brand.body,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: Typeface.extrabold,
    color: Brand.ink,
  },
  shippingNotice: {
    fontSize: 12,
    fontFamily: Typeface.regular,
    color: '#8A9590',
  },
  checkoutBtn: {
    backgroundColor: '#05614E',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  checkoutBtnText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
  checkoutPriceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutPriceText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Typeface.regular,
    color: Brand.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  shopBtn: {
    backgroundColor: '#05614E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  shopBtnText: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
});
