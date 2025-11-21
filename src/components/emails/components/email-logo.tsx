import * as React from 'react';
import { emailColors } from '../styles/colors';
import { emailTypography } from '../styles/typography';

interface EmailLogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  showText?: boolean;
}

export function EmailLogo({
  size = 'md',
  style,
  showText = true
}: EmailLogoProps) {
  const sizeStyles = {
    sm: { iconSize: 24, fontSize: emailTypography.fontSize.sm },
    md: { iconSize: 32, fontSize: emailTypography.fontSize.base },
    lg: { iconSize: 40, fontSize: emailTypography.fontSize.lg },
  };

  const { iconSize, fontSize } = sizeStyles[size];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      ...style,
    }}>
      {/* SVG Logo Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M100 180C100 180 20 120 20 70C20 50 30 30 50 30C70 30 85 45 100 60C115 45 130 30 150 30C170 30 180 50 180 70C180 120 100 180 100 180Z"
          fill={emailColors.primary}
          stroke={emailColors.primary}
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <g transform="translate(60, 60) rotate(-45 50 50)">
          <line x1="30" y1="50" x2="120" y2="50" stroke="white" strokeWidth="12" strokeLinecap="round"/>
          <path d="M115 35 L135 50 L115 65" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M35 40 L25 50 L35 60" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>

      {/* Brand Text */}
      {showText && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          <div style={{
            fontSize: fontSize,
            fontFamily: emailTypography.fontFamily,
            lineHeight: '1',
            letterSpacing: '-0.02em',
          }}>
            <span style={{
              color: emailColors.primary,
              fontWeight: '700'
            }}>
              Dating
            </span>
            <span style={{
              color: emailColors.text.primary,
              fontWeight: '700'
            }}>
              Assistent
            </span>
          </div>
          <div style={{
            fontSize: '11px',
            fontFamily: emailTypography.fontFamily,
            color: emailColors.text.secondary,
            fontWeight: '500',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}>
            Durf te daten, durf jezelf te zijn
          </div>
        </div>
      )}
    </div>
  );
}

// Compact logo for headers
export function EmailLogoCompact({ style }: { style?: React.CSSProperties }) {
  return (
    <EmailLogo
      size="sm"
      showText={false}
      style={style}
    />
  );
}

// Full logo for hero sections
export function EmailLogoFull({ style }: { style?: React.CSSProperties }) {
  return (
    <EmailLogo
      size="lg"
      showText={true}
      style={style}
    />
  );
}