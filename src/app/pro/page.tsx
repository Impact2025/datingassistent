"use client";

import { LandingPageContent } from '@/components/landing/landing-page-content';
import { HeroSectionPro } from '@/components/landing/hero-section-pro';

export default function ProLandingPage() {
  return <LandingPageContent hero={<HeroSectionPro />} />;
}

