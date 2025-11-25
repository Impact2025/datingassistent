import { redirect } from 'next/navigation';

export default function VeiligheidPage() {
  // Redirect to tools page with safety category active (veiligheid tools)
  redirect('/tools?category=safety');
}