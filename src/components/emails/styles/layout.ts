// Email Design System - Layout & Spacing
import { emailColors } from './colors';

export const emailLayout = {
  // Container
  container: {
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',
    backgroundColor: emailColors.background.primary,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: `0 4px 12px ${emailColors.shadow.medium}`,
    border: `1px solid ${emailColors.border.light}`,
  },

  // Main Layout
  main: {
    backgroundColor: '#f8f9fa',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0',
    padding: '20px 0',
    lineHeight: '1.6',
  },

  // Sections
  headerSection: {
    backgroundColor: emailColors.background.primary,
    padding: '24px 32px',
    borderBottom: `1px solid ${emailColors.border.light}`,
  },

  contentSection: {
    padding: '32px',
  },

  footerSection: {
    backgroundColor: emailColors.background.secondary,
    padding: '24px 32px',
    textAlign: 'center' as const,
    borderTop: `1px solid ${emailColors.border.light}`,
  },

  // Spacing Scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Border Radius Scale
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '50%',
  },

  // Shadows
  boxShadow: {
    none: 'none',
    sm: `0 1px 2px ${emailColors.shadow.light}`,
    md: `0 2px 8px ${emailColors.shadow.medium}`,
    lg: `0 4px 12px ${emailColors.shadow.medium}`,
    xl: `0 8px 24px ${emailColors.shadow.heavy}`,
  },

  // Cards
  card: {
    backgroundColor: emailColors.background.primary,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: `1px solid ${emailColors.border.light}`,
    boxShadow: `0 2px 8px ${emailColors.shadow.light}`,
  },

  cardCompact: {
    backgroundColor: emailColors.background.primary,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: `1px solid ${emailColors.border.light}`,
    boxShadow: `0 1px 4px ${emailColors.shadow.light}`,
  },

  // Grid Layouts
  grid: {
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    threeColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px',
    },
    responsive: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    },
  },

  // Flex Layouts
  flex: {
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    between: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    start: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    column: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
  },

  // Common Layout Patterns
  sectionSpacing: {
    marginBottom: '32px',
  },

  cardSpacing: {
    marginBottom: '24px',
  },

  elementSpacing: {
    marginBottom: '16px',
  },
};

// Utility functions for consistent layouts
export const createCardStyle = (variant: 'default' | 'compact' = 'default') => ({
  ...emailLayout[variant === 'compact' ? 'cardCompact' : 'card'],
});

export const createGridStyle = (columns: 2 | 3 | 'responsive' = 2) => ({
  ...emailLayout.grid[
    columns === 2 ? 'twoColumn' :
    columns === 3 ? 'threeColumn' :
    'responsive'
  ],
});

export const createFlexStyle = (align: 'center' | 'between' | 'start' | 'column' = 'center') => ({
  ...emailLayout.flex[align],
});