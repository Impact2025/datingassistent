import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Waarden Kompas | Ontdek Jouw Kernwaarden | DatingAssistent',
  description: 'Ontdek jouw top 5 kernwaarden met ons Waarden Kompas. Vind een partner die echt bij je past op basis van gedeelde waarden.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.datingassistent.nl/waarden-kompas' },
  openGraph: {
    title: 'Waarden Kompas | Ontdek Jouw Kernwaarden | DatingAssistent',
    description: 'Ontdek jouw top 5 kernwaarden met ons Waarden Kompas. Vind een partner die echt bij je past op basis van gedeelde waarden.',
    url: 'https://www.datingassistent.nl/waarden-kompas',
  },
};

export default function WaardenKompasPage() {
  redirect('/dashboard?tab=waarden-kompas');
}
