"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Zap,
  Loader2,
  User,
  Camera,
  MessageCircle,
  CalendarDays
} from "lucide-react";
import { CoachingProfileService } from "@/lib/coaching-profile-service";

// ============================================
// TYPES
// ============================================

interface CoachAdviceProps {
  userId: number;
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
      tool1: { name: string; reason: string; route?: string };
      tool2: { name: string; reason: string; route?: string };
    };
    weekGoal: string;
    todayAction: string;
  };
  onComplete: () => void;
}

// ============================================
// TOOL MAPPING
// ============================================

const TOOL_NAME_TO_ROUTE: Record<string, string> = {
  "Profiel Coach": "profiel-coach",
  "Foto Advies": "foto-advies",
  "Gesprek Starters": "gesprek-starter",
  "Chat Coach": "chat-coach",
  "Date Planner": "date-planner",
  "Online Cursus": "online-cursus",
  "Platform Matchmaker": "profiel-coach", // Tab met matchmaker
};

const TOOL_ICONS: Record<string, any> = {
  "Profiel Coach": User,
  "Foto Advies": Camera,
  "Gesprek Starters": MessageCircle,
  "Chat Coach": MessageCircle,
  "Date Planner": CalendarDays,
  "Online Cursus": Lightbulb,
  "Platform Matchmaker": Target,
};

// ============================================
// COMPONENT
// ============================================

export function CoachAdviceEnhanced({ userId, advice, onComplete }: CoachAdviceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const steps = [
    { ...advice.recommendations.step1, number: 1 },
    { ...advice.recommendations.step2, number: 2 },
    { ...advice.recommendations.step3, number: 3 },
  ];

  const tools = [
    {
      ...advice.tools.tool1,
      route: advice.tools.tool1.route || TOOL_NAME_TO_ROUTE[advice.tools.tool1.name] || 'dashboard'
    },
    {
      ...advice.tools.tool2,
      route: advice.tools.tool2.route || TOOL_NAME_TO_ROUTE[advice.tools.tool2.name] || 'dashboard'
    }
  ];

  /**
   * Handle clicking a tool - creates goals and navigates
   */
  const handleToolClick = async (toolName: string, toolRoute: string) => {
    setIsProcessing(true);
    setSelectedTool(toolName);

    try {
      // 1. Save coach recommendations to coaching profile
      const recommendedToolRoutes = tools.map(t => t.route);

      await CoachingProfileService.setCoachRecommendations(userId, {
        tools: recommendedToolRoutes,
        nextAction: advice.todayAction,
        weeklyFocus: advice.weekGoal
      });

      // 2. Create goals from week and today actions
      await createGoalsFromAdvice();

      // 3. Mark step as completed
      await CoachingProfileService.completeStep(userId, 'coach_advice');

      // 4. Show success message
      toast({
        title: "Advies opgeslagen! 🎉",
        description: `Je wordt nu doorgeleid naar ${toolName}`,
      });

      // 5. Navigate to tool with onboarding context
      setTimeout(() => {
        router.push(`/dashboard?tab=${toolRoute}&onboarding=true&firstTime=true`);
      }, 1000);

    } catch (error) {
      console.error('Error handling tool click:', error);
      toast({
        title: "Er ging iets mis",
        description: "Probeer het opnieuw of ga direct naar het dashboard",
        variant: "destructive"
      });
      setIsProcessing(false);
      setSelectedTool(null);
    }
  };

  /**
   * Create goals from coach advice
   */
  const createGoalsFromAdvice = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');

      // Create weekly goal
      await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: advice.weekGoal,
          description: 'Automatisch aangemaakt vanuit je coach advies',
          category: 'mindset',
          goal_type: 'weekly',
          target_value: 1,
          priority: 3,
          due_date: getEndOfWeek()
        })
      });

      // Create today goal
      await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: advice.todayAction,
          description: 'Automatisch aangemaakt vanuit je coach advies - start vandaag!',
          category: 'mindset',
          goal_type: 'daily',
          target_value: 1,
          priority: 5,
          due_date: new Date().toISOString().split('T')[0]
        })
      });

    } catch (error) {
      console.error('Error creating goals:', error);
      // Non-blocking error - don't prevent navigation
    }
  };

  /**
   * Handle "Start in Dashboard" - saves everything and goes to dashboard
   */
  const handleStartDashboard = async () => {
    setIsProcessing(true);

    try {
      // Save recommendations
      const recommendedToolRoutes = tools.map(t => t.route);
      await CoachingProfileService.setCoachRecommendations(userId, {
        tools: recommendedToolRoutes,
        nextAction: advice.todayAction,
        weeklyFocus: advice.weekGoal
      });

      // Create goals
      await createGoalsFromAdvice();

      // Mark completed
      await CoachingProfileService.completeStep(userId, 'coach_advice');

      toast({
        title: "Advies opgeslagen! 🎉",
        description: "Je doelen zijn aangemaakt en je kunt nu starten",
      });

      // Navigate to dashboard
      onComplete();

    } catch (error) {
      console.error('Error completing advice:', error);
      toast({
        title: "Advies gedeeltelijk opgeslagen",
        description: "Je kunt doorgaan naar het dashboard",
        variant: "destructive"
      });
      // Still proceed to dashboard
      onComplete();
    }
  };

  /**
   * Get icon for tool
   */
  const getToolIcon = (toolName: string) => {
    return TOOL_ICONS[toolName] || Target;
  };

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

        {/* Recommended Tools - NOW CLICKABLE! */}
        <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="w-5 h-5 text-primary" />
              Aanbevolen Tools - Klik om te starten
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Deze tools zijn speciaal voor jou geselecteerd. Klik op een tool om direct te beginnen!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {tools.map((tool, index) => {
              const ToolIcon = getToolIcon(tool.name);
              const isSelected = selectedTool === tool.name;
              const isDisabled = isProcessing && !isSelected;

              return (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${isSelected
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-primary/20 bg-primary/5 hover:border-primary hover:shadow-md'
                    }
                    ${isDisabled ? 'opacity-50' : 'cursor-pointer'}
                  `}
                  onClick={() => !isProcessing && handleToolClick(tool.name, tool.route)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <ToolIcon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{tool.name}</h4>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            Aanbevolen
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{tool.reason}</p>
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToolClick(tool.name, tool.route);
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Bezig met laden...
                          </>
                        ) : (
                          <>
                            Start {tool.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Goals - Now shows they will be auto-created */}
        <Card className="border border-primary/30 shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-primary" />
              Jouw Actieplan
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Deze doelen worden automatisch voor je aangemaakt wanneer je start
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-primary/20">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">Deze week</h4>
                  <Badge variant="outline" className="text-xs">
                    Auto-doel
                  </Badge>
                </div>
                <p className="text-muted-foreground">{advice.weekGoal}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <Separator />
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-primary/20">
              <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">Vandaag</h4>
                  <Badge variant="outline" className="text-xs">
                    Auto-doel
                  </Badge>
                </div>
                <p className="text-muted-foreground">{advice.todayAction}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <Button
            onClick={handleStartDashboard}
            size="lg"
            variant="outline"
            className="px-8 gap-2"
            disabled={isProcessing}
          >
            Bekijk Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleToolClick(tools[0].name, tools[0].route)}
            size="lg"
            className="px-8 gap-2 bg-primary hover:bg-primary/90"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Bezig...
              </>
            ) : (
              <>
                Start met {tools[0].name}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Info Banner */}
        <div className="text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
          💡 <strong>Tip:</strong> We bewaren je advies en doelen zodat je altijd kunt terugkomen naar dit plan.
          Je kunt ze vinden in je dashboard onder "Doelen".
        </div>

      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getEndOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  return endOfWeek.toISOString().split('T')[0];
}
