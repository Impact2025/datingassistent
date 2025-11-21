import { LandingPageContent } from '@/components/landing/landing-page-content';
import { HeroSection } from '@/components/landing/hero-section';

export default function Home() {
  return <LandingPageContent hero={<HeroSection />} />;
}

