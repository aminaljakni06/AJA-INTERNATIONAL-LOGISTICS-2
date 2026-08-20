// Central Theme Configuration for AJA International Logistics — STEP 01 Foundation
import { tokens } from '../design-system/tokens';

export const lightScales = {
  primary: tokens.colors.primary,
  secondary: tokens.colors.secondary,
  accent: tokens.colors.accent,
  neutral: tokens.colors.neutral,
};

export const darkScales = {
  primary: tokens.colors.primary,
  secondary: tokens.colors.secondary,
  accent: tokens.colors.accent,
  neutral: {
    bg: tokens.colors.neutral.darkBg,
    surface: tokens.colors.neutral.darkSurface,
    surfaceAlt: '#1B3A5A',
    border: '#1E3A58',
    textPrimary: '#F7F9FC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    darkBg: tokens.colors.neutral.darkBg,
    darkSurface: tokens.colors.neutral.darkSurface,
  },
};

export const scales = lightScales;

export function getThemeTokens(isDark: boolean) {
  const currentScales = isDark ? darkScales : lightScales;
  return {
    scales: currentScales,
    colors: {
      brand: {
        primary: tokens.colors.primary.DEFAULT,
        primaryHover: tokens.colors.primary.hover,
        secondary: tokens.colors.secondary.DEFAULT,
        accent: tokens.colors.accent.DEFAULT,
        white: '#FFFFFF',
        lightBg: tokens.colors.neutral.bg,
      },
      surface: {
        primary: currentScales.neutral.surface,
        secondary: currentScales.neutral.bg,
        alt: currentScales.neutral.surfaceAlt,
        dark: tokens.colors.neutral.darkBg,
        darkElevated: tokens.colors.neutral.darkSurface,
      },
      text: {
        primary: currentScales.neutral.textPrimary,
        secondary: currentScales.neutral.textSecondary,
        muted: currentScales.neutral.textMuted,
        onDark: '#FFFFFF',
        link: tokens.colors.primary.DEFAULT,
        accent: tokens.colors.accent.DEFAULT,
      },
      action: {
        primary: tokens.colors.primary.DEFAULT,
        accent: tokens.colors.accent.DEFAULT,
      },
      border: {
        default: currentScales.neutral.border,
      },
    },
    radii: tokens.radii,
    shadows: tokens.shadows,
    typography: tokens.typography,
  };
}

export const theme = getThemeTokens(false);
