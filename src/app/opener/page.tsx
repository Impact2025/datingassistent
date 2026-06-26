import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Openingszinnen Dating | Stral je Beste Gesprek | DatingAssistent',
  description: 'De beste openingszinnen voor dating apps. Van nonchalant tot creatief - vind de perfecte eerste boodschap.',
  alternates: { canonical: 'https://datingassistent.nl/opener' },
  openGraph: {
    title: 'Openingszinnen Dating | Stral je Beste Gesprek | DatingAssistent',
    description: 'De beste openingszinnen voor dating apps. Van nonchalant tot creatief - vind de perfecte eerste boodschap.',
    url: 'https://datingassistent.nl/opener',
  },
};

export default function OpenerPage() {
  // Redirect to tools page with communication category active (opener/chat tools)
  redirect('/tools?category=communication');
}