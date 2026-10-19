import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { CheckIcon, ChevronLeftIcon, MapPinIcon, PhoneIcon, TruckIcon, WhatsAppIcon } from '@/components/icons';
import { ORDER_STATUS } from '@/components/orders/order-row';
import { PrimaryButton } from '@/components/primary-button';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { markOrderDelivered, type Order, orderTotal, useOrder } from '@/state/orders';
import { storeInitials, useStoreProfile } from '@/state/store-profile';
import { formatNaira } from '@/utils/money';
import { formatNigerianNumber } from '@/utils/phone';
import { formatListTime, formatTimestamp } from '@/utils/time';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrder(id);
  const store = useStoreProfile();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/orders'));

  if (!order) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.topBar}>
          <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Surface.ink} />} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Order not found</Text>
          <Pressable onPress={() => router.replace('/orders')} accessibilityRole="link">
            <Text style={styles.missingLink}>Back to orders</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const status = ORDER_STATUS[order.status];
  const total = orderTotal(order);
  const subtotal = total - order.deliveryFee;
  const firstName = order.customer.name.split(' ')[0];
  const internationalPhone = `234${order.customer.phone}`;

  const openWhatsApp = (text?: string) => {
    Haptics.selectionAsync();
    const query = text ? `?text=${encodeURIComponent(text)}` : '';
    Linking.openURL(`https://wa.me/${internationalPhone}${query}`);
  };

  const call = () => {
    Haptics.selectionAsync();
    Linking.openURL(`tel:+${internationalPhone}`);
  };

  const remind = () =>
    openWhatsApp(
      `Hi ${firstName}, thanks for your order #${order.number} from ${store.name}. ` +
        `Your total is ${formatNaira(total)}. Pay with the link you received to confirm it.`,
    );

  const deliver = () => {
    markOrderDelivered(order.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const confirmDelivered = () => {
    if (Platform.OS === 'web') {
      deliver();
      return;
    }
    Alert.alert('Mark as delivered?', `${order.customer.name} will be told their order has arrived.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark delivered', onPress: deliver },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Surface.ink} />} />
        <Text style={styles.topTitle}>Order #{order.number}</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(380)} style={styles.card}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.total}>{formatNaira(total)}</Text>
          <Text style={styles.placed}>Placed {formatTimestamp(order.createdAt)}</Text>
          <Timeline order={order} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(380)} style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.customer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{storeInitials(order.customer.name)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.customerName} numberOfLines={1}>
                {order.customer.name}
              </Text>
              <Text style={styles.muted}>+234 {formatNigerianNumber(order.customer.phone)}</Text>
            </View>
            <CircleButton
              size={44}
              label={`Message ${firstName} on WhatsApp`}
              onPress={() => openWhatsApp()}
              icon={<WhatsAppIcon size={20} color={Surface.ink} />}
            />
            <CircleButton
              size={44}
              label={`Call ${firstName}`}
              onPress={call}
              icon={<PhoneIcon size={19} color={Surface.ink} />}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(380)} style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items.map((item, i) => (
            <View key={`${item.name}-${i}`} style={styles.itemRow}>
              <Text style={styles.quantity}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatNaira(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totals}>
            <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
            <SummaryRow label="Delivery" value={order.deliveryFee ? formatNaira(order.deliveryFee) : 'Free'} />
            <SummaryRow label="Total" value={formatNaira(total)} strong />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(380)} style={styles.card}>
          <Text style={styles.cardTitle}>{order.delivery.method === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIcon}>
              {order.delivery.method === 'pickup' ? (
                <MapPinIcon size={19} color={Surface.ink} />
              ) : (
                <TruckIcon size={19} color={Surface.ink} />
              )}
            </View>
            <Text style={styles.address}>{order.delivery.address}</Text>
          </View>
          {order.note.length > 0 && (
            <View style={styles.note}>
              <Text style={styles.noteLabel}>Note from {firstName}</Text>
              <Text style={styles.noteText}>{order.note}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {order.status !== 'delivered' && (
        <View style={styles.footer}>
          {order.status === 'pending' ? (
            <>
              <PrimaryButton label="Remind to pay" onPress={remind} rider="message" />
              <Text style={styles.footnote}>Payment is confirmed automatically when {firstName} pays.</Text>
            </>
          ) : (
            <PrimaryButton label="Mark as delivered" onPress={confirmDelivered} rider="van" />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function Timeline({ order }: { order: Order }) {
  const steps = [
    { label: 'Placed', time: order.createdAt },
    { label: 'Paid', time: order.paidAt },
    { label: 'Delivered', time: order.deliveredAt },
  ];
  const current = steps.findIndex((step) => step.time === null);

  return (
    <View style={styles.timeline} accessibilityRole="progressbar" accessibilityLabel={`Order ${order.status}`}>
      {steps.map((step, i) => {
        const done = step.time !== null;
        const isCurrent = i === current;
        return (
          <View key={step.label} style={styles.step}>
            <View style={styles.stepTrack}>
              {i > 0 && <View style={[styles.line, styles.lineLeft, done && styles.lineDone]} />}
              {i < steps.length - 1 && (
                <View style={[styles.line, styles.lineRight, steps[i + 1].time !== null && styles.lineDone]} />
              )}
              <View style={[styles.node, done && styles.nodeDone, isCurrent && styles.nodeCurrent]}>
                {done && <CheckIcon size={12} color={Surface.lime} />}
              </View>
            </View>
            <Text style={[styles.stepLabel, !done && !isCurrent && styles.stepLabelTodo]}>{step.label}</Text>
            <Text style={styles.stepTime} numberOfLines={1}>
              {step.time ? formatListTime(step.time) : isCurrent ? 'Waiting' : ' '}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong && styles.summaryStrong]}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Surface.canvas,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: Surface.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  topSpacer: {
    width: 48,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: Surface.card,
  },
  cardTitle: {
    marginBottom: 14,
    color: Brand.body,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  total: {
    marginTop: 10,
    color: Surface.ink,
    fontSize: 36,
    fontFamily: Typeface.extrabold,
    letterSpacing: -1.2,
    fontVariant: ['tabular-nums'],
  },
  placed: {
    marginTop: 2,
    color: Brand.muted,
    fontSize: 14,
    fontFamily: Typeface.medium,
  },
  timeline: {
    marginTop: 24,
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepTrack: {
    alignSelf: 'stretch',
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    top: 12,
    height: 2,
    backgroundColor: '#E4E7E5',
  },
  lineLeft: {
    left: 0,
    right: '50%',
  },
  lineRight: {
    left: '50%',
    right: 0,
  },
  lineDone: {
    backgroundColor: Surface.ink,
  },
  node: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#E4E7E5',
    backgroundColor: Surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    borderColor: Surface.ink,
    backgroundColor: Surface.ink,
  },
  nodeCurrent: {
    borderColor: Surface.ink,
  },
  stepLabel: {
    marginTop: 8,
    color: Surface.ink,
    fontSize: 13.5,
    fontFamily: Typeface.semibold,
  },
  stepLabelTodo: {
    color: Brand.muted,
  },
  stepTime: {
    marginTop: 2,
    color: Brand.muted,
    fontSize: 11.5,
    fontFamily: Typeface.medium,
  },
  customer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  avatarText: {
    color: Surface.ink,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
  customerName: {
    color: Surface.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  muted: {
    marginTop: 2,
    color: Brand.muted,
    fontSize: 13.5,
    fontFamily: Typeface.regular,
  },
  itemRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantity: {
    width: 26,
    color: Brand.muted,
    fontSize: 15,
    fontFamily: Typeface.semibold,
    fontVariant: ['tabular-nums'],
  },
  itemName: {
    flex: 1,
    color: Surface.ink,
    fontSize: 15.5,
    fontFamily: Typeface.medium,
  },
  itemPrice: {
    color: Surface.ink,
    fontSize: 15.5,
    fontFamily: Typeface.medium,
    fontVariant: ['tabular-nums'],
  },
  totals: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: Brand.body,
    fontSize: 14.5,
    fontFamily: Typeface.regular,
  },
  summaryValue: {
    color: Brand.body,
    fontSize: 14.5,
    fontFamily: Typeface.medium,
    fontVariant: ['tabular-nums'],
  },
  summaryStrong: {
    color: Surface.ink,
    fontSize: 16,
    fontFamily: Typeface.bold,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  address: {
    flex: 1,
    color: Surface.ink,
    fontSize: 15.5,
    lineHeight: 22,
    fontFamily: Typeface.medium,
  },
  note: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Surface.canvas,
    gap: 4,
  },
  noteLabel: {
    color: Brand.muted,
    fontSize: 12.5,
    fontFamily: Typeface.semibold,
  },
  noteText: {
    color: Surface.ink,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Typeface.regular,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
  },
  footnote: {
    color: Brand.muted,
    fontSize: 12.5,
    fontFamily: Typeface.regular,
    textAlign: 'center',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  missingTitle: {
    color: Surface.ink,
    fontSize: 18,
    fontFamily: Typeface.bold,
  },
  missingLink: {
    color: Surface.green,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
});
