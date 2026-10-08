import Svg, { Circle, Ellipse, Path, Text } from 'react-native-svg';

import { Brand } from '@/constants/theme';

type Props = { width: number; height: number };

export function PaymentsIllustration({ width, height }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 350 300">
      <Ellipse cx={175} cy={272} rx={100} ry={12} fill="#E6F4EF" />
      <Circle cx={175} cy={140} r={96} fill={Brand.greenTint} />

      <Circle
        cx={175}
        cy={140}
        r={62}
        stroke={Brand.green}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray="300 89.56"
        rotation={81.5}
        origin="175, 140"
        fill="none"
      />
      <Text
        x={175}
        y={163}
        fontSize={64}
        fontWeight="800"
        fill={Brand.green}
        textAnchor="middle">
        ₦
      </Text>

      <Circle cx={225} cy={184} r={27} fill={Brand.orange} />
      <Path
        d="M212 184 L221 193 L238 175"
        stroke={Brand.white}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <Path
        d="M118 58 L121.5 67.1 L131.3 67.7 L123.7 73.9 L126.2 83.3 L118 78 L109.8 83.3 L112.3 73.9 L104.7 67.7 L114.5 67.1 Z"
        fill={Brand.orange}
      />
      <Path d="M95 102 V118 M87 110 H103" stroke={Brand.orange} strokeWidth={4} strokeLinecap="round" />
      <Path d="M256 69 L268 81 M268 69 L256 81" stroke={Brand.orange} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={282} cy={128} r={5} fill={Brand.orange} />
      <Circle cx={105} cy={172} r={7} fill="#9FC3B2" />
    </Svg>
  );
}
