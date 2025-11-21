import { sql } from '@vercel/postgres';

// Types
export interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  price: number;
  is_free: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  content: string | null;
  lesson_type: 'video' | 'audio' | 'text' | 'quiz' | 'assignment' | 'slides';
  image_url: string | null;
  video_url: string | null;
  video_duration: number | null;
  is_preview: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CourseAssignment {
  id: number;
  lesson_id: number;
  title: string;
  description: string;
  instructions: string | null;
  submission_type: 'text' | 'file' | 'url';
  max_points: number;
  created_at: string;
  updated_at: string;
}

// ==================== COURSES ====================

export async function getAllCourses(): Promise<Course[]> {
  try {
    const result = await sql`
      SELECT * FROM courses
      ORDER BY position ASC, created_at DESC
    `;
    return result.rows as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function getCourseById(id: number): Promise<Course | null> {
  try {
    const result = await sql`
      SELECT * FROM courses WHERE id = ${id}
    `;
    return result.rows[0] as Course || null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export async function createCourse(data: {
  title: string;
  description?: string;
  thumbnail_url?: string;
  price?: number;
  is_free?: boolean;
  level?: string;
  duration_hours?: number;
}): Promise<Course | null> {
  try {
    const result = await sql`
      INSERT INTO courses (
        title, description, thumbnail_url, price, is_free, level, duration_hours
      ) VALUES (
        ${data.title},
        ${data.description || null},
        ${data.thumbnail_url || null},
        ${data.price || 0},
        ${data.is_free || false},
        ${data.level || 'beginner'},
        ${data.duration_hours || 0}
      )
      RETURNING *
    `;
    return result.rows[0] as Course;
  } catch (error) {
    console.error('Error creating course:', error);
    return null;
  }
}

export async function updateCourse(id: number, data: Partial<Course>): Promise<boolean> {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex++}`);
      values.push(data.thumbnail_url);
    }
    if (data.is_published !== undefined) {
      updates.push(`is_published = $${paramIndex++}`);
      values.push(data.is_published);
    }
    if (data.price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(data.price);
    }
    if (data.is_free !== undefined) {
      updates.push(`is_free = $${paramIndex++}`);
      values.push(data.is_free);
    }
    if (data.level !== undefined) {
      updates.push(`level = $${paramIndex++}`);
      values.push(data.level);
    }
    if (data.duration_hours !== undefined) {
      updates.push(`duration_hours = $${paramIndex++}`);
      values.push(data.duration_hours);
    }
    if (data.position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(data.position);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE courses
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await sql.query(query, values);
    return true;
  } catch (error) {
    console.error('Error updating course:', error);
    return false;
  }
}

export async function deleteCourse(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM courses WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    return false;
  }
}

// ==================== MODULES ====================

export async function getModulesByCourseId(courseId: number): Promise<CourseModule[]> {
  try {
    const result = await sql`
      SELECT * FROM course_modules
      WHERE course_id = ${courseId}
      ORDER BY position ASC
    `;
    return result.rows as CourseModule[];
  } catch (error) {
    console.error('Error fetching modules:', error);
    return [];
  }
}

export async function createModule(data: {
  course_id: number;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  position?: number;
}): Promise<CourseModule | null> {
  try {
    const result = await sql`
      INSERT INTO course_modules (course_id, title, description, image_url, video_url, position)
      VALUES (
        ${data.course_id},
        ${data.title},
        ${data.description || null},
        ${data.image_url || null},
        ${data.video_url || null},
        ${data.position || 0}
      )
      RETURNING *
    `;
    return result.rows[0] as CourseModule;
  } catch (error) {
    console.error('Error creating module:', error);
    return null;
  }
}

export async function updateModule(id: number, data: Partial<CourseModule>): Promise<boolean> {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(data.image_url);
    }
    if (data.video_url !== undefined) {
      updates.push(`video_url = $${paramIndex++}`);
      values.push(data.video_url);
    }
    if (data.position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(data.position);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE course_modules
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await sql.query(query, values);
    return true;
  } catch (error) {
    console.error('Error updating module:', error);
    return false;
  }
}

export async function deleteModule(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM course_modules WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting module:', error);
    return false;
  }
}

// ==================== LESSONS ====================

export async function getLessonsByModuleId(moduleId: number): Promise<CourseLesson[]> {
  try {
    const result = await sql`
      SELECT * FROM course_lessons
      WHERE module_id = ${moduleId}
      ORDER BY position ASC
    `;
    return result.rows as CourseLesson[];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

export async function createLesson(data: {
  module_id: number;
  title: string;
  description?: string;
  content?: string;
  lesson_type?: string;
  image_url?: string;
  video_url?: string;
  video_duration?: number;
  is_preview?: boolean;
  position?: number;
}): Promise<CourseLesson | null> {
  try {
    const result = await sql`
      INSERT INTO course_lessons (
        module_id, title, description, content, lesson_type,
        image_url, video_url, video_duration, is_preview, position
      )
      VALUES (
        ${data.module_id},
        ${data.title},
        ${data.description || null},
        ${data.content || null},
        ${data.lesson_type || 'video'},
        ${data.image_url || null},
        ${data.video_url || null},
        ${data.video_duration || null},
        ${data.is_preview || false},
        ${data.position || 0}
      )
      RETURNING *
    `;
    return result.rows[0] as CourseLesson;
  } catch (error) {
    console.error('Error creating lesson:', error);
    return null;
  }
}

export async function updateLesson(id: number, data: Partial<CourseLesson>): Promise<boolean> {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }
    if (data.lesson_type !== undefined) {
      updates.push(`lesson_type = $${paramIndex++}`);
      values.push(data.lesson_type);
    }
    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(data.image_url);
    }
    if (data.video_url !== undefined) {
      updates.push(`video_url = $${paramIndex++}`);
      values.push(data.video_url);
    }
    if (data.video_duration !== undefined) {
      updates.push(`video_duration = $${paramIndex++}`);
      values.push(data.video_duration);
    }
    if (data.is_preview !== undefined) {
      updates.push(`is_preview = $${paramIndex++}`);
      values.push(data.is_preview);
    }
    if (data.position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(data.position);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE course_lessons
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await sql.query(query, values);
    return true;
  } catch (error) {
    console.error('Error updating lesson:', error);
    return false;
  }
}

export async function deleteLesson(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM course_lessons WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return false;
  }
}

// ==================== FULL COURSE DATA ====================

export async function getFullCourseData(courseId: number) {
  try {
    // Optimized single query to avoid N+1 problem
    const result = await sql`
      SELECT
        c.*,
        cm.id as module_id,
        cm.title as module_title,
        cm.description as module_description,
        cm.image_url as module_image_url,
        cm.video_url as module_video_url,
        cm.position as module_position,
        cm.created_at as module_created_at,
        cm.updated_at as module_updated_at,
        cl.id as lesson_id,
        cl.title as lesson_title,
        cl.description as lesson_description,
        cl.content as lesson_content,
        cl.lesson_type,
        cl.image_url as lesson_image_url,
        cl.video_url as lesson_video_url,
        cl.video_duration,
        cl.is_preview,
        cl.position as lesson_position,
        cl.created_at as lesson_created_at,
        cl.updated_at as lesson_updated_at
      FROM courses c
      LEFT JOIN course_modules cm ON c.id = cm.course_id
      LEFT JOIN course_lessons cl ON cm.id = cl.module_id
      WHERE c.id = ${courseId}
      ORDER BY cm.position ASC, cl.position ASC
    `;

    if (result.rows.length === 0) return null;

    const course = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      thumbnail_url: result.rows[0].thumbnail_url,
      is_published: result.rows[0].is_published,
      price: result.rows[0].price,
      is_free: result.rows[0].is_free,
      level: result.rows[0].level,
      duration_hours: result.rows[0].duration_hours,
      position: result.rows[0].position,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      modules: [] as any[]
    };

    // Group lessons by module
    const moduleMap = new Map();

    result.rows.forEach(row => {
      if (row.module_id) {
        if (!moduleMap.has(row.module_id)) {
          moduleMap.set(row.module_id, {
            id: row.module_id,
            course_id: courseId,
            title: row.module_title,
            description: row.module_description,
            image_url: row.module_image_url,
            video_url: row.module_video_url,
            position: row.module_position,
            created_at: row.module_created_at,
            updated_at: row.module_updated_at,
            lessons: []
          });
        }

        if (row.lesson_id) {
          const module = moduleMap.get(row.module_id);
          module.lessons.push({
            id: row.lesson_id,
            module_id: row.module_id,
            title: row.lesson_title,
            description: row.lesson_description,
            content: row.lesson_content,
            lesson_type: row.lesson_type,
            image_url: row.lesson_image_url,
            video_url: row.lesson_video_url,
            video_duration: row.video_duration,
            is_preview: row.is_preview,
            position: row.lesson_position,
            created_at: row.lesson_created_at,
            updated_at: row.lesson_updated_at
          });
        }
      }
    });

    course.modules = Array.from(moduleMap.values()).sort((a, b) => a.position - b.position);

    // Sort lessons within each module
    course.modules.forEach(module => {
      module.lessons.sort((a: any, b: any) => a.position - b.position);
    });

    return course;
  } catch (error) {
    console.error('Error fetching full course data:', error);
    return null;
  }
}
