// Email Design System - Typography
import { emailColors } from './colors';

export const emailTypography = {
  // Font Family
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // Font Sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: '1.2',
    normal: '1.4',
    relaxed: '1.6',
    loose: '1.8',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },

  // Text Styles
  textStyles: {
    // Headings
    h1: {
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      color: emailColors.text.primary,
      margin: '0 0 12px 0',
    },
    h2: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.02em',
      color: emailColors.primary,
      margin: '0 0 8px 0',
    },
    h3: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.4',
      color: emailColors.primary,
      margin: '0 0 8px 0',
    },
    h4: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.4',
      color: emailColors.primary,
      margin: '0 0 6px 0',
    },

    // Body Text
    body: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.6',
      color: emailColors.text.primary,
      margin: '0 0 16px 0',
    },
    bodySmall: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
      color: emailColors.text.secondary,
      margin: '0 0 12px 0',
    },

    // Special Text
    caption: {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '1.4',
      color: emailColors.text.muted,
      margin: '0',
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.4',
      color: emailColors.text.primary,
      margin: '0 0 4px 0',
    },

    // Interactive Text
    link: {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.4',
      color: emailColors.primary,
      textDecoration: 'none',
    },
    button: {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.2',
      color: emailColors.text.inverse,
      letterSpacing: '0.02em',
    },
  }
};

// Utility functions for consistent typography
export const createTextStyle = (variant: keyof typeof emailTypography.textStyles) => ({
  ...emailTypography.textStyles[variant],
  fontFamily: emailTypography.fontFamily,
});

export const createHeadingStyle = (level: 1 | 2 | 3 | 4) => ({
  ...emailTypography.textStyles[`h${level}`],
  fontFamily: emailTypography.fontFamily,
});