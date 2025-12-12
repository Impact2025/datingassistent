'use client';

/**
 * KickstartStepOnboarding - World-class step-by-step onboarding
 *
 * Design principles:
 * - One question per screen for maximum focus
 * - Smooth transitions between steps
 * - Clear progress indication
 * - Mobile-first, thumb-friendly touch targets
 * - Iris personality through micro-copy, not chat
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Send,
  Check,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IrisAvatar } from '@/components/onboarding/IrisAvatar';
import type { KickstartIntakeData } from '@/types/kickstart-onboarding.types';
import Confetti from 'react-confetti';

// =============================================================================
// TYPES
// =============================================================================

interface KickstartStepOnboardingProps {
  userName?: string;
  onComplete: (data: KickstartIntakeData) => void;
  className?: string;
}

type StepId =
  | 'welcome'
  | 'name'
  | 'gender-lookingfor'
  | 'region-age'
  | 'dating-status'
  | 'dating-apps'
  | 'frustration'
  | 'difficulty-goal'
  | 'confidence'
  | 'deep-questions'
  | 'processing'
  | 'success';

interface StepConfig {
  id: StepId;
  irisQuote?: string;
  showProgress: boolean;
}

// =============================================================================
// STEP CONFIGURATIONS
// =============================================================================

const STEPS: StepConfig[] = [
  { id: 'welcome', showProgress: false },
  { id: 'name', irisQuote: 'Hoi! Leuk je te ontmoeten.', showProgress: true },
  { id: 'gender-lookingfor', irisQuote: 'Even wat basics...', showProgress: true },
  { id: 'region-age', irisQuote: 'Helpt me met lokale tips!', showProgress: true },
  { id: 'dating-status', irisQuote: 'Vertel me over je situatie.', showProgress: true },
  { id: 'dating-apps', irisQuote: 'Welke apps gebruik je?', showProgress: true },
  { id: 'frustration', irisQuote: 'Dit helpt me je écht te begrijpen.', showProgress: true },
  { id: 'difficulty-goal', irisQuote: 'Bijna klaar!', showProgress: true },
  { id: 'confidence', irisQuote: 'Eerlijk antwoorden, geen oordeel.', showProgress: true },
  { id: 'deep-questions', irisQuote: 'Laatste vragen, deze zijn belangrijk.', showProgress: true },
  { id: 'processing', showProgress: false },
  { id: 'success', showProgress: false },
];

// =============================================================================
// OPTIONS DATA
// =============================================================================

const GENDER_OPTIONS = [
  { value: 'man', label: 'Man', icon: '👨' },
  { value: 'vrouw', label: 'Vrouw', icon: '👩' },
  { value: 'anders', label: 'Anders', icon: '🌈' },
];

const LOOKING_FOR_OPTIONS = [
  { value: 'vrouwen', label: 'Vrouwen', icon: '👩' },
  { value: 'mannen', label: 'Mannen', icon: '👨' },
  { value: 'beiden', label: 'Beiden', icon: '💑' },
];

const REGION_OPTIONS = [
  { value: 'amsterdam', label: 'Amsterdam', icon: '🏙️' },
  { value: 'rotterdam', label: 'Rotterdam', icon: '🌉' },
  { value: 'den-haag', label: 'Den Haag', icon: '🏛️' },
  { value: 'utrecht', label: 'Utrecht', icon: '🗼' },
  { value: 'eindhoven', label: 'Eindhoven', icon: '💡' },
  { value: 'groningen', label: 'Groningen', icon: '🎓' },
  { value: 'andere', label: 'Andere regio', icon: '📍' },
];

const DATING_STATUS_OPTIONS = [
  { value: 'never-dated', label: 'Nog nooit gedatet', icon: '🌱' },
  { value: 'want-to-start', label: 'Wil beginnen', icon: '🤔' },
  { value: 'single', label: 'Single, weinig actie', icon: '😔' },
  { value: 'matching-no-dates', label: 'Match, geen dates', icon: '💬' },
  { value: 'dating-no-click', label: 'Date, geen klik', icon: '🤷' },
  { value: 'recent-breakup', label: 'Net uit relatie', icon: '💔' },
];

const SINGLE_DURATION_OPTIONS = [
  { value: 'never-relationship', label: 'Nooit relatie gehad', icon: '🌱' },
  { value: 'less-than-month', label: '< 1 maand', icon: '⏰' },
  { value: '1-3-months', label: '1-3 maanden', icon: '📅' },
  { value: '3-6-months', label: '3-6 maanden', icon: '📆' },
  { value: '6-12-months', label: '6-12 maanden', icon: '🗓️' },
  { value: '1-year-plus', label: '> 1 jaar', icon: '⌛' },
];

const DATING_APP_OPTIONS = [
  { value: 'tinder', label: 'Tinder', icon: '🔥' },
  { value: 'bumble', label: 'Bumble', icon: '🐝' },
  { value: 'hinge', label: 'Hinge', icon: '💑' },
  { value: 'happn', label: 'Happn', icon: '📍' },
  { value: 'inner-circle', label: 'Inner Circle', icon: '👥' },
  { value: 'geen', label: 'Geen apps', icon: '❌' },
];

const WEEKLY_MATCHES_OPTIONS = [
  { value: '0-2', label: '0-2 per week', icon: '😢' },
  { value: '3-5', label: '3-5 per week', icon: '😊' },
  { value: '6-10', label: '6-10 per week', icon: '😃' },
  { value: '10-plus', label: '10+ per week', icon: '🔥' },
];

const PROFILE_OPTIONS = [
  { value: 'no-profile', label: 'Nog geen profiel', icon: '❌' },
  { value: 'few-photos', label: 'Weinig foto\'s', icon: '📸' },
  { value: 'boring-bio', label: 'Saaie bio', icon: '📝' },
  { value: 'good-not-working', label: 'Goed, werkt niet', icon: '🤔' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'where-to-start', label: 'Niet weten waar te beginnen', icon: '🤔' },
  { value: 'confidence', label: 'Zelfvertrouwen', icon: '😰' },
  { value: 'presenting-self', label: 'Mezelf presenteren', icon: '🎭' },
  { value: 'starting-convos', label: 'Gesprekken starten', icon: '💬' },
  { value: 'getting-matches', label: 'Matches krijgen', icon: '💔' },
  { value: 'planning-dates', label: 'Dates plannen', icon: '📅' },
];

const GOAL_OPTIONS = [
  { value: 'serious', label: 'Serieuze relatie', icon: '💑' },
  { value: 'open', label: 'Open voor wat komt', icon: '🌟' },
  { value: 'dates-first', label: 'Eerst dates', icon: '☕' },
  { value: 'connections', label: 'Leuke connecties', icon: '🤝' },
];

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ProgressBarProps {
  current: number;
  total: number;
}

function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Stap {current} van {total}
        </span>
        <span className="text-sm font-bold text-pink-600">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface IrisHeaderProps {
  quote: string;
}

function IrisHeader({ quote }: IrisHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mb-6"
    >
      <IrisAvatar size="sm" />
      <p className="text-gray-600 italic">"{quote}"</p>
    </motion.div>
  );
}

interface OptionButtonProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}

function OptionButton({ icon, label, selected, onClick, delay = 0 }: OptionButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-2xl border-2 transition-all duration-200',
        'flex items-center gap-4 text-left',
        'active:scale-[0.98]',
        selected
          ? 'border-pink-500 bg-pink-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/50'
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className={cn(
        'font-medium text-base',
        selected ? 'text-pink-700' : 'text-gray-800'
      )}>
        {label}
      </span>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto"
        >
          <Check className="w-5 h-5 text-pink-600" />
        </motion.div>
      )}
    </motion.button>
  );
}

interface MultiSelectButtonProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}

function MultiSelectButton({ icon, label, selected, onClick, delay = 0 }: MultiSelectButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      className={cn(
        'p-3 rounded-xl border-2 transition-all duration-200',
        'flex items-center gap-2',
        'active:scale-[0.97]',
        selected
          ? 'border-pink-500 bg-pink-500 text-white shadow-md'
          : 'border-gray-200 bg-white text-gray-800 hover:border-pink-300'
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
      {selected && <Check className="w-4 h-4 ml-auto" />}
    </motion.button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function KickstartStepOnboarding({
  userName,
  onComplete,
  className,
}: KickstartStepOnboardingProps) {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form data
  const [formData, setFormData] = useState<Partial<KickstartIntakeData>>({
    datingApps: [],
  });

  // UI state for multi-step questions
  const [datingStatusStep, setDatingStatusStep] = useState<1 | 2>(1);
  const [appsStep, setAppsStep] = useState<1 | 2>(1);
  const [difficultyGoalStep, setDifficultyGoalStep] = useState<1 | 2>(1);
  const [deepStep, setDeepStep] = useState<1 | 2>(1);

  const currentStep = STEPS[currentStepIndex];
  const progressSteps = STEPS.filter(s => s.showProgress);
  const currentProgressIndex = progressSteps.findIndex(s => s.id === currentStep.id) + 1;

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------
  const goToStep = (stepId: StepId) => {
    const index = STEPS.findIndex(s => s.id === stepId);
    if (index !== -1) setCurrentStepIndex(index);
  };

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // ---------------------------------------------------------------------------
  // FORM HANDLERS
  // ---------------------------------------------------------------------------
  const updateForm = <K extends keyof KickstartIntakeData>(
    key: K,
    value: KickstartIntakeData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleComplete = () => {
    goToStep('processing');

    setTimeout(() => {
      goToStep('success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }, 2000);

    setTimeout(() => {
      onComplete(formData as KickstartIntakeData);
    }, 4000);
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------
  const renderStepContent = () => {
    switch (currentStep.id) {
      // -----------------------------------------------------------------------
      // WELCOME
      // -----------------------------------------------------------------------
      case 'welcome':
        return (
          <motion.div
            key="welcome"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center min-h-[70vh] px-4"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-6 text-center">
              {/* Video */}
              <div className="mb-6 rounded-2xl overflow-hidden bg-gray-100 relative">
                <video
                  ref={videoRef}
                  src="/videos/onboarding/Welkom_onboarding.mp4"
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className="w-full aspect-video object-cover"
                />
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (videoRef.current) videoRef.current.muted = !isMuted;
                  }}
                  className="absolute bottom-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {['21 Dagen', 'Persoonlijke coaching', 'Op maat'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-lg rounded-xl shadow-lg"
              >
                Start intake gesprek
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="mt-4 text-sm text-gray-400">Duurt slechts 3 minuten</p>
            </div>
          </motion.div>
        );

      // -----------------------------------------------------------------------
      // NAME
      // -----------------------------------------------------------------------
      case 'name':
        return (
          <StepContainer key="name" irisQuote={currentStep.irisQuote!}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hoe mag ik je noemen?
            </h2>
            <p className="text-gray-500 mb-6">Je voornaam is voldoende</p>

            <input
              type="text"
              value={formData.preferredName || ''}
              onChange={(e) => updateForm('preferredName', e.target.value)}
              placeholder="Bijv. Mark"
              className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all mb-6"
              autoFocus
            />

            <Button
              onClick={nextStep}
              disabled={!formData.preferredName?.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white py-4 text-base rounded-xl"
            >
              Volgende
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // GENDER + LOOKING FOR
      // -----------------------------------------------------------------------
      case 'gender-lookingfor':
        return (
          <StepContainer key="gender" irisQuote={currentStep.irisQuote!}>
            {!formData.gender ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Ik ben een...
                </h2>
                <div className="space-y-3">
                  {GENDER_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.gender === opt.value}
                      onClick={() => updateForm('gender', opt.value as any)}
                      delay={i * 0.05}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Ik zoek naar...
                </h2>
                <div className="space-y-3">
                  {LOOKING_FOR_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.lookingFor === opt.value}
                      onClick={() => {
                        updateForm('lookingFor', opt.value as any);
                        setTimeout(nextStep, 300);
                      }}
                      delay={i * 0.05}
                    />
                  ))}
                </div>
                <button
                  onClick={() => updateForm('gender', undefined as any)}
                  className="mt-4 text-gray-500 text-sm hover:text-pink-600 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Terug
                </button>
              </>
            )}
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // REGION + AGE
      // -----------------------------------------------------------------------
      case 'region-age':
        return (
          <StepContainer key="region" irisQuote={currentStep.irisQuote!}>
            {!formData.region ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  In welke regio woon je?
                </h2>
                <p className="text-gray-500 mb-6">Helpt me met lokale date tips</p>
                <div className="grid grid-cols-2 gap-2">
                  {REGION_OPTIONS.map((opt, i) => (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => updateForm('region', opt.value)}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all',
                        'flex items-center gap-2',
                        formData.region === opt.value
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      )}
                    >
                      <span>{opt.icon}</span>
                      <span className="font-medium text-sm text-gray-800">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hoe oud ben je?
                </h2>
                <p className="text-gray-500 mb-6">We passen de tips aan op je leeftijd</p>

                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateForm('age', parseInt(e.target.value) || 0)}
                  placeholder="Bijv. 28"
                  min={18}
                  max={99}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all mb-6"
                  autoFocus
                />

                <Button
                  onClick={nextStep}
                  disabled={!formData.age || formData.age < 18}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white py-4 text-base rounded-xl"
                >
                  Volgende
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <button
                  onClick={() => updateForm('region', undefined as any)}
                  className="mt-4 text-gray-500 text-sm hover:text-pink-600 flex items-center gap-1 mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" /> Terug
                </button>
              </>
            )}
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // DATING STATUS
      // -----------------------------------------------------------------------
      case 'dating-status':
        return (
          <StepContainer key="dating-status" irisQuote={currentStep.irisQuote!}>
            {datingStatusStep === 1 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Wat is je huidige dating situatie?
                </h2>
                <div className="space-y-2">
                  {DATING_STATUS_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.datingStatus === opt.value}
                      onClick={() => {
                        updateForm('datingStatus', opt.value as any);
                        setTimeout(() => setDatingStatusStep(2), 300);
                      }}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hoe lang ben je al single?
                </h2>
                <div className="space-y-2">
                  {SINGLE_DURATION_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.singleDuration === opt.value}
                      onClick={() => {
                        updateForm('singleDuration', opt.value as any);
                        setTimeout(nextStep, 300);
                      }}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setDatingStatusStep(1)}
                  className="mt-4 text-gray-500 text-sm hover:text-pink-600 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Terug
                </button>
              </>
            )}
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // DATING APPS
      // -----------------------------------------------------------------------
      case 'dating-apps':
        return (
          <StepContainer key="dating-apps" irisQuote={currentStep.irisQuote!}>
            {appsStep === 1 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welke dating apps gebruik je?
                </h2>
                <p className="text-gray-500 mb-6">Selecteer alle die je gebruikt</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {DATING_APP_OPTIONS.map((opt, i) => (
                    <MultiSelectButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.datingApps?.includes(opt.value) || false}
                      onClick={() => {
                        const current = formData.datingApps || [];
                        const updated = current.includes(opt.value)
                          ? current.filter(v => v !== opt.value)
                          : [...current, opt.value];
                        updateForm('datingApps', updated);
                      }}
                      delay={i * 0.03}
                    />
                  ))}
                </div>
                <Button
                  onClick={() => {
                    if (formData.datingApps?.includes('geen')) {
                      updateForm('weeklyMatches', '0-2' as any);
                      nextStep();
                    } else {
                      setAppsStep(2);
                    }
                  }}
                  disabled={!formData.datingApps?.length}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white py-4 text-base rounded-xl"
                >
                  Volgende
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hoeveel matches krijg je per week?
                </h2>
                <div className="space-y-3">
                  {WEEKLY_MATCHES_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.weeklyMatches === opt.value}
                      onClick={() => {
                        updateForm('weeklyMatches', opt.value as any);
                        setTimeout(nextStep, 300);
                      }}
                      delay={i * 0.05}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setAppsStep(1)}
                  className="mt-4 text-gray-500 text-sm hover:text-pink-600 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Terug
                </button>
              </>
            )}
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // FRUSTRATION
      // -----------------------------------------------------------------------
      case 'frustration':
        return (
          <StepContainer key="frustration" irisQuote={currentStep.irisQuote!}>
            {!formData.profileDescription ? (
              !formData.biggestFrustration ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Wat is je grootste frustratie?
                  </h2>
                  <p className="text-gray-500 mb-6">Vertel het in je eigen woorden</p>

                  <textarea
                    value={formData.biggestFrustration || ''}
                    onChange={(e) => updateForm('biggestFrustration', e.target.value)}
                    placeholder="Bijv. Gesprekken lopen altijd dood na een paar berichten..."
                    rows={4}
                    className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none mb-6"
                    autoFocus
                  />

                  <Button
                    onClick={() => {
                      // Force re-render to show next question
                      if (formData.biggestFrustration?.trim()) {
                        setFormData(prev => ({ ...prev }));
                      }
                    }}
                    disabled={!formData.biggestFrustration?.trim()}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white py-4 text-base rounded-xl"
                  >
                    Volgende
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Hoe zou je je profiel omschrijven?
                  </h2>
                  <div className="space-y-3">
                    {PROFILE_OPTIONS.map((opt, i) => (
                      <OptionButton
                        key={opt.value}
                        icon={opt.icon}
                        label={opt.label}
                        selected={formData.profileDescription === opt.value}
                        onClick={() => {
                          updateForm('profileDescription', opt.value as any);
                          setTimeout(nextStep, 300);
                        }}
                        delay={i * 0.05}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => updateForm('biggestFrustration', undefined as any)}
                    className="mt-4 text-gray-500 text-sm hover:text-pink-600 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Terug
                  </button>
                </>
              )
            ) : null}
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // DIFFICULTY + GOAL
      // -----------------------------------------------------------------------
      case 'difficulty-goal':
        return (
          <StepContainer key="difficulty-goal" irisQuote={currentStep.irisQuote!}>
            {difficultyGoalStep === 1 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Wat vind je het moeilijkste?
                </h2>
                <div className="space-y-2">
                  {DIFFICULTY_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.biggestDifficulty === opt.value}
                      onClick={() => {
                        updateForm('biggestDifficulty', opt.value as any);
                        setTimeout(() => setDifficultyGoalStep(2), 300);
                      }}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Wat zoek je in dating?
                </h2>
                <div className="space-y-3">
                  {GOAL_OPTIONS.map((opt, i) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      selected={formData.relationshipGoal === opt.value}
                      onClick={() => {
                        updateForm('relationshipGoal', opt.value as any);
                        setTimeout(nextStep, 300);
                      }}
                      delay={i * 0.05}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setDifficultyGoalStep(1)}
                  className="mt-4 text-gray-500 text-sm hover:text-pink-600 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Terug
                </button>
              </>
            )}
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // CONFIDENCE
      // -----------------------------------------------------------------------
      case 'confidence':
        return (
          <StepContainer key="confidence" irisQuote={currentStep.irisQuote!}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hoe zelfverzekerd voel je je in dating?
            </h2>
            <p className="text-gray-500 mb-8">1 = niet, 10 = super zelfverzekerd</p>

            {/* Value display */}
            <motion.div
              key={formData.confidenceLevel}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
            >
              {formData.confidenceLevel || 5}
            </motion.div>

            {/* Number grid */}
            <div className="grid grid-cols-5 gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => updateForm('confidenceLevel', num)}
                  className={cn(
                    'aspect-square rounded-xl font-semibold text-lg transition-all',
                    'border-2 active:scale-95',
                    formData.confidenceLevel === num
                      ? 'border-pink-500 bg-pink-500 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                  )}
                >
                  {num}
                </button>
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={!formData.confidenceLevel}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white py-4 text-base rounded-xl"
            >
              Volgende
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // DEEP QUESTIONS
      // -----------------------------------------------------------------------
      case 'deep-questions':
        return (
          <StepContainer key="deep" irisQuote={currentStep.irisQuote!}>
            {deepStep === 1 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Wat is je grootste angst in dating?
                </h2>
                <p className="text-gray-500 mb-6">Dit blijft tussen ons</p>

                <textarea
                  value={formData.biggestFear || ''}
                  onChange={(e) => updateForm('biggestFear', e.target.value)}
                  placeholder="Bijv. Dat ik niet goed genoeg ben, afwijzing..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none mb-6"
                  autoFocus
                />

                <Button
                  onClick={() => setDeepStep(2)}
                  disabled={!formData.biggestFear?.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white py-4 text-base rounded-xl"
                >
                  Volgende
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hoe ziet je ideale dating leven eruit over 3 maanden?
                </h2>
                <p className="text-gray-500 mb-6">Droom even groot</p>

                <textarea
                  value={formData.idealOutcome || ''}
                  onChange={(e) => updateForm('idealOutcome', e.target.value)}
                  placeholder="Bijv. Leuke dates, zelfverzekerd, misschien wel verliefd..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none mb-6"
                  autoFocus
                />

                <Button
                  onClick={handleComplete}
                  disabled={!formData.idealOutcome?.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 text-white py-4 text-base rounded-xl"
                >
                  Afronden
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
                <button
                  onClick={() => setDeepStep(1)}
                  className="mt-4 text-gray-500 text-sm hover:text-pink-600 flex items-center gap-1 mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" /> Terug
                </button>
              </>
            )}
          </StepContainer>
        );

      // -----------------------------------------------------------------------
      // PROCESSING
      // -----------------------------------------------------------------------
      case 'processing':
        return (
          <motion.div
            key="processing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center min-h-[70vh] px-4"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-pink-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Iris maakt je plan...
              </h2>
              <p className="text-gray-500">
                We stemmen alles af op jouw situatie
              </p>
            </div>
          </motion.div>
        );

      // -----------------------------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------------------------
      case 'success':
        return (
          <motion.div
            key="success"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center min-h-[70vh] px-4"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Je bent klaar, {formData.preferredName}!
              </h2>
              <p className="text-gray-500 mb-6">
                Je persoonlijke 21-dagen programma staat klaar
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                  ✓ Plan gemaakt
                </span>
                <span className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-100">
                  ♡ Iris wacht op je
                </span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // STEP CONTAINER COMPONENT
  // ---------------------------------------------------------------------------
  interface StepContainerProps {
    children: React.ReactNode;
    irisQuote: string;
  }

  function StepContainer({ children, irisQuote }: StepContainerProps) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-[100dvh] flex flex-col px-4 py-6 sm:py-8"
      >
        {/* Progress */}
        <div className="mb-6">
          <ProgressBar current={currentProgressIndex} total={progressSteps.length} />
        </div>

        {/* Iris header */}
        <IrisHeader quote={irisQuote} />

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className={cn('min-h-[100dvh] bg-gray-50', className)}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
        />
      )}

      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}
