import { redirect } from 'next/navigation';

export default function ProfielPage() {
  redirect('/dashboard?tab=profiel-persoonlijkheid');
}
