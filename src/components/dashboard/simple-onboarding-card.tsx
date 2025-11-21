"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/providers/user-provider";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function SimpleOnboardingCard({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { user } = useUser();
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Persoonlijk Profiel',
      description: 'Jouw dating DNA bepaald',
      completed: false,
    },
    {
      id: 'goals',
      title: 'Duidelijke Doelen',
      description: 'Jaar, maand en week planning',
      completed: false,
    },
    {
      id: 'ready',
      title: 'Klaar om te Starten',
      description: 'Alle tools beschikbaar',
      completed: false,
    },
  ]);
  const [showCard, setShowCard] = useState(true);

  useEffect(() => {
    // Load journey status to determine completed steps
    if (user?.id) {
      loadJourneyStatus();
    }
  }, [user]);

  const loadJourneyStatus = async () => {
    try {
      const response = await fetch(`/api/journey/status?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();

        // If journey is completed, hide the card
        if (data.status === 'completed') {
          setShowCard(false);
          return;
        }

        // Update steps based on completed journey steps
        const completedSteps = data.completedSteps || [];
        setSteps(prevSteps => prevSteps.map((step, index) => ({
          ...step,
          completed: index < completedSteps.length
        })));
      }
    } catch (error) {
      console.error('Error loading journey status:', error);
    }
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  if (!showCard) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl">Journey Voltooid</CardTitle>
        <CardDescription className="text-base">
          Uitstekend! Je hebt je persoonlijke dating profiel samengesteld.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="relative overflow-hidden rounded-lg border bg-background/50 p-4 text-center transition-all hover:border-primary/40"
            >
              <div className="flex justify-center mb-2">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Welcome Message */}
        <div className="bg-background/80 rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Welkom bij je Dashboard</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Je kunt nu alle DatingAssistent tools gebruiken om je dating doelen te bereiken.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => setShowCard(false)}
        >
          Naar mijn Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
