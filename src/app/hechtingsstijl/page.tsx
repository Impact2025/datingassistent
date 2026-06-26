import { redirect } from 'next/navigation';
nexport const dynamic = "force-dynamic";

export const metadata = {
  title: 'Hechtingsstijl QuickScan | DatingAssistent',
  description: 'Ontdek je hechtingsstijl in 3-5 minuten met onze wetenschappelijk onderbouwde QuickScan. Krijg praktische inzichten voor betere dating beslissingen.',
};

export default function HechtingsstijlPage() {
  redirect('/dashboard?tab=hechtingsstijl');
}
