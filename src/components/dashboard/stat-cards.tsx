import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BagIcon, EyeIcon, NairaIcon } from '@/components/icons';
import { Surface, Typeface } from '@/constants/theme';
import { formatNairaCompact } from '@/utils/money';

type Props = { sales: number; change: number; newOrders: number; storeVisits: number };

export function StatCards({ sales, change, newOrders, storeVisits }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroller}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + GAP}>
      <StatCard
        tone="green"
        label="Today's sales"
        value={formatNairaCompact(sales)}
        note={`${change >= 0 ? '+' : '−'}${Math.abs(change)}% vs yesterday`}
        icon={<NairaIcon size={18} color={Surface.green} />}
      />
      <StatCard
        tone="ink"
        label="New orders"
        value={String(newOrders)}
        icon={<BagIcon size={18} color={Surface.ink} />}
      />
      <StatCard
        tone="light"
        label="Store visits"
        value={String(storeVisits)}
        icon={<EyeIcon size={18} color={Surface.card} />}
      />
    </ScrollView>
  );
}

type Tone = 'green' | 'ink' | 'light';

const TONES: Record<Tone, { bg: string; text: string; muted: string; chip: string }> = {
  green: { bg: Surface.green, text: '#FFFFFF', muted: 'rgba(255,255,255,0.72)', chip: '#FFFFFF' },
  ink: { bg: Surface.ink, text: '#FFFFFF', muted: 'rgba(255,255,255,0.62)', chip: '#FFFFFF' },
  light: { bg: Surface.card, text: Surface.ink, muted: '#7C837F', chip: Surface.ink },
};

function StatCard({
  tone,
  label,
  value,
  note,
  icon,
}: {
  tone: Tone;
  label: string;
  value: string;
  note?: string;
  icon: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <View style={[styles.card, { backgroundColor: t.bg }]} accessible accessibilityLabel={`${label}, ${value}`}>
      <View style={styles.top}>
        <Text style={[styles.label, { color: t.muted }]}>{label.toUpperCase()}</Text>
        <View style={[styles.chip, { backgroundColor: t.chip }]}>{icon}</View>
      </View>
      <View>
        <Text style={[styles.value, { color: t.text }]} numberOfLines={1}>
          {value}
        </Text>
        {note && <Text style={[styles.note, tone === 'green' && styles.noteLime]}>{note}</Text>}
      </View>
    </View>
  );
}

const CARD_WIDTH = 164;
const GAP = 12;

const styles = StyleSheet.create({
  scroller: {
    marginHorizontal: -20,
  },
  row: {
    paddingHorizontal: 20,
    gap: GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 172,
    borderRadius: 30,
    padding: 18,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    flex: 1,
    paddingTop: 2,
    fontSize: 11.5,
    lineHeight: 15,
    fontFamily: Typeface.semibold,
    letterSpacing: 0.7,
  },
  note: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontFamily: Typeface.medium,
  },
  noteLime: {
    color: Surface.lime,
  },
  value: {
    fontSize: 34,
    lineHeight: 38,
    fontFamily: Typeface.bold,
    letterSpacing: -1,
  },
  chip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
