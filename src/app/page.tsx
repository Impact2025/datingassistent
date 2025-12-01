import { Metadata } from 'next';
import SEOManager from '@/lib/seo/seo-manager';
import { HomePageClient } from './home-page-client';

// Generate SEO metadata for the homepage
export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = SEOManager.getPageConfig('home');
  if (seoConfig) {
    return SEOManager.generateMetadata(seoConfig);
  }

  // Fallback metadata
  return {
    title: 'DatingAssistent - AI Dating Coach voor Moderne Singles',
    description: 'De ultieme AI-gedreven dating coach voor moderne singles. Verbeter je dating skills met persoonlijke coaching, profiel optimalisatie en relatie advies.',
  };
}

export default function HomePage() {
  return <HomePageClient />;
}
