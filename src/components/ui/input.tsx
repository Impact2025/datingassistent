'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl',
            'text-gray-900 placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-200',
            error && 'border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
