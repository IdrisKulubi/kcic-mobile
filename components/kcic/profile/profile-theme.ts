import { palette } from '@/components/kcic/ui';

export const profileThemes = {
  light: {
    background: '#F5F5F6',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEFF0',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    accentSoft: '#EDF8FC',
    accentGreen: palette.green,
    danger: '#D64545',
    heroRing: '#E8F5D8',
    chipBg: '#F0F1F2',
  },
  dark: {
    background: '#151617',
    surface: '#202123',
    surfaceAlt: '#292A2C',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    accentSoft: '#1E2A33',
    accentGreen: palette.green,
    danger: '#F87171',
    heroRing: '#2A3D1E',
    chipBg: '#2C2D2F',
  },
} as const;

export type ProfileTheme = (typeof profileThemes)['light'];
