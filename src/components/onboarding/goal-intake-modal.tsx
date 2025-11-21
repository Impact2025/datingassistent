"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target, Calendar, MessageCircle, Heart, Shield, Brain, Users } from 'lucide-react';

interface GoalIntakeModalProps {
  isOpen: boolean;
  onComplete: (goals: any) => void;
  onClose: () => void;
}

const GOAL_CATEGORIES = [
  { id: 'profile', label: 'Profiel Optimaliseren', icon: Target, description: 'Foto\'s, bio en profieltekst verbeteren' },
  { id: 'messages', label: 'Berichten Verbeteren', icon: MessageCircle, description: 'Openingszinnen en gesprekken verbeteren' },
  { id: 'dates', label: 'Dates Plannen', icon: Calendar, description: 'Eerste dates organiseren en verbeteren' },
  { id: 'mindset', label: 'Mindset Ontwikkelen', icon: Brain, description: 'Zelfvertrouwen en dating mentaliteit' },
  { id: 'confidence', label: 'Zelfvertrouwen Opbouwen', icon: Shield, description: 'Camera-angst en sociale vaardigheden' },
  { id: 'attachment', label: 'Relatiepatronen', icon: Heart, description: 'Hechtingsstijlen en relatievaardigheden' }
];

const OBSTACLES = [
  'Weinig matches krijgen',
  'Slechte gesprekken voeren',
  'Geen dates plannen',
  'Onzeker voelen bij dates',
  'Niet weten wat ik wil',
  'Angst voor afwijzing',
  'Problemen met foto\'s/bio',
  'Geen momentum houden'
];

const INITIAL_GOALS = [
  'Binnen 12 maanden een liefdevolle relatie',
  'Meer zelfvertrouwen en betere gesprekken',
  'Weer plezier krijgen in daten',
  'Professionele foto\'s maken',
  'Openingszinnen die werken',
  'Eerste date organiseren'
];

export function GoalIntakeModal({ isOpen, onComplete, onClose }: GoalIntakeModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [goals, setGoals] = useState({
    yearlyGoal: '',
    obstacles: [] as string[],
    needs: [] as string[],
    monthlyGoal: '',
    firstWeekGoal: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(goals);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleObstacle = (obstacle: string) => {
    setGoals(prev => ({
      ...prev,
      obstacles: prev.obstacles.includes(obstacle)
        ? prev.obstacles.filter(o => o !== obstacle)
        : [...prev.obstacles, obstacle]
    }));
  };

  const toggleNeed = (need: string) => {
    setGoals(prev => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter(n => n !== need)
        : [...prev.needs, need]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary" />
              Jouw Persoonlijke Doelen Instellen
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Stap {currentStep} van {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-6 pb-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Wat is je hoofddoel?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Kies je belangrijkste doel voor de komende periode. Dit geeft richting aan alles wat je gaat doen.
                </p>
                <div className="grid gap-2">
                  {INITIAL_GOALS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setGoals(prev => ({ ...prev, yearlyGoal: goal }))}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        goals.yearlyGoal === goal
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium">Of stel je eigen doel:</label>
                  <Textarea
                    placeholder="Beschrijf je persoonlijke doel..."
                    value={goals.yearlyGoal && !INITIAL_GOALS.includes(goals.yearlyGoal) ? goals.yearlyGoal : ''}
                    onChange={(e) => setGoals(prev => ({ ...prev, yearlyGoal: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Wat blokkeerde je tot nu toe?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecteer alles wat op jou van toepassing is. Dit helpt ons om gericht hulp te bieden.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {OBSTACLES.map((obstacle) => (
                    <button
                      key={obstacle}
                      onClick={() => toggleObstacle(obstacle)}
                      className={`p-3 text-left border rounded-lg transition-all text-sm ${
                        goals.obstacles.includes(obstacle)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            goals.obstacles.includes(obstacle) ? 'text-primary' : 'text-transparent'
                          }`}
                        />
                        {obstacle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Wat heb je nu nodig?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Kies de gebieden waar je het meest hulp bij kunt gebruiken.
                </p>
                <div className="grid gap-3">
                  {GOAL_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleNeed(category.id)}
                        className={`p-4 border rounded-lg transition-all ${
                          goals.needs.includes(category.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${
                            goals.needs.includes(category.id) ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <div className="text-left">
                            <div className="font-medium">{category.label}</div>
                            <div className="text-sm text-muted-foreground">{category.description}</div>
                          </div>
                          <CheckCircle
                            className={`w-5 h-5 ml-auto ${
                              goals.needs.includes(category.id) ? 'text-primary' : 'text-transparent'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Kies je eerste maanddoel</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Een concreet, haalbaar doel dat je meteen kunt starten. Dit creëert momentum!
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Maanddoel:</label>
                    <Textarea
                      placeholder="Bijv: 3 professionele foto's uploaden voor review..."
                      value={goals.monthlyGoal}
                      onChange={(e) => setGoals(prev => ({ ...prev, monthlyGoal: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Eerste week actie:</label>
                    <Input
                      placeholder="Bijv: Profielfoto's maken..."
                      value={goals.firstWeekGoal}
                      onChange={(e) => setGoals(prev => ({ ...prev, firstWeekGoal: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="flex justify-between p-6 border-t bg-card flex-shrink-0">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
          >
            {currentStep === 1 ? 'Overslaan' : 'Terug'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !goals.yearlyGoal) ||
              (currentStep === 4 && (!goals.monthlyGoal || !goals.firstWeekGoal))
            }
          >
            {currentStep === totalSteps ? 'Start mijn journey!' : 'Volgende'}
          </Button>
        </div>
      </Card>
    </div>
  );
}