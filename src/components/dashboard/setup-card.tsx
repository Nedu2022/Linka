import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArrowRightIcon } from '@/components/icons';
import { Surface, Typeface } from '@/constants/theme';

type Props = { title: string; body: string; steps: string[]; icon: ReactNode; onPress: () => void };

export function SetupCard({ title, body, steps, icon, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.shield}>{icon}</View>
      </View>
      <Text style={styles.body}>{body}</Text>

      <View style={styles.bottom}>
        <View style={styles.steps}>
          {steps.map((step) => (
            <View key={step} style={styles.step}>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
        <View style={styles.go}>
          <ArrowRightIcon size={20} color={Surface.lime} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 30,
    backgroundColor: Surface.card,
  },
  pressed: {
    opacity: 0.9,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    flex: 1,
    color: Surface.ink,
    fontSize: 23,
    lineHeight: 29,
    fontFamily: Typeface.bold,
    letterSpacing: -0.6,
  },
  shield: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: 8,
    color: '#6B726E',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typeface.regular,
  },
  bottom: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
  },
  step: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: Surface.canvas,
    justifyContent: 'center',
  },
  stepText: {
    color: Surface.ink,
    fontSize: 13,
    fontFamily: Typeface.semibold,
  },
  go: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Surface.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
