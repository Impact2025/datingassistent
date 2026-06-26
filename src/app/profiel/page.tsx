import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function ProfielPage() {
  redirect('/dashboard?tab=profiel-persoonlijkheid');
}
