/**
 * Course utilities for DatingAssistent
 * Contains helper functions for course and lesson management
 */

import { DETAILED_COURSES } from './data';

/**
 * Get the number of exercises for a specific lesson
 * @param moduleSlug - The module slug
 * @param lesSlug - The lesson slug
 * @returns Number of exercises in the lesson, or 0 if not found
 */
export function getLessonExerciseCount(moduleSlug: string, lesSlug: string): number {
  // Find the course that contains this module/lesson
  const course = DETAILED_COURSES.find(course =>
    course.sections.some(section => section.id === lesSlug)
  );

  if (!course) {
    console.warn(`Course not found for module: ${moduleSlug}, lesson: ${lesSlug}`);
    return 0;
  }

  // Find the specific section/lesson
  const section = course.sections.find(section => section.id === lesSlug);

  if (!section) {
    console.warn(`Section not found: ${lesSlug} in course: ${course.id}`);
    return 0;
  }

  // Return the number of exercises in this section
  return section.exercises ? section.exercises.length : 0;
}

/**
 * Validate if a lesson exists and has exercises
 * @param moduleSlug - The module slug
 * @param lesSlug - The lesson slug
 * @returns True if lesson exists and has exercises
 */
export function isValidLesson(moduleSlug: string, lesSlug: string): boolean {
  return getLessonExerciseCount(moduleSlug, lesSlug) > 0;
}

/**
 * Get course information by module and lesson slug
 * @param moduleSlug - The module slug
 * @param lesSlug - The lesson slug
 * @returns Course section information or null if not found
 */
export function getCourseSection(moduleSlug: string, lesSlug: string) {
  const course = DETAILED_COURSES.find(course =>
    course.sections.some(section => section.id === lesSlug)
  );

  if (!course) return null;

  return course.sections.find(section => section.id === lesSlug) || null;
}