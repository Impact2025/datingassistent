import { redirect } from 'next/navigation';
export const dynamic = "force-dynamic";

export default function EmotioneleReadinessPage() {
  redirect('/dashboard?tab=emotionele-readiness');
}
