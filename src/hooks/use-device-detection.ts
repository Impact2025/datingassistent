/**
 * USE DEVICE DETECTION HOOK
 * Client-side device type detection
 * Created: 2025-11-23
 */

'use client';

import { useState, useEffect } from 'react';

export interface DeviceDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Hook to detect device type based on screen size and user agent
 */
export function useDeviceDetection(): DeviceDetection {
  const [detection, setDetection] = useState<DeviceDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080
  });

  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();

      // Mobile detection
      const isMobile =
        /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
        width < 768;

      // Tablet detection
      const isTablet =
        !isMobile && (
          /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
          (width >= 768 && width < 1024)
        );

      // Desktop detection
      const isDesktop = !isMobile && !isTablet;

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height
      });
    };

    // Detect on mount
    detectDevice();

    // Re-detect on resize
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return detection;
}
