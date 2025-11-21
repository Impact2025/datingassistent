"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle2, Camera, Search, Award, CheckCircle2, Sparkles, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing components
import { ProfielCoachTab } from "./profiel-coach-tab";
import { FotoAdviesTab } from "./foto-advies-tab";
import { SkillsAssessmentTab } from "./skills-assessment-tab";
import { StatsTab } from "./stats-tab";

interface ProfilPersoonlijkheidModuleProps {
  onTabChange?: (tab: string) => void;
}

export function ProfilPersoonlijkheidModule({ onTabChange }: ProfilPersoonlijkheidModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState("profiel-bouwer");

  const subModules = [
    {
      id: "profiel-bouwer",
      label: "Profiel Bouwer",
      icon: UserCircle2,
      description: "Maak je ideale profieltekst met AI hulp",
      component: <ProfielCoachTab />,
      badge: "Aanbevolen"
    },
    {
      id: "vaardigheden-scan",
      label: "Vaardigheden Scan",
      icon: Award,
      description: "Ontdek je sterke punten en ontwikkelgebieden",
      component: <SkillsAssessmentTab />,
      badge: "Nieuw"
    },
    {
      id: "stats",
      label: "Stats",
      icon: CheckCircle2,
      description: "Overzicht van tools, AI, openers en beschikbaarheid",
      component: <StatsTab />,
      badge: "Overzicht"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-primary" />
            Profiel & Persoonlijkheid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Bouw je beste dating profiel en ontdek je unieke persoonlijkheid.
          </p>
        </CardContent>
      </Card>

      {/* Sub-module Navigation - Professional Card Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Kies je tool</h3>
          <p className="text-sm text-muted-foreground">Selecteer de tool die je nu wilt gebruiken</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeSubTab === module.id;

            return (
              <Card
                key={module.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                  isActive
                    ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 ring-2 ring-pink-500/20"
                    : "border-border hover:border-pink-300 hover:bg-pink-50/30 dark:hover:bg-pink-950/10"
                )}
                onClick={() => setActiveSubTab(module.id)}
              >
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-pink-500 text-white"
                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                      <Icon className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h4 className={cn(
                          "font-semibold text-sm",
                          isActive ? "text-pink-700 dark:text-pink-300" : "text-foreground"
                        )}>
                          {module.label}
                        </h4>
                        {module.badge && (
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {module.badge}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {module.description}
                      </p>
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
                    <div className="w-12 h-12 mx-auto mb-3 bg-pink-500 text-white rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{activeModule.label}</h3>
                    <p className="text-muted-foreground">{activeModule.description}</p>
                    {activeModule.badge && (
                      <Badge variant="secondary" className="mt-2">
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Snelle Acties</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => onTabChange?.("daily")}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Dag Taken</span>
              <span className="text-xs text-muted-foreground">Dagelijkse voortgang</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => onTabChange?.("monthly-report")}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Maand Overzicht</span>
              <span className="text-xs text-muted-foreground">Maandelijkse rapportage</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => onTabChange?.("yearly-review")}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Jaar Overzicht</span>
              <span className="text-xs text-muted-foreground">Jaarlijkse review</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}