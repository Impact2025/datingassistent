import * as React from 'react';
import { Button, Link } from '@react-email/components';
import { emailColors } from '../styles/colors';
import { emailTypography } from '../styles/typography';
import { emailLayout } from '../styles/layout';

interface EmailButtonProps {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  className?: string;
}

export function EmailButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  style,
  className
}: EmailButtonProps) {
  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: emailTypography.fontSize.sm,
    },
    md: {
      padding: '12px 24px',
      fontSize: emailTypography.fontSize.base,
    },
    lg: {
      padding: '16px 32px',
      fontSize: emailTypography.fontSize.lg,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: emailColors.primary,
      color: emailColors.text.inverse,
      borderRadius: emailLayout.borderRadius.lg,
      fontWeight: emailTypography.fontWeight.semibold,
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: emailLayout.boxShadow.md,
    },
    secondary: {
      backgroundColor: emailColors.secondary,
      color: emailColors.text.inverse,
      borderRadius: emailLayout.borderRadius.lg,
      fontWeight: emailTypography.fontWeight.semibold,
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: emailLayout.boxShadow.md,
    },
    outline: {
      backgroundColor: 'transparent',
      color: emailColors.primary,
      border: `2px solid ${emailColors.primary}`,
      borderRadius: emailLayout.borderRadius.lg,
      fontWeight: emailTypography.fontWeight.semibold,
      textDecoration: 'none',
      display: 'inline-block',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: emailColors.primary,
      border: 'none',
      borderRadius: emailLayout.borderRadius.lg,
      fontWeight: emailTypography.fontWeight.medium,
      textDecoration: 'none',
      display: 'inline-block',
    },
  };

  const buttonStyle = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    fontFamily: emailTypography.fontFamily,
    textAlign: 'center' as const,
    ...style,
  };

  return (
    <Button href={href} style={buttonStyle} className={className}>
      {children}
    </Button>
  );
}

// Specialized button variants for common use cases
export function EmailPrimaryButton({ children, href, style }: { children: React.ReactNode; href: string; style?: React.CSSProperties }) {
  return (
    <EmailButton href={href} variant="primary" style={style}>
      {children}
    </EmailButton>
  );
}

export function EmailSecondaryButton({ children, href, style }: { children: React.ReactNode; href: string; style?: React.CSSProperties }) {
  return (
    <EmailButton href={href} variant="secondary" style={style}>
      {children}
    </EmailButton>
  );
}

export function EmailOutlineButton({ children, href, style }: { children: React.ReactNode; href: string; style?: React.CSSProperties }) {
  return (
    <EmailButton href={href} variant="outline" style={style}>
      {children}
    </EmailButton>
  );
}

export function EmailLinkButton({ children, href, style }: { children: React.ReactNode; href: string; style?: React.CSSProperties }) {
  return (
    <Link href={href} style={{
      ...emailTypography.textStyles.link,
      fontFamily: emailTypography.fontFamily,
      ...style,
    }}>
      {children}
    </Link>
  );
}