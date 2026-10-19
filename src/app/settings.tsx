import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { TAB_BAR_SPACE, TabBar } from '@/components/dashboard/tab-bar';
import {
  BagIcon,
  BankIcon,
  ChevronRightIcon,
  EyeIcon,
  GridIcon,
  LogOutIcon,
  NairaIcon,
  ShareIcon,
  ShieldIcon,
  ShopIcon,
} from '@/components/icons';
import { STORE_DOMAIN } from '@/components/store/store-preview-card';
import { StoreAvatar } from '@/components/store/store-avatar';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { type NotificationKind, setNotificationPref, useNotificationPrefs } from '@/state/notifications';
import { clearPayoutAccount, maskAccountNumber, usePayoutAccount } from '@/state/payout';
import { clearProducts } from '@/state/products';
import { clearStoreProfile, useStoreProfile } from '@/state/store-profile';
import { clearVendorProfile, useVendorProfile } from '@/state/vendor-profile';
import { formatNigerianNumber } from '@/utils/phone';

const ICON = { size: 19, color: Surface.ink };

const NOTIFICATION_ROWS: { kind: NotificationKind; title: string; body: string; icon: ReactNode }[] = [
  { kind: 'order', title: 'New orders', body: 'When a customer places an order', icon: <BagIcon {...ICON} /> },
  { kind: 'payment', title: 'Payments', body: 'When an order is paid', icon: <NairaIcon {...ICON} /> },
  { kind: 'payout', title: 'Payouts', body: 'When money is sent to your bank', icon: <BankIcon {...ICON} /> },
  { kind: 'stock', title: 'Stock alerts', body: 'When a product is selling fast', icon: <GridIcon {...ICON} /> },
];

export default function SettingsScreen() {
  const store = useStoreProfile();
  const vendor = useVendorProfile();
  const payout = usePayoutAccount();
  const prefs = useNotificationPrefs();

  const name = vendor?.fullName || store.name;
  const phone = vendor?.phone ? `+234 ${formatNigerianNumber(vendor.phone)}` : 'Add your details';

  const go = (href: Parameters<typeof router.push>[0]) => {
    Haptics.selectionAsync();
    router.push(href);
  };

  const logOut = () => {
    clearProducts();
    clearPayoutAccount();
    clearVendorProfile();
    clearStoreProfile();
    router.replace('/');
  };

  const confirmLogOut = () => {
    Haptics.selectionAsync();
    if (Platform.OS === 'web') {
      logOut();
      return;
    }
    Alert.alert('Log out?', 'Your store details and products on this phone will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Account</Text>

        <Animated.View entering={FadeInDown.duration(380)}>
          <Pressable
            onPress={() => go({ pathname: '/profile', params: { edit: '1' } })}
            accessibilityRole="button"
            accessibilityLabel={`Edit profile, ${name}`}
            style={({ pressed }) => [styles.profile, pressed && styles.pressed]}>
            <StoreAvatar name={name} logo={null} size={56} round />
            <View style={styles.flex}>
              <Text style={styles.profileName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.profileMeta}>{phone}</Text>
            </View>
            <ChevronRightIcon size={18} color={Brand.muted} />
          </Pressable>
        </Animated.View>

        <Section title="Store" delay={60}>
          <Row
            icon={<ShopIcon {...ICON} />}
            title="Store details"
            value={`${store.name} · ${store.category}`}
            onPress={() => go({ pathname: '/store-setup', params: { edit: '1' } })}
          />
          <Row
            icon={<ShareIcon {...ICON} />}
            title="Share store"
            value={`${STORE_DOMAIN}/${store.slug}`}
            onPress={() => go('/share-store')}
          />
          <Row icon={<EyeIcon {...ICON} />} title="Preview store" onPress={() => go('/store-preview')} />
        </Section>

        <Section title="Getting paid" delay={120}>
          <Row
            icon={<BankIcon {...ICON} />}
            title="Payout account"
            value={payout ? `${payout.bankName} ${maskAccountNumber(payout.accountNumber)}` : 'Not added yet'}
            attention={!payout}
            onPress={() => go('/payout')}
          />
          <Row
            icon={<ShieldIcon {...ICON} />}
            title="Identity verification"
            value={store.verified ? 'Verified' : 'Not verified'}
            attention={!store.verified}
            onPress={store.verified ? undefined : () => go('/kyc')}
          />
        </Section>

        <Section title="Notifications" delay={180}>
          {NOTIFICATION_ROWS.map(({ kind, title, body, icon }) => (
            <Row
              key={kind}
              icon={icon}
              title={title}
              value={body}
              trailing={
                <Switch
                  value={prefs[kind]}
                  onValueChange={(enabled) => {
                    Haptics.selectionAsync();
                    setNotificationPref(kind, enabled);
                  }}
                  trackColor={{ false: '#E4E7E5', true: '#A8D9C6' }}
                  thumbColor={prefs[kind] ? AUTH_GREEN : '#FFFFFF'}
                  accessibilityLabel={`${title} notifications`}
                />
              }
            />
          ))}
        </Section>

        <Section title="About" delay={240}>
          <Row title="App version" trailing={<Text style={styles.version}>{Constants.expoConfig?.version}</Text>} />
        </Section>

        <Animated.View entering={FadeInDown.delay(300).duration(380)}>
          <Pressable
            onPress={confirmLogOut}
            accessibilityRole="button"
            style={({ pressed }) => [styles.logOut, pressed && styles.pressed]}>
            <LogOutIcon size={19} color="#C2410C" />
            <Text style={styles.logOutText}>Log out</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <TabBar active="account" />
    </SafeAreaView>
  );
}

function Section({ title, delay, children }: { title: string; delay: number; children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(380)} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </Animated.View>
  );
}

type RowProps = {
  title: string;
  icon?: ReactNode;
  value?: string;
  attention?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
};

function Row({ title, icon, value, attention, trailing, onPress }: RowProps) {
  const content = (
    <>
      {icon && <View style={styles.rowIcon}>{icon}</View>}
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{title}</Text>
        {value ? (
          <Text style={[styles.rowValue, attention && styles.rowAttention]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <ChevronRightIcon size={18} color={Brand.muted} /> : null)}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}, ${value}` : title}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      {content}
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: TAB_BAR_SPACE,
  },
  title: {
    color: Surface.ink,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Typeface.extrabold,
    letterSpacing: -1,
  },
  profile: {
    marginTop: 20,
    padding: 18,
    borderRadius: 28,
    backgroundColor: Surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileName: {
    color: Surface.ink,
    fontSize: 18,
    fontFamily: Typeface.bold,
    letterSpacing: -0.3,
  },
  profileMeta: {
    marginTop: 2,
    color: Brand.muted,
    fontSize: 14,
    fontFamily: Typeface.medium,
  },
  section: {
    marginTop: 26,
    gap: 10,
  },
  sectionTitle: {
    paddingHorizontal: 4,
    color: Brand.body,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  card: {
    paddingVertical: 6,
    borderRadius: 26,
    backgroundColor: Surface.card,
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowPressed: {
    backgroundColor: '#F7F8F7',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    color: Surface.ink,
    fontSize: 15.5,
    fontFamily: Typeface.semibold,
  },
  rowValue: {
    marginTop: 2,
    color: Brand.muted,
    fontSize: 13.5,
    fontFamily: Typeface.regular,
  },
  rowAttention: {
    color: '#B7791F',
    fontFamily: Typeface.medium,
  },
  version: {
    color: Brand.muted,
    fontSize: 14.5,
    fontFamily: Typeface.medium,
  },
  logOut: {
    marginTop: 26,
    height: 58,
    borderRadius: 29,
    backgroundColor: Surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logOutText: {
    color: '#C2410C',
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  pressed: {
    opacity: 0.85,
  },
});
