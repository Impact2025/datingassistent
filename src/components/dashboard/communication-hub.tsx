"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Shield, HelpCircle, Zap, Target, Heart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing communication tools
import { ChatCoachTab } from "./chat-coach-tab";
import { OpeningszinnenTool } from "./openingszinnen-tool";
import { IJsbrekerGeneratorTool } from "./ijsbreker-generator-tool";
import { VeiligheidscheckTool } from "./veiligheidscheck-tool";
import { GespreksAssistent } from "./gespreks-assistent";

interface CommunicationHubProps {
  onTabChange?: (tab: string) => void;
}

export function CommunicationHub({ onTabChange }: CommunicationHubProps) {
  const [activeTab, setActiveTab] = useState("chat");

  const communicationTools = [
    {
      id: "chat",
      label: "Chat Coach",
      icon: MessageSquare,
      description: "Stel vragen aan je AI dating coach",
      component: <ChatCoachTab />,
      badge: "Altijd beschikbaar",
      color: "bg-blue-500"
    },
    {
      id: "gespreks-assistent",
      label: "GespreksAssistent",
      icon: MessageSquare,
      description: "AI analyse van je dating gesprekken",
      component: <GespreksAssistent onTabChange={onTabChange} />,
      badge: "AI",
      color: "bg-blue-500"
    },
    {
      id: "openers",
      label: "Openingszinnen",
      icon: Sparkles,
      description: "Genereer effectieve openingsberichten",
      component: <OpeningszinnenTool />,
      badge: "Persoonlijk",
      color: "bg-pink-500"
    },
    {
      id: "icebreakers",
      label: "IJsbrekers",
      icon: Zap,
      description: "Perfecte gesprekstarters voor elke situatie",
      component: <IJsbrekerGeneratorTool />,
      badge: "Context-gebaseerd",
      color: "bg-purple-500"
    },
    {
      id: "safety",
      label: "Veiligheidscheck",
      icon: Shield,
      description: "Analyseer gesprekken op veiligheid",
      component: <VeiligheidscheckTool />,
      badge: "Essentieel",
      color: "bg-green-500"
    }
  ];

  const activeTool = communicationTools.find(tool => tool.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Communicatie Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Alles wat je nodig hebt voor succesvolle communicatie in dating
          </p>

          {/* Progress Overview - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <div className="text-center p-2 bg-primary/5 rounded-md">
              <div className="text-sm font-bold text-primary">5</div>
              <div className="text-xs text-muted-foreground">Tools</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-md">
              <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-green-600" />
              <div className="text-xs text-muted-foreground">Int</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-sm font-bold text-blue-600">∞</div>
              <div className="text-xs text-muted-foreground">Ideeën</div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {communicationTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id;

              return (
                <Card
                  key={tool.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                    isActive
                      ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 ring-2 ring-pink-500/20"
                      : "border-border hover:border-pink-300 hover:bg-pink-50/30 dark:hover:bg-pink-950/10"
                  )}
                  onClick={() => setActiveTab(tool.id)}
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
                          {tool.label}
                        </h4>

                        <p className="text-xs text-muted-foreground leading-tight">
                          {tool.description}
                        </p>

                        {tool.badge && (
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="text-xs mt-1"
                          >
                            {tool.badge}
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
          <div className="border-t pt-6">
            {(() => {
              const activeModule = communicationTools.find(m => m.id === activeTab);
              if (!activeModule) return null;
              return activeModule.component;
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Snelle Communicatie Tips</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-800 dark:text-blue-200">Eerste Bericht</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Gebruik specifieke details uit hun profiel voor 3x hogere response rate
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm text-green-800 dark:text-green-200">Diepgaande Gesprekken</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Stel open vragen en deel persoonlijke verhalen voor echte connectie
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-sm text-orange-800 dark:text-orange-200">Veiligheid</span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Check altijd rode vlaggen en vertrouw op je intuïtie
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}