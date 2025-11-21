'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  CheckCircle,
  Lock,
  Star,
  Users,
  BookOpen
} from 'lucide-react';
import { DetailedCourse } from '@/lib/data';

interface MobileCourseCardProps {
  course: DetailedCourse;
  isUnlocked: boolean;
  progress?: number;
  onStartCourse: (courseId: string, sectionId?: string) => void;
  userTier: 'free' | 'sociaal' | 'core' | 'pro' | 'premium';
}

export function MobileCourseCard({
  course,
  isUnlocked,
  progress = 0,
  onStartCourse,
  userTier
}: MobileCourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'sociaal': return 'bg-blue-100 text-blue-800';
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedLessons = Math.floor((progress / 100) * course.sections.length);
  const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);

  return (
    <Card className="w-full mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg leading-tight line-clamp-2">
                {course.title}
              </CardTitle>
              <Badge className={getTierColor(course.accessTier)} variant="secondary">
                {course.accessTier}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.sections.length} modules</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.level}</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
              {course.summary}
            </p>

            {/* Progress bar for unlocked courses */}
            {isUnlocked && progress > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Voortgang</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {completedLessons} van {course.sections.length} modules voltooid
                </p>
              </div>
            )}
          </div>

          {/* Expand/Collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isUnlocked ? (
            <Button
              onClick={() => onStartCourse(course.id)}
              className="flex-1"
              size="sm"
            >
              {progress > 0 ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Verdergaan
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Cursus
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled
              className="flex-1"
              size="sm"
              variant="outline"
            >
              <Lock className="h-4 w-4 mr-2" />
              Vergrendeld
            </Button>
          )}

          {!isUnlocked && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* Handle upgrade */}}
            >
              <Star className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Expanded content */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Course format and language */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Format:</span>
                <p className="text-gray-600">{course.format}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Taal:</span>
                <p className="text-gray-600">{course.language}</p>
              </div>
            </div>

            {/* Course sections */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cursus Inhoud:</h4>
              <div className="space-y-2">
                {course.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">
                          {section.emoji} {section.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {section.lessons.length} lessen
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {section.description}
                      </p>

                      {/* Lesson types */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.from(new Set(section.lessons.map(l => l.type))).map(type => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type === 'video' && '🎬'}
                            {type === 'audio' && '🎧'}
                            {type === 'lesson' && '📖'}
                            {type === 'exercise' && '✏️'}
                            {type === 'interactive' && '🎮'}
                            {type === 'quiz' && '❓'}
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Section action */}
                    {isUnlocked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStartCourse(course.id, section.id)}
                        className="flex-shrink-0"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {course.sections.length}
                </div>
                <div className="text-xs text-gray-600">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {totalLessons}
                </div>
                <div className="text-xs text-gray-600">Lessen</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {course.sections.filter(s => s.exercises?.length || s.interactive || s.quiz).length}
                </div>
                <div className="text-xs text-gray-600">Met Opdrachten</div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Mobile-optimized course grid
export function MobileCourseGrid({
  courses,
  unlockedCourses,
  userProgress,
  onStartCourse,
  userTier
}: {
  courses: DetailedCourse[];
  unlockedCourses: string[];
  userProgress: Record<string, number>;
  onStartCourse: (courseId: string, sectionId?: string) => void;
  userTier: 'free' | 'sociaal' | 'core' | 'pro' | 'premium';
}) {
  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <MobileCourseCard
          key={course.id}
          course={course}
          isUnlocked={unlockedCourses.includes(course.id)}
          progress={userProgress[course.id] || 0}
          onStartCourse={onStartCourse}
          userTier={userTier}
        />
      ))}
    </div>
  );
}