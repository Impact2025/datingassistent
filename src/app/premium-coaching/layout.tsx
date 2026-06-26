import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Dating Coaching | Persoonlijke Begeleiding | DatingAssistent',
  description: 'Krijg persoonlijke 1-op-1 dating coaching van experts. Profiel optimalisatie, gesprekstraining en date voorbereiding.|https',
  alternates: { canonical: '//datingassistent.nl/premium-coaching' },
  openGraph: {
    title: 'Premium Dating Coaching | Persoonlijke Begeleiding | DatingAssistent',
    description: 'Krijg persoonlijke 1-op-1 dating coaching van experts. Profiel optimalisatie, gesprekstraining en date voorbereiding.|https',
    url: '//datingassistent.nl/premium-coaching',
  },
};

export default function premiumcoachingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
