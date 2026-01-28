"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive, ResponsiveContainerProps } from '@/lib/responsive/responsive-design-system';

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  centerContent = false,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6',
    md: isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8',
    lg: isMobile ? 'p-6' : isTablet ? 'p-8' : 'p-12',
    xl: isMobile ? 'p-8' : isTablet ? 'p-12' : 'p-16',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centerContent && 'flex flex-col items-center justify-center min-h-screen',
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile-first grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className,
}) => {
  const { breakpoint } = useResponsive();

  const getColumns = () => {
    switch (breakpoint) {
      case 'xl':
      case 'xxl':
        return columns.xl || columns.lg || columns.md || columns.sm || columns.base || 1;
      case 'lg':
        return columns.lg || columns.md || columns.sm || columns.base || 1;
      case 'md':
        return columns.md || columns.sm || columns.base || 1;
      case 'sm':
        return columns.sm || columns.base || 1;
      default:
        return columns.base || 1;
    }
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const gridCols = getColumns();
  const gridClass = `grid-cols-${Math.min(gridCols, 12)}`;

  return (
    <div
      className={cn(
        'grid w-full',
        gridClass,
        gapClasses[gap],
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

// Touch-friendly button component
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const { isTouchDevice } = useResponsive();

  const sizeClasses = {
    sm: isTouchDevice ? 'min-h-[44px] px-3 py-2 text-sm' : 'min-h-[36px] px-3 py-1.5 text-sm',
    md: isTouchDevice ? 'min-h-[48px] px-4 py-2.5 text-base' : 'min-h-[40px] px-4 py-2 text-base',
    lg: isTouchDevice ? 'min-h-[56px] px-6 py-3 text-lg' : 'min-h-[44px] px-6 py-2.5 text-lg',
    xl: isTouchDevice ? 'min-h-[64px] px-8 py-4 text-xl' : 'min-h-[48px] px-8 py-3 text-xl',
  };

  const variantClasses = {
    primary: 'bg-coral-600 hover:bg-coral-700 text-white font-medium shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium',
    outline: 'border border-gray-300 hover:border-gray-400 text-gray-700 font-medium',
    ghost: 'text-gray-700 hover:bg-gray-100 font-medium',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95 transform transition-transform duration-100',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Responsive text component
interface ResponsiveTextProps {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'body' | 'bodySmall' | 'caption' | 'button';
  className?: string;
  children: React.ReactNode;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  as: Component = 'p',
  variant = 'body',
  className,
  children,
}) => {
  const { isMobile } = useResponsive();

  const variantClasses = {
    body: isMobile ? 'text-base leading-6' : 'text-lg leading-7',
    bodySmall: isMobile ? 'text-sm leading-5' : 'text-base leading-6',
    caption: 'text-xs leading-4',
    button: isMobile ? 'text-sm leading-5 font-medium' : 'text-base leading-6 font-medium',
  };

  return (
    <Component
      className={cn(variantClasses[variant], className)}
    >
      {children}
    </Component>
  );
};

// Mobile-optimized card component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
}) => {
  const { isMobile } = useResponsive();

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8',
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'bg-white border border-gray-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        className
      )}
    >
      {children}
    </div>
  );
};

// Responsive spacing component
interface ResponsiveSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const ResponsiveSpacer: React.FC<ResponsiveSpacerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16',
  };

  return <div className={cn(sizeClasses[size], className)} />;
};

// Mobile-optimized modal component
interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  className,
}) => {
  const { isMobile, safeAreaInsets } = useResponsive();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: isMobile ? 'w-full max-w-sm' : 'w-full max-w-md',
    md: isMobile ? 'w-full max-w-md' : 'w-full max-w-lg',
    lg: isMobile ? 'w-full max-w-lg' : 'w-full max-w-2xl',
    full: 'w-full max-w-full',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 sm:items-center"
      onClick={onClose}
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
      }}
    >
      <div
        className={cn(
          'bg-white rounded-t-lg sm:rounded-lg shadow-xl transform transition-all duration-300',
          'max-h-[90vh] overflow-y-auto',
          isMobile ? 'w-full rounded-b-none' : sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          marginBottom: isMobile ? 0 : undefined,
        }}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Touch gesture hook for swipe actions
export function useTouchGestures(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}