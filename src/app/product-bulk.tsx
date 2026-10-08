import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { CircleButton } from '@/components/circle-button';
import { ChevronLeftIcon, ImageIcon, PlusIcon, SparklesIcon, TrashIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { suggestFromPhoto } from '@/components/products/ai-suggestions';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { saveProducts } from '@/state/products';
import { formatNaira } from '@/utils/money';

const MAX_BULK = 20;
const NAME_MAX = 60;

type DraftRow = {
  key: string;
  image: string;
  name: string;
  priceText: string;
  description: string;
  scanning: boolean;
};

function makeKey() {
  return `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function ProductBulkScreen() {
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [saving, setSaving] = useState(false);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    [],
  );

  const validRows = rows.filter((r) => r.name.trim().length >= 2 && Number(r.priceText) > 0 && !r.scanning);
  const scanning = rows.some((r) => r.scanning);
  const canSave = validRows.length > 0 && !scanning && !saving;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/products'));

  const fillFromAi = (key: string, uri: string) => {
    const existing = timers.current.get(key);
    if (existing) clearTimeout(existing);

    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, scanning: true } : r)));

    const timer = setTimeout(() => {
      const suggestion = suggestFromPhoto(uri.length + Date.now() + key.length);
      setRows((prev) =>
        prev.map((r) =>
          r.key === key
            ? {
                ...r,
                scanning: false,
                name: r.name || suggestion.name,
                priceText: r.priceText || String(suggestion.price),
                description: r.description || suggestion.description,
              }
            : r,
        ),
      );
      timers.current.delete(key);
    }, 900 + Math.floor(Math.random() * 400));

    timers.current.set(key, timer);
  };

  const appendUris = (uris: string[]) => {
    const room = MAX_BULK - rows.length;
    const nextUris = uris.slice(0, room);
    if (nextUris.length === 0) {
      Alert.alert('Limit reached', `You can add up to ${MAX_BULK} products at once.`);
      return;
    }

    const created: DraftRow[] = nextUris.map((uri) => ({
      key: makeKey(),
      image: uri,
      name: '',
      priceText: '',
      description: '',
      scanning: true,
    }));

    setRows((prev) => [...prev, ...created]);
    created.forEach((row) => fillFromAi(row.key, row.image));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const pickPhotos = async () => {
    Haptics.selectionAsync();
    const remaining = MAX_BULK - rows.length;
    if (remaining <= 0) {
      Alert.alert('Limit reached', `You can add up to ${MAX_BULK} products at once.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });

    if (result.canceled || result.assets.length === 0) return;
    appendUris(result.assets.map((a) => a.uri));
  };

  const updateRow = (key: string, patch: Partial<DraftRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeRow = (key: string) => {
    Haptics.selectionAsync();
    const timer = timers.current.get(key);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(key);
    }
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const save = () => {
    if (!canSave) return;
    Keyboard.dismiss();
    setSaving(true);

    const ids = saveProducts(
      validRows.map((r) => ({
        name: r.name.trim(),
        description: r.description.trim(),
        price: Number(r.priceText.replace(/\D/g, '')),
        image: r.image,
        inStock: true,
      })),
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);

    if (ids.length === 1) {
      router.replace({ pathname: '/product-detail', params: { id: ids[0] } });
      return;
    }
    router.replace('/products');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Brand.ink} />} />
          <Text style={styles.topTitle}>Add many</Text>
          <View style={styles.topSpacer} />
        </View>

        {rows.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(380)} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <ImageIcon size={28} color={AUTH_GREEN} />
            </View>
            <Text style={styles.emptyTitle}>Upload product photos</Text>
            <Text style={styles.emptyBody}>
              Pick several photos at once. We&apos;ll suggest names and prices — edit anything before saving.
            </Text>
            <Pressable
              onPress={pickPhotos}
              accessibilityRole="button"
              accessibilityLabel="Choose photos"
              style={({ pressed }) => [styles.emptyCta, pressed && styles.pressed]}>
              <PlusIcon size={18} color={Brand.white} />
              <Text style={styles.emptyCtaText}>Choose photos</Text>
            </Pressable>
            <Text style={styles.emptyHint}>Up to {MAX_BULK} at a time</Text>
          </Animated.View>
        ) : (
          <>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}>
              <Animated.View entering={FadeIn.duration(220)} style={styles.banner}>
                <SparklesIcon size={16} color={AUTH_GREEN} />
                <Text style={styles.bannerText}>
                  {scanning
                    ? 'Suggesting details from your photos…'
                    : `${rows.length} ${rows.length === 1 ? 'product' : 'products'} ready to review`}
                </Text>
              </Animated.View>

              {rows.map((row, index) => (
                <Animated.View
                  key={row.key}
                  entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(320)}
                  layout={Layout.springify().damping(18)}
                  style={styles.card}>
                  <View style={styles.cardTop}>
                    <Image source={{ uri: row.image }} style={styles.thumb} contentFit="cover" />
                    <View style={styles.cardFields}>
                      <TextInput
                        value={row.name}
                        onChangeText={(text) => updateRow(row.key, { name: text.slice(0, NAME_MAX) })}
                        placeholder={row.scanning ? 'Scanning…' : 'Product name'}
                        placeholderTextColor="#A3AAA6"
                        selectionColor={AUTH_GREEN}
                        editable={!row.scanning}
                        style={styles.nameInput}
                        accessibilityLabel={`Product ${index + 1} name`}
                      />
                      <View style={styles.priceRow}>
                        <Text style={styles.naira}>₦</Text>
                        <TextInput
                          value={row.priceText}
                          onChangeText={(text) => updateRow(row.key, { priceText: text.replace(/\D/g, '').slice(0, 9) })}
                          placeholder="0"
                          placeholderTextColor="#A3AAA6"
                          keyboardType="number-pad"
                          selectionColor={AUTH_GREEN}
                          editable={!row.scanning}
                          style={styles.priceInput}
                          accessibilityLabel={`Product ${index + 1} price`}
                        />
                        {row.scanning ? (
                          <ActivityIndicator size="small" color={AUTH_GREEN} style={styles.scanSpin} />
                        ) : row.priceText ? (
                          <Text style={styles.priceHint}>{formatNaira(Number(row.priceText))}</Text>
                        ) : null}
                      </View>
                    </View>
                    <Pressable
                      onPress={() => removeRow(row.key)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove product ${index + 1}`}
                      style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
                      <TrashIcon size={16} color={Brand.muted} />
                    </Pressable>
                  </View>
                </Animated.View>
              ))}

              {rows.length < MAX_BULK ? (
                <Pressable
                  onPress={pickPhotos}
                  accessibilityRole="button"
                  accessibilityLabel="Add more photos"
                  style={({ pressed }) => [styles.addMore, pressed && styles.pressed]}>
                  <PlusIcon size={18} color={AUTH_GREEN} />
                  <Text style={styles.addMoreText}>Add more photos</Text>
                </Pressable>
              ) : null}
            </ScrollView>

            <View style={styles.footer}>
              <PrimaryButton
                label={
                  validRows.length === 0
                    ? 'Add products'
                    : `Add ${validRows.length} product${validRows.length === 1 ? '' : 's'}`
                }
                onPress={save}
                disabled={!canSave}
                loading={saving}
              />
            </View>
          </>
        )}
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
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: Brand.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  topSpacer: {
    width: 44,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  emptyTitle: {
    color: Brand.ink,
    fontSize: 24,
    fontFamily: Typeface.bold,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 10,
    color: Brand.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: Typeface.regular,
    maxWidth: 300,
  },
  emptyCta: {
    marginTop: 28,
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: AUTH_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyCtaText: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: Typeface.bold,
  },
  emptyHint: {
    marginTop: 14,
    color: Brand.muted,
    fontSize: 13,
    fontFamily: Typeface.medium,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  banner: {
    height: 44,
    borderRadius: 12,
    backgroundColor: Brand.greenTint,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  bannerText: {
    flex: 1,
    color: AUTH_GREEN,
    fontSize: 13.5,
    fontFamily: Typeface.medium,
  },
  card: {
    borderRadius: 18,
    backgroundColor: Surface.canvas,
    padding: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: Brand.border,
  },
  cardFields: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
  nameInput: {
    color: Brand.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
    padding: 0,
    outlineWidth: 0,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  naira: {
    color: Brand.muted,
    fontSize: 16,
    fontFamily: Typeface.semibold,
  },
  priceInput: {
    minWidth: 64,
    color: Brand.ink,
    fontSize: 16,
    fontFamily: Typeface.semibold,
    padding: 0,
    fontVariant: ['tabular-nums'],
    outlineWidth: 0,
  },
  priceHint: {
    marginLeft: 6,
    color: Brand.muted,
    fontSize: 12,
    fontFamily: Typeface.medium,
  },
  scanSpin: {
    marginLeft: 8,
  },
  remove: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  addMore: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  addMoreText: {
    color: AUTH_GREEN,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  pressed: {
    opacity: 0.75,
  },
});
