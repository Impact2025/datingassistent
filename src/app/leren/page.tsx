"use client";

import { Suspense } from 'react';



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Star,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail?: string;
  isRecommended?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'exercise';
  duration: string;
  completed: boolean;
  isNext?: boolean;
}

function LerenPageContent() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const courses: Course[] = [
    {
      id: 'profile-mastery',
      title: 'Profiel Mastery',
      description: 'Leer hoe je een onweerstaanbaar dating profiel maakt',
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      estimatedTime: '2 uur',
      difficulty: 'beginner',
      category: 'Profiel',
      isRecommended: true,
    },
    {
      id: 'conversation-skills',
      title: 'Gespreksvaardigheden',
      description: 'Master de kunst van betekenisvolle gesprekken',
      progress: 40,
      totalLessons: 15,
      completedLessons: 6,
      estimatedTime: '3 uur',
      difficulty: 'intermediate',
      category: 'Communicatie',
    },
    {
      id: 'red-flags',
      title: 'Rode Vlaggen Herkennen',
      description: 'Bescherm jezelf en maak betere keuzes',
      progress: 100,
      totalLessons: 8,
      completedLessons: 8,
      estimatedTime: '1.5 uur',
      difficulty: 'beginner',
      category: 'Veiligheid',
    },
    {
      id: 'date-planning',
      title: 'Date Planning Pro',
      description: 'Plan onvergetelijke dates die indruk maken',
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      estimatedTime: '2.5 uur',
      difficulty: 'intermediate',
      category: 'Dating',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gray-100 text-gray-700';
      case 'intermediate': return 'bg-coral-100 text-coral-700';
      case 'advanced': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '🏆';
      default: return '📚';
    }
  };

  const todayLesson = {
    id: 'profile-photos',
    title: 'De Perfecte Profielfoto',
    description: 'Leer welke foto\'s werken en waarom',
    type: 'video' as const,
    duration: '15 min',
    course: 'Profiel Mastery',
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Leren</h1>
            <p className="text-sm text-gray-600">Word een dating expert</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Today's Lesson Card */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-coral-600" />
              <Badge className="bg-coral-100 text-coral-700">Aanbevolen voor vandaag</Badge>
            </div>
            <CardTitle className="text-lg">{todayLesson.title}</CardTitle>
            <p className="text-sm text-gray-600">{todayLesson.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  {todayLesson.duration}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {todayLesson.course}
                </div>
              </div>
            </div>
            <Button className="w-full bg-coral-500 hover:bg-coral-600">
              <Play className="w-4 h-4 mr-2" />
              Start Les
            </Button>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Jouw Cursussen</h2>
          <div className="space-y-4">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-white"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        {course.isRecommended && (
                          <Badge className="bg-coral-100 text-coral-700 text-xs">
                            🔥 Populair
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.description}</p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {course.completedLessons}/{course.totalLessons} lessen
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.estimatedTime}
                        </div>
                        <Badge className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                          {getDifficultyIcon(course.difficulty)} {course.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Voortgang</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  {/* Action Button */}
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-coral-200 text-coral-700 hover:bg-coral-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/courses/${course.id}`);
                      }}
                    >
                      {course.progress === 0 ? 'Start Cursus' :
                       course.progress === 100 ? 'Herhaal Cursus' : 'Ga Verder'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Stats */}
        <Card className="bg-white border-0">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Jouw Leer Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-xs text-gray-600">Lessen voltooid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-coral-600">8</div>
                <div className="text-xs text-gray-600">Cursussen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">15h</div>
                <div className="text-xs text-gray-600">Leertijd</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
export default function LerenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500" />
      </div>
    }>
      <LerenPageContent />
    </Suspense>
  );
}
