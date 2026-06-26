import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Emotionele Readiness Check | Ben Je Klaar om te Daten? | DatingAssistent',
  description: 'Check of je emotioneel klaar bent om te daten. Ontdek of je datingangsten of bagage uit eerdere relaties meedraagt.',
  alternates: { canonical: 'https://datingassistent.nl/emotionele-readiness' },
  openGraph: {
    title: 'Emotionele Readiness Check | Ben Je Klaar om te Daten? | DatingAssistent',
    description: 'Check of je emotioneel klaar bent om te daten. Ontdek of je datingangsten of bagage uit eerdere relaties meedraagt.',
    url: 'https://datingassistent.nl/emotionele-readiness',
  },
};

export default function EmotioneleReadinessPage() {
  redirect('/dashboard?tab=emotionele-readiness');
}
