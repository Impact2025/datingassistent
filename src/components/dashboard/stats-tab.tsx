"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Wrench, Bot, MessageSquare, Clock, Wifi } from "lucide-react";

export function StatsTab() {
  const stats = [
    {
      value: "Tools",
      label: "Beschikbaar",
      icon: Wrench,
      color: "text-primary",
      bgColor: "bg-primary/5"
    },
    {
      value: "AI",
      label: "Powered",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      value: "∞",
      label: "Openers",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      value: "24/7",
      label: "Online",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      value: "Online",
      label: "Altijd",
      icon: Wifi,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-indigo-600">Stats</h2>
            <p className="text-sm text-muted-foreground">
              Overzicht van beschikbare tools en functies
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`${stat.bgColor} border-0`}>
              <CardContent className="p-4 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className={`text-lg font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-purple-50 border-primary/20">
        <CardContent className="p-6 text-center">
          <h4 className="font-semibold mb-2">Waarom DatingAssistent?</h4>
          <p className="text-sm text-muted-foreground">
            Met onze AI-gedreven tools, ongelimiteerde openingszinnen, en 24/7 beschikbaarheid
            helpen we je om succesvollere verbindingen te maken in de dating wereld.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}