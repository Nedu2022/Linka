import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { CircleButton } from '@/components/circle-button';
import { ChevronLeftIcon, PencilIcon, TrashIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { Brand, Typeface } from '@/constants/theme';
import { deleteProduct, toggleProductStock, useProduct } from '@/state/products';
import { formatNaira } from '@/utils/money';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/products'));

  if (!product) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.topBar}>
          <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Brand.ink} />} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Product not found</Text>
          <Pressable onPress={() => router.replace('/products')}>
            <Text style={styles.missingLink}>Back to products</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const confirmDelete = () => {
    Haptics.selectionAsync();
    Alert.alert('Delete product?', `${product.name} will be removed from your store.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProduct(product.id);
          router.replace('/products');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <CircleButton label="Go back" onPress={goBack} icon={<ChevronLeftIcon size={22} color={Brand.ink} />} />
        <View style={styles.topActions}>
          <CircleButton
            label="Edit product"
            onPress={() => router.push({ pathname: '/product-edit', params: { id: product.id } })}
            icon={<PencilIcon size={15} color={Brand.ink} />}
          />
          <CircleButton label="Delete product" onPress={confirmDelete} icon={<TrashIcon size={17} color="#C23B3B" />} />
        </View>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(380)} style={styles.hero}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.heroEmpty} />
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(380)} style={styles.meta}>
          <Text style={[styles.stock, !product.inStock && styles.stockOut]}>
            {product.inStock ? 'In stock' : 'Out of stock'}
          </Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatNaira(product.price)}</Text>
          {product.description.length > 0 ? <Text style={styles.description}>{product.description}</Text> : null}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Edit product"
          onPress={() => router.push({ pathname: '/product-edit', params: { id: product.id } })}
        />
        <Pressable
          onPress={() => {
            toggleProductStock(product.id);
            Haptics.selectionAsync();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>{product.inStock ? 'Mark out of stock' : 'Mark in stock'}</Text>
        </Pressable>
      </View>
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
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  hero: {
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: '#F0F2F1',
    overflow: 'hidden',
  },
  heroEmpty: {
    flex: 1,
    backgroundColor: '#EBEEEC',
  },
  meta: {
    marginTop: 24,
  },
  stock: {
    color: AUTH_GREEN,
    fontSize: 13,
    fontFamily: Typeface.semibold,
    marginBottom: 8,
  },
  stockOut: {
    color: '#C23B3B',
  },
  name: {
    color: Brand.ink,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.7,
  },
  price: {
    marginTop: 8,
    color: Brand.ink,
    fontSize: 22,
    fontFamily: Typeface.bold,
  },
  description: {
    marginTop: 14,
    color: Brand.body,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 2,
  },
  secondary: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: Brand.muted,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  pressed: {
    opacity: 0.7,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missingTitle: {
    color: Brand.ink,
    fontSize: 18,
    fontFamily: Typeface.bold,
  },
  missingLink: {
    color: AUTH_GREEN,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
});
