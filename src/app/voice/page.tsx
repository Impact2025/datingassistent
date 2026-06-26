import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Voice Dating | Spraakberichten & Bellen | DatingAssistent',
  description: 'Ontdek de kracht van voice dating. Leer hoe spraakberichten en bellen je dating leven kunnen verbeteren.',
  alternates: { canonical: 'https://datingassistent.nl/voice' },
  openGraph: {
    title: 'Voice Dating | Spraakberichten & Bellen | DatingAssistent',
    description: 'Ontdek de kracht van voice dating. Leer hoe spraakberichten en bellen je dating leven kunnen verbeteren.',
    url: 'https://datingassistent.nl/voice',
  },
};

export default function VoicePage() {
  // Redirect to tools page with communication category active (voice/chat tools)
  redirect('/dashboard?tab=tools&category=communication');
}