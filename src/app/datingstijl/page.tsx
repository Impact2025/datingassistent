import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function DatingStijlPage() {
  redirect('/dashboard?tab=datingstijl');
}
