import { Metadata } from 'next';
import SEOManager from '@/lib/seo/seo-manager';
import { EmotioneleReadinessClient } from './emotionele-readiness-client';

// Generate SEO metadata for the emotional readiness page
export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = SEOManager.getPageConfig('emotionele-readiness');
  if (seoConfig) {
    return SEOManager.generateMetadata(seoConfig);
  }

  // Fallback metadata
  return {
    title: 'Emotionele Ready Scan - Ben je Klaar om te Daten? | DatingAssistent',
    description: 'Ontdek of je écht klaar bent om te daten met onze wetenschappelijke Emotionele Ready Scan. AI-gedreven analyse van je emotionele beschikbaarheid.',
  };
}

export default function EmotioneleReadinessPage() {
  return <EmotioneleReadinessClient />;
}