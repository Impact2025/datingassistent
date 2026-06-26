import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Blinde Vlekken in Dating | Ontdek Je Onbewuste Patronen | DatingAssistent',
  description: 'Ontdek je blinde vlekken in dating. Leer welke onbewuste patronen je tegenhouden en hoe je ze doorbreekt voor betere matches.',
  alternates: { canonical: 'https://datingassistent.nl/blind-vlekken' },
  openGraph: {
    title: 'Blinde Vlekken in Dating | Ontdek Je Onbewuste Patronen | DatingAssistent',
    description: 'Ontdek je blinde vlekken in dating. Leer welke onbewuste patronen je tegenhouden en hoe je ze doorbreekt voor betere matches.',
    url: 'https://datingassistent.nl/blind-vlekken',
  },
};

export default function BlindVlekkenPage() {
  redirect('/dashboard?tab=blind-vlekken');
}
