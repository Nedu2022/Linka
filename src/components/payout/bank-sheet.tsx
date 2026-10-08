import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { BottomSheet } from '@/components/bottom-sheet';
import { CheckIcon, SearchIcon } from '@/components/icons';
import { type Bank, BANKS } from '@/components/payout/banks';
import { Brand, Surface, Typeface } from '@/constants/theme';

type Props = {
  visible: boolean;
  value: string | null;
  onSelect: (bank: Bank) => void;
  onClose: () => void;
};

export function BankSheet({ visible, value, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const results = needle ? BANKS.filter((bank) => bank.name.toLowerCase().includes(needle)) : BANKS;

  const close = () => {
    onClose();
    setQuery('');
  };

  const choose = (bank: Bank) => {
    Haptics.selectionAsync();
    onSelect(bank);
    setTimeout(close, 120);
  };

  return (
    <BottomSheet visible={visible} title="Choose your bank" onClose={close} fullHeight>
      <View style={styles.search}>
        <SearchIcon size={18} color={Brand.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search banks"
          placeholderTextColor="#A3AAA6"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          selectionColor={AUTH_GREEN}
          accessibilityLabel="Search banks"
          style={styles.searchInput}
        />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {results.map((bank, i) => {
          const selected = bank.id === value;
          return (
            <Pressable
              key={bank.id}
              onPress={() => choose(bank)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <View style={[styles.rowInner, i > 0 && styles.rowDivider]}>
                <Text style={styles.name}>{bank.name}</Text>
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected && <CheckIcon size={13} color={Brand.white} />}
                </View>
              </View>
            </Pressable>
          );
        })}
        {results.length === 0 && <Text style={styles.empty}>No bank matches “{query.trim()}”.</Text>}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 48,
    marginHorizontal: 24,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: Surface.canvas,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Brand.ink,
    fontSize: 16,
    fontFamily: Typeface.medium,
    outlineWidth: 0,
  },
  row: {
    paddingHorizontal: 24,
  },
  rowPressed: {
    backgroundColor: '#F6F7F6',
  },
  rowInner: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
  },
  name: {
    flex: 1,
    color: Brand.ink,
    fontSize: 16.5,
    fontFamily: Typeface.semibold,
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
  empty: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    color: Brand.muted,
    fontSize: 15,
    fontFamily: Typeface.regular,
    textAlign: 'center',
  },
});
