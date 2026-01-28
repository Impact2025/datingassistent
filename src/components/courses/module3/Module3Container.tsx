'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, Compass } from 'lucide-react';
import { Les3_1_Authenticiteit } from './lessons/Les3_1_Authenticiteit';
import { Les3_2_Connectie } from './lessons/Les3_2_Connectie';
import { Les3_3_Trigger } from './lessons/Les3_3_Trigger';
import { Les3_4_Evidence } from './lessons/Les3_4_Evidence';
import { Les3_5_Intentie } from './lessons/Les3_5_Intentie';
import { Module3ErrorBoundary } from './Module3ErrorBoundary';
import {
  Module3Phase,
  Module3UserProfile,
  Module3Progress,
  PHASE_LABELS,
  PHASE_EMOJIS,
  calculateProgressPercentage
} from './types/module3.types';

/**
 * Props for the Module3Container component
 * @interface Module3ContainerProps
 */
interface Module3ContainerProps {
  /** User profile data including Module 3 progress and preferences */
  userProfile: Module3UserProfile;
  /** Callback fired when the entire module is completed */
  onComplete?: () => void;
  /** Callback fired when user wants to go back to course selection */
  onBack?: () => void;
}

const LESSON_COMPONENTS = {
  authenticiteit: Les3_1_Authenticiteit,
  connectie: Les3_2_Connectie,
  trigger: Les3_3_Trigger,
  evidence: Les3_4_Evidence,
  intentie: Les3_5_Intentie,
};

const LESSON_ORDER: Module3Phase[] = ['authenticiteit', 'connectie', 'trigger', 'evidence', 'intentie'];

/**
 * Main container component for Module 3: "Profieltekst die wel werkt"
 *
 * This component orchestrates the complete A.C.T.I.E. (Authenticiteit, Connectie, Trigger, Evidence, Intentie)
 * learning experience for creating effective dating profiles.
 *
 * Features:
 * - 5 interactive lessons with AI-powered analysis
 * - Progress tracking and state management
 * - Error boundaries for robust error handling
 * - Premium content gating
 * - Responsive design for all devices
 *
 * @param props - Component props
 * @returns JSX.Element - The complete Module 3 interface
 */
export function Module3Container({ userProfile, onComplete, onBack }: Module3ContainerProps) {
  const [currentPhase, setCurrentPhase] = useState<Module3Phase>('authenticiteit');
  const [completedPhases, setCompletedPhases] = useState<Module3Phase[]>([]);
  const [progress, setProgress] = useState<Partial<Module3Progress>>({});

  // Initialize progress from user profile
  useEffect(() => {
    const initialProgress: Partial<Module3Progress> = {
      currentPhase: 'authenticiteit',
      completedPhases: [],
      authenticiteitValidated: userProfile.profieltekst_kernkrachten_validatie || false,
      clichéScore: userProfile.profieltekst_cliché_score || 0,
      triggerBestScore: userProfile.trigger_zin_kwaliteit_score || 0,
      proofCount: userProfile.profieltekst_proof_count || 0,
    };

    // Determine completed phases based on data
    const completed: Module3Phase[] = [];
    if (initialProgress.authenticiteitValidated) completed.push('authenticiteit');
    if (initialProgress.clichéScore && initialProgress.clichéScore > 0) completed.push('connectie');
    if (initialProgress.triggerBestScore && initialProgress.triggerBestScore > 0) completed.push('trigger');
    if (initialProgress.proofCount && initialProgress.proofCount > 0) completed.push('evidence');
    if (userProfile.profieltekst_hechtings_audit) completed.push('intentie');

    initialProgress.completedPhases = completed;
    setProgress(initialProgress);

    // Set current phase to first incomplete lesson
    const firstIncomplete = LESSON_ORDER.find(phase => !completed.includes(phase));
    if (firstIncomplete) {
      setCurrentPhase(firstIncomplete);
    } else {
      setCurrentPhase('intentie'); // All complete, show last lesson
    }
  }, [userProfile]);

  const handleLessonComplete = (lessonData: any) => {
    const newCompletedPhases = [...completedPhases];
    if (!newCompletedPhases.includes(currentPhase)) {
      newCompletedPhases.push(currentPhase);
    }

    setCompletedPhases(newCompletedPhases);
    setProgress(prev => ({
      ...prev,
      completedPhases: newCompletedPhases,
      ...lessonData
    }));

    // Move to next lesson
    const currentIndex = LESSON_ORDER.indexOf(currentPhase);
    if (currentIndex < LESSON_ORDER.length - 1) {
      const nextPhase = LESSON_ORDER[currentIndex + 1];
      setCurrentPhase(nextPhase);
    } else {
      // All lessons complete
      handleModuleComplete();
    }
  };

  const handleModuleComplete = async () => {
    try {
      await fetch('/api/user/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          module3_completed_at: new Date().toISOString()
        })
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to mark module as complete:', error);
      // Still call onComplete for UX
      if (onComplete) {
        onComplete();
      }
    }
  };

  const navigateToPhase = (phase: Module3Phase) => {
    // Allow navigation to completed phases or the current phase
    if (completedPhases.includes(phase) || phase === currentPhase) {
      setCurrentPhase(phase);
    }
  };

  const canNavigateToPhase = (phase: Module3Phase) => {
    return completedPhases.includes(phase) || phase === currentPhase;
  };

  const progressPercentage = progress.completedPhases ? calculateProgressPercentage(progress as Module3Progress) : 0;
  const CurrentLessonComponent = currentPhase !== 'completed' ? LESSON_COMPONENTS[currentPhase] : null;

  return (
    <Module3ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Card className="border-0 bg-white shadow-sm rounded-xl">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-coral-100 rounded-2xl flex items-center justify-center">
            <Compass className="w-8 h-8 text-coral-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Module 3: Profieltekst die wel werkt
          </CardTitle>
          <p className="text-gray-600 mt-3 text-lg">
            Het A.C.T.I.E. model voor effectieve dating profielen
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Progress Overview */}
          <Card className="bg-gray-50 border-0 rounded-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Voortgang</span>
                  <span className="text-gray-600">
                    {completedPhases.length} van {LESSON_ORDER.length} lessen compleet
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3 bg-gray-200" />

                {/* Phase Navigation */}
                <div className="grid grid-cols-5 gap-3 mt-6">
                  {LESSON_ORDER.map((phase, index) => {
                    const isCompleted = completedPhases.includes(phase);
                    const isCurrent = phase === currentPhase;
                    const canNavigate = canNavigateToPhase(phase);

                    return (
                      <button
                        key={phase}
                        onClick={() => canNavigate && navigateToPhase(phase)}
                        disabled={!canNavigate}
                        className={`p-4 rounded-xl text-center transition-all border-2 ${
                          isCurrent
                            ? 'bg-coral-500 text-white border-coral-500 shadow-md'
                            : isCompleted
                            ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                            : 'bg-white text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-xl mb-2">{PHASE_EMOJIS[phase]}</div>
                        <div className="text-xs font-semibold">{phase.toUpperCase()[0]}</div>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 mx-auto mt-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Lesson Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 rounded-xl">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-blue-900 text-lg mb-2">
                Huidige Les: {PHASE_LABELS[currentPhase]}
              </h3>
              <p className="text-blue-700 leading-relaxed">
                {currentPhase === 'authenticiteit' && 'Bevestig je kernwaarden voor authentieke communicatie'}
                {currentPhase === 'connectie' && 'Leer clichés herkennen voor betere verbinding'}
                {currentPhase === 'trigger' && 'Creëer effectieve openingszinnen met AI hulp'}
                {currentPhase === 'evidence' && 'Transformeer beweringen in geloofwaardige verhalen'}
                {currentPhase === 'intentie' && 'Ontdek je relatie-intenties voor optimale communicatie'}
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      <div className="space-y-6">
        {currentPhase === 'authenticiteit' && (
          <Les3_1_Authenticiteit
            userProfile={userProfile}
            onComplete={handleLessonComplete}
          />
        )}
        {currentPhase === 'connectie' && (
          <Les3_2_Connectie
            userProfile={userProfile}
            onComplete={handleLessonComplete}
          />
        )}
        {currentPhase === 'trigger' && (
          <Les3_3_Trigger
            userProfile={userProfile}
            onComplete={handleLessonComplete}
          />
        )}
        {currentPhase === 'evidence' && (
          <Les3_4_Evidence
            userProfile={userProfile}
            onComplete={handleLessonComplete}
          />
        )}
        {currentPhase === 'intentie' && (
          <Les3_5_Intentie
            userProfile={userProfile}
            onComplete={handleLessonComplete}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-gray-300 hover:bg-gray-50 px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar Cursussen
        </Button>

        {completedPhases.length === LESSON_ORDER.length && (
          <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Module Voltooid!
          </Badge>
        )}
      </div>
    </div>
    </Module3ErrorBoundary>
  );
}