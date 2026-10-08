import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN, AuthTopBar } from '@/components/auth/auth-top-bar';
import { LegalFootnote } from '@/components/auth/legal-footnote';
import { CheckIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { Brand, Typeface } from '@/constants/theme';
import { formatNigerianNumber } from '@/utils/phone';

const PHONE_DIGITS = 10;

export default function PhoneNumberScreen() {
  const [digits, setDigits] = useState('');
  const focus = useSharedValue(0);

  const isValid = digits.length === PHONE_DIGITS;

  const handleChange = (text: string) => {
    let next = text.replace(/\D/g, '');
    if (next.startsWith('234')) next = next.slice(3);
    if (next.startsWith('0')) next = next.slice(1);
    setDigits(next.slice(0, PHONE_DIGITS));
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const sendCode = () => router.push({ pathname: '/verify', params: { phone: digits } });

  const fieldStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.get(), [0, 1], [Brand.border, AUTH_GREEN]),
  }));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthTopBar onBack={goBack} step={1} total={2} />

        <View style={styles.body}>
          <Animated.Text entering={FadeInDown.duration(450)} style={styles.title}>
            Enter your phone number
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(70).duration(450)} style={styles.subtitle}>
            We&apos;ll text you a 6-digit code to confirm it&apos;s you.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(140).duration(450)} style={styles.fieldGroup}>
            <Animated.View style={[styles.field, fieldStyle]}>
              <View style={styles.country}>
                <View style={styles.flag}>
                  <View style={styles.flagGreen} />
                  <View style={styles.flagWhite} />
                  <View style={styles.flagGreen} />
                </View>
                <Text style={styles.countryCode}>+234</Text>
              </View>
              <View style={styles.divider} />
              <TextInput
                value={formatNigerianNumber(digits)}
                onChangeText={handleChange}
                onFocus={() => focus.set(withTiming(1, { duration: 180 }))}
                onBlur={() => focus.set(withTiming(0, { duration: 180 }))}
                placeholder="803 123 4567"
                placeholderTextColor="#B9BFBC"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                autoFocus
                selectionColor={AUTH_GREEN}
                style={styles.input}
                accessibilityLabel="Phone number"
              />
              {isValid && (
                <Animated.View entering={ZoomIn.duration(200)} style={styles.validBadge}>
                  <CheckIcon size={12} color={Brand.white} />
                </Animated.View>
              )}
            </Animated.View>
            <Text style={styles.hint}>Use your WhatsApp number. We never share it.</Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Send code" onPress={sendCode} disabled={!isValid} rider="message" />
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
  fieldGroup: {
    marginTop: 32,
    gap: 12,
  },
  field: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: Brand.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 18,
  },
  country: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 18,
    paddingRight: 14,
  },
  flag: {
    width: 24,
    height: 17,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  flagGreen: {
    flex: 1,
    backgroundColor: '#008751',
  },
  flagWhite: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  countryCode: {
    color: Brand.ink,
    fontSize: 19,
    fontFamily: Typeface.semibold,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Brand.border,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 14,
    color: Brand.ink,
    fontSize: 20,
    fontFamily: Typeface.semibold,
    letterSpacing: 0.6,
  },
  validBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AUTH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    paddingLeft: 2,
    color: Brand.muted,
    fontSize: 13.5,
    fontFamily: Typeface.regular,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 14,
  },
});
