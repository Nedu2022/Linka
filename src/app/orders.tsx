import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TAB_BAR_SPACE, TabBar } from '@/components/dashboard/tab-bar';
import { BagIcon } from '@/components/icons';
import { OrderRow } from '@/components/orders/order-row';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { type Order, type OrderStatus, useOrders } from '@/state/orders';
import { dayGroup } from '@/utils/time';

type Filter = 'all' | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'delivered', label: 'Delivered' },
];

const EMPTY: Record<Filter, string> = {
  all: 'Orders from your store link will show up here.',
  pending: 'No orders waiting for payment.',
  paid: 'Nothing to deliver right now.',
  delivered: 'Delivered orders will show up here.',
};

export default function OrdersScreen() {
  const orders = useOrders();
  const [filter, setFilter] = useState<Filter>('all');

  const counts = {
    all: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    paid: orders.filter((order) => order.status === 'paid').length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
  };

  const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter);
  const groups = groupByDay(visible);

  const subtitle =
    counts.paid > 0
      ? `${counts.paid} paid, ready to deliver`
      : counts.pending > 0
        ? `${counts.pending} waiting for payment`
        : 'All caught up';

  const choose = (next: Filter) => {
    if (next === filter) return;
    Haptics.selectionAsync();
    setFilter(next);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroller}
        contentContainerStyle={styles.filters}>
        {FILTERS.map(({ key, label }) => {
          const selected = key === filter;
          return (
            <Pressable
              key={key}
              onPress={() => choose(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}, ${counts[key]}`}
              style={({ pressed }) => [styles.filter, selected && styles.filterOn, pressed && styles.pressed]}>
              <Text style={[styles.filterText, selected && styles.filterTextOn]}>{label}</Text>
              <Text style={[styles.filterCount, selected && styles.filterCountOn]}>{counts[key]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {groups.length === 0 ? (
          <Animated.View key={filter} entering={FadeIn.duration(200)} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <BagIcon size={26} color={Surface.ink} />
            </View>
            <Text style={styles.emptyText}>{EMPTY[filter]}</Text>
          </Animated.View>
        ) : (
          groups.map(({ label, orders: rows }, g) => (
            <Animated.View
              key={`${filter}-${label}`}
              entering={FadeInDown.delay(g * 50).duration(320)}
              style={styles.group}>
              <Text style={styles.groupTitle}>{label}</Text>
              <View style={styles.card}>
                {rows.map((order, i) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    divider={i > 0}
                    onPress={() => router.push({ pathname: '/order-detail', params: { id: order.id } })}
                  />
                ))}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <TabBar active="orders" />
    </SafeAreaView>
  );
}

function groupByDay(orders: Order[]) {
  const groups: { label: string; orders: Order[] }[] = [];
  for (const order of [...orders].sort((a, b) => b.createdAt - a.createdAt)) {
    const label = dayGroup(order.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.orders.push(order);
    else groups.push({ label, orders: [order] });
  }
  return groups;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Surface.canvas,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    color: Surface.ink,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Typeface.extrabold,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 2,
    color: Brand.body,
    fontSize: 15,
    fontFamily: Typeface.medium,
  },
  filtersScroller: {
    flexGrow: 0,
    marginTop: 18,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filter: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    backgroundColor: Surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterOn: {
    backgroundColor: Surface.ink,
  },
  filterText: {
    color: Surface.ink,
    fontSize: 14.5,
    fontFamily: Typeface.semibold,
  },
  filterTextOn: {
    color: Brand.white,
  },
  filterCount: {
    color: Brand.muted,
    fontSize: 13,
    fontFamily: Typeface.semibold,
    fontVariant: ['tabular-nums'],
  },
  filterCountOn: {
    color: Surface.lime,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: TAB_BAR_SPACE,
    gap: 20,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    paddingHorizontal: 4,
    color: Brand.body,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 26,
    backgroundColor: Surface.card,
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 72,
    gap: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    maxWidth: 260,
    color: Brand.body,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typeface.regular,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
