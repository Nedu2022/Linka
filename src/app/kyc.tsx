import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { CircleButton } from '@/components/circle-button';
import { CameraIcon, CheckIcon, ChevronLeftIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { Brand, Typeface } from '@/constants/theme';
import { markStoreVerified } from '@/state/store-profile';

type IdType = 'bvn' | 'nin';

const ID_LENGTH = 11;

export default function KycScreen() {
  const [idType, setIdType] = useState<IdType>('bvn');
  const [digits, setDigits] = useState('');
  const [selfie, setSelfie] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const focus = useSharedValue(0);

  const isValid = digits.length === ID_LENGTH;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/dashboard'));

  const pickSelfie = async (useCamera: boolean) => {
    Haptics.selectionAsync();
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera access needed', 'Allow camera access to take a verification selfie.');
        return;
      }
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          cameraType: ImagePicker.CameraType.front,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
    if (!result.canceled) setSelfie(result.assets[0].uri);
  };

  const chooseSelfie = () => {
    if (Platform.OS === 'web') {
      pickSelfie(false);
      return;
    }
    Alert.alert('Add a selfie', 'Optional — speeds up verification.', [
      { text: 'Take photo', onPress: () => pickSelfie(true) },
      { text: 'Choose from library', onPress: () => pickSelfie(false) },
      ...(selfie ? [{ text: 'Remove', style: 'destructive' as const, onPress: () => setSelfie(null) }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submit = () => {
    if (!isValid || submitting) return;
    Keyboard.dismiss();
    setSubmitting(true);
    setTimeout(() => {
      markStoreVerified();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitting(false);
      router.replace('/dashboard');
    }, 900);
  };

  const fieldStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.get(), [0, 1], [Brand.border, AUTH_GREEN]),
  }));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Brand.ink} />} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <Animated.Text entering={FadeInDown.duration(400)} style={styles.title}>
            Verify your identity
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(50).duration(400)} style={styles.subtitle}>
            This keeps buyers safe and lets you receive payments.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.segment}>
            {(
              [
                { key: 'bvn', label: 'BVN' },
                { key: 'nin', label: 'NIN' },
              ] as const
            ).map((option) => {
              const selected = idType === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIdType(option.key);
                    setDigits('');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.segmentItem, selected && styles.segmentItemActive]}>
                  <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.fieldGroup}>
            <Text style={styles.label}>{idType.toUpperCase()}</Text>
            <Animated.View style={[styles.field, fieldStyle]}>
              <TextInput
                value={digits}
                onChangeText={(text) => setDigits(text.replace(/\D/g, '').slice(0, ID_LENGTH))}
                onFocus={() => focus.set(withTiming(1, { duration: 160 }))}
                onBlur={() => focus.set(withTiming(0, { duration: 160 }))}
                placeholder="00000000000"
                placeholderTextColor="#C5CBC7"
                keyboardType="number-pad"
                maxLength={ID_LENGTH}
                autoFocus
                selectionColor={AUTH_GREEN}
                style={styles.input}
                accessibilityLabel={idType === 'bvn' ? 'BVN' : 'NIN'}
              />
              {isValid ? (
                <Animated.View entering={ZoomIn.duration(200)} style={styles.validBadge}>
                  <CheckIcon size={12} color={Brand.white} />
                </Animated.View>
              ) : (
                <Text style={styles.count}>
                  {digits.length}/{ID_LENGTH}
                </Text>
              )}
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.selfieSection}>
            <Text style={styles.label}>
              Selfie <Text style={styles.optional}>optional</Text>
            </Text>
            <Pressable
              onPress={chooseSelfie}
              accessibilityRole="button"
              accessibilityLabel={selfie ? 'Change selfie' : 'Add selfie'}
              style={({ pressed }) => [styles.selfieRow, pressed && styles.pressed]}>
              <View style={styles.avatar}>
                {selfie ? (
                  <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
                    <Image source={{ uri: selfie }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  </Animated.View>
                ) : (
                  <CameraIcon size={22} color={Brand.muted} />
                )}
              </View>
              <View style={styles.selfieCopy}>
                <Text style={styles.selfieTitle}>{selfie ? 'Selfie added' : 'Add a selfie'}</Text>
                <Text style={styles.selfieBody}>{selfie ? 'Tap to change' : 'Helps us verify you faster'}</Text>
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Continue" onPress={submit} disabled={!isValid} loading={submitting} />
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Do this later"
            style={({ pressed }) => [styles.later, pressed && styles.pressed]}>
            <Text style={styles.laterText}>Do this later</Text>
          </Pressable>
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
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    color: Brand.ink,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.9,
  },
  subtitle: {
    marginTop: 10,
    color: Brand.body,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
    maxWidth: 320,
  },
  segment: {
    marginTop: 32,
    flexDirection: 'row',
    gap: 10,
  },
  segmentItem: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  segmentItemActive: {
    borderColor: AUTH_GREEN,
    backgroundColor: '#F2F9F6',
  },
  segmentText: {
    color: Brand.muted,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  segmentTextActive: {
    color: AUTH_GREEN,
  },
  fieldGroup: {
    marginTop: 28,
    gap: 10,
  },
  label: {
    color: Brand.ink,
    fontSize: 13,
    fontFamily: Typeface.semibold,
    letterSpacing: 0.3,
  },
  optional: {
    color: Brand.muted,
    fontFamily: Typeface.medium,
    letterSpacing: 0,
  },
  field: {
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: Brand.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  input: {
    flex: 1,
    // Web inputs have an intrinsic width that would push the check badge out of the field.
    minWidth: 0,
    height: '100%',
    paddingHorizontal: 18,
    color: Brand.ink,
    fontSize: 22,
    fontFamily: Typeface.semibold,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    outlineWidth: 0,
  },
  count: {
    color: Brand.muted,
    fontSize: 13,
    fontFamily: Typeface.medium,
    fontVariant: ['tabular-nums'],
  },
  validBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AUTH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfieSection: {
    marginTop: 32,
    gap: 12,
  },
  selfieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderStyle: 'dashed',
    backgroundColor: '#FAFBFA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfieCopy: {
    flex: 1,
    gap: 2,
  },
  selfieTitle: {
    color: Brand.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  selfieBody: {
    color: Brand.muted,
    fontSize: 14,
    fontFamily: Typeface.regular,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
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
