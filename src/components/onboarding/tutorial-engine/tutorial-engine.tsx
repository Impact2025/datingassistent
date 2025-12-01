"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TutorialModal } from './tutorial-modal';
import { TooltipGuide } from './tooltip-guide';
import { StepByStepWalkthrough } from './step-by-step-walkthrough';
import { ProgressCelebration } from './progress-celebration';
import { useTutorialAnalytics } from '@/hooks/use-tutorial/use-tutorial-analytics';

// Tutorial Types
export interface TutorialStep {
  id: string;
  type: 'modal' | 'tooltip' | 'walkthrough' | 'celebration';
  title?: string;
  content: string;
  target?: string; // CSS selector for tooltips/walkthroughs
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'scroll';
  autoAdvance?: boolean;
  showSkip?: boolean;
  duration?: number; // for auto-advance
  media?: {
    type: 'video' | 'image' | 'animation';
    url: string;
    alt?: string;
  };
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  targetTool: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: TutorialStep[];
  prerequisites?: string[]; // other tutorial IDs
  category: 'tool-introduction' | 'skill-building' | 'troubleshooting' | 'advanced-features';
  triggers: TutorialTrigger[];
}

export interface TutorialTrigger {
  type: 'first-visit' | 'user-action' | 'time-based' | 'error-state' | 'success-milestone';
  condition?: any;
  delay?: number; // seconds
}

export interface TutorialProgress {
  tutorialId: string;
  userId: string;
  currentStep: number;
  completedSteps: number[];
  startedAt: Date;
  completedAt?: Date;
  skipped?: boolean;
  timeSpent: number; // seconds
  interactions: TutorialInteraction[];
}

export interface TutorialInteraction {
  stepId: string;
  action: string; // Allow flexible action types
  timestamp: Date;
  metadata?: any;
}

// Context
interface TutorialContextType {
  activeTutorial: Tutorial | null;
  currentStep: number;
  isVisible: boolean;
  progress: TutorialProgress | null;

  // Actions
  startTutorial: (tutorialId: string) => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;

  // State queries
  isTutorialCompleted: (tutorialId: string) => boolean;
  getTutorialProgress: (tutorialId: string) => TutorialProgress | null;
  getRecommendedTutorials: () => Tutorial[];
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Tutorial Engine Component
export function TutorialEngine({ children }: { children: React.ReactNode }) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState<TutorialProgress | null>(null);

  const { trackEvent, trackCompletion, trackSkip } = useTutorialAnalytics();

  // Auto-advance timer
  useEffect(() => {
    if (!activeTutorial || !isVisible) return;

    const currentStepData = activeTutorial.steps[currentStep];
    if (currentStepData?.autoAdvance && currentStepData.duration) {
      const timer = setTimeout(() => {
        nextStep();
      }, currentStepData.duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [activeTutorial, currentStep, isVisible]);

  const startTutorial = useCallback(async (tutorialId: string) => {
    try {
      // Load tutorial data (in real implementation, this would come from API/database)
      const tutorial = await loadTutorial(tutorialId);
      if (!tutorial) return;

      setActiveTutorial(tutorial);
      setCurrentStep(0);
      setIsVisible(true);

      // Initialize progress tracking
      const newProgress: TutorialProgress = {
        tutorialId,
        userId: 'current-user', // Would get from auth context
        currentStep: 0,
        completedSteps: [],
        startedAt: new Date(),
        timeSpent: 0,
        interactions: [{
          stepId: tutorial.steps[0].id,
          action: 'view',
          timestamp: new Date()
        }]
      };

      setProgress(newProgress);
      trackEvent('tutorial_started', { tutorialId, tutorialName: tutorial.name });
    } catch (error) {
      console.error('Failed to start tutorial:', error);
    }
  }, [trackEvent]);

  const nextStep = useCallback(() => {
    if (!activeTutorial) return;

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex >= activeTutorial.steps.length) {
      completeTutorial();
      return;
    }

    setCurrentStep(nextStepIndex);

    // Track step completion
    if (progress) {
      const updatedProgress = {
        ...progress,
        currentStep: nextStepIndex,
        completedSteps: [...progress.completedSteps, currentStep],
        interactions: [...progress.interactions, {
          stepId: activeTutorial.steps[nextStepIndex].id,
          action: 'view',
          timestamp: new Date()
        }]
      };
      setProgress(updatedProgress);
    }

    trackEvent('tutorial_step_completed', {
      tutorialId: activeTutorial.id,
      stepId: activeTutorial.steps[currentStep].id,
      stepIndex: currentStep
    });
  }, [activeTutorial, currentStep, progress, trackEvent]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    if (!activeTutorial || !progress) return;

    const updatedProgress = {
      ...progress,
      skipped: true,
      completedAt: new Date()
    };
    setProgress(updatedProgress);

    setActiveTutorial(null);
    setIsVisible(false);
    setCurrentStep(0);

    trackSkip(activeTutorial.id, currentStep);
  }, [activeTutorial, progress, currentStep, trackSkip]);

  const completeTutorial = useCallback(() => {
    if (!activeTutorial || !progress) return;

    const updatedProgress = {
      ...progress,
      completedAt: new Date(),
      completedSteps: [...progress.completedSteps, currentStep]
    };
    setProgress(updatedProgress);

    setActiveTutorial(null);
    setIsVisible(false);
    setCurrentStep(0);

    trackCompletion(activeTutorial.id, progress.timeSpent);
  }, [activeTutorial, progress, currentStep, trackCompletion]);

  const isTutorialCompleted = useCallback((tutorialId: string) => {
    // In real implementation, check from database/API
    return false;
  }, []);

  const getTutorialProgress = useCallback((tutorialId: string) => {
    // In real implementation, fetch from database/API
    return null;
  }, []);

  const getRecommendedTutorials = useCallback(() => {
    // In real implementation, use AI to recommend based on user behavior
    return [];
  }, []);

  const contextValue: TutorialContextType = {
    activeTutorial,
    currentStep,
    isVisible,
    progress,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    isTutorialCompleted,
    getTutorialProgress,
    getRecommendedTutorials
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}

      {/* Render active tutorial component */}
      {activeTutorial && isVisible && (
        <TutorialRenderer
          tutorial={activeTutorial}
          currentStep={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTutorial}
          onComplete={completeTutorial}
        />
      )}
    </TutorialContext.Provider>
  );
}

// Tutorial Renderer Component
function TutorialRenderer({
  tutorial,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete
}: {
  tutorial: Tutorial;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const step = tutorial.steps[currentStep];

  switch (step.type) {
    case 'modal':
      return (
        <TutorialModal
          step={step}
          isFirst={currentStep === 0}
          isLast={currentStep === tutorial.steps.length - 1}
          onNext={onNext}
          onPrevious={onPrevious}
          onSkip={onSkip}
          onComplete={onComplete}
        />
      );

    case 'tooltip':
      return (
        <TooltipGuide
          step={step}
          onNext={onNext}
          onSkip={onSkip}
        />
      );

    case 'walkthrough':
      return (
        <StepByStepWalkthrough
          tutorial={tutorial}
          currentStep={currentStep}
          onNext={onNext}
          onPrevious={onPrevious}
          onSkip={onSkip}
          onComplete={onComplete}
        />
      );

    case 'celebration':
      return (
        <ProgressCelebration
          step={step}
          onComplete={onComplete}
        />
      );

    default:
      return null;
  }
}

// Hook to use tutorial context
export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialEngine');
  }
  return context;
}

// Mock tutorial loader (replace with real API call)
async function loadTutorial(tutorialId: string): Promise<Tutorial | null> {
  // This would normally fetch from database/API
  const mockTutorials: Record<string, Tutorial> = {
    'emotional-readiness-intro': {
      id: 'emotional-readiness-intro',
      name: 'Emotionele Ready Scan - Introductie',
      description: 'Leer hoe je de emotionele readiness scan gebruikt om te bepalen of je klaar bent om te daten',
      targetTool: 'emotional-readiness',
      difficulty: 'beginner',
      estimatedTime: 3,
      category: 'tool-introduction',
      triggers: [{ type: 'first-visit' }],
      steps: [
        {
          id: 'welcome',
          type: 'modal',
          title: 'Welkom bij de Emotionele Ready Scan! 🎯',
          content: 'Deze scan helpt je om eerlijk te bepalen of je emotioneel klaar bent om te daten. Geen oordeel, alleen inzichten die je helpen betere beslissingen te nemen.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'why-important',
          type: 'modal',
          title: 'Waarom deze scan belangrijk is',
          content: 'Daten wanneer je niet klaar bent kan leiden tot pijnlijke ervaringen. Deze scan helpt je om eerst te helen voordat je nieuwe verbindingen aangaat.',
          position: 'center',
          autoAdvance: true,
          duration: 4
        },
        {
          id: 'how-it-works',
          type: 'modal',
          title: 'Hoe het werkt',
          content: 'Beantwoord 15 vragen eerlijk. De AI analyseert je antwoorden en geeft je een persoonlijk rapport met concrete vervolgstappen.',
          position: 'center',
          showSkip: true
        }
      ]
    },
    'profile-suite-basics': {
      id: 'profile-suite-basics',
      name: 'Profiel Optimalisatie - Complete Gids',
      description: 'Leer hoe je een winnend dating profiel maakt met AI hulp',
      targetTool: 'profile-suite',
      difficulty: 'beginner',
      estimatedTime: 8,
      category: 'tool-introduction',
      triggers: [{ type: 'first-visit' }],
      steps: [
        {
          id: 'profile-intro',
          type: 'modal',
          title: 'Welkom bij Profiel Optimalisatie! 📸✍️',
          content: 'Je profiel is je eerste indruk. Laten we samen een profiel maken dat écht bij je past en matches aantrekt.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'foundation-first',
          type: 'modal',
          title: 'Basis eerst: Ken jezelf',
          content: 'Voordat we je profiel maken, is het slim om je eigen patronen te kennen. Dit helpt bij betere matches.',
          position: 'center',
          autoAdvance: true,
          duration: 3
        },
        {
          id: 'hechtingsstijl-highlight',
          type: 'tooltip',
          title: 'Start met Hechtingsstijl',
          content: 'Deze scan laat zien hoe je liefhebt en verbindt. Super waardevol voor dating!',
          target: '[data-tutorial="hechtingsstijl-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'emotional-ready-highlight',
          type: 'tooltip',
          title: 'Check je emotionele beschikbaarheid',
          content: 'Ben je klaar voor dating? Deze scan geeft eerlijke inzichten.',
          target: '[data-tutorial="emotional-ready-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'profile-builder-intro',
          type: 'modal',
          title: 'Nu je profieltekst maken! ✍️',
          content: 'De Profiel Bouwer helpt je met AI om een tekst te schrijven die echt bij je past.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'profile-builder-highlight',
          type: 'tooltip',
          title: 'Profiel Bouwer - Je AI schrijfassistent',
          content: 'Klik hier om je profieltekst te maken. De AI helpt je om authentiek en aantrekkelijk te schrijven.',
          target: '[data-tutorial="profile-builder-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'photo-importance',
          type: 'modal',
          title: 'Foto\'s zijn 80% van je profiel! 📸',
          content: 'Mensen beslissen in 3 seconden of ze je leuk vinden, vooral gebaseerd op je foto\'s.',
          position: 'center',
          autoAdvance: true,
          duration: 4
        },
        {
          id: 'photo-analysis-highlight',
          type: 'tooltip',
          title: 'Foto Analyse - AI feedback',
          content: 'Upload je foto\'s en krijg professionele feedback van onze AI.',
          target: '[data-tutorial="photo-analysis-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'platform-match-intro',
          type: 'modal',
          title: 'Het juiste platform kiezen 🎯',
          content: 'Niet alle apps zijn hetzelfde. De Platform Match tool helpt je de beste keuze maken.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'platform-match-highlight',
          type: 'tooltip',
          title: 'Platform Match - Wetenschappelijke keuze',
          content: 'Ontdek welke dating app het beste bij jouw persoonlijkheid en doelen past.',
          target: '[data-tutorial="platform-match-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'completion-celebration',
          type: 'celebration',
          title: 'Profiel Master geworden! 🏆',
          content: 'Je hebt nu alle tools om een winnend profiel te maken. Veel succes met daten!',
          position: 'center'
        }
      ]
    },
    'communication-hub-basics': {
      id: 'communication-hub-basics',
      name: 'Communicatie Hub - Complete Gids',
      description: 'Leer hoe je effectief communiceert in dating met AI hulp',
      targetTool: 'communication-hub',
      difficulty: 'intermediate',
      estimatedTime: 10,
      category: 'tool-introduction',
      triggers: [{ type: 'first-visit' }],
      steps: [
        {
          id: 'communication-intro',
          type: 'modal',
          title: 'Welkom bij de Communicatie Hub! 💬✨',
          content: 'Goede communicatie is de sleutel tot succes in dating. Laten we je helpen om zelfverzekerd en effectief te communiceren.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'understanding-yourself',
          type: 'modal',
          title: 'Eerst jezelf begrijpen 📊',
          content: 'Voordat je gaat communiceren, is het slim om je eigen communicatiestijl te kennen. Dit helpt bij betere matches.',
          position: 'center',
          autoAdvance: true,
          duration: 3
        },
        {
          id: 'dating-stijl-highlight',
          type: 'tooltip',
          title: 'Dating Stijl Scan - Je communicatiestijl',
          content: 'Ontdek hoe je natuurlijk communiceert in dating. Dit helpt je om de juiste mensen aan te trekken.',
          target: '[data-tutorial="dating-stijl-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'blind-spots-highlight',
          type: 'tooltip',
          title: 'Blind Vlek Scan - Professionele analyse',
          content: 'Advanced AI analyse van je gedragspatronen. Ontdek waar je verbetering kunt gebruiken.',
          target: '[data-tutorial="blind-vlekken-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'chat-coach-intro',
          type: 'modal',
          title: 'Je persoonlijke Chat Coach 🤖',
          content: '24/7 beschikbaar voor advies over je gesprekken. Stel vragen en krijg directe hulp.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'chat-coach-highlight',
          type: 'tooltip',
          title: 'Chat Coach - Je AI assistent',
          content: 'Klik hier voor directe hulp bij je gesprekken. De AI begrijpt dating en geeft praktisch advies.',
          target: '[data-tutorial="chat-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'conversation-analysis',
          type: 'modal',
          title: 'Gesprekken analyseren 📈',
          content: 'De GespreksAssistent analyseert je gesprekken en geeft feedback over wat goed gaat en wat beter kan.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'gespreks-assistent-highlight',
          type: 'tooltip',
          title: 'GespreksAssistent - AI analyse',
          content: 'Upload je gesprekken voor professionele analyse. Leer van je ervaringen.',
          target: '[data-tutorial="gespreks-assistent-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'openers-intro',
          type: 'modal',
          title: 'Perfecte openingsberichten 💫',
          content: 'Het eerste bericht bepaalt vaak of iemand reageert. Gebruik AI gegenereerde, persoonlijke openers.',
          position: 'center',
          autoAdvance: true,
          duration: 4
        },
        {
          id: 'openers-highlight',
          type: 'tooltip',
          title: 'Openingszinnen - Persoonlijke openers',
          content: 'Genereer openingsberichten die specifiek zijn voor iemands profiel. 3x hogere response rate gegarandeerd.',
          target: '[data-tutorial="openers-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'icebreakers-highlight',
          type: 'tooltip',
          title: 'IJsbrekers - Gesprekstarters',
          content: 'Perfecte vragen voor elke situatie. Van eerste date tot diepgaande gesprekken.',
          target: '[data-tutorial="icebreakers-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'safety-first',
          type: 'modal',
          title: 'Veiligheid gaat altijd voorop 🛡️',
          content: 'Controleer altijd je gesprekken op rode vlaggen. Je veiligheid is het allerbelangrijkst.',
          position: 'center',
          autoAdvance: true,
          duration: 3
        },
        {
          id: 'safety-highlight',
          type: 'tooltip',
          title: 'Veiligheidscheck - Essentieel',
          content: 'Analyseer gesprekken op veiligheid. Detecteer manipulatief gedrag voordat het te laat is.',
          target: '[data-tutorial="safety-card"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'communication-mastery',
          type: 'celebration',
          title: 'Communicatie Master geworden! 🏆',
          content: 'Je hebt nu alle tools om zelfverzekerd en effectief te communiceren in dating. Veel succes met je gesprekken!',
          position: 'center'
        }
      ]
    },
    'ai-relationship-coach-basics': {
      id: 'ai-relationship-coach-basics',
      name: 'AI Relationship Coach - Complete Mastery',
      description: 'Leer hoe je de geavanceerde AI coach gebruikt voor personalized dating guidance',
      targetTool: 'ai-relationship-coach',
      difficulty: 'advanced',
      estimatedTime: 12,
      category: 'tool-introduction',
      triggers: [{ type: 'first-visit' }],
      steps: [
        {
          id: 'ai-coach-welcome',
          type: 'modal',
          title: 'Welkom bij je AI Relationship Coach! 🧠✨',
          content: 'Dit is het meest geavanceerde hulpmiddel in DatingAssistent. De AI analyseert al je data en geeft je personalized coaching die niemand anders kan bieden.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'cross-tool-insights-intro',
          type: 'modal',
          title: 'Cross-Tool Insights - De Kracht van Integratie',
          content: 'De AI combineert data uit al je assessments (emotionele readiness, dating stijl, hechtingsstijl) om diepgaande inzichten te geven.',
          position: 'center',
          autoAdvance: true,
          duration: 4
        },
        {
          id: 'cross-tool-insights-highlight',
          type: 'tooltip',
          title: 'Cross-Tool Insights - Jouw Persoonlijke Analyse',
          content: 'Hier zie je hoe de AI al je tool-resultaten combineert tot actionable inzichten. Hoe meer tools je gebruikt, hoe beter de analyse!',
          target: '[data-tutorial="cross-tool-insights"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'personalized-plans-intro',
          type: 'modal',
          title: 'Personalized Coaching Plannen 🎯',
          content: 'Op basis van je unieke profiel genereert de AI specifieke coaching plannen die perfect bij jou passen.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'coaching-plans-highlight',
          type: 'tooltip',
          title: 'Jouw Personalized Plannen',
          content: 'Deze plannen zijn uniek voor jou gebaseerd op je assessments. Klik erop om gedetailleerde stappen te zien.',
          target: '[data-tutorial="coaching-plans"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'success-metrics-intro',
          type: 'modal',
          title: 'Success Metrics - Jouw Voortgang in Cijfers 📊',
          content: 'Track je vooruitgang met concrete metrics. Zie hoeveel tools je hebt voltooid en hoe je confidence groeit.',
          position: 'center',
          autoAdvance: true,
          duration: 3
        },
        {
          id: 'success-metrics-highlight',
          type: 'tooltip',
          title: 'Success Metrics Dashboard',
          content: 'Dit dashboard toont je algehele voortgang. Tools completed, goals bereikt, confidence score - alles in één overzicht.',
          target: '[data-tutorial="success-metrics"]',
          position: 'bottom',
          showSkip: true
        },
        {
          id: 'action-buttons-intro',
          type: 'modal',
          title: 'Snelle Acties - Direct naar de Juiste Tools 🏃‍♂️',
          content: 'Deze buttons brengen je direct naar de tools die je nu nodig hebt voor je volgende stap.',
          position: 'center',
          showSkip: true
        },
        {
          id: 'goals-button-highlight',
          type: 'tooltip',
          title: 'Doelen Beheren - Stel Concrete Targets',
          content: 'Ga naar de Groei & Doelen module om je relatie doelen te stellen en bij te houden.',
          target: '[data-tutorial="goals-button"]',
          position: 'top',
          showSkip: true
        },
        {
          id: 'skills-button-highlight',
          type: 'tooltip',
          title: 'Skills Ontwikkelen - Leer Nieuwe Technieken',
          content: 'Ontwikkel nieuwe dating skills met onze cursus modules en oefeningen.',
          target: '[data-tutorial="skills-button"]',
          position: 'top',
          showSkip: true
        },
        {
          id: 'chat-coach-button-highlight',
          type: 'tooltip',
          title: 'Chat Coach - Directe Hulp bij Gesprekken',
          content: 'Krijg onmiddellijke AI hulp bij je huidige gesprekken en uitdagingen.',
          target: '[data-tutorial="chat-coach-button"]',
          position: 'top',
          showSkip: true
        },
        {
          id: 'date-planning-button-highlight',
          type: 'tooltip',
          title: 'Date Planning - Plan Perfecte Dates',
          content: 'Gebruik onze tools om memorabele dates te plannen die leiden tot echte connecties.',
          target: '[data-tutorial="date-planning-button"]',
          position: 'top',
          showSkip: true
        },
        {
          id: 'premium-upgrade-intro',
          type: 'modal',
          title: 'Premium Features - Het Volgende Niveau 🚀',
          content: 'Upgrade naar premium voor nog diepere inzichten, real-time coaching, en geavanceerde AI analyses.',
          position: 'center',
          autoAdvance: true,
          duration: 4
        },
        {
          id: 'premium-upgrade-highlight',
          type: 'tooltip',
          title: 'Upgrade naar Premium AI Coaching',
          content: 'Premium gebruikers krijgen: Geavanceerde AI inzichten, Personalized coaching plannen, Real-time progress tracking, Priority support.',
          target: '[data-tutorial="premium-upgrade"]',
          position: 'top',
          showSkip: true
        },
        {
          id: 'ai-coach-mastery',
          type: 'celebration',
          title: 'AI Relationship Coach Master geworden! 🏆🤖',
          content: 'Je beheerst nu het krachtigste hulpmiddel in DatingAssistent. De AI coach zal je begeleiden naar dating succes zoals niemand anders kan!',
          position: 'center'
        }
      ]
    }
  };

  return mockTutorials[tutorialId] || null;
}