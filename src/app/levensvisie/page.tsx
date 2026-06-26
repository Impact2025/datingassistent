import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function LevensVisiePage() {
  redirect('/dashboard?tab=levensvisie');
}
