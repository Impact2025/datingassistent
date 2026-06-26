import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function VoicePage() {
  // Redirect to tools page with communication category active (voice/chat tools)
  redirect('/dashboard?tab=tools&category=communication');
}