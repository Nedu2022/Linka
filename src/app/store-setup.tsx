import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { ChevronLeftIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { type StoreCategory } from '@/components/store/categories';
import { CategoryField } from '@/components/store/category-field';
import { CategorySheet } from '@/components/store/category-sheet';
import { StorePreviewCard } from '@/components/store/store-preview-card';
import { TextField } from '@/components/store/text-field';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { getStoreProfile, saveStoreProfile } from '@/state/store-profile';
import { toStoreSlug } from '@/utils/slug';

const NAME_MAX = 40;
const DESCRIPTION_MAX = 140;

export default function StoreSetupScreen() {
  const editing = useLocalSearchParams<{ edit?: string }>().edit === '1';
  const existing = editing ? getStoreProfile() : null;
  const [logo, setLogo] = useState<string | null>(existing?.logo ?? null);
  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<StoreCategory | null>(existing?.category ?? null);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [sheetOpen, setSheetOpen] = useState(false);

  const slug = toStoreSlug(name);
  const isValid = slug.length >= 2 && category !== null;

  const openCategories = () => {
    Keyboard.dismiss();
    setSheetOpen(true);
  };

  const createStore = () => {
    if (!category) return;
    Keyboard.dismiss();
    saveStoreProfile({
      name: name.trim(),
      slug,
      category,
      description: description.trim(),
      logo,
      verified: existing?.verified ?? false,
    });
    if (editing) router.back();
    else router.push({ pathname: '/payout', params: { from: 'setup' } });
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
            {editing ? 'Store details' : 'Set up your store'}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(70).duration(450)} style={styles.subtitle}>
            This is how customers will see you.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.preview}>
            <StorePreviewCard
              logo={logo}
              onLogoChange={setLogo}
              name={name}
              slug={slug}
              category={category}
              description={description}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(210).duration(500)} style={styles.form}>
            <TextField
              label="Store name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Mama Tee Fabrics"
              maxLength={NAME_MAX}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
            />

            <CategoryField value={category} onPress={openCategories} />

            <TextField
              label="Short description"
              optional
              value={description}
              onChangeText={setDescription}
              placeholder="Tell customers what you sell"
              maxLength={DESCRIPTION_MAX}
              multiline
              autoCapitalize="sentences"
              trailing={
                <Text style={styles.counter}>
                  {description.length}/{DESCRIPTION_MAX}
                </Text>
              }
            />
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={editing ? 'Save changes' : 'Create my store'}
            onPress={createStore}
            disabled={!isValid}
            rider={editing ? 'none' : 'van'}
          />
        </View>
      </KeyboardAvoidingView>

      <CategorySheet visible={sheetOpen} value={category} onSelect={setCategory} onClose={() => setSheetOpen(false)} />
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
  preview: {
    marginTop: 28,
  },
  form: {
    marginTop: 28,
    gap: 20,
  },
  counter: {
    color: Brand.muted,
    fontSize: 12.5,
    fontFamily: Typeface.medium,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
