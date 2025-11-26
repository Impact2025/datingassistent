'use client';

import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  variant?: 'default' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function Progress({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-primary-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-accent-500',
  };

  return (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size], className)} {...props}>
      <div
        className={cn('h-full transition-all duration-300 ease-out rounded-full', variantClasses[variant])}
        style={{ width: `${clampedValue}%` }}
      />
      {showLabel && (
        <div className="flex justify-center mt-2">
          <span className="text-sm font-medium text-gray-700">{clampedValue}%</span>
        </div>
      )}
    </div>
  );
}
