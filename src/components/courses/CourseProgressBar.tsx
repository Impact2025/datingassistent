'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toSentenceCase } from '@/lib/utils';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Award,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';

interface CourseProgress {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  last_accessed_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  duration_hours: number;
  thumbnail_url?: string;
}

interface ModuleProgress {
  id: number;
  title: string;
  position: number;
  lessons_completed: number;
  total_lessons: number;
  progress_percentage: number;
}

interface CourseProgressBarProps {
  courseId: number;
  userId: number;
  showDetails?: boolean;
  compact?: boolean;
  onContinue?: () => void;
}

export function CourseProgressBar({
  courseId,
  userId,
  showDetails = false,
  compact = false,
  onContinue
}: CourseProgressBarProps) {
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, [courseId, userId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch course progress and detailed module progress
      const [progressResponse, detailsResponse] = await Promise.all([
        fetch(`/api/courses/${courseId}/progress`),
        fetch(`/api/courses/${courseId}/progress/details`)
      ]);

      if (!progressResponse.ok || !detailsResponse.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const progressData = await progressResponse.json();
      const detailsData = await detailsResponse.json();

      setCourseProgress(progressData);
      setCourse(detailsData.course);
      setModules(detailsData.modules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage === 100) return { label: 'Voltooid', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (percentage > 0) return { label: 'Bezig', color: 'bg-blue-100 text-blue-800', icon: Play };
    return { label: 'Niet begonnen', color: 'bg-gray-100 text-gray-800', icon: Clock };
  };

  const getLevelText = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Gevorderd';
      case 'advanced': return 'Expert';
      default: return level;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Zojuist';
    if (diffInHours < 24) return `${diffInHours} uur geleden`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dagen geleden`;
    return date.toLocaleDateString('nl-NL');
  };

  if (loading) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !courseProgress || !course) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{error || 'Kon voortgang niet laden'}</p>
        </CardContent>
      </Card>
    );
  }

  const status = getProgressStatus(courseProgress.progress_percentage);
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium truncate">{toSentenceCase(course.title)}</h4>
            <Badge className={`${status.color} text-xs`}>
              {courseProgress.progress_percentage}%
            </Badge>
          </div>

          <Progress
            value={courseProgress.progress_percentage}
            className="h-2"
          />

          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {status.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(courseProgress.last_accessed_at)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{toSentenceCase(course.title)}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{getLevelText(course.level)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours}h totaal</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Gestart {formatTimeAgo(courseProgress.enrolled_at)}</span>
              </div>
            </div>
          </div>

          <Badge className={`${status.color} flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Voortgang</span>
            <span className="text-sm text-muted-foreground">
              {courseProgress.progress_percentage}% compleet
            </span>
          </div>

          <Progress
            value={courseProgress.progress_percentage}
            className="h-3"
          />

          {courseProgress.completed_at && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Voltooid op {new Date(courseProgress.completed_at).toLocaleDateString('nl-NL')}</span>
            </div>
          )}
        </div>

        {/* Module Progress (if showDetails is true) */}
        {showDetails && modules.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Module voortgang
            </h4>

            <div className="space-y-3">
              {modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {module.position}. {module.title}
                    </span>
                    <span className="text-muted-foreground">
                      {module.lessons_completed}/{module.total_lessons} lessen
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Progress
                      value={module.progress_percentage}
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {module.progress_percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Laatst actief: {formatTimeAgo(courseProgress.last_accessed_at)}</span>
            </div>
          </div>

          {onContinue && courseProgress.progress_percentage < 100 && (
            <Button onClick={onContinue} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Doorgaan met cursus
            </Button>
          )}

          {courseProgress.progress_percentage === 100 && (
            <div className="flex items-center gap-2 text-green-600">
              <Award className="h-5 w-5" />
              <span className="font-medium">Cursus voltooid!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}