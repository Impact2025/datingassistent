"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Sparkles, Award, BookOpen, Lightbulb, CheckCircle2, Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing components
import { OnlineCursusTab } from "./online-cursus-tab";
import { PersonalRecommendations } from "./personal-recommendations";
import { SkillsAssessmentTab } from "./skills-assessment-tab";

interface LerenOntwikkelenModuleProps {
  onTabChange?: (tab: string) => void;
}

export function LerenOntwikkelenModule({ onTabChange }: LerenOntwikkelenModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState("cursus");

  const subModules = [
    {
      id: "cursus",
      label: "Online Cursus",
      icon: GraduationCap,
      description: "Gestructureerde leerpaden voor dating skills",
      component: <OnlineCursusTab />,
      badge: "Structured"
    },
    {
      id: "aanbevelingen",
      label: "Aanbevelingen",
      icon: Sparkles,
      description: "Persoonlijke tips gebaseerd op je voortgang",
      component: <PersonalRecommendations />,
      badge: "AI Powered"
    },
    {
      id: "vaardigheden",
      label: "Vaardigheden",
      icon: Award,
      description: "Ontwikkel je dating vaardigheden",
      component: <SkillsAssessmentTab />,
      badge: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Leren & Ontwikkelen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Leer nieuwe vaardigheden, volg cursussen en ontwikkel je dating expertise. Van beginner tot expert.
          </p>

          {/* Progress Overview - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <div className="text-center p-2 bg-primary/5 rounded-md">
              <div className="text-sm font-bold text-primary">3</div>
              <div className="text-xs text-muted-foreground">Tools</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-md">
              <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-green-600" />
              <div className="text-xs text-muted-foreground">Smart</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-sm font-bold text-blue-600">∞</div>
              <div className="text-xs text-muted-foreground">Content</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-md">
              <div className="text-sm font-bold text-purple-600">24/7</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-module Navigation - Compact Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Kies je leer tool</h3>
            <p className="text-sm text-muted-foreground">Selecteer de tool die je nu wilt gebruiken</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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

      {/* Learning Resources */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Leerbronnen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">🎯 Leerdoelen</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Professionele communicatie skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Zelfvertrouwen opbouwen</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Relatiepatronen begrijpen</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">💡 Leermethodes</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Interactieve video lessen</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Praktische oefeningen</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI-gedreven feedback</span>
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
              onClick={() => setActiveSubTab("cursus")}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium">Cursus Starten</span>
              <span className="text-xs text-muted-foreground">Gestructureerd leren</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("aanbevelingen")}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Persoonlijke Tips</span>
              <span className="text-xs text-muted-foreground">AI aanbevelingen</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("vaardigheden")}
            >
              <Award className="w-5 h-5" />
              <span className="font-medium">Skills Test</span>
              <span className="text-xs text-muted-foreground">Ontdek je niveau</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}