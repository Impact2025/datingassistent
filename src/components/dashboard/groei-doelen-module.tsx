"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Flame, Trophy, BarChart3, Calendar, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing components
import { GoalManagement } from "./goal-management";
import { ProgressTracker } from "./progress-tracker";
import { DailyDashboard } from "../engagement/daily-dashboard";
import { BadgesShowcase } from "../engagement/badges-showcase";
import { MonthlyReport } from "../engagement/monthly-report";
import { YearlyReview } from "../engagement/yearly-review";

interface GroeiDoelenModuleProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

export function GroeiDoelenModule({ onTabChange, userId }: GroeiDoelenModuleProps) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("doelen");

  const subModules = [
    {
      id: "ai-coach-dashboard",
      label: "🤖 AI RELATIONSHIP COACH DASHBOARD",
      icon: Star,
      description: "Integrated insights engine met cross-tool analyse en personalized coaching plannen",
      component: <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-4">AI Relationship Coach Dashboard</h3>
        <p className="text-muted-foreground mb-6">
          Geïntegreerde inzichten uit al je tools met personalized coaching plannen en progress tracking.
        </p>
        <Button
          onClick={() => router.push('/ai-relationship-coach')}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        >
          Start Integrated Coaching
        </Button>
      </div>,
      badge: "AI-PRO"
    },
    {
      id: "premium-coaching",
      label: "👑 PREMIUM COACHING & PROGRESS DASHBOARD",
      icon: Trophy,
      description: "Complete user progress tracking, success metrics en VIP coaching integration",
      component: <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Premium Coaching Dashboard</h3>
        <p className="text-muted-foreground mb-6">
          Advanced analytics, personalized coaching plannen en success tracking voor elite results.
        </p>
        <Button
          onClick={() => router.push('/premium-coaching')}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
        >
          Start Premium Coaching
        </Button>
      </div>,
      badge: "VIP"
    },
    {
      id: "doelen",
      label: "Doelen",
      icon: Target,
      description: "Stel en beheer je dating doelen",
      component: <GoalManagement onTabChange={onTabChange} />,
      badge: "Core"
    },
    {
      id: "voortgang",
      label: "Voortgang",
      icon: TrendingUp,
      description: "Track je dagelijkse voortgang",
      component: <ProgressTracker onTabChange={onTabChange} />,
      badge: null
    },
    {
      id: "daily",
      label: "Dagelijks",
      icon: Flame,
      description: "Dagelijkse taken en check-ins",
      component: <DailyDashboard userId={userId || 0} onCheckIn={() => {}} />,
      badge: "Dagelijks"
    },
    {
      id: "badges",
      label: "Badges",
      icon: Trophy,
      description: "Je verdiende achievements",
      component: <BadgesShowcase userId={userId || 0} />,
      badge: null
    },
    {
      id: "monthly",
      label: "Maand Rapport",
      icon: BarChart3,
      description: "Maandelijkse voortgang analyse",
      component: <MonthlyReport userId={userId || 0} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />,
      badge: null
    },
    {
      id: "yearly",
      label: "Jaar Review",
      icon: Calendar,
      description: "Jaarlijkse terugblik en inzichten",
      component: <YearlyReview userId={userId || 0} year={new Date().getFullYear()} />,
      badge: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Groei & Doelen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Stel doelen, track je voortgang en vier je successen. Van dagelijkse gewoontes tot jaarlijkse mijlpalen.
          </p>

          {/* Progress Overview - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <div className="text-center p-2 bg-primary/5 rounded-md">
              <div className="text-sm font-bold text-primary">6</div>
              <div className="text-xs text-muted-foreground">Tools</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-md">
              <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-green-600" />
              <div className="text-xs text-muted-foreground">Game</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-sm font-bold text-blue-600">∞</div>
              <div className="text-xs text-muted-foreground">Opties</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-md">
              <div className="text-sm font-bold text-purple-600">AI</div>
              <div className="text-xs text-muted-foreground">Smart</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-module Navigation - Compact Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Kies je groei tool</h3>
            <p className="text-sm text-muted-foreground">Selecteer de tool die je nu wilt gebruiken</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {subModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeSubTab === module.id;

              return (
                <Card
                  key={module.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                    isActive
                      ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 ring-2 ring-pink-500/20"
                      : "border-border hover:border-pink-300 hover:bg-pink-50/30 dark:hover:bg-pink-950/10"
                  )}
                  onClick={() => setActiveSubTab(module.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="space-y-3">
                      <div className={cn(
                        "w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors",
                        isActive
                          ? "bg-pink-500 text-white"
                          : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h4 className={cn(
                          "font-semibold text-xs leading-tight",
                          isActive ? "text-pink-700 dark:text-pink-300" : "text-foreground"
                        )}>
                          {module.label}
                        </h4>

                        <p className="text-xs text-muted-foreground leading-tight">
                          {module.description}
                        </p>

                        {module.badge && (
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="text-xs mt-1"
                          >
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Module Content */}
          <Card className="border-t-4 border-t-pink-500">
            <CardContent className="p-6">
              {(() => {
                const activeModule = subModules.find(m => m.id === activeSubTab);
                if (!activeModule) return null;

                const Icon = activeModule.icon;
                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-pink-500 text-white rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{activeModule.label}</h3>
                      <p className="text-muted-foreground mb-4">{activeModule.description}</p>
                      {activeModule.badge && (
                        <Badge variant="secondary" className="text-sm">
                          {activeModule.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      {activeModule.component}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Motivation & Tips */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Groei Mindset Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">✅ Groei Principes</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Focus op progress, niet perfectie</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Kleine dagelijkse stappen leiden tot grote resultaten</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Leer van elke ervaring, succes of 'mislukking'</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">💡 Slim Doel Stellen</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Specifiek: "3 dates per maand" vs "meer dates"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Meetbaar: Gebruik cijfers en deadlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Realistisch: Begin klein, bouw op</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Snelle Acties</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("doelen")}
            >
              <Target className="w-5 h-5" />
              <span className="font-medium">Doelen Stellen</span>
              <span className="text-xs text-muted-foreground">Plan je groei</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("daily")}
            >
              <Flame className="w-5 h-5" />
              <span className="font-medium">Dagelijkse Taken</span>
              <span className="text-xs text-muted-foreground">Bouw momentum</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("monthly")}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Voortgang Check</span>
              <span className="text-xs text-muted-foreground">Bekijk je groei</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}