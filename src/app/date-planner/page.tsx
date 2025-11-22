import { Suspense } from 'react';
import { DatePlannerWithErrorBoundary } from '@/components/dashboard/date-planner';

export default function DatePlannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Date Planner laden...</p>
        </div>
      </div>
    }>
      <DatePlannerWithErrorBoundary />
    </Suspense>
  );
}

export const metadata = {
  title: 'Date Planner - DatingAssistent.nl',
  description: 'Maak je perfecte date onweerstaanbaar met onze professionele Date Planner tool.',
};