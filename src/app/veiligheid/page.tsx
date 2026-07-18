import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Veilig Online Daten | Tips & Advies | DatingAssistent',
  description: 'Alles over veilig online daten. Herken nepaccounts, bescherm je privacy en date met vertrouwen.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.datingassistent.nl/veiligheid' },
  openGraph: {
    title: 'Veilig Online Daten | Tips & Advies | DatingAssistent',
    description: 'Alles over veilig online daten. Herken nepaccounts, bescherm je privacy en date met vertrouwen.',
    url: 'https://www.datingassistent.nl/veiligheid',
  },
};

export default function VeiligheidPage() {
  // Redirect to tools page with safety category active (veiligheid tools)
  redirect('/dashboard?tab=tools&category=safety');
}