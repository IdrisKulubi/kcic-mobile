import { useColorScheme } from 'react-native';

import { palette } from '@/components/kcic/ui';

export const authThemes = {
  light: {
    gradient: ['#E3F3EA', '#F4F8FF', '#FEFFFC'] as const,
    surface: '#FFFFFF',
    surfaceMuted: '#F9FAFB',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#E5E7EB',
    divider: '#E5E7EB',
    placeholder: '#9AA3AF',
    accent: palette.green,
    accentDisabled: '#C5D4C8',
    link: palette.forest,
    checkbox: palette.forest,
    checkboxUnchecked: '#9AA3AF',
    primaryText: '#FFFFFF',
    appleIcon: '#3F4042',
    codeActive: palette.blue,
    shell: '#F5F5F6',
  },
  dark: {
    gradient: ['#151617', '#1A2218', '#151617'] as const,
    surface: '#202123',
    surfaceMuted: '#292A2C',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    divider: '#38393B',
    placeholder: '#8B8D90',
    accent: palette.green,
    accentDisabled: '#4A5F38',
    link: palette.green,
    checkbox: palette.green,
    checkboxUnchecked: '#8B8D90',
    primaryText: '#FFFFFF',
    appleIcon: '#F4F4F5',
    codeActive: palette.blue,
    shell: '#151617',
  },
} as const;

export type AuthTheme = (typeof authThemes)['light'];

export function useAuthTheme() {
  const isDark = useColorScheme() === 'dark';
  return isDark ? authThemes.dark : authThemes.light;
}
