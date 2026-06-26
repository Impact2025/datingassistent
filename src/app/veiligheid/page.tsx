import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function VeiligheidPage() {
  // Redirect to tools page with safety category active (veiligheid tools)
  redirect('/dashboard?tab=tools&category=safety');
}