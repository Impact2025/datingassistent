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
    title: 'DatingAssistent - Stop met Eindeloos Swipen Zonder Resultaat',
    description: 'Krijg binnen 30 dagen betekenisvolle dates met 24/7 AI-hulp die je precies vertelt wat je moet zeggen. 10.000+ Nederlandse singles gebruiken DatingAssistent. Start gratis.',
  };
}

export default function HomePage() {
  return <HomePageClient />;
}
