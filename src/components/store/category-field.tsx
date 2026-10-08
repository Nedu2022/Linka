import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronDownIcon } from '@/components/icons';
import { type StoreCategory } from '@/components/store/categories';
import { FieldLabel } from '@/components/store/text-field';
import { Brand, Surface, Typeface } from '@/constants/theme';

type Props = { value: StoreCategory | null; onPress: () => void };

export function CategoryField({ value, onPress }: Props) {
  return (
    <View style={styles.group}>
      <FieldLabel label="Category" />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={value ? `Category, ${value}` : 'Choose a category'}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}>
        <Text style={[styles.value, !value && styles.placeholder]}>{value ?? 'Choose a category'}</Text>
        <ChevronDownIcon size={18} color={Brand.body} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  field: {
    height: 58,
    borderRadius: 20,
    backgroundColor: Surface.card,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.8,
  },
  value: {
    color: Brand.ink,
    fontSize: 16.5,
    fontFamily: Typeface.medium,
  },
  placeholder: {
    color: '#A3AAA6',
  },
});
