import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Blinde Vlekken in Dating | Ontdek Je Onbewuste Patronen | DatingAssistent',
  description: 'Ontdek je blinde vlekken in dating. Leer welke onbewuste patronen je tegenhouden en hoe je ze doorbreekt voor betere matches.',
  robots: { index: false, follow: false },
};

export default function BlindVlekkenPage() {
  redirect('/dashboard?tab=blind-vlekken');
}
