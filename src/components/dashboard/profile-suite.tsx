"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle2, Sparkles, Camera, Users, Award, CheckCircle2, FileText, Target, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing profile components
import { InteractiveProfileCoach } from "./interactive-profile-coach";
import { ProfielCoachTab } from "./profiel-coach-tab";
import { PhotoAnalysisTab } from "./photo-analysis-tab";
import { PlatformMatchTool } from "./platform-match-tool";
import { SkillsAssessmentTab } from "./skills-assessment-tab";
import { StatsTab } from "./stats-tab";
import { ProfileSuiteTutorial } from "@/components/onboarding/tutorials/profile-suite-tutorial";
import { ContextualHelpButton } from "@/components/onboarding/contextual-help-button";
import { AttachmentAssessmentFlow } from "@/components/attachment-assessment/attachment-assessment-flow";
import { EmotioneleReadinessFlow } from "@/components/emotional-readiness/emotionele-readiness-flow";

interface ProfileSuiteProps {
  onTabChange?: (tab: string) => void;
}

export function ProfileSuite({ onTabChange }: ProfileSuiteProps) {
  const [activeTab, setActiveTab] = useState("profile-builder");

  const profileTools = [
    {
      id: "hechtingsstijl",
      label: "🏆 Hechtingsstijl QuickScan",
      icon: Heart,
      description: "Ontdek je hechtingsdynamiek - de basis van hoe je liefhebt en verbindt",
      component: <AttachmentAssessmentFlow />,
      badge: "AI-PRO",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "emotionele-ready",
      label: "💙 Emotionele Ready Scan",
      icon: Sparkles,
      description: "Ben je klaar voor dating? Ontdek je emotionele beschikbaarheid",
      component: <EmotioneleReadinessFlow />,
      badge: "AI",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "zelfbeeld",
      label: "🪩 Zelfbeeld & Eerste Indruk",
      icon: UserCircle2,
      description: "Camera AI voor profile optimization en eerste indruk maximalisatie",
      component: <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Zelfbeeld & Eerste Indruk PRO</h3>
        <p className="text-muted-foreground mb-6">
          AI-gedreven profile enhancement met camera integratie.
        </p>
        <Button
          onClick={() => window.location.href = '/zelfbeeld'}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          Start Profile Analysis
        </Button>
      </div>,
      badge: "AI-PRO",
      color: "from-purple-500 to-indigo-500"
    },
    {
      id: "dating-archetypes",
      label: "🎭 Dating Archetypes",
      icon: Users,
      description: "Ontdek je dominante dating energie archetype",
      component: <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Mini-Persoonlijkheidsprofiel</h3>
        <p className="text-muted-foreground mb-6">
          8 professionele dating energie archetypes voor betere matches.
        </p>
        <Button
          onClick={() => window.location.href = '/dating-archetypes'}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          Start Archetype Scan
        </Button>
      </div>,
      badge: "AI",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "profile-builder",
      label: "Profiel Bouwer",
      icon: FileText,
      description: "Maak je ideale profieltekst met AI hulp",
      component: <InteractiveProfileCoach />,
      badge: "Aanbevolen",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "photo-analysis",
      label: "Foto Analyse",
      icon: Camera,
      description: "AI feedback op je profielfoto's",
      component: <PhotoAnalysisTab />,
      badge: "AI",
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: "platform-match",
      label: "Professionele Platform Match",
      icon: Target,
      description: "Wetenschappelijk onderbouwde platform aanbevelingen gebaseerd op je profiel",
      component: <PlatformMatchTool />,
      badge: "AI",
      color: "from-teal-500 to-cyan-500"
    },
    {
      id: "skills-scan",
      label: "Vaardigheden Scan",
      icon: Award,
      description: "Ontdek je sterke punten",
      component: <SkillsAssessmentTab />,
      badge: "Nieuw",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "stats",
      label: "Stats",
      icon: CheckCircle2,
      description: "Overzicht van je voortgang",
      component: <StatsTab />,
      badge: "Overzicht",
      color: "from-gray-500 to-slate-500"
    }
  ];

  const activeTool = profileTools.find(tool => tool.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Tool Selector */}
      <div className="space-y-6">
        <div className="text-center relative">
          <div className="absolute top-0 right-0">
            <ContextualHelpButton
              tutorialId="profile-suite-basics"
              helpTitle="Profiel Suite Hulp"
              helpText="Leer hoe je een sterk, aantrekkelijk profiel bouwt dat de juiste matches aantrekt. Van hechtingsstijl tot platform matching."
              variant="icon"
              size="sm"
              quickTips={[
                {
                  icon: <User className="w-4 h-4 text-blue-600" />,
                  title: "Begin met jezelf kennen",
                  description: "Hechtingsstijl scan helpt je begrijpen hoe je liefhebt"
                },
                {
                  icon: <Camera className="w-4 h-4 text-green-600" />,
                  title: "Foto's zijn cruciaal",
                  description: "Gebruik de AI foto analyse voor professionele feedback"
                },
                {
                  icon: <FileText className="w-4 h-4 text-purple-600" />,
                  title: "Bio schrijven",
                  description: "Laat AI helpen met pakkende, authentieke teksten"
                }
              ]}
            />
          </div>
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
                data-tutorial={`${tool.id}-card`}
                className={cn(
                  "cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md bg-white",
                  isActive && "ring-2 ring-pink-200 shadow-lg"
                )}
                onClick={() => setActiveTab(tool.id)}
              >
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {tool.label}
                        </h3>
                        {tool.badge && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            {tool.badge}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 leading-tight">
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

      {/* Profile Suite Tutorial */}
      <ProfileSuiteTutorial />
    </div>
  );
}