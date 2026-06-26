import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jouw Dating Voortgang | Persoonlijke Dashboard | DatingAssistent',
  robots: { index: false, follow: false },
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
