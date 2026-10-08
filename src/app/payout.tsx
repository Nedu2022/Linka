import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { CircleButton } from '@/components/circle-button';
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon } from '@/components/icons';
import { BankSheet } from '@/components/payout/bank-sheet';
import { type Bank } from '@/components/payout/banks';
import { PrimaryButton } from '@/components/primary-button';
import { FieldLabel, TextField } from '@/components/store/text-field';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { ACCOUNT_NUMBER_LENGTH, resolveAccountName, savePayoutAccount, usePayoutAccount } from '@/state/payout';

type Lookup = { status: 'idle' } | { status: 'checking' } | { status: 'found'; name: string } | { status: 'failed' };

export default function PayoutScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const inSetup = from === 'setup';
  const existing = usePayoutAccount();

  const [bank, setBank] = useState<Bank | null>(existing ? { id: existing.bankId, name: existing.bankName } : null);
  const [accountNumber, setAccountNumber] = useState(existing?.accountNumber ?? '');
  const [lookup, setLookup] = useState<Lookup>(
    existing ? { status: 'found', name: existing.accountName } : { status: 'idle' },
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const lookupId = useRef(0);

  const complete = bank !== null && accountNumber.length === ACCOUNT_NUMBER_LENGTH;

  // Runs whenever the bank or number changes; a newer lookup makes any in-flight one stale.
  const lookUp = (nextBank: Bank | null, nextNumber: string) => {
    const id = ++lookupId.current;
    if (!nextBank || nextNumber.length !== ACCOUNT_NUMBER_LENGTH) {
      setLookup({ status: 'idle' });
      return;
    }
    if (existing && nextBank.id === existing.bankId && nextNumber === existing.accountNumber) {
      setLookup({ status: 'found', name: existing.accountName });
      return;
    }
    setLookup({ status: 'checking' });
    Keyboard.dismiss();
    resolveAccountName(nextBank.id, nextNumber)
      .then((name) => {
        if (id === lookupId.current) setLookup(name ? { status: 'found', name } : { status: 'failed' });
      })
      .catch(() => {
        if (id === lookupId.current) setLookup({ status: 'failed' });
      });
  };

  const changeAccountNumber = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, ACCOUNT_NUMBER_LENGTH);
    if (next === accountNumber) return;
    setAccountNumber(next);
    lookUp(bank, next);
  };

  const chooseBank = (next: Bank) => {
    setBank(next);
    if (next.id !== bank?.id) lookUp(next, accountNumber);
  };

  const openBanks = () => {
    Keyboard.dismiss();
    setSheetOpen(true);
  };

  const finish = () => {
    if (inSetup) router.replace('/store-preview');
    else if (router.canGoBack()) router.back();
    else router.replace('/dashboard');
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/dashboard'));

  const save = () => {
    if (!bank || lookup.status !== 'found') return;
    savePayoutAccount({ bankId: bank.id, bankName: bank.name, accountNumber, accountName: lookup.name });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    finish();
  };

  const skip = () => {
    Haptics.selectionAsync();
    finish();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Surface.ink} />} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <Animated.Text entering={FadeInDown.duration(450)} style={styles.title}>
            Where should we pay you?
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(70).duration(450)} style={styles.subtitle}>
            Money from your orders is sent to this account. It must be in your name.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.form}>
            <View style={styles.group}>
              <FieldLabel label="Bank" />
              <Pressable
                onPress={openBanks}
                accessibilityRole="button"
                accessibilityLabel={bank ? `Bank, ${bank.name}` : 'Choose your bank'}
                style={({ pressed }) => [styles.select, pressed && styles.pressed]}>
                <Text style={[styles.selectValue, !bank && styles.placeholder]}>
                  {bank?.name ?? 'Choose your bank'}
                </Text>
                <ChevronDownIcon size={18} color={Brand.body} />
              </Pressable>
            </View>

            <TextField
              label="Account number"
              value={accountNumber}
              onChangeText={changeAccountNumber}
              placeholder="0123456789"
              keyboardType="number-pad"
              maxLength={ACCOUNT_NUMBER_LENGTH}
              returnKeyType="done"
              trailing={
                <Text style={styles.counter}>
                  {accountNumber.length}/{ACCOUNT_NUMBER_LENGTH}
                </Text>
              }
            />

            <AccountName lookup={lookup} />
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Save account" onPress={save} disabled={lookup.status !== 'found' || !complete} />
          {inSetup && (
            <Pressable
              onPress={skip}
              accessibilityRole="button"
              style={({ pressed }) => [styles.later, pressed && styles.pressed]}>
              <Text style={styles.laterText}>Do this later</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      <BankSheet
        visible={sheetOpen}
        value={bank?.id ?? null}
        onSelect={chooseBank}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

function AccountName({ lookup }: { lookup: Lookup }) {
  if (lookup.status === 'idle') return null;

  if (lookup.status === 'checking') {
    return (
      <Animated.View entering={FadeIn.duration(180)} style={styles.result}>
        <ActivityIndicator color={AUTH_GREEN} />
        <Text style={styles.resultMuted}>Checking account…</Text>
      </Animated.View>
    );
  }

  if (lookup.status === 'failed') {
    return (
      <Animated.View entering={FadeIn.duration(180)} style={styles.result}>
        <Text style={styles.resultError}>We couldn’t find this account. Check the bank and number.</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.result} accessibilityLiveRegion="polite">
      <View style={styles.resultText}>
        <Text style={styles.resultLabel}>Account name</Text>
        <Text style={styles.resultName} numberOfLines={2}>
          {lookup.name}
        </Text>
      </View>
      <Animated.View entering={ZoomIn.duration(200)} style={styles.check}>
        <CheckIcon size={13} color={Brand.white} />
      </Animated.View>
    </Animated.View>
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
  select: {
    height: 58,
    borderRadius: 20,
    backgroundColor: Surface.card,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    color: Brand.ink,
    fontSize: 16.5,
    fontFamily: Typeface.medium,
  },
  placeholder: {
    color: '#A3AAA6',
  },
  counter: {
    color: Brand.muted,
    fontSize: 12.5,
    fontFamily: Typeface.medium,
    fontVariant: ['tabular-nums'],
  },
  result: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: Surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultLabel: {
    color: Brand.muted,
    fontSize: 13,
    fontFamily: Typeface.medium,
  },
  resultName: {
    color: Surface.ink,
    fontSize: 16.5,
    fontFamily: Typeface.bold,
    letterSpacing: 0.2,
  },
  resultMuted: {
    color: Brand.body,
    fontSize: 15,
    fontFamily: Typeface.medium,
  },
  resultError: {
    flex: 1,
    color: '#C2410C',
    fontSize: 14.5,
    lineHeight: 21,
    fontFamily: Typeface.medium,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AUTH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 4,
  },
  later: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterText: {
    color: Brand.muted,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  pressed: {
    opacity: 0.7,
  },
});
