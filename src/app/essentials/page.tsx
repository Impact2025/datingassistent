import { EssentialsHub } from '@/components/tools-tiers/essentials-hub';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Essentials - Gratis Tools | Dating Assistent',
  description: 'Gratis dating tools voor iedereen: Badges, Activity Logger, Stats en meer',
};

export default function EssentialsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <EssentialsHub />
      <BottomNavigation />
    </div>
  );
}
