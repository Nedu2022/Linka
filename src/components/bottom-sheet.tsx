import { type ReactNode, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Brand, Typeface } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Pin the sheet at its max height, e.g. when it holds a search field whose results change length. */
  fullHeight?: boolean;
};

const OPEN = { duration: 320, easing: Easing.out(Easing.cubic) };
const CLOSE = { duration: 220, easing: Easing.in(Easing.cubic) };

export function BottomSheet({ visible, title, onClose, children, fullHeight }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      progress.set(withTiming(1, OPEN));
    } else {
      progress.set(withTiming(0, CLOSE, (done) => done && scheduleOnRN(setMounted, false)));
    }
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() * 0.4 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.get()) * 640 }] }));

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, fullHeight && styles.sheetFull, { paddingBottom: insets.bottom + 8 }, sheetStyle]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: Brand.white,
  },
  sheetFull: {
    height: '82%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: '#DADFDC',
  },
  title: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 8,
    color: Brand.ink,
    fontSize: 22,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.5,
  },
});
