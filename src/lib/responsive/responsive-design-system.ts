/**
 * Mobile-First Responsive Design System for DatingAssistent
 * Implements progressive enhancement with mobile-first approach
 */

import { useState, useEffect } from 'react';

// Breakpoint definitions (mobile-first)
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices (phones, < 576px)
  sm: 576,    // Small devices (phones, ≥ 576px)
  md: 768,    // Medium devices (tablets, ≥ 768px)
  lg: 992,    // Large devices (desktops, ≥ 992px)
  xl: 1200,   // Extra large devices (large desktops, ≥ 1200px)
  xxl: 1400,  // Extra extra large devices (larger desktops, ≥ 1400px)
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Responsive utilities
export class ResponsiveUtils {
  /**
   * Get current viewport size
   */
  static getViewportSize(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Check if current viewport is at least a certain breakpoint
   */
  static isAtLeast(breakpoint: Breakpoint): boolean {
    const { width } = this.getViewportSize();
    return width >= BREAKPOINTS[breakpoint];
  }

  /**
   * Check if current viewport is within a breakpoint range
   */
  static isBetween(min: Breakpoint, max: Breakpoint): boolean {
    const { width } = this.getViewportSize();
    return width >= BREAKPOINTS[min] && width < BREAKPOINTS[max];
  }

  /**
   * Get current breakpoint
   */
  static getCurrentBreakpoint(): Breakpoint {
    const { width } = this.getViewportSize();

    if (width >= BREAKPOINTS.xxl) return 'xxl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }

  /**
   * Check if device is touch-enabled
   */
  static isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Check if device prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get safe area insets for devices with notches
   */
  static getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    if (typeof window === 'undefined') {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
  }
}

// Responsive hook for React components
export function useResponsive() {
  const [viewport, setViewport] = useState(ResponsiveUtils.getViewportSize());
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(ResponsiveUtils.getCurrentBreakpoint());

  useEffect(() => {
    const handleResize = () => {
      const newViewport = ResponsiveUtils.getViewportSize();
      const newBreakpoint = ResponsiveUtils.getCurrentBreakpoint();

      setViewport(newViewport);
      setBreakpoint(newBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    viewport,
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl',
    isAtLeast: (bp: Breakpoint) => ResponsiveUtils.isAtLeast(bp),
    isBetween: (min: Breakpoint, max: Breakpoint) => ResponsiveUtils.isBetween(min, max),
    isTouchDevice: ResponsiveUtils.isTouchDevice(),
    prefersReducedMotion: ResponsiveUtils.prefersReducedMotion(),
    safeAreaInsets: ResponsiveUtils.getSafeAreaInsets(),
  };
}

// Responsive container component props
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  centerContent?: boolean;
}

// Spacing scale (mobile-first)
export const SPACING = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
} as const;

// Typography scale (mobile-first)
export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: { base: '2rem', md: '2.5rem', lg: '3rem' },      // 32px -> 48px
    lineHeight: { base: '2.5rem', md: '3rem', lg: '3.5rem' },  // 40px -> 56px
    fontWeight: '700',
  },
  h2: {
    fontSize: { base: '1.75rem', md: '2rem', lg: '2.25rem' },   // 28px -> 36px
    lineHeight: { base: '2.25rem', md: '2.5rem', lg: '2.75rem' }, // 36px -> 44px
    fontWeight: '600',
  },
  h3: {
    fontSize: { base: '1.5rem', md: '1.75rem', lg: '2rem' },     // 24px -> 32px
    lineHeight: { base: '2rem', md: '2.25rem', lg: '2.5rem' },   // 32px -> 40px
    fontWeight: '600',
  },
  h4: {
    fontSize: { base: '1.25rem', md: '1.5rem' },                  // 20px -> 24px
    lineHeight: { base: '1.75rem', md: '2rem' },                  // 28px -> 32px
    fontWeight: '600',
  },

  // Body text
  body: {
    fontSize: { base: '1rem', md: '1.125rem' },                   // 16px -> 18px
    lineHeight: { base: '1.5rem', md: '1.75rem' },                 // 24px -> 28px
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: { base: '0.875rem', md: '1rem' },                    // 14px -> 16px
    lineHeight: { base: '1.25rem', md: '1.5rem' },                  // 20px -> 24px
    fontWeight: '400',
  },

  // UI elements
  caption: {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',     // 16px
    fontWeight: '400',
  },
  button: {
    fontSize: { base: '0.875rem', md: '1rem' },                     // 14px -> 16px
    lineHeight: { base: '1.25rem', md: '1.5rem' },                   // 20px -> 24px
    fontWeight: '500',
  },
} as const;

// Touch-friendly sizing
export const TOUCH_TARGETS = {
  minimum: '44px',      // iOS Human Interface Guidelines minimum
  comfortable: '48px',  // Comfortable touch target
  spacious: '56px',     // Spacious touch target for primary actions
} as const;

// Animation durations (respecting reduced motion preferences)
export const ANIMATIONS = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms',
} as const;

// Z-index scale
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

// Responsive grid system
export const GRID = {
  columns: 12,
  gutter: { base: '1rem', md: '1.5rem', lg: '2rem' },
  container: {
    maxWidth: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    padding: { base: '1rem', md: '1.5rem', lg: '2rem' },
  },
} as const;

// Utility functions for responsive values
export function responsiveValue<T>(
  values: Partial<Record<Breakpoint, T>> & { base: T }
): T {
  const currentBreakpoint = ResponsiveUtils.getCurrentBreakpoint();

  // Check breakpoints in descending order
  const breakpoints: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpoints.indexOf(currentBreakpoint);

  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return values.base;
}

// CSS custom properties for responsive design
export const CSS_CUSTOM_PROPERTIES = `
  :root {
    /* Spacing */
    --spacing-0: ${SPACING[0]};
    --spacing-1: ${SPACING[1]};
    --spacing-2: ${SPACING[2]};
    --spacing-3: ${SPACING[3]};
    --spacing-4: ${SPACING[4]};
    --spacing-5: ${SPACING[5]};
    --spacing-6: ${SPACING[6]};
    --spacing-8: ${SPACING[8]};
    --spacing-10: ${SPACING[10]};
    --spacing-12: ${SPACING[12]};
    --spacing-16: ${SPACING[16]};
    --spacing-20: ${SPACING[20]};
    --spacing-24: ${SPACING[24]};
    --spacing-32: ${SPACING[32]};

    /* Touch targets */
    --touch-minimum: ${TOUCH_TARGETS.minimum};
    --touch-comfortable: ${TOUCH_TARGETS.comfortable};
    --touch-spacious: ${TOUCH_TARGETS.spacious};

    /* Animations */
    --animation-fast: ${ANIMATIONS.fast};
    --animation-normal: ${ANIMATIONS.normal};
    --animation-slow: ${ANIMATIONS.slow};
    --animation-slower: ${ANIMATIONS.slower};

    /* Z-index */
    --z-base: ${Z_INDEX.base};
    --z-dropdown: ${Z_INDEX.dropdown};
    --z-sticky: ${Z_INDEX.sticky};
    --z-fixed: ${Z_INDEX.fixed};
    --z-modal: ${Z_INDEX.modal};
    --z-popover: ${Z_INDEX.popover};
    --z-tooltip: ${Z_INDEX.tooltip};
    --z-toast: ${Z_INDEX.toast};

    /* Grid */
    --grid-columns: ${GRID.columns};
    --grid-gutter-base: ${GRID.gutter.base};
    --grid-gutter-md: ${GRID.gutter.md};
    --grid-gutter-lg: ${GRID.gutter.lg};
    --grid-container-padding-base: ${GRID.container.padding.base};
    --grid-container-padding-md: ${GRID.container.padding.md};
    --grid-container-padding-lg: ${GRID.container.padding.lg};
  }

  /* Responsive breakpoints */
  @media (min-width: ${BREAKPOINTS.sm}px) {
    :root {
      --grid-gutter: var(--grid-gutter-md);
      --grid-container-padding: var(--grid-container-padding-md);
    }
  }

  @media (min-width: ${BREAKPOINTS.lg}px) {
    :root {
      --grid-gutter: var(--grid-gutter-lg);
      --grid-container-padding: var(--grid-container-padding-lg);
    }
  }

  /* Safe area insets for notched devices */
  @supports (padding: max(0px)) {
    .safe-area-top {
      padding-top: max(var(--safe-area-inset-top), ${SPACING[4]});
    }
    .safe-area-bottom {
      padding-bottom: max(var(--safe-area-inset-bottom), ${SPACING[4]});
    }
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Mobile-specific optimizations
export const MOBILE_OPTIMIZATIONS = {
  // Disable hover effects on touch devices
  touchDeviceStyles: `
    @media (hover: none) and (pointer: coarse) {
      .hover\\:bg-gray-100:hover {
        background-color: transparent !important;
      }
      .hover\\:scale-105:hover {
        transform: none !important;
      }
    }
  `,

  // Optimize scrolling on iOS
  iOSScrollOptimization: `
    .ios-scroll {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
  `,

  // Prevent zoom on input focus on iOS
  preventIOSZoom: `
    @media screen and (max-width: 767px) {
      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="number"],
      textarea,
      select {
        font-size: 16px !important;
      }
    }
  `,
} as const;

// Performance optimizations for mobile
export const MOBILE_PERFORMANCE = {
  // Image lazy loading configuration
  imageLazyLoading: {
    rootMargin: '50px',
    threshold: 0.1,
  },

  // Virtual scrolling configuration
  virtualScrolling: {
    itemHeight: 60,
    containerHeight: 400,
    overscan: 5,
  },

  // Touch gesture configuration
  touchGestures: {
    swipeThreshold: 50,
    swipeVelocity: 0.3,
    longPressDelay: 500,
  },
} as const;