"use client";

import { LandingPageContent } from '@/components/landing/landing-page-content';

export function HomePageClient() {
  // Show landing page for all users (logged in or not)
  // Logged-in users can navigate to dashboard via header button
  return <LandingPageContent />;
}