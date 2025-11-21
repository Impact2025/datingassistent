'use client';

import { useEffect, useState } from 'react';

export function SkipLinks() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip links when Tab is pressed
      if (e.key === 'Tab') {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      // Hide skip links when clicked outside
      setIsVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-50 bg-white border-b border-gray-200 p-2">
      <nav aria-label="Snelnavigatie">
        <ul className="flex gap-4">
          <li>
            <a
              href="#main-content"
              className="inline-block px-4 py-2 bg-primary text-white rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => setIsVisible(false)}
            >
              Ga naar hoofdinhoud
            </a>
          </li>
          <li>
            <a
              href="#navigation"
              className="inline-block px-4 py-2 bg-primary text-white rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => setIsVisible(false)}
            >
              Ga naar navigatie
            </a>
          </li>
          <li>
            <a
              href="#footer"
              className="inline-block px-4 py-2 bg-primary text-white rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => setIsVisible(false)}
            >
              Ga naar footer
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

// Screen reader only text component
export function ScreenReaderOnly({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  );
}

// Focus trap utility for modals
export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close modal or dialog
        const closeButton = ref.current?.querySelector('[data-close]') as HTMLElement;
        closeButton?.click();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first element
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [ref, isActive]);
}

// High contrast mode detector
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Reduced motion detector
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}