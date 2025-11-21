'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

interface RecaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
  size?: 'compact' | 'normal';
  theme?: 'light' | 'dark';
}

export function Recaptcha({
  siteKey,
  onVerify,
  onExpired,
  onError,
  size = 'normal',
  theme = 'light'
}: RecaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      window.onRecaptchaLoad = () => {
        setIsLoaded(true);
      };
    } else if (window.grecaptcha) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && !widgetId) {
      try {
        const id = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          size: size,
          theme: theme,
          callback: onVerify,
          'expired-callback': onExpired,
          'error-callback': onError,
        });
        setWidgetId(id);
      } catch (error) {
        console.error('reCAPTCHA render error:', error);
        onError?.();
      }
    }
  }, [isLoaded, siteKey, size, theme, onVerify, onExpired, onError, widgetId]);

  const reset = () => {
    if (widgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetId);
    }
  };

  const execute = () => {
    if (widgetId !== null && window.grecaptcha) {
      window.grecaptcha.execute(widgetId);
    }
  };

  return (
    <div>
      <div ref={containerRef}></div>
      {!isLoaded && (
        <div className="flex items-center justify-center p-4 border rounded">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading reCAPTCHA...</span>
        </div>
      )}
    </div>
  );
}

// Hook for invisible reCAPTCHA v3
export function useRecaptchaV3(siteKey: string) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Skip reCAPTCHA entirely in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode: Skipping reCAPTCHA initialization');
      setIsLoaded(true); // Mark as loaded to prevent errors
      return;
    }

    // Don't load reCAPTCHA if siteKey is not provided
    if (!siteKey || siteKey.trim() === '') {
      console.warn('reCAPTCHA siteKey not provided, skipping initialization');
      return;
    }

    if (!document.querySelector('script[src*="recaptcha/api.js?render=' + siteKey + '"]')) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        setIsLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
      };
    } else if (window.grecaptcha) {
      setIsLoaded(true);
    }
  }, [siteKey]);

  const execute = async (action: string = 'submit'): Promise<string | null> => {
    // Skip reCAPTCHA entirely in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode: Bypassing reCAPTCHA verification');
      return 'bypass_development'; // Return a bypass token for development
    }

    if (!siteKey || siteKey.trim() === '') {
      console.warn('reCAPTCHA siteKey not configured, skipping verification');
      return 'bypass'; // Return a bypass token for development
    }

    if (!isLoaded || !window.grecaptcha) {
      console.error('reCAPTCHA not loaded');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execute error:', error);
      return null;
    }
  };

  return { execute, isLoaded };
}