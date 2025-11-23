import { MobileDashboard } from '@/components/mobile/mobile-dashboard';
import { DeviceGuard } from '@/components/guards/device-guard';

export default function MobileDashboardPage() {
  return (
    <DeviceGuard requiredDevice="mobile" allowOverride={true}>
      <MobileDashboard />
    </DeviceGuard>
  );
}