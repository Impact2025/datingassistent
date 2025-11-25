import { redirect } from 'next/navigation';

export default function MatchPage() {
  // Redirect to tools page with analysis category active (match analysis tools)
  redirect('/tools?category=analysis');
}