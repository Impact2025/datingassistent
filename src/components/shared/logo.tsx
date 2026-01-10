import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
}

export function Logo({
  className = '',
  iconSize = 24,
  textSize = 'md',
  showIcon = true
}: LogoProps) {
  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <Image
          src="/images/LogoDatingAssistent.png"
          alt="DatingAssistent Logo"
          width={iconSize}
          height={iconSize}
          className="object-contain"
          priority
        />
      )}
      <span className={`${textSizeClasses[textSize]} font-bold`}>
        <span className="text-[#E14874]">Dating</span>
        <span className="text-foreground">Assistent</span>
      </span>
    </div>
  );
}
