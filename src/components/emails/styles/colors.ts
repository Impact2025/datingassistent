// Email Design System - Colors & Theming
export const emailColors = {
  // Primary Brand Colors
  primary: '#FF7B54',           // Roze/Magenta - Primary CTA
  secondary: '#8B5CF6',         // Paars - Secondary elements

  // Semantic Colors
  success: '#10b981',           // Groen - Success/Positive
  communication: '#3b82f6',     // Blauw - Communication/Info
  time: '#8b5cf6',              // Paars variant - Time/Availability
  warning: '#f59e0b',           // Oranje - Warnings
  error: '#ef4444',             // Rood - Errors

  // Text Colors
  text: {
    primary: '#1a1a1a',        // Primary text
    secondary: '#6b7280',      // Secondary text
    muted: '#9ca3af',          // Muted text
    inverse: '#ffffff',        // White text on colored backgrounds
  },

  // Background Colors
  background: {
    primary: '#ffffff',        // Main background
    secondary: '#fafafa',      // Secondary background
    accent: '#fef7ff',         // Light purple accent
    card: '#ffffff',           // Card backgrounds
  },

  // Border Colors
  border: {
    light: '#f3f4f6',          // Light borders
    medium: '#e5e7eb',         // Medium borders
    dark: '#d1d5db',           // Dark borders
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    heavy: 'rgba(0, 0, 0, 0.12)',
  }
};

// Color combinations for different email types
export const emailThemes = {
  welcome: {
    primary: emailColors.primary,
    accent: emailColors.secondary,
    background: emailColors.background.accent,
  },
  achievement: {
    primary: emailColors.success,
    accent: emailColors.primary,
    background: '#f0fdf4', // Light green
  },
  notification: {
    primary: emailColors.communication,
    accent: emailColors.primary,
    background: '#eff6ff', // Light blue
  },
  marketing: {
    primary: emailColors.primary,
    accent: emailColors.secondary,
    background: emailColors.background.accent,
  },
  transactional: {
    primary: emailColors.text.primary,
    accent: emailColors.primary,
    background: emailColors.background.primary,
  }
};