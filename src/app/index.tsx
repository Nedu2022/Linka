import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/brand/logo-mark';
import { LegalFootnote } from '@/components/auth/legal-footnote';
import { CheckIcon, LinkIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { STORE_DOMAIN } from '@/components/store/store-preview-card';
import { AppName, Brand, Surface, Typeface } from '@/constants/theme';
import { getStoreProfile } from '@/state/store-profile';
import { formatNaira } from '@/utils/money';

export default function Index() {
  // Vendors who already set up a store go straight to their dashboard.
  if (getStoreProfile()) return <Redirect href="/dashboard" />;
  return <WelcomeScreen />;
}

function WelcomeScreen() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const start = () => router.push('/phone-number');

  const signIn = () => {
    Haptics.selectionAsync();
    router.push('/phone-number');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} style={styles.hero}>
        <View style={styles.brand}>
          <LogoMark size={34} variant="deep" />
          <Text style={styles.wordmark}>{AppName}</Text>
        </View>

        <View style={styles.showcase}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.storeCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AF</Text>
            </View>
            <View style={styles.storeText}>
              <Text style={styles.storeName}>Adaeze Fabrics</Text>
              <View style={styles.linkRow}>
                <LinkIcon size={13} color={Surface.green} />
                <Text style={styles.link} numberOfLines={1}>
                  {STORE_DOMAIN}/adaeze
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.orderCard}>
            <View style={styles.paidDot}>
              <CheckIcon size={14} color={Surface.ink} />
            </View>
            <View style={styles.storeText}>
              <Text style={styles.orderTitle}>New order paid</Text>
              <Text style={styles.orderMeta}>Ankara wrap dress · Tolu</Text>
            </View>
            <Text style={styles.orderAmount}>{formatNaira(18500)}</Text>
          </Animated.View>
        </View>
      </SafeAreaView>

      <Animated.View entering={FadeIn.duration(400)} style={styles.sheet}>
        <SafeAreaView edges={['bottom']} style={styles.sheetInner}>
          <View style={styles.copy}>
            <Text style={styles.title}>Your shop,{'\n'}one link away.</Text>
            <Text style={styles.body}>
              Set up a store in minutes, share it on WhatsApp and Instagram, and get paid.
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Get started" onPress={start} />
            <Pressable
              onPress={signIn}
              hitSlop={8}
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
              <Text style={styles.secondaryText}>I already have a store</Text>
            </Pressable>
            <LegalFootnote />
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Surface.green,
  },
  hero: {
    flex: 1,
  },
  brand: {
    paddingHorizontal: 24,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    color: Brand.white,
    fontSize: 22,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.6,
  },
  showcase: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  storeCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: Surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Surface.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.white,
    fontSize: 17,
    fontFamily: Typeface.bold,
  },
  storeText: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    color: Surface.ink,
    fontSize: 18,
    fontFamily: Typeface.bold,
    letterSpacing: -0.3,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  link: {
    flexShrink: 1,
    color: Surface.green,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  orderCard: {
    marginLeft: 28,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Surface.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paidDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Surface.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTitle: {
    color: Brand.white,
    fontSize: 14.5,
    fontFamily: Typeface.semibold,
  },
  orderMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12.5,
    fontFamily: Typeface.medium,
  },
  orderAmount: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: Typeface.bold,
    fontVariant: ['tabular-nums'],
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: Surface.card,
  },
  sheetInner: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 12,
    gap: 28,
  },
  copy: {
    gap: 12,
  },
  title: {
    color: Surface.ink,
    fontSize: 34,
    lineHeight: 39,
    fontFamily: Typeface.extrabold,
    letterSpacing: -1.2,
  },
  body: {
    color: Brand.body,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
  actions: {
    gap: 16,
  },
  secondary: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: Surface.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  pressed: {
    opacity: 0.6,
  },
});
