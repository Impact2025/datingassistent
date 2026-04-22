import { redirect } from 'next/navigation';

export default function WaardenKompasPage() {
  redirect('/dashboard?tab=waarden-kompas');
}
