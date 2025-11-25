import { redirect } from 'next/navigation';

export default function FotoPage() {
  // Redirect to tools page with profile category active (foto tools)
  redirect('/tools?category=profile');
}