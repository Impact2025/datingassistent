import * as React from 'react';
import { Text } from '@react-email/components';
import { emailColors } from '../styles/colors';
import { emailTypography } from '../styles/typography';
import { emailLayout } from '../styles/layout';

interface EmailBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'secondary';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
  className?: string;
}

export function EmailBadge({
  children,
  variant = 'default',
  size = 'md',
  style,
  className
}: EmailBadgeProps) {
  const sizeStyles = {
    sm: {
      padding: '4px 8px',
      fontSize: emailTypography.fontSize.xs,
    },
    md: {
      padding: '6px 12px',
      fontSize: emailTypography.fontSize.sm,
    },
  };

  const variantStyles = {
    default: {
      backgroundColor: emailColors.primary,
      color: emailColors.text.inverse,
    },
    success: {
      backgroundColor: emailColors.success,
      color: emailColors.text.inverse,
    },
    warning: {
      backgroundColor: emailColors.warning,
      color: emailColors.text.primary,
    },
    info: {
      backgroundColor: emailColors.communication,
      color: emailColors.text.inverse,
    },
    secondary: {
      backgroundColor: emailColors.background.secondary,
      color: emailColors.text.secondary,
      border: `1px solid ${emailColors.border.medium}`,
    },
  };

  const badgeStyle = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    borderRadius: emailLayout.borderRadius.md,
    fontWeight: emailTypography.fontWeight.medium,
    fontFamily: emailTypography.fontFamily,
    display: 'inline-block',
    textAlign: 'center' as const,
    lineHeight: '1.2',
    ...style,
  };

  return (
    <Text style={badgeStyle} className={className}>
      {children}
    </Text>
  );
}

// Specialized badge variants
export function EmailStepBadge({ number, style }: { number: number; style?: React.CSSProperties }) {
  return (
    <EmailBadge
      variant="default"
      size="md"
      style={{
        backgroundColor: 'transparent',
        color: emailColors.primary,
        border: `2px solid ${emailColors.primary}`,
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {number}
    </EmailBadge>
  );
}

export function EmailScoreBadge({ score, label, style }: { score: string | number; label?: string; style?: React.CSSProperties }) {
  return (
    <EmailBadge
      variant="secondary"
      style={{
        fontWeight: emailTypography.fontWeight.bold,
        ...style,
      }}
    >
      {label ? `${label}: ` : ''}{score}
    </EmailBadge>
  );
}

export function EmailStatusBadge({ status, style }: { status: 'success' | 'warning' | 'info'; style?: React.CSSProperties }) {
  const statusConfig = {
    success: { variant: 'success' as const, text: 'Gelukt' },
    warning: { variant: 'warning' as const, text: 'Let op' },
    info: { variant: 'info' as const, text: 'Info' },
  };

  const config = statusConfig[status];

  return (
    <EmailBadge
      variant={config.variant}
      style={style}
    >
      {config.text}
    </EmailBadge>
  );
}