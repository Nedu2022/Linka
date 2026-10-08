import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { CircleButton } from '@/components/circle-button';
import { CameraIcon, ChevronLeftIcon, ImageIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { type AiSuggestion, suggestFromPhoto } from '@/components/products/ai-suggestions';
import { AiSuggestionCard, type AiState } from '@/components/products/ai-suggestion-card';
import { TextField } from '@/components/store/text-field';
import { Brand, Typeface } from '@/constants/theme';
import { getProduct, saveProduct } from '@/state/products';

const NAME_MAX = 60;
const DESCRIPTION_MAX = 180;

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? getProduct(id) : null;
  const editing = Boolean(existing);

  const [image, setImage] = useState<string | null>(existing?.image ?? null);
  const [name, setName] = useState(existing?.name ?? '');
  const [priceText, setPriceText] = useState(existing ? String(existing.price) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [inStock, setInStock] = useState(existing?.inStock ?? true);
  const [aiState, setAiState] = useState<AiState>(existing?.image ? 'applied' : 'idle');
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    },
    [],
  );

  const price = Number(priceText.replace(/\D/g, ''));
  const isValid = name.trim().length >= 2 && price > 0;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/products'));

  const runAiScan = (uri: string) => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    setAiState('scanning');
    setSuggestion(null);
    scanTimer.current = setTimeout(() => {
      const next = suggestFromPhoto(uri.length + Date.now());
      setSuggestion(next);
      setAiState('ready');
    }, 1100);
  };

  const pickImage = async (useCamera: boolean) => {
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera access needed', 'Allow camera access to photograph your product.');
        return;
      }
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setImage(uri);
    if (!editing || !existing?.name) runAiScan(uri);
  };

  const chooseImage = () => {
    Haptics.selectionAsync();
    if (Platform.OS === 'web') {
      pickImage(false);
      return;
    }
    Alert.alert('Product photo', undefined, [
      { text: 'Take photo', onPress: () => pickImage(true) },
      { text: 'Choose from library', onPress: () => pickImage(false) },
      ...(image
        ? [
            {
              text: 'Remove photo',
              style: 'destructive' as const,
              onPress: () => {
                setImage(null);
                setAiState('idle');
                setSuggestion(null);
              },
            },
          ]
        : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    setName(suggestion.name);
    setDescription(suggestion.description);
    setPriceText(String(suggestion.price));
    setAiState('applied');
  };

  const save = () => {
    if (!isValid) return;
    Keyboard.dismiss();
    const savedId = saveProduct(
      {
        name: name.trim(),
        description: description.trim(),
        price,
        image,
        inStock,
      },
      existing?.id,
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/product-detail', params: { id: savedId } });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Brand.ink} />} />
          <Text style={styles.topTitle}>{editing ? 'Edit product' : 'New product'}</Text>
          <View style={styles.topSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(360)}>
            <Pressable
              onPress={chooseImage}
              accessibilityRole="button"
              accessibilityLabel={image ? 'Change product photo' : 'Add product photo'}
              style={({ pressed }) => [styles.photo, !image && styles.photoEmpty, pressed && styles.pressed]}>
              {image ? (
                <>
                  <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <View style={styles.photoBadge}>
                    <CameraIcon size={14} color={Brand.white} />
                  </View>
                </>
              ) : (
                <>
                  <ImageIcon size={28} color={Brand.muted} />
                  <Text style={styles.photoTitle}>Add photo</Text>
                  <Text style={styles.photoHint}>AI can fill in the rest</Text>
                </>
              )}
            </Pressable>
          </Animated.View>

          {(aiState === 'scanning' || aiState === 'ready') && (
            <Animated.View entering={FadeInDown.delay(40).duration(320)} style={styles.ai}>
              <AiSuggestionCard
                state={aiState}
                suggestion={suggestion}
                onApply={applySuggestion}
                onDismiss={() => {
                  setAiState('idle');
                  setSuggestion(null);
                }}
              />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(100).duration(360)} style={styles.form}>
            <TextField
              bordered
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ankara wrap dress"
              maxLength={NAME_MAX}
              autoCapitalize="words"
              returnKeyType="done"
            />

            <TextField
              bordered
              label="Price"
              value={priceText}
              onChangeText={(text) => setPriceText(text.replace(/\D/g, '').slice(0, 9))}
              placeholder="₦0"
              keyboardType="number-pad"
              returnKeyType="done"
            />

            <TextField
              bordered
              label="Description"
              optional
              value={description}
              onChangeText={setDescription}
              placeholder="Sizes, colours, details"
              maxLength={DESCRIPTION_MAX}
              multiline
              autoCapitalize="sentences"
              trailing={
                <Text style={styles.counter}>
                  {description.length}/{DESCRIPTION_MAX}
                </Text>
              }
            />

            <View style={styles.stockRow}>
              <Text style={styles.stockTitle}>In stock</Text>
              <Switch
                value={inStock}
                onValueChange={setInStock}
                trackColor={{ false: '#E4E7E5', true: '#A8D9C6' }}
                thumbColor={inStock ? AUTH_GREEN : '#FFFFFF'}
              />
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label={editing ? 'Save' : 'Add product'} onPress={save} disabled={!isValid} />
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
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  photo: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F5F4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoEmpty: {
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderStyle: 'dashed',
    backgroundColor: Brand.white,
  },
  photoTitle: {
    marginTop: 4,
    color: Brand.ink,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  photoHint: {
    color: Brand.muted,
    fontSize: 13,
    fontFamily: Typeface.regular,
  },
  photoBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(21,24,22,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ai: {
    marginTop: 14,
  },
  form: {
    marginTop: 24,
    gap: 18,
  },
  counter: {
    color: Brand.muted,
    fontSize: 12,
    fontFamily: Typeface.medium,
    fontVariant: ['tabular-nums'],
  },
  stockRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockTitle: {
    color: Brand.ink,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  pressed: {
    opacity: 0.8,
  },
});
