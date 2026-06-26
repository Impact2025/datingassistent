import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function FotoPage() {
  // Redirect to tools page with profile category active (foto tools)
  redirect('/dashboard?tab=tools&category=profile');
}