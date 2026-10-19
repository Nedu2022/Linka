import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleButton } from '@/components/circle-button';
import { EyeIcon, PlusIcon, ShareIcon } from '@/components/icons';
import { Surface, Typeface } from '@/constants/theme';

type Props = { onAddProduct: () => void; onShareStore: () => void; onViewStore: () => void };

export function QuickActions({ onAddProduct, onShareStore, onViewStore }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onAddProduct}
        accessibilityRole="button"
        accessibilityLabel="Add product"
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
        <PlusIcon size={20} color={Surface.lime} />
        <Text style={styles.primaryText}>Add product</Text>
      </Pressable>
      <CircleButton
        size={58}
        label="Share store"
        onPress={onShareStore}
        icon={<ShareIcon size={21} color={Surface.ink} />}
      />
      <CircleButton
        size={58}
        label="View store"
        onPress={onViewStore}
        icon={<EyeIcon size={21} color={Surface.ink} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primary: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    backgroundColor: Surface.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Typeface.bold,
  },
});
