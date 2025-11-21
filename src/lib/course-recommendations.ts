import { MembershipTier, DETAILED_COURSES, COURSE_GROUPS } from './data';

export interface UserProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  mainGoal: 'profile' | 'conversation' | 'confidence' | 'safety' | 'relationships';
  timeCommitment: 'quick' | 'moderate' | 'intensive';
  preferredFormat: 'video' | 'interactive' | 'mixed';
}

export interface CourseRecommendation {
  courseId: string;
  priority: number; // 1-5, higher is better match
  reason: string;
  estimatedTime: string;
  simplifiedPath?: string[]; // For complex courses, suggest a simplified path
}

export interface LearningPath {
  title: string;
  description: string;
  courses: CourseRecommendation[];
  totalTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Get personalized course recommendations based on user profile
 */
export function getPersonalizedRecommendations(
  userProfile: UserProfile,
  userTier: MembershipTier
): CourseRecommendation[] {
  const recommendations: CourseRecommendation[] = [];

  // Filter courses by user's membership tier
  const availableCourses = DETAILED_COURSES.filter(course => {
    const tierRank = { free: 0, sociaal: 1, core: 1, pro: 2, premium: 3 };
    return tierRank[course.accessTier] <= tierRank[userTier];
  });

  for (const course of availableCourses) {
    let priority = 3; // Default priority
    let reason = '';

    // Calculate priority based on user profile
    switch (course.id) {
      case 'perfecte-profielfoto':
        if (userProfile.mainGoal === 'profile') {
          priority = 5;
          reason = 'Perfect voor profieloptimalisatie - professionele foto tips';
        } else if (userProfile.experienceLevel === 'beginner') {
          priority = 4;
          reason = 'Uitstekende basis voor beginners';
        }
        break;

      case 'je-profieltekst-die-wel-werkt':
        if (userProfile.mainGoal === 'profile' && userProfile.timeCommitment === 'intensive') {
          priority = 5;
          reason = 'Complete masterclass voor profieltransformatie';
        } else if (userProfile.mainGoal === 'profile') {
          priority = 4;
          reason = 'Diepgaande profieltekst training';
        }
        break;

      case 'boost-je-dating-zelfvertrouwen':
        if (userProfile.mainGoal === 'confidence') {
          priority = 5;
          reason = 'Gerichte mindset en zelfvertrouwen training';
        } else if (userProfile.experienceLevel === 'beginner') {
          priority = 4;
          reason = 'Snelle zelfvertrouwen boost voor beginners';
        }
        break;

      case 'herken-de-5-red-flags':
        if (userProfile.mainGoal === 'safety') {
          priority = 5;
          reason = 'Essentiële veiligheidsvaardigheden';
        } else {
          priority = 3;
          reason = 'Belangrijke veiligheidsbewustzijn';
        }
        break;

      case 'basiscursus-dating-fundament':
        if (userProfile.experienceLevel === 'beginner' && userProfile.timeCommitment === 'moderate') {
          priority = 5;
          reason = 'Complete basis voor dating succes';
        } else if (userProfile.experienceLevel === 'beginner') {
          priority = 4;
          reason = 'Solide fundament voor beginners';
        }
        break;

      case 'match-naar-date-3-berichten':
        if (userProfile.mainGoal === 'conversation') {
          priority = 5;
          reason = 'Praktische conversatie skills';
        } else {
          priority = 3;
          reason = 'Handige berichten tips';
        }
        break;

      case 'connectie-en-diepgang-programma':
        if (userProfile.experienceLevel === 'intermediate' && userProfile.mainGoal === 'relationships') {
          priority = 5;
          reason = 'Diepgaande relatievaardigheden';
        } else if (userProfile.experienceLevel === 'intermediate') {
          priority = 4;
          reason = 'Geavanceerde dating technieken';
        }
        break;

      case 'meesterschap-in-relaties-programma':
        if (userProfile.experienceLevel === 'advanced' && userProfile.mainGoal === 'relationships') {
          priority = 5;
          reason = 'Expert niveau relatievaardigheden';
        } else if (userProfile.experienceLevel === 'advanced') {
          priority = 4;
          reason = 'Premium relatieontwikkeling';
        }
        break;
    }

    // Adjust priority based on format preference
    if (userProfile.preferredFormat === 'video' && course.sections.some(s => s.lessons.some(l => l.type === 'video'))) {
      priority += 0.5;
    }
    if (userProfile.preferredFormat === 'interactive' && course.sections.some(s => s.lessons.some(l => l.type === 'interactive'))) {
      priority += 0.5;
    }

    // Only include if priority is reasonable
    if (priority >= 3) {
      const recommendation: CourseRecommendation = {
        courseId: course.id,
        priority: Math.min(5, Math.round(priority)),
        reason,
        estimatedTime: course.duration,
      };

      // Add simplified path for complex courses
      if (course.id === 'je-profieltekst-die-wel-werkt' && userProfile.timeCommitment === 'quick') {
        recommendation.simplifiedPath = [
          'module-0-welkom-masterclass',
          'module-1-zelfkennis-fundament',
          'module-3-structuur-meesterschap',
          'module-6-validatie-mastery'
        ];
      }

      recommendations.push(recommendation);
    }
  }

  // Sort by priority (highest first)
  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Get predefined learning paths for common user types
 */
export function getLearningPaths(): LearningPath[] {
  return [
    {
      title: '🚀 Snel Succes Pad',
      description: 'Voor beginners die snel resultaten willen zien',
      difficulty: 'beginner',
      totalTime: '2-3 uur',
      courses: [
        {
          courseId: 'boost-je-dating-zelfvertrouwen',
          priority: 5,
          reason: 'Essentiële mindset voor succes',
          estimatedTime: '10 minuten'
        },
        {
          courseId: 'perfecte-profielfoto',
          priority: 5,
          reason: 'Professionele eerste indruk',
          estimatedTime: '5 modules'
        },
        {
          courseId: 'match-naar-date-3-berichten',
          priority: 4,
          reason: 'Praktische conversatie skills',
          estimatedTime: '3 lessen'
        }
      ]
    },
    {
      title: '🎯 Profiel Optimalisatie Pad',
      description: 'Specifiek gericht op profiel verbetering',
      difficulty: 'intermediate',
      totalTime: '4-6 uur',
      courses: [
        {
          courseId: 'perfecte-profielfoto',
          priority: 5,
          reason: 'Foto expertise',
          estimatedTime: '5 modules'
        },
        {
          courseId: 'je-profieltekst-die-wel-werkt',
          priority: 5,
          reason: 'Complete profieltekst masterclass',
          estimatedTime: '2 uur',
          simplifiedPath: [
            'module-0-welkom-masterclass',
            'module-1-zelfkennis-fundament',
            'module-2-doelgroep-psychologie',
            'module-3-structuur-meesterschap',
            'module-6-validatie-mastery'
          ]
        }
      ]
    },
    {
      title: '🛡️ Veilig Daten Pad',
      description: 'Focus op veiligheid en bewuste keuzes',
      difficulty: 'beginner',
      totalTime: '1-2 uur',
      courses: [
        {
          courseId: 'herken-de-5-red-flags',
          priority: 5,
          reason: 'Essentiële veiligheidsvaardigheden',
          estimatedTime: '6 lessen'
        },
        {
          courseId: 'boost-je-dating-zelfvertrouwen',
          priority: 4,
          reason: 'Grenzen bewaken met vertrouwen',
          estimatedTime: '10 minuten'
        }
      ]
    },
    {
      title: '💪 Complete Dating Mastery',
      description: 'Uitgebreide training voor dating experts',
      difficulty: 'advanced',
      totalTime: '15-20 uur',
      courses: [
        {
          courseId: 'basiscursus-dating-fundament',
          priority: 5,
          reason: 'Solide basis',
          estimatedTime: '5 modules'
        },
        {
          courseId: 'connectie-en-diepgang-programma',
          priority: 5,
          reason: 'Geavanceerde technieken',
          estimatedTime: '5 modules'
        },
        {
          courseId: 'meesterschap-in-relaties-programma',
          priority: 5,
          reason: 'Expert niveau',
          estimatedTime: '3 modules'
        }
      ]
    }
  ];
}

/**
 * Get next recommended course based on completed courses
 */
export function getNextRecommendedCourse(
  completedCourses: string[],
  userProfile: UserProfile,
  userTier: MembershipTier
): CourseRecommendation | null {
  const recommendations = getPersonalizedRecommendations(userProfile, userTier);

  // Filter out completed courses
  const availableRecommendations = recommendations.filter(
    rec => !completedCourses.includes(rec.courseId)
  );

  return availableRecommendations[0] || null;
}