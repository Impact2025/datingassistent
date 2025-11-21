"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Zap
} from "lucide-react";

interface CoachAdviceProps {
  advice: {
    greeting: string;
    analysis: {
      currentState: string;
      mainChallenge: string;
      biggestOpportunity: string;
    };
    recommendations: {
      step1: { title: string; description: string };
      step2: { title: string; description: string };
      step3: { title: string; description: string };
    };
    tools: {
      tool1: { name: string; reason: string };
      tool2: { name: string; reason: string };
    };
    weekGoal: string;
    todayAction: string;
  };
  onComplete: () => void;
}

export function CoachAdvice({ advice, onComplete }: CoachAdviceProps) {
  const steps = [
    { ...advice.recommendations.step1, number: 1 },
    { ...advice.recommendations.step2, number: 2 },
    { ...advice.recommendations.step3, number: 3 },
  ];

  const tools = [advice.tools.tool1, advice.tools.tool2];
  
  // Track coach advice view
  useEffect(() => {
    try {
      console.log('📊 Tracking coach advice view...');
      // We don't need to wait for this to complete
      fetch('/api/activity/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: window.localStorage.getItem('userId'),
          activityType: 'coach_advice_viewed',
          data: {
            tools_recommended: [advice.tools.tool1.name, advice.tools.tool2.name]
          },
          points: 10 // Award points for viewing coach advice
        }),
      });
    } catch (error) {
      console.error('Failed to track coach advice view:', error);
      // Non-blocking error - continue even if tracking fails
    }
  }, [advice]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8 space-y-6">

        {/* Header */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              Jouw Persoonlijke Coach Advies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Greeting */}
            <div className="text-center">
              <p className="text-lg text-foreground leading-relaxed">
                {advice.greeting}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analysis */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Wat ik zie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Je huidige situatie</h4>
              <p className="text-muted-foreground">{advice.analysis.currentState}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Grootste uitdaging</h4>
              <p className="text-muted-foreground">{advice.analysis.mainChallenge}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Grootste kans</h4>
              <p className="text-muted-foreground">{advice.analysis.biggestOpportunity}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="w-5 h-5 text-primary" />
              Jouw 3 Beste Stappen
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Deze stappen zijn specifiek voor jouw situatie samengesteld
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{step.number}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommended Tools */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="w-5 h-5 text-primary" />
              Aanbevolen Tools
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Start met deze 2 tools voor het beste resultaat
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {tools.map((tool, index) => (
              <div key={index} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{tool.name}</h4>
                    <p className="text-sm text-muted-foreground">{tool.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="border border-primary/30 shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-primary" />
              Jouw Actieplan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Deze week</h4>
                <p className="text-muted-foreground">{advice.weekGoal}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Vandaag</h4>
                <p className="text-muted-foreground">{advice.todayAction}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={() => {
              // Track completion before proceeding
              try {
                fetch('/api/activity/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: window.localStorage.getItem('userId'),
                    activityType: 'onboarding_completed',
                    data: {
                      completed: true,
                      tools_recommended: [advice.tools.tool1.name, advice.tools.tool2.name]
                    },
                    points: 15 // Award points for completing onboarding
                  }),
                });
              } catch (error) {
                console.error('Failed to track onboarding completion:', error);
              }
              
              // Call the onComplete callback
              onComplete();
            }}
            size="lg"
            className="px-8 gap-2"
          >
            Start in mijn Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
