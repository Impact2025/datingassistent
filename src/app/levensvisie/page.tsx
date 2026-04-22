import { redirect } from 'next/navigation';

export default function LevensVisiePage() {
  redirect('/dashboard?tab=levensvisie');
}
