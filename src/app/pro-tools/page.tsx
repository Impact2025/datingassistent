import { ProToolsHub } from '@/components/pro-tools/pro-tools-hub';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pro Tools | Dating Assistent',
  description: 'Geavanceerde tools voor maximale dating success',
};

export default function ProToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProToolsHub />
      <BottomNavigation />
    </div>
  );
}
