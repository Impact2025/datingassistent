"use client";

import { OnlineCursusTab } from '@/components/dashboard/online-cursus-tab';

export default function ModulesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Modules overzicht</h1>
        <p className="text-muted-foreground">
          Werk gefocust aan jouw traject zonder afleiding van startersmateriaal of extra aanbevelingen.
        </p>
      </div>

      <OnlineCursusTab
        showStarterResources={false}
        showFeatureOverview={false}
        showDatabaseCourses={false}
      />
    </div>
  );
}
