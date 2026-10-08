import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { BagIcon, ChevronLeftIcon, LockIcon, ShareIcon, WhatsAppIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { StoreAvatar } from '@/components/store/store-avatar';
import { STORE_DOMAIN } from '@/components/store/store-preview-card';
import { Surface, Typeface } from '@/constants/theme';
import { useStoreProfile } from '@/state/store-profile';

const PLACEHOLDER_PRODUCTS = 5;

export default function StorePreviewScreen() {
  const store = useStoreProfile();
  const link = `${STORE_DOMAIN}/${store.slug}`;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const shareStore = () => {
    Haptics.selectionAsync();
    router.push('/share-store');
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/store-setup'));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Surface.ink} />} />
        <CircleButton label="Share store link" onPress={shareStore} icon={<ShareIcon size={20} color={Surface.ink} />} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.Text entering={FadeInDown.duration(450)} style={styles.title}>
          Your store is ready
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(70).duration(450)} style={styles.subtitle}>
          This is what customers see when they open your link.
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(160).duration(600)} style={styles.card}>
          <View style={styles.addressBar}>
            <LockIcon size={11} color="#7C837F" />
            <Text style={styles.address} numberOfLines={1}>
              {link}
            </Text>
          </View>

          <View style={styles.storefront}>
            <View style={styles.avatarRing}>
              <StoreAvatar name={store.name} logo={store.logo} size={84} round />
            </View>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.category}>{store.category}</Text>
            {store.description.length > 0 && <Text style={styles.description}>{store.description}</Text>}

            <View style={styles.cta}>
              <WhatsAppIcon size={18} color={Surface.lime} />
              <Text style={styles.ctaText}>Order on WhatsApp</Text>
            </View>
          </View>

          <View style={styles.products}>
            <View style={styles.productsHeader}>
              <Text style={styles.productsTitle}>Products</Text>
              <Text style={styles.productsCount}>0 items</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselRow}>
              {Array.from({ length: PLACEHOLDER_PRODUCTS }, (_, i) => (
                <View key={i} style={[styles.thumb, i === 0 && styles.thumbFeatured]}>
                  <BagIcon size={i === 0 ? 26 : 20} color="#B9C0BC" />
                </View>
              ))}
            </ScrollView>
            <Text style={styles.productsHint}>Products you add will show up here.</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Go to dashboard" onPress={() => router.replace('/dashboard')} rider="van" />
      </View>
    </SafeAreaView>
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
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  title: {
    color: Surface.ink,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Typeface.extrabold,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 8,
    color: '#636A66',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
  card: {
    marginTop: 24,
    borderRadius: 32,
    backgroundColor: Surface.card,
    overflow: 'hidden',
  },
  addressBar: {
    height: 40,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: Surface.canvas,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  address: {
    color: '#555C58',
    fontSize: 13,
    fontFamily: Typeface.medium,
  },
  storefront: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Surface.lime,
  },
  storeName: {
    marginTop: 14,
    color: Surface.ink,
    fontSize: 23,
    fontFamily: Typeface.bold,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  category: {
    marginTop: 3,
    color: '#7C837F',
    fontSize: 14,
    fontFamily: Typeface.medium,
  },
  description: {
    marginTop: 12,
    color: '#555C58',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typeface.regular,
    textAlign: 'center',
  },
  cta: {
    marginTop: 20,
    height: 52,
    alignSelf: 'stretch',
    borderRadius: 26,
    backgroundColor: Surface.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontFamily: Typeface.semibold,
  },
  products: {
    marginHorizontal: 14,
    marginBottom: 14,
    paddingTop: 18,
    paddingBottom: 18,
    borderRadius: 24,
    backgroundColor: Surface.canvas,
  },
  productsHeader: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  productsTitle: {
    color: Surface.ink,
    fontSize: 16,
    fontFamily: Typeface.bold,
  },
  productsCount: {
    color: '#7C837F',
    fontSize: 13,
    fontFamily: Typeface.medium,
  },
  carousel: {
    marginTop: 14,
  },
  carouselRow: {
    paddingHorizontal: 18,
    gap: 10,
    alignItems: 'center',
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFeatured: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: Surface.card,
    backgroundColor: '#E4E7E5',
  },
  productsHint: {
    marginTop: 14,
    paddingHorizontal: 18,
    color: '#7C837F',
    fontSize: 13,
    fontFamily: Typeface.regular,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
