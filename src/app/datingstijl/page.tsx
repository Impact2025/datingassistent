import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Dating Stijl Test | Ontdek Jouw Dating Stijl | DatingAssistent',
  description: 'Doe de dating stijl test en ontdek of je een romantische, avontuurlijke, analytische of sociale dater bent. Ontvang persoonlijk advies.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://datingassistent.nl/datingstijl' },
  openGraph: {
    title: 'Dating Stijl Test | Ontdek Jouw Dating Stijl | DatingAssistent',
    description: 'Doe de dating stijl test en ontdek of je een romantische, avontuurlijke, analytische of sociale dater bent. Ontvang persoonlijk advies.',
    url: 'https://datingassistent.nl/datingstijl',
  },
};

export default function DatingStijlPage() {
  redirect('/dashboard?tab=datingstijl');
}
