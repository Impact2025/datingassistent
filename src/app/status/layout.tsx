import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DatingAssistent Status - Systeemstatus & Uptime',
  description: 'Controleer de systeemstatus van DatingAssistent. Bekijk of alle diensten beschikbaar zijn.|https',
  alternates: { canonical: '//datingassistent.nl/status' },
  openGraph: {
    title: 'DatingAssistent Status - Systeemstatus & Uptime',
    description: 'Controleer de systeemstatus van DatingAssistent. Bekijk of alle diensten beschikbaar zijn.|https',
    url: '//datingassistent.nl/status',
  },
};

export default function statusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
