import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dating Leaderboard | Community Ranglijst | DatingAssistent',
  description: 'Bekijk de DatingAssistent community leaderboard. Wie heeft de meeste vooruitgang geboekt? Laat je inspireren door anderen.',
  robots: { index: false, follow: false },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
