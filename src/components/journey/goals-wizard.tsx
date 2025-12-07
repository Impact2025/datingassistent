"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Lightbulb
} from "lucide-react";

interface GoalsWizardProps {
  onComplete: (goals: any) => void;
  onBack?: () => void;
  personalityScan?: any;
}

const YEAR_GOAL_OPTIONS = [
  {
    id: 'serious_relationship',
    title: 'Serieuze relatie vinden',
    description: 'Klaar voor commitment en langdurige relatie',
    category: 'relationship',
    icon: '💕'
  },
  {
    id: 'social_confidence',
    title: 'Meer zelfvertrouwen in dating',
    description: 'Groter gevoel van eigenwaarde opbouwen',
    category: 'confidence',
    icon: '🌟'
  },
  {
    id: 'better_profile',
    title: 'Profiel volledig op orde',
    description: 'Aantrekkelijk profiel dat matches aantrekt',
    category: 'profile',
    icon: '📸'
  },
  {
    id: 'conversation_skills',
    title: 'Betere gesprekken voeren',
    description: 'Van eerste bericht tot diepgaande gesprekken',
    category: 'social_skills',
    icon: '💬'
  },
  {
    id: 'consistent_dating',
    title: 'Regelmatig daten',
    description: '2 dates per maand als minimum doel',
    category: 'consistency',
    icon: '📅'
  }
];

const PHASES = ['year', 'month', 'week', 'complete'];

export function GoalsWizard({ onComplete, onBack, personalityScan }: GoalsWizardProps) {
  const [currentPhase, setCurrentPhase] = useState<'year' | 'month' | 'week' | 'complete'>('year');
  const [selectedYearGoal, setSelectedYearGoal] = useState<string>('');
  const [customYearGoal, setCustomYearGoal] = useState('');
  const [generatedGoals, setGeneratedGoals] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonthGoal, setSelectedMonthGoal] = useState<number | null>(null);
  const [customMonthGoal, setCustomMonthGoal] = useState('');
  const [selectedWeekGoals, setSelectedWeekGoals] = useState<number[]>([]);
  const [editingWeekGoal, setEditingWeekGoal] = useState<number | null>(null);
  const [editedWeekGoals, setEditedWeekGoals] = useState<Record<number, any>>({});

  const handleYearGoalSelect = (goalId: string) => {
    setSelectedYearGoal(goalId);
  };

  const handleYearGoalSubmit = () => {
    if (!selectedYearGoal && !customYearGoal.trim()) {
      alert('Selecteer een doel of schrijf je eigen doel');
      return;
    }

    const finalGoal = customYearGoal.trim() || YEAR_GOAL_OPTIONS.find(g => g.id === selectedYearGoal)?.title || '';
    setGeneratedGoals({ yearGoal: finalGoal });
    setCurrentPhase('month');
    generateMonthGoals(finalGoal);
  };

  const generateMonthGoals = async (yearGoal: string) => {
    setIsGenerating(true);

    // AI generates month goal options based on year goal
    setTimeout(() => {
      const monthGoalOptions = [
        {
          title: 'Maak mijn profiel 30% sterker',
          description: 'Optimaliseer foto\'s, bio en presentatie voor maximale impact',
          category: 'profile',
          icon: '📸',
          impact: 'High'
        },
        {
          title: 'Krijg 15 goede matches',
          description: 'Focus op kwaliteit matches die aansluiten bij jouw waarden',
          category: 'matches',
          icon: '💕',
          impact: 'Medium'
        },
        {
          title: 'Verbeter mijn openingszinnen',
          description: 'Leer gesprekken starten die leiden tot echte connecties',
          category: 'communication',
          icon: '💬',
          impact: 'High'
        },
        {
          title: 'Ga 2 keer op date',
          description: 'Van online chat naar real-life ontmoetingen',
          category: 'dating',
          icon: '🍷',
          impact: 'Medium'
        }
      ];

      setGeneratedGoals(prev => ({ ...prev, monthGoalOptions }));
      setIsGenerating(false);
    }, 2000);
  };

  const handleMonthGoalsContinue = () => {
    setCurrentPhase('week');
    generateWeekGoals();
  };

  const generateWeekGoals = async () => {
    setIsGenerating(true);

    // AI generates 3 categories of week goals
    setTimeout(() => {
      const weekGoals = [
        {
          id: 0,
          title: 'Stuur deze week 5 berichten naar nieuwe matches',
          description: 'Begin interessante gesprekken die verder gaan dan "hey"',
          category: 'social',
          icon: '🙋',
          categoryLabel: 'Sociaal',
          targetValue: 5,
          editable: true
        },
        {
          id: 1,
          title: 'Plaats 3 betere foto\'s die ik voor je selecteer',
          description: 'Verbeter je visuele presentatie met AI-geoptimaliseerde foto\'s',
          category: 'practical',
          icon: '🛠️',
          categoryLabel: 'Praktisch',
          targetValue: 3,
          editable: true
        },
        {
          id: 2,
          title: 'Oefen 1 keer per dag een micro-compliment',
          description: 'In chat of in het echt - train je sociale skills',
          category: 'mindset',
          icon: '🧠',
          categoryLabel: 'Mindset',
          targetValue: 7,
          editable: true
        }
      ];

      setGeneratedGoals(prev => ({ ...prev, weekGoals }));
      setSelectedWeekGoals([0, 1, 2]); // All selected by default
      setIsGenerating(false);
    }, 2000);
  };

  const handleComplete = () => {
    // Prepare final goals data with user selections and edits
    const finalMonthGoal = customMonthGoal.trim() ||
      (selectedMonthGoal !== null ? generatedGoals.monthGoalOptions[selectedMonthGoal].title : '');

    const finalWeekGoals = selectedWeekGoals.map(id => {
      const goal = generatedGoals.weekGoals.find((g: any) => g.id === id);
      const editedGoal = editedWeekGoals[id];
      return editedGoal || goal;
    });

    const finalGoalsData = {
      yearGoal: generatedGoals.yearGoal,
      monthGoal: finalMonthGoal,
      weekGoals: finalWeekGoals,
      selectedCount: selectedWeekGoals.length
    };

    onComplete(finalGoalsData);
  };

  const renderYearGoalPhase = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Wat wil je bereiken dit jaar?
        </h2>
        <p className="text-gray-600">
          Kies je hoofddoel of schrijf je eigen doel
        </p>
      </div>

      {/* Predefined Goals */}
      <div className="grid gap-4 mb-6">
        {YEAR_GOAL_OPTIONS.map((goal) => (
          <Card
            key={goal.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedYearGoal === goal.id
                ? 'ring-2 ring-pink-500 bg-pink-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleYearGoalSelect(goal.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{goal.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {goal.description}
                  </p>
                </div>
                {selectedYearGoal === goal.id && (
                  <CheckCircle className="w-6 h-6 text-pink-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Goal */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-4">
          <Label htmlFor="custom-goal" className="text-sm font-medium mb-2 block">
            Of schrijf je eigen doel:
          </Label>
          <Textarea
            id="custom-goal"
            placeholder="Bijv: 'Een liefdevolle relatie vinden waarin ik mezelf kan zijn' of 'Mijn dating zelfvertrouwen verdubbelen'..."
            value={customYearGoal}
            onChange={(e) => setCustomYearGoal(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={200}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Terug
        </Button>
        <Button
          onClick={handleYearGoalSubmit}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
        >
          Genereer Maand Doelen
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  const renderMonthGoalsPhase = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Kies je Maanddoel
        </h2>
        <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
          Jaardoel: {generatedGoals.yearGoal}
        </Badge>
        <p className="text-gray-600">
          Wat wil je deze maand bereiken? Kies een doel of pas het aan
        </p>
      </div>

      {isGenerating ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="text-gray-600">AI genereert persoonlijke maand doelen...</span>
          </div>
        </div>
      ) : (
        <>
          {/* AI Generated Month Goal Options */}
          <div className="space-y-3">
            {generatedGoals.monthGoalOptions?.map((goal: any, index: number) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedMonthGoal === index
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md hover:border-blue-200'
                }`}
                onClick={() => {
                  setSelectedMonthGoal(index);
                  setCustomMonthGoal('');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{goal.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {goal.title}
                        </h3>
                        <Badge
                          variant={goal.impact === 'High' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {goal.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {goal.description}
                      </p>
                    </div>
                    {selectedMonthGoal === index && (
                      <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Month Goal Option */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-4">
              <Label htmlFor="custom-month-goal" className="text-sm font-medium mb-2 block">
                Of schrijf je eigen maanddoel:
              </Label>
              <Textarea
                id="custom-month-goal"
                placeholder="Bijv: 'Deze maand ga ik mijn zelfvertrouwen vergroten door...' of 'Ik wil 10 quality matches krijgen'"
                value={customMonthGoal}
                onChange={(e) => {
                  setCustomMonthGoal(e.target.value);
                  setSelectedMonthGoal(null);
                }}
                className="min-h-[80px] resize-none"
                maxLength={150}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" onClick={() => setCurrentPhase('year')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Terug
            </Button>
            <Button
              onClick={handleMonthGoalsContinue}
              disabled={selectedMonthGoal === null && !customMonthGoal.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
            >
              Genereer Week Doelen
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );

  const handleWeekGoalToggle = (goalId: number) => {
    setSelectedWeekGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleWeekGoalEdit = (goalId: number) => {
    setEditingWeekGoal(goalId);
    const goal = generatedGoals.weekGoals.find((g: any) => g.id === goalId);
    if (goal && !editedWeekGoals[goalId]) {
      setEditedWeekGoals(prev => ({
        ...prev,
        [goalId]: { title: goal.title, targetValue: goal.targetValue }
      }));
    }
  };

  const handleWeekGoalSave = (goalId: number) => {
    setEditingWeekGoal(null);
  };

  const renderWeekGoalsPhase = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Jouw Week Doelen
        </h2>
        <p className="text-gray-600">
          ✔ Accepteer → ✏️ Aanpassen → ⏭ Overslaan
        </p>
      </div>

      {isGenerating ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="text-gray-600">AI genereert haalbare week doelen...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {generatedGoals.weekGoals?.map((goal: any) => {
              const isSelected = selectedWeekGoals.includes(goal.id);
              const isEditing = editingWeekGoal === goal.id;
              const editedGoal = editedWeekGoals[goal.id] || goal;

              return (
                <Card
                  key={goal.id}
                  className={`transition-all duration-200 ${
                    isSelected
                      ? 'border-l-4 border-l-green-500 bg-green-50/50'
                      : 'border-l-4 border-l-gray-300 opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-1">{goal.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Badge variant="outline" className="text-xs mb-2">
                              {goal.categoryLabel}
                            </Badge>
                            {isEditing ? (
                              <Input
                                value={editedGoal.title}
                                onChange={(e) =>
                                  setEditedWeekGoals(prev => ({
                                    ...prev,
                                    [goal.id]: { ...editedGoal, title: e.target.value }
                                  }))
                                }
                                className="mb-2"
                              />
                            ) : (
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {editedGoal.title}
                              </h3>
                            )}
                            <p className="text-sm text-gray-600">
                              {goal.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => handleWeekGoalToggle(goal.id)}
                            className="text-xs"
                          >
                            {isSelected ? '✔ Geaccepteerd' : '⏭ Overslaan'}
                          </Button>
                          {isSelected && (
                            <>
                              {isEditing ? (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleWeekGoalSave(goal.id)}
                                  className="text-xs"
                                >
                                  💾 Opslaan
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleWeekGoalEdit(goal.id)}
                                  className="text-xs"
                                >
                                  ✏️ Aanpassen
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">
                  💡 Pro Tip
                </h4>
                <p className="text-sm text-blue-700">
                  Selecteer minimaal 1 doel. Begin met de makkelijkste actie om momentum op te bouwen.
                  Consistentie is belangrijker dan perfectie!
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" onClick={() => setCurrentPhase('month')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Terug
            </Button>
            <Button
              onClick={handleComplete}
              disabled={selectedWeekGoals.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50"
            >
              Start mijn Journey! ({selectedWeekGoals.length} doelen)
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );

  const renderCompletePhase = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Jouw Doelen Staan!
      </h2>

      <p className="text-lg text-gray-600 mb-8">
        Je hebt nu een duidelijke roadmap naar dating succes.
        Laten we beginnen met de eerste stap.
      </p>

      <Button
        onClick={handleComplete}
        size="lg"
        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 text-lg"
      >
        Naar Profiel Optimalisatie
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-25 to-white p-4">
      <div className="max-w-2xl mx-auto py-8">

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {PHASES.map((phase, index) => (
              <div
                key={phase}
                className={`flex items-center ${
                  PHASES.indexOf(currentPhase) >= index ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  PHASES.indexOf(currentPhase) > index
                    ? 'bg-green-500 text-white'
                    : PHASES.indexOf(currentPhase) === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium capitalize">
                  {phase === 'year' ? 'Jaar' : phase === 'month' ? 'Maand' : phase === 'week' ? 'Week' : 'Klaar'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Content */}
        <AnimatePresence mode="wait">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              {currentPhase === 'year' && renderYearGoalPhase()}
              {currentPhase === 'month' && renderMonthGoalsPhase()}
              {currentPhase === 'week' && renderWeekGoalsPhase()}
              {currentPhase === 'complete' && renderCompletePhase()}
            </CardContent>
          </Card>
        </AnimatePresence>

      </div>
    </div>
  );
}