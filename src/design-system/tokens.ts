/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Design System Foundation v1.0
 * Master Design Tokens Specification (STEP 01)
 * Inspired by DHL Enterprise, Maersk Platform, FedEx, Stripe, Linear & IBM Carbon.
 */

export const tokens = {
  // 1. Enterprise Color Palette Tokens
  colors: {
    // Primary Gentian Blue
    primary: {
      DEFAULT: '#0B5FFF',
      hover: '#0847C7',
      light: '#EAF2FF',
      50: '#EAF2FF',
      100: '#D6E4FF',
      200: '#ADC8FF',
      300: '#84ACFF',
      400: '#5B90FF',
      500: '#0B5FFF', // Gentian Blue Base
      600: '#0847C7', // Hover
      700: '#063697',
      800: '#042467',
      900: '#021338',
    },

    // Secondary Deep Navy
    secondary: {
      DEFAULT: '#102A43',
      900: '#07131F',
      800: '#102A43',
      700: '#1B3A5A',
      600: '#274B72',
      500: '#345D8A',
      300: '#6287B3',
      100: '#E2EAF4',
    },

    // Accent Emerald
    accent: {
      DEFAULT: '#14B86A',
      hover: '#0F9655',
      light: '#E6F8EF',
      700: '#0F9655',
      500: '#14B86A',
      300: '#6EE7B7',
      100: '#E6F8EF',
    },

    // Semantic Status Tokens
    semantic: {
      warning: {
        DEFAULT: '#F59E0B',
        bg: '#FEF3C7',
        border: '#FDE68A',
        text: '#B45309',
      },
      danger: {
        DEFAULT: '#DC2626',
        bg: '#FEE2E2',
        border: '#FCA5A5',
        text: '#B91C1C',
      },
      info: {
        DEFAULT: '#0EA5E9',
        bg: '#E0F2FE',
        border: '#BAE6FD',
        text: '#0369A1',
      },
      success: {
        DEFAULT: '#14B86A',
        bg: '#E6F8EF',
        border: '#A7F3D0',
        text: '#047857',
      },
    },

    // Neutral Scale (Light & Dark)
    neutral: {
      bg: '#F7F9FC',          // Background
      surface: '#FFFFFF',     // Surface
      surfaceAlt: '#F9FBFD',  // Surface Alt
      border: '#E6ECF2',      // Border
      textPrimary: '#0F172A', // Text Primary
      textSecondary: '#475569',// Text Secondary
      textMuted: '#94A3B8',   // Text Muted
      darkBg: '#07131F',      // Dark Background
      darkSurface: '#102A43', // Dark Surface
    },
  },

  // 2. Typography Tokens
  typography: {
    fonts: {
      english: "'Inter', system-ui, -apple-system, sans-serif",
      arabic: "'IBM Plex Sans Arabic', 'Tajawal', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    scale: {
      hero: '3.5rem',     // 56px
      h1: '2.75rem',      // 44px
      h2: '2.25rem',      // 36px
      h3: '1.875rem',     // 30px
      h4: '1.5rem',       // 24px
      body: '1.0625rem',   // 17px
      small: '0.9375rem',  // 15px
      caption: '0.8125rem',// 13px
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: '160%',   // 1.6
  },

  // 3. Border Radius Tokens (Strict Scale)
  radii: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '22px',
    '2xl': '28px',
    full: '9999px',
  },

  // 4. Shadow System Tokens (Soft Enterprise Elevation)
  shadows: {
    level1: '0 1px 3px 0 rgba(16, 42, 67, 0.05), 0 1px 2px -1px rgba(16, 42, 67, 0.05)',
    level2: '0 4px 12px -2px rgba(16, 42, 67, 0.08), 0 2px 4px -2px rgba(16, 42, 67, 0.04)',
    level3: '0 12px 24px -4px rgba(16, 42, 67, 0.12), 0 4px 8px -2px rgba(16, 42, 67, 0.06)',
    level4: '0 24px 48px -12px rgba(16, 42, 67, 0.25), 0 8px 16px -4px rgba(16, 42, 67, 0.1)',
  },

  // 5. Spacing System (8-Point Scale)
  spacing: {
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    64: '64px',
    80: '80px',
    96: '96px',
    128: '128px',
  },

  // 6. Responsive Containers
  containers: {
    desktop: '1440px',
    content: '1280px',
    tablet: '960px',
    mobile: '100%',
  },

  // 7. Micro-Interactions & Motion
  motion: {
    duration: '250ms',
    ease: 'cubic-bezier(0, 0, 0.2, 1)', // ease-out
  },
};
