"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SEO_COURSE_URLS, STARTER_RESOURCE_COURSE_MAP } from '@/lib/data';

interface CourseSlugPageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export default function CourseSlugPage({ params }: CourseSlugPageProps) {
  const router = useRouter();
  const [courseSlug, setCourseSlug] = React.useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setCourseSlug(resolvedParams.courseSlug);
    });
  }, [params]);

  useEffect(() => {
    if (!courseSlug) return;

    // Find the course ID from the SEO URL mapping
    const courseId = Object.keys(SEO_COURSE_URLS).find(
      key => SEO_COURSE_URLS[key] === `/dashboard/${courseSlug}`
    );

    if (courseId) {
      // Find the corresponding starter ID
      const starterId = Object.keys(STARTER_RESOURCE_COURSE_MAP).find(
        key => STARTER_RESOURCE_COURSE_MAP[key] === courseId
      );

      if (starterId) {
        // Redirect to the starter course page
        router.replace(`/dashboard/starter/${starterId}`);
        return;
      }
    }

    // If no mapping found, redirect to courses overview
    router.replace('/dashboard?tab=cursus');
  }, [courseSlug, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Cursus wordt geladen...</p>
      </div>
    </div>
  );
}