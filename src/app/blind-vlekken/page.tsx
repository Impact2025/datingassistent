import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export default function BlindVlekkenPage() {
  redirect('/dashboard?tab=blind-vlekken');
}
