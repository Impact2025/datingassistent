import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function MatchPage() {
  // Redirect to tools page with analysis category active (match analysis tools)
  redirect('/dashboard?tab=tools&category=analysis');
}