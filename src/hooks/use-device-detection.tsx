"use client";

import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    userAgent: '',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;

      // Mobile detection (includes phones and small tablets)
      const isMobile = width < 768;

      // Tablet detection (medium screens)
      const isTablet = width >= 768 && width < 1024;

      // Desktop detection (large screens)
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        userAgent,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Utility functions for device-specific logic
export const deviceUtils = {
  // Check if device supports touch
  supportsTouch: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Check if device is likely a mobile browser
  isMobileBrowser: (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  },

  // Get device pixel ratio for high-DPI displays
  getDevicePixelRatio: (): number => {
    return window.devicePixelRatio || 1;
  },

  // Check if device prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if device is in portrait mode
  isPortrait: (): boolean => {
    return window.innerHeight > window.innerWidth;
  },

  // Check if device is in landscape mode
  isLandscape: (): boolean => {
    return window.innerWidth > window.innerHeight;
  },
};