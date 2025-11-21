"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User,
  MessageCircle,
  Calendar,
  Camera,
  Heart,
  CheckCircle,
  TrendingUp,
  Lightbulb
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/providers/user-provider";

const DATING_TIPS = [
  "Wees geduldig. De juiste connectie vinden kost tijd.",
  "Stel open vragen in je gesprek voor betere interactie.",
  "Een goede profielfoto laat duidelijk je gezicht zien.",
  "Houd het positief in je profiel en focus op wat je zoekt."
];

interface UserGoal {
  id: number;
  title: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
}

export function DashboardTabNew({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { user, userProfile } = useUser();
  const [dailyTip, setDailyTip] = useState("");
  const [goals, setGoals] = useState<UserGoal[]>([]);

  useEffect(() => {
    setDailyTip(DATING_TIPS[Math.floor(Math.random() * DATING_TIPS.length)]);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data.slice(0, 3)); // Top 3 goals
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const quickActions = [
    {
      icon: User,
      title: "Jouw profiel",
      description: "Bekijk en optimaliseer je profiel",
      action: "profiel",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: MessageCircle,
      title: "Chat coach",
      description: "24/7 hulp bij gesprekken",
      action: "chat-coach",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Dateplanner",
      description: "Creatieve date ideeën",
      action: "date-planner",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Camera,
      title: "Foto check",
      description: "Professionele foto feedback",
      action: "foto-advies",
      color: "from-purple-500 to-violet-500"
    }
  ];

  const stats = [
    { label: "Opgeslagen profielen", value: "0", icon: User },
    { label: "Foto analyse check", value: "?", icon: Camera },
    { label: "Platform matchmaker check", value: "✓", icon: CheckCircle }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header - Clean */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Jouw Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welkom bij je persoonlijke dating-cockpit. Begin met de 'Online Cursus' voor een vliegende start,
          of ga direct aan de slag met de andere tools!
        </p>
      </div>

      {/* Learning Path Card - Minimal */}
      <Card className="border-l-4 border-l-pink-500 bg-gradient-to-r from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-pink-100 dark:bg-pink-900 p-3">
              <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-lg">
                🎯 Jouw persoonlijke leertraject
              </h3>
              <p className="text-sm text-muted-foreground">
                Gebaseerd op je vaardigheidenbeoordeling hebben we een leertraject voor je samengesteld.
              </p>
              <Button
                onClick={() => onTabChange?.('goals')}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Bekijk leertraject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid - Modern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.action}
              className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              onClick={() => onTabChange?.(action.action)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className={`rounded-lg bg-gradient-to-br ${action.color} p-3 w-fit`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold group-hover:text-pink-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Row - Clean */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tip of the Day - Minimal */}
      {dailyTip && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 h-fit">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">💡 Tip van de coach</h3>
                <p className="text-sm text-muted-foreground">{dailyTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Goals - If any */}
      {goals.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Je actieve doelen</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange?.('goals')}
              >
                Alles bekijken
              </Button>
            </div>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{goal.title}</span>
                    <span className="text-muted-foreground">
                      {goal.current_value}/{goal.target_value}
                    </span>
                  </div>
                  <Progress value={goal.progress_percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
