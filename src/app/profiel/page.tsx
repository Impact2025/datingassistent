import { redirect } from 'next/navigation';
export const dynamic = "force-dynamic";

export default function ProfielPage() {
  redirect('/dashboard?tab=profiel-persoonlijkheid');
}
