import { sql } from '@vercel/postgres';
import { UserProfile } from '@/lib/types';
import { MODULES } from '@/lib/data';

const HAS_POSTGRES = Boolean(process.env.POSTGRES_URL);

// Types for user behavior tracking
export interface UserBehavior {
  userId: number;
  moduleId?: number;
  courseId?: number;
  action: 'view' | 'start' | 'complete' | 'bookmark' | 'skip';
  timestamp: Date;
}

export interface Recommendation {
  type: 'module' | 'course' | 'feature';
  id: number;
  title: string;
  reason: string;
  confidence: number; // 0-1 scale
}

/**
 * Track user behavior for recommendation engine
 */
export async function trackUserBehavior(behavior: UserBehavior): Promise<void> {
  if (!HAS_POSTGRES) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('trackUserBehavior skipped: POSTGRES_URL ontbreekt.');
    }
    return;
  }
  try {
    await sql`
      INSERT INTO user_behavior (user_id, module_id, course_id, action, timestamp)
      VALUES (${behavior.userId}, ${behavior.moduleId || null}, ${behavior.courseId || null}, ${behavior.action}, ${behavior.timestamp.toISOString()})
    `;
  } catch (error) {
    console.error('Error tracking user behavior:', error);
  }
}

/**
 * Get user behavior history
 */
export async function getUserBehaviorHistory(userId: number, days: number = 30): Promise<UserBehavior[]> {
  if (!HAS_POSTGRES) {
    return [];
  }
  try {
    const result = await sql`
      SELECT * FROM user_behavior
      WHERE user_id = ${userId}
        AND timestamp >= NOW() - INTERVAL '${days} days'
      ORDER BY timestamp DESC
    `;
    
    return result.rows.map(row => ({
      userId: row.user_id,
      moduleId: row.module_id,
      courseId: row.course_id,
      action: row.action,
      timestamp: new Date(row.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching user behavior history:', error);
    return [];
  }
}

/**
 * Generate personalized recommendations based on user behavior
 */
export async function generateRecommendations(userProfile: UserProfile, userId: number): Promise<Recommendation[]> {
  const behaviorHistory = HAS_POSTGRES ? await getUserBehaviorHistory(userId, 30) : [];
  const recommendations: Recommendation[] = [];
  
  // Analyze behavior patterns
  const completedModules = behaviorHistory
    .filter(b => b.action === 'complete' && b.moduleId)
    .map(b => b.moduleId);
    
  const viewedModules = behaviorHistory
    .filter(b => b.action === 'view' && b.moduleId)
    .map(b => b.moduleId);
    
  const bookmarkedCourses = behaviorHistory
    .filter(b => b.action === 'bookmark' && b.courseId)
    .map(b => b.courseId);
    
  const skippedItems = behaviorHistory
    .filter(b => b.action === 'skip')
    .map(b => b.moduleId || b.courseId);
  
  // Recommendation 1: Next module based on completed modules
  const nextModule = getNextModuleRecommendation(completedModules, skippedItems);
  if (nextModule) {
    recommendations.push({
      type: 'module',
      id: nextModule.id,
      title: nextModule.title,
      reason: 'Gebaseerd op je voortgang in eerdere modules',
      confidence: 0.85
    });
  }
  
  // Recommendation 2: Related modules based on interests
  const interestModules = getInterestBasedRecommendations(userProfile, completedModules, skippedItems);
  recommendations.push(...interestModules);
  
  // Recommendation 3: Popular modules among similar users
  const popularModules = await getPopularRecommendations(userId, completedModules, skippedItems);
  recommendations.push(...popularModules);
  
  // Recommendation 4: Courses based on bookmarks
  if (bookmarkedCourses.length > 0) {
    const courseRecommendations = await getCourseRecommendations(bookmarkedCourses, userId);
    recommendations.push(...courseRecommendations);
  }
  
  // Remove duplicates and sort by confidence
  const uniqueRecommendations = recommendations
    .filter((rec, index, self) => 
      index === self.findIndex(r => r.type === rec.type && r.id === rec.id)
    )
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Top 5 recommendations
  
  return uniqueRecommendations;
}

/**
 * Get next logical module recommendation
 */
function getNextModuleRecommendation(completedModules: (number | undefined)[], skippedItems: (number | undefined)[]): {id: number, title: string} | null {
  // Get all module IDs
  const allModuleIds = MODULES.map(m => m.id);
  
  // Find the next module in sequence that hasn't been completed or skipped
  for (const moduleId of allModuleIds) {
    if (!completedModules.includes(moduleId) && !skippedItems.includes(moduleId)) {
      const module = MODULES.find(m => m.id === moduleId);
      if (module) {
        return { id: module.id, title: module.title };
      }
    }
  }
  
  return null;
}

/**
 * Get recommendations based on user interests
 */
function getInterestBasedRecommendations(
  userProfile: UserProfile, 
  completedModules: (number | undefined)[], 
  skippedItems: (number | undefined)[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (!userProfile.interests || userProfile.interests.length === 0) {
    return recommendations;
  }
  
  // Score modules based on interest matches
  const moduleScores = MODULES.map(module => {
    let score = 0;
    
    // Match module title/theme with user interests
    const moduleText = `${module.title} ${module.theme}`.toLowerCase();
    
    userProfile.interests.forEach(interest => {
      const interestLower = interest.toLowerCase();
      if (moduleText.includes(interestLower)) {
        score += 3;
      }
      
      // Partial matches
      if (moduleText.split(' ').some(word => 
        word.includes(interestLower) || interestLower.includes(word)
      )) {
        score += 1;
      }
    });
    
    return { module, score };
  });
  
  // Filter out completed and skipped modules, then sort by score
  const sortedModules = moduleScores
    .filter(ms => ms.score > 0)
    .filter(ms => !completedModules.includes(ms.module.id) && !skippedItems.includes(ms.module.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  // Convert to recommendations
  sortedModules.forEach((ms, index) => {
    recommendations.push({
      type: 'module',
      id: ms.module.id,
      title: ms.module.title,
      reason: `Aanbevolen op basis van je interesses: ${userProfile.interests.join(', ')}`,
      confidence: 0.7 - (index * 0.1) // Decreasing confidence for lower ranked items
    });
  });
  
  return recommendations;
}

/**
 * Get popular recommendations among similar users
 */
async function getPopularRecommendations(
  userId: number,
  completedModules: (number | undefined)[],
  skippedItems: (number | undefined)[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  if (!HAS_POSTGRES) {
    return recommendations;
  }
  
  try {
    // Get popular modules (completed by many users)
    const result = await sql`
      SELECT module_id, COUNT(*) as completion_count
      FROM user_behavior
      WHERE action = 'complete' AND module_id IS NOT NULL
      GROUP BY module_id
      ORDER BY completion_count DESC
      LIMIT 10
    `;
    
    // Filter out already completed and skipped modules
    const popularModules = result.rows
      .filter(row => !completedModules.includes(parseInt(row.module_id)) && !skippedItems.includes(parseInt(row.module_id)))
      .slice(0, 3);
    
    // Convert to recommendations
    popularModules.forEach((row, index) => {
      const moduleId = parseInt(row.module_id);
      const module = MODULES.find(m => m.id === moduleId);
      
      if (module) {
        recommendations.push({
          type: 'module',
          id: moduleId,
          title: module.title,
          reason: 'Populair bij andere gebruikers met vergelijkbare interesses',
          confidence: 0.6 - (index * 0.1)
        });
      }
    });
  } catch (error) {
    console.error('Error fetching popular recommendations:', error);
  }
  
  return recommendations;
}

/**
 * Get course recommendations based on bookmarks
 */
async function getCourseRecommendations(
  bookmarkedCourses: (number | undefined)[],
  userId: number
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  
  if (!HAS_POSTGRES) {
    return recommendations;
  }

  try {
    // For now, we'll return a placeholder since we don't have course data in the database yet
    // In a real implementation, we would query the courses table and find similar courses
    
    // Just return a generic recommendation for now
    recommendations.push({
      type: 'course',
      id: 999, // Placeholder
      title: 'Bekijk meer cursussen',
      reason: 'Gebaseerd op je bladwijzers',
      confidence: 0.5
    });
  } catch (error) {
    console.error('Error fetching course recommendations:', error);
  }
  
  return recommendations;
}

/**
 * Initialize user behavior table
 */
export async function initializeUserBehaviorTable(): Promise<void> {
  if (!HAS_POSTGRES) {
    console.warn('initializeUserBehaviorTable skipped: POSTGRES_URL ontbreekt.');
    return;
  }
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_behavior (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
        course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
        action VARCHAR(20) NOT NULL, -- 'view', 'start', 'complete', 'bookmark', 'skip'
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_module_id ON user_behavior(module_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_course_id ON user_behavior(course_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON user_behavior(action)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp)`;
    
    console.log('User behavior table initialized successfully');
  } catch (error) {
    console.error('Error initializing user behavior table:', error);
  }
}