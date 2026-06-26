import { redirect } from 'next/navigation';
export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Relatiepatronen Analyse | DatingAssistent',
  description: 'Ontdek je terugkerende relatiepatronen met onze uitgebreide analyse. Krijg praktische inzichten en downloadbare resultaten voor betere dating beslissingen.',
};

export default function RelatiepatronenPage() {
  redirect('/dashboard?tab=relatiepatronen');
}
