import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kies Jouw Dating Pakket | DatingAssistent',
  description: 'Bekijk onze pakketten en kies wat bij jou past. Van gratis tools tot premium coaching - vind de perfecte dating ondersteuning.|https',
  alternates: { canonical: '//datingassistent.nl/select-package' },
  openGraph: {
    title: 'Kies Jouw Dating Pakket | DatingAssistent',
    description: 'Bekijk onze pakketten en kies wat bij jou past. Van gratis tools tot premium coaching - vind de perfecte dating ondersteuning.|https',
    url: '//datingassistent.nl/select-package',
  },
};

export default function selectpackageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
