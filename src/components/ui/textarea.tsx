'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, value, ...props }, ref) => {
    const currentLength = String(value || '').length;

    return (
      <div className="space-y-1">
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl',
            'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-offset-gray-900',
            'transition-colors duration-200 resize-none',
            error && 'border-error focus:ring-error',
            className
          )}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {showCount && maxLength && (
          <div className="flex justify-end">
            <span className={cn(
              'text-xs',
              currentLength > maxLength * 0.9 ? 'text-warning' : 'text-gray-500 dark:text-gray-400'
            )}>
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
