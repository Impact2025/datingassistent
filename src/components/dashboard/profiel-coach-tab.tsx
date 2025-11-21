"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FotoAdviesTab } from "./foto-advies-tab";
import { InteractiveProfileCoach } from "./interactive-profile-coach";
import { useCoachingTracker } from "@/hooks/use-coaching-tracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, HelpCircle, CheckCircle2, User } from "lucide-react";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";

export function ProfielCoachTab() {
  const [activeSubTab, setActiveSubTab] = useState("profiel-aanpassen");
  const { isFirstTime, isFromOnboarding } = useCoachingTracker('profiel-coach');
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('profiel-coach');
  const [completionProgress, setCompletionProgress] = useState({ completed: 0, total: 3 });

  // Check completion status
  useEffect(() => {
    const hasCompletedQuiz = localStorage.getItem('profiel-coach-quiz-completed') === 'true';
    const hasGeneratedBio = localStorage.getItem('profiel-coach-bio-generated') === 'true';
    const hasCopiedBio = localStorage.getItem('profiel-coach-bio-copied') === 'true';

    const completedCount = [hasCompletedQuiz, hasGeneratedBio, hasCopiedBio].filter(Boolean).length;
    setCompletionProgress({ completed: completedCount, total: 3 });
  }, [activeSubTab]);

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="profiel-coach"
        displayName={getToolDisplayName('profiel-coach')}
        steps={getOnboardingSteps('profiel-coach')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('Profiel Coach onboarding completed!')}
      />

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Jouw Profiel Coach
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverlay(true)}
                className="gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Tutorial</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Maak een authentiek profiel dat bij je past en trek de juiste mensen aan.
            </p>
            {completionProgress.completed > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">
                  {completionProgress.completed}/{completionProgress.total} stappen voltooid
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {isFirstTime && !showOverlay && (
          <Alert className="border-primary bg-primary/5">
            <Lightbulb className="w-4 h-4" />
            <AlertTitle>Je eerste keer in Profiel Coach!</AlertTitle>
            <AlertDescription>
              We gaan je helpen een authentiek profiel te maken dat bij je past. Begin met het invullen van je profiel en krijg direct AI-gedreven feedback.
            </AlertDescription>
          </Alert>
        )}

        {isFromOnboarding && !isFirstTime && (
          <Alert className="border-l-4 border-l-primary bg-primary/5">
            <AlertDescription>
              <strong>💡 Tip van je coach:</strong> Je bent hier omdat je profiel optimalisatie nodig heeft. Laten we beginnen!
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 p-1">
            <TabsTrigger value="profiel-aanpassen">Profiel coach</TabsTrigger>
            <TabsTrigger value="foto-advies">Foto advies</TabsTrigger>
          </TabsList>

          <TabsContent value="profiel-aanpassen" className="mt-6">
            <InteractiveProfileCoach />
          </TabsContent>

          <TabsContent value="foto-advies" className="mt-6">
            <FotoAdviesTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
