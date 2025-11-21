import type { Metadata } from 'next';
import HelpContent from '@/components/help/help-content';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Help Center | Support & Hulp | DatingAssistent',
  description: 'Vind antwoorden op je vragen over DatingAssistent. Veelgestelde vragen, handleidingen, live chat support en contactmogelijkheden. 24/7 support beschikbaar.',
  keywords: ['help', 'support', 'hulp', 'veelgestelde vragen', 'FAQ', 'klantenservice', 'handleidingen', 'dating hulp'],
  openGraph: {
    title: 'Help Center | Support & Hulp | DatingAssistent',
    description: 'Vind antwoorden op je vragen over DatingAssistent. Veelgestelde vragen, handleidingen, live chat support.',
    type: 'website',
    url: 'https://datingassistent.nl/help',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | Support & Hulp | DatingAssistent',
    description: 'Vind antwoorden op je vragen over DatingAssistent. Veelgestelde vragen, handleidingen, live chat support.',
  },
};

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <HelpContent />
      <PublicFooter />
    </div>
  );
}