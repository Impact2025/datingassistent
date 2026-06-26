import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transformatie Onboarding - Start Jouw Dating Transformatie | DatingAssistent',
  description: 'Start met het DatingAssistent transformatie programma. Ontvang je persoonlijke roadmap voor meer zelfvertrouwen en betere dates.',
  alternates: { canonical: 'https://datingassistent.nl/transformatie/onboarding' },
  openGraph: {
    title: 'Transformatie Onboarding | Start Jouw Reis',
    description: 'Start met het transformatie programma voor betere dates.',
    url: 'https://datingassistent.nl/transformatie/onboarding',
  },
};

export default function TransformatieOnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
