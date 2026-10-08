import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = { size?: number; color: string };

const line = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export function ArrowRightIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth={2.2} {...line} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2.4} {...line} />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2.4} {...line} />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={3} {...line} />
    </Svg>
  );
}

export function ShieldIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3l7 3v5c0 4.5-3 8.3-7 9.5C8 19.3 5 15.5 5 11V6l7-3z" stroke={color} strokeWidth={2} {...line} />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} {...line} />
    </Svg>
  );
}

export function BoltIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" stroke={color} strokeWidth={2} {...line} />
    </Svg>
  );
}

export function PhoneIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"
        stroke={color}
        strokeWidth={2}
        {...line}
      />
    </Svg>
  );
}

export function ShopIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4.5 10.5V19a1 1 0 001 1h13a1 1 0 001-1v-8.5" stroke={color} strokeWidth={1.9} {...line} />
      <Path
        d="M3 6.5L4.8 3.5h14.4L21 6.5v1a2.75 2.75 0 01-5.5 0 2.75 2.75 0 01-5.5 0 2.75 2.75 0 01-5.5 0v-1z"
        stroke={color}
        strokeWidth={1.9}
        {...line}
      />
      <Path d="M10 20v-5h4v5" stroke={color} strokeWidth={1.9} {...line} />
    </Svg>
  );
}

export function LinkIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1" stroke={color} strokeWidth={2} {...line} />
      <Path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1" stroke={color} strokeWidth={2} {...line} />
    </Svg>
  );
}

export function NairaIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.5 19V5l9 14V5" stroke={color} strokeWidth={2.2} {...line} />
      <Path d="M4.5 10h15M4.5 14h15" stroke={color} strokeWidth={1.8} {...line} />
    </Svg>
  );
}

export function InfoIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} fill="none" />
      <Path d="M12 11v5M12 8h.01" stroke={color} strokeWidth={2.2} {...line} />
    </Svg>
  );
}

export function CameraIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 8.5A1.5 1.5 0 015.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0120 8.5V18a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18V8.5z"
        stroke={color}
        strokeWidth={1.9}
        {...line}
      />
      <Circle cx={12} cy={13} r={3.5} stroke={color} strokeWidth={1.9} fill="none" />
    </Svg>
  );
}

export function PencilIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke={color} strokeWidth={2.2} {...line} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2.4} {...line} />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.2} {...line} />
    </Svg>
  );
}

export function ShareIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 15V4M8 8l4-4 4 4" stroke={color} strokeWidth={2} {...line} />
      <Path
        d="M8 11H6.5A1.5 1.5 0 005 12.5v6A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 00-1.5-1.5H16"
        stroke={color}
        strokeWidth={2}
        {...line}
      />
    </Svg>
  );
}

export function LockIcon({ size = 12, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.5 11h11a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1v-7a1 1 0 011-1z"
        stroke={color}
        strokeWidth={2.2}
        {...line}
      />
      <Path d="M8.5 11V8a3.5 3.5 0 017 0v3" stroke={color} strokeWidth={2.2} {...line} />
    </Svg>
  );
}

export function BagIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 8h14l-1 12H6L5 8z" stroke={color} strokeWidth={1.9} {...line} />
      <Path d="M9 10V7a3 3 0 016 0v3" stroke={color} strokeWidth={1.9} {...line} />
    </Svg>
  );
}

export function WhatsAppIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20l1.2-4.1A8 8 0 1112 20a8 8 0 01-3.9-1L4 20z" stroke={color} strokeWidth={1.9} {...line} />
      <Path d="M9.2 8.8c0 3.2 2.8 6 6 6l1-1.4-2-1-1 .8a4 4 0 01-2.4-2.4l.8-1-1-2-1.4 1z" fill={color} />
    </Svg>
  );
}

export function HomeIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4.5v-5.5h-5V20H5a1 1 0 01-1-1v-8.5z"
        stroke={color}
        strokeWidth={2}
        {...line}
      />
    </Svg>
  );
}

export function GridIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z"
        stroke={color}
        strokeWidth={1.9}
        {...line}
      />
    </Svg>
  );
}

export function UserIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.5} r={3.8} stroke={color} strokeWidth={1.9} fill="none" />
      <Path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" stroke={color} strokeWidth={1.9} {...line} />
    </Svg>
  );
}

export function BellIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15l1.5-2z" stroke={color} strokeWidth={1.9} {...line} />
      <Path d="M10 20.5a2 2 0 004 0" stroke={color} strokeWidth={1.9} {...line} />
    </Svg>
  );
}

export function EyeIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
        stroke={color}
        strokeWidth={1.9}
        {...line}
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.9} fill="none" />
    </Svg>
  );
}

export function ArrowUpRightIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 17L17 7M9 7h8v8" stroke={color} strokeWidth={2.2} {...line} />
    </Svg>
  );
}

export function SparklesIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3l1.4 4.2L18 8.6l-4.2 1.4L12 14l-1.4-4-4.2-1.4 4.2-1.4L12 3z"
        stroke={color}
        strokeWidth={1.8}
        {...line}
      />
      <Path
        d="M18.5 14l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"
        stroke={color}
        strokeWidth={1.6}
        {...line}
      />
      <Path
        d="M5.5 14.5l.55 1.65 1.65.55-1.65.55L5.5 19l-.55-1.75L3.3 16.7l1.65-.55.55-1.65z"
        stroke={color}
        strokeWidth={1.6}
        {...line}
      />
    </Svg>
  );
}

export function TrashIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" stroke={color} strokeWidth={1.9} {...line} />
    </Svg>
  );
}

export function ImageIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 6.5A1.5 1.5 0 015.5 5h13A1.5 1.5 0 0120 6.5v11a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17.5v-11z"
        stroke={color}
        strokeWidth={1.9}
        {...line}
      />
      <Circle cx={9} cy={10} r={1.6} stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M4.5 16.5l4.5-4 3 2.5 3.5-3.5 4 5" stroke={color} strokeWidth={1.9} {...line} />
    </Svg>
  );
}

export function CopyIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 9h10v11H9z" stroke={color} strokeWidth={1.9} {...line} />
      <Path d="M15 9V4H5v11h4" stroke={color} strokeWidth={1.9} {...line} />
    </Svg>
  );
}

export function InstagramIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 3h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5z"
        stroke={color}
        strokeWidth={1.9}
        {...line}
      />
      <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.9} fill="none" />
      <Circle cx={17.3} cy={6.7} r={1.2} fill={color} />
    </Svg>
  );
}

export function MoreIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5} cy={12} r={1.9} fill={color} />
      <Circle cx={12} cy={12} r={1.9} fill={color} />
      <Circle cx={19} cy={12} r={1.9} fill={color} />
    </Svg>
  );
}

export function SearchIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={2} fill="none" />
      <Path d="M16 16l4.5 4.5" stroke={color} strokeWidth={2} {...line} />
    </Svg>
  );
}

export function BankIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 9.5L12 4l9 5.5M4 20h16M6 10.5V17M10 10.5V17M14 10.5V17M18 10.5V17"
        stroke={color}
        strokeWidth={1.9}
        {...line}
      />
    </Svg>
  );
}
