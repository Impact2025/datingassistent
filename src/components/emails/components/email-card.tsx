import * as React from 'react';
import { Section } from '@react-email/components';
import { emailLayout } from '../styles/layout';

interface EmailCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
  style?: React.CSSProperties;
}

export function EmailCard({
  children,
  variant = 'default',
  className,
  style
}: EmailCardProps) {
  const cardStyle = {
    ...emailLayout[variant === 'compact' ? 'cardCompact' : 'card'],
    ...style,
  };

  return (
    <Section style={cardStyle} className={className}>
      {children}
    </Section>
  );
}

// Specialized card variants
export function EmailHeroCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <EmailCard
      style={{
        background: 'linear-gradient(135deg, #fef7ff 0%, #f8f9fa 100%)',
        border: '1px solid #e9d5ff',
        ...style,
      }}
    >
      {children}
    </EmailCard>
  );
}

export function EmailStatsCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <EmailCard
      style={{
        backgroundColor: '#f8fffe',
        border: '1px solid #b8f5e8',
        ...style,
      }}
    >
      {children}
    </EmailCard>
  );
}

export function EmailAlertCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <EmailCard
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fed7aa',
        ...style,
      }}
    >
      {children}
    </EmailCard>
  );
}