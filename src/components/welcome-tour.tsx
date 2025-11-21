'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Sparkles, User, MessageCircle, Calendar, Heart, CheckCircle } from 'lucide-react';
import { useUser } from '@/providers/user-provider';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welkom bij je DatingAssistent Dashboard!',
    description: 'Gefeliciteerd met je eerste stap! Dit dashboard is je centrale hub voor dating succes. Laten we je rondleiden door de belangrijkste features.',
    icon: <Sparkles className="w-8 h-8 text-pink-500" />,
    position: 'center'
  },
  {
    id: 'dashboard-overview',
    title: 'Je Persoonlijke Dashboard',
    description: 'Hier zie je je dagelijkse voortgang, actieve doelen en aanbevelingen. Alles is personalized op basis van je dating journey.',
    icon: <User className="w-6 h-6 text-blue-500" />,
    position: 'center'
  },
  {
    id: 'ai-tools',
    title: 'AI Tools - Je Geheim Wapen',
    description: 'Profiel Coach, Chat Coach, Date Planner en meer. Elk tool is powered by AI en geeft je directe, actionable tips.',
    icon: <MessageCircle className="w-6 h-6 text-green-500" />,
    position: 'center'
  },
  {
    id: 'goals-system',
    title: 'Slim Doelen Systeem',
    description: 'Stel jaar-, maand- en weekdoelen. Ons systeem helpt je om consistent te verbeteren en successen te vieren.',
    icon: <CheckCircle className="w-6 h-6 text-indigo-500" />,
    position: 'center'
  },
  {
    id: 'progress-tracking',
    title: 'Voortgang & Analytics',
    description: 'Zie precies hoe je presteert. Van matches tot gesprekken - data-driven insights helpen je om slimmer te daten.',
    icon: <Heart className="w-6 h-6 text-red-500" />,
    position: 'center'
  },
  {
    id: 'courses-community',
    title: 'Cursussen & Community',
    description: 'Leer van experts via onze cursussen en deel ervaringen met de community. Groei samen met anderen.',
    icon: <Calendar className="w-6 h-6 text-purple-500" />,
    position: 'center'
  }
];

interface WelcomeTourProps {
  onComplete?: () => void;
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const { user, userProfile, loading } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Only show tour for authenticated users with a profile
    // And only after onboarding is completed (user has reached dashboard)
    if (!user || !userProfile || loading) {
      setHasSeenTour(true);
      return;
    }

    // Check if user has already seen the tour
    const tourSeen = localStorage.getItem('dating-assistant-tour-seen');
    if (tourSeen === 'true') {
      setHasSeenTour(true);
      return;
    }

    // Show tour after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, userProfile, loading]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('dating-assistant-tour-seen', 'true');
    setHasSeenTour(true);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('dating-assistant-tour-seen', 'true');
    setHasSeenTour(true);
  };

  // Don't render if tour has been seen or is not visible
  if (hasSeenTour || !isVisible) {
    return null;
  }

  const currentTourStep = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Tour Modal */}
        <Card className="max-w-md w-full mx-4 relative">
          <CardContent className="p-6">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step indicator */}
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                {TOUR_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-pink-500'
                        : index < currentStep
                        ? 'bg-pink-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                {currentTourStep.icon}
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentTourStep.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentTourStep.description}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Overslaan
              </Button>

              <div className="flex space-x-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Vorige</span>
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className="bg-pink-500 hover:bg-pink-600 text-white flex items-center space-x-2"
                >
                  <span>{isLastStep ? 'Start je journey!' : 'Volgende'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlight overlay for specific elements */}
      {currentTourStep.highlight && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* Dark overlay with hole for highlighted element */}
          <div className="absolute inset-0 bg-black/60" />

          {/* This would need to be customized based on the actual element positions */}
          {/* For now, just showing the tour modal */}
        </div>
      )}
    </>
  );
}

// Hook to check if tour has been seen
export function useWelcomeTour() {
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const tourSeen = localStorage.getItem('dating-assistant-tour-seen');
    setHasSeenTour(tourSeen === 'true');
  }, []);

  const resetTour = () => {
    localStorage.removeItem('dating-assistant-tour-seen');
    setHasSeenTour(false);
  };

  return { hasSeenTour, resetTour };
}