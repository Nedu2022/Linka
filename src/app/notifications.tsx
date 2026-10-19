import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { BagIcon, BankIcon, BellIcon, ChevronLeftIcon, GridIcon, NairaIcon } from '@/components/icons';
import { Brand, Surface, Typeface } from '@/constants/theme';
import {
  type AppNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationKind,
  useNotifications,
  useUnreadCount,
} from '@/state/notifications';
import { dayGroup, formatAge } from '@/utils/time';

const KIND_ICON: Record<NotificationKind, ComponentType<{ size?: number; color: string }>> = {
  order: BagIcon,
  payment: NairaIcon,
  payout: BankIcon,
  stock: GridIcon,
};

export default function NotificationsScreen() {
  const notifications = useNotifications();
  const unread = useUnreadCount();

  const groups: { label: string; items: AppNotification[] }[] = [];
  for (const item of [...notifications].sort((a, b) => b.createdAt - a.createdAt)) {
    const label = dayGroup(item.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/dashboard'));

  const open = (item: AppNotification) => {
    Haptics.selectionAsync();
    markNotificationRead(item.id);
    if (item.orderId) router.push({ pathname: '/order-detail', params: { id: item.orderId } });
  };

  const readAll = () => {
    Haptics.selectionAsync();
    markAllNotificationsRead();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Surface.ink} />} />
        {unread > 0 && (
          <Pressable onPress={readAll} hitSlop={10} accessibilityRole="button" style={styles.readAll}>
            {({ pressed }) => <Text style={[styles.readAllText, pressed && styles.dim]}>Mark all read</Text>}
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>{unread > 0 ? `${unread} unread` : 'You’re all caught up'}</Text>

        {groups.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <BellIcon size={24} color={Surface.ink} />
            </View>
            <Text style={styles.emptyText}>New orders, payments, and payouts will show up here.</Text>
          </View>
        ) : (
          groups.map(({ label, items }, g) => (
            <Animated.View key={label} entering={FadeInDown.delay(g * 60).duration(360)} style={styles.group}>
              <Text style={styles.groupTitle}>{label}</Text>
              <View style={styles.card}>
                {items.map((item, i) => (
                  <NotificationRow key={item.id} item={item} divider={i > 0} onPress={() => open(item)} />
                ))}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationRow({ item, divider, onPress }: { item: AppNotification; divider: boolean; onPress: () => void }) {
  const Icon = KIND_ICON[item.kind];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.read ? '' : 'Unread. '}${item.title}. ${item.body}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={[styles.icon, !item.read && styles.iconUnread]}>
        <Icon size={19} color={item.read ? Surface.ink : Surface.lime} />
      </View>
      <View style={[styles.rowBody, divider && styles.divider]}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowTitle, !item.read && styles.rowTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.age}>{formatAge(item.createdAt)}</Text>
        </View>
        <Text style={styles.rowText} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readAll: {
    height: 44,
    justifyContent: 'center',
  },
  readAllText: {
    color: Surface.ink,
    fontSize: 14.5,
    fontFamily: Typeface.semibold,
  },
  dim: {
    opacity: 0.6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
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
  group: {
    marginTop: 22,
    gap: 10,
  },
  groupTitle: {
    paddingHorizontal: 4,
    color: Brand.body,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  card: {
    paddingHorizontal: 18,
    borderRadius: 26,
    backgroundColor: Surface.card,
    overflow: 'hidden',
  },
  row: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowPressed: {
    backgroundColor: '#F7F8F7',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: {
    backgroundColor: Surface.ink,
  },
  rowBody: {
    flex: 1,
    paddingVertical: 16,
    gap: 3,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    color: Surface.ink,
    fontSize: 15,
    fontFamily: Typeface.medium,
  },
  rowTitleUnread: {
    fontFamily: Typeface.bold,
  },
  age: {
    color: Brand.muted,
    fontSize: 12.5,
    fontFamily: Typeface.medium,
  },
  rowText: {
    color: Brand.body,
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: Typeface.regular,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5484D',
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
});
