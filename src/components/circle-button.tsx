import { type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Surface } from '@/constants/theme';

type Props = { icon: ReactNode; label: string; onPress: () => void; size?: number; dark?: boolean };

export function CircleButton({ icon, label, onPress, size = 48, dark = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        dark && styles.dark,
        pressed && styles.pressed,
      ]}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F3F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dark: {
    backgroundColor: Surface.ink,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
