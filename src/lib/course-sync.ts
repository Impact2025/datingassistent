import { sql } from '@vercel/postgres';

import {
  COURSE_GROUPS,
  MODULES,
  DETAILED_COURSES,
  type CourseLesson,
  type CourseSection,
  type MembershipTier,
} from '@/lib/data';

type LessonType = 'video' | 'audio' | 'text' | 'quiz' | 'assignment';

interface ModuleSeed {
  title: string;
  description: string | null;
  lessons?: Array<{
    title: string;
    description: string | null;
    content: string | null;
    type: LessonType;
  }>;
}

const TIER_LEVEL_MAP: Record<MembershipTier, 'beginner' | 'intermediate' | 'advanced'> = {
  free: 'beginner',
  sociaal: 'beginner',
  core: 'beginner',
  pro: 'intermediate',
  premium: 'advanced',
};

function tierIsFree(tier: MembershipTier) {
  return tier === 'free';
}

function tierToLevel(tier: MembershipTier) {
  return TIER_LEVEL_MAP[tier] ?? 'beginner';
}

function safeNumber(value: number | undefined, fallback = 0) {
  return Number.isFinite(value) ? (value as number) : fallback;
}

function buildLessonContent(lesson: CourseLesson) {
  const parts: string[] = [];
  if (lesson.description) {
    parts.push(lesson.description.trim());
  }
  if (lesson.bullets?.length) {
    parts.push(['Belangrijkste punten:', ...lesson.bullets.map((item) => `• ${item}`)].join('\n'));
  }
  if (lesson.downloads?.length) {
    parts.push(['Downloads:', ...lesson.downloads.map((item) => `• ${item}`)].join('\n'));
  }
  return parts.length > 0 ? parts.join('\n\n') : null;
}

const LESSON_TYPE_MAP: Record<string, LessonType> = {
  video: 'video',
  audio: 'audio',
  lesson: 'text',
  exercise: 'assignment',
  tip: 'text',
  download: 'assignment',
  interactive: 'assignment',
  quiz: 'quiz',
};

function mapLessonType(type: string): LessonType {
  return LESSON_TYPE_MAP[type] ?? 'text';
}

function buildSectionExtras(section: CourseSection): ModuleSeed['lessons'] {
  const lessons: ModuleSeed['lessons'] = [];

  if (section.exercises?.length) {
    lessons.push({
      title: 'Oefeningen',
      description: section.exercises.join('\n'),
      content: section.exercises.map((item) => `• ${item}`).join('\n'),
      type: 'assignment',
    });
  }

  if (section.downloads?.length) {
    lessons.push({
      title: 'Downloads',
      description: 'Downloadbare materialen voor deze module.',
      content: section.downloads.map((item) => `• ${item}`).join('\n'),
      type: 'assignment',
    });
  }

  if (section.interactive) {
    lessons.push({
      title: 'Interactieve Opdracht',
      description: section.interactive,
      content: section.interactive,
      type: 'assignment',
    });
  }

  if (section.quiz) {
    lessons.push({
      title: 'Quiz',
      description: 'Quiz voor deze module',
      content: section.quiz,
      type: 'quiz',
    });
  }

  return lessons;
}

async function upsertCourse(params: {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isFree: boolean;
  price: number;
  durationHours: number;
  position: number;
}) {
  const { title, description, level, isFree, price, durationHours, position } = params;

  const existing = await sql`SELECT id FROM courses WHERE title = ${title} LIMIT 1`;

  if (existing.rows.length > 0) {
    const courseId = existing.rows[0].id as number;
    await sql`
      UPDATE courses
      SET description = ${description},
          level = ${level},
          is_free = ${isFree},
          price = ${price},
          duration_hours = ${durationHours},
          is_published = true,
          position = ${position},
          updated_at = NOW()
      WHERE id = ${courseId}
    `;
    return courseId;
  }

  const inserted = await sql`
    INSERT INTO courses (title, description, level, is_free, price, duration_hours, is_published, position)
    VALUES (${title}, ${description}, ${level}, ${isFree}, ${price}, ${durationHours}, true, ${position})
    RETURNING id
  `;

  return inserted.rows[0].id as number;
}

async function resetModulesForCourse(courseId: number) {
  // ⚠️ SAFETY CHECK: Only reset if course has NO custom content
  const existingModules = await sql`SELECT id FROM course_modules WHERE course_id = ${courseId}`;

  // Check if any lesson has custom content (video_url, custom content, etc.)
  let hasCustomContent = false;
  for (const row of existingModules.rows) {
    const moduleId = row.id as number;
    const lessons = await sql`
      SELECT COUNT(*) as count
      FROM course_lessons
      WHERE module_id = ${moduleId}
      AND (video_url IS NOT NULL OR content IS NOT NULL)
    `;
    if (lessons.rows[0].count > 0) {
      hasCustomContent = true;
      break;
    }
  }

  // 🔒 SAFETY: Do NOT delete if there's custom content
  if (hasCustomContent) {
    console.warn(`⚠️ Course ${courseId} has custom content - skipping reset to preserve data`);
    return;
  }

  // Only delete if no custom content exists
  for (const row of existingModules.rows) {
    const moduleId = row.id as number;
    await sql`DELETE FROM course_lessons WHERE module_id = ${moduleId}`;
  }

  await sql`DELETE FROM course_modules WHERE course_id = ${courseId}`;
}

async function insertModules(courseId: number, modules: ModuleSeed[]) {
  for (const [index, module] of modules.entries()) {
    const moduleResult = await sql`
      INSERT INTO course_modules (course_id, title, description, position)
      VALUES (${courseId}, ${module.title}, ${module.description}, ${index + 1})
      RETURNING id
    `;

    const moduleId = moduleResult.rows[0].id as number;

    if (!module.lessons?.length) continue;

    for (const [lessonIndex, lesson] of module.lessons.entries()) {
      await sql`
        INSERT INTO course_lessons (
          module_id,
          title,
          description,
          content,
          lesson_type,
          video_url,
          video_duration,
          is_preview,
          position
        ) VALUES (
          ${moduleId},
          ${lesson.title},
          ${lesson.description},
          ${lesson.content},
          ${lesson.type},
          ${null},
          ${null},
          ${false},
          ${lessonIndex + 1}
        )
      `;
    }
  }
}

async function syncCoreCourses() {
  for (const [index, courseGroup] of COURSE_GROUPS.entries()) {
    const associatedModules = courseGroup.moduleIds
      .map((id) => MODULES.find((module) => module.id === id))
      .filter((module): module is NonNullable<typeof module> => Boolean(module));

    const courseId = await upsertCourse({
      title: courseGroup.title,
      description: courseGroup.description,
      level: tierToLevel(courseGroup.minTier),
      isFree: tierIsFree(courseGroup.minTier),
      price: 0,
      durationHours: safeNumber(associatedModules.length * 2, 2),
      position: index + 1,
    });

    await resetModulesForCourse(courseId);

    const modules: ModuleSeed[] = associatedModules.map((module) => ({
      title: `${module.id}. ${module.title}`,
      description: module.theme,
    }));

    await insertModules(courseId, modules);
  }
}

async function syncDetailedCourses() {
  const basePosition = COURSE_GROUPS.length + 1;

  for (const [index, course] of DETAILED_COURSES.entries()) {
    const courseId = await upsertCourse({
      title: course.title,
      description: course.summary,
      level: tierToLevel(course.accessTier),
      isFree: tierIsFree(course.accessTier),
      price: 0,
      durationHours: safeNumber(course.sections.length * 2, 6),
      position: basePosition + index,
    });

    await resetModulesForCourse(courseId);

    const modules: ModuleSeed[] = course.sections.map((section) => {
      const lessons: ModuleSeed['lessons'] = [];

      section.lessons.forEach((lesson) => {
        lessons.push({
          title: lesson.title,
          description: lesson.description,
          content: buildLessonContent(lesson),
          type: mapLessonType(lesson.type),
        });
      });

      const extras = buildSectionExtras(section);
      if (extras?.length) {
        lessons.push(...extras);
      }

      return {
        title: `${section.label} – ${section.title}`,
        description: section.description,
        lessons,
      };
    });

    await insertModules(courseId, modules);
  }
}

export async function syncCoursesFromStaticData() {
  await syncCoreCourses();
  await syncDetailedCourses();
}
