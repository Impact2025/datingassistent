"use client";

/**
 * Route Overview - Shows the 3-step optimization journey
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, FileText, CheckCircle, Lock, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

interface RouteOverviewProps {
  profileData: any;
  onStartStep: (step: string) => void;
}

const OPTIMIZATION_STEPS = [
  {
    id: 'photos',
    title: 'Foto Strategie',
    duration: '15 min',
    impact: 'HOOGSTE IMPACT',
    impactColor: 'text-red-600 bg-red-50',
    icon: Camera,
    description: 'Upload, analyseer en optimaliseer je foto\'s',
    tasks: [
      'Upload 3-6 foto\'s',
      'AI Foto Analyse',
      'Optimaliseer volgorde',
      'Platform specifieke tips'
    ],
    completionKey: 'photoCount',
    unlockRequirement: null
  },
  {
    id: 'bio',
    title: 'Bio & Profiel Tekst',
    duration: '20 min',
    impact: 'Hoge Impact',
    impactColor: 'text-orange-600 bg-orange-50',
    icon: FileText,
    description: 'AI schrijft je perfecte bio op basis van jouw antwoorden',
    tasks: [
      '5 snelle vragen',
      'AI genereert 3 bio varianten',
      'Kies & personaliseer',
      'Platform optimalisatie'
    ],
    completionKey: 'selectedBio',
    unlockRequirement: 'photoCount'
  },
  {
    id: 'details',
    title: 'Prompts & Details',
    duration: '10 min',
    impact: 'Finetuning',
    impactColor: 'text-blue-600 bg-blue-50',
    icon: CheckCircle,
    description: 'Vul laatste details en prompts in',
    tasks: [
      'Dating app prompts',
      'Basis informatie',
      'Interesses',
      'Voorkeuren (optioneel)'
    ],
    completionKey: 'height',
    unlockRequirement: 'selectedBio'
  }
];

export function RouteOverview({ profileData, onStartStep }: RouteOverviewProps) {
  const getStepStatus = (step: any) => {
    // Check if completed
    const isCompleted = profileData[step.completionKey] !== undefined &&
                       profileData[step.completionKey] !== null &&
                       (Array.isArray(profileData[step.completionKey])
                         ? profileData[step.completionKey].length > 0
                         : true);

    // Check if locked
    if (step.unlockRequirement) {
      const isUnlocked = profileData[step.unlockRequirement] !== undefined &&
                        profileData[step.unlockRequirement] !== null;
      return { isCompleted, isLocked: !isUnlocked };
    }

    return { isCompleted, isLocked: false };
  };

  const calculateOverallProgress = () => {
    let completed = 0;
    OPTIMIZATION_STEPS.forEach(step => {
      const status = getStepStatus(step);
      if (status.isCompleted) completed++;
    });
    return (completed / OPTIMIZATION_STEPS.length) * 100;
  };

  const overallProgress = calculateOverallProgress();
  const completedSteps = Math.floor(overallProgress / 33.33);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Jouw Optimalisatie Route
              </h1>
              <p className="text-gray-600 mt-1">
                Volg deze stappen voor een perfect profiel
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="p-6 border-0 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Totale Voortgang</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(overallProgress)}%
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{completedSteps} van {OPTIMIZATION_STEPS.length} stappen</div>
                  <div className="font-medium text-gray-900">
                    {overallProgress === 100 ? 'Voltooid!' : `~${45 - (completedSteps * 15)} min resterend`}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Progress value={overallProgress} className="h-2 bg-gray-100" />
                <div
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Start</span>
                <span className="hidden sm:inline">25%</span>
                <span className="hidden sm:inline">50%</span>
                <span className="hidden sm:inline">75%</span>
                <span>100% Doel</span>
              </div>
            </div>
          </Card>

          {/* Impact Badge */}
          {overallProgress < 100 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">Verwachte Impact</div>
                  <p className="text-sm text-gray-600 mt-1">
                    +250% meer matches • Beter dan 87% van profielen • Geschatte 15-25 matches/week
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {OPTIMIZATION_STEPS.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step);

            return (
              <Card
                key={step.id}
                className={`border-2 transition-all ${
                  status.isCompleted
                    ? 'border-green-200 bg-green-50/50'
                    : status.isLocked
                    ? 'border-gray-200 bg-gray-50/50 opacity-60'
                    : 'border-gray-900 shadow-lg'
                }`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 md:gap-6">
                    {/* Step Icon */}
                    <div className="flex-shrink-0">
                      {status.isLocked ? (
                        <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-500" />
                        </div>
                      ) : status.isCompleted ? (
                        <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                            STAP {index + 1}: {step.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${step.impactColor}`}>
                            {step.impact}
                          </span>
                        </div>
                        <p className="text-gray-600">{step.description}</p>
                        <div className="text-sm text-gray-500 mt-1">Geschatte tijd: {step.duration}</div>
                      </div>

                      {/* Task List */}
                      {!status.isLocked && (
                        <ul className="space-y-2">
                          {step.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                status.isCompleted ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {status.isCompleted ? (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                ) : (
                                  <span className="text-xs text-gray-600">{idx + 1}</span>
                                )}
                              </div>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* CTA Button */}
                      {status.isLocked ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Lock className="w-4 h-4" />
                          <span>Unlock door stap {index} te voltooien</span>
                        </div>
                      ) : status.isCompleted ? (
                        <Button
                          onClick={() => onStartStep(step.id)}
                          variant="outline"
                          className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Bekijk & Bewerk
                        </Button>
                      ) : (
                        <Button
                          onClick={() => onStartStep(step.id)}
                          className="bg-gray-900 hover:bg-gray-800 text-white group"
                        >
                          Start {step.title}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Completion CTA */}
        {overallProgress === 100 && (
          <Card className="p-8 border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg text-center">
            <div className="space-y-4">
              <div className="text-5xl">🎉</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Profiel Optimalisatie Voltooid!
                </h3>
                <p className="text-gray-600">
                  Je profiel is nu 100% geoptimaliseerd en klaar voor gebruik
                </p>
              </div>
              <Button
                onClick={() => onStartStep('completion')}
                className="bg-gray-900 hover:bg-gray-800 text-white"
                size="lg"
              >
                Bekijk Je Resultaten →
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
