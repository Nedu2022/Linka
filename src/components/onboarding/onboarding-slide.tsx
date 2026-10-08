import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import StoreLinkIllustration from '@/assets/images/store-link-whatsapp-instagram.svg';
import { PaymentsIllustration } from '@/components/onboarding/payments-illustration';
import { Brand, Typeface } from '@/constants/theme';

export type Slide = {
  key: string;
  stageColor: string;
  title: [before: string, highlight: string, after: string];
  body: string;
  illustration: 'vendor' | 'store-link' | 'payments';
};

export const SLIDES: Slide[] = [
  {
    key: 'create',
    stageColor: '#FCF7EC',
    title: ['Create your store in ', '2 minutes', ''],
    body: "Pick a shop name, add your products, and share your link. You're open for business.",
    illustration: 'vendor',
  },
  {
    key: 'share',
    stageColor: '#E9F5EF',
    title: ['Share ', 'one link', ' everywhere'],
    body: 'Post it on WhatsApp, Instagram, or anywhere. Customers tap, browse, and order. No app needed.',
    illustration: 'store-link',
  },
  {
    key: 'payments',
    stageColor: '#FFF5E3',
    title: ['Payments ', 'confirmed fast', ''],
    body: 'Every order payment is confirmed and tracked for you. No stress, no wahala.',
    illustration: 'payments',
  },
];

export const STAGE_INSET = 16;

type Props = {
  slide: Slide;
  index: number;
  scrollX: SharedValue<number>;
  pageWidth: number;
  stageHeight: number;
};

export function OnboardingSlide({ slide, index, scrollX, pageWidth, stageHeight }: Props) {
  const maxArtWidth = pageWidth - STAGE_INSET * 2 - 40;
  const artWidth = Math.min(maxArtWidth, ((stageHeight - 40) * 350) / 300);
  const artHeight = (artWidth * 300) / 350;

  const range = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];

  const artStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.get(), range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(scrollX.get(), range, [pageWidth * 0.45, 0, -pageWidth * 0.45], Extrapolation.CLAMP) },
      { scale: interpolate(scrollX.get(), range, [0.82, 1, 0.82], Extrapolation.CLAMP) },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.get(), range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(scrollX.get(), range, [60, 0, -60], Extrapolation.CLAMP) }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.get(), range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(scrollX.get(), range, [110, 0, -110], Extrapolation.CLAMP) }],
  }));

  const [before, highlight, after] = slide.title;

  return (
    <View style={{ width: pageWidth }}>
      <View style={[styles.stage, { height: stageHeight }]}>
        <Animated.View style={artStyle}>
          {slide.illustration === 'vendor' && (
            <Image
              source={require('@/assets/images/onboarding/vendor-illustration.png')}
              style={{ width: artWidth, height: artWidth / 1.5, borderRadius: 20 }}
              contentFit="cover"
            />
          )}
          {slide.illustration === 'store-link' && <StoreLinkIllustration width={artWidth} height={artHeight} />}
          {slide.illustration === 'payments' && <PaymentsIllustration width={artWidth} height={artHeight} />}
        </Animated.View>
      </View>

      <View style={styles.copy}>
        <Animated.Text style={[styles.title, titleStyle]}>
          {before}
          <Text style={styles.highlight}>{highlight}</Text>
          {after}
        </Animated.Text>
        <Animated.Text style={[styles.body, bodyStyle]}>{slide.body}</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 12,
  },
  title: {
    color: Brand.ink,
    fontSize: 31,
    lineHeight: 37,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.9,
  },
  highlight: {
    color: Brand.green,
  },
  body: {
    color: Brand.body,
    fontSize: 15.5,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
});
