"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Map } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/providers/user-provider";

interface JourneyData {
  status: string;
  currentStep: string;
  completedSteps: string[];
  progress: number;
}

export function OnboardingWidget() {
  const { user } = useUser();
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadJourneyData();
    }
  }, [user]);

  const loadJourneyData = async () => {
    try {
      const response = await fetch(`/api/journey/status?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setJourney(data);
      }
    } catch (error) {
      console.error('Error loading journey:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if journey is completed
  if (loading || !journey || journey.status === 'completed') {
    return null;
  }

  const completedCount = journey.completedSteps?.length || 0;
  const totalSteps = 7; // Based on your onboarding flow
  const progress = Math.round((completedCount / totalSteps) * 100);

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <CardTitle>Jouw persoonlijke leertraject</CardTitle>
        </div>
        <CardDescription>
          Gebaseerd op je vaardigheidenbeoordeling hebben we een leertraject voor je samengesteld.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Voortgang</span>
            <span className="font-medium">{progress}% compleet</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-background/50 border">
            <div className="text-2xl font-bold text-primary">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Opgeslagen profielen</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center justify-center gap-1">
              <div className="text-2xl font-bold">?</div>
            </div>
            <div className="text-xs text-muted-foreground">Foto analyse check</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-xs text-muted-foreground">Platform matchmaker check</div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full"
          onClick={() => window.location.href = '/onboarding'}
        >
          Bekijk leertraject
        </Button>

        {/* Tip van de coach */}
        <div className="pt-4 border-t">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Tip van de coach</h4>
              <p className="text-sm text-muted-foreground">
                Deel nooit direct je adres of financiële gegevens. Spreek de eerste keer af op een openbare plek. Jouw veiligheid staat voorop!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
