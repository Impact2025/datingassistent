"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfielPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard?tab=profiel');
  }, [router]);
  return null;
}
