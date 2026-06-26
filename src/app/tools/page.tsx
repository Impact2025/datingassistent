"use client";
nexport const dynamic = "force-dynamic";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ToolsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', 'tools');

    const tool = searchParams?.get('tool');
    const category = searchParams?.get('category');
    if (tool) params.set('tool', tool);
    if (category) params.set('category', category);

    router.replace(`/dashboard?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function ToolsPage() {
  return (
    <Suspense fallback={null}>
      <ToolsRedirect />
    </Suspense>
  );
}
