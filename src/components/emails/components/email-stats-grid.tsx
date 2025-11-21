import * as React from 'react';
import { Section } from '@react-email/components';
import { emailLayout } from '../styles/layout';
import { emailColors } from '../styles/colors';
import { emailTypography } from '../styles/typography';

interface StatItem {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
}

interface EmailStatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  style?: React.CSSProperties;
  className?: string;
}

export function EmailStatsGrid({
  stats,
  columns = 4,
  style,
  className
}: EmailStatsGridProps) {
  const gridStyle = {
    ...emailLayout.grid[
      columns === 2 ? 'twoColumn' :
      columns === 3 ? 'threeColumn' :
      'responsive'
    ],
    ...style,
  };

  return (
    <Section style={gridStyle} className={className}>
      {stats.map((stat, index) => (
        <div key={index} style={statItemStyle}>
          <div style={{
            ...statIconStyle,
            backgroundColor: stat.color || emailColors.primary,
          }}>
            {stat.icon}
          </div>
          <div style={statContentStyle}>
            <div style={statValueStyle}>{stat.value}</div>
            <div style={statLabelStyle}>{stat.label}</div>
          </div>
        </div>
      ))}
    </Section>
  );
}

// Styles
const statItemStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
  backgroundColor: emailColors.background.secondary,
  borderRadius: emailLayout.borderRadius.lg,
  border: `1px solid ${emailColors.border.light}`,
  textAlign: 'center' as const,
};

const statIconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: emailLayout.borderRadius.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
};

const statContentStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2px',
};

const statValueStyle = {
  fontSize: emailTypography.fontSize.xl,
  fontWeight: emailTypography.fontWeight.bold,
  color: emailColors.text.primary,
  fontFamily: emailTypography.fontFamily,
  lineHeight: '1.2',
};

const statLabelStyle = {
  fontSize: emailTypography.fontSize.xs,
  fontWeight: emailTypography.fontWeight.medium,
  color: emailColors.text.secondary,
  fontFamily: emailTypography.fontFamily,
  lineHeight: '1.3',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

// Predefined stat components for common use cases
export function EmailFeatureStats({ style }: { style?: React.CSSProperties }) {
  const stats = [
    {
      icon: '💡',
      value: 'AI',
      label: 'Gedreven',
      color: emailColors.primary,
    },
    {
      icon: '✅',
      value: '24/7',
      label: 'Online',
      color: emailColors.success,
    },
    {
      icon: '📊',
      value: '∞',
      label: 'Ideeën',
      color: emailColors.communication,
    },
    {
      icon: '🎯',
      value: '89%',
      label: 'Meer matches',
      color: emailColors.time,
    },
  ];

  return <EmailStatsGrid stats={stats} columns={4} style={style} />;
}

export function EmailAchievementStats({ achievements, style }: { achievements: Array<{icon: string, value: string, label: string}>; style?: React.CSSProperties }) {
  const stats = achievements.map(achievement => ({
    ...achievement,
    color: emailColors.success,
  }));

  return <EmailStatsGrid stats={stats} columns={achievements.length as 2 | 3 | 4} style={style} />;
}