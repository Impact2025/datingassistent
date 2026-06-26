import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Dating Stijl Scan | Gratis Analyse | DatingAssistent',
  description: 'Gratis dating stijl scan. Ontdek jouw unieke dating profiel met onze AI-gedreven analyse.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://datingassistent.nl/dating-stijl-scan' },
  openGraph: {
    title: 'Dating Stijl Scan | Gratis Analyse | DatingAssistent',
    description: 'Gratis dating stijl scan. Ontdek jouw unieke dating profiel met onze AI-gedreven analyse.',
    url: 'https://datingassistent.nl/dating-stijl-scan',
  },
};

export default function DatingStijlScanPage() {
  redirect('/dashboard?tab=dating-stijl-scan');
}
