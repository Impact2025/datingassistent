'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  asChild?: boolean;
  noFocusRing?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, asChild, noFocusRing, children, disabled, ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      !noFocusRing && 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
    );

    const variantClasses = {
      default: 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95',
      primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:scale-105 active:scale-95',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900',
      destructive: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
      ghost: 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
      outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50 hover:text-gray-900',
      link: 'text-primary-500 underline-offset-4 hover:underline',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-6 py-4 text-lg rounded-2xl',
      icon: 'p-2 rounded-lg',
    };

    const buttonClasses = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

    if (asChild) {
      return (
        <Slot ref={ref} className={buttonClasses} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
