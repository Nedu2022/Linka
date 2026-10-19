import * as Haptics from 'expo-haptics';
import { type ReactNode, useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type WithSpringConfig,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { CheckIcon, InstagramIcon, LinkIcon, WhatsAppIcon } from '@/components/icons';
import { Typeface } from '@/constants/theme';

/** The scene is drawn on a fixed 320×300 board and scaled to fit. */
export const SCENE_WIDTH = 320;
export const SCENE_HEIGHT = 300;

const C = {
  forest: '#0A4D3C',
  forestDeep: '#073A2D',
  orange: '#F4A62A',
  orangeDeep: '#D98A12',
  cream: '#FBF4E8',
  creamShade: '#EADCC3',
  clay: '#C2410C',
  clayDeep: '#9A330A',
  mint: '#DDEFE6',
  indigo: '#24346B',
  wood: '#B97A36',
  woodLight: '#D89A4E',
  woodDark: '#8A5422',
  ink: '#151816',
  lime: '#D5F56B',
  white: '#FFFFFF',
  whatsapp: '#25D366',
};

// Story beats in ms after `play` turns true: stall → stock → phone → link goes out → money comes in.
const BEATS = {
  awning: 0,
  stall: 120,
  bolts: [300, 390, 480],
  phone: 640,
  link: 1350,
  whatsapp: 1700,
  instagram: 1840,
  paid: 2350,
  coins: [2520, 2640],
};

const POP: WithSpringConfig = { damping: 13, stiffness: 170, mass: 0.8 };
const SETTLE: WithSpringConfig = { damping: 18, stiffness: 140 };

type Props = {
  play: boolean;
  reduceMotion: boolean;
  scale: number;
  /** ms to wait before the first beat */
  delay?: number;
};

export function MarketScene({ play, reduceMotion, scale, delay = 0 }: Props) {
  const awning = useSharedValue(0);
  const stall = useSharedValue(0);
  const bolt0 = useSharedValue(0);
  const bolt1 = useSharedValue(0);
  const bolt2 = useSharedValue(0);
  const phone = useSharedValue(0);
  const link = useSharedValue(0);
  const whatsapp = useSharedValue(0);
  const instagram = useSharedValue(0);
  const paid = useSharedValue(0);
  const coin0 = useSharedValue(0);
  const coin1 = useSharedValue(0);

  const run = useCallback(
    (lead: number) => {
      const spring = (value: SharedValue<number>, at: number, config = POP) =>
        value.set(withDelay(lead + at, withSpring(1, config)));
      spring(awning, BEATS.awning, SETTLE);
      stall.set(withDelay(lead + BEATS.stall, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })));
      spring(bolt0, BEATS.bolts[0]);
      spring(bolt1, BEATS.bolts[1]);
      spring(bolt2, BEATS.bolts[2]);
      spring(phone, BEATS.phone, SETTLE);
      link.set(
        withDelay(lead + BEATS.link, withTiming(1, { duration: 650, easing: Easing.bezier(0.2, 0.9, 0.25, 1) })),
      );
      spring(whatsapp, BEATS.whatsapp);
      spring(instagram, BEATS.instagram);
      spring(paid, BEATS.paid, SETTLE);
      spring(coin0, BEATS.coins[0]);
      spring(coin1, BEATS.coins[1]);
    },
    [awning, stall, bolt0, bolt1, bolt2, phone, link, whatsapp, instagram, paid, coin0, coin1],
  );

  const all = [awning, stall, bolt0, bolt1, bolt2, phone, link, whatsapp, instagram, paid, coin0, coin1];

  useEffect(() => {
    if (!play) return;
    if (reduceMotion) {
      all.forEach((v) => v.set(1));
      return;
    }
    run(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values are stable
  }, [play, reduceMotion, run, delay]);

  const replay = () => {
    if (reduceMotion) return;
    Haptics.selectionAsync();
    all.forEach((v) => v.set(0));
    requestAnimationFrame(() => run(0));
  };

  const awningStyle = useAnimatedStyle(() => ({
    opacity: Math.min(awning.get() * 2, 1),
    transform: [{ translateY: (1 - awning.get()) * -48 }],
  }));
  const stallStyle = useAnimatedStyle(() => ({
    opacity: stall.get(),
    transform: [{ translateY: (1 - stall.get()) * 18 }],
  }));
  const phoneStyle = useAnimatedStyle(() => ({
    opacity: Math.min(phone.get() * 3, 1),
    transform: [{ translateY: (1 - phone.get()) * 90 }, { rotate: `${(1 - phone.get()) * 8 - 2}deg` }],
  }));
  // The link leaves the phone's screen and settles top-left.
  const linkStyle = useAnimatedStyle(() => {
    const p = link.get();
    return {
      opacity: Math.min(p * 4, 1),
      transform: [{ translateX: (1 - p) * 120 }, { translateY: (1 - p) * 70 }, { scale: 0.5 + p * 0.5 }],
    };
  });
  const paidStyle = useAnimatedStyle(() => ({
    opacity: Math.min(paid.get() * 2, 1),
    transform: [{ translateX: (1 - paid.get()) * -60 }],
  }));

  return (
    <Pressable
      onPress={replay}
      accessibilityRole="image"
      accessibilityLabel="A market stall becomes an online store. Its link is shared on WhatsApp and Instagram, and a ₦18,500 order is paid."
      accessibilityHint="Tap to replay"
      style={{ width: SCENE_WIDTH * scale, height: SCENE_HEIGHT * scale }}>
      <View style={[styles.board, { transform: [{ scale }] }]}>
        <Svg style={styles.ground} width={320} height={40}>
          <Defs>
            <RadialGradient id="ground" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor="#000000" stopOpacity={0.32} />
              <Stop offset="0.7" stopColor="#000000" stopOpacity={0.1} />
              <Stop offset="1" stopColor="#000000" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={160} cy={20} rx={158} ry={16} fill="url(#ground)" />
        </Svg>

        <Animated.View style={[styles.layer, styles.stall, stallStyle]}>
          <Stall />
        </Animated.View>

        <Pop value={bolt0} style={styles.bolt0} origin={-40}>
          <Bolt width={62} height={26} base={C.clay} accent={C.cream} pattern="stripes" id="b0" />
        </Pop>
        <Pop value={bolt1} style={styles.bolt1} origin={-40}>
          <Bolt width={62} height={26} base={C.indigo} accent={C.orange} pattern="dots" id="b1" />
        </Pop>
        <Pop value={bolt2} style={styles.bolt2} origin={-40}>
          <Bolt width={62} height={26} base={C.orange} accent={C.forest} pattern="zigzag" id="b2" />
        </Pop>

        <Animated.View style={[styles.layer, styles.awning, awningStyle]}>
          <Awning />
        </Animated.View>

        <Animated.View style={[styles.layer, styles.phone, phoneStyle]}>
          <Phone />
        </Animated.View>

        <Animated.View style={[styles.layer, styles.link, linkStyle]}>
          <View style={styles.linkPill}>
            <LinkIcon size={14} color={C.forest} />
            <Text style={styles.linkText}>sellpadi.com/adaeze</Text>
          </View>
        </Animated.View>

        <Pop value={whatsapp} style={styles.whatsapp}>
          <View style={styles.whatsappBubble}>
            <WhatsAppIcon size={24} color={C.white} />
          </View>
        </Pop>
        <Pop value={instagram} style={styles.instagram}>
          <InstagramBadge />
        </Pop>

        <Animated.View style={[styles.layer, styles.paid, paidStyle]}>
          <View style={styles.paidToast}>
            <View style={styles.paidCheck}>
              <CheckIcon size={13} color={C.ink} />
            </View>
            <Text style={styles.paidAmount}>₦18,500</Text>
            <Text style={styles.paidLabel}>Paid</Text>
          </View>
        </Animated.View>

        <Pop value={coin1} style={styles.coin1} origin={-30}>
          <Coin size={24} id="c1" />
        </Pop>
        <Pop value={coin0} style={styles.coin0} origin={-30}>
          <Coin size={30} id="c0" />
        </Pop>
      </View>
    </Pressable>
  );
}

/** Springs a piece in from nothing; `origin` drops it from above. */
function Pop({
  value,
  style,
  origin = 0,
  children,
}: {
  value: SharedValue<number>;
  style: object;
  origin?: number;
  children: ReactNode;
}) {
  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(value.get() * 3, 1),
    transform: [{ translateY: (1 - value.get()) * origin }, { scale: 0.4 + value.get() * 0.6 }],
  }));
  return <Animated.View style={[styles.layer, style, animated]}>{children}</Animated.View>;
}

/** Striped canvas awning with a sloped roof, shaded folds, and a scalloped valance. */
function Awning() {
  const stripes = 8;
  const width = 264 / stripes;
  const top = 22;
  const drop = 50;
  return (
    <Svg width={288} height={100}>
      <Defs>
        <LinearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.forestDeep} />
          <Stop offset="1" stopColor={C.forest} />
        </LinearGradient>
        <LinearGradient id="fold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.white} stopOpacity={0.28} />
          <Stop offset="0.35" stopColor={C.white} stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.22} />
        </LinearGradient>
        <LinearGradient id="crease" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.14} />
          <Stop offset="0.25" stopColor="#000000" stopOpacity={0} />
          <Stop offset="0.8" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.1} />
        </LinearGradient>
      </Defs>
      {/* Roof slope seen from slightly above, then the rail the canvas hangs from. */}
      <Path d="M18 2 H270 L284 18 H4 Z" fill="url(#roof)" />
      <Rect x={2} y={16} width={284} height={9} rx={4.5} fill={C.woodDark} />
      <Rect x={2} y={16} width={284} height={3} rx={1.5} fill={C.woodLight} opacity={0.6} />
      <G transform={`translate(12 ${top})`}>
        {Array.from({ length: stripes }, (_, i) => {
          const x = i * width;
          const d = `M${x} 0 h${width} v${drop} a${width / 2} ${width / 2 - 3} 0 0 1 ${-width} 0 z`;
          return (
            <G key={i}>
              <Path d={d} fill={i % 2 === 0 ? C.orange : C.cream} />
              <Path d={d} fill="url(#crease)" />
              <Path d={d} fill="url(#fold)" />
            </G>
          );
        })}
        {/* Stitched hem along the scallops. */}
        {Array.from({ length: stripes }, (_, i) => (
          <Path
            key={`hem-${i}`}
            d={`M${i * width + 3} ${drop} a${width / 2 - 3} ${width / 2 - 6} 0 0 0 ${width - 6} 0`}
            stroke="#000000"
            strokeOpacity={0.16}
            strokeWidth={1.2}
            strokeDasharray="2 2.5"
            fill="none"
          />
        ))}
      </G>
    </Svg>
  );
}

/** Posts, shadowed interior, wooden counter, and an Ankara runner draped over its front. */
function Stall() {
  return (
    <Svg width={296} height={250}>
      <Defs>
        <LinearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#06291F" />
          <Stop offset="1" stopColor="#0D4234" />
        </LinearGradient>
        <LinearGradient id="post" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={C.woodDark} />
          <Stop offset="0.45" stopColor={C.woodLight} />
          <Stop offset="1" stopColor={C.woodDark} />
        </LinearGradient>
        <LinearGradient id="top" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.woodLight} />
          <Stop offset="1" stopColor={C.wood} />
        </LinearGradient>
        <LinearGradient id="front" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.cream} />
          <Stop offset="1" stopColor={C.creamShade} />
        </LinearGradient>
        <LinearGradient id="runner" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.18} />
          <Stop offset="0.12" stopColor="#000000" stopOpacity={0} />
          <Stop offset="0.88" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.18} />
        </LinearGradient>
        <ClipPath id="runnerClip">
          <Path d="M10 164 H286 V196 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 q-11.5 10 -23 0 Z" />
        </ClipPath>
      </Defs>

      {/* Interior in shade, darkest right under the awning. */}
      <Rect x={20} y={14} width={256} height={150} fill="url(#wall)" />
      {Array.from({ length: 7 }, (_, i) => (
        <Rect key={i} x={20 + i * 37} y={14} width={1.5} height={150} fill="#000000" opacity={0.18} />
      ))}

      <Rect x={10} y={0} width={11} height={176} rx={3} fill="url(#post)" />
      <Rect x={275} y={0} width={11} height={176} rx={3} fill="url(#post)" />

      {/* Counter front with plank seams. */}
      <Rect x={8} y={156} width={280} height={86} rx={8} fill="url(#front)" />
      {Array.from({ length: 6 }, (_, i) => (
        <Rect key={i} x={52 + i * 40} y={196} width={1.5} height={44} fill={C.woodDark} opacity={0.18} />
      ))}

      {/* Ankara runner: kente-style bands with a scalloped hem. */}
      <G clipPath="url(#runnerClip)">
        <Rect x={10} y={164} width={276} height={42} fill={C.clay} />
        <Rect x={10} y={170} width={276} height={6} fill={C.orange} />
        <Path
          d="M10 186 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6"
          stroke={C.cream}
          strokeWidth={2.5}
          strokeLinejoin="round"
          fill="none"
        />
        {Array.from({ length: 23 }, (_, i) => (
          <Circle key={i} cx={22 + i * 12} cy={196} r={2} fill={C.orange} />
        ))}
        <Rect x={10} y={164} width={276} height={42} fill="url(#runner)" />
      </G>

      {/* Counter top: a thick plank catching the light. */}
      <Rect x={0} y={146} width={296} height={20} rx={6} fill="url(#top)" />
      <Rect x={2} y={147} width={292} height={3} rx={1.5} fill={C.white} opacity={0.35} />
      <Rect x={0} y={162} width={296} height={4} rx={2} fill={C.woodDark} opacity={0.6} />
      <Rect x={8} y={238} width={280} height={6} rx={3} fill="#000000" opacity={0.2} />
    </Svg>
  );
}

/** A bolt of fabric lying on its side: patterned body, rolled end, cylinder shading. */
function Bolt({
  width,
  height,
  base,
  accent,
  pattern,
  id,
}: {
  width: number;
  height: number;
  base: string;
  accent: string;
  pattern: 'stripes' | 'dots' | 'zigzag';
  id: string;
}) {
  const end = height * 0.3;
  const r = height / 2;
  return (
    <Svg width={width} height={height + 4}>
      <Defs>
        <LinearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.white} stopOpacity={0.35} />
          <Stop offset="0.3" stopColor={C.white} stopOpacity={0} />
          <Stop offset="0.7" stopColor="#000000" stopOpacity={0.05} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.35} />
        </LinearGradient>
        <ClipPath id={`${id}-body`}>
          <Rect x={end} y={0} width={width - end} height={height} rx={4} />
        </ClipPath>
      </Defs>
      <Ellipse cx={width / 2} cy={height + 1} rx={width / 2 - 2} ry={2.5} fill="#000000" opacity={0.28} />
      <G clipPath={`url(#${id}-body)`}>
        <Rect x={0} y={0} width={width} height={height} fill={base} />
        {pattern === 'stripes' &&
          Array.from({ length: 9 }, (_, i) => (
            <Rect key={i} x={end + 4 + i * 7} y={0} width={3} height={height} fill={accent} opacity={0.9} />
          ))}
        {pattern === 'dots' &&
          Array.from({ length: 16 }, (_, i) => (
            <Circle key={i} cx={end + 6 + (i % 8) * 7} cy={i < 8 ? 7 : 18} r={2.2} fill={accent} />
          ))}
        {pattern === 'zigzag' && (
          <>
            <Path
              d={`M${end} 9 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5`}
              stroke={accent}
              strokeWidth={2.4}
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d={`M${end} 21 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5`}
              stroke={accent}
              strokeWidth={2.4}
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )}
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id}-shade)`} />
      </G>
      {/* Rolled end: the cardboard core with fabric wound around it. */}
      <Ellipse cx={end} cy={r} rx={end} ry={r} fill={base} />
      <Ellipse
        cx={end}
        cy={r}
        rx={end * 0.78}
        ry={r * 0.78}
        fill="none"
        stroke={accent}
        strokeOpacity={0.6}
        strokeWidth={1}
      />
      <Ellipse
        cx={end}
        cy={r}
        rx={end * 0.55}
        ry={r * 0.55}
        fill="none"
        stroke="#000000"
        strokeOpacity={0.2}
        strokeWidth={1}
      />
      <Ellipse cx={end} cy={r} rx={end * 0.32} ry={r * 0.32} fill="#E9D9B8" />
      <Ellipse cx={end} cy={r} rx={end * 0.16} ry={r * 0.16} fill="#7A5A2E" />
    </Svg>
  );
}

const PRODUCTS = [
  { price: '₦15,000', base: C.orange, accent: C.forest, pattern: 'zigzag' },
  { price: '₦12,000', base: C.indigo, accent: C.orange, pattern: 'dots' },
  { price: '₦9,500', base: C.clay, accent: C.cream, pattern: 'stripes' },
  { price: '₦22,000', base: C.forest, accent: C.lime, pattern: 'diamond' },
] as const;

/** A phone with a metal frame and glass, showing the vendor's store. */
function Phone() {
  return (
    <View style={styles.phoneBody}>
      <Svg style={StyleSheet.absoluteFill} width={116} height={208}>
        <Defs>
          <LinearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#4A4F4C" />
            <Stop offset="0.5" stopColor="#1C1F1D" />
            <Stop offset="1" stopColor="#3A3F3C" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={116} height={208} rx={23} fill="url(#frame)" />
        <Rect x={2.5} y={2.5} width={111} height={203} rx={21} fill="#0A0B0B" />
      </Svg>
      <View style={[styles.sideButton, { top: 46, height: 16 }]} />
      <View style={[styles.sideButton, { top: 68, height: 24 }]} />
      <View style={[styles.sideButtonRight, { top: 58, height: 30 }]} />

      <View style={styles.screen}>
        <View style={styles.cover}>
          <Svg width={104} height={44}>
            <Defs>
              <LinearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={C.orange} />
                <Stop offset="1" stopColor={C.clay} />
              </LinearGradient>
            </Defs>
            <Rect width={104} height={44} fill="url(#cover)" />
            {[10, 22, 34].map((y) => (
              <Path
                key={y}
                d={`M0 ${y} l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5`}
                stroke={C.cream}
                strokeOpacity={0.35}
                strokeWidth={1.6}
                fill="none"
              />
            ))}
          </Svg>
        </View>
        <View style={styles.island} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AF</Text>
        </View>
        <Text style={styles.storeName}>Adaeze Fabrics</Text>
        <Text style={styles.storeMeta}>Lagos · ★ 4.9</Text>
        <View style={styles.grid}>
          {PRODUCTS.map((product, i) => (
            <View key={product.price} style={styles.product}>
              <FabricSwatch {...product} id={`p${i}`} />
              <Text style={styles.price}>{product.price}</Text>
            </View>
          ))}
        </View>
        <View style={styles.orderButton}>
          <Text style={styles.orderText}>Order on WhatsApp</Text>
        </View>
        {/* Glass glare. */}
        <Svg style={StyleSheet.absoluteFill} width={104} height={196} pointerEvents="none">
          <Defs>
            <LinearGradient id="glare" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={C.white} stopOpacity={0.22} />
              <Stop offset="0.45" stopColor={C.white} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d="M0 0 H70 L0 110 Z" fill="url(#glare)" />
        </Svg>
      </View>
    </View>
  );
}

/** Product photo stand-in: draped fabric with folds. */
function FabricSwatch({
  base,
  accent,
  pattern,
  id,
}: {
  base: string;
  accent: string;
  pattern: 'zigzag' | 'dots' | 'stripes' | 'diamond';
  id: string;
}) {
  return (
    <Svg width={45} height={30}>
      <Defs>
        <LinearGradient id={`${id}-folds`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.25} />
          <Stop offset="0.2" stopColor={C.white} stopOpacity={0.12} />
          <Stop offset="0.4" stopColor="#000000" stopOpacity={0.18} />
          <Stop offset="0.62" stopColor={C.white} stopOpacity={0.14} />
          <Stop offset="0.82" stopColor="#000000" stopOpacity={0.2} />
          <Stop offset="1" stopColor={C.white} stopOpacity={0.08} />
        </LinearGradient>
        <ClipPath id={`${id}-clip`}>
          <Rect width={45} height={30} rx={6} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id}-clip)`}>
        <Rect width={45} height={30} fill={base} />
        {pattern === 'zigzag' &&
          [9, 19, 29].map((y) => (
            <Path
              key={y}
              d={`M0 ${y} l5 -4 l5 4 l5 -4 l5 4 l5 -4 l5 4 l5 -4 l5 4 l5 -4`}
              stroke={accent}
              strokeWidth={1.8}
              fill="none"
            />
          ))}
        {pattern === 'dots' &&
          Array.from({ length: 15 }, (_, i) => (
            <Circle key={i} cx={6 + (i % 5) * 8.5} cy={6 + Math.floor(i / 5) * 11} r={2.2} fill={accent} />
          ))}
        {pattern === 'stripes' &&
          Array.from({ length: 6 }, (_, i) => (
            <Rect key={i} x={0} y={3 + i * 6} width={45} height={2.4} fill={accent} />
          ))}
        {pattern === 'diamond' &&
          Array.from({ length: 6 }, (_, i) => (
            <Path key={i} d={`M${7 + (i % 3) * 15} ${8 + Math.floor(i / 3) * 16} l5 6 l-5 6 l-5 -6 z`} fill={accent} />
          ))}
        <Rect width={45} height={30} fill={`url(#${id}-folds)`} />
      </G>
    </Svg>
  );
}

function InstagramBadge() {
  return (
    <View style={styles.instagramBadge}>
      <Svg style={StyleSheet.absoluteFill} width={46} height={46}>
        <Defs>
          <LinearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor="#F9A23A" />
            <Stop offset="0.5" stopColor="#E1306C" />
            <Stop offset="1" stopColor="#833AB4" />
          </LinearGradient>
        </Defs>
        <Rect width={46} height={46} rx={14} fill="url(#ig)" />
      </Svg>
      {/* Absolutely positioned so it paints above the gradient on every platform. */}
      <View style={styles.instagramIcon}>
        <InstagramIcon size={24} color={C.white} />
      </View>
    </View>
  );
}

/** Gold naira coin with a raised rim. */
function Coin({ size, id }: { size: number; id: string }) {
  const r = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg style={StyleSheet.absoluteFill} width={size} height={size}>
        <Defs>
          <RadialGradient id={`${id}-face`} cx="35%" cy="30%" rx="75%" ry="75%">
            <Stop offset="0" stopColor="#FFE29A" />
            <Stop offset="0.55" stopColor={C.orange} />
            <Stop offset="1" stopColor={C.orangeDeep} />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill="#B8720C" />
        <Circle cx={r} cy={r - 0.6} r={r - 1.6} fill={`url(#${id}-face)`} />
        <Circle cx={r} cy={r - 0.6} r={r - 4.2} fill="none" stroke="#B8720C" strokeOpacity={0.55} strokeWidth={1} />
      </Svg>
      <View style={styles.coinFace}>
        <Text style={[styles.coinText, { fontSize: size * 0.46 }]}>₦</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
    transformOrigin: 'top left',
  },
  layer: {
    position: 'absolute',
  },
  ground: {
    position: 'absolute',
    left: 0,
    top: 268,
  },
  stall: {
    left: 12,
    top: 40,
  },
  awning: {
    left: 16,
    top: 22,
  },
  bolt0: {
    left: 20,
    top: 162,
  },
  bolt1: {
    left: 80,
    top: 162,
  },
  bolt2: {
    left: 50,
    top: 138,
  },
  phone: {
    left: 160,
    top: 84,
  },
  phoneBody: {
    width: 116,
    height: 208,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: -4, height: 10 },
    elevation: 10,
  },
  sideButton: {
    position: 'absolute',
    left: -2,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: '#2A2E2C',
  },
  sideButtonRight: {
    position: 'absolute',
    right: -2,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: '#2A2E2C',
  },
  screen: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 104,
    height: 196,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: C.white,
    alignItems: 'center',
  },
  cover: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  island: {
    position: 'absolute',
    top: 5,
    width: 30,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#050505',
  },
  avatar: {
    marginTop: 30,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: C.white,
    backgroundColor: C.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: C.white,
    fontSize: 8.5,
    fontFamily: Typeface.extrabold,
  },
  storeName: {
    marginTop: 3,
    color: C.ink,
    fontSize: 8.5,
    fontFamily: Typeface.bold,
    letterSpacing: -0.2,
  },
  storeMeta: {
    color: '#7C837F',
    fontSize: 6,
    fontFamily: Typeface.semibold,
  },
  grid: {
    marginTop: 6,
    width: 96,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 4,
  },
  product: {
    width: 45,
  },
  price: {
    marginTop: 1.5,
    color: C.ink,
    fontSize: 6.5,
    fontFamily: Typeface.bold,
  },
  orderButton: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 7,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: C.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    color: C.ink,
    fontSize: 6.5,
    fontFamily: Typeface.bold,
  },
  link: {
    left: 0,
    top: 104,
  },
  linkPill: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  linkText: {
    color: C.forest,
    fontSize: 12.5,
    fontFamily: Typeface.bold,
  },
  whatsapp: {
    left: 262,
    top: 8,
  },
  whatsappBubble: {
    transform: [{ rotate: '8deg' }],
    width: 46,
    height: 46,
    borderRadius: 23,
    borderBottomLeftRadius: 6,
    backgroundColor: C.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  instagram: {
    left: 206,
    top: -10,
  },
  instagramBadge: {
    transform: [{ rotate: '-8deg' }],
    width: 46,
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instagramIcon: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paid: {
    left: 0,
    top: 240,
  },
  paidToast: {
    height: 42,
    paddingLeft: 6,
    paddingRight: 16,
    borderRadius: 21,
    backgroundColor: C.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  paidCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidAmount: {
    color: C.white,
    fontSize: 15,
    fontFamily: Typeface.bold,
    fontVariant: ['tabular-nums'],
  },
  paidLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: Typeface.semibold,
  },
  coin0: {
    left: 128,
    top: 157,
  },
  coin1: {
    left: 142,
    top: 165,
  },
  coinFace: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    color: '#9A5B05',
    fontFamily: Typeface.extrabold,
    marginTop: -1,
  },
});
