"use client";

import { useState, useEffect, useTransition, useMemo } from 'react';
import type { ComponentType } from 'react';
import {
  COURSE_GROUPS,
  DETAILED_COURSES,
  FREE_STARTER_RESOURCES,
  MEMBERSHIP_RANK,
  MODULES,
  STARTER_RESOURCE_COURSE_MAP,
} from '@/lib/data';
import type {
  StarterResourceFormat,
  MembershipFeature,
  CourseLesson,
  CourseSection,
} from '@/lib/data';
import * as Lucide from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { AIResultCard } from '@/components/shared/ai-result-card';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser } from '@/providers/user-provider';
import { trackUserBehavior } from '@/lib/recommendation-engine';
import { useToast } from '@/hooks/use-toast';
import {
  getFeatureAccess,
  getModulesForCourse,
  getTierLabel,
  hasModuleAccess,
  isCourseLocked,
  normalizeMembershipTier,
  sortFeaturesByTier,
} from '@/lib/membership-access';

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  is_free: boolean;
  price: number;
  module_count: string;
  lesson_count: string;
}

const getLucideIcon = (name?: string): ComponentType<{ className?: string }> | null => {
  if (!name) return null;
  const icons = Lucide as unknown as Record<string, ComponentType<{ className?: string }>>;
  return icons[name] ?? null;
};

const STARTER_RESOURCE_ICONS: Record<StarterResourceFormat, string> = {
  video: 'PlayCircle',
  email: 'Mail',
  audio: 'Headphones',
  infographic: 'BarChart3',
  worksheet: 'FileText',
  bundle: 'Layers',
};

const STARTER_RESOURCE_LABELS: Record<StarterResourceFormat, string> = {
  video: 'Video',
  email: 'E-mailcursus',
  audio: 'Audio',
  infographic: 'Infographic',
  worksheet: 'Werkblad',
  bundle: 'Bundel',
};

const LESSON_TYPE_ICONS: Record<CourseLesson['type'], string> = {
  video: 'PlayCircle',
  audio: 'Headphones',
  lesson: 'BookOpen',
  exercise: 'Pencil',
  tip: 'Lightbulb',
  download: 'Download',
  interactive: 'Sparkles',
  quiz: 'Gamepad2',
};

type OnlineCursusTabProps = {
  showStarterResources?: boolean;
  showFeatureOverview?: boolean;
  showDatabaseCourses?: boolean;
  showMembershipModules?: boolean;
};

// AI function for module feedback
async function getModuleAIFeedback(
  moduleId: number,
  userInput: string,
  moduleTitle?: string,
  moduleDescription?: string
): Promise<string> {
  const token = localStorage.getItem('datespark_auth_token');
  const response = await fetch('/api/module-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      moduleId,
      userInput,
      moduleTitle,
      moduleDescription
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get AI feedback');
  }

  const data = await response.json();
  return data.feedback;
}

// Function to get recommended courses based on user profile
function getRecommendedCourses(courses: Course[], userProfile: any) {
  if (!userProfile) return courses.slice(0, 3);
  
  // Calculate recommendation scores for each course
  const coursesWithScores = courses.map(course => {
    let score = 0;
    
    // Score based on interests
    if (userProfile.interests && Array.isArray(userProfile.interests)) {
      const interestMatches = course.title.toLowerCase().split(' ').filter(word => 
        userProfile.interests.some((interest: string) => 
          interest.toLowerCase().includes(word) || word.includes(interest.toLowerCase())
        )
      ).length;
      score += interestMatches * 3; // Weight interest matches more heavily
    }
    
    // Score based on age group
    if (userProfile.age) {
      let ageScore = 0;
      if (userProfile.age < 30 && course.title.toLowerCase().includes('jong')) {
        ageScore += 2;
      } else if (userProfile.age >= 30 && userProfile.age < 50 && course.title.toLowerCase().includes('30')) {
        ageScore += 2;
      } else if (userProfile.age >= 50 && course.title.toLowerCase().includes('50')) {
        ageScore += 2;
      }
      score += ageScore;
    }
    
    // Score based on gender/identity group
    if (userProfile.identityGroup) {
      if (userProfile.identityGroup === 'lhbtq+' && course.title.toLowerCase().includes('lhbtq')) {
        score += 2;
      } else if (userProfile.identityGroup === 'beperking' && course.title.toLowerCase().includes('beperking')) {
        score += 2;
      } else if (userProfile.identityGroup === 'christelijk' && course.title.toLowerCase().includes('christelijk')) {
        score += 2;
      }
    }
    
    // Score based on experience level (beginner vs advanced)
    if (userProfile.bio && userProfile.bio.length > 200) {
      // Longer bio might indicate more experience
      if (course.level === 'intermediate' || course.level === 'advanced') {
        score += 1;
      }
    } else {
      // Shorter bio might indicate beginner
      if (course.level === 'beginner') {
        score += 1;
      }
    }
    
    return { ...course, recommendationScore: score };
  });
  
  // Sort by recommendation score and return top 3
  return coursesWithScores
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 3);
}

// Unified card component for both modules and courses
function ContentCard({
  id,
  title,
  description,
  thumbnail_url,
  level,
  duration_hours,
  is_free,
  price,
  module_count,
  lesson_count,
  type,
  isCompleted,
  isLocked = false,
  requiredTierLabel,
  iconName,
  onClick,
}: {
  id: number;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  level?: string;
  duration_hours?: number;
  is_free?: boolean;
  price?: number;
  module_count?: string;
  lesson_count?: string;
  type: 'module' | 'course';
  isCompleted?: boolean;
  isLocked?: boolean;
  requiredTierLabel?: string;
  iconName?: string;
  onClick?: () => void;
}) {
  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Gemiddeld';
      case 'advanced':
        return 'Gevorderd';
      default:
        return level;
    }
  };

  const renderIcon = () => {
    if (thumbnail_url) return null;

    const fallback = type === 'module' ? 'HelpCircle' : 'BookOpen';
    const IconComponent = getLucideIcon(iconName ?? fallback) ?? Lucide.HelpCircle;

    return (
      <IconComponent className={isLocked ? 'text-muted-foreground' : 'text-primary'} />
    );
  };

  const iconNode = renderIcon();

  return (
    <Card 
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer bg-secondary/80 p-6 transition-all hover:bg-secondary hover:-translate-y-1 h-full ${onClick ? '' : 'cursor-default'} ${isCompleted ? 'border-primary border-2' : ''} ${isLocked ? 'border-dashed border-amber-300' : ''}`}
    >
      <CardContent className="flex flex-col p-0 h-full">
        {/* Completion indicator */}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
            <Lucide.Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}

        {/* Thumbnail or icon */}
        {thumbnail_url ? (
          <div className="mb-4 aspect-video rounded-lg overflow-hidden">
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            {iconNode}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
              {type === 'module' ? 'Module' : 'Cursus'}
            </span>
            {level && (
              <span className="inline-block bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded-full">
                {getLevelLabel(level)}
              </span>
            )}
            {requiredTierLabel && (
              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${isLocked ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground'}`}>
                Vanaf {requiredTierLabel}
              </span>
            )}
            {isCompleted && (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                Voltooid
              </span>
            )}
          </div>
          
          <h4 className="text-lg font-bold mb-2">{title}</h4>
          
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 mt-4">
          {type === 'course' && module_count && lesson_count && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lucide.BookOpen className="h-4 w-4" />
              <span>{module_count} modules • {lesson_count} lessen</span>
            </div>
          )}

          {duration_hours !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lucide.Clock className="h-4 w-4" />
              <span>{duration_hours} uur</span>
            </div>
          )}

          {type === 'course' && (
            <div className="pt-2">
              {is_free ? (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Gratis
                </span>
              ) : (
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  €{price}
                </span>
              )}
            </div>
          )}

          {type === 'module' && !isLocked && onClick && (
            <div className="pt-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <Lucide.ExternalLink className="h-3 w-3" />
                Open modulepagina
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {isLocked && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur">
          <Lucide.Lock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground">
            Upgrade naar {requiredTierLabel ?? 'een hoger pakket'}
          </span>
        </div>
      )}
    </Card>
  );
}

export function OnlineCursusTab({
  showStarterResources = true,
  showFeatureOverview = true,
  showDatabaseCourses = true,
  showMembershipModules = true,
}: OnlineCursusTabProps = {}) {
  const { user, userProfile } = useUser();
  const { toast } = useToast();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState([{
    role: 'ai', text: 'Hoi! Ik zie op je foto dat je van reizen houdt, tof! Wat is de mooiste plek waar je ooit bent geweest?'
  }]);

  const subscriptionType = user?.subscriptionType ?? (userProfile as any)?.subscriptionType ?? null;
  const membershipTier = normalizeMembershipTier(subscriptionType);
  const membershipLabel = getTierLabel(membershipTier);

  const featureAccess = useMemo(() => {
    const { available, locked } = getFeatureAccess(membershipTier);
    return {
      available: sortFeaturesByTier(available),
      locked: sortFeaturesByTier(locked),
    };
  }, [membershipTier]);

  // State for database courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // State for course unlock status
  const [courseUnlockStatus, setCourseUnlockStatus] = useState<Map<number, { unlocked: boolean; unlocksAt?: Date | null }>>(new Map());
  const [nextUnlockDate, setNextUnlockDate] = useState<Date | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('recommended');

  const courseSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return COURSE_GROUPS.map((course) => {
      const modules = getModulesForCourse(course.id).filter((module) => {
        if (!query) return true;
        return (
          module.title.toLowerCase().includes(query) ||
          module.theme.toLowerCase().includes(query)
        );
      });

      return { course, modules };
    });
  }, [searchQuery]);

  const hasModuleMatches = courseSections.some((section) => section.modules.length > 0);

  const renderFeatureCard = (feature: MembershipFeature, locked: boolean) => {
    const IconComponent = getLucideIcon(feature.icon) ?? Lucide.HelpCircle;

    return (
      <Card
        key={feature.id}
        className={`h-full ${locked ? 'border-dashed border-amber-300 bg-secondary/60' : 'bg-secondary/80'}`}
      >
        <CardContent className="flex gap-4 p-5">
          <div className={`rounded-full p-2 ${locked ? 'bg-muted' : 'bg-primary/10'}`}>
            <IconComponent
              className={`${locked ? 'text-muted-foreground' : 'text-primary'} h-5 w-5`}
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-semibold">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
            {locked && (
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Lucide.Lock className="h-4 w-4" />
                <span>Beschikbaar vanaf {getTierLabel(feature.minTier)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Progress tracking state
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [completedStarters, setCompletedStarters] = useState<string[]>([]);
  const [lastAccessedModule, setLastAccessedModule] = useState<number | null>(null);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<number[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchCourseUnlockStatus();
    loadProgress();
    loadStarterProgress();
    loadLastAccessed();
    loadBookmarks();
  }, []);

  const loadProgress = () => {
    // Load completed modules from localStorage
    const saved = localStorage.getItem('dating_assistant_completed_modules');
    if (saved) {
      try {
        const modules = JSON.parse(saved);
        if (Array.isArray(modules)) {
          setCompletedModules(modules);
        }
      } catch (e) {
        console.error('Failed to parse completed modules', e);
      }
    }
  };

  const loadStarterProgress = () => {
    const saved = localStorage.getItem('dating_assistant_completed_starters');
    if (saved) {
      try {
        const starters = JSON.parse(saved);
        if (Array.isArray(starters)) {
          setCompletedStarters(starters);
        }
      } catch (e) {
        console.error('Failed to parse completed starters', e);
      }
    }
  };

  const loadLastAccessed = () => {
    // Load last accessed module from localStorage
    const saved = localStorage.getItem('dating_assistant_last_module');
    if (saved) {
      try {
        const moduleId = parseInt(saved);
        if (!isNaN(moduleId)) {
          setLastAccessedModule(moduleId);
        }
      } catch (e) {
        console.error('Failed to parse last accessed module', e);
      }
    }
  };

  const loadBookmarks = () => {
    // Load bookmarked courses from localStorage
    const saved = localStorage.getItem('dating_assistant_bookmarked_courses');
    if (saved) {
      try {
        const bookmarks = JSON.parse(saved);
        if (Array.isArray(bookmarks)) {
          setBookmarkedCourses(bookmarks);
        }
      } catch (e) {
        console.error('Failed to parse bookmarked courses', e);
      }
    }
  };

  const saveProgress = (modules: number[]) => {
    localStorage.setItem('dating_assistant_completed_modules', JSON.stringify(modules));
  };

  const saveStarterProgress = (starters: string[]) => {
    localStorage.setItem('dating_assistant_completed_starters', JSON.stringify(starters));
    setCompletedStarters(starters);
  };

  const saveLastAccessed = (moduleId: number) => {
    localStorage.setItem('dating_assistant_last_module', moduleId.toString());
    setLastAccessedModule(moduleId);
  };

  const saveBookmarks = (bookmarks: number[]) => {
    localStorage.setItem('dating_assistant_bookmarked_courses', JSON.stringify(bookmarks));
    setBookmarkedCourses(bookmarks);
  };

  const toggleModuleCompletion = (moduleId: number) => {
    const newCompletedModules = completedModules.includes(moduleId)
      ? completedModules.filter(id => id !== moduleId)
      : [...completedModules, moduleId];
    
    // Track module completion behavior
    if (user?.id) {
      trackUserBehavior({
        userId: user.id,
        moduleId: moduleId,
        action: completedModules.includes(moduleId) ? 'skip' : 'complete',
        timestamp: new Date()
      });
    }
    
    setCompletedModules(newCompletedModules);
    saveProgress(newCompletedModules);
  };

  const toggleStarterCompletion = (starterId: string) => {
    const updated = completedStarters.includes(starterId)
      ? completedStarters.filter((id) => id !== starterId)
      : [...completedStarters, starterId];

    saveStarterProgress(updated);
  };

  const resetStarterProgress = () => {
    saveStarterProgress([]);
  };

  const toggleCourseBookmark = (courseId: number) => {
    const newBookmarks = bookmarkedCourses.includes(courseId)
      ? bookmarkedCourses.filter(id => id !== courseId)
      : [...bookmarkedCourses, courseId];
    
    // Track course bookmark behavior
    if (user?.id) {
      trackUserBehavior({
        userId: user.id,
        courseId: courseId,
        action: bookmarkedCourses.includes(courseId) ? 'skip' : 'bookmark',
        timestamp: new Date()
      });
    }
    
    saveBookmarks(newBookmarks);
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch('/api/courses');

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setCoursesError('Kon extra cursussen niet laden');
      console.error(err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchCourseUnlockStatus = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      const response = await fetch('/api/courses/unlock-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unlock status');
      }

      const data = await response.json();

      // Convert array to Map for easy lookup
      const statusMap = new Map();
      data.courses.forEach((course: any) => {
        statusMap.set(course.courseId, {
          unlocked: course.unlocked,
          unlocksAt: course.unlocksAt ? new Date(course.unlocksAt) : null
        });
      });

      setCourseUnlockStatus(statusMap);

      if (data.summary.nextUnlockDate) {
        setNextUnlockDate(new Date(data.summary.nextUnlockDate));
      }
    } catch (err) {
      console.error('Failed to fetch course unlock status:', err);
      // Don't show error to user - gracefully degrade
    }
  };

  // Helper to format unlock date
  const formatUnlockDate = (date: Date | null | undefined): string => {
    if (!date) return 'Vergrendeld';

    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

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
  };

  // Filter and sort courses based on search query, level, price, and sort option
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      const matchesPrice = selectedPriceFilter === 'all' ||
        (selectedPriceFilter === 'free' && course.is_free) ||
        (selectedPriceFilter === 'paid' && !course.is_free);

      // Check if course is unlocked (if unlock status is available)
      const unlockInfo = courseUnlockStatus.get(course.id);
      const isUnlocked = unlockInfo ? unlockInfo.unlocked : true; // Default to unlocked if no status

      return matchesSearch && matchesLevel && matchesPrice && isUnlocked;
    });

    // Apply sorting
    switch (selectedSort) {
      case 'price-low':
        filtered = filtered.sort((a, b) => {
          const priceA = a.is_free ? 0 : a.price;
          const priceB = b.is_free ? 0 : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => {
          const priceA = a.is_free ? 0 : a.price;
          const priceB = b.is_free ? 0 : b.price;
          return priceB - priceA;
        });
        break;
      case 'duration-short':
        filtered = filtered.sort((a, b) => a.duration_hours - b.duration_hours);
        break;
      case 'duration-long':
        filtered = filtered.sort((a, b) => b.duration_hours - a.duration_hours);
        break;
      case 'newest':
        filtered = [...filtered].reverse();
        break;
      case 'recommended':
      default:
        // Keep original order or apply recommendation logic
        break;
    }

    return filtered;
  }, [courses, searchQuery, selectedLevel, selectedPriceFilter, selectedSort]);

  // Get bookmarked courses
  const bookmarkedCoursesList = courses.filter(course => bookmarkedCourses.includes(course.id));

  // Get recommended courses based on user profile
  const recommendedCourses = getRecommendedCourses(courses, userProfile);

  // Get locked courses (coming soon)
  const lockedCourses = useMemo(() => {
    return courses.filter(course => {
      const unlockInfo = courseUnlockStatus.get(course.id);
      return unlockInfo && !unlockInfo.unlocked;
    }).map(course => ({
      ...course,
      unlockInfo: courseUnlockStatus.get(course.id)!
    })).sort((a, b) => {
      // Sort by unlock date (earliest first)
      if (!a.unlockInfo.unlocksAt) return 1;
      if (!b.unlockInfo.unlocksAt) return -1;
      return a.unlockInfo.unlocksAt.getTime() - b.unlockInfo.unlocksAt.getTime();
    });
  }, [courses, courseUnlockStatus]);

  // Get last accessed module
  const lastModule = lastAccessedModule ? MODULES.find(m => m.id === lastAccessedModule) : null;

  const handleModuleClick = (id: number) => {
    if (!hasModuleAccess(membershipTier, id)) {
      const module = MODULES.find((item) => item.id === id);
      const requiredTier = module ? getTierLabel(module.minTier) : 'een hoger pakket';

      toast({
        title: 'Module vergrendeld',
        description: `Upgrade naar ${requiredTier} om deze module te openen.`,
      });
      return;
    }

    // Track module view behavior
    if (user?.id) {
      trackUserBehavior({
        userId: user.id,
        moduleId: id,
        action: 'view',
        timestamp: new Date()
      });
    }
    
    setSelectedModuleId(id);
    saveLastAccessed(id);
    setAiResult(null);
  };

  const handleModuleAISubmit = (moduleId: number) => {
    // Track module start behavior
    if (user?.id) {
      trackUserBehavior({
        userId: user.id,
        moduleId: moduleId,
        action: 'start',
        timestamp: new Date()
      });
    }
    
    const inputElement = document.getElementById(`module${moduleId}-input`) as HTMLInputElement | HTMLTextAreaElement;
    if (!inputElement || !inputElement.value.trim()) return;

    const userInput = inputElement.value;

    startTransition(async () => {
        try {
            if (moduleId === 4) { // Chat simulation
                setChatHistory(prev => [...prev, {role: 'user', text: userInput}]);
                inputElement.value = "";
                await new Promise(res => setTimeout(res, 1000));
                const aiResponse = `Dat klinkt geweldig! Ik ben zelf ook een groot fan van [onderwerp gerelateerd aan user input]. Wat vind je het leukste aan ${userInput.split(" ").pop()}?`;
                setChatHistory(prev => [...prev, {role: 'ai', text: aiResponse}]);
            } else {
                const module = MODULES.find(m => m.id === moduleId);
                const result = await getModuleAIFeedback(
                    moduleId,
                    userInput,
                    module?.title,
                    module?.description
                );
                setAiResult(result);
            }
        } catch (error) {
            console.error('Error getting AI feedback:', error);
            toast({
                title: "Fout",
                description: "Kon geen AI feedback genereren. Probeer het opnieuw.",
                variant: "destructive"
            });
        }
    });
  }

  const handleBack = () => {
    setSelectedModuleId(null);
    setAiResult(null);
    setChatHistory([{
        role: 'ai', text: 'Hoi! Ik zie op je foto dat je van reizen houdt, tof! Wat is de mooiste plek waar je ooit bent geweest?'
    }]);
  };

  // If a module is selected, show the module detail view
  if (selectedModuleId) {
    const module = MODULES.find(m => m.id === selectedModuleId);
    if (!module) return null;

    const detailedCourse = module.detailedCourseId
      ? DETAILED_COURSES.find((course) => course.id === module.detailedCourseId)
      : undefined;
    const detailedSection = module.sectionId
      ? detailedCourse?.sections.find((section) => section.id === module.sectionId)
      : undefined;

    const renderInput = () => {
        const commonProps = {
            id: `module${module.id}-input`,
            className: "w-full bg-secondary border-border/80 rounded-lg p-3 mb-2 focus:ring-primary focus:border-primary",
        };
        switch (module.id) {
            case 2: case 3: case 5: case 6:
                return <Textarea {...commonProps} rows={4} placeholder={module.id === 2 ? "Ik ben een goede luisteraar..." : "Typ hier je tekst..."} />;
            case 4:
                return (
                    <>
                        <div className="mb-2 h-64 overflow-y-auto rounded-lg bg-background p-4" id="module4-chatbox">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Input {...commonProps} placeholder="Typ je antwoord..." />
                    </>
                )
            default:
                return <Input {...commonProps} placeholder="Typ hier je tekst..."/>;
        }
    }

    const renderLesson = (lesson: CourseLesson) => {
      const iconName = LESSON_TYPE_ICONS[lesson.type] ?? 'BookOpen';
      const IconComponent = getLucideIcon(iconName) ?? Lucide.BookOpen;

      return (
        <div key={lesson.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <IconComponent className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <span className="font-semibold">{lesson.title}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {lesson.type}
                </span>
              </div>
              <p className="text-sm text-foreground">{lesson.description}</p>
              {lesson.bullets && (
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {lesson.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {lesson.downloads && (
                <div className="space-y-1 text-sm text-primary">
                  {lesson.downloads.map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <Lucide.Download className="h-4 w-4" />
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderDetailedSection = (section: CourseSection) => (
      <div className="space-y-6">
        {detailedCourse && (
          <div className="rounded-lg bg-background/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{detailedCourse.title}</p>
            <p className="text-sm text-muted-foreground">{detailedCourse.summary}</p>
          </div>
        )}
        <div className="rounded-lg bg-background/60 p-4">
          <p className="text-sm text-muted-foreground">{section.description}</p>
        </div>
        <div className="space-y-4">
          {section.lessons.map(renderLesson)}
        </div>
        {section.exercises && section.exercises.length > 0 && (
          <div className="rounded-lg bg-secondary/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lucide.Pencil className="h-4 w-4" />
              <span>Opdrachten</span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {section.exercises.map((exercise) => (
                <li key={exercise}>{exercise}</li>
              ))}
            </ul>
          </div>
        )}
        {section.downloads && section.downloads.length > 0 && (
          <div className="rounded-lg bg-secondary/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lucide.FileDown className="h-4 w-4" />
              <span>Downloads</span>
            </div>
            <ul className="space-y-1 text-sm text-primary">
              {section.downloads.map((download) => (
                <li key={download} className="flex items-center gap-2">
                  <Lucide.Download className="h-4 w-4" />
                  {download}
                </li>
              ))}
            </ul>
          </div>
        )}
        {section.interactive && (
          <div className="rounded-lg bg-primary/5 p-4">
            <div className="flex items-start gap-2">
              <Lucide.Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm text-foreground">{section.interactive}</p>
            </div>
          </div>
        )}
        {section.quiz && (
          <div className="rounded-lg bg-secondary/60 p-4">
            <div className="flex items-start gap-2 text-sm text-foreground">
              <Lucide.Gamepad2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Quiz</p>
                <p className="text-sm text-muted-foreground">{section.quiz}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    return (
        <div>
            <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2 text-sm font-semibold text-primary hover:text-primary">
                <Lucide.ArrowLeft /> Terug naar overzicht
            </Button>
            <Card className="bg-secondary/50 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="mb-1 text-2xl font-bold">Module {module.id}: {module.title}</h2>
                    <p className="text-muted-foreground">{module.theme}</p>
                  </div>
                  <Button 
                    variant={completedModules.includes(module.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleModuleCompletion(module.id)}
                  >
                    {completedModules.includes(module.id) ? (
                      <>
                        <Lucide.Check className="mr-2 h-4 w-4" /> Voltooid
                      </>
                    ) : (
                      "Markeer als voltooid"
                    )}
                  </Button>
                </div>
                {detailedSection ? (
                  renderDetailedSection(detailedSection)
                ) : (
                  <>
                    <h4 className="mb-2 text-lg font-semibold">Video</h4>
                    <div className="aspect-video mb-6 flex items-center justify-center rounded-lg bg-black text-muted-foreground">
                      <Lucide.PlayCircle className="h-16 w-16" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold">AI-Interactie</h4>
                    <p className="mb-4 text-sm text-muted-foreground">
                        {module.id === 1 && "Spreek of typ 5 kernwoorden in die jou omschrijven. De AI maakt er een korte, positieve samenvatting van."}
                        {module.id === 2 && "Schrijf hier 5-10 positieve eigenschappen van jezelf. De coach geeft je een tip hoe je dit subtiel in je profiel kunt verwerken."}
                        {module.id === 3 && "Plak je huidige profieltekst (of een concept). De AI herschrijft het om het aantrekkelijker te maken, met behoud van jouw unieke stem."}
                        {module.id === 4 && "Oefen een gesprek. De AI speelt de rol van je match. Probeer het gesprek gaande te houden!"}
                        {module.id === 5 && "Beschrijf een (denkbeeldige) situatie tijdens een date die je lastig vindt. De coach geeft je een tip hoe je dit bespreekbaar kunt maken."}
                        {module.id === 6 && "Beschrijf kort hoe jouw ideale week met een partner eruitziet. De coach helpt je dit te vertalen naar concrete, kleine stappen voor je volgende date."}
                    </p>
                    {renderInput()}
                    <Button onClick={() => handleModuleAISubmit(module.id)} disabled={isPending} className="mt-2 w-full bg-blue-600 hover:bg-blue-700">
                        {isPending ? <LoadingSpinner /> : "Vraag de AI Coach"}
                    </Button>
                    <div className="mt-6">
                        {isPending && module.id !== 4 && <div className="flex justify-center"><LoadingSpinner/></div>}
                        {aiResult && (
                            <div className="rounded-lg border bg-card p-4">
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                                            ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                            em: ({ children }) => <em className="italic">{children}</em>,
                                        }}
                                    >
                                        {aiResult}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                  </>
                )}
            </Card>
        </div>
    );
  }

  // Main overview with both original modules and database courses
  return (
    <div className="space-y-12">
      {/* Bookmarked Courses Section */}
      {bookmarkedCoursesList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Jouw bladwijzers</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
              }}
            >
              Bekijk alle
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookmarkedCoursesList.map((course) => (
              <div key={`bookmarked-course-${course.id}`} className="relative">
                <Link href={`/courses/${course.id}`}>
                  <ContentCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail_url={course.thumbnail_url}
                    level={course.level}
                    duration_hours={course.duration_hours}
                    is_free={course.is_free}
                    price={course.price}
                    module_count={course.module_count}
                    lesson_count={course.lesson_count}
                    type="course"
                  />
                </Link>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCourseBookmark(course.id);
                  }}
                >
                  <Lucide.Bookmark className="h-4 w-4 fill-primary text-primary" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Where You Left Off */}
      {lastModule && !completedModules.includes(lastModule.id) && (
        <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
          <h3 className="mb-2 text-2xl font-bold">Doorgaan waar je gebleven was</h3>
          <p className="mb-4 text-muted-foreground">Je was laatst bezig met module {lastModule.id}: {lastModule.title}</p>
          <Button onClick={() => handleModuleClick(lastModule.id)}>
            Ga verder met {lastModule.title}
          </Button>
        </div>
      )}

      {/* Recommended Courses Section */}
      {recommendedCourses.length > 0 && (
        <div>
          <h3 className="mb-2 text-2xl font-bold">Voor jou aanbevolen</h3>
          <p className="mb-6 text-muted-foreground">Op basis van jouw profiel hebben we deze cursussen voor je geselecteerd.</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedCourses.map((course) => (
              <Link key={`recommended-course-${course.id}`} href={`/courses/${course.id}`}>
                <ContentCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnail_url={course.thumbnail_url}
                  level={course.level}
                  duration_hours={course.duration_hours}
                  is_free={course.is_free}
                  price={course.price}
                  module_count={course.module_count}
                  lesson_count={course.lesson_count}
                  type="course"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-secondary/50 p-6 rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Zoeken & Filteren</h3>
            {(searchQuery || selectedLevel !== 'all' || selectedPriceFilter !== 'all' || selectedSort !== 'recommended') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('all');
                  setSelectedPriceFilter('all');
                  setSelectedSort('recommended');
                }}
                className="gap-2"
              >
                <Lucide.X className="h-4 w-4" />
                Reset filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Zoek modules en cursussen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Alle niveaus</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Gemiddeld</option>
                <option value="advanced">Gevorderd</option>
              </select>
            </div>
            <div>
              <select
                value={selectedPriceFilter}
                onChange={(e) => setSelectedPriceFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Alle prijzen</option>
                <option value="free">Gratis</option>
                <option value="paid">Betaald</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lucide.SlidersHorizontal className="h-4 w-4" />
              <span>Sorteer op:</span>
            </div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="recommended">Aanbevolen</option>
              <option value="newest">Nieuwste eerst</option>
              <option value="price-low">Prijs: laag naar hoog</option>
              <option value="price-high">Prijs: hoog naar laag</option>
              <option value="duration-short">Duur: kort naar lang</option>
              <option value="duration-long">Duur: lang naar kort</option>
            </select>
            <div className="text-sm text-muted-foreground sm:ml-auto">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'cursus' : 'cursussen'} gevonden
            </div>
          </div>
          {/* Active Filter Tags */}
          {(searchQuery || selectedLevel !== 'all' || selectedPriceFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Actieve filters:</span>
              {searchQuery && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  <Lucide.Search className="h-3 w-3" />
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <Lucide.X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedLevel !== 'all' && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  <span>
                    {selectedLevel === 'beginner' ? 'Beginner' : selectedLevel === 'intermediate' ? 'Gemiddeld' : 'Gevorderd'}
                  </span>
                  <button
                    onClick={() => setSelectedLevel('all')}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <Lucide.X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedPriceFilter !== 'all' && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  <span>{selectedPriceFilter === 'free' ? 'Gratis' : 'Betaald'}</span>
                  <button
                    onClick={() => setSelectedPriceFilter('all')}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <Lucide.X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-secondary/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Je Voortgang</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Lucide.CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>{completedModules.length} van {MODULES.length} modules voltooid.</span>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(completedModules.length / MODULES.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {showStarterResources && (
        <div className="mb-12">
          <h3 className="mb-2 text-2xl font-bold">Gratis starterscursussen</h3>
          <p className="mb-6 text-muted-foreground">
            Voor iedereen toegankelijk om direct waarde te bieden en vertrouwen op te bouwen.
          </p>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lucide.CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                {completedStarters.length} van {FREE_STARTER_RESOURCES.length} starters voltooid.
              </span>
            </div>
            {completedStarters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={resetStarterProgress}>
                Reset voortgang
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FREE_STARTER_RESOURCES.map((resource) => {
              const IconComponent =
                getLucideIcon(STARTER_RESOURCE_ICONS[resource.format]) ?? Lucide.HelpCircle;
              const formatLabel = STARTER_RESOURCE_LABELS[resource.format];
              const courseId = STARTER_RESOURCE_COURSE_MAP[resource.id];
              const href = courseId ? `/dashboard/starter/${resource.id}` : undefined;
              const starterCompleted = completedStarters.includes(resource.id);

              const card = (
                <Card
                  className={`h-full transition-all bg-secondary/80 ${
                    starterCompleted ? 'border border-green-300 bg-green-50/60' : ''
                  } ${
                    href ? 'cursor-pointer hover:bg-secondary hover:-translate-y-1' : 'cursor-default'
                  }`}
                >
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">{resource.title}</h4>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          {formatLabel}
                        </span>
                      </div>
                    </div>
                      {starterCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          <Lucide.Check className="h-3 w-3" />
                          Voltooid
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    <span
                      className={`inline-flex items-center gap-2 text-xs font-semibold ${
                        href ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {href ? (
                        <>
                          <Lucide.ExternalLink className="h-3 w-3" />
                          <span>Open modulepagina</span>
                        </>
                      ) : (
                        <>
                          <Lucide.Info className="h-3 w-3" />
                          <span>Bekijk direct</span>
                        </>
                      )}
                    </span>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant={starterCompleted ? 'default' : 'outline'}
                        className="w-full"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleStarterCompletion(resource.id);
                        }}
                      >
                        {starterCompleted ? 'Markeer als ongedaan' : 'Markeer als voltooid'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );

              return href ? (
                <Link key={resource.id} href={href} className="block">
                  {card}
                </Link>
              ) : (
                <div key={resource.id}>{card}</div>
              );
            })}
          </div>
        </div>
      )}

      {showMembershipModules && (
        <div>
          <h3 className="mb-2 text-2xl font-bold">Jouw programma per lidmaatschap</h3>
          <p className="mb-6 text-muted-foreground">
            Huidig abonnement: {membershipLabel}. Verken alle stappen van het traject; vergrendelde modules tonen waar een upgrade extra verdieping biedt.
          </p>
        {!hasModuleMatches ? (
          <div className="text-center py-8">
            <Lucide.HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Geen modules gevonden die voldoen aan je zoekcriteria.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {courseSections
              .filter((section) => section.modules.length > 0)
              .map(({ course, modules }) => {
                const courseLocked = isCourseLocked(membershipTier, course.id);

                return (
                  <div key={course.id} className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-xl font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                          Vanaf {getTierLabel(course.minTier)}
                        </span>
                        {courseLocked && (
                          <Link href="/select-package" className="text-sm font-semibold text-primary hover:underline">
                            Upgrade voor toegang
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {modules.map((module) => {
                        const locked = !hasModuleAccess(membershipTier, module.id);
                        return (
                          <ContentCard
                            key={`module-${module.id}`}
                            id={module.id}
                            title={`${module.id}. ${module.title}`}
                            description={module.theme}
                            type="module"
                            iconName={module.icon}
                            isCompleted={completedModules.includes(module.id)}
                            isLocked={locked}
                            requiredTierLabel={getTierLabel(module.minTier)}
                            onClick={() => handleModuleClick(module.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        </div>
      )}

      {showFeatureOverview && (
        <div className="mt-12">
          <h3 className="mb-2 text-2xl font-bold">Clubfeatures & upgrades</h3>
          <p className="mb-6 text-muted-foreground">
            Dit zit nu in je pakket ({membershipLabel}). Bekijk ook wat er wacht in hogere memberships.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureAccess.available.map((feature) => renderFeatureCard(feature, false))}
            {featureAccess.locked.map((feature) => renderFeatureCard(feature, true))}
          </div>
        </div>
      )}

      {/* Database Courses Section */}
      {showDatabaseCourses && (
        <div>
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Extra cursussen</h3>
              {bookmarkedCoursesList.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {bookmarkedCoursesList.length} bladwijzer{bookmarkedCoursesList.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="mb-6 text-muted-foreground">
              Ontdek extra cursussen om je dating vaardigheden verder te ontwikkelen.
            </p>

            {coursesLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : coursesError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{coursesError}</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <Lucide.BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery || selectedLevel !== 'all'
                    ? 'Geen cursussen gevonden die voldoen aan je zoekcriteria.'
                    : 'Binnenkort beschikbaar...'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <div key={`course-${course.id}`} className="relative">
                    <Link href={`/courses/${course.id}`}>
                      <ContentCard
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        thumbnail_url={course.thumbnail_url}
                        level={course.level}
                        duration_hours={course.duration_hours}
                        is_free={course.is_free}
                        price={course.price}
                        module_count={course.module_count}
                        lesson_count={course.lesson_count}
                        type="course"
                        isCompleted={completedModules.includes(course.id)}
                      />
                    </Link>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleCourseBookmark(course.id);
                      }}
                    >
                      <Lucide.Bookmark
                        className={`h-4 w-4 ${bookmarkedCourses.includes(course.id) ? 'fill-primary text-primary' : ''}`}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Locked Courses Section (Coming Soon) */}
            {lockedCourses.length > 0 && (
              <div className="mt-12 border-t pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Binnenkort beschikbaar</h3>
                  {nextUnlockDate && (
                    <span className="text-sm text-muted-foreground">
                      Volgende cursus: {formatUnlockDate(nextUnlockDate)}
                    </span>
                  )}
                </div>
                <p className="mb-6 text-muted-foreground">
                  Deze cursussen worden progressief ontgrendeld gedurende je lidmaatschap. Blijf actief voor maximaal leervoordeel!
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {lockedCourses.map((course) => (
                    <div key={`locked-course-${course.id}`} className="relative">
                      <Card className="h-full bg-secondary/50 border-dashed border-amber-200">
                        <CardContent className="flex flex-col p-6 h-full">
                          {/* Thumbnail or icon */}
                          {course.thumbnail_url ? (
                            <div className="mb-4 aspect-video rounded-lg overflow-hidden opacity-60 grayscale">
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 opacity-60">
                              <Lucide.Lock className="text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {formatUnlockDate(course.unlockInfo.unlocksAt)}
                              </span>
                              {course.level && (
                                <span className="inline-block bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded-full">
                                  {course.level === 'beginner' ? 'Beginner' : course.level === 'intermediate' ? 'Gemiddeld' : 'Gevorderd'}
                                </span>
                              )}
                            </div>

                            <h4 className="text-lg font-bold mb-2 text-muted-foreground">{course.title}</h4>

                            {course.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 opacity-75">
                                {course.description}
                              </p>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="space-y-2 mt-4 opacity-60">
                            {course.module_count && course.lesson_count && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lucide.BookOpen className="h-4 w-4" />
                                <span>{course.module_count} modules • {course.lesson_count} lessen</span>
                              </div>
                            )}

                            {course.duration_hours !== undefined && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lucide.Clock className="h-4 w-4" />
                                <span>{course.duration_hours} uur</span>
                              </div>
                            )}
                          </div>

                          {/* Lock overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-sm rounded-lg">
                            <Lucide.Lock className="h-6 w-6 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">
                              {formatUnlockDate(course.unlockInfo.unlocksAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}