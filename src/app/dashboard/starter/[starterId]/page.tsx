import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';

import StarterCourseDetail from '@/components/dashboard/starter-course-detail';
import { InteractiveProfileCoach } from '@/components/dashboard/interactive-profile-coach';
import {
  DETAILED_COURSES,
  STARTER_RESOURCE_COURSE_MAP,
} from '@/lib/data';

type StarterPageProps = {
  params: Promise<{
    starterId: string;
  }>;
};

async function getCourseFromDatabase(slug: string) {
  try {
    // Remove common stop words and build a flexible regex pattern
    const stopWords = ['je', 'de', 'het', 'een', 'die', 'dat'];
    const keywords = slug.split('-').filter(word => !stopWords.includes(word.toLowerCase()));
    const searchPattern = keywords.map(word => {
      // Handle common accent variations (e -> [eé], a -> [aá], etc.)
      return word
        .replace(/e/gi, '[eé]')
        .replace(/a/gi, '[aá]')
        .replace(/i/gi, '[ií]')
        .replace(/o/gi, '[oó]')
        .replace(/u/gi, '[uú]');
    }).join('.*');

    const courseResult = await sql`
      SELECT * FROM courses
      WHERE title ~* ${searchPattern}
        AND is_published = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (courseResult.rows.length === 0) {
      return null;
    }

    const course = courseResult.rows[0];

    // Get modules for this course
    const modulesResult = await sql`
      SELECT * FROM course_modules
      WHERE course_id = ${course.id}
      ORDER BY position ASC
    `;

    // Get lessons for each module
    const modules = await Promise.all(
      modulesResult.rows.map(async (module: any) => {
        const lessonsResult = await sql`
          SELECT * FROM course_lessons
          WHERE module_id = ${module.id}
          ORDER BY position ASC
        `;

        return {
          ...module,
          lessons: lessonsResult.rows,
        };
      })
    );

    return {
      ...course,
      modules,
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export default async function StarterCoursePage({ params }: StarterPageProps) {
  const { starterId } = await params;
  const courseId = STARTER_RESOURCE_COURSE_MAP[starterId];

  if (!courseId) {
    notFound();
  }

  // Try to get course content from database (for modules, lessons, quiz content)
  const dbCourse = await getCourseFromDatabase(courseId);

  // Get static course data (for metadata like accessTier, title, etc.)
  let staticCourse = DETAILED_COURSES.find((item) => item.id === courseId);

  // If static course doesn't exist but we have a DB course, create a basic static course from DB data
  if (!staticCourse && dbCourse) {
    staticCourse = {
      id: courseId,
      title: (dbCourse as any).title || courseId,
      description: (dbCourse as any).description || '',
      provider: 'DatingAssistent',
      duration: `${dbCourse.modules?.length || 0} modules`,
      level: (dbCourse as any).level || 'beginner',
      format: 'video-course',
      accessTier: 'free',
      sections: [], // Will use dbCourse.modules instead
    };
  }

  if (!staticCourse && !dbCourse) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-6 sm:px-6 lg:px-0">
      <StarterCourseDetail
        starterId={starterId}
        course={staticCourse!}
        courseSlug={courseId}
        dbCourse={dbCourse}
        interactiveCoach={starterId === 'starter-5' ? <InteractiveProfileCoach /> : undefined}
      />
    </div>
  );
}
