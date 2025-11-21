'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Target, Users, Shield, Heart } from 'lucide-react';
import { getLearningPaths, getPersonalizedRecommendations, UserProfile, LearningPath } from '@/lib/course-recommendations';
import { DETAILED_COURSES } from '@/lib/data';

interface LearningPathSelectorProps {
  onPathSelected: (path: LearningPath) => void;
  userTier: 'free' | 'sociaal' | 'core' | 'pro' | 'premium';
}

export function LearningPathSelector({ onPathSelected, userTier }: LearningPathSelectorProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'assessment' | 'paths' | 'custom'>('welcome');
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});

  const learningPaths = getLearningPaths();

  const handleAssessmentComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentStep('paths');
  };

  if (currentStep === 'welcome') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welkom bij je Dating Reis! 🎯</CardTitle>
          <CardDescription className="text-lg">
            Laten we samen ontdekken welke leerroute het beste bij jou past
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold">Persoonlijk</h3>
              <p className="text-sm text-gray-600">Aangepast op jouw doelen</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <h3 className="font-semibold">Efficiënt</h3>
              <p className="text-sm text-gray-600">Minimale tijd, maximale impact</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-purple-600" />
              <h3 className="font-semibold">Praktisch</h3>
              <p className="text-sm text-gray-600">Direct toepasbare skills</p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-700">
              We hebben 8 uitgebreide cursussen met 129+ lessen en oefeningen.
              Maar maak je geen zorgen - we helpen je de beste route te kiezen!
            </p>
            <Button
              onClick={() => setCurrentStep('assessment')}
              size="lg"
              className="px-8"
            >
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'assessment') {
    return <UserAssessmentForm onComplete={handleAssessmentComplete} />;
  }

  if (currentStep === 'paths') {
    const personalizedRecs = userProfile ? getPersonalizedRecommendations(userProfile as UserProfile, userTier) : [];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Jouw Persoonlijke Aanbevelingen</h2>
          <p className="text-gray-600">
            Gebaseerd op je antwoorden hebben we deze routes voor je geselecteerd
          </p>
        </div>

        {/* Personalized recommendations */}
        {personalizedRecs.length > 0 && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Speciaal voor jou geselecteerd
              </CardTitle>
              <CardDescription>
                Top {Math.min(3, personalizedRecs.length)} cursussen die perfect bij je passen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalizedRecs.slice(0, 3).map((rec, index) => {
                  const course = DETAILED_COURSES.find(c => c.id === rec.courseId);
                  if (!course) return null;

                  return (
                    <div key={rec.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{course.title}</span>
                          <Badge variant="secondary">{rec.estimatedTime}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                        {rec.simplifiedPath && (
                          <p className="text-xs text-blue-600 mt-1">
                            💡 Vereenvoudigd pad beschikbaar ({rec.simplifiedPath.length} modules)
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < rec.priority ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">Match: {rec.priority}/5</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predefined learning paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.map((path) => (
            <Card key={path.title} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tijdsinvestering:</span>
                    <Badge variant="outline">{path.totalTime}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Niveau:</span>
                    <Badge
                      variant={path.difficulty === 'beginner' ? 'default' : path.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                    >
                      {path.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Aantal cursussen:</span>
                    <span className="font-medium">{path.courses.length}</span>
                  </div>
                  <Button
                    onClick={() => onPathSelected(path)}
                    className="w-full"
                    variant="outline"
                  >
                    Kies deze route
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => setCurrentStep('custom')}
            variant="ghost"
          >
            Of stel je eigen route samen →
          </Button>
        </div>
      </div>
    );
  }

  // Custom path builder would go here
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Custom Route Builder</CardTitle>
        <CardDescription>
          Selecteer individuele cursussen voor je persoonlijke leerpad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-600">
          Custom route builder komt binnenkort beschikbaar.
          <br />
          <Button
            onClick={() => setCurrentStep('paths')}
            variant="link"
            className="mt-4"
          >
            ← Terug naar aanbevolen routes
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}

function UserAssessmentForm({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<UserProfile>>({});

  const questions = [
    {
      id: 'experienceLevel',
      question: 'Wat is je ervaring met online daten?',
      options: [
        { value: 'beginner', label: 'Beginner - Ik ben nieuw', emoji: '🌱' },
        { value: 'intermediate', label: 'Gemiddeld - Ik heb wat ervaring', emoji: '🌿' },
        { value: 'advanced', label: 'Gevorderd - Ik ben ervaren', emoji: '🌳' }
      ]
    },
    {
      id: 'mainGoal',
      question: 'Wat is je hoofddoel met deze cursussen?',
      options: [
        { value: 'profile', label: 'Profiel verbeteren', emoji: '📸' },
        { value: 'conversation', label: 'Beter converseren', emoji: '💬' },
        { value: 'confidence', label: 'Meer zelfvertrouwen', emoji: '💪' },
        { value: 'safety', label: 'Veiliger daten', emoji: '🛡️' },
        { value: 'relationships', label: 'Betere relaties', emoji: '❤️' }
      ]
    },
    {
      id: 'timeCommitment',
      question: 'Hoeveel tijd wil je per week investeren?',
      options: [
        { value: 'quick', label: '15-30 minuten (snel resultaat)', emoji: '⚡' },
        { value: 'moderate', label: '1-2 uur (gebalanceerd)', emoji: '🕐' },
        { value: 'intensive', label: '3+ uur (diepgaand)', emoji: '📚' }
      ]
    },
    {
      id: 'preferredFormat',
      question: 'Welke leervorm vind je prettigst?',
      options: [
        { value: 'video', label: 'Video lessen', emoji: '🎬' },
        { value: 'interactive', label: 'Interactieve oefeningen', emoji: '🎮' },
        { value: 'mixed', label: 'Mix van alles', emoji: '🔄' }
      ]
    }
  ];

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      onComplete(answers as UserProfile);
    }
  };

  const currentQuestion = questions[step - 1];
  const progress = (step / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">Stap {step} van {questions.length}</Badge>
          <span className="text-sm text-gray-500">{Math.round(progress)}% compleet</span>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(currentQuestion.id, option.value)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                (answers as any)[currentQuestion.id] === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button onClick={() => setStep(step - 1)} variant="outline">
              Vorige
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!(answers as any)[currentQuestion.id]}
            className="ml-auto"
          >
            {step === questions.length ? 'Bekijk Resultaten' : 'Volgende'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}