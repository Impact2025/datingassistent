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
    sm: { iconSize: 32, fontSize: emailTypography.fontSize.sm },
    md: { iconSize: 48, fontSize: emailTypography.fontSize.base },
    lg: { iconSize: 64, fontSize: emailTypography.fontSize.lg },
  };

  const { iconSize, fontSize } = sizeStyles[size];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      ...style,
    }}>
      {/* New Logo Image */}
      <img
        src="https://datingassistent.nl/images/LogoDA.png"
        alt="DatingAssistent"
        width={iconSize}
        height={iconSize}
        style={{ flexShrink: 0, display: 'block' }}
      />

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
              color: emailColors.secondary,
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