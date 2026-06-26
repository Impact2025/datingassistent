import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function WaardenKompasPage() {
  redirect('/dashboard?tab=waarden-kompas');
}
