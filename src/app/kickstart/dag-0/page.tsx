import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export const metadata = {
  title: 'Dag 0: Welkom | Kickstart',
  description: 'Begin je Kickstart reis met een magisch welkom moment',
};

// Dag-0 is now integrated into the dashboard
// Redirect users to dashboard where the experience is shown
export default function DayZeroPage() {
  redirect('/dashboard');
}
