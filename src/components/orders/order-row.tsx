import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { type Order, orderItemCount, type OrderStatus, orderTotal } from '@/state/orders';
import { storeInitials } from '@/state/store-profile';
import { formatNaira } from '@/utils/money';
import { formatListTime } from '@/utils/time';

export const ORDER_STATUS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#B7791F' },
  paid: { label: 'Paid', color: AUTH_GREEN },
  delivered: { label: 'Delivered', color: Brand.muted },
};

type Props = { order: Order; onPress: () => void; divider?: boolean };

export function OrderRow({ order, onPress, divider }: Props) {
  const status = ORDER_STATUS[order.status];
  const items = orderItemCount(order);
  const total = orderTotal(order);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.number} from ${order.customer.name}, ${formatNaira(total)}, ${status.label}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{storeInitials(order.customer.name)}</Text>
      </View>
      <View style={[styles.body, divider && styles.divider]}>
        <View style={styles.flex}>
          <Text style={styles.customer} numberOfLines={1}>
            {order.customer.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            #{order.number} · {items} {items === 1 ? 'item' : 'items'} · {formatListTime(order.createdAt)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>{formatNaira(total)}</Text>
          <View style={styles.status}>
            <View style={[styles.dot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  rowPressed: {
    backgroundColor: '#F7F8F7',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.ink,
    fontSize: 14,
    fontFamily: Typeface.bold,
  },
  body: {
    flex: 1,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
  },
  flex: {
    flex: 1,
  },
  customer: {
    color: Brand.ink,
    fontSize: 15.5,
    fontFamily: Typeface.semibold,
  },
  meta: {
    marginTop: 2,
    color: Brand.muted,
    fontSize: 13,
    fontFamily: Typeface.regular,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    color: Brand.ink,
    fontSize: 15.5,
    fontFamily: Typeface.semibold,
    fontVariant: ['tabular-nums'],
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12.5,
    fontFamily: Typeface.semibold,
  },
});
