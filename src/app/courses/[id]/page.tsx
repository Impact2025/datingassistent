"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import * as Lucide from 'lucide-react';
import { toSentenceCase } from '@/lib/utils';

// SlidesViewer component
function SlidesViewer({ content }: { content: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  let slidesData;
  try {
    slidesData = JSON.parse(content);
  } catch (e) {
    return (
      <div className="bg-card p-6 rounded-lg border">
        <p className="text-muted-foreground">Fout bij het laden van slides</p>
      </div>
    );
  }

  if (!slidesData.slides || slidesData.slides.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg border">
        <p className="text-muted-foreground">Geen slides beschikbaar</p>
      </div>
    );
  }

  const slides = slidesData.slides;
  const currentSlideData = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Slide content */}
      <div className="p-8 min-h-[400px]">
        <div dangerouslySetInnerHTML={{ __html: currentSlideData.content }} />
      </div>

      {/* Navigation */}
      <div className="border-t bg-muted/50 p-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <Lucide.ChevronLeft className="h-4 w-4 mr-1" />
          Vorige
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} van {slides.length}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          Volgende
          <Lucide.ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  content: string | null;
  lesson_type: 'video' | 'audio' | 'text' | 'quiz' | 'assignment' | 'slides';
  video_url: string | null;
  video_duration: number | null;
  is_preview: boolean;
  position: number;
}

interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  position: number;
  lessons: Lesson[];
}

interface CourseData {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: string;
  duration_hours: number;
  is_free: boolean;
  price: number;
  modules: Module[];
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = (params?.id as string) || '';

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }

      const data = await response.json();
      setCourseData(data);

      // Automatically select the first lesson if available
      if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
        setSelectedLesson(data.modules[0].lessons[0]);
      }
    } catch (err) {
      setError('Kon cursus niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Lucide.Video className="h-4 w-4" />;
      case 'audio':
        return <Lucide.Headphones className="h-4 w-4" />;
      case 'text':
        return <Lucide.FileText className="h-4 w-4" />;
      case 'quiz':
        return <Lucide.HelpCircle className="h-4 w-4" />;
      case 'assignment':
        return <Lucide.ClipboardList className="h-4 w-4" />;
      case 'slides':
        return <Lucide.Presentation className="h-4 w-4" />;
      default:
        return <Lucide.FileText className="h-4 w-4" />;
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    // If it's a relative path (uploaded file), convert to absolute
    if (url.startsWith('/uploads/')) {
      return `${window.location.origin}${url}`;
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URLSearchParams(url.split('?')[1]).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // HeyGen - support both share links and direct video URLs
    if (url.includes('heygen.com')) {
      // HeyGen share links can be embedded directly
      return url;
    }

    // Direct video files (MP4, etc.)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }

    // Default - assume it's already an embed URL
    return url;
  };

  const getLessonMediaUrl = (url: string) => {
    if (url.startsWith('/uploads/')) {
      return `${window.location.origin}${url}`;
    }
    return url;
  };

  const renderLessonContent = () => {
    if (!selectedLesson) {
      return (
        <div className="text-center py-12">
          <Lucide.BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Selecteer een les om te beginnen
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
          {selectedLesson.description && (
            <p className="text-muted-foreground">{selectedLesson.description}</p>
          )}
        </div>

        {selectedLesson.lesson_type === 'video' && selectedLesson.video_url && (
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            {(selectedLesson.video_url.startsWith('/uploads/') ||
              selectedLesson.video_url.match(/\.(mp4|webm|ogg)$/i)) ? (
              <video
                src={getVideoEmbedUrl(selectedLesson.video_url)}
                className="w-full h-full"
                controls
                controlsList="nodownload"
              >
                Je browser ondersteunt deze video niet.
              </video>
            ) : (
              <iframe
                src={getVideoEmbedUrl(selectedLesson.video_url)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
          </div>
        )}

        {selectedLesson.lesson_type === 'audio' && selectedLesson.video_url && (
          <div className="rounded-lg border bg-card p-4">
            <audio
              src={getLessonMediaUrl(selectedLesson.video_url)}
              className="w-full"
              controls
              controlsList="nodownload"
            >
              Je browser ondersteunt deze audio niet.
            </audio>
          </div>
        )}

        {selectedLesson.lesson_type === 'text' && selectedLesson.content && (
          <div className="prose max-w-none">
            <div className="bg-card p-6 rounded-lg border">
              {selectedLesson.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {selectedLesson.lesson_type === 'audio' && selectedLesson.content && (
          <div className="prose max-w-none">
            <div className="bg-card p-6 rounded-lg border">
              {selectedLesson.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {selectedLesson.lesson_type === 'quiz' && (
          <div className="bg-card p-6 rounded-lg border">
            <p className="text-muted-foreground">Quiz functionaliteit komt binnenkort...</p>
          </div>
        )}

        {selectedLesson.lesson_type === 'assignment' && (
          <div className="bg-card p-6 rounded-lg border">
            <p className="text-muted-foreground">Opdracht functionaliteit komt binnenkort...</p>
          </div>
        )}

        {selectedLesson.lesson_type === 'slides' && selectedLesson.content && (
          <SlidesViewer content={selectedLesson.content} />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Cursus niet gevonden'}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Terug naar Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto p-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <Lucide.ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">{toSentenceCase(courseData.title)}</h1>
          {courseData.description && (
            <p className="text-muted-foreground">{courseData.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Course modules */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Cursus Inhoud</h3>
                {courseData.modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nog geen modules beschikbaar
                  </p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {courseData.modules.map((module, idx) => (
                      <AccordionItem key={module.id} value={`module-${module.id}`}>
                        <AccordionTrigger className="text-sm font-semibold">
                          {idx + 1}. {module.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          {module.description && (
                            <p className="text-xs text-muted-foreground mb-3">
                              {module.description}
                            </p>
                          )}
                          {module.lessons.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Nog geen lessen
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {module.lessons.map((lesson, lessonIdx) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`w-full text-left text-xs p-2 rounded flex items-center gap-2 transition-colors ${
                                    selectedLesson?.id === lesson.id
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-secondary'
                                  }`}
                                >
                                  {getLessonIcon(lesson.lesson_type)}
                                  <span className="flex-1">
                                    {lessonIdx + 1}. {lesson.title}
                                  </span>
                                  {lesson.is_preview && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                      Preview
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {renderLessonContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
