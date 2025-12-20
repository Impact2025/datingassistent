'use client';

/**
 * Dating Snapshot Flow - World-Class Onboarding Experience
 *
 * A premium 7-section onboarding that creates deep personalization.
 * Features:
 * - Beautiful animated transitions
 * - Progress persistence
 * - Real-time score calculations
 * - Personalized completion summary
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Target,
  Heart,
  Zap,
  Battery,
  Flag,
  Clock,
  User,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IrisAvatar } from '@/components/onboarding/IrisAvatar';
import { IrisVideoScreen } from '@/components/onboarding/IrisVideoScreen';
import { QuestionRenderer } from './QuestionComponents';
import {
  DATING_SNAPSHOT_FLOW,
  getTotalQuestions,
  getTotalEstimatedMinutes,
  shouldShowQuestion,
} from '@/lib/dating-snapshot-flow';
import { useDatingSnapshotPersistence } from '@/hooks/use-onboarding-persistence';
import { useOnboardingAnalytics } from '@/lib/analytics/onboarding-analytics';
import type {
  UserOnboardingProfile,
  EnergyProfile,
  AttachmentStyle,
  PainPoint,
  WelcomeMessage,
} from '@/types/dating-snapshot.types';
import {
  PAIN_POINT_TEXTS,
  ATTACHMENT_STYLE_TEXTS,
  ENERGY_PROFILE_TEXTS,
} from '@/types/dating-snapshot.types';

// =====================================================
// TYPES
// =====================================================

// =====================================================
// VIDEO CONFIGURATION
// =====================================================

/**
 * Video URLs for Iris intro and outro videos.
 * Hosted on media.datingassistent.nl CDN.
 */
const IRIS_VIDEOS = {
  intro: {
    mp4: 'https://media.datingassistent.nl/videos/transformatie/Welkom_Transformatie.mp4',
    poster: '/images/iris-video-poster.jpg',
    // Optional: Add captions later
    captions: '',
  },
  outro: {
    mp4: 'https://media.datingassistent.nl/videos/transformatie/Eind_Transformatie.mp4',
    poster: '/images/iris-video-poster.jpg',
    captions: '',
  },
};

interface DatingSnapshotFlowProps {
  onComplete: (profile: UserOnboardingProfile) => void;
  /** Set to false to skip intro/outro videos */
  showVideos?: boolean;
  className?: string;
}

type FlowStep = 'intro_video' | 'intro' | 'questions' | 'processing' | 'outro_video' | 'summary';

interface CalculatedScores {
  introvertScore: number;
  energyProfile: EnergyProfile;
  attachmentStyle: AttachmentStyle;
  attachmentConfidence: number;
  primaryPainPoint: PainPoint;
}

// =====================================================
// ICONS MAP
// =====================================================

const SECTION_ICONS: Record<string, React.ComponentType<any>> = {
  'user-circle': User,
  'smartphone': Smartphone,
  'battery-medium': Battery,
  'target': Target,
  'heart-handshake': Heart,
  'flag': Flag,
  'clock-history': Clock,
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function DatingSnapshotFlow({
  onComplete,
  showVideos = true,
  className
}: DatingSnapshotFlowProps) {
  // Reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Persistence hook
  const {
    restoredSectionIndex,
    restoredAnswers,
    wasRestored,
    saveProgress,
    clearProgress,
  } = useDatingSnapshotPersistence();

  // Analytics hook
  const analytics = useOnboardingAnalytics({ flowType: 'dating_snapshot' });

  // Animation variants that respect reduced motion
  const fadeInUp = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      };

  const slideIn = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
      };

  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State - Start with intro_video if videos are enabled
  const [step, setStep] = useState<FlowStep>(showVideos ? 'intro_video' : 'intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [calculatedScores, setCalculatedScores] = useState<CalculatedScores | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<WelcomeMessage | null>(null);
  const [completedProfile, setCompletedProfile] = useState<UserOnboardingProfile | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Check for restored progress on mount
  useEffect(() => {
    if (wasRestored && Object.keys(restoredAnswers).length > 0) {
      setShowRestorePrompt(true);
    }
  }, [wasRestored, restoredAnswers]);

  // Keyboard-aware scroll behavior for mobile
  useEffect(() => {
    if (step !== 'questions') return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Only handle input/select/textarea focus
      if (!target.matches('input, textarea, select')) return;

      // Wait for virtual keyboard to appear on mobile
      setTimeout(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [step]);

  // Handle restore progress
  const handleRestoreProgress = useCallback(() => {
    setAnswers(restoredAnswers);
    setCurrentSectionIndex(restoredSectionIndex);
    setStep('questions');
    setShowRestorePrompt(false);
    analytics.trackStart({ hasRestoredProgress: true });
  }, [restoredAnswers, restoredSectionIndex, analytics]);

  // Handle start fresh
  const handleStartFresh = useCallback(() => {
    clearProgress();
    setShowRestorePrompt(false);
    analytics.trackStart({ hasRestoredProgress: false });
  }, [clearProgress, analytics]);

  // Auto-save on answer change
  useEffect(() => {
    if (step === 'questions' && Object.keys(answers).length > 0) {
      saveProgress(currentSectionIndex, answers);
    }
  }, [answers, currentSectionIndex, step, saveProgress]);

  // Current section
  const currentSection = DATING_SNAPSHOT_FLOW[currentSectionIndex];
  const totalSections = DATING_SNAPSHOT_FLOW.length;
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === totalSections - 1;

  // Filter visible questions based on conditional logic
  const visibleQuestions = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.questions.filter((q) => shouldShowQuestion(q, answers));
  }, [currentSection, answers]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completedSections = currentSectionIndex;
    const currentSectionProgress = visibleQuestions.length > 0
      ? visibleQuestions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length / visibleQuestions.length
      : 0;
    return ((completedSections + currentSectionProgress) / totalSections) * 100;
  }, [currentSectionIndex, visibleQuestions, answers, totalSections]);

  // Handle answer change
  const handleAnswer = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  // Validate current section
  const validateSection = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    for (const question of visibleQuestions) {
      if (question.required) {
        const value = answers[question.id];
        if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0)) {
          newErrors[question.id] = 'Dit veld is verplicht';
        }
      }

      // Text length validation
      if (question.validation?.min_length && answers[question.id]) {
        if (String(answers[question.id]).length < question.validation.min_length) {
          newErrors[question.id] = `Minimaal ${question.validation.min_length} tekens`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [visibleQuestions, answers]);

  // Calculate scores from answers
  const calculateScores = useCallback((): CalculatedScores => {
    // Calculate introvert score
    const energyAfterSocial = answers.energy_after_social || 3;
    const callPreparation = answers.call_preparation || 3;
    const postDateNeed = answers.post_date_need || 'depends';
    const socialBattery = answers.social_battery_capacity || 5;

    let introvertScore = 0;
    introvertScore += (6 - energyAfterSocial) * 15;
    introvertScore += callPreparation * 5;
    introvertScore += postDateNeed === 'alone_time' ? 15 : postDateNeed === 'depends' ? 8 : 0;
    introvertScore += (11 - socialBattery) * 2;
    introvertScore = Math.min(100, Math.max(0, introvertScore));

    // Determine energy profile
    let energyProfile: EnergyProfile = 'ambivert';
    if (introvertScore >= 65) energyProfile = 'introvert';
    else if (introvertScore <= 35) energyProfile = 'extrovert';

    // Calculate attachment style
    const q1 = answers.attachment_q1_abandonment || 3;
    const q2 = answers.attachment_q2_trust || 3;
    const q3 = answers.attachment_q3_intimacy || 3;
    const q4 = answers.attachment_q4_validation || 3;
    const q5 = answers.attachment_q5_withdraw || 3;
    const q6 = answers.attachment_q6_independence || 3;
    const q7 = answers.attachment_q7_closeness || 3;

    const anxietyScore = q1 + q4 + q7;
    const avoidanceScore = q2 + q3 + q5 + q6;

    let attachmentStyle: AttachmentStyle = 'secure';
    let attachmentConfidence = 80;

    if (anxietyScore <= 7 && avoidanceScore <= 10) {
      attachmentStyle = 'secure';
      attachmentConfidence = 80;
    } else if (anxietyScore > 10 && avoidanceScore <= 10) {
      attachmentStyle = 'anxious';
      attachmentConfidence = 70 + (anxietyScore - 10) * 2;
    } else if (anxietyScore <= 7 && avoidanceScore > 14) {
      attachmentStyle = 'avoidant';
      attachmentConfidence = 70 + (avoidanceScore - 14) * 2;
    } else {
      attachmentStyle = 'fearful_avoidant';
      attachmentConfidence = 65;
    }
    attachmentConfidence = Math.min(95, attachmentConfidence);

    // Get primary pain point
    const painPointsRanked = answers.pain_points_ranked || [];
    const primaryPainPoint = (painPointsRanked[0] || 'conversations_die') as PainPoint;

    return {
      introvertScore,
      energyProfile,
      attachmentStyle,
      attachmentConfidence,
      primaryPainPoint,
    };
  }, [answers]);

  // Navigate to next section
  const handleNext = useCallback(async () => {
    if (!validateSection()) {
      // Scroll to first error within our scroll container
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey && scrollContainerRef.current) {
        const errorElement = document.getElementById(firstErrorKey);
        if (errorElement) {
          // Calculate position relative to scroll container
          const containerRect = scrollContainerRef.current.getBoundingClientRect();
          const elementRect = errorElement.getBoundingClientRect();
          const scrollTop = scrollContainerRef.current.scrollTop;
          const targetPosition = scrollTop + (elementRect.top - containerRect.top) - 100;
          scrollContainerRef.current.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }
      return;
    }

    if (isLastSection) {
      // Complete onboarding
      setStep('processing');
      setProcessingStep(0);

      // Calculate scores
      const scores = calculateScores();
      setCalculatedScores(scores);

      // Animate processing steps
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 600));
        setProcessingStep(i + 1);
      }

      // Save to API
      try {
        setIsSubmitting(true);
        const response = await fetch('/api/transformatie/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            scores,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setCompletedProfile(data.profile);
          setWelcomeMessage(data.welcomeMessage);
        } else if (response.status === 400 && data.fieldErrors) {
          // Handle validation errors from API
          console.warn('API validation errors:', data.fieldErrors);

          // Map API field errors to form errors
          const newErrors: Record<string, string> = {};
          for (const [fieldPath, messages] of Object.entries(data.fieldErrors)) {
            // Extract field name from path (e.g., "answers.display_name" -> "display_name")
            const fieldName = fieldPath.replace('answers.', '').replace('scores.', '');
            if (Array.isArray(messages) && messages.length > 0) {
              newErrors[fieldName] = messages[0];
            }
          }

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Track validation error
            analytics.trackError({
              type: 'api_validation',
              message: 'Server validation failed',
            });
            // Go back to first section with error
            const errorFields = Object.keys(newErrors);
            for (let i = 0; i < DATING_SNAPSHOT_FLOW.length; i++) {
              const section = DATING_SNAPSHOT_FLOW[i];
              const sectionHasError = section.questions.some(q => errorFields.includes(q.id));
              if (sectionHasError) {
                setCurrentSectionIndex(i);
                setStep('questions');
                setProcessingStep(0);
                break;
              }
            }
            return;
          }
        } else {
          // Generic error
          console.error('API error:', data.error || 'Unknown error');
          analytics.trackError({
            type: 'api_error',
            message: data.error || 'Failed to save',
          });
        }
      } catch (error) {
        console.error('Failed to save onboarding:', error);
        analytics.trackError({
          type: 'network_error',
          message: error instanceof Error ? error.message : 'Network error',
        });
      } finally {
        setIsSubmitting(false);
      }

      await new Promise((r) => setTimeout(r, 400));
      // Show outro video if enabled, otherwise go to summary
      setStep(showVideos ? 'outro_video' : 'summary');
    } else {
      // Save progress to API
      try {
        await fetch('/api/transformatie/snapshot/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: currentSection.id,
            answers,
          }),
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }

      // Track section completion
      analytics.trackSectionComplete({
        index: currentSectionIndex,
        id: currentSection.id.toString(),
        title: currentSection.title,
        questionsTotal: visibleQuestions.length,
        questionsAnswered: visibleQuestions.filter(q => answers[q.id] !== undefined).length,
      });

      setCurrentSectionIndex((prev) => prev + 1);
      // Scroll to top of content container
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateSection, errors, isLastSection, calculateScores, answers, currentSection, analytics, currentSectionIndex, visibleQuestions]);

  // Navigate to previous section
  const handlePrevious = useCallback(() => {
    if (!isFirstSection) {
      setCurrentSectionIndex((prev) => prev - 1);
      // Scroll to top of content container
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isFirstSection]);

  // Start the onboarding
  const handleStart = () => {
    setStep('questions');
    analytics.trackStart({ hasRestoredProgress: false });
  };

  // Complete and start program
  const handleComplete = () => {
    if (completedProfile) {
      // Track completion
      analytics.trackComplete({
        sectionsCompleted: DATING_SNAPSHOT_FLOW.length,
        questionsAnswered: Object.keys(answers).length,
      });
      // Clear saved progress on successful completion
      clearProgress();
      onComplete(completedProfile);
    }
  };

  // Processing steps for animation
  const processingSteps = [
    { icon: Target, text: 'Analyseren van je profiel...' },
    { icon: Sparkles, text: 'Berekenen van je energie profiel...' },
    { icon: Heart, text: 'Bepalen van je hechtingsstijl...' },
    { icon: Zap, text: 'Personaliseren van je programma...' },
  ];

  // =====================================================
  // RENDER: RESTORE PROMPT
  // =====================================================
  if (showRestorePrompt) {
    const answeredCount = Object.keys(restoredAnswers).length;
    const sectionName = DATING_SNAPSHOT_FLOW[restoredSectionIndex]?.title || 'onbekend';

    return (
      <div className={cn(
        'min-h-[100dvh] bg-gradient-to-b from-pink-50/50 to-white',
        'overflow-y-auto overscroll-y-none',
        'flex flex-col items-center justify-start sm:justify-center',
        'py-4 px-4 safe-area-top safe-area-bottom',
        className
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md my-auto sm:my-0"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/30 border border-pink-100/50 overflow-hidden">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-center text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-90" />
              </motion.div>
              <h2 className="text-xl font-bold mb-1">Welkom terug!</h2>
              <p className="text-pink-100 text-sm">Je hebt onafgemaakte voortgang</p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Vragen beantwoord</span>
                  <span className="text-sm font-semibold text-gray-900">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Laatst bij</span>
                  <span className="text-sm font-semibold text-gray-900">{sectionName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRestoreProgress}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-5 rounded-xl font-semibold"
                >
                  Doorgaan waar ik was
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={handleStartFresh}
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700 py-4"
                >
                  Opnieuw beginnen
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =====================================================
  // RENDER: INTRO VIDEO
  // =====================================================
  if (step === 'intro_video') {
    return (
      <IrisVideoScreen
        variant="intro"
        videoSrc={IRIS_VIDEOS.intro.mp4}
        poster={IRIS_VIDEOS.intro.poster}
        captions={IRIS_VIDEOS.intro.captions ? [
          {
            src: IRIS_VIDEOS.intro.captions,
            srclang: 'nl',
            label: 'Nederlands',
            default: true,
          },
        ] : undefined}
        onContinue={() => setStep('intro')}
        className={className}
      />
    );
  }

  // =====================================================
  // RENDER: INTRO SCREEN
  // =====================================================
  if (step === 'intro') {
    return (
      <div className={cn(
        'min-h-[100dvh] bg-gradient-to-b from-pink-50/50 to-white',
        'overflow-y-auto overscroll-y-none', // Enable scrolling on mobile
        'flex flex-col items-center justify-start sm:justify-center', // Start-align on mobile, center on larger
        'py-4 px-4 safe-area-top safe-area-bottom',
        className
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg my-auto sm:my-0"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/30 border border-pink-100/50 overflow-hidden">
            {/* Header with Iris */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 text-center text-white relative overflow-visible">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <IrisAvatar size="xl" showGlow className="mx-auto ring-4 ring-white/30" />
              </motion.div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                De Dating Snapshot
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-pink-100"
              >
                Laten we je eerst leren kennen
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Coach message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-2xl p-4 mb-6"
              >
                <p className="text-gray-700 text-sm leading-relaxed">
                  "Hoi! Ik ben Iris, je coach. De volgende {getTotalEstimatedMinutes()} minuten bepalen hoe ik je het beste kan helpen.
                  Beantwoord eerlijk — er zijn geen foute antwoorden."
                </p>
              </motion.div>

              {/* What you'll discover */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: Target, text: 'Ontdek je dating profiel' },
                  { icon: Battery, text: 'Meet je sociale energie' },
                  { icon: Heart, text: 'Krijg je hechtingsstijl inzicht' },
                  { icon: Sparkles, text: 'Ontvang een gepersonaliseerd plan' },
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-pink-600" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center gap-8 mb-8 text-center"
              >
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalSections}</div>
                  <div className="text-xs text-gray-500">secties</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{getTotalQuestions()}</div>
                  <div className="text-xs text-gray-500">vragen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{getTotalEstimatedMinutes()}</div>
                  <div className="text-xs text-gray-500">minuten</div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Button
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg shadow-pink-200/50"
                >
                  Start de Dating Snapshot
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="mt-4 text-center text-xs text-gray-400">
                  Je antwoorden zijn privé en worden alleen gebruikt om jouw ervaring te personaliseren
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =====================================================
  // RENDER: QUESTIONS
  // =====================================================
  if (step === 'questions' && currentSection) {
    const SectionIcon = SECTION_ICONS[currentSection.icon] || Target;

    return (
      <div
        className={cn(
          'fixed inset-0 bg-white flex flex-col z-[60]',
          'overflow-hidden', // Prevent body scroll, use inner scroll
          className
        )}
        style={{ colorScheme: 'light' }}
      >
        {/* Progress bar - Fixed header */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-100 safe-area-top z-10">
          {/* Progress indicator with ARIA */}
          <div
            className="h-1 bg-gray-100"
            role="progressbar"
            aria-valuenow={Math.round(overallProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Voortgang: ${Math.round(overallProgress)}%`}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="max-w-2xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <SectionIcon className="w-4 h-4 text-pink-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{currentSection.title}</div>
                <div className="text-xs text-gray-500 truncate hidden sm:block">{currentSection.subtitle}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 flex-shrink-0 ml-2">
              <span className="font-medium">{currentSectionIndex + 1}</span>
              <span className="text-gray-400"> / {totalSections}</span>
            </div>
          </div>
        </div>

        {/* Section content - Scrollable area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-y-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection.id}
                initial={slideIn.initial}
                animate={slideIn.animate}
                exit={slideIn.exit}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
              >
                {/* Section intro */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-gray-600">{currentSection.intro_text}</p>
                  {currentSection.instruction && (
                    <p className="text-sm text-gray-500 mt-2 italic">{currentSection.instruction}</p>
                  )}
                </div>

                {/* Questions */}
                <div className="space-y-6 sm:space-y-8">
                  {visibleQuestions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      id={question.id}
                      initial={fadeInUp.initial}
                      animate={fadeInUp.animate}
                      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
                    >
                      <QuestionRenderer
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => handleAnswer(question.id, value)}
                        error={errors[question.id]}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Section outro */}
                {currentSection.outro_text && (
                  <p className="mt-6 sm:mt-8 text-sm text-gray-500 italic">{currentSection.outro_text}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation - Fixed footer */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-100 safe-area-bottom z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4 flex gap-3">
            {!isFirstSection && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-shrink-0 min-h-[48px] px-4 touch-manipulation active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Terug</span>
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 min-h-[48px] bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white touch-manipulation active:scale-[0.98] transition-transform"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Laden...
                </span>
              ) : (
                <>
                  {isLastSection ? 'Voltooien' : 'Volgende'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER: PROCESSING
  // =====================================================
  if (step === 'processing') {
    return (
      <div className={cn(
        'min-h-[100dvh] bg-gradient-to-b from-pink-50/50 to-white',
        'overflow-y-auto overscroll-y-none',
        'flex flex-col items-center justify-start sm:justify-center',
        'py-4 px-4 safe-area-top safe-area-bottom',
        className
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md my-auto sm:my-0"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/30 border border-pink-100/50 p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8"
            >
              <IrisAvatar size="xl" showGlow className="mx-auto ring-4 ring-pink-100" />
            </motion.div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Iris analyseert je antwoorden
            </h2>
            <p className="text-gray-500 mb-8">Een moment geduld...</p>

            <div className="space-y-3">
              {processingSteps.map((item, index) => {
                const isComplete = processingStep > index;
                const isCurrent = processingStep === index + 1;

                return (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      isComplete && 'bg-green-50',
                      isCurrent && 'bg-pink-50',
                      !isComplete && !isCurrent && 'bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      isComplete && 'bg-green-500 text-white',
                      isCurrent && 'bg-pink-500 text-white',
                      !isComplete && !isCurrent && 'bg-gray-200 text-gray-400'
                    )}>
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <item.icon className={cn('w-4 h-4', isCurrent && 'animate-pulse')} />
                      )}
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      isComplete && 'text-green-700',
                      isCurrent && 'text-pink-700',
                      !isComplete && !isCurrent && 'text-gray-400'
                    )}>
                      {item.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =====================================================
  // RENDER: OUTRO VIDEO
  // =====================================================
  if (step === 'outro_video' && calculatedScores) {
    return (
      <IrisVideoScreen
        variant="outro"
        videoSrc={IRIS_VIDEOS.outro.mp4}
        poster={IRIS_VIDEOS.outro.poster}
        captions={IRIS_VIDEOS.outro.captions ? [
          {
            src: IRIS_VIDEOS.outro.captions,
            srclang: 'nl',
            label: 'Nederlands',
            default: true,
          },
        ] : undefined}
        onContinue={() => setStep('summary')}
        userName={answers.display_name}
        outroContext={{
          energyProfile: ENERGY_PROFILE_TEXTS[calculatedScores.energyProfile],
          attachmentStyle: ATTACHMENT_STYLE_TEXTS[calculatedScores.attachmentStyle],
          primaryFocus: PAIN_POINT_TEXTS[calculatedScores.primaryPainPoint],
        }}
        className={className}
      />
    );
  }

  // =====================================================
  // RENDER: SUMMARY
  // =====================================================
  if (step === 'summary' && calculatedScores) {
    const personalizationFlags = [];
    if (calculatedScores.introvertScore >= 60) personalizationFlags.push('Introvert Modus geactiveerd');
    if (answers.ghosting_frequency === 'often' || answers.ghosting_frequency === 'very_often') {
      personalizationFlags.push('Extra ghosting support');
    }
    if (answers.has_experienced_burnout) personalizationFlags.push('Burnout preventie actief');
    if (answers.matches_per_week === '0' || answers.matches_per_week === '1') {
      personalizationFlags.push('Confidence building modules');
    }

    return (
      <div className={cn(
        'min-h-[100dvh] bg-gradient-to-b from-pink-50/50 to-white',
        'overflow-y-auto overscroll-y-none',
        'py-4 px-4 safe-area-top safe-area-bottom',
        className
      )}>
        <div className="max-w-lg mx-auto py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {answers.display_name}, je Dating Snapshot is compleet!
            </h1>
            <p className="text-gray-500">Hier is wat ik over je heb geleerd</p>
          </motion.div>

          {/* Results cards */}
          <div className="space-y-4 mb-8">
            {/* Energy Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/50 border border-pink-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Battery className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Je Energie Profiel</h3>
              </div>
              <p className="text-gray-700">
                Je bent een <strong className="text-pink-600">{ENERGY_PROFILE_TEXTS[calculatedScores.energyProfile]}</strong> met
                een introvert score van <strong>{calculatedScores.introvertScore}%</strong>.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {calculatedScores.energyProfile === 'introvert'
                  ? 'Je sociale energie raakt snel op. De tools zijn hierop afgestemd.'
                  : calculatedScores.energyProfile === 'extrovert'
                    ? 'Je haalt energie uit sociale interactie. Let op dat je niet te veel hooi op je vork neemt.'
                    : 'Je schakelt tussen sociale energie en rusttijd. Gebruik dit als superkracht.'}
              </p>
            </motion.div>

            {/* Attachment Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/50 border border-pink-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Je Hechtingsstijl (voorlopig)</h3>
              </div>
              <p className="text-gray-700">
                Je hechtingsstijl lijkt <strong className="text-pink-600">{ATTACHMENT_STYLE_TEXTS[calculatedScores.attachmentStyle]}</strong> te zijn.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Dit is een eerste indicatie — in Module 2 krijg je de volledige analyse.
              </p>
            </motion.div>

            {/* Focus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/50 border border-pink-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Waar We Op Focussen</h3>
              </div>
              <p className="text-gray-700">
                Je grootste uitdaging is <strong className="text-pink-600">{PAIN_POINT_TEXTS[calculatedScores.primaryPainPoint]}</strong>.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                De modules en AI tools zijn hierop afgestemd.
              </p>
            </motion.div>

            {/* Personalization */}
            {personalizationFlags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200"
              >
                <h3 className="font-semibold text-gray-900 mb-3">Dit heb ik voor je ingesteld:</h3>
                <div className="space-y-2">
                  {personalizationFlags.map((flag) => (
                    <div key={flag} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {flag}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg shadow-pink-200/50"
            >
              Start Module 1
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
