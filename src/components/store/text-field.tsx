import { type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { Brand, Surface, Typeface } from '@/constants/theme';

export const FIELD_FILL = Surface.canvas;

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  optional?: boolean;
  trailing?: ReactNode;
  /** Show a hairline border at rest — use on white screens where the fill alone disappears. */
  bordered?: boolean;
};

export function TextField({ label, optional, trailing, bordered, multiline, onFocus, onBlur, ...input }: Props) {
  const focus = useSharedValue(0);
  const restBorder = bordered ? Brand.border : Surface.card;

  const fieldStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.get(), [0, 1], [restBorder, AUTH_GREEN]),
  }));

  return (
    <View style={styles.group}>
      <FieldLabel label={label} optional={optional} />
      <Animated.View style={[styles.field, multiline && styles.fieldMultiline, fieldStyle]}>
        <TextInput
          {...input}
          multiline={multiline}
          onFocus={(e) => {
            focus.set(withTiming(1, { duration: 160 }));
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.set(withTiming(0, { duration: 160 }));
            onBlur?.(e);
          }}
          placeholderTextColor="#A3AAA6"
          selectionColor={AUTH_GREEN}
          accessibilityLabel={label}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {trailing && <View style={multiline ? styles.trailingMultiline : styles.trailing}>{trailing}</View>}
      </Animated.View>
    </View>
  );
}

export function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {optional && <Text style={styles.optional}>  Optional</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    paddingHorizontal: 4,
    color: Brand.ink,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  optional: {
    color: Brand.muted,
    fontFamily: Typeface.medium,
  },
  field: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: Surface.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldMultiline: {
    minHeight: 124,
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: Brand.ink,
    fontSize: 16.5,
    fontFamily: Typeface.medium,
    outlineWidth: 0,
  },
  inputMultiline: {
    paddingBottom: 36,
    lineHeight: 23,
    textAlignVertical: 'top',
  },
  trailing: {
    paddingRight: 16,
  },
  trailingMultiline: {
    position: 'absolute',
    right: 18,
    bottom: 14,
  },
});
