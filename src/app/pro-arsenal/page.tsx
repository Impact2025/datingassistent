import { ProArsenal } from '@/components/tools-tiers/pro-arsenal';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pro Arsenal - Premium Tools | Dating Assistent',
  description: 'Premium dating tools: Skills Assessment, Date Planner, Zelfbeeld Scan en meer',
};

export default function ProArsenalPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProArsenal />
      <BottomNavigation />
    </div>
  );
}
