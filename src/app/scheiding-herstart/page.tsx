import type { Metadata } from 'next';
import { ScheidingHerstartClient } from './scheiding-herstart-client';

export const metadata: Metadata = {
  title: 'Ben jij klaar om opnieuw te daten na je scheiding? | DatingAssistent',
  description: 'Doe de gratis scan en ontdek wanneer jij klaar bent voor een nieuwe start. 12 vragen, direct resultaat met persoonlijk profiel, rebound risico check en concrete eerste stappen.',
  openGraph: {
    title: 'Herstart na Scheiding — Ben jij klaar voor een nieuwe start?',
    description: '12 vragen die eerlijk antwoorden wanneer jij klaar bent om opnieuw te daten na een scheiding.',
    type: 'website',
  },
};

export default function ScheidingHerstartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ScheidingHerstartClient />
      </div>
    </div>
  );
}
