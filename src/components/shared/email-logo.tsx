import * as React from 'react';

interface EmailLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const EmailLogo = ({ size = 'md' }: EmailLogoProps) => {
  const sizes = {
    sm: { fontSize: '18px', iconSize: 28 },
    md: { fontSize: '24px', iconSize: 36 },
    lg: { fontSize: '32px', iconSize: 48 }
  };

  const { fontSize, iconSize } = sizes[size];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: 'Arial, Helvetica, sans-serif'
    }}>
      {/* Heart with Arrow Icon - SVG inline */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heart shape */}
        <path
          d="M100 180C100 180 20 120 20 70C20 50 30 30 50 30C70 30 85 45 100 60C115 45 130 30 150 30C170 30 180 50 180 70C180 120 100 180 100 180Z"
          fill="#E14874"
          stroke="#E14874"
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* Arrow through heart */}
        <g transform="translate(60, 60) rotate(-45 50 50)">
          {/* Arrow shaft */}
          <line
            x1="30"
            y1="50"
            x2="120"
            y2="50"
            stroke="#E14874"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Arrow head */}
          <path
            d="M115 35 L135 50 L115 65"
            fill="none"
            stroke="#E14874"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Arrow tail feathers */}
          <path
            d="M35 40 L25 50 L35 60"
            fill="none"
            stroke="#E14874"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Text */}
      <span style={{
        fontSize,
        fontWeight: 'bold',
        lineHeight: '1',
        fontFamily: 'Arial, Helvetica, sans-serif'
      }}>
        <span style={{ color: '#E14874' }}>Dating</span>
        <span style={{ color: '#1a1a1a' }}>Assistent</span>
      </span>
    </div>
  );
};
