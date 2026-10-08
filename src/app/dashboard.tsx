import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { RECENT_ORDERS, TODAY } from '@/components/dashboard/sample-data';
import { SetupCard } from '@/components/dashboard/setup-card';
import { StatCards } from '@/components/dashboard/stat-cards';
import { TAB_BAR_SPACE, TabBar } from '@/components/dashboard/tab-bar';
import { BankIcon, BellIcon, ShieldIcon } from '@/components/icons';
import { StoreAvatar } from '@/components/store/store-avatar';
import { Surface, Typeface } from '@/constants/theme';
import { usePayoutAccount } from '@/state/payout';
import { useStoreProfile } from '@/state/store-profile';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const store = useStoreProfile();
  const payout = usePayoutAccount();

  // On a returning launch the app opens here directly, skipping the animated splash that normally hides it.
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const shareStore = () => {
    Haptics.selectionAsync();
    router.push('/share-store');
  };

  const comingSoon = () => Haptics.selectionAsync();

  const goTab = (key: string) => {
    if (key === 'home') return;
    if (key === 'products') {
      router.push('/products');
      return;
    }
    comingSoon();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
          <StoreAvatar name={store.name} logo={store.logo} size={48} round />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Text>
          </View>
          <CircleButton label="Notifications" onPress={comingSoon} icon={<BellIcon size={21} color={Surface.ink} />} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(450)} style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <StatCards
            sales={TODAY.sales}
            change={TODAY.changeVsYesterday}
            newOrders={TODAY.newOrders}
            storeVisits={TODAY.storeVisits}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(450)}>
          <QuickActions
            onAddProduct={() => router.push('/product-edit')}
            onShareStore={shareStore}
            onViewStore={() => router.push('/store-preview')}
          />
        </Animated.View>

        {/* One setup step at a time: where to get paid, then identity. */}
        {!payout ? (
          <Animated.View entering={FadeInDown.delay(180).duration(450)}>
            <SetupCard
              title="Add where you get paid"
              body="Order payments are sent to your bank account. Takes about a minute."
              steps={['Bank', 'Account number']}
              icon={<BankIcon size={22} color={Surface.green} />}
              onPress={() => router.push('/payout')}
            />
          </Animated.View>
        ) : (
          !store.verified && (
            <Animated.View entering={FadeInDown.delay(180).duration(450)}>
              <SetupCard
                title="Verify your identity to get paid"
                body="Payouts to your bank unlock once KYC is done. Takes about 3 minutes."
                steps={['BVN / NIN', 'Selfie']}
                icon={<ShieldIcon size={22} color={Surface.green} />}
                onPress={() => router.push('/kyc')}
              />
            </Animated.View>
          )
        )}

        <Animated.View entering={FadeInDown.delay(240).duration(450)}>
          <RecentOrders orders={RECENT_ORDERS} onSeeAll={comingSoon} onOpen={comingSoon} />
        </Animated.View>
      </ScrollView>

      <TabBar active="home" onChange={goTab} ordersBadge={TODAY.newOrders} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Surface.canvas,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: TAB_BAR_SPACE,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    color: '#7C837F',
    fontSize: 13.5,
    fontFamily: Typeface.medium,
  },
  storeName: {
    marginTop: 1,
    color: Surface.ink,
    fontSize: 19,
    fontFamily: Typeface.bold,
    letterSpacing: -0.4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: Surface.ink,
    fontSize: 17,
    fontFamily: Typeface.semibold,
  },
});
