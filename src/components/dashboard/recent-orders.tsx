import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OrderRow } from '@/components/orders/order-row';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { type Order } from '@/state/orders';

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

      {orders.map((order, i) => (
        <OrderRow key={order.id} order={order} onPress={() => onOpen(order)} divider={i > 0} />
      ))}
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
});
