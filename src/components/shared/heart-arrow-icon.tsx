import React from 'react';

interface HeartArrowIconProps {
  size?: number;
  className?: string;
}

export function HeartArrowIcon({ size = 32, className = '' }: HeartArrowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer heart ring - thick stroke */}
      <path
        d="M120 220C120 220 20 140 20 80C20 50 40 30 65 30C85 30 105 45 120 65C135 45 155 30 175 30C200 30 220 50 220 80C220 140 120 220 120 220Z"
        fill="none"
        stroke="#FF7B54"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner heart - white fill */}
      <path
        d="M120 220C120 220 20 140 20 80C20 50 40 30 65 30C85 30 105 45 120 65C135 45 155 30 175 30C200 30 220 50 220 80C220 140 120 220 120 220Z"
        fill="white"
        stroke="none"
      />

      {/* Arrow pointing up-right - thick and bold */}
      <g>
        {/* Arrow shaft */}
        <line
          x1="85"
          y1="140"
          x2="165"
          y2="60"
          stroke="#FF7B54"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Arrow head - upper triangle */}
        <polygon
          points="165,60 145,75 160,85"
          fill="#FF7B54"
          stroke="#FF7B54"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Arrow head - right triangle */}
        <polygon
          points="165,60 150,50 160,70"
          fill="#FF7B54"
          stroke="#FF7B54"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
