import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { SparklesIcon } from '@/components/icons';
import { type AiSuggestion } from '@/components/products/ai-suggestions';
import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { Brand, Typeface } from '@/constants/theme';
import { formatNaira } from '@/utils/money';

export type AiState = 'idle' | 'scanning' | 'ready' | 'applied';

type Props = {
  state: AiState;
  suggestion: AiSuggestion | null;
  onApply: () => void;
  onDismiss: () => void;
};

export function AiSuggestionCard({ state, suggestion, onApply, onDismiss }: Props) {
  if (state === 'idle' || state === 'applied') return null;

  if (state === 'scanning') {
    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.banner}>
        <ActivityIndicator size="small" color={AUTH_GREEN} />
        <Text style={styles.bannerText}>Suggesting details from your photo…</Text>
      </Animated.View>
    );
  }

  if (!suggestion) return null;

  return (
    <Animated.View entering={FadeInDown.duration(280)} style={styles.ready}>
      <View style={styles.readyTop}>
        <SparklesIcon size={16} color={AUTH_GREEN} />
        <Text style={styles.readyLabel}>AI suggestion</Text>
      </View>
      <Text style={styles.name}>{suggestion.name}</Text>
      <Text style={styles.price}>{formatNaira(suggestion.price)}</Text>
      <Text style={styles.desc} numberOfLines={2}>
        {suggestion.description}
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onDismiss();
          }}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.dismiss}>Dismiss</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onApply();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.apply, pressed && styles.pressed]}>
          <Text style={styles.applyText}>Apply</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2F9F6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerText: {
    color: AUTH_GREEN,
    fontSize: 14,
    fontFamily: Typeface.medium,
  },
  ready: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7EBE3',
    backgroundColor: '#F7FBF9',
    padding: 16,
    gap: 4,
  },
  readyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  readyLabel: {
    color: AUTH_GREEN,
    fontSize: 12,
    fontFamily: Typeface.semibold,
    letterSpacing: 0.2,
  },
  name: {
    color: Brand.ink,
    fontSize: 16,
    fontFamily: Typeface.bold,
  },
  price: {
    color: Brand.ink,
    fontSize: 15,
    fontFamily: Typeface.semibold,
  },
  desc: {
    marginTop: 2,
    color: Brand.body,
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: Typeface.regular,
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  dismiss: {
    color: Brand.muted,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  apply: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: AUTH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: Typeface.bold,
  },
  pressed: {
    opacity: 0.75,
  },
});
