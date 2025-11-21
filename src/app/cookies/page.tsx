import type { Metadata } from 'next';
import CookiesContent from '@/components/cookies/cookies-content';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Cookiebeleid | Cookies & Privacy | DatingAssistent',
  description: 'Transparante informatie over cookies op DatingAssistent. Leer hoe wij cookies gebruiken, welke soorten cookies er zijn en hoe u uw voorkeuren kunt beheren. GDPR compliant.',
  keywords: ['cookies', 'privacy', 'cookiebeleid', 'GDPR', 'privacy instellingen', 'cookie voorkeuren', 'data bescherming'],
  openGraph: {
    title: 'Cookiebeleid | Cookies & Privacy | DatingAssistent',
    description: 'Transparante informatie over cookies op DatingAssistent. Leer hoe wij cookies gebruiken en hoe u uw voorkeuren kunt beheren.',
    type: 'website',
    url: 'https://datingassistent.nl/cookies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookiebeleid | Cookies & Privacy | DatingAssistent',
    description: 'Transparante informatie over cookies op DatingAssistent.',
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <CookiesContent />
      <PublicFooter />
    </div>
  );
}