import * as React from 'react';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

interface SocialMediaLinksProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const socialLinks = [
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://www.instagram.com/datingassistent/',
    color: 'text-coral-400 hover:text-coral-500',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://www.facebook.com/DatingAssistent/',
    color: 'text-blue-400 hover:text-blue-500',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://www.youtube.com/@DatingassistentNl',
    color: 'text-red-400 hover:text-red-500',
  },
  {
    name: 'X (Twitter)',
    icon: Twitter,
    url: 'https://x.com/datingassistent',
    color: 'text-gray-600 hover:text-gray-700',
  },
];

export function SocialMediaLinks({
  size = 'md',
  showLabels = false,
  className = ''
}: SocialMediaLinksProps) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSize = iconSizes[size];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 transition-colors duration-200 ${social.color}`}
            aria-label={`Volg ons op ${social.name}`}
          >
            <IconComponent className={iconSize} strokeWidth={1.5} />
            {showLabels && (
              <span className="text-sm font-medium">{social.name}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

// Email-specific version with inline styles for better email client compatibility
export function EmailSocialMediaLinks() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      marginTop: '16px',
    }}>
      {socialLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280',
              textDecoration: 'none',
              fontFamily: '"Inter", Arial, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              {/* Instagram icon */}
              {social.name === 'Instagram' && (
                <>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                </>
              )}
              {/* Facebook icon */}
              {social.name === 'Facebook' && (
                <>
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </>
              )}
              {/* YouTube icon */}
              {social.name === 'YouTube' && (
                <>
                  <path d="M15 2H9C7.34315 2 6 3.34315 6 5V19C6 20.6569 7.34315 22 9 22H15C16.6569 22 18 20.6569 18 19V5C18 3.34315 16.6569 2 15 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M10 8L14 12L10 16V8Z" fill="currentColor"/>
                </>
              )}
              {/* Twitter/X icon */}
              {social.name === 'X (Twitter)' && (
                <>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                </>
              )}
            </svg>
            <span>{social.name}</span>
          </a>
        );
      })}
    </div>
  );
}