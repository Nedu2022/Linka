import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { CircleButton } from '@/components/circle-button';
import { CheckIcon, ChevronLeftIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { FieldLabel, TextField } from '@/components/store/text-field';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { getVendorProfile, saveVendorProfile } from '@/state/vendor-profile';
import { formatNigerianNumber } from '@/utils/phone';

const NAME_MAX = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ phone?: string; edit?: string }>();
  const editing = params.edit === '1';
  const existing = getVendorProfile();
  const phone = params.phone ?? existing?.phone ?? '';

  const [fullName, setFullName] = useState(existing?.fullName ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [emailTouched, setEmailTouched] = useState(false);

  const trimmedEmail = email.trim();
  const emailValid = trimmedEmail.length === 0 || EMAIL_PATTERN.test(trimmedEmail);
  const isValid = fullName.trim().length >= 2 && emailValid;

  const save = () => {
    if (!isValid) return;
    Keyboard.dismiss();
    saveVendorProfile({ fullName: fullName.trim(), email: trimmedEmail, phone });
    if (editing) router.back();
    else router.replace('/store-setup');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {editing && (
          <View style={styles.topBar}>
            <CircleButton
              label="Go back"
              onPress={() => router.back()}
              icon={<ChevronLeftIcon size={22} color={Surface.ink} />}
            />
          </View>
        )}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <Animated.Text entering={FadeInDown.duration(450)} style={styles.title}>
            {editing ? 'Your profile' : 'Tell us about you'}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(70).duration(450)} style={styles.subtitle}>
            This is your account. Customers see your store name, not this.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.form}>
            <TextField
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Adaeze Okafor"
              maxLength={NAME_MAX}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />

            <View style={styles.group}>
              <TextField
                label="Email"
                optional
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
              />
              {emailTouched && !emailValid ? (
                <Animated.Text entering={FadeIn.duration(160)} style={styles.error}>
                  Enter a valid email, or leave it empty.
                </Animated.Text>
              ) : (
                <Text style={styles.hint}>For receipts and account recovery.</Text>
              )}
            </View>

            {phone.length > 0 && (
              <View style={styles.group}>
                <FieldLabel label="Phone number" />
                <View style={styles.phone}>
                  <Text style={styles.phoneText}>+234 {formatNigerianNumber(phone)}</Text>
                  <View style={styles.verified}>
                    <CheckIcon size={12} color={Brand.white} />
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label={editing ? 'Save changes' : 'Continue'} onPress={save} disabled={!isValid} />
        </View>
      </KeyboardAvoidingView>
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
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 32,
  },
  title: {
    color: Brand.ink,
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
  form: {
    marginTop: 32,
    gap: 20,
  },
  group: {
    gap: 8,
  },
  hint: {
    paddingHorizontal: 4,
    color: Brand.muted,
    fontSize: 13,
    fontFamily: Typeface.regular,
  },
  error: {
    paddingHorizontal: 4,
    color: '#C2410C',
    fontSize: 13,
    fontFamily: Typeface.medium,
  },
  phone: {
    height: 58,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: Surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneText: {
    color: Brand.body,
    fontSize: 16.5,
    fontFamily: Typeface.medium,
  },
  verified: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AUTH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
