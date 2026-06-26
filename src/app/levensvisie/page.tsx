import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Levensvisie Dating | Vind een Match met Dezelfde Waarden | DatingAssistent',
  description: 'Ontdek hoe jouw levensvisie invloed heeft op dating en relaties. Vind een partner die echt bij je past.',
  alternates: { canonical: 'https://datingassistent.nl/levensvisie' },
  openGraph: {
    title: 'Levensvisie Dating | Vind een Match met Dezelfde Waarden | DatingAssistent',
    description: 'Ontdek hoe jouw levensvisie invloed heeft op dating en relaties. Vind een partner die echt bij je past.',
    url: 'https://datingassistent.nl/levensvisie',
  },
};

export default function LevensVisiePage() {
  redirect('/dashboard?tab=levensvisie');
}
