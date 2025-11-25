import { redirect } from 'next/navigation';

export default function OpenerPage() {
  // Redirect to tools page with communication category active (opener/chat tools)
  redirect('/tools?category=communication');
}