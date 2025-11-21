"use client";

import { useEffect, useMemo, useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AIResultCard } from '@/components/shared/ai-result-card';
import { QuizRenderer, type QuizData } from '@/components/quiz/quiz-renderer';
import { redFlagsIntroSlides } from '@/data/example-slides';
import { DatabaseSlidesViewer, type DatabaseSlidesData } from '@/components/slides/database-slides-viewer';

// Simple markdown to HTML converter for quiz content
function convertMarkdownToHTML(markdown: string): string {
  if (!markdown) return '';

  console.log('Original markdown length:', markdown.length);
  console.log('First 200 chars:', markdown.substring(0, 200));

  // Remove code block wrapper if present (from RichTextEditor)
  let cleanMarkdown = markdown;
  if (markdown.includes('<pre><code class="language-markdown">')) {
    console.log('Found code block wrapper, removing...');
    cleanMarkdown = markdown
      .replace(/<pre><code class="language-markdown">/g, '')
      .replace(/<\/code><\/pre>/g, '');
    console.log('After removal, first 200 chars:', cleanMarkdown.substring(0, 200));
  }

  // Check if already HTML (contains HTML tags that aren't pre/code)
  if (/<\/?(?!pre|code)[a-z][\s\S]*>/i.test(cleanMarkdown)) {
    console.log('Detected as HTML, returning as-is');
    return cleanMarkdown;
  }

  console.log('Processing as markdown...');

  let html = cleanMarkdown;

  // Convert paragraphs line by line first
  const lines = html.split('\n');
  const processed: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines completely
    if (!line) {
      continue;
    }

    // Convert headers
    if (line.startsWith('### ')) {
      processed.push(`<h3>${line.substring(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      processed.push(`<h2>${line.substring(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      processed.push(`<h1>${line.substring(2)}</h1>`);
      continue;
    }

    // Convert horizontal rules
    if (line === '---') {
      processed.push('<hr />');
      continue;
    }

    // Skip if already an HTML tag
    if (line.startsWith('<')) {
      processed.push(line);
      continue;
    }

    // Convert bold within the line
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Wrap in paragraph
    processed.push(`<p>${line}</p>`);
  }

  const result = processed.join('\n');
  console.log('Converted HTML length:', result.length);
  console.log('First 500 chars of result:', result.substring(0, 500));
  return result;
}
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useUser } from '@/providers/user-provider';
import { useToast } from '@/hooks/use-toast';
import {
  FREE_STARTER_RESOURCES,
  MEMBERSHIP_RANK,
  type DetailedCourse,
  type CourseLesson,
  type CourseSection,
  type StarterResource,
} from '@/lib/data';
import {
  normalizeMembershipTier,
  getTierLabel,
} from '@/lib/membership-access';

type StarterCourseDetailProps = {
  starterId: string;
  course: DetailedCourse;
  courseSlug?: string;
  dbCourse?: any;
  interactiveCoach?: React.ReactNode;
};

const STARTER_RESOURCE_ICONS: Record<StarterResource['format'], string> = {
  video: 'PlayCircle',
  email: 'Mail',
  audio: 'Headphones',
  infographic: 'BarChart3',
  worksheet: 'FileText',
  bundle: 'Layers',
};

const STARTER_RESOURCE_LABELS: Record<StarterResource['format'], string> = {
  video: 'Video',
  email: 'E-mailcursus',
  audio: 'Audio',
  infographic: 'Infographic',
  worksheet: 'Werkblad',
  bundle: 'Bundel',
};

const RedFlagsQuiz = dynamic(() => import('@/components/quiz/red-flags-quiz').then((mod) => mod.RedFlagsQuiz), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Quiz wordt geladen…
    </div>
  ),
});

const PreQuizTrueFalse = dynamic(() => import('@/components/quiz/pre-quiz-true-false'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Pre-quiz wordt geladen…
    </div>
  ),
});

const PostQuizComparison = dynamic(() => import('@/components/quiz/post-quiz-comparison'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Post-quiz wordt geladen…
    </div>
  ),
});

const KennisQuiz5Vs = dynamic(() => import('@/components/quiz/kennis-quiz-5vs'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Kennisquiz wordt geladen…
    </div>
  ),
});

const RedFlagsForumPostGenerator = dynamic(() => import('@/components/quiz/red-flags-forum-post-generator'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Forum post generator wordt geladen…
    </div>
  ),
});

const ObservationExercise = dynamic(() => import('@/components/quiz/observation-exercise'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Observatie-oefening wordt geladen…
    </div>
  ),
});

const SafetyForumGenerator = dynamic(() => import('@/components/quiz/safety-forum-generator'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Forum post generator wordt geladen…
    </div>
  ),
});

const ReflectionExercise = dynamic(() => import('@/components/quiz/reflection-exercise').then(mod => ({ default: mod.ReflectionExercise })), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Reflectie-oefening wordt geladen…
    </div>
  ),
});

const ProfileTransformationQuiz = dynamic(() => import('@/components/quiz/profile-transformation-quiz').then(mod => mod.ProfileTransformationQuiz), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Profieltransformatie quiz wordt geladen…
    </div>
  ),
});

const AIOptimizationForumGenerator = dynamic(() => import('@/components/quiz/ai-optimization-forum-generator'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      AI forum generator wordt geladen…
    </div>
  ),
});

const AuthenticityReflectionExercise = dynamic(() => import('@/components/quiz/authenticity-reflection-exercise').then(mod => mod.AuthenticityReflectionExercise), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Authenticiteit reflectie wordt geladen…
    </div>
  ),
});

const PhotoConfidenceReflection = dynamic(() => import('@/components/quiz/photo-confidence-reflection').then(mod => mod.PhotoConfidenceReflection), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Foto zelfvertrouwen reflectie wordt geladen…
    </div>
  ),
});

const AuthenticityDetectorQuiz = dynamic(() => import('@/components/quiz/authenticity-detector-quiz').then(mod => mod.AuthenticityDetectorQuiz), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Authenticiteit detector quiz wordt geladen…
    </div>
  ),
});

const SafetyBoundaryReflection = dynamic(() => import('@/components/quiz/safety-boundary-reflection').then(mod => mod.SafetyBoundaryReflection), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Veiligheid reflectie wordt geladen…
    </div>
  ),
});

const SelfConfidenceProgressTracker = dynamic(() => import('@/components/quiz/self-confidence-progress-tracker').then(mod => mod.SelfConfidenceProgressTracker), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Zelfvertrouwen tracker wordt geladen…
    </div>
  ),
});

const SlideViewer = dynamic(() => import('@/components/slides/slide-viewer'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Slides worden geladen…
    </div>
  ),
});

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

const BIO_TONES = [
  { id: 'vlot', label: 'Vlot', prompt: 'vlot, energiek en uitnodigend' },
  { id: 'grappig', label: 'Grappig', prompt: 'speels, humoristisch maar respectvol' },
  { id: 'charmant', label: 'Charmant', prompt: 'warm, charmant en licht flirterig' },
  { id: 'nuchter', label: 'Nuchter', prompt: 'nuchter, eerlijk en down-to-earth' },
] as const;

const getLucideIcon = (name?: string) => {
  if (!name) return null;
  const icons = Lucide as unknown as Record<string, (props: { className?: string }) => JSX.Element>;
  return icons[name] ?? null;
};

type ResponseMap = Record<string, string>;

const storageKey = (starterId: string) => `starter_${starterId}_responses`;

function LessonItem({ lesson }: { lesson: CourseLesson }) {
  const IconComponent = getLucideIcon(LESSON_TYPE_ICONS[lesson.type]) ?? Lucide.BookOpen;

  return (
    <div className="rounded-lg bg-background/40 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <IconComponent className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-2">
          <h5 className="text-sm font-semibold text-foreground">{lesson.title}</h5>
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
          {lesson.bullets && (
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {lesson.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
          {lesson.downloads && (
            <div className="space-y-1 text-sm">
              {lesson.downloads.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 text-primary">
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
}

function CourseSectionCard({
  section,
  responses,
  onChange,
  dbModule,
  interactiveCoach,
  isBioCourse,
  savingFields,
}: {
  section: CourseSection | null;
  responses: ResponseMap;
  onChange: (field: string, value: string) => void;
  dbModule?: any;
  interactiveCoach?: React.ReactNode;
  isBioCourse: boolean;
  savingFields: Set<string>;
}) {
  // State to track which lessons are expanded
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());

  // Toggle lesson expansion
  const toggleLesson = (lessonId: number) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  // Use database module data if available and no static section
  const title = dbModule?.title || section?.title || 'Module';
  const description = dbModule?.description || section?.description || '';
  const label = section?.label || 'MODULE';
  const emoji = section?.emoji;
  const moduleId = dbModule?.id || section?.id || 'unknown';

  return (
    <Card className="bg-secondary/80">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {emoji && <span className="text-lg">{emoji}</span>}
            <span>{label}</span>
          </div>
          <h4 className="text-lg font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>

          {/* Module Media from Database */}
          {dbModule && (
            <>
              {console.log('dbModule data:', {
                id: dbModule.id,
                title: dbModule.title,
                has_image: !!dbModule.image_url,
                has_video: !!dbModule.video_url,
                video_url: dbModule.video_url
              })}
            </>
          )}
          {dbModule && (dbModule.image_url || dbModule.video_url) && (
            <div className="mt-4">
              {dbModule.image_url && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={dbModule.image_url}
                    alt={dbModule.title}
                    className="w-full h-auto object-cover max-h-96"
                  />
                </div>
              )}
              {dbModule.video_url && (
                <div className="rounded-lg overflow-hidden border border-border aspect-video bg-black">
                  <video
                    key={dbModule.video_url}
                    src={dbModule.video_url}
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database Lessons */}
        {dbModule?.lessons && dbModule.lessons.length > 0 && (
          <div className="space-y-3">
            {dbModule.lessons.map((lesson: any) => {
              const isExpanded = expandedLessons.has(lesson.id);
              const hasLongContent = lesson.content && lesson.content.length > 150;
              const displayContent = hasLongContent && !isExpanded
                ? lesson.content.substring(0, 150) + '...'
                : lesson.content;
              const fieldKey = `lesson-${lesson.id}-response`;

              // Determine icon based on lesson type
              const LessonIcon = lesson.lesson_type === 'assignment' ? Lucide.Pencil :
                                lesson.lesson_type === 'quiz' ? Lucide.Gamepad2 :
                                lesson.lesson_type === 'video' ? Lucide.PlayCircle :
                                lesson.lesson_type === 'audio' ? Lucide.Headphones :
                                Lucide.BookOpen;

              return (
                <div key={lesson.id} className="rounded-lg bg-background/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <LessonIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h5 className="text-sm font-semibold text-foreground">{lesson.title}</h5>
                      {lesson.description && (
                        <p className="text-xs text-muted-foreground">{lesson.description}</p>
                      )}

                      {/* Quiz renderer for quiz lessons */}
                      {lesson.lesson_type === 'quiz' && (() => {
                        const titleLower = lesson.title.toLowerCase();

                        // Check if this is the pre-quiz based on title
                        const isPreQuiz = titleLower.includes('pre-quiz') ||
                                         titleLower.includes('hoe alert ben jij');

                        // Check if this is the post-quiz based on title
                        const isPostQuiz = titleLower.includes('post-quiz') ||
                                          titleLower.includes('meet je groei');

                        // Check if this is the kennisquiz based on title
                        const isKennisQuiz = titleLower.includes('kennisquiz') ||
                                            (titleLower.includes('de 5 v') && titleLower.includes('quiz'));

                        console.log('Quiz lesson detected:', {
                          title: lesson.title,
                          titleLower,
                          isPreQuiz,
                          isPostQuiz,
                          isKennisQuiz
                        });

                        if (isPreQuiz) {
                          return (
                            <div className="mt-3">
                              <PreQuizTrueFalse />
                            </div>
                          );
                        }

                        if (isPostQuiz) {
                          return (
                            <div className="mt-3">
                              <PostQuizComparison />
                            </div>
                          );
                        }

                        if (isKennisQuiz) {
                          return (
                            <div className="mt-3">
                              <KennisQuiz5Vs />
                            </div>
                          );
                        }

                        // For other quizzes, try to parse as JSON
                        if (!lesson.content) return null;

                        let quizData: any = null;
                        try {
                          quizData = JSON.parse(lesson.content);
                        } catch (e) {
                          try {
                            const cleanContent = lesson.content.replace(/<[^>]*>/g, '').trim();
                            quizData = JSON.parse(cleanContent);
                          } catch (e2) {
                            console.log('Quiz content is not valid JSON for lesson', lesson.id);
                            // For non-JSON quiz content, return null and let it render as text below
                            return null;
                          }
                        }

                        if (quizData && quizData.questions) {
                          return (
                            <div className="mt-3">
                              <QuizRenderer
                                quizData={quizData}
                                onFinished={(score) => {
                                  const percentage = quizData.questions.length > 0 ? score / quizData.questions.length : 0;
                                  if (percentage >= 0.8) {
                                    toast({
                                      title: 'Uitstekend!',
                                      description: 'Je hebt de stof goed onder de knie.',
                                    });
                                  } else if (percentage >= 0.6) {
                                    toast({
                                      title: 'Goed gedaan!',
                                      description: 'Je bent goed op weg. Herhaal de punten waar je minder zeker van was.',
                                    });
                                  }
                                }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Forum Post Generator for Red Flags Forum Discussion (Module 2) */}
                      {lesson.lesson_type === 'text' &&
                       lesson.title.toLowerCase().includes('forum discussie') &&
                       lesson.title.toLowerCase().includes('herkenning en groei') && (
                        <div className="mt-3">
                          <RedFlagsForumPostGenerator />
                        </div>
                      )}

                      {/* Forum Post Generator for Safety Forum Discussion (Module 1) */}
                      {lesson.lesson_type === 'text' &&
                       lesson.title.toLowerCase().includes('forum discussie') &&
                       lesson.title.toLowerCase().includes('veiligheid') && (
                        <div className="mt-3">
                          <SafetyForumGenerator />
                        </div>
                      )}

                      {/* Forum Post Generator for AI Optimization Discussion (Module 5) */}
                      {lesson.lesson_type === 'text' &&
                       lesson.title.toLowerCase().includes('forum discussie') &&
                       (lesson.title.toLowerCase().includes('ai') ||
                        lesson.title.toLowerCase().includes('optimalisatie')) && (
                        <div className="mt-3">
                          <AIOptimizationForumGenerator />
                        </div>
                      )}

                      {/* Text content for non-quiz lessons OR quiz lessons that couldn't be parsed */}
                      {lesson.lesson_type !== 'quiz' &&
                       lesson.content &&
                       !(lesson.lesson_type === 'text' &&
                         lesson.title.toLowerCase().includes('forum discussie') &&
                         (lesson.title.toLowerCase().includes('herkenning en groei') ||
                          lesson.title.toLowerCase().includes('veiligheid'))) && (
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                          </div>
                          {hasLongContent && (
                            <button
                              onClick={() => toggleLesson(lesson.id)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <Lucide.ChevronUp className="h-3 w-3" />
                                  Minder lezen
                                </>
                              ) : (
                                <>
                                  <Lucide.ChevronDown className="h-3 w-3" />
                                  Lees meer
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Video player for video lessons */}
                      {lesson.lesson_type === 'video' && lesson.video_url && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-border aspect-video bg-black">
                          <video
                            key={lesson.video_url}
                            src={lesson.video_url}
                            controls
                            controlsList="nodownload"
                            preload="metadata"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}

                      {/* Database Slides Viewer for slides lessons */}
                      {lesson.lesson_type === 'slides' && lesson.content && (() => {
                        try {
                          const slidesData: DatabaseSlidesData = JSON.parse(lesson.content);
                          if (slidesData && slidesData.slides && slidesData.slides.length > 0) {
                            return (
                              <div className="mt-3">
                                <DatabaseSlidesViewer slidesData={slidesData} />
                              </div>
                            );
                          }
                        } catch (e) {
                          console.error('Failed to parse slides data:', e);
                        }
                        return null;
                      })()}

                      {/* Slide Viewer for lessons with slides (legacy/example slides) */}
                      {(lesson.lesson_type === 'lesson' || lesson.lesson_type === 'video') &&
                       (lesson.title.toLowerCase().includes('waarom dit belangrijk is') ||
                        lesson.title.toLowerCase().includes('introduct') ||
                        lesson.title.toLowerCase().includes('de 5 v')) && (
                        <div className="mt-3">
                          <SlideViewer deck={redFlagsIntroSlides} />
                        </div>
                      )}

                      {/* Observation Exercise for Red Flags */}
                      {lesson.lesson_type === 'assignment' &&
                       lesson.title.toLowerCase().includes('observatie-oefening') && (
                        <div className="mt-3">
                          <ObservationExercise />
                        </div>
                      )}

                      {/* Reflection Exercise */}
                      {lesson.lesson_type === 'assignment' &&
                       lesson.title.toLowerCase().includes('reflectie') && (
                        <div className="mt-3">
                          <ReflectionExercise
                            onComplete={(answers, points) => {
                              // Save reflection answers
                              const reflectionData = JSON.stringify(answers);
                              onChange(fieldKey, reflectionData);
                              toast({
                                title: `${points} punten verdiend! 🎉`,
                                description: 'Je reflectie is opgeslagen.',
                              });
                            }}
                            initialAnswers={(() => {
                              try {
                                return responses[fieldKey] ? JSON.parse(responses[fieldKey]) : {};
                              } catch {
                                return {};
                              }
                            })()}
                          />
                        </div>
                      )}

                      {/* Authenticity Reflection Exercise for Zelfkennis module */}
                      {lesson.lesson_type === 'assignment' &&
                       (lesson.title.toLowerCase().includes('zelfkennis') ||
                        lesson.title.toLowerCase().includes('authenticiteit') ||
                        lesson.title.toLowerCase().includes('fundament')) && (
                        <div className="mt-3">
                          <AuthenticityReflectionExercise
                            onComplete={(answers, points) => {
                              // Save reflection answers
                              const reflectionData = JSON.stringify(answers);
                              onChange(fieldKey, reflectionData);
                              toast({
                                title: `${points} punten verdiend! 🎉`,
                                description: 'Je zelfkennis reflectie is opgeslagen.',
                              });
                            }}
                          />
                        </div>
                      )}

                      {/* Photo Confidence Reflection for Photography Course */}
                      {lesson.lesson_type === 'assignment' &&
                       (lesson.title.toLowerCase().includes('camera angst') ||
                        lesson.title.toLowerCase().includes('zelfvertrouwen') ||
                        lesson.title.toLowerCase().includes('voor de lens')) && (
                        <div className="mt-3">
                          <PhotoConfidenceReflection
                            onComplete={(answers, points) => {
                              const reflectionData = JSON.stringify(answers);
                              onChange(fieldKey, reflectionData);
                              toast({
                                title: `${points} punten verdiend! 📸`,
                                description: 'Je foto zelfvertrouwen reflectie is opgeslagen.',
                              });
                            }}
                          />
                        </div>
                      )}

                      {/* Authenticity Detector Quiz for Profile Text Course */}
                      {lesson.lesson_type === 'interactive' &&
                       (lesson.title.toLowerCase().includes('authenticiteit detector') ||
                        lesson.title.toLowerCase().includes('clichés herkennen') ||
                        lesson.title.toLowerCase().includes('verhaal vs algemeen')) && (
                        <div className="mt-3">
                          <AuthenticityDetectorQuiz
                            onComplete={(result) => {
                              const quizData = JSON.stringify(result);
                              onChange(fieldKey, quizData);
                              toast({
                                title: `Quiz voltooid! 🎯`,
                                description: `Je score: ${result.score}%. ${result.feedback}`,
                              });
                            }}
                          />
                        </div>
                      )}

                      {/* Safety Boundary Reflection for Red Flags Course */}
                      {lesson.lesson_type === 'assignment' &&
                       (lesson.title.toLowerCase().includes('grenzen') ||
                        lesson.title.toLowerCase().includes('veiligheid') ||
                        lesson.title.toLowerCase().includes('rode vlaggen reflectie')) && (
                        <div className="mt-3">
                          <SafetyBoundaryReflection
                            onComplete={(answers, points) => {
                              const reflectionData = JSON.stringify(answers);
                              onChange(fieldKey, reflectionData);
                              toast({
                                title: `${points} punten verdiend! 🛡️`,
                                description: 'Je veiligheid reflectie is opgeslagen.',
                              });
                            }}
                          />
                        </div>
                      )}

                      {/* Self-Confidence Progress Tracker for Confidence Course */}
                      {lesson.lesson_type === 'interactive' &&
                       (lesson.title.toLowerCase().includes('progress tracker') ||
                        lesson.title.toLowerCase().includes('dagelijkse monitoring') ||
                        lesson.title.toLowerCase().includes('zelfvertrouwen log')) && (
                        <div className="mt-3">
                          <SelfConfidenceProgressTracker
                            onEntryComplete={(entry) => {
                              const entryData = JSON.stringify(entry);
                              onChange(fieldKey, entryData);
                              toast({
                                title: 'Entry opgeslagen! 💪',
                                description: 'Je dagelijkse voortgang is bijgewerkt.',
                              });
                            }}
                          />
                        </div>
                      )}

                      {/* Assignment input field */}
                      {lesson.lesson_type === 'assignment' &&
                       !lesson.title.toLowerCase().includes('observatie-oefening') &&
                       !lesson.title.toLowerCase().includes('reflectie') && (
                        <div className="space-y-2 mt-3">
                          <Label htmlFor={fieldKey} className="text-xs font-medium">
                            Jouw antwoord:
                          </Label>
                          <Textarea
                            id={fieldKey}
                            value={responses[fieldKey] ?? ''}
                            onChange={(event) => onChange(fieldKey, event.target.value)}
                            rows={4}
                            className="resize-none text-sm"
                            placeholder="Typ hier je antwoord..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Static Lessons (fallback) */}
        {section && section.lessons && section.lessons.length > 0 && (!dbModule || !dbModule.lessons || dbModule.lessons.length === 0) && (
          <div className="space-y-3">
            {section.lessons.map((lesson) => {
              // Check for interactive elements in static lessons based on section ID and lesson content
              const isReflectionExercise = section.id === 'stap-1-kern' && lesson.title.toLowerCase().includes('wie ben jij echt');
              const isPreQuiz = section.id === 'intro-bio' && lesson.title.toLowerCase().includes('wat werkt wél');
              const isPostQuiz = section.id === 'stap-6-checklist' && lesson.title.toLowerCase().includes('klaar om live te gaan');
              const isProfileQuiz = lesson.id === 'profiel-kennis-quiz';

              return (
                <div key={lesson.id}>
                  <LessonItem lesson={lesson} />

                  {/* Profile Transformation Quiz */}
                  {isBioCourse && isProfileQuiz && (
                    <div className="mt-3">
                      <ProfileTransformationQuiz />
                    </div>
                  )}

                  {/* Render interactive elements for static lessons - only for profile text course */}
                  {isBioCourse && isReflectionExercise && (
                    <div className="mt-3">
                      <ReflectionExercise
                        onComplete={(answers, points) => {
                          const reflectionData = JSON.stringify(answers);
                          onChange(`lesson-${lesson.id}-response`, reflectionData);
                          toast({
                            title: `${points} punten verdiend! 🎉`,
                            description: 'Je reflectie is opgeslagen.',
                          });
                        }}
                        initialAnswers={(() => {
                          try {
                            return responses[`lesson-${lesson.id}-response`] ? JSON.parse(responses[`lesson-${lesson.id}-response`]) : {};
                          } catch {
                            return {};
                          }
                        })()}
                      />
                    </div>
                  )}

                  {/* Remove red flag quizzes from profile text course - they belong in red flags course */}
                  {/* {isBioCourse && isPreQuiz && (
                    <div className="mt-3">
                      <PreQuizTrueFalse />
                    </div>
                  )}

                  {isBioCourse && isPostQuiz && (
                    <div className="mt-3">
                      <PostQuizComparison />
                    </div>
                  )} */}
                </div>
              );
            })}
          </div>
        )}

        {section?.exercises && section.exercises.length > 0 && (
          <div className="rounded-lg bg-background/30 p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lucide.Pencil className="h-4 w-4" />
              <span>Oefeningen</span>
            </div>
            {section.exercises.map((item, index) => {
              const fieldKey = `${section.id}-exercise-${index}`;
              const isSaving = savingFields.has(fieldKey);
              const hasContent = responses[fieldKey] && responses[fieldKey].trim().length > 0;

              return (
                <div key={fieldKey} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{item}</p>
                  <Textarea
                    value={responses[fieldKey] ?? ''}
                    onChange={(event) => onChange(fieldKey, event.target.value)}
                    rows={4}
                    className="resize-none"
                    placeholder="Typ je antwoord..."
                  />
                  <div className="flex items-center gap-2 text-xs">
                    {isSaving ? (
                      <>
                        <Lucide.Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        <span className="text-blue-600">Opslaan...</span>
                      </>
                    ) : hasContent ? (
                      <>
                        <Lucide.CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Opgeslagen</span>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {section?.downloads && section.downloads.length > 0 && (
          <div className="rounded-lg bg-background/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lucide.Download className="h-4 w-4" />
              <span>Downloads</span>
            </div>
            <ul className="space-y-1 text-sm text-primary">
              {section.downloads.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Lucide.FileDown className="h-4 w-4" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {section?.interactive && !isBioCourse && (
          <div className="rounded-lg bg-background/30 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Lucide.Sparkles className="mt-1 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Interactieve opdracht</p>
                <p className="mt-1 text-sm text-muted-foreground">{section.interactive}</p>
              </div>
            </div>
            <Textarea
              value={responses[`${section.id}-interactive-notes`] ?? ''}
              onChange={(event) => onChange(`${section.id}-interactive-notes`, event.target.value)}
              rows={4}
              className="resize-none"
              placeholder="Noteer je inzichten of feedback"
            />
          </div>
        )}

        {/* Interactive Profile Coach for STAP 5 - AI Bio Generator with 3 variants */}
        {isBioCourse && section?.id === 'stap-5-ai' && interactiveCoach && (
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-900">
                <Lucide.Sparkles className="h-6 w-6" />
                <span className="text-lg font-bold uppercase tracking-wide">
                  AI Bio Generator - 3 Persoonlijke Varianten
                </span>
              </div>
              <p className="text-sm text-purple-700">
                Ontdek je ideale profieltekst door onze slimme vragenwizard! ✨ Genereer direct 3 unieke varianten gebaseerd op je antwoorden.
              </p>
              {interactiveCoach}
            </div>
          </div>
        )}

        {/* Database Quiz Lessons */}
        {dbModule?.lessons && dbModule.lessons.filter((l: any) => l.lesson_type === 'quiz').map((quizLesson: any) => {
          // Try to parse quiz content as JSON
          let quizData: QuizData | null = null;
          try {
            // First try direct parse
            quizData = JSON.parse(quizLesson.content);
          } catch (e) {
            try {
              // Try to extract JSON from HTML if wrapped in tags
              const cleanContent = quizLesson.content
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .trim();
              quizData = JSON.parse(cleanContent);
              console.log('Quiz JSON extracted from HTML wrapper');
            } catch (e2) {
              // If that also fails, content is probably old markdown format
              console.log('Quiz content is not JSON, falling back to markdown');
            }
          }

          return (
            <div key={quizLesson.id} className="rounded-lg bg-background/30 p-4 space-y-4">
              {quizData ? (
                // New quiz format with interactive questions
                <QuizRenderer
                  quizData={quizData}
                  onFinished={(score) => {
                    const percentage = quizData.questions.length > 0 ? score / quizData.questions.length : 0;
                    if (percentage >= 0.8) {
                      toast({
                        title: 'Uitstekend!',
                        description: 'Je hebt de stof goed onder de knie.',
                      });
                    } else if (percentage >= 0.6) {
                      toast({
                        title: 'Goed gedaan!',
                        description: 'Je bent goed op weg. Herhaal de punten waar je minder zeker van was.',
                      });
                    }
                  }}
                />
              ) : (
                // Fallback for old markdown format
                <>
                  <div className="flex items-start gap-2">
                    <Lucide.Gamepad2 className="mt-1 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{quizLesson.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{quizLesson.description}</p>
                    </div>
                  </div>
                  {quizLesson.content && (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground prose-hr:border-border"
                      dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(quizLesson.content) }}
                    />
                  )}
                  <Textarea
                    value={responses[`quiz-${quizLesson.id}-notes`] ?? ''}
                    onChange={(event) => onChange(`quiz-${quizLesson.id}-notes`, event.target.value)}
                    rows={3}
                    className="resize-none"
                    placeholder="Noteer je score of inzichten uit de quiz"
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Fallback to static quiz if no database quiz exists */}
        {section?.id === 'bonus-quiz' ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-background/30 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Lucide.Gamepad2 className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Quiz</p>
                  <p className="mt-1 text-sm text-muted-foreground">{section?.quiz}</p>
                </div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                <RedFlagsQuiz
                  onFinished={(score) => {
                    if (score >= 8) {
                      toast({
                        title: 'Sterke kennis!',
                        description: 'Je herkent de meeste red flags. Deel je inzichten in de community.',
                      });
                    } else if (score >= 5) {
                      toast({
                        title: 'Goed bezig',
                        description: 'Bekijk de checklist nog eens en gebruik de Gespreks-EHBO bij twijfelgesprekken.',
                      });
                    } else {
                      toast({
                        title: 'Extra oefening nodig',
                        description: 'Herhaal de module en test gesprekken met de Gespreks-EHBO voor extra veiligheid.',
                        variant: 'destructive',
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          section?.quiz && !dbModule?.lessons?.some((l: any) => l.lesson_type === 'quiz') && (
            <div className="rounded-lg bg-background/30 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Lucide.Gamepad2 className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Quiz</p>
                  <p className="mt-1 text-sm text-muted-foreground">{section.quiz}</p>
                </div>
              </div>
              <Textarea
                value={responses[`${moduleId}-quiz-notes`] ?? ''}
                onChange={(event) => onChange(`${moduleId}-quiz-notes`, event.target.value)}
                rows={3}
                className="resize-none"
                placeholder="Noteer je score of inzichten uit de quiz"
              />
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

export default function StarterCourseDetail({ starterId, course, courseSlug, dbCourse: dbCourseProp, interactiveCoach }: StarterCourseDetailProps) {
  const { user, userProfile } = useUser();
  const { toast } = useToast();

  const subscriptionType = user?.subscriptionType ?? (userProfile as any)?.subscriptionType ?? null;
  const membershipTier = normalizeMembershipTier(subscriptionType);
  const membershipLabel = getTierLabel(membershipTier);
  const hasAccess = useMemo(
    () => MEMBERSHIP_RANK[membershipTier] >= MEMBERSHIP_RANK[course.accessTier],
    [membershipTier, course.accessTier]
  );

  const [responses, setResponses] = useState<ResponseMap>({});
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());
  const [starterCompleted, setStarterCompleted] = useState(false);
  const [dbCourse, setDbCourse] = useState<any>(dbCourseProp);
  const [loadingDbCourse, setLoadingDbCourse] = useState(!dbCourseProp);

  const isBioCourse = course.id === 'je-profieltekst-die-wel-werkt';
  const [bioTone, setBioTone] = useState<typeof BIO_TONES[number]['id']>('vlot');
  const [bioVariants, setBioVariants] = useState<string[]>([]);
  const [bioCoachTip, setBioCoachTip] = useState<string | null>(null);
  const [isGeneratingBio, startGeneratingBio] = useTransition();

  const bioData = useMemo(() => {
    const get = (key: string) => (responses[key]?.trim() ?? '');
    const words = [0, 1, 2]
      .map((index) => get(`stap-1-kern-exercise-${index}`))
      .filter(Boolean);

    return {
      words,
      freeDay: get('stap-1-kern-exercise-3'),
      firstImpression: get('stap-1-kern-exercise-4'),
      values: get('stap-2-zoektocht-exercise-0'),
      feelings: get('stap-2-zoektocht-exercise-1'),
      clicheRewrite: get('stap-3-cliches-exercise-0'),
      intro: get('stap-4-structuur-exercise-0'),
      core: get('stap-4-structuur-exercise-1'),
      slot: get('stap-4-structuur-exercise-2'),
      aiDraft: get('stap-5-ai-exercise-0'),
    } as const;
  }, [responses]);

  const baseDraft = useMemo(() => {
    const manualParts = [bioData.intro, bioData.core, bioData.slot].filter(Boolean);
    if (manualParts.length > 0) {
      return manualParts.join('\n\n');
    }
    return bioData.aiDraft;
  }, [bioData]);

  const preparedText = bioData.aiDraft || baseDraft || '';

  const toneConfig = useMemo(
    () => BIO_TONES.find((tone) => tone.id === bioTone) ?? BIO_TONES[0],
    [bioTone]
  );

  const contextSummary = useMemo(() => {
    const items: string[] = [];
    if (bioData.words.length) items.push(`Drie woorden: ${bioData.words.join(', ')}`);
    if (bioData.freeDay) items.push(`Ideale vrije dag: ${bioData.freeDay}`);
    if (bioData.firstImpression) items.push(`Eerste indruk van anderen: ${bioData.firstImpression}`);
    if (bioData.values) items.push(`Belangrijkste in connectie: ${bioData.values}`);
    if (bioData.feelings) items.push(`Zo wil ik dat iemand zich voelt: ${bioData.feelings}`);
    if (bioData.clicheRewrite) items.push(`Herschreven cliché: ${bioData.clicheRewrite}`);
    return items.join('\n');
  }, [bioData]);

  const userBasics = useMemo(() => {
    if (!userProfile) return '';
    const fields: string[] = [];
    if (userProfile.name) fields.push(`Naam: ${userProfile.name}`);
    if (typeof userProfile.age === 'number') fields.push(`Leeftijd: ${userProfile.age}`);
    if (userProfile.gender) fields.push(`Gender: ${userProfile.gender}`);
    if (userProfile.location) fields.push(`Locatie: ${userProfile.location}`);
    if (userProfile.lookingFor) fields.push(`Zoekt: ${userProfile.lookingFor}`);
    if (userProfile.seekingGender?.length) fields.push(`Geïnteresseerd in: ${userProfile.seekingGender.join(', ')}`);
    if (typeof userProfile.seekingAgeMin === 'number' || typeof userProfile.seekingAgeMax === 'number') {
      const min = userProfile.seekingAgeMin ?? '?';
      const max = userProfile.seekingAgeMax ?? '?';
      fields.push(`Voorkeur leeftijden: ${min} - ${max}`);
    }
    if (userProfile.identityGroup) fields.push(`Identiteitsgroep: ${userProfile.identityGroup}`);
    if (userProfile.interests?.length) fields.push(`Interesses: ${userProfile.interests.join(', ')}`);
    return fields.join('\n');
  }, [userProfile]);

  useEffect(() => {
    if (!isBioCourse) return;
    setBioVariants([]);
    setBioCoachTip(null);
  }, [preparedText, bioTone, isBioCourse]);

  // Load database course data
  useEffect(() => {
    if (!courseSlug) {
      setLoadingDbCourse(false);
      return;
    }

    async function fetchDbCourse() {
      try {
        const response = await fetch(`/api/courses/by-slug/${courseSlug}`);
        if (response.ok) {
          const data = await response.json();
          setDbCourse(data);
        }
      } catch (error) {
        console.error('Could not load database course:', error);
      } finally {
        setLoadingDbCourse(false);
      }
    }

    fetchDbCourse();
  }, [courseSlug]);

  // Load responses from database
  useEffect(() => {
    if (!user?.id) return;

    async function loadResponses() {
      try {
        const response = await fetch(`/api/user/lesson-responses?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Convert array of responses to ResponseMap
          const responseMap: ResponseMap = {};
          data.forEach((item: any) => {
            if (item.lesson_id > 0) {
              // Regular lesson responses
              const fieldKey = `lesson-${item.lesson_id}-response`;
              responseMap[fieldKey] = item.response_text;
            } else {
              // Section exercises (stored with negative lesson IDs)
              // Format: "sectionId|exerciseIndex|value"
              const parts = item.response_text.split('|', 3);
              if (parts.length === 3) {
                const [sectionId, exerciseIndex, value] = parts;
                const fieldKey = `${sectionId}-exercise-${exerciseIndex}`;
                responseMap[fieldKey] = value;
              }
            }
          });
          setResponses(responseMap);
        }
      } catch (error) {
        console.error('Kon opgeslagen antwoorden niet laden uit database', error);
        // Fallback to localStorage if database fails
        try {
          const raw = localStorage.getItem(storageKey(starterId));
          if (raw) {
            setResponses(JSON.parse(raw));
          }
        } catch (localError) {
          console.error('Kon opgeslagen antwoorden niet laden uit localStorage', localError);
        }
      }
    }

    loadResponses();
  }, [starterId, user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('dating_assistant_completed_starters');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setStarterCompleted(parsed.includes(starterId));
        }
      }
    } catch (error) {
      console.error('Kon starter voortgang niet laden', error);
    }
  }, [starterId]);

  const persistResponses = useCallback(
    (updater: (prev: ResponseMap) => ResponseMap) => {
      setResponses((prev) => {
        const next = updater(prev);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey(starterId), JSON.stringify(next));
          } catch (error) {
            console.error('Kon antwoorden niet opslaan', error);
          }
        }
        return next;
      });
    },
    [starterId]
  );

  const handleChange = useCallback(
    async (field: string, value: string) => {
      // Update local state immediately
      setResponses((prev) => ({ ...prev, [field]: value }));

      // Show saving indicator
      setSavingFields(prev => new Set(prev).add(field));

      // Save to database in background
      if (user?.id && (field.startsWith('lesson-') || field.includes('-exercise-'))) {
        // Extract lesson ID from field key (format: "lesson-{id}-response" or section exercises)
        const lessonMatch = field.match(/lesson-(\d+)-response/);
        const exerciseMatch = field.match(/(.+)-exercise-(\d+)/);

        let lessonId: number;
        let responseText = value;

        if (lessonMatch) {
          lessonId = parseInt(lessonMatch[1]);
        } else if (exerciseMatch) {
          // For section exercises, create a virtual lesson ID based on section and exercise index
          const sectionId = exerciseMatch[1];
          const exerciseIndex = parseInt(exerciseMatch[2]);
          lessonId = -Math.abs(`${sectionId}-${exerciseIndex}`.split('').reduce((a, b) => a + b.charCodeAt(0), 0)); // Create consistent negative ID
          responseText = `${sectionId}|${exerciseIndex}|${value}`; // Store section info in response
        } else {
          // Fallback to localStorage for other fields
          persistResponses((prev) => ({ ...prev, [field]: value }));
          setSavingFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(field);
            return newSet;
          });
          return;
        }

        try {
          await fetch('/api/user/lesson-responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              lessonId,
              responseText,
            }),
          });

          // Also save to localStorage as backup
          if (typeof window !== 'undefined') {
            const updated = { ...responses, [field]: value };
            localStorage.setItem(storageKey(starterId), JSON.stringify(updated));
          }

          // Show success briefly
          setTimeout(() => {
            setSavingFields(prev => {
              const newSet = new Set(prev);
              newSet.delete(field);
              return newSet;
            });
          }, 1000);

        } catch (error) {
          console.error('Kon antwoord niet opslaan in database', error);
          // Still save to localStorage on error
          if (typeof window !== 'undefined') {
            const updated = { ...responses, [field]: value };
            localStorage.setItem(storageKey(starterId), JSON.stringify(updated));
          }

          // Remove saving indicator on error
          setSavingFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(field);
            return newSet;
          });
        }
      } else {
        // For other fields, use localStorage
        persistResponses((prev) => ({ ...prev, [field]: value }));
        setSavingFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(field);
          return newSet;
        });
      }
    },
    [user?.id, persistResponses, responses, starterId]
  );

  useEffect(() => {
    if (!isBioCourse) return;
    if (!baseDraft) return;
    const fieldKey = 'stap-5-ai-exercise-0';
    if (responses[fieldKey]?.trim()) return;
    handleChange(fieldKey, baseDraft);
  }, [isBioCourse, baseDraft, responses, handleChange]);

  const handleReset = useCallback(() => {
    persistResponses(() => ({}));
    toast({
      title: 'Opdrachten leeggemaakt',
      description: 'Je kunt de velden nu opnieuw invullen.',
    });
  }, [persistResponses, toast]);

  const toggleStarterCompleted = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const key = 'dating_assistant_completed_starters';
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      const list: string[] = Array.isArray(parsed) ? parsed : [];
      const updated = list.includes(starterId)
        ? list.filter((id) => id !== starterId)
        : [...list, starterId];
      localStorage.setItem(key, JSON.stringify(updated));
      setStarterCompleted(updated.includes(starterId));
    } catch (error) {
      console.error('Kon starter voortgang niet opslaan', error);
    }
  }, [starterId]);

  const canGenerateBio = preparedText.trim().length > 0;

  const handlePreparedTextChange = useCallback(
    (value: string) => {
      setBioVariants([]);
      setBioCoachTip(null);
      handleChange('stap-5-ai-exercise-0', value);
    },
    [handleChange]
  );

  const handleUseVariant = useCallback(
    (variant: string) => {
      handleChange('stap-5-ai-exercise-0', variant);
      toast({
        title: 'Variant geselecteerd',
        description: 'De gekozen tekst staat nu klaar in stap 5 van het werkblad.',
      });
    },
    [handleChange, toast]
  );

  const handleGenerateBio = useCallback(() => {
    if (!isBioCourse) return;
    if (!canGenerateBio) {
      toast({
        title: 'Concept ontbreekt',
        description: 'Schrijf eerst je intro, kern en slot of vul stap 5 in.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      tone: bioTone,
      draft: preparedText,
      context: {
        tonePrompt: toneConfig.prompt,
        summary: contextSummary,
        userBasics,
        fields: bioData,
      },
    } as const;

    startGeneratingBio(async () => {
      try {
        const response = await fetch('/api/bio-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('De AI generator gaf een foutmelding.');
        }

        const data = await response.json();
        const variants = Array.isArray(data.variants)
          ? data.variants.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
          : [];

        if (!variants.length) {
          throw new Error('Geen varianten ontvangen van de AI.');
        }

        setBioVariants(variants);
        setBioCoachTip(typeof data.coachingTip === 'string' ? data.coachingTip : null);
        toast({
          title: 'AI-varianten klaar',
          description: 'Bekijk de suggesties hieronder en kies jouw favoriet.',
        });
      } catch (error) {
        console.error('AI bio generator error', error);
        toast({
          title: 'AI generator mislukt',
          description:
            error instanceof Error ? error.message : 'Onbekende fout: probeer het later opnieuw.',
          variant: 'destructive',
        });
      }
    });
  }, [
    isBioCourse,
    canGenerateBio,
    bioTone,
    preparedText,
    toneConfig.prompt,
    contextSummary,
    userBasics,
    bioData,
    startGeneratingBio,
    toast,
  ]);

  const starterResource = FREE_STARTER_RESOURCES.find((resource) => resource.id === starterId);
  const starterLabel = starterResource ? STARTER_RESOURCE_LABELS[starterResource.format] : null;
  const StarterIcon = starterResource
    ? getLucideIcon(STARTER_RESOURCE_ICONS[starterResource.format]) ?? Lucide.BookOpen
    : null;

  const isRedFlagSection = useCallback(
    (section: CourseSection) => (section.label ?? '').toLowerCase().includes('red flag'),
    []
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/dashboard?tab=cursus" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              <Lucide.ArrowLeft className="h-4 w-4" />
              Terug naar dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>Gratis starterscursussen</span>
          </div>

          <div className="flex items-center gap-3">
            {StarterIcon && (
              <div className="rounded-full bg-primary/10 p-3">
                <StarterIcon className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              {starterLabel && (
                <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Lucide.Layers className="h-3 w-3" />
                  {starterLabel}
                </span>
              )}
            </div>
          </div>

          <p className="max-w-2xl text-muted-foreground">{course.summary}</p>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/40 px-3 py-1">
              <Lucide.User className="h-4 w-4 text-primary" />
              {course.provider}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/40 px-3 py-1">
              <Lucide.Clock className="h-4 w-4 text-primary" />
              {course.duration}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/40 px-3 py-1">
              <Lucide.GraduationCap className="h-4 w-4 text-primary" />
              {course.level}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/40 px-3 py-1">
              <Lucide.Unlock className="h-4 w-4 text-primary" />
              Toegang vanaf {getTierLabel(course.accessTier)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard?tab=cursus">
              <Lucide.LayoutGrid className="mr-2 h-4 w-4" />
              Bekijk alle modules
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard?tab=cursus">
              <Lucide.Sparkles className="mr-2 h-4 w-4" />
              Open AI ijsbreker generator
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <Lucide.Eraser className="mr-2 h-4 w-4" />
            Wis mijn ingevulde antwoorden
          </Button>
          <Button
            variant={starterCompleted ? 'default' : 'outline'}
            onClick={toggleStarterCompleted}
            className="flex items-center justify-center gap-2"
          >
            {starterCompleted ? (
              <>
                <Lucide.CheckCircle className="h-4 w-4" />
                Voltooid
              </>
            ) : (
              <>
                <Lucide.Circle className="h-4 w-4" />
                Markeer als voltooid
              </>
            )}
          </Button>
        </div>
      </div>

      {!hasAccess ? (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-amber-900">Upgrade nodig</h2>
              <p className="text-sm text-amber-800">
                Deze module hoort bij het {getTierLabel(course.accessTier)}-pakket. Jij hebt nu {membershipLabel}.
              </p>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/select-package">
                <Lucide.LockOpen className="mr-2 h-4 w-4" />
                Upgrade en krijg toegang
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Module overzicht</h2>
              <span className="text-sm text-muted-foreground">
                {dbCourse?.modules?.length || course.sections.length} modules
              </span>
            </div>
            <Carousel className="relative w-full" opts={{ align: 'start' }}>
              <CarouselContent className="pb-2">
                {(() => {
                  // Determine if this is the bio course
                  const isBioCourse = course.id === 'je-profieltekst-die-wel-werkt';

                  return (dbCourse?.modules && dbCourse.modules.length > 0 ? dbCourse.modules : course.sections).map((item, index) => {
                    // If we have database modules, use them directly; otherwise use static sections
                    const isDbModule = dbCourse?.modules && dbCourse.modules.length > 0;
                    const dbModule = isDbModule ? item : dbCourse?.modules?.[index];
                    const section = isDbModule ? null : item;

                    return (
                      <CarouselItem
                        key={isDbModule ? dbModule.id : section.id}
                        className={section && isRedFlagSection(section) ? 'pl-0' : undefined}
                      >
                        <CourseSectionCard
                          section={section}
                          responses={responses}
                          onChange={handleChange}
                          dbModule={dbModule}
                          interactiveCoach={interactiveCoach}
                          isBioCourse={isBioCourse}
                          savingFields={savingFields}
                        />
                      </CarouselItem>
                    );
                  });
                })()}
              </CarouselContent>
              <CarouselPrevious className="!-left-10 !top-[200px] !-translate-y-0" />
              <CarouselNext className="!-right-10 !top-[200px] !-translate-y-0" />
            </Carousel>
          </div>
          {isBioCourse && (
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Lucide.Sparkles className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      AI Bio Generator
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Genereer je profieltekst varianten
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Bundel je antwoorden tot één concept. Kies een toon en laat de AI drie unieke
                    versies voorstellen voor je dating profiel.
                  </p>
                </div>

                {contextSummary && (
                  <div className="rounded-lg border border-primary/20 bg-background/60 p-4 text-sm text-muted-foreground">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                      Samenvatting uit je werkblad
                    </p>
                    <pre className="whitespace-pre-wrap">{contextSummary}</pre>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground" htmlFor="bio-prepared-text">
                    Concepttekst (stap 4 &amp; 5)
                  </label>
                  <Textarea
                    id="bio-prepared-text"
                    value={preparedText}
                    onChange={(event) => handlePreparedTextChange(event.target.value)}
                    rows={6}
                    className="resize-y"
                    placeholder="Schrijf hier je intro, kern en slot. We gebruiken dit als basis voor de AI."
                  />
                  {!canGenerateBio && (
                    <p className="text-xs text-muted-foreground">
                      Vul minimaal je intro, kern en slot in om de AI generator te starten.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-sm font-medium text-foreground">Kies de toon</span>
                  <div className="flex flex-wrap gap-2">
                    {BIO_TONES.map((tone) => (
                      <Button
                        key={tone.id}
                        variant={tone.id === bioTone ? 'default' : 'outline'}
                        onClick={() => setBioTone(tone.id)}
                        size="sm"
                        className="gap-2"
                      >
                        {tone.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">AI hint: {toneConfig.prompt}</p>
                  <Button
                    onClick={handleGenerateBio}
                    disabled={!canGenerateBio || isGeneratingBio}
                    className="sm:w-auto"
                  >
                    {isGeneratingBio ? (
                      <span className="flex items-center gap-2">
                        <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                        Genereren...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lucide.Sparkles className="h-4 w-4" />
                        Start AI Bio Generator
                      </span>
                    )}
                  </Button>
                </div>

                {bioCoachTip && (
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
                    <strong className="block text-xs uppercase tracking-wide">Coach tip</strong>
                    <p className="mt-1 text-primary">{bioCoachTip}</p>
                  </div>
                )}

                {bioVariants.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">AI suggesties</h4>
                    <div className="flex flex-col space-y-4">
                      {bioVariants.map((variant, index) => (
                        <div key={index} className="space-y-2">
                          <AIResultCard content={`**Variant ${index + 1}**\n\n${variant}`} />
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handleUseVariant(variant)}>
                              Gebruik deze variant
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
