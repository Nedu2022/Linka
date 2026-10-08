import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { CheckIcon, ChevronLeftIcon, CopyIcon, InstagramIcon, MoreIcon, WhatsAppIcon } from '@/components/icons';
import { StoreAvatar } from '@/components/store/store-avatar';
import { STORE_DOMAIN } from '@/components/store/store-preview-card';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { useStoreProfile } from '@/state/store-profile';

const QR_SIZE = 196;
const NOTICE_MS = 2600;

export default function ShareStoreScreen() {
  const store = useStoreProfile();
  const link = `${STORE_DOMAIN}/${store.slug}`;
  const url = `https://${link}`;
  const message = `Shop ${store.name} on Sellpadi: ${url}`;

  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const flash = (setter: (value: boolean) => void) => {
    setter(true);
    timers.current.push(setTimeout(() => setter(false), NOTICE_MS));
  };

  const showNotice = (text: string) => {
    setNotice(text);
    timers.current.push(setTimeout(() => setNotice(null), NOTICE_MS));
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/dashboard'));

  const copyLink = async () => {
    await Clipboard.setStringAsync(url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    flash(setCopied);
  };

  const shareWhatsApp = () => {
    Haptics.selectionAsync();
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  // Instagram can't take pre-filled text, so copy the link first and let the vendor paste it into a bio or story.
  const shareInstagram = async () => {
    await Clipboard.setStringAsync(url);
    Haptics.selectionAsync();
    showNotice('Link copied. Paste it in your bio or story.');
    Linking.openURL('instagram://app').catch(() => Linking.openURL('https://www.instagram.com/'));
  };

  const shareMore = () => {
    Haptics.selectionAsync();
    Share.share({ message });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Surface.ink} />} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.Text entering={FadeInDown.duration(450)} style={styles.title}>
          Share your store
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(70).duration(450)} style={styles.subtitle}>
          Customers open this link to see your products and order.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.card}>
          <View style={styles.identity}>
            <StoreAvatar name={store.name} logo={store.logo} size={44} round />
            <Text style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Text>
          </View>

          <View style={styles.qr} accessible accessibilityLabel={`QR code for ${link}`}>
            <QRCode value={url} size={QR_SIZE} color={Surface.ink} backgroundColor={Surface.card} ecl="M" />
          </View>
          <Text style={styles.scanHint}>Scan to open your store</Text>

          <View style={styles.linkRow}>
            <Text style={styles.link} numberOfLines={1} ellipsizeMode="middle" selectable>
              {link}
            </Text>
            <Pressable
              onPress={copyLink}
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Link copied' : 'Copy link'}
              style={({ pressed }) => [styles.copy, copied && styles.copyDone, pressed && styles.pressed]}>
              {copied ? <CheckIcon size={18} color={Surface.ink} /> : <CopyIcon size={18} color={Brand.white} />}
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(210).duration(500)} style={styles.actions}>
          <ShareAction label="WhatsApp" onPress={shareWhatsApp} icon={<WhatsAppIcon size={24} color={Surface.ink} />} />
          <ShareAction
            label="Instagram"
            onPress={shareInstagram}
            icon={<InstagramIcon size={23} color={Surface.ink} />}
          />
          <ShareAction label="More" onPress={shareMore} icon={<MoreIcon size={22} color={Surface.ink} />} />
        </Animated.View>
      </ScrollView>

      {notice && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          style={styles.notice}
          accessibilityLiveRegion="polite">
          <Text style={styles.noticeText}>{notice}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function ShareAction({ label, icon, onPress }: { label: string; icon: ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Share on ${label}`}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <View style={styles.actionIcon}>{icon}</View>
      <Text style={styles.actionLabel}>{label}</Text>
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
    marginTop: 8,
    color: Brand.body,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
  card: {
    marginTop: 24,
    padding: 20,
    borderRadius: 30,
    backgroundColor: Surface.card,
    alignItems: 'center',
  },
  identity: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeName: {
    flex: 1,
    color: Surface.ink,
    fontSize: 18,
    fontFamily: Typeface.bold,
    letterSpacing: -0.4,
  },
  qr: {
    marginTop: 24,
  },
  scanHint: {
    marginTop: 14,
    color: Brand.muted,
    fontSize: 13.5,
    fontFamily: Typeface.medium,
  },
  linkRow: {
    alignSelf: 'stretch',
    marginTop: 22,
    height: 56,
    paddingLeft: 18,
    paddingRight: 6,
    borderRadius: 28,
    backgroundColor: Surface.canvas,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  link: {
    flex: 1,
    color: Surface.ink,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  copy: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Surface.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyDone: {
    backgroundColor: Surface.lime,
  },
  actions: {
    marginTop: 16,
    paddingVertical: 18,
    borderRadius: 30,
    backgroundColor: Surface.card,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  action: {
    alignItems: 'center',
    gap: 8,
    minWidth: 84,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: Surface.ink,
    fontSize: 13.5,
    fontFamily: Typeface.semibold,
  },
  notice: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 32,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: Surface.ink,
  },
  noticeText: {
    color: Brand.white,
    fontSize: 14.5,
    fontFamily: Typeface.medium,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
