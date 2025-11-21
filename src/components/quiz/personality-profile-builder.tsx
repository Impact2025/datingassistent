"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PERSONALITY_DIMENSIONS,
  calculatePersonalityProfile,
  type PersonalityProfile,
  type PersonalityDimension,
  type PersonalityQuestion
} from "@/lib/personality-data";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  Copy,
  Check
} from "lucide-react";

interface PersonalityProfileBuilderProps {
  onComplete?: (profile: PersonalityProfile, answers: { [key: string]: string }) => void;
  initialAnswers?: { [key: string]: string };
}

export function PersonalityProfileBuilder({ onComplete, initialAnswers = {} }: PersonalityProfileBuilderProps) {
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>(initialAnswers);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentDimension = PERSONALITY_DIMENSIONS[currentDimensionIndex];
  const currentQuestion = currentDimension.questions[currentQuestionIndex];

  // Calculate total progress
  const totalQuestions = PERSONALITY_DIMENSIONS.reduce(
    (sum, dim) => sum + dim.questions.length,
    0
  );
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  const handleSelectOption = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance to next question after selection
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentDimension.questions.length - 1) {
      // Next question in same dimension
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentDimensionIndex < PERSONALITY_DIMENSIONS.length - 1) {
      // Next dimension
      setCurrentDimensionIndex(currentDimensionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All done - calculate profile
      const calculatedProfile = calculatePersonalityProfile(answers);
      setProfile(calculatedProfile);
      if (onComplete) {
        onComplete(calculatedProfile, answers);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentDimensionIndex > 0) {
      setCurrentDimensionIndex(currentDimensionIndex - 1);
      const prevDimension = PERSONALITY_DIMENSIONS[currentDimensionIndex - 1];
      setCurrentQuestionIndex(prevDimension.questions.length - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setProfile(null);
    setCurrentDimensionIndex(0);
    setCurrentQuestionIndex(0);
  };

  const handleCopySuggestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isAnswered = (questionId: string) => !!answers[questionId];
  const selectedOption = answers[currentQuestion?.id];

  // If profile is calculated, show results
  if (profile) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Jouw Persoonlijkheidsprofiel
            </CardTitle>
            <CardDescription>
              Gebaseerd op {answeredCount} antwoorden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <div className="text-sm text-muted-foreground mb-1">Primary Type</div>
                <div className="text-xl font-bold text-purple-700 capitalize">
                  {profile.primaryArchetype.replace(/-/g, ' ')}
                </div>
              </div>
              {profile.secondaryArchetype && (
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <div className="text-sm text-muted-foreground mb-1">Secondary Type</div>
                  <div className="text-xl font-bold text-blue-700 capitalize">
                    {profile.secondaryArchetype.replace(/-/g, ' ')}
                  </div>
                </div>
              )}
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Jouw Strengths
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.strengths.map((strength, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tone Recommendations */}
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Aanbevolen Tone
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.toneRecommendations.map((tone, idx) => (
                  <Badge key={idx} variant="outline" className="border-blue-300 text-blue-700">
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jouw Dimensie Scores</CardTitle>
            <CardDescription>Hoe je scoort op de 5 key dimensions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PERSONALITY_DIMENSIONS.map((dimension) => {
              const score = profile.dimensions[dimension.id] || 0;
              return (
                <div key={dimension.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{dimension.icon}</span>
                      <span className="font-medium text-sm">{dimension.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Bio Suggestions */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Bio Suggestions - Ready to Use!
            </CardTitle>
            <CardDescription>
              Gebaseerd op jouw antwoorden - kopieer en personaliseer naar wens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.bioSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm flex-1 italic">&quot;{suggestion}&quot;</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopySuggestion(suggestion, idx)}
                      className="shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900">
                💡 <strong>Pro tip:</strong> Gebruik {'{detail}'} placeholders om de templates te personaliseren met jouw eigen verhalen!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Writing Tips per Dimension */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Writing Tips - Do&apos;s & Don&apos;ts</CardTitle>
            <CardDescription>Zo breng je jouw persoonlijkheid over in je bio</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={PERSONALITY_DIMENSIONS[0].id} className="w-full">
              <TabsList className="w-full grid grid-cols-5 h-auto">
                {PERSONALITY_DIMENSIONS.map((dim) => (
                  <TabsTrigger
                    key={dim.id}
                    value={dim.id}
                    className="text-xs py-2 px-1 flex flex-col gap-1"
                  >
                    <span className="text-lg">{dim.icon}</span>
                    <span className="hidden sm:inline">{dim.name.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {PERSONALITY_DIMENSIONS.map((dimension) => {
                // Find relevant tips for user's archetypes
                const relevantTips = dimension.writingTips.filter(tip =>
                  tip.archetype === profile.primaryArchetype ||
                  tip.archetype === profile.secondaryArchetype
                );

                return (
                  <TabsContent key={dimension.id} value={dimension.id} className="mt-4">
                    <div className="space-y-4">
                      {relevantTips.length > 0 ? (
                        relevantTips.map((tip, idx) => (
                          <div key={idx} className="space-y-3">
                            <Badge className="bg-purple-600">{tip.archetype.replace(/-/g, ' ')}</Badge>

                            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                              <div className="font-semibold text-green-900 text-xs mb-1">✅ DO</div>
                              <p className="text-sm italic">&quot;{tip.doExample}&quot;</p>
                            </div>

                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                              <div className="font-semibold text-red-900 text-xs mb-1">❌ DON&apos;T</div>
                              <p className="text-sm italic">&quot;{tip.dontExample}&quot;</p>
                            </div>

                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-xs text-blue-900">
                                💡 {tip.explanation}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Geen specifieke tips voor deze dimensie en jouw archetype.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleReset}>
            Start Opnieuw
          </Button>
          <Button onClick={() => {
            if (onComplete) onComplete(profile, answers);
          }}>
            Bewaar Profiel
          </Button>
        </div>
      </div>
    );
  }

  // Question wizard view
  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Dimensie {currentDimensionIndex + 1} van {PERSONALITY_DIMENSIONS.length}
                </div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">{currentDimension.icon}</span>
                  {currentDimension.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {answeredCount}/{totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">vragen</div>
              </div>
            </div>

            <Progress value={progressPercentage} className="h-2" />

            <p className="text-sm text-muted-foreground">
              {currentDimension.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Vraag {currentQuestionIndex + 1}/{currentDimension.questions.length}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 capitalize">
              {currentQuestion.category}
            </Badge>
          </div>
          <CardTitle className="text-xl pt-2">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  hover:border-purple-400 hover:bg-purple-50
                  ${isSelected
                    ? 'border-purple-600 bg-purple-100 shadow-md'
                    : 'border-gray-200 bg-white'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-5 h-5 rounded-full border-2 shrink-0 mt-0.5
                    flex items-center justify-center
                    ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{option.text}</p>
                    {option.bioTemplate && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Template: &quot;{option.bioTemplate}&quot;
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-purple-600 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentDimensionIndex === 0 && currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Vorige
        </Button>

        <div className="text-sm text-muted-foreground">
          {answeredCount > 0 && (
            <span>{Math.round(progressPercentage)}% compleet</span>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!selectedOption}
        >
          {currentDimensionIndex === PERSONALITY_DIMENSIONS.length - 1 &&
           currentQuestionIndex === currentDimension.questions.length - 1
            ? 'Bekijk Resultaten'
            : 'Volgende'
          }
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Dimension Progress Dots */}
      <div className="flex justify-center gap-2">
        {PERSONALITY_DIMENSIONS.map((dim, idx) => (
          <div
            key={dim.id}
            className={`
              w-2 h-2 rounded-full transition-all
              ${idx === currentDimensionIndex
                ? 'bg-purple-600 w-8'
                : idx < currentDimensionIndex
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
