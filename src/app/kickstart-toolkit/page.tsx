import { KickstartToolkit } from '@/components/tools-tiers/kickstart-toolkit';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

export const metadata = {
  title: 'Kickstart Toolkit | Dating Assistent',
  description: 'AI-powered tools voor je dating journey: Conversation Starters, Profile Builder en meer',
};

export default function KickstartToolkitPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <KickstartToolkit />
      <BottomNavigation />
    </div>
  );
}
