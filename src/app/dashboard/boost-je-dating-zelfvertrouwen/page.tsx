import { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import StarterCourseDetail from '@/components/dashboard/starter-course-detail';
import { InteractiveProfileCoach } from '@/components/dashboard/interactive-profile-coach';
import {
  DETAILED_COURSES,
} from '@/lib/data';

export const metadata: Metadata = {
  title: 'Boost je dating zelfvertrouwen | DatingAssistent',
  description: 'Herpak je mindset met een krachtige audio pep-talk en vertaal de energie naar concrete micro-oefeningen en een actieplan voor je volgende date. Gratis dating cursus.',
  keywords: 'dating zelfvertrouwen, dating mindset, dating tips, relatie advies, singles coaching',
  openGraph: {
    title: 'Boost je dating zelfvertrouwen',
    description: 'Herpak je mindset met een krachtige audio pep-talk en vertaal de energie naar concrete micro-oefeningen en een actieplan voor je volgende date.',
    type: 'website',
    url: '/dashboard/boost-je-dating-zelfvertrouwen',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boost je dating zelfvertrouwen',
    description: 'Herpak je mindset met een krachtige audio pep-talk en vertaal de energie naar concrete micro-oefeningen.',
  },
};

async function getCourseFromDatabase(slug: string) {
  try {
    const courseResult = await sql`
      SELECT * FROM courses
      WHERE title ~* ${slug}
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

export default async function BoostDatingZelfvertrouwenPage() {
  // Get course content from database
  const dbCourse = await getCourseFromDatabase('boost.*zelfvertrouwen');

  // Get static course data
  const staticCourse = DETAILED_COURSES.find((item) => item.id === 'boost-je-dating-zelfvertrouwen');

  if (!staticCourse && !dbCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Cursus niet gevonden</h1>
          <p className="text-muted-foreground mt-2">De gevraagde cursus kon niet worden gevonden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <StarterCourseDetail
          starterId="starter-3"
          course={staticCourse!}
          courseSlug="boost-je-dating-zelfvertrouwen"
          dbCourse={dbCourse}
          interactiveCoach={undefined}
        />
      </div>
    </div>
  );
}