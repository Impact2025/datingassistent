// Email Design System - Colors & Theming
// "Warm Vertrouwen" Design System
export const emailColors = {
  // Primary Brand Colors - Warm Coral
  primary: '#FF7B54',           // Warm Coral - Primary CTA
  primaryDark: '#E66A43',       // Hover state
  primaryLight: '#FF9676',      // Light variant

  // Secondary Brand Colors - Deep Purple
  secondary: '#722F37',         // Deep Purple - Headers, Logo text
  secondaryLight: '#8B4249',
  secondaryDark: '#5C262D',

  // Accent Colors
  royalPurple: '#6B4D8A',       // VIP elements
  roseGold: '#B76E79',          // Luxury accents
  dustyRose: '#E3867D',         // Secondary accent

  // Semantic Colors
  success: '#A8B5A0',           // Sage Green - Softer, trustworthy
  communication: '#3b82f6',     // Blauw - Communication/Info
  warning: '#f59e0b',           // Oranje - Warnings
  error: '#ef4444',             // Rood - Errors

  // Text Colors
  text: {
    primary: '#2D3142',        // Charcoal (not pure black)
    secondary: '#6b7280',      // Secondary text
    muted: '#9ca3af',          // Muted text
    inverse: '#ffffff',        // White text on colored backgrounds
  },

  // Background Colors - Warm tinted
  background: {
    primary: '#ffffff',        // Main background
    secondary: '#FFF8F3',      // Cream - Page background
    accent: '#F5E6E8',         // Soft Blush - Card backgrounds
    card: '#ffffff',           // Card backgrounds
  },

  // Border Colors - Warm tinted
  border: {
    light: '#F5E6E8',          // Soft Blush
    medium: '#E8D5D8',         // Warm border
    dark: '#D4C0C3',           // Dark warm border
  },

  // Shadow Colors - Warm tinted
  shadow: {
    light: 'rgba(114, 47, 55, 0.05)',
    medium: 'rgba(114, 47, 55, 0.08)',
    heavy: 'rgba(114, 47, 55, 0.12)',
    coral: 'rgba(255, 123, 84, 0.25)',
  },

  // Gradient
  gradient: {
    primary: 'linear-gradient(135deg, #FF7B54 0%, #722F37 100%)',
    soft: 'linear-gradient(135deg, #FFF8F3 0%, #F5E6E8 100%)',
    rose: 'linear-gradient(135deg, #E3867D 0%, #B76E79 100%)',
  }
};

// Color combinations for different email types - "Warm Vertrouwen" themed
export const emailThemes = {
  welcome: {
    primary: emailColors.primary,
    accent: emailColors.secondary,
    background: emailColors.background.secondary, // Cream
    gradient: emailColors.gradient.primary,
  },
  achievement: {
    primary: emailColors.success, // Sage Green
    accent: emailColors.primary,
    background: '#F5F8F4', // Light sage
    gradient: emailColors.gradient.soft,
  },
  notification: {
    primary: emailColors.communication,
    accent: emailColors.primary,
    background: '#eff6ff', // Light blue
    gradient: emailColors.gradient.soft,
  },
  marketing: {
    primary: emailColors.primary,
    accent: emailColors.secondary,
    background: emailColors.background.accent, // Soft Blush
    gradient: emailColors.gradient.primary,
  },
  transactional: {
    primary: emailColors.text.primary, // Charcoal
    accent: emailColors.primary,
    background: emailColors.background.primary, // White
    gradient: emailColors.gradient.soft,
  },
  vip: {
    primary: emailColors.royalPurple,
    accent: emailColors.roseGold,
    background: '#F8F5FA', // Light purple
    gradient: emailColors.gradient.rose,
  }
};