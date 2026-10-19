import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowRightIcon, BagIcon } from '@/components/icons';
import { StorefrontCartDrawer } from '@/components/storefront/cart-drawer';
import { StorefrontCheckoutDrawer } from '@/components/storefront/checkout-drawer';
import { StorefrontProductCard } from '@/components/storefront/product-card';
import { StorefrontProductModal } from '@/components/storefront/product-modal';
import { StoreHeader } from '@/components/storefront/store-header';
import { Brand, Typeface } from '@/constants/theme';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  useCart,
} from '@/state/cart';
import { type Product, useProducts } from '@/state/products';
import { useStoreProfile } from '@/state/store-profile';
import { useVendorProfile } from '@/state/vendor-profile';
import { formatNaira } from '@/utils/money';

export default function StorefrontScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const currentStore = useStoreProfile();
  const store = currentStore.slug === slug ? currentStore : { ...currentStore, slug: slug || currentStore.slug };
  const vendor = useVendorProfile();
  const allProducts = useProducts();
  const cartItems = useCart();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Calculate cart quantities map
  const cartQuantities = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cartItems]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalCartPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  // Available categories
  const categories = useMemo(() => {
    return ['All', 'In Stock'];
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        search.trim() === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' ||
        (selectedCategory === 'In Stock' && product.inStock);

      return matchesSearch && matchesCat;
    });
  }, [allProducts, search, selectedCategory]);

  const handleOpenCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCartOpen(true);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="light" />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          totalCartCount > 0 && styles.listContentWithBar,
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <StoreHeader
            store={store}
            vendor={vendor}
            search={search}
            onSearchChange={setSearch}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
          />
        }
        renderItem={({ item }) => (
          <StorefrontProductCard
            product={item}
            quantityInCart={cartQuantities.get(item.id) ?? 0}
            onAddToCart={(prod) => addToCart(prod, 1)}
            onUpdateQuantity={(id, qty) => updateQuantity(id, qty)}
            onPress={(prod) => setActiveProduct(prod)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyDesc}>Try searching for something else or clearing filters.</Text>
          </View>
        }
      />

      {/* Floating Bottom Bag Bar */}
      {totalCartCount > 0 && (
        <Animated.View entering={SlideInDown.duration(280)} style={styles.floatingBarWrap}>
          <Pressable
            onPress={handleOpenCart}
            style={({ pressed }) => [styles.floatingBar, pressed && styles.floatingBarPressed]}
            accessibilityRole="button"
            accessibilityLabel={`View bag, ${totalCartCount} items, ${formatNaira(totalCartPrice)}`}>
            <View style={styles.barLeft}>
              <View style={styles.bagIconWrap}>
                <BagIcon size={18} color={Brand.white} />
                <View style={styles.barBadge}>
                  <Text style={styles.barBadgeText}>{totalCartCount}</Text>
                </View>
              </View>
              <Text style={styles.barTitle}>View Bag</Text>
            </View>

            <View style={styles.barRight}>
              <Text style={styles.barTotal}>{formatNaira(totalCartPrice)}</Text>
              <ArrowRightIcon size={18} color={Brand.white} />
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* Product Detail Modal */}
      <StorefrontProductModal
        product={activeProduct}
        quantityInCart={activeProduct ? (cartQuantities.get(activeProduct.id) ?? 0) : 0}
        onClose={() => setActiveProduct(null)}
        onAddToCart={(prod, qty) => addToCart(prod, qty)}
      />

      {/* Shopping Cart Drawer */}
      <StorefrontCartDrawer
        visible={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={(id, qty) => updateQuantity(id, qty)}
        onRemoveItem={(id) => removeFromCart(id)}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Drawer */}
      <StorefrontCheckoutDrawer
        visible={checkoutOpen}
        store={store}
        vendor={vendor}
        items={cartItems}
        onClose={() => setCheckoutOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  listContent: {
    paddingBottom: 40,
  },
  listContentWithBar: {
    paddingBottom: 110,
  },
  columnWrapper: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyWrap: {
    padding: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Typeface.bold,
    color: Brand.ink,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: Typeface.regular,
    color: Brand.body,
    textAlign: 'center',
  },
  floatingBarWrap: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  floatingBar: {
    height: 58,
    backgroundColor: '#05614E',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#033F33',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  floatingBarPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  barLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bagIconWrap: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: Brand.white,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  barBadgeText: {
    fontSize: 10,
    fontFamily: Typeface.extrabold,
    color: '#05614E',
  },
  barTitle: {
    color: Brand.white,
    fontFamily: Typeface.bold,
    fontSize: 15,
  },
  barRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barTotal: {
    color: Brand.white,
    fontFamily: Typeface.extrabold,
    fontSize: 16,
  },
});

