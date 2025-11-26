'use client';

/**
 * GUIDED FLOW COMPONENT
 * Professional guided experience for existing users
 * Created: 2025-11-26
 *
 * Provides personalized guidance through tools and features
 * Integrated with AI recommendations and progress tracking
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import {
  Sparkles,
  Target,
  MessageCircle,
  Camera,
  Heart,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Star,
  Lightbulb,
  Zap,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@/providers/user-provider';

export type GuidedStep = 'assessment' | 'priorities' | 'recommendations' | 'action-plan' | 'implementation' | 'follow-up';

interface GuidedFlowProps {
  onComplete: () => void;
  onClose: () => void;
  className?: string;
}

interface UserAssessment {
  currentGoals: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeAvailable: 'limited' | 'moderate' | 'plenty';
  preferredFocus: 'profile' | 'communication' | 'dates' | 'growth';
  recentActivity: string[];
}

interface ToolRecommendation {
  id: string;
  name: string;
  description: string;
  category: 'profile' | 'communication' | 'dates' | 'growth' | 'safety';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  icon: React.ReactNode;
  route: string;
  benefits: string[];
}

export function GuidedFlow({ onComplete, onClose, className }: GuidedFlowProps) {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const [currentStep, setCurrentStep] = useState<GuidedStep>('assessment');
  const [assessment, setAssessment] = useState<UserAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const steps: GuidedStep[] = ['assessment', 'priorities', 'recommendations', 'action-plan', 'implementation', 'follow-up'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Available tools database
  const allTools: ToolRecommendation[] = [
    {
      id: 'profile-optimization',
      name: 'Profiel Optimalisatie',
      description: 'Verbeter je dating profiel met AI-gedreven inzichten',
      category: 'profile',
      priority: 'high',
      estimatedTime: 15,
      icon: <Star className="w-5 h-5" />,
      route: '/profiel',
      benefits: ['Hogere match rates', 'Betere eerste indruk', 'Persoonlijkere profielen']
    },
    {
      id: 'conversation-coach',
      name: 'Gespreks Coach',
      description: 'Leer betere gesprekken voeren met AI ondersteuning',
      category: 'communication',
      priority: 'high',
      estimatedTime: 10,
      icon: <MessageCircle className="w-5 h-5" />,
      route: '/tools/gespreks-assistent',
      benefits: ['Meer dates', 'Betere connecties', 'Meer zelfvertrouwen']
    },
    {
      id: 'photo-analysis',
      name: 'Foto Analyse',
      description: 'Optimaliseer je profielfoto\'s voor maximale aantrekkingskracht',
      category: 'profile',
      priority: 'medium',
      estimatedTime: 8,
      icon: <Camera className="w-5 h-5" />,
      route: '/foto',
      benefits: ['Meer matches', 'Betere kwaliteit matches', 'Professionele feedback']
    },
    {
      id: 'date-planner',
      name: 'Date Planner',
      description: 'Plan memorabele dates met gepersonaliseerde ideeën',
      category: 'dates',
      priority: 'medium',
      estimatedTime: 12,
      icon: <Heart className="w-5 h-5" />,
      route: '/date',
      benefits: ['Creatievere dates', 'Betere ervaringen', 'Meer succesvolle dates']
    },
    {
      id: 'opener-generator',
      name: 'Openingszinnen Generator',
      description: 'Genereer pakkende openingsberichten voor elk profiel',
      category: 'communication',
      priority: 'medium',
      estimatedTime: 5,
      icon: <Zap className="w-5 h-5" />,
      route: '/opener',
      benefits: ['Hogere response rates', 'Betere eerste indrukken', 'Minder tijd verspillen']
    },
    {
      id: 'safety-check',
      name: 'Veiligheidscheck',
      description: 'Leer rode vlaggen herkennen en veilige dates plannen',
      category: 'safety',
      priority: 'high',
      estimatedTime: 10,
      icon: <Shield className="w-5 h-5" />,
      route: '/veiligheid',
      benefits: ['Veiligere dates', 'Betere beslissingen', 'Meer zelfvertrouwen']
    },
    {
      id: 'progress-tracker',
      name: 'Voortgang Tracker',
      description: 'Monitor je dating voortgang en stel doelen',
      category: 'growth',
      priority: 'low',
      estimatedTime: 7,
      icon: <TrendingUp className="w-5 h-5" />,
      route: '/progress',
      benefits: ['Betere inzichten', 'Duidelijke doelen', 'Motivatie behouden']
    }
  ];

  // Generate personalized recommendations based on assessment
  const generateRecommendations = (assessment: UserAssessment): ToolRecommendation[] => {
    let recommendedTools: ToolRecommendation[] = [];

    // Base recommendations on user preferences and goals
    switch (assessment.preferredFocus) {
      case 'profile':
        recommendedTools = allTools.filter(tool =>
          tool.category === 'profile' || tool.priority === 'high'
        );
        break;
      case 'communication':
        recommendedTools = allTools.filter(tool =>
          tool.category === 'communication' || tool.id === 'conversation-coach'
        );
        break;
      case 'dates':
        recommendedTools = allTools.filter(tool =>
          tool.category === 'dates' || tool.id === 'date-planner'
        );
        break;
      case 'growth':
        recommendedTools = allTools.filter(tool =>
          tool.category === 'growth' || tool.priority === 'high'
        );
        break;
      default:
        recommendedTools = allTools.filter(tool => tool.priority === 'high');
    }

    // Adjust for skill level
    if (assessment.skillLevel === 'beginner') {
      // Prioritize foundational tools
      recommendedTools = recommendedTools.sort((a, b) => {
        if (a.category === 'profile' && b.category !== 'profile') return -1;
        if (a.category !== 'profile' && b.category === 'profile') return 1;
        return 0;
      });
    }

    // Adjust for time availability
    if (assessment.timeAvailable === 'limited') {
      recommendedTools = recommendedTools.filter(tool => tool.estimatedTime <= 10);
    }

    return recommendedTools.slice(0, 5); // Limit to 5 recommendations
  };

  // Handle assessment completion
  const handleAssessmentComplete = (userAssessment: UserAssessment) => {
    setAssessment(userAssessment);
    setCurrentStep('priorities');
  };

  // Handle priorities completion
  const handlePrioritiesComplete = () => {
    if (assessment) {
      const recs = generateRecommendations(assessment);
      setRecommendations(recs);
      setCurrentStep('recommendations');
    }
  };

  // Handle tool selection
  const handleToolSelection = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  // Handle recommendations completion
  const handleRecommendationsComplete = () => {
    setCurrentStep('action-plan');
  };

  // Handle action plan completion
  const handleActionPlanComplete = () => {
    setCurrentStep('implementation');
  };

  // Handle implementation step
  const handleImplementTool = (tool: ToolRecommendation) => {
    setCompletedSteps(prev => [...prev, tool.id]);
    router.push(tool.route);
    // Note: User will return to continue the flow
  };

  // Handle follow-up completion
  const handleFollowUpComplete = () => {
    onComplete();
  };

  // Navigation handlers
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-white border-0 shadow-2xl">
          {/* Header */}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Je Persoonlijke Dating Coach</CardTitle>
                  <p className="text-sm text-gray-600">Stap {currentStepIndex + 1} van {steps.length}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Voortgang</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentStep === 'assessment' && (
                <AssessmentStep
                  key="assessment"
                  user={user}
                  userProfile={userProfile}
                  onComplete={handleAssessmentComplete}
                />
              )}

              {currentStep === 'priorities' && assessment && (
                <PrioritiesStep
                  key="priorities"
                  assessment={assessment}
                  onComplete={handlePrioritiesComplete}
                  onBack={goToPreviousStep}
                />
              )}

              {currentStep === 'recommendations' && (
                <RecommendationsStep
                  key="recommendations"
                  recommendations={recommendations}
                  selectedTools={selectedTools}
                  onToolSelect={handleToolSelection}
                  onComplete={handleRecommendationsComplete}
                  onBack={goToPreviousStep}
                />
              )}

              {currentStep === 'action-plan' && (
                <ActionPlanStep
                  key="action-plan"
                  selectedTools={selectedTools}
                  recommendations={recommendations}
                  onComplete={handleActionPlanComplete}
                  onBack={goToPreviousStep}
                />
              )}

              {currentStep === 'implementation' && (
                <ImplementationStep
                  key="implementation"
                  selectedTools={selectedTools}
                  recommendations={recommendations}
                  completedSteps={completedSteps}
                  onImplementTool={handleImplementTool}
                  onComplete={handleFollowUpComplete}
                  onBack={goToPreviousStep}
                />
              )}

              {currentStep === 'follow-up' && (
                <FollowUpStep
                  key="follow-up"
                  completedSteps={completedSteps}
                  onComplete={handleFollowUpComplete}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Assessment Step Component
function AssessmentStep({ user, userProfile, onComplete }: {
  user: any;
  userProfile: any;
  onComplete: (assessment: UserAssessment) => void;
}) {
  const [assessment, setAssessment] = useState<UserAssessment>({
    currentGoals: [],
    skillLevel: 'beginner',
    timeAvailable: 'moderate',
    preferredFocus: 'profile',
    recentActivity: []
  });

  const handleGoalToggle = (goal: string) => {
    setAssessment(prev => ({
      ...prev,
      currentGoals: prev.currentGoals.includes(goal)
        ? prev.currentGoals.filter(g => g !== goal)
        : [...prev.currentGoals, goal]
    }));
  };

  const goals = [
    'Meer matches krijgen',
    'Betere gesprekken voeren',
    'Succesvollere dates hebben',
    'Profiel verbeteren',
    'Meer zelfvertrouwen opbouwen',
    'Dating strategie optimaliseren'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Hallo {user?.name?.split(' ')[0] || 'Dater'}! 👋
        </h3>
        <p className="text-gray-600">
          Laten we samen kijken wat je doelen zijn en hoe ik je kan helpen
        </p>
      </div>

      {/* Current Goals */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Wat zijn je huidige doelen?</h4>
        <div className="grid gap-2">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => handleGoalToggle(goal)}
              className={cn(
                "p-3 text-left rounded-lg border transition-all",
                assessment.currentGoals.includes(goal)
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Wat is je ervaring met dating apps?</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'beginner', label: 'Beginner', desc: 'Nieuw met dating apps' },
            { value: 'intermediate', label: 'Gemiddeld', desc: 'Enige ervaring' },
            { value: 'advanced', label: 'Gevorderd', desc: 'Veel ervaring' }
          ].map((level) => (
            <button
              key={level.value}
              onClick={() => setAssessment(prev => ({ ...prev, skillLevel: level.value as any }))}
              className={cn(
                "p-3 text-center rounded-lg border transition-all",
                assessment.skillLevel === level.value
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="font-medium">{level.label}</div>
              <div className="text-xs text-gray-600 mt-1">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Available */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Hoeveel tijd heb je per week beschikbaar?</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'limited', label: 'Beperkt', desc: '5-10 minuten/dag' },
            { value: 'moderate', label: 'Gemiddeld', desc: '15-30 minuten/dag' },
            { value: 'plenty', label: 'Veel', desc: '1+ uur/dag' }
          ].map((time) => (
            <button
              key={time.value}
              onClick={() => setAssessment(prev => ({ ...prev, timeAvailable: time.value as any }))}
              className={cn(
                "p-3 text-center rounded-lg border transition-all",
                assessment.timeAvailable === time.value
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="font-medium">{time.label}</div>
              <div className="text-xs text-gray-600 mt-1">{time.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Focus */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Waar wil je je op focussen?</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'profile', label: 'Profiel', icon: '📸' },
            { value: 'communication', label: 'Communicatie', icon: '💬' },
            { value: 'dates', label: 'Dates', icon: '❤️' },
            { value: 'growth', label: 'Persoonlijke groei', icon: '📈' }
          ].map((focus) => (
            <button
              key={focus.value}
              onClick={() => setAssessment(prev => ({ ...prev, preferredFocus: focus.value as any }))}
              className={cn(
                "p-3 text-center rounded-lg border transition-all",
                assessment.preferredFocus === focus.value
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="text-lg mb-1">{focus.icon}</div>
              <div className="font-medium">{focus.label}</div>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onComplete(assessment)}
        className="w-full bg-pink-500 hover:bg-pink-600"
        disabled={assessment.currentGoals.length === 0}
      >
        Start mijn persoonlijke plan
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

// Priorities Step Component
function PrioritiesStep({ assessment, onComplete, onBack }: {
  assessment: UserAssessment;
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Je Prioriteiten 📋
        </h3>
        <p className="text-gray-600">
          Dit is wat ik heb begrepen van je situatie
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-pink-800 mb-2">Je doelen:</h4>
            <div className="flex flex-wrap gap-2">
              {assessment.currentGoals.map((goal) => (
                <Badge key={goal} variant="secondary" className="bg-pink-100 text-pink-700">
                  {goal}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-800 mb-2">Je ervaring:</h4>
            <p className="text-blue-700 capitalize">{assessment.skillLevel}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-2">Je focus:</h4>
            <p className="text-green-700 capitalize">{assessment.preferredFocus}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-purple-800 mb-2">Tijd beschikbaar:</h4>
            <p className="text-purple-700 capitalize">{assessment.timeAvailable}</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-600">
        <Lightbulb className="w-5 h-5 inline mr-2" />
        Op basis hiervan maak ik gepersonaliseerde aanbevelingen
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        <Button onClick={onComplete} className="flex-1 bg-pink-500 hover:bg-pink-600">
          Bekijk aanbevelingen
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Recommendations Step Component
function RecommendationsStep({ recommendations, selectedTools, onToolSelect, onComplete, onBack }: {
  recommendations: ToolRecommendation[];
  selectedTools: string[];
  onToolSelect: (toolId: string) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Jouw Persoonlijke Aanbevelingen 🎯
        </h3>
        <p className="text-gray-600">
          Selecteer de tools die je wilt uitproberen
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((tool) => (
          <Card
            key={tool.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedTools.includes(tool.id)
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onToolSelect(tool.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {selectedTools.includes(tool.id) ? (
                    <CheckCircle className="w-5 h-5 text-pink-500" />
                  ) : (
                    tool.icon
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{tool.name}</h4>
                    <Badge
                      variant={tool.priority === 'high' ? 'default' : 'secondary'}
                      className={tool.priority === 'high' ? 'bg-pink-500' : ''}
                    >
                      {tool.estimatedTime}min
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.benefits.slice(0, 2).map((benefit, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600">
        💡 Tip: Begin met 2-3 tools voor het beste resultaat
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        <Button
          onClick={onComplete}
          className="flex-1 bg-pink-500 hover:bg-pink-600"
          disabled={selectedTools.length === 0}
        >
          Maak actieplan
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Action Plan Step Component
function ActionPlanStep({ selectedTools, recommendations, onComplete, onBack }: {
  selectedTools: string[];
  recommendations: ToolRecommendation[];
  onComplete: () => void;
  onBack: () => void;
}) {
  const selectedRecommendations = recommendations.filter(tool => selectedTools.includes(tool.id));
  const totalTime = selectedRecommendations.reduce((sum, tool) => sum + tool.estimatedTime, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Je Actieplan 📅
        </h3>
        <p className="text-gray-600">
          Dit is je persoonlijke roadmap naar dating succes
        </p>
      </div>

      <Card className="border-pink-200 bg-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-pink-800">Geselecteerde tools</h4>
              <p className="text-sm text-pink-700">{selectedTools.length} tools • {totalTime} minuten totaal</p>
            </div>
            <Target className="w-8 h-8 text-pink-500" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {selectedRecommendations.map((tool, index) => (
          <Card key={tool.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-pink-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{tool.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>⏱️ {tool.estimatedTime} minuten</span>
                    <span>•</span>
                    <span>🎯 {tool.benefits[0]}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600">
        🚀 Je kunt deze tools in elke volgorde doen. Begin met waar je je het meest comfortable bij voelt!
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        <Button onClick={onComplete} className="flex-1 bg-pink-500 hover:bg-pink-600">
          Start implementatie
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Implementation Step Component
function ImplementationStep({ selectedTools, recommendations, completedSteps, onImplementTool, onComplete, onBack }: {
  selectedTools: string[];
  recommendations: ToolRecommendation[];
  completedSteps: string[];
  onImplementTool: (tool: ToolRecommendation) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const selectedRecommendations = recommendations.filter(tool => selectedTools.includes(tool.id));
  const remainingTools = selectedRecommendations.filter(tool => !completedSteps.includes(tool.id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tijd om te beginnen! 🚀
        </h3>
        <p className="text-gray-600">
          Klik op een tool om ermee aan de slag te gaan
        </p>
      </div>

      <div className="space-y-3">
        {selectedRecommendations.map((tool) => {
          const isCompleted = completedSteps.includes(tool.id);
          return (
            <Card
              key={tool.id}
              className={cn(
                "transition-all",
                isCompleted ? "border-green-200 bg-green-50" : "border-gray-200"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      tool.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={cn(
                        "font-medium",
                        isCompleted ? "text-green-800" : "text-gray-900"
                      )}>
                        {tool.name}
                      </h4>
                      <Badge
                        variant={isCompleted ? "default" : "secondary"}
                        className={isCompleted ? "bg-green-500" : ""}
                      >
                        {isCompleted ? "Voltooid" : `${tool.estimatedTime}min`}
                      </Badge>
                    </div>
                    <p className={cn(
                      "text-sm mb-3",
                      isCompleted ? "text-green-700" : "text-gray-600"
                    )}>
                      {tool.description}
                    </p>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => onImplementTool(tool)}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        Start nu
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {remainingTools.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-green-800 mb-2">Geweldig werk! 🎉</h4>
            <p className="text-sm text-green-700 mb-4">
              Je hebt alle geselecteerde tools voltooid. Laten we kijken naar je voortgang.
            </p>
            <Button onClick={onComplete} className="bg-green-500 hover:bg-green-600">
              Bekijk resultaten
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        {remainingTools.length > 0 && (
          <Button
            onClick={onComplete}
            variant="outline"
            className="flex-1"
          >
            Later voortzetten
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Follow-up Step Component
function FollowUpStep({ completedSteps, onComplete }: {
  completedSteps: string[];
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Uitstekend werk! 🎉
        </h3>
        <p className="text-gray-600">
          Je hebt {completedSteps.length} tools voltooid. Dit is wat je hebt bereikt:
        </p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="font-medium text-green-800">
              {completedSteps.length} tools succesvol afgerond
            </span>
          </div>
          <p className="text-sm text-green-700">
            Je dating vaardigheden groeien met elke tool die je gebruikt. Blijf consistent voor de beste resultaten!
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Tips voor succes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Gebruik de tools regelmatig voor gewoontes</li>
              <li>• Track je voortgang in het dashboard</li>
              <li>• Stel reminders in voor belangrijke acties</li>
              <li>• Deel je successen met de community</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-purple-800 mb-2">🚀 Volgende stappen:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Controleer je voortgang wekelijks</li>
              <li>• Probeer nieuwe tools als je klaar bent</li>
              <li>• Stel nieuwe doelen voor jezelf</li>
              <li>• Kom terug voor verse aanbevelingen</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Button onClick={onComplete} className="w-full bg-pink-500 hover:bg-pink-600">
        Terug naar dashboard
        <CheckCircle className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}