"use client";

/**
 * ToolsGuidedTour Component
 *
 * Wereldklasse onboarding voor nieuwe Kickstart gebruikers
 * - Progressive disclosure van tools
 * - Aangepast op user tier
 * - Warme, persoonlijke ervaring
 * - Duidelijke waarde communicatie
 */

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Heart,
  MessageCircle,
  Camera,
  FileText,
  Zap,
  CheckCircle2,
  Lock,
  Crown,
  Rocket,
  Star,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgramTier } from '@/lib/access-control';

interface ToolsGuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userTier: ProgramTier;
}

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  tools?: {
    name: string;
    icon: React.ReactNode;
    description: string;
    access: 'full' | 'limited' | 'locked';
    limit?: string;
  }[];
  tip?: string;
  animation?: 'pulse' | 'bounce' | 'glow';
}

// Tour steps voor Kickstart gebruikers
const KICKSTART_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welkom bij je Tools Hub!',
    subtitle: 'Je persoonlijke dating toolkit',
    description: 'Gefeliciteerd met je Kickstart aankoop! Je hebt nu toegang tot krachtige AI-tools die je helpen bij elke stap van je dating journey. Laten we je rondleiden.',
    icon: <Gift className="w-12 h-12 text-pink-500" />,
    animation: 'glow'
  },
  {
    id: 'scans',
    title: 'Ken Jezelf Eerst',
    subtitle: 'De basis voor dating succes',
    description: 'Begin met onze zelfinzicht scans. Ze helpen je begrijpen hoe je date en wat je zoekt.',
    icon: <Heart className="w-10 h-10 text-purple-500" />,
    tools: [
      {
        name: 'Hechtingsstijl QuickScan',
        icon: <Heart className="w-5 h-5 text-purple-500" />,
        description: 'Ontdek je hechtingsdynamiek',
        access: 'full',
        limit: 'Onbeperkt'
      },
      {
        name: 'Dating Stijl Scan',
        icon: <Star className="w-5 h-5 text-orange-500" />,
        description: 'Ken je unieke dating stijl',
        access: 'limited',
        limit: '1x inbegrepen'
      },
      {
        name: 'Emotionele Ready Scan',
        icon: <Sparkles className="w-5 h-5 text-blue-500" />,
        description: 'Ben je klaar voor dating?',
        access: 'limited',
        limit: '1x inbegrepen'
      }
    ],
    tip: 'Start met de Hechtingsstijl scan - dit verbetert je Iris coaching!'
  },
  {
    id: 'profile',
    title: 'Optimaliseer je Profiel',
    subtitle: 'Maak een onweerstaanbare eerste indruk',
    description: 'Gebruik AI om je profielfoto\'s te analyseren en de perfecte bio te schrijven.',
    icon: <Camera className="w-10 h-10 text-indigo-500" />,
    tools: [
      {
        name: 'Foto Analyse',
        icon: <Camera className="w-5 h-5 text-indigo-500" />,
        description: 'AI feedback op je foto\'s',
        access: 'limited',
        limit: '2x inbegrepen'
      },
      {
        name: 'Profiel Bouwer',
        icon: <FileText className="w-5 h-5 text-green-500" />,
        description: 'Schrijf de perfecte bio',
        access: 'limited',
        limit: '1x inbegrepen'
      }
    ],
    tip: 'Je foto\'s bepalen 90% van je eerste indruk!'
  },
  {
    id: 'communication',
    title: 'Communicatie Tools',
    subtitle: 'Van match naar date',
    description: 'Nooit meer zonder woorden. Genereer openingszinnen en krijg 24/7 coaching.',
    icon: <MessageCircle className="w-10 h-10 text-blue-500" />,
    tools: [
      {
        name: 'Chat Coach',
        icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
        description: 'Je 24/7 AI dating coach',
        access: 'limited',
        limit: '10 berichten/dag'
      },
      {
        name: 'Openingszinnen',
        icon: <Sparkles className="w-5 h-5 text-pink-500" />,
        description: 'Perfecte eerste berichten',
        access: 'limited',
        limit: '3x inbegrepen'
      },
      {
        name: 'IJsbrekers',
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
        description: 'Gesprekstarters die werken',
        access: 'limited',
        limit: '2x inbegrepen'
      }
    ],
    tip: 'De Chat Coach kent je hechtingsstijl en geeft gepersonaliseerd advies!'
  },
  {
    id: 'locked-preview',
    title: 'Meer Tools Beschikbaar',
    subtitle: 'Ontgrendel met Transformatie',
    description: 'Je ziet sommige tools met een slotje. Dit zijn premium features die je later kunt ontgrendelen.',
    icon: <Lock className="w-10 h-10 text-gray-400" />,
    tools: [
      {
        name: 'Date Planner',
        icon: <Lock className="w-5 h-5 text-gray-400" />,
        description: 'Plan perfecte dates',
        access: 'locked'
      },
      {
        name: 'Veiligheidscheck',
        icon: <Lock className="w-5 h-5 text-gray-400" />,
        description: 'Analyseer rode vlaggen',
        access: 'locked'
      },
      {
        name: 'Platform Match',
        icon: <Lock className="w-5 h-5 text-gray-400" />,
        description: 'Vind je ideale dating app',
        access: 'locked'
      }
    ],
    tip: 'Focus eerst op Kickstart - upgrade later wanneer je klaar bent!'
  },
  {
    id: 'complete',
    title: 'Je bent klaar!',
    subtitle: 'Start je dating journey',
    description: 'Je hebt alle tools gezien. Onze aanbeveling: begin met de Hechtingsstijl QuickScan om Iris te leren wie jij bent.',
    icon: <Rocket className="w-12 h-12 text-pink-500" />,
    animation: 'bounce'
  }
];

export function ToolsGuidedTour({
  isOpen,
  onClose,
  onComplete,
  userTier
}: ToolsGuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Get appropriate tour steps based on tier
  const tourSteps = userTier === 'kickstart' ? KICKSTART_TOUR_STEPS : KICKSTART_TOUR_STEPS;
  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="relative px-6 pt-6">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              Stap {currentStep + 1} van {tourSteps.length}
            </Badge>
            {userTier === 'kickstart' && (
              <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs">
                <Rocket className="w-3 h-3 mr-1" />
                Kickstart
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Icon with animation */}
          <div className={cn(
            "flex justify-center mb-4",
            step.animation === 'pulse' && "animate-pulse",
            step.animation === 'bounce' && "animate-bounce"
          )}>
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20",
              step.animation === 'glow' && "shadow-lg shadow-pink-500/20"
            )}>
              {step.icon}
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {step.title}
            </h2>
            <p className="text-sm text-pink-600 dark:text-pink-400 font-medium mb-3">
              {step.subtitle}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Tools list (if present) */}
          {step.tools && step.tools.length > 0 && (
            <div className="space-y-2 mb-4">
              {step.tools.map((tool, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    tool.access === 'locked'
                      ? "bg-gray-50 dark:bg-gray-800/50 opacity-60"
                      : "bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    tool.access === 'locked'
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "bg-white dark:bg-gray-800 shadow-sm"
                  )}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {tool.name}
                      </span>
                      {tool.access === 'full' && (
                        <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">
                          Onbeperkt
                        </Badge>
                      )}
                      {tool.access === 'limited' && tool.limit && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tool.limit}
                        </Badge>
                      )}
                      {tool.access === 'locked' && (
                        <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0">
                          <Lock className="w-2.5 h-2.5 mr-0.5" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {tool.description}
                    </p>
                  </div>
                  {tool.access !== 'locked' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pro tip */}
          {step.tip && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Pro tip</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">{step.tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              Overslaan
            </Button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Vorige
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                className={cn(
                  "gap-1",
                  isLastStep
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    : "bg-pink-500 hover:bg-pink-600"
                )}
              >
                {isLastStep ? (
                  <>
                    Start nu
                    <Rocket className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Volgende
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {tourSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentStep
                  ? "bg-pink-500 w-6"
                  : index < currentStep
                  ? "bg-pink-300"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
