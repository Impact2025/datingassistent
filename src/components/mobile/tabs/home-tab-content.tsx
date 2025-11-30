"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  Target,
  ChevronRight,
  Flame,
  Calendar,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// HOME TAB - Clean, Minimalist, Card-Based Design
// ============================================================================

interface HomeTabContentProps {
  user: any;
  userProfile: any;
}

// Dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Goedenacht';
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

export function HomeTabContent({ user, userProfile }: HomeTabContentProps) {
  const router = useRouter();
  const [stats] = useState({
    streak: 7,
    phase: 1,
    goalsCompleted: 3,
    totalGoals: 5,
  });

  const quickActions = [
    {
      title: 'Profiel Review',
      description: 'Optimaliseer je dating profiel',
      icon: Target,
      color: 'bg-pink-50 text-pink-600',
      route: '/profiel',
    },
    {
      title: 'Chat Coaching',
      description: 'Verbeter je gesprekken',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600',
      route: '/chat',
    },
    {
      title: 'Dagelijkse Check-in',
      description: 'Track je voortgang',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      route: '/groei',
    },
  ];

  const todayTasks = [
    { title: 'Profiel foto beoordeling', status: 'completed' },
    { title: 'Bio optimalisatie tips', status: 'in_progress' },
    { title: 'Openingszinnen oefenen', status: 'pending' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-4 space-y-4">
        {/* Welcome Header - Clean, White Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'Dater'}!
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Klaar om je dating game te verbeteren?
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">{stats.streak}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fase {stats.phase} voortgang</span>
                <span className="font-medium text-gray-900">{stats.goalsCompleted}/{stats.totalGoals} doelen</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.goalsCompleted / stats.totalGoals) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendation - Highlighted Card */}
        <Card className="border-2 border-pink-100 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">Aanbevolen voor jou</h3>
                  <Badge className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5">AI</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Je profiel foto's zijn goed! Focus nu op je bio om meer matches te krijgen.
                </p>
                <Button
                  onClick={() => router.push('/tools/ai-bio-generator')}
                  className="bg-pink-500 hover:bg-pink-600 text-white h-9 text-sm"
                >
                  Bio verbeteren
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 px-1">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(action.route)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Today's Tasks */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-pink-500" />
              <h3 className="font-semibold text-gray-900">Vandaag</h3>
            </div>

            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    task.status === 'completed' && "bg-green-50",
                    task.status === 'in_progress' && "bg-blue-50",
                    task.status === 'pending' && "bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    task.status === 'completed' && "bg-green-500",
                    task.status === 'in_progress' && "bg-blue-500 animate-pulse",
                    task.status === 'pending' && "bg-gray-300"
                  )} />
                  <span className={cn(
                    "text-sm flex-1",
                    task.status === 'completed' && "text-green-700",
                    task.status === 'in_progress' && "text-blue-700",
                    task.status === 'pending' && "text-gray-500"
                  )}>
                    {task.title}
                  </span>
                  {task.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">Fase {stats.phase}</p>
              <p className="text-xs text-gray-500">Je reis</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.goalsCompleted}</p>
              <p className="text-xs text-gray-500">Doelen behaald</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default HomeTabContent;
