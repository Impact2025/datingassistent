import { redirect } from 'next/navigation';
export const dynamic = "force-dynamic";

export default function DatingStijlPage() {
  redirect('/dashboard?tab=datingstijl');
}
