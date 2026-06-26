import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function EmotioneleReadinessPage() {
  redirect('/dashboard?tab=emotionele-readiness');
}
