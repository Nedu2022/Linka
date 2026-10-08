import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN, AuthTopBar } from '@/components/auth/auth-top-bar';
import { LegalFootnote } from '@/components/auth/legal-footnote';
import { OtpInput } from '@/components/auth/otp-input';
import { PrimaryButton } from '@/components/primary-button';
import { Brand, Typeface } from '@/constants/theme';
import { formatNigerianNumber } from '@/utils/phone';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function VerifyScreen() {
  const { phone = '' } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const changeNumber = () => (router.canGoBack() ? router.back() : router.replace('/phone-number'));

  const resend = () => {
    Haptics.selectionAsync();
    setCode('');
    setSecondsLeft(RESEND_SECONDS);
  };

  const verify = () => {
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/profile', params: { phone } });
  };

  const countdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthTopBar onBack={changeNumber} step={2} total={2} />

        <View style={styles.body}>
          <Animated.Text entering={FadeInDown.duration(450)} style={styles.title}>
            Enter the code
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(70).duration(450)} style={styles.subtitle}>
            We sent it to <Text style={styles.phone}>+234 {formatNigerianNumber(phone)}</Text>.{' '}
            <Text style={styles.link} onPress={changeNumber} accessibilityRole="link">
              Change number
            </Text>
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(140).duration(450)} style={styles.code}>
            <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} />
          </Animated.View>

          <View style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <Text style={styles.resend}>
                Resend code in <Text style={styles.countdown}>{countdown}</Text>
              </Text>
            ) : (
              <Animated.View entering={FadeIn.duration(200)}>
                <Pressable onPress={resend} hitSlop={10} accessibilityRole="button">
                  {({ pressed }) => (
                    <Text style={[styles.resend, styles.link, pressed && styles.pressed]}>Resend code</Text>
                  )}
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Verify & continue" onPress={verify} disabled={code.length < CODE_LENGTH} rider="van" />
          <LegalFootnote />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    color: Brand.ink,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Typeface.extrabold,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 10,
    color: Brand.body,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
  phone: {
    color: Brand.ink,
    fontFamily: Typeface.semibold,
  },
  link: {
    color: AUTH_GREEN,
    fontFamily: Typeface.bold,
  },
  code: {
    marginTop: 32,
  },
  resendRow: {
    marginTop: 20,
  },
  resend: {
    color: Brand.body,
    fontSize: 15,
    fontFamily: Typeface.regular,
  },
  countdown: {
    color: Brand.ink,
    fontFamily: Typeface.semibold,
  },
  pressed: {
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 14,
  },
});
