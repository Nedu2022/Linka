import { StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

import { Van, VAN_WIDTH } from '@/components/brand/van';

type Props = {
  x: SharedValue<number>;
  tone: 'light' | 'brand';
  exhaustColor: string;
};

const PUFFS = [0, 1, 2];
const LEAN_STIFFNESS = 170;
const LEAN_DAMPING = 11;

export function MovingVan({ x, tone, exhaustColor }: Props) {
  const lastX = useSharedValue<number | null>(null);
  const speed = useSharedValue(0);
  const odometer = useSharedValue(0);
  const lean = useSharedValue(0);
  const leanVelocity = useSharedValue(0);
  const facing = useSharedValue(1);

  useFrameCallback((frame) => {
    const current = x.get();
    const previous = lastX.get();
    lastX.set(current);
    if (previous === null) return;

    const dt = Math.min((frame.timeSincePreviousFrame ?? 16) / 1000, 0.05);
    const delta = current - previous;
    const perFrame = delta * (0.016 / Math.max(dt, 0.001));

    const acceleration = Math.abs(perFrame) - speed.get();
    speed.set(speed.get() * 0.82 + Math.abs(perFrame) * 0.18);
    odometer.set(odometer.get() + Math.abs(delta));

    if (perFrame > 0.35) facing.set(Math.min(1, facing.get() + dt * 9));
    if (perFrame < -0.35) facing.set(Math.max(-1, facing.get() - dt * 9));

    const target = Math.max(-7, Math.min(7, -acceleration * 7));
    const accel = LEAN_STIFFNESS * (target - lean.get()) - LEAN_DAMPING * leanVelocity.get();
    leanVelocity.set(leanVelocity.get() + accel * dt);
    lean.set(lean.get() + leanVelocity.get() * dt);
  });

  const facingStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: facing.get() >= 0 ? Math.max(facing.get(), 0.001) : Math.min(facing.get(), -0.001) }],
  }));

  const bodyStyle = useAnimatedStyle(() => {
    const motion = Math.min(speed.get() / 1.5, 1);
    const bump = Math.sin(odometer.get() / 4.2) * 0.9 * motion + Math.sin(odometer.get() / 1.7) * 0.35 * motion;
    return { transform: [{ translateY: bump }, { rotate: `${lean.get()}deg` }] };
  });

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(x.get() / (Math.PI * 10)) * 360}deg` }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 - Math.abs(lean.get()) * 0.012 }],
  }));

  return (
    <Animated.View style={[styles.wrap, facingStyle]}>
      {PUFFS.map((i) => (
        <Puff key={i} index={i} odometer={odometer} speed={speed} color={exhaustColor} />
      ))}
      <Animated.View style={[styles.shadow, shadowStyle]} />
      <View>
        <Van tone={tone} bodyStyle={[styles.bodyPivot, bodyStyle]} wheelStyle={wheelStyle} />
      </View>
    </Animated.View>
  );
}

type PuffProps = {
  index: number;
  odometer: SharedValue<number>;
  speed: SharedValue<number>;
  color: string;
};

function Puff({ index, odometer, speed, color }: PuffProps) {
  const style = useAnimatedStyle(() => {
    const phase = (odometer.get() / 22 + index / PUFFS.length) % 1;
    const motion = Math.min(speed.get() / 1.2, 1);
    return {
      opacity: (1 - phase) * 0.75 * motion,
      transform: [
        { translateX: -phase * 18 },
        { translateY: -phase * 7 },
        { scale: 0.45 + phase * 0.9 },
      ],
    };
  });

  return <Animated.View style={[styles.puff, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  wrap: {
    width: VAN_WIDTH,
    height: 30,
  },
  bodyPivot: {
    transformOrigin: '50% 100%',
  },
  shadow: {
    position: 'absolute',
    left: 5,
    right: 5,
    bottom: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.13)',
  },
  puff: {
    position: 'absolute',
    left: -3,
    bottom: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
