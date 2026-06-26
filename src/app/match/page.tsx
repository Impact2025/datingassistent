import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Dating Match Analyse | Begrijp Jouw Matches | DatingAssistent',
  description: 'Leer hoe je dating matches werkt. Ontdek algoritmes, compatibiliteit en hoe je betere matches krijgt.',
  alternates: { canonical: 'https://datingassistent.nl/match' },
  openGraph: {
    title: 'Dating Match Analyse | Begrijp Jouw Matches | DatingAssistent',
    description: 'Leer hoe je dating matches werkt. Ontdek algoritmes, compatibiliteit en hoe je betere matches krijgt.',
    url: 'https://datingassistent.nl/match',
  },
};

export default function MatchPage() {
  // Redirect to tools page with analysis category active (match analysis tools)
  redirect('/dashboard?tab=tools&category=analysis');
}