import * as Haptics from 'expo-haptics';
import { type Href, router } from 'expo-router';
import { type ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BagIcon, GridIcon, HomeIcon, UserIcon } from '@/components/icons';
import { Surface, Typeface } from '@/constants/theme';
import { usePendingOrderCount } from '@/state/orders';

export type TabKey = 'home' | 'orders' | 'products' | 'account';

type Tab = {
  key: TabKey;
  label: string;
  href: Href;
  Icon: ComponentType<{ size?: number; color: string }>;
  badge?: number;
};

export function TabBar({ active }: { active: TabKey }) {
  const insets = useSafeAreaInsets();
  const pendingOrders = usePendingOrderCount();
  const tabs: Tab[] = [
    { key: 'home', label: 'Home', href: '/dashboard', Icon: HomeIcon },
    { key: 'orders', label: 'Orders', href: '/orders', Icon: BagIcon, badge: pendingOrders },
    { key: 'products', label: 'Products', href: '/products', Icon: GridIcon },
    { key: 'account', label: 'Account', href: '/settings', Icon: UserIcon },
  ];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar} accessibilityRole="tablist">
        {tabs.map(({ key, label, href, Icon, badge }) => {
          const selected = key === active;
          return (
            <Pressable
              key={key}
              onPress={() => {
                if (selected) return;
                Haptics.selectionAsync();
                // Tabs swap in place rather than stacking, so back never walks through old tabs.
                router.replace(href);
              }}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              style={[styles.tab, selected && styles.tabActive]}>
              <Icon size={22} color={selected ? Surface.ink : 'rgba(255,255,255,0.78)'} />
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const TAB_BAR_SPACE = 110;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },
  bar: {
    height: 72,
    borderRadius: 36,
    paddingHorizontal: 10,
    backgroundColor: Surface.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tab: {
    width: 64,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    width: 84,
    backgroundColor: Surface.lime,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 14,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Surface.ink,
    backgroundColor: '#E5484D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Typeface.bold,
  },
});
