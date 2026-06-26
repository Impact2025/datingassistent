import { redirect } from 'next/navigation';
export const dynamic = "force-dynamic";

export default function BlindVlekkenPage() {
  redirect('/dashboard?tab=blind-vlekken');
}
