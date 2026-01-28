'use client';

/**
 * DATINGASSISTENT BUTTON SYSTEM COMPONENT
 * React wrapper for the comprehensive button design system
 * Created: 2025-11-26
 *
 * Provides easy-to-use React components for all button types
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'sm' | 'default' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  iconOnly = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn-' + variant;
  const sizeClasses = size !== 'default' ? `btn-${size}` : '';
  const widthClasses = fullWidth ? 'btn-full' : '';
  const iconClasses = iconOnly ? 'btn-icon-only' : '';

  return (
    <button
      className={cn(baseClasses, sizeClasses, widthClasses, iconClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Specialized button components for specific use cases
export function PrimaryButton({ className, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="primary"
      className={cn(
        'bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all',
        className
      )}
      {...props}
    />
  );
}

export function SecondaryButton({ className, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="secondary"
      className={cn(
        'bg-white hover:bg-coral-50 text-coral-600 border-2 border-coral-200 rounded-full shadow-sm hover:shadow-md transition-all',
        className
      )}
      {...props}
    />
  );
}

export function TertiaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="tertiary" {...props} />;
}

// Floating Action Button
interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function FAB({ className, children, ...props }: FABProps) {
  return (
    <button
      className={cn('btn-primary btn-fab', className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Focus Objective Item (for the "Vandaag focus op" items)
interface FocusObjectiveItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export function FocusObjectiveItem({
  children,
  selected = false,
  className,
  onClick,
  ...props
}: FocusObjectiveItemProps) {
  return (
    <div
      className={cn(
        'focus-objective-item',
        selected && 'selected',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Button Group for related actions
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({
  children,
  className,
  orientation = 'horizontal'
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

// Export utility functions for custom implementations
export const buttonClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  fab: 'btn-primary btn-fab',
  focusItem: 'focus-objective-item',
  sizes: {
    sm: 'btn-sm',
    lg: 'btn-lg',
    xl: 'btn-xl',
    full: 'btn-full',
    iconOnly: 'btn-icon-only'
  }
} as const;

/*
USAGE EXAMPLES:

// Primary action button (most important)
<PrimaryButton onClick={handleStart}>
  Start met mijn advies
</PrimaryButton>

// Secondary action button
<SecondaryButton onClick={handleCancel}>
  Annuleren
</SecondaryButton>

// Tertiary action button
<TertiaryButton onClick={handleMoreInfo}>
  Meer informatie
</TertiaryButton>

// Full width primary button
<PrimaryButton fullWidth onClick={handleIntegrate} className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
  Bekijken & Integreren
</PrimaryButton>

// Small secondary button
<SecondaryButton size="sm" onClick={handlePreferences}>
  Voorkeuren Aanpassen
</SecondaryButton>

// Floating Action Button
<FAB onClick={handleQuickAction}>
  <Plus className="w-6 h-6" />
</FAB>

// Focus objective items
<FocusObjectiveItem selected={selectedItem === 'photos'} onClick={() => handleSelect('photos')}>
  Profiel foto optimaliseren
</FocusObjectiveItem>

// Button group
<ButtonGroup>
  <PrimaryButton>Opslaan</PrimaryButton>
  <SecondaryButton>Annuleren</SecondaryButton>
</ButtonGroup>
*/