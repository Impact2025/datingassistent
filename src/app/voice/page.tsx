import { redirect } from 'next/navigation';

export default function VoicePage() {
  // Redirect to tools page with communication category active (voice/chat tools)
  redirect('/tools?category=communication');
}