'use client';

import { useEffect, useRef } from 'react';

/**
 * Screen Reader Announcer - Live Region voor belangrijke updates
 *
 * Dit component kondigt belangrijke veranderingen aan voor screen reader gebruikers
 * zonder de visuele UI te veranderen. Perfect voor tab switches, status updates, etc.
 *
 * @example
 * ```tsx
 * import { announce } from '@/components/accessibility/screen-reader-announcer';
 *
 * // Bij tab switch
 * announce('Coach tab geladen', 'polite');
 *
 * // Bij error
 * announce('Er is een fout opgetreden', 'assertive');
 * ```
 */

type AriaLive = 'off' | 'polite' | 'assertive';

interface AnnouncementState {
  message: string;
  politeness: AriaLive;
}

// Global announcement queue
let announcementQueue: AnnouncementState[] = [];
let listeners: ((announcement: AnnouncementState) => void)[] = [];

/**
 * Announce a message to screen readers
 * @param message - The message to announce
 * @param politeness - How urgent the announcement is ('polite' | 'assertive')
 */
export function announce(message: string, politeness: AriaLive = 'polite') {
  const announcement: AnnouncementState = { message, politeness };
  announcementQueue.push(announcement);
  listeners.forEach(listener => listener(announcement));
}

/**
 * Clear all pending announcements
 */
export function clearAnnouncements() {
  announcementQueue = [];
}

/**
 * ScreenReaderAnnouncer Component
 *
 * Add this once to your app layout. It creates invisible live regions
 * that screen readers will monitor for announcements.
 */
export function ScreenReaderAnnouncer() {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAnnouncement = (announcement: AnnouncementState) => {
      const targetRef = announcement.politeness === 'assertive' ? assertiveRef : politeRef;

      if (targetRef.current) {
        // Clear previous message
        targetRef.current.textContent = '';

        // Trigger reflow to ensure screen readers pick up the change
        void targetRef.current.offsetHeight;

        // Set new message
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.textContent = announcement.message;
          }
        }, 100);

        // Clear after 5 seconds
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.textContent = '';
          }
        }, 5000);
      }
    };

    listeners.push(handleAnnouncement);

    // Announce any queued messages
    announcementQueue.forEach(handleAnnouncement);
    announcementQueue = [];

    return () => {
      listeners = listeners.filter(l => l !== handleAnnouncement);
    };
  }, []);

  return (
    <>
      {/* Polite announcements - waits for current speech to finish */}
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Assertive announcements - interrupts current speech */}
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

/**
 * Hook for announcing messages within components
 * @returns announce function
 */
export function useAnnounce() {
  return announce;
}
