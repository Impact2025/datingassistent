"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle2, Sparkles, Camera, Users, Award, CheckCircle2, FileText, Target, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing profile components
import { InteractiveProfileCoach } from "./interactive-profile-coach";
import { ProfielCoachTab } from "./profiel-coach-tab";
import { PhotoAnalysisTab } from "./photo-analysis-tab";
import { PlatformMatchTool } from "./platform-match-tool";
import { SkillsAssessmentTab } from "./skills-assessment-tab";
import { StatsTab } from "./stats-tab";

interface ProfileSuiteProps {
  onTabChange?: (tab: string) => void;
}

export function ProfileSuite({ onTabChange }: ProfileSuiteProps) {
  const [activeTab, setActiveTab] = useState("profile-builder");

  const profileTools = [
    {
      id: "profile-builder",
      label: "Profiel Bouwer",
      icon: UserCircle2,
      description: "Maak je ideale profieltekst met AI hulp",
      component: <InteractiveProfileCoach />,
      badge: "Aanbevolen",
      color: "bg-blue-500"
    },
    {
      id: "photo-analysis",
      label: "Foto Analyse",
      icon: Camera,
      description: "AI feedback op je profielfoto's",
      component: <PhotoAnalysisTab />,
      badge: "AI",
      color: "bg-purple-500"
    },
    {
      id: "platform-match",
      label: "Professionele Platform Match",
      icon: Users,
      description: "Wetenschappelijk onderbouwde platform aanbevelingen gebaseerd op je profiel",
      component: <PlatformMatchTool />,
      badge: "AI",
      color: "bg-orange-500"
    },
    {
      id: "skills-scan",
      label: "Vaardigheden Scan",
      icon: Award,
      description: "Ontdek je sterke punten",
      component: <SkillsAssessmentTab />,
      badge: "Nieuw",
      color: "bg-pink-500"
    },
    {
      id: "stats",
      label: "Stats",
      icon: CheckCircle2,
      description: "Overzicht van je voortgang",
      component: <StatsTab />,
      badge: "Overzicht",
      color: "bg-indigo-500"
    }
  ];

  const activeTool = profileTools.find(tool => tool.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Tool Selector */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Kies je profiel tool</h3>
          <p className="text-sm text-muted-foreground">Van tekst tot foto's tot platform keuze</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;

            return (
              <Card
                key={tool.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                  isActive
                    ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-primary/5/30 dark:hover:bg-primary/5/10"
                )}
                onClick={() => setActiveTab(tool.id)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className={cn(
                      "w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors",
                      isActive
                        ? tool.color + " text-white"
                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <h4 className={cn(
                          "font-semibold text-sm",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {tool.label}
                        </h4>
                        {tool.badge && (
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {tool.badge}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-tight">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Tool Content */}
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-4">
            {activeTool && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  {activeTool.component}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Tips */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Profiel Succes Tips
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-green-700 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Wat werkt goed
              </h5>
              <ul className="text-sm space-y-2 text-green-700">
                <li>• Wees authentiek en specifiek</li>
                <li>• Toon humor en persoonlijkheid</li>
                <li>• Gebruik hoge kwaliteit foto's</li>
                <li>• Vermeld hobby's en interesses</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-blue-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Tips voor succes
              </h5>
              <ul className="text-sm space-y-2 text-blue-700">
                <li>• Laat AI je eerste versie verbeteren</li>
                <li>• Test verschillende stijlen</li>
                <li>• Gebruik foto feedback voor selectie</li>
                <li>• Kies platforms die bij je passen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Snelle Profiel Acties</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveTab("profile-builder")}
            >
              <UserCircle2 className="w-5 h-5" />
              <span className="font-medium">Profiel Maken</span>
              <span className="text-xs text-muted-foreground">Start met je tekst</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveTab("photo-analysis")}
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">Foto's Checken</span>
              <span className="text-xs text-muted-foreground">AI foto advies</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveTab("platform-match")}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Platform Kiezen</span>
              <span className="text-xs text-muted-foreground">Vind je match</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}