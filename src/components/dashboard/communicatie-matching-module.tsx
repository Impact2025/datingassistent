"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bot, Sparkles, CheckCircle2, MessageSquarePlus, Users, MessageSquare, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing components
import { GesprekStarterTab } from "./gesprek-starter-tab";
import { ChatCoachTab } from "./chat-coach-tab";
import { PlatformMatchTool } from "./platform-match-tool";
import { OpeningszinnenTool } from "./openingszinnen-tool";
import { IJsbrekerGeneratorTool } from "./ijsbreker-generator-tool";
import { VeiligheidscheckTool } from "./veiligheidscheck-tool";

interface CommunicatieMatchingModuleProps {
  onTabChange?: (tab: string) => void;
}

export function CommunicatieMatchingModule({ onTabChange }: CommunicatieMatchingModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState("opener-lab");

  const subModules = [
    {
      id: "opener-lab",
      label: "Opener Lab",
      icon: MessageSquarePlus,
      description: "Genereer persoonlijke openingszinnen",
      component: <GesprekStarterTab />,
      badge: "Populair"
    },
    {
      id: "chat-coach",
      label: "Chat Coach",
      icon: Bot,
      description: "Advies tijdens gesprekken",
      component: <ChatCoachTab />,
      badge: null
    },
    {
      id: "platform-match",
      label: "Platform Match",
      icon: Users,
      description: "Vind matches op verschillende platforms",
      component: <PlatformMatchTool />,
      badge: "AI"
    },
    {
      id: "openingszinnen",
      label: "Openingszinnen",
      icon: MessageSquare,
      description: "Voorbeelden van goede openingsberichten",
      component: <OpeningszinnenTool />,
      badge: "AI"
    },
    {
      id: "ijsbreker-generator",
      label: "IJsbreker Generator",
      icon: Sparkles,
      description: "Genereer leuke gesprekstarters",
      component: <IJsbrekerGeneratorTool />,
      badge: "AI"
    },
    {
      id: "veiligheidscheck",
      label: "Veiligheidscheck",
      icon: CheckCircle2,
      description: "Controleer veiligheid van gesprekken",
      component: <VeiligheidscheckTool />,
      badge: "AI"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Communicatie & Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Leer effectief communiceren en vind je ideale matches. Van de eerste boodschap tot diepgaande gesprekken.
          </p>

          {/* Progress Overview - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <div className="text-center p-2 bg-primary/5 rounded-md">
              <div className="text-sm font-bold text-primary">7</div>
              <div className="text-xs text-muted-foreground">Tools</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-md">
              <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-green-600" />
              <div className="text-xs text-muted-foreground">AI</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-sm font-bold text-blue-600">∞</div>
              <div className="text-xs text-muted-foreground">Openers</div>
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
            <h3 className="text-lg font-semibold mb-2">Kies je communicatie tool</h3>
            <p className="text-sm text-muted-foreground">Selecteer de tool die je nu wilt gebruiken</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {subModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeSubTab === module.id;

              return (
                <Card
                  key={module.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                    isActive
                      ? "border-coral-500 bg-coral-50/50 dark:bg-coral-950/20 ring-2 ring-coral-500/20"
                      : "border-border hover:border-coral-300 hover:bg-coral-50/30 dark:hover:bg-coral-950/10"
                  )}
                  onClick={() => setActiveSubTab(module.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="space-y-3">
                      <div className={cn(
                        "w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors",
                        isActive
                          ? "bg-coral-500 text-white"
                          : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h4 className={cn(
                          "font-semibold text-xs leading-tight",
                          isActive ? "text-coral-700 dark:text-coral-300" : "text-foreground"
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
          <Card className="border-t-4 border-t-coral-500">
            <CardContent className="p-6">
              {(() => {
                const activeModule = subModules.find(m => m.id === activeSubTab);
                if (!activeModule) return null;

                const Icon = activeModule.icon;
                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-coral-500 text-white rounded-full flex items-center justify-center">
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

      {/* Communication Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Communicatie Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">✅ Doe dit</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Wees authentiek en specifiek in je berichten</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Stel open vragen om gesprekken te stimuleren</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Reageer timely (binnen 24 uur)</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-700">❌ Vermijd dit</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Generic berichten ("Hoi hoe gaat het?")</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Te lange berichten bij eerste contact</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Gesprekken forceren als interesse ontbreekt</span>
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
              onClick={() => setActiveSubTab("opener-lab")}
            >
              <MessageSquarePlus className="w-5 h-5" />
              <span className="font-medium">Opener Genereren</span>
              <span className="text-xs text-muted-foreground">Voor nieuwe matches</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("chat-coach")}
            >
              <Bot className="w-5 h-5" />
              <span className="font-medium">Chat Advies</span>
              <span className="text-xs text-muted-foreground">Tijdens gesprekken</span>
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}