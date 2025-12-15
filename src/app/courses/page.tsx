import type { Metadata } from 'next';
import CoursesContent from '@/components/courses/courses-content';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Online Dating Cursussen | Leer de Kunst van het Daten | DatingAssistent',
  description: 'Professionele online dating cursussen om je dating skills te verbeteren. Van eerste berichten tot succesvolle relaties. Gratis en betaalde cursussen voor alle niveaus.',
  keywords: ['dating cursussen', 'online dating', 'relatie advies', 'dating skills', 'liefdesleven verbeteren', 'singles coaching'],
  openGraph: {
    title: 'Online Dating Cursussen | Leer de Kunst van het Daten | DatingAssistent',
    description: 'Professionele online dating cursussen om je dating skills te verbeteren. Van eerste berichten tot succesvolle relaties.',
    type: 'website',
    url: 'https://datingassistent.nl/courses',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Dating Cursussen | Leer de Kunst van het Daten | DatingAssistent',
    description: 'Professionele online dating cursussen om je dating skills te verbeteren.',
  },
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <CoursesContent />
      <PublicFooter />
    </div>
  );
}