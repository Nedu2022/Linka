import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { type Order, type OrderStatus } from '@/components/dashboard/sample-data';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { storeInitials } from '@/state/store-profile';
import { formatNaira } from '@/utils/money';

const STATUS: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: 'New', color: AUTH_GREEN },
  paid: { label: 'Paid', color: '#B7791F' },
  delivered: { label: 'Delivered', color: Brand.muted },
};

type Props = { orders: Order[]; onSeeAll: () => void; onOpen: (order: Order) => void };

export function RecentOrders({ orders, onSeeAll, onOpen }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent orders</Text>
        <Pressable onPress={onSeeAll} hitSlop={10} accessibilityRole="button">
          {({ pressed }) => <Text style={[styles.seeAll, pressed && styles.dim]}>See all</Text>}
        </Pressable>
      </View>

      {orders.map((order, i) => {
        const status = STATUS[order.status];
        return (
          <Pressable
            key={order.id}
            onPress={() => onOpen(order)}
            accessibilityRole="button"
            accessibilityLabel={`Order from ${order.customer}, ${formatNaira(order.amount)}, ${status.label}`}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{storeInitials(order.customer)}</Text>
            </View>
            <View style={[styles.rowBody, i > 0 && styles.divider]}>
              <View style={styles.flex}>
                <Text style={styles.customer} numberOfLines={1}>
                  {order.customer}
                </Text>
                <Text style={styles.meta}>
                  {order.items} {order.items === 1 ? 'item' : 'items'} · {order.time}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.amount}>{formatNaira(order.amount)}</Text>
                <View style={styles.status}>
                  <View style={[styles.dot, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
    borderRadius: 30,
    backgroundColor: Surface.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    color: Brand.ink,
    fontSize: 19,
    fontFamily: Typeface.bold,
    letterSpacing: -0.4,
  },
  seeAll: {
    color: '#7C837F',
    fontSize: 14.5,
    fontFamily: Typeface.bold,
  },
  dim: {
    opacity: 0.6,
  },
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
  rowBody: {
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
