/**
 * SERVER-SIDE DEVICE DETECTION
 * Detects device type from User-Agent for middleware routing
 * Created: 2025-11-23
 *
 * This module provides server-side device detection for Next.js middleware
 * Uses User-Agent parsing for reliable server-side detection
 */

import { NextRequest } from 'next/server';

export interface ServerDeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
  browser?: string;
  os?: string;
}

/**
 * Detect device type from User-Agent
 * @param request - Next.js request object
 * @returns ServerDeviceInfo - Device information
 */
export function detectDevice(request: NextRequest): ServerDeviceInfo {
  const userAgent = request.headers.get('user-agent') || '';

  // Mobile patterns (phones)
  const mobilePatterns = [
    /Android.*Mobile/i,
    /iPhone/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Opera Mini/i,
    /IEMobile/i
  ];

  // Tablet patterns
  const tabletPatterns = [
    /iPad/i,
    /Android(?!.*Mobile)/i, // Android without "Mobile" is usually tablet
    /Tablet/i,
    /PlayBook/i,
    /Kindle/i,
    /Silk/i
  ];

  // Check for mobile
  const isMobile = mobilePatterns.some(pattern => pattern.test(userAgent));

  // Check for tablet
  const isTablet = !isMobile && tabletPatterns.some(pattern => pattern.test(userAgent));

  // Desktop is everything else
  const isDesktop = !isMobile && !isTablet;

  // Determine type
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) type = 'mobile';
  else if (isTablet) type = 'tablet';

  // Parse browser
  let browser: string | undefined;
  if (/Chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/Safari/i.test(userAgent)) browser = 'Safari';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/Edge/i.test(userAgent)) browser = 'Edge';

  // Parse OS
  let os: string | undefined;
  if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Mac OS/i.test(userAgent)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/Linux/i.test(userAgent)) os = 'Linux';

  return {
    type,
    isMobile,
    isTablet,
    isDesktop,
    userAgent,
    browser,
    os
  };
}

/**
 * Get device preference from cookie
 * Users can override device detection (e.g., request desktop view on mobile)
 */
export function getDevicePreference(request: NextRequest): 'mobile' | 'desktop' | null {
  const preference = request.cookies.get('device-preference')?.value;

  if (preference === 'mobile' || preference === 'desktop') {
    return preference;
  }

  return null;
}

/**
 * Get effective device type considering user preference
 * @param request - Next.js request object
 * @returns Effective device type after considering preference
 */
export function getEffectiveDeviceType(request: NextRequest): 'mobile' | 'desktop' {
  // Check user preference first
  const preference = getDevicePreference(request);
  if (preference) {
    return preference;
  }

  // Fall back to detection
  const device = detectDevice(request);

  // Mobile users get mobile dashboard
  if (device.isMobile) return 'mobile';

  // Tablet users get desktop dashboard by default (better UX for larger screen)
  // They can switch to mobile view if they prefer
  if (device.isTablet) return 'desktop';

  // Desktop users get desktop dashboard
  return 'desktop';
}

/**
 * Check if device should be redirected
 * @param request - Next.js request object
 * @param currentPath - Current pathname
 * @returns Redirect path or null if no redirect needed
 */
export function getDeviceRedirectPath(
  request: NextRequest,
  currentPath: string
): string | null {
  const effectiveDevice = getEffectiveDeviceType(request);

  // Desktop users trying to access mobile dashboard -> redirect to desktop
  if (currentPath === '/mobile-dashboard' && effectiveDevice === 'desktop') {
    return '/dashboard';
  }

  // Mobile users trying to access desktop dashboard -> redirect to mobile
  // NOTE: We might want to allow this for users who prefer desktop view
  // if (currentPath === '/dashboard' && effectiveDevice === 'mobile') {
  //   return '/mobile-dashboard';
  // }

  return null;
}

/**
 * Should show mobile dashboard
 * @param request - Next.js request object
 * @returns boolean - true if mobile dashboard should be shown
 */
export function shouldShowMobileDashboard(request: NextRequest): boolean {
  return getEffectiveDeviceType(request) === 'mobile';
}

/**
 * Should show desktop dashboard
 * @param request - Next.js request object
 * @returns boolean - true if desktop dashboard should be shown
 */
export function shouldShowDesktopDashboard(request: NextRequest): boolean {
  return getEffectiveDeviceType(request) === 'desktop';
}

/**
 * Get device info for logging/analytics
 * @param request - Next.js request object
 * @returns Object with device info for logging
 */
export function getDeviceAnalytics(request: NextRequest) {
  const device = detectDevice(request);
  const preference = getDevicePreference(request);
  const effective = getEffectiveDeviceType(request);

  return {
    detected: device.type,
    preference,
    effective,
    userAgent: device.userAgent,
    browser: device.browser,
    os: device.os
  };
}
