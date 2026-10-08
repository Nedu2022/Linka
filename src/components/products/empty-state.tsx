import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { ImageIcon, PlusIcon } from '@/components/icons';
import { Brand, Typeface } from '@/constants/theme';

type Props = { onAdd: () => void; onAddBulk: () => void };

export function ProductsEmptyState({ onAdd, onAddBulk }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.tile, i === 0 && styles.tileAccent]} />
        ))}
      </View>
      <Text style={styles.title}>No products yet</Text>
      <Text style={styles.body}>Add your first item — or upload several photos and fill them in together.</Text>
      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Add your first product"
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <PlusIcon size={18} color={Brand.white} />
        <Text style={styles.ctaText}>Add product</Text>
      </Pressable>
      <Pressable
        onPress={onAddBulk}
        accessibilityRole="button"
        accessibilityLabel="Add many products from photos"
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
        <ImageIcon size={18} color={AUTH_GREEN} />
        <Text style={styles.secondaryText}>Add many from photos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  grid: {
    width: 120,
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F0F2F1',
  },
  tileAccent: {
    backgroundColor: '#D9EEE4',
  },
  title: {
    color: Brand.ink,
    fontSize: 22,
    fontFamily: Typeface.bold,
    letterSpacing: -0.4,
  },
  body: {
    marginTop: 8,
    color: Brand.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: Typeface.regular,
    maxWidth: 300,
  },
  cta: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: AUTH_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: Typeface.bold,
  },
  secondary: {
    marginTop: 12,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryText: {
    color: AUTH_GREEN,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
