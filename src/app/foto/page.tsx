import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Dating Profielfoto Check | Gratis Feedback | DatingAssistent',
  description: 'Laat je dating profielfoto checken door AI. Ontvang gratis feedback en tips om je aantrekkelijkheid te vergroten.',
  alternates: { canonical: 'https://datingassistent.nl/foto' },
  openGraph: {
    title: 'Dating Profielfoto Check | Gratis Feedback | DatingAssistent',
    description: 'Laat je dating profielfoto checken door AI. Ontvang gratis feedback en tips om je aantrekkelijkheid te vergroten.',
    url: 'https://datingassistent.nl/foto',
  },
};

export default function FotoPage() {
  // Redirect to tools page with profile category active (foto tools)
  redirect('/dashboard?tab=tools&category=profile');
}