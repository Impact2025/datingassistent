import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

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
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const course = courseResult.rows[0];

    // Get modules for this course
    const modulesResult = await sql`
      SELECT * FROM course_modules
      WHERE course_id = ${course.id}
      ORDER BY position ASC
    `;

    const modules = await Promise.all(
      modulesResult.rows.map(async (module: any) => {
        // Get lessons for each module
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

    return NextResponse.json({
      ...course,
      modules,
    });
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
