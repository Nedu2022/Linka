import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Brand, Typeface } from '@/constants/theme';

type Props = { value: string; onChange: (value: string) => void; length?: number };

export function OtpInput({ value, onChange, length = 6 }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, length);
    if (next.length > value.length) Haptics.selectionAsync();
    onChange(next);
  };

  return (
    <Pressable style={styles.row} onPress={() => inputRef.current?.focus()} accessibilityLabel="Verification code">
      {Array.from({ length }, (_, i) => (
        <OtpCell key={i} char={value[i]} active={focused && i === value.length} />
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

function OtpCell({ char, active }: { char?: string; active: boolean }) {
  const highlight = useSharedValue(active ? 1 : 0);
  const caret = useSharedValue(1);

  useEffect(() => {
    highlight.set(withTiming(active ? 1 : 0, { duration: 160 }));
  }, [active, highlight]);

  useEffect(() => {
    caret.set(withRepeat(withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })), -1));
  }, [caret]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: highlight.get() }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.get() }));

  return (
    <View style={[styles.cell, char ? styles.cellFilled : null]}>
      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      {char ? (
        <Animated.Text key={char} entering={ZoomIn.duration(160)} style={styles.digit}>
          {char}
        </Animated.Text>
      ) : (
        active && <Animated.View style={[styles.caret, caretStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: '#C9D1CD',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#05614E',
  },
  digit: {
    color: Brand.ink,
    fontSize: 26,
    fontFamily: Typeface.bold,
  },
  caret: {
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: '#05614E',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
