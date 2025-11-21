import { sql } from '@vercel/postgres';
import { getUserSubscription, PACKAGE_FEATURES, type PackageType } from './neon-subscription';

export interface CourseUnlockInfo {
  courseId: number;
  unlocked: boolean;
  unlocksAt?: Date | null;
  weekNumber?: number;
}

/**
 * Calculate how many weeks have passed since subscription started
 */
function getWeeksSinceStart(startDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks;
}

/**
 * Calculate when the next week starts (next Monday 00:00)
 */
function getNextWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day; // If Sunday, 1 day; otherwise 8 - day
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Get list of all courses from database
 */
async function getAllCourses(): Promise<Array<{ id: number; order: number }>> {
  try {
    const result = await sql`
      SELECT id, COALESCE(position, id) as course_order
      FROM courses
      WHERE is_published = true
      ORDER BY course_order ASC
    `;

    return result.rows.map(row => ({
      id: parseInt(row.id as string),
      order: parseInt(row.course_order as string)
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

/**
 * Get unlock information for all courses based on user subscription
 *
 * LOGIC:
 * - Premium: All courses immediately unlocked
 * - Pro/Core/Sociaal: Progressive weekly unlocking
 *   - Sociaal: 1 new course per week
 *   - Core: 2 new courses per week
 *   - Pro: 3 new courses per week
 *
 * Example for Sociaal (1/week):
 * - Week 0 (subscription start): Course 1
 * - Week 1: Course 2
 * - Week 2: Course 3
 * etc.
 */
export async function getCourseUnlockStatus(userId: number): Promise<CourseUnlockInfo[]> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription || subscription.status !== 'active') {
      // No active subscription = no courses unlocked
      return [];
    }

    const allCourses = await getAllCourses();

    if (allCourses.length === 0) {
      return [];
    }

    const features = PACKAGE_FEATURES[subscription.packageType];
    const startDate = new Date(subscription.startDate);
    const weeksSinceStart = getWeeksSinceStart(startDate);

    // Premium gets immediate access to all courses
    if (features.courseUnlockSchedule === 'immediate') {
      return allCourses.map(course => ({
        courseId: course.id,
        unlocked: true,
        unlocksAt: null,
        weekNumber: 0
      }));
    }

    // Progressive unlock for other tiers
    const coursesPerWeek = features.weeklyNewCourses;
    const totalUnlockedCourses = Math.min(
      (weeksSinceStart + 1) * coursesPerWeek, // +1 because week 0 counts
      features.totalCoursesAccess,
      allCourses.length
    );

    return allCourses.map((course, index) => {
      const isUnlocked = index < totalUnlockedCourses;

      if (isUnlocked) {
        return {
          courseId: course.id,
          unlocked: true,
          unlocksAt: null,
          weekNumber: Math.floor(index / coursesPerWeek)
        };
      } else {
        // Calculate when this course will unlock
        const weeksUntilUnlock = Math.ceil((index + 1) / coursesPerWeek) - weeksSinceStart - 1;
        const nextUnlock = new Date(startDate);
        nextUnlock.setDate(startDate.getDate() + (weeksUntilUnlock + weeksSinceStart + 1) * 7);
        nextUnlock.setHours(0, 0, 0, 0);

        return {
          courseId: course.id,
          unlocked: false,
          unlocksAt: nextUnlock,
          weekNumber: Math.floor(index / coursesPerWeek)
        };
      }
    });
  } catch (error) {
    console.error('Error getting course unlock status:', error);
    return [];
  }
}

/**
 * Check if user has access to a specific course
 */
export async function hasCourseAccess(userId: number, courseId: number): Promise<boolean> {
  const unlockStatus = await getCourseUnlockStatus(userId);
  const courseStatus = unlockStatus.find(c => c.courseId === courseId);
  return courseStatus?.unlocked ?? false;
}

/**
 * Get count of unlocked courses for a user
 */
export async function getUnlockedCourseCount(userId: number): Promise<number> {
  const unlockStatus = await getCourseUnlockStatus(userId);
  return unlockStatus.filter(c => c.unlocked).length;
}

/**
 * Get next course unlock date for a user
 */
export async function getNextCourseUnlockDate(userId: number): Promise<Date | null> {
  const unlockStatus = await getCourseUnlockStatus(userId);
  const nextUnlock = unlockStatus
    .filter(c => !c.unlocked && c.unlocksAt)
    .map(c => c.unlocksAt!)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return nextUnlock ?? null;
}

/**
 * Helper function to format unlock info for display
 */
export function formatUnlockInfo(info: CourseUnlockInfo): string {
  if (info.unlocked) {
    return 'Ontgrendeld';
  }

  if (info.unlocksAt) {
    const now = new Date();
    const daysUntil = Math.ceil((info.unlocksAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    if (daysUntil === 0) {
      return 'Ontgrendeld vandaag';
    } else if (daysUntil === 1) {
      return 'Ontgrendeld morgen';
    } else if (daysUntil < 7) {
      return `Ontgrendeld over ${daysUntil} dagen`;
    } else {
      const weeks = Math.ceil(daysUntil / 7);
      return `Ontgrendeld over ${weeks} ${weeks === 1 ? 'week' : 'weken'}`;
    }
  }

  return 'Vergrendeld';
}
