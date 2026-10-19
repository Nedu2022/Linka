import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon, MapPinIcon, TruckIcon, WhatsAppIcon } from '@/components/icons';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { clearCart, type CartItem } from '@/state/cart';
import { addNotification } from '@/state/notifications';
import { createOrder } from '@/state/orders';
import { type StoreProfile } from '@/state/store-profile';
import { type VendorProfile } from '@/state/vendor-profile';
import { toInternationalNumber } from '@/services/termii';
import { formatNaira } from '@/utils/money';
import { formatNigerianNumber } from '@/utils/phone';

type Props = {
  visible: boolean;
  store: StoreProfile;
  vendor: VendorProfile | null;
  items: CartItem[];
  onClose: () => void;
};

type DeliveryMethod = 'delivery' | 'pickup';
type PaymentMethod = 'online' | 'whatsapp';

const STANDARD_DELIVERY_FEE = 2500;

export function StorefrontCheckoutDrawer({ visible, store, vendor, items, onClose }: Props) {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? STANDARD_DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  const handlePhoneChange = (text: string) => {
    let next = text.replace(/\D/g, '');
    if (next.startsWith('234')) next = next.slice(3);
    if (next.startsWith('0')) next = next.slice(1);
    setPhone(next.slice(0, 10));
  };

  const isFormValid =
    name.trim().length >= 2 &&
    phone.length === 10 &&
    (deliveryMethod === 'pickup' || address.trim().length >= 5);

  const handlePlaceOrder = async () => {
    if (!isFormValid || submitting) return;

    setError(null);
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // 1. Create order in store state
      const newOrder = createOrder({
        customer: {
          name: name.trim(),
          phone: `234${phone}`,
        },
        items: items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        deliveryFee,
        delivery: {
          method: deliveryMethod,
          address: deliveryMethod === 'delivery' ? address.trim() : 'Pickup from store',
        },
        note: note.trim(),
        status: paymentMethod === 'online' ? 'paid' : 'pending',
      });

      // 2. Add an in-app notification for the vendor
      addNotification({
        kind: 'order',
        title: `New order #${newOrder.number}`,
        body: `${name.trim()} placed an order for ${formatNaira(grandTotal)} (${deliveryMethod}).`,
        orderId: newOrder.id,
      });

      // 3. Clear cart
      clearCart();
      onClose();

      // 4. If customer picked WhatsApp checkout, generate invoice message and open WhatsApp
      if (paymentMethod === 'whatsapp') {
        const vendorPhone = vendor?.phone || '8030000000';
        const vendorIntl = toInternationalNumber(vendorPhone);
        const itemListText = items
          .map((item) => `• ${item.quantity}x ${item.product.name} (${formatNaira(item.product.price * item.quantity)})`)
          .join('\n');

        const message = encodeURIComponent(
          `Hello ${store.name}! 👋\n\nI just placed an order on your Linka store:\n` +
            `*Order #${newOrder.number}*\n\n` +
            `*Items:*\n${itemListText}\n\n` +
            `*Subtotal:* ${formatNaira(subtotal)}\n` +
            `*Delivery (${deliveryMethod}):* ${formatNaira(deliveryFee)}\n` +
            `*Total to Pay:* ${formatNaira(grandTotal)}\n\n` +
            `*Customer:* ${name.trim()} (+234 ${formatNigerianNumber(phone)})\n` +
            (deliveryMethod === 'delivery' ? `*Address:* ${address.trim()}\n` : '') +
            (note.trim() ? `*Note:* ${note.trim()}\n` : '') +
            `\nPlease confirm payment and delivery details!`
        );

        Linking.openURL(`https://wa.me/${vendorIntl}?text=${message}`);
      }

      // 5. Navigate to Order Status screen
      router.push({
        pathname: '/order-status',
        params: {
          id: newOrder.id,
          slug: store.slug,
        },
      } as any);
    } catch {
      setError('Could not complete order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
            <View style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.titleRow}>
                <Text style={styles.title}>Checkout</Text>
                <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12} accessibilityRole="button">
                  <CloseIcon size={20} color={Surface.ink} />
                </Pressable>
              </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Delivery / Pickup Toggle */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Fulfillment Method</Text>
                <View style={styles.toggleRow}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDeliveryMethod('delivery');
                    }}
                    style={[styles.toggleOption, deliveryMethod === 'delivery' && styles.toggleActive]}>
                    <TruckIcon size={18} color={deliveryMethod === 'delivery' ? '#05614E' : '#8A9590'} />
                    <View>
                      <Text style={[styles.toggleTitle, deliveryMethod === 'delivery' && styles.toggleTitleActive]}>
                        Delivery
                      </Text>
                      <Text style={styles.toggleSub}>{formatNaira(STANDARD_DELIVERY_FEE)}</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDeliveryMethod('pickup');
                    }}
                    style={[styles.toggleOption, deliveryMethod === 'pickup' && styles.toggleActive]}>
                    <MapPinIcon size={18} color={deliveryMethod === 'pickup' ? '#05614E' : '#8A9590'} />
                    <View>
                      <Text style={[styles.toggleTitle, deliveryMethod === 'pickup' && styles.toggleTitleActive]}>
                        Store Pick-up
                      </Text>
                      <Text style={styles.toggleSub}>Free</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Customer Details */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Your Details</Text>

                <View style={styles.inputWrap}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Chinedu Eze"
                    placeholderTextColor="#A1ABA6"
                    style={styles.textInput}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Text style={styles.fieldLabel}>WhatsApp Phone Number</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.countryCodeBadge}>
                      <Text style={styles.countryCodeText}>+234</Text>
                    </View>
                    <TextInput
                      value={formatNigerianNumber(phone)}
                      onChangeText={handlePhoneChange}
                      placeholder="803 123 4567"
                      placeholderTextColor="#A1ABA6"
                      keyboardType="phone-pad"
                      style={[styles.textInput, styles.phoneInput]}
                    />
                  </View>
                </View>

                {deliveryMethod === 'delivery' && (
                  <View style={styles.inputWrap}>
                    <Text style={styles.fieldLabel}>Delivery Address (Street & Area)</Text>
                    <TextInput
                      value={address}
                      onChangeText={setAddress}
                      placeholder="e.g. Flat 4, 12 Admiralty Way, Lekki Phase 1"
                      placeholderTextColor="#A1ABA6"
                      style={styles.textInput}
                      multiline
                    />
                  </View>
                )}

                <View style={styles.inputWrap}>
                  <Text style={styles.fieldLabel}>Order Note (Optional)</Text>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Special instructions, gate codes, preferred time..."
                    placeholderTextColor="#A1ABA6"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Payment Option</Text>

                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPaymentMethod('online');
                  }}
                  style={[styles.paymentCard, paymentMethod === 'online' && styles.paymentCardActive]}>
                  <View style={styles.paymentLeft}>
                    <View style={[styles.radioCircle, paymentMethod === 'online' && styles.radioCircleActive]}>
                      {paymentMethod === 'online' && <View style={styles.radioInner} />}
                    </View>
                    <View>
                      <Text style={styles.paymentTitle}>Pay Online (Card / Transfer)</Text>
                      <Text style={styles.paymentSub}>Instant automated payment confirmation</Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPaymentMethod('whatsapp');
                  }}
                  style={[styles.paymentCard, paymentMethod === 'whatsapp' && styles.paymentCardActive]}>
                  <View style={styles.paymentLeft}>
                    <View style={[styles.radioCircle, paymentMethod === 'whatsapp' && styles.radioCircleActive]}>
                      {paymentMethod === 'whatsapp' && <View style={styles.radioInner} />}
                    </View>
                    <View>
                      <Text style={styles.paymentTitle}>Order & Pay via WhatsApp</Text>
                      <Text style={styles.paymentSub}>Send order invoice directly to vendor&apos;s DM</Text>
                    </View>
                  </View>
                  <WhatsAppIcon size={20} color="#05614E" />
                </Pressable>
              </View>

              {/* Summary */}
              <View style={styles.orderSummary}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Items Subtotal ({items.length})</Text>
                  <Text style={styles.calcVal}>{formatNaira(subtotal)}</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Delivery Fee</Text>
                  <Text style={styles.calcVal}>
                    {deliveryFee > 0 ? formatNaira(deliveryFee) : 'Free'}
                  </Text>
                </View>
                <View style={[styles.calcRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalVal}>{formatNaira(grandTotal)}</Text>
                </View>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                onPress={handlePlaceOrder}
                disabled={!isFormValid || submitting}
                style={[styles.submitBtn, (!isFormValid || submitting) && styles.submitBtnDisabled]}>
                {submitting ? (
                  <ActivityIndicator color={Brand.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Place Order · {formatNaira(grandTotal)}</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
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
    maxHeight: '92%',
  },
  flex: {
    maxHeight: '100%',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9DFDC',
    alignSelf: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: Typeface.semibold,
    color: '#8A9590',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EEF2F0',
    backgroundColor: '#F9FBFA',
  },
  toggleActive: {
    borderColor: '#05614E',
    backgroundColor: '#E7F7F2',
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: Typeface.semibold,
    color: Brand.body,
  },
  toggleTitleActive: {
    color: '#05614E',
  },
  toggleSub: {
    fontSize: 12,
    fontFamily: Typeface.regular,
    color: '#8A9590',
  },
  inputWrap: {
    gap: 4,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: Typeface.medium,
    color: Brand.ink,
  },
  textInput: {
    backgroundColor: '#F5F8F7',
    borderWidth: 1,
    borderColor: '#E3E9E6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Typeface.regular,
    fontSize: 14,
    color: Brand.ink,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCodeBadge: {
    backgroundColor: '#EAEFEc',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontFamily: Typeface.semibold,
    fontSize: 14,
    color: Brand.ink,
  },
  phoneInput: {
    flex: 1,
    height: 44,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EEF2F0',
    backgroundColor: '#F9FBFA',
    marginBottom: 8,
  },
  paymentCardActive: {
    borderColor: '#05614E',
    backgroundColor: '#E7F7F2',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C0C9C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#05614E',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#05614E',
  },
  paymentTitle: {
    fontSize: 14,
    fontFamily: Typeface.semibold,
    color: Brand.ink,
  },
  paymentSub: {
    fontSize: 12,
    fontFamily: Typeface.regular,
    color: '#8A9590',
  },
  orderSummary: {
    backgroundColor: '#F5F8F7',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 14,
    fontFamily: Typeface.regular,
    color: Brand.body,
  },
  calcVal: {
    fontSize: 14,
    fontFamily: Typeface.medium,
    color: Brand.ink,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E3E9E6',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  totalVal: {
    fontSize: 18,
    fontFamily: Typeface.extrabold,
    color: '#05614E',
  },
  errorText: {
    color: '#E5484D',
    fontSize: 13,
    fontFamily: Typeface.medium,
    marginBottom: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
  },
  submitBtn: {
    backgroundColor: '#05614E',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#E4EAE7',
  },
  submitBtnText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
});
