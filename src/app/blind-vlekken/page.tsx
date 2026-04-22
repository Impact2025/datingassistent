import { redirect } from 'next/navigation';

export default function BlindVlekkenPage() {
  redirect('/dashboard?tab=blind-vlekken');
}
