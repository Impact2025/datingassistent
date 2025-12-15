"use client";

import { Suspense } from 'react';



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  Award,
  Calendar,
  Flame,
  Star,
  ArrowLeft,
  Plus,
  CheckCircle
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: string;
  category: 'profile' | 'communication' | 'dates' | 'personal';
  status: 'active' | 'completed' | 'overdue';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

function GroeiPageContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('goals');

  const goals: Goal[] = [
    {
      id: 'profile-optimization',
      title: 'Profiel Optimalisatie',
      description: 'Haal 90% profielscore',
      progress: 75,
      target: 90,
      deadline: '2025-12-01',
      category: 'profile',
      status: 'active',
    },
    {
      id: 'conversation-mastery',
      title: 'Gespreksvaardigheden',
      description: 'Stuur 20 berichten per week',
      progress: 60,
      target: 20,
      deadline: '2025-11-30',
      category: 'communication',
      status: 'active',
    },
    {
      id: 'first-date',
      title: 'Eerste Date',
      description: 'Plan je eerste date deze maand',
      progress: 0,
      target: 1,
      deadline: '2025-11-30',
      category: 'dates',
      status: 'active',
    },
  ];

  const achievements: Achievement[] = [
    {
      id: 'first-login',
      title: 'Eerste Stap',
      description: 'Je eerste login bij DatingAssistent',
      icon: '🎯',
      unlockedAt: '2025-11-15',
      rarity: 'common',
    },
    {
      id: 'profile-complete',
      title: 'Profiel Expert',
      description: 'Voltooid profiel met alle secties',
      icon: '📸',
      unlockedAt: '2025-11-18',
      rarity: 'rare',
    },
    {
      id: 'chat-master',
      title: 'Chat Kampioen',
      description: '50 succesvolle gesprekken gevoerd',
      icon: '💬',
      unlockedAt: '2025-11-20',
      rarity: 'epic',
    },
  ];

  const weeklyStats = {
    messagesSent: 45,
    matches: 12,
    dates: 2,
    profileViews: 89,
    responseRate: 68,
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'profile': return 'bg-gray-100 text-gray-700';
      case 'communication': return 'bg-gray-100 text-gray-700';
      case 'dates': return 'bg-pink-100 text-pink-700';
      case 'personal': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-200';
      case 'rare': return 'border-pink-200';
      case 'epic': return 'border-pink-300';
      case 'legendary': return 'border-pink-400';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Groei</h1>
            <p className="text-sm text-gray-600">Je dating journey tracken</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="goals" className="text-xs">Doelen</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Voortgang</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">Badges</TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Jouw Doelen</h2>
              <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                <Plus className="w-4 h-4 mr-1" />
                Nieuw Doel
              </Button>
            </div>

            {goals.map((goal) => (
              <Card key={goal.id} className="border-0 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <Badge className={`text-xs ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-pink-600">
                        {goal.progress}{goal.target > 1 ? `/${goal.target}` : '%'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Deadline: {new Date(goal.deadline).toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  </div>

                  <Progress value={goal.progress} className="h-2 mb-3" />

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Bijwerken
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-600" />
                  Deze Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{weeklyStats.messagesSent}</div>
                    <div className="text-xs text-gray-600">Berichten verstuurd</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{weeklyStats.matches}</div>
                    <div className="text-xs text-gray-600">Nieuwe matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{weeklyStats.dates}</div>
                    <div className="text-xs text-gray-600">Dates gepland</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{weeklyStats.responseRate}%</div>
                    <div className="text-xs text-gray-600">Response rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Overview */}
            <Card className="border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Maand Overzicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profiel Compleetheid</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Gespreksvaardigheden</span>
                      <span>72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Algemene Voortgang</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-lg font-semibold text-gray-900">Jouw Badges</h2>
              <p className="text-sm text-gray-600">{achievements.length} badges verdiend</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`border-2 ${getRarityColor(achievement.rarity)} bg-white`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    <Badge className={`text-xs ${
                      achievement.rarity === 'legendary' ? 'bg-pink-100 text-pink-700' :
                      achievement.rarity === 'epic' ? 'bg-pink-100 text-pink-700' :
                      achievement.rarity === 'rare' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {achievement.rarity}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(achievement.unlockedAt).toLocaleDateString('nl-NL')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Achievement Progress */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Streak: 7 dagen</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nog 3 dagen voor de "Week Warrior" badge!
                </p>
                <Progress value={70} className="h-2" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
export default function GroeiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    }>
      <GroeiPageContent />
    </Suspense>
  );
}
