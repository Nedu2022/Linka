import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, MapPinIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from '@/components/icons';
import { Brand, Typeface } from '@/constants/theme';
import { useOrder } from '@/state/orders';
import { useStoreProfile } from '@/state/store-profile';
import { useVendorProfile } from '@/state/vendor-profile';
import { toInternationalNumber } from '@/services/termii';
import { formatNaira } from '@/utils/money';
import { formatTimestamp } from '@/utils/time';

export default function OrderStatusScreen() {
  const { id, slug } = useLocalSearchParams<{ id?: string; slug?: string }>();
  const order = useOrder(id);
  const store = useStoreProfile();
  const vendor = useVendorProfile();

  if (!order) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSub}>The requested order could not be located.</Text>
          <Pressable onPress={() => router.replace((slug ? `/${slug}` : '/') as any)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Return to Store</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isPaid = order.status === 'paid' || order.status === 'delivered';
  const isDelivered = order.status === 'delivered';
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.deliveryFee;

  const chatOnWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const vendorPhone = vendor?.phone || '8030000000';
    const intl = toInternationalNumber(vendorPhone);
    const message = encodeURIComponent(
      `Hello ${store.name}! 👋\nI'm checking on my order #${order.number} placed on Linka.`
    );
    Linking.openURL(`https://wa.me/${intl}?text=${message}`);
  };

  const returnToStore = () => {
    Haptics.selectionAsync();
    router.replace((slug ? `/${slug}` : '/') as any);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={returnToStore} style={styles.storePill}>
          <Text style={styles.storePillText}>{store.name}</Text>
          <ShieldIcon size={13} color="#05614E" />
        </Pressable>
        <Text style={styles.poweredBy}>Powered by Linka</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success / Status Hero */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heroCard}>
          <Animated.View entering={ZoomIn.delay(100).duration(350)} style={styles.checkIconWrap}>
            <CheckIcon size={28} color={Brand.white} />
          </Animated.View>

          <Text style={styles.heroTitle}>Order #{order.number} Placed!</Text>
          <Text style={styles.heroSubtitle}>
            Thank you, {order.customer.name.split(' ')[0]}. {store.name} has received your order.
          </Text>

          <View style={styles.statusBadgeRow}>
            <View style={[styles.statusBadge, isPaid ? styles.statusBadgePaid : styles.statusBadgePending]}>
              <Text style={[styles.statusBadgeText, isPaid ? styles.statusBadgeTextPaid : styles.statusBadgeTextPending]}>
                {isPaid ? 'Payment Confirmed' : 'Payment Pending'}
              </Text>
            </View>
            <Text style={styles.timestampText}>{formatTimestamp(order.createdAt)}</Text>
          </View>
        </Animated.View>

        {/* Status Tracker */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Order Progress</Text>

          <View style={styles.timeline}>
            <TimelineStep
              title="Order Received"
              desc="Your order was confirmed and logged with the store"
              completed={true}
              active={!isPaid}
            />
            <TimelineStep
              title="Payment Processed"
              desc={isPaid ? 'Payment received successfully' : 'Awaiting payment confirmation'}
              completed={isPaid}
              active={isPaid && !isDelivered}
            />
            <TimelineStep
              title={order.delivery.method === 'delivery' ? 'Dispatched for Delivery' : 'Ready for Pick-up'}
              desc={
                order.delivery.method === 'delivery'
                  ? 'Rider will deliver to your location'
                  : 'Items packaged and ready for collection'
              }
              completed={isDelivered}
              active={isDelivered}
              isLast={true}
            />
          </View>
        </Animated.View>

        {/* Customer & Fulfillment Details */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Information</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              {order.delivery.method === 'delivery' ? (
                <TruckIcon size={18} color="#05614E" />
              ) : (
                <MapPinIcon size={18} color="#05614E" />
              )}
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>
                {order.delivery.method === 'delivery' ? 'Home / Office Delivery' : 'Store Pick-up'}
              </Text>
              <Text style={styles.detailValue}>{order.delivery.address}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Text style={{ fontSize: 14 }}>👤</Text>
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue}>
                {order.customer.name} (+{order.customer.phone})
              </Text>
            </View>
          </View>

          {order.note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Order Note</Text>
              <Text style={styles.noteText}>&ldquo;{order.note}&rdquo;</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Items Summary */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>

          <View style={styles.itemsList}>
            {order.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemQuantityBadge}>
                  <Text style={styles.itemQuantityText}>{item.quantity}x</Text>
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{formatNaira(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Items Subtotal</Text>
              <Text style={styles.costVal}>{formatNaira(total - order.deliveryFee)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Delivery Fee</Text>
              <Text style={styles.costVal}>
                {order.deliveryFee > 0 ? formatNaira(order.deliveryFee) : 'Free'}
              </Text>
            </View>
            <View style={[styles.costRow, styles.costTotalRow]}>
              <Text style={styles.costTotalLabel}>Total Paid</Text>
              <Text style={styles.costTotalVal}>{formatNaira(total)}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Footer */}
      <View style={styles.footer}>
        <Pressable onPress={chatOnWhatsApp} style={styles.whatsappBtn} accessibilityRole="button">
          <WhatsAppIcon size={18} color={Brand.white} />
          <Text style={styles.whatsappBtnText}>Chat with {store.name}</Text>
        </Pressable>

        <Pressable onPress={returnToStore} style={styles.continueBtn} accessibilityRole="button">
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function TimelineStep({
  title,
  desc,
  completed,
  active,
  isLast = false,
}: {
  title: string;
  desc: string;
  completed: boolean;
  active: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepIndicatorColumn}>
        <View
          style={[
            styles.stepDot,
            completed && styles.stepDotCompleted,
            active && styles.stepDotActive,
          ]}>
          {completed ? (
            <CheckIcon size={10} color={Brand.white} />
          ) : (
            <View style={styles.stepDotInner} />
          )}
        </View>
        {!isLast && <View style={[styles.stepLine, completed && styles.stepLineCompleted]} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, (completed || active) && styles.stepTitleHighlighted]}>
          {title}
        </Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  storePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E7F7F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  storePillText: {
    fontFamily: Typeface.bold,
    fontSize: 13,
    color: '#05614E',
  },
  poweredBy: {
    fontFamily: Typeface.medium,
    fontSize: 12,
    color: '#8A9590',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: Brand.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  checkIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#05614E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#05614E',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: Typeface.extrabold,
    color: Brand.ink,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: Typeface.regular,
    color: Brand.body,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePaid: {
    backgroundColor: '#E7F7F2',
  },
  statusBadgePending: {
    backgroundColor: '#FFF4E5',
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: Typeface.bold,
  },
  statusBadgeTextPaid: {
    color: '#05614E',
  },
  statusBadgeTextPending: {
    color: '#D97706',
  },
  timestampText: {
    fontSize: 12,
    fontFamily: Typeface.regular,
    color: '#8A9590',
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F0',
    gap: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  timeline: {
    paddingTop: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepIndicatorColumn: {
    width: 24,
    alignItems: 'center',
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D8D4',
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: '#05614E',
    borderColor: '#05614E',
  },
  stepDotActive: {
    borderColor: '#05614E',
    backgroundColor: '#E7F7F2',
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#05614E',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E3E9E6',
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#05614E',
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: Typeface.semibold,
    color: Brand.body,
  },
  stepTitleHighlighted: {
    color: Brand.ink,
    fontFamily: Typeface.bold,
  },
  stepDesc: {
    fontSize: 12,
    fontFamily: Typeface.regular,
    color: '#8A9590',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Typeface.medium,
    color: '#8A9590',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: Typeface.semibold,
    color: Brand.ink,
    marginTop: 2,
  },
  noteBox: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  noteTitle: {
    fontSize: 11,
    fontFamily: Typeface.semibold,
    color: '#8A9590',
    textTransform: 'uppercase',
  },
  noteText: {
    fontSize: 13,
    fontFamily: Typeface.regular,
    color: Brand.ink,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemsList: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
    paddingBottom: 12,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemQuantityBadge: {
    backgroundColor: '#F0F4F2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemQuantityText: {
    fontSize: 12,
    fontFamily: Typeface.bold,
    color: '#05614E',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typeface.medium,
    color: Brand.ink,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  costBreakdown: {
    gap: 6,
    paddingTop: 4,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 13,
    fontFamily: Typeface.regular,
    color: Brand.body,
  },
  costVal: {
    fontSize: 13,
    fontFamily: Typeface.medium,
    color: Brand.ink,
  },
  costTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
    paddingTop: 8,
    marginTop: 4,
  },
  costTotalLabel: {
    fontSize: 15,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  costTotalVal: {
    fontSize: 17,
    fontFamily: Typeface.extrabold,
    color: '#05614E',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Brand.white,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
    gap: 10,
  },
  whatsappBtn: {
    backgroundColor: '#05614E',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whatsappBtnText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
  continueBtn: {
    backgroundColor: '#F3F6F4',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: Brand.ink,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  errorSub: {
    fontSize: 14,
    fontFamily: Typeface.regular,
    color: Brand.body,
  },
  backBtn: {
    backgroundColor: '#05614E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  backBtnText: {
    color: Brand.white,
    fontFamily: Typeface.semibold,
  },
});
