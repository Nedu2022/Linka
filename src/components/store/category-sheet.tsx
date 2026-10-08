import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { BottomSheet } from '@/components/bottom-sheet';
import { CheckIcon } from '@/components/icons';
import { STORE_CATEGORIES, type StoreCategory } from '@/components/store/categories';
import { Brand, Typeface } from '@/constants/theme';

type Props = {
  visible: boolean;
  value: StoreCategory | null;
  onSelect: (category: StoreCategory) => void;
  onClose: () => void;
};

export function CategorySheet({ visible, value, onSelect, onClose }: Props) {
  const choose = (category: StoreCategory) => {
    Haptics.selectionAsync();
    onSelect(category);
    setTimeout(onClose, 120);
  };

  return (
    <BottomSheet visible={visible} title="What do you sell?" onClose={onClose}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {STORE_CATEGORIES.map(({ name, examples }, i) => {
          const selected = name === value;
          return (
            <Pressable
              key={name}
              onPress={() => choose(name)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <View style={[styles.rowInner, i > 0 && styles.rowDivider]}>
                <View style={styles.rowText}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.examples}>{examples}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected && <CheckIcon size={13} color={Brand.white} />}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 24,
  },
  rowPressed: {
    backgroundColor: '#F6F7F6',
  },
  rowInner: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: Brand.ink,
    fontSize: 16.5,
    fontFamily: Typeface.semibold,
  },
  examples: {
    color: Brand.muted,
    fontSize: 13.5,
    fontFamily: Typeface.regular,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CDD3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: AUTH_GREEN,
    backgroundColor: AUTH_GREEN,
  },
});
