'use client';

/**
 * Cookie UI Components Wrapper
 *
 * This client component loads the cookie banner and settings button
 * only on the client side to avoid SSR issues.
 */

import { useEffect, useState } from 'react';
import { CookieBanner } from './cookie-banner';
import { CookieSettingsButton } from './cookie-settings-button';

export function CookieUI() {
  const [mounted, setMounted] = useState(false);

  // Only render on client-side to avoid SSR hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CookieBanner />
      <CookieSettingsButton />
    </>
  );
}
