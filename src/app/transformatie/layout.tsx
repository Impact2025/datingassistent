import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transformatie - Jouw Dating Transformatie | DatingAssistent',
  description: 'Ontdek het DatingAssistent transformatie programma. Stap voor stap naar meer zelfvertrouwen, betere matches en succesvolle dates.|https',
  alternates: { canonical: '//datingassistent.nl/transformatie' },
  openGraph: {
    title: 'Transformatie - Jouw Dating Transformatie | DatingAssistent',
    description: 'Ontdek het DatingAssistent transformatie programma. Stap voor stap naar meer zelfvertrouwen, betere matches en succesvolle dates.|https',
    url: '//datingassistent.nl/transformatie',
  },
};

export default function transformatieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
