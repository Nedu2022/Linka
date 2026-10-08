import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { TODAY } from '@/components/dashboard/sample-data';
import { TAB_BAR_SPACE, TabBar } from '@/components/dashboard/tab-bar';
import { PlusIcon } from '@/components/icons';
import { ProductsEmptyState } from '@/components/products/empty-state';
import { ProductCard } from '@/components/products/product-card';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { useProducts } from '@/state/products';

export default function ProductsScreen() {
  const products = useProducts();

  const goTab = (key: string) => {
    if (key === 'home') router.replace('/dashboard');
    else if (key === 'products') return;
    else Haptics.selectionAsync();
  };

  const openAdd = () => {
    Haptics.selectionAsync();
    router.push('/product-edit');
  };

  const openBulk = () => {
    Haptics.selectionAsync();
    router.push('/product-bulk');
  };

  const openAddMenu = () => {
    // Alert buttons are a no-op on web, so go straight to the single-product form there.
    if (Platform.OS === 'web') {
      openAdd();
      return;
    }
    Haptics.selectionAsync();
    Alert.alert('Add products', undefined, [
      { text: 'Add one', onPress: openAdd },
      { text: 'Add many from photos', onPress: openBulk },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Products</Text>
          {products.length > 0 ? (
            <Text style={styles.count}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </Text>
          ) : null}
        </View>
        <CircleButton
          size={44}
          dark
          label="Add product"
          onPress={openAddMenu}
          icon={<PlusIcon size={20} color={Surface.lime} />}
        />
      </View>

      {products.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(380)} style={styles.emptyPad}>
          <ProductsEmptyState onAdd={openAdd} onAddBulk={openBulk} />
        </Animated.View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 35).duration(360)} style={styles.cell}>
              <ProductCard
                product={item}
                onPress={() => router.push({ pathname: '/product-detail', params: { id: item.id } })}
              />
            </Animated.View>
          )}
        />
      )}

      <TabBar active="products" onChange={goTab} ordersBadge={TODAY.newOrders} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  title: {
    color: Brand.ink,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.8,
  },
  count: {
    color: Brand.muted,
    fontSize: 15,
    fontFamily: Typeface.medium,
  },
  emptyPad: {
    flex: 1,
    paddingBottom: TAB_BAR_SPACE,
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: TAB_BAR_SPACE,
    gap: 20,
  },
  row: {
    gap: 14,
  },
  cell: {
    flex: 1,
  },
});
