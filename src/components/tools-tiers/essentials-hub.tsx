"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  TrendingUp,
  Sparkles,
  BarChart3,
  ArrowLeft,
  Gift,
  Zap
} from 'lucide-react';
import { BadgesShowcase } from '@/components/engagement/badges-showcase';
import { DatingActivityLogger } from '@/components/engagement/dating-activity-logger';
import { PersonalRecommendations } from '@/components/dashboard/personal-recommendations';
import { StatsTab } from '@/components/dashboard/stats-tab';

export function EssentialsHub() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const essentialTools = [
    {
      id: 'badges',
      title: 'Badges & Achievements',
      description: 'Verdien badges en unlock achievements',
      icon: <Trophy className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'activity',
      title: 'Dating Activity Logger',
      description: 'Track je matches, gesprekken en dates',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'recommendations',
      title: 'Personal Recommendations',
      description: 'AI-driven aanbevelingen voor jou',
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'stats',
      title: 'Stats & Voortgang',
      description: 'Overzicht van je complete journey',
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Essentials</h1>
            <p className="text-gray-600">Gratis tools voor iedereen</p>
          </div>
        </div>

        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <Gift className="w-3 h-3 mr-1" />
          100% Gratis - Geen upgrade nodig
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="recommendations">Aanbevelingen</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Gratis Dating Tools</h2>
              <p className="text-gray-600 mb-4">
                Deze essential tools zijn 100% gratis en altijd beschikbaar. Perfect om te starten met je dating journey!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-green-600">Gamification</div>
                  <div className="text-gray-600">Blijf gemotiveerd met badges</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-blue-600">Analytics</div>
                  <div className="text-gray-600">Track je complete dating activiteit</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {essentialTools.map((tool) => (
              <Card
                key={tool.id}
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300"
                onClick={() => setActiveTab(tool.id)}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white mb-4`}
                  >
                    {tool.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                  <Button size="sm" variant="ghost" className="group-hover:bg-green-100">
                    Open Tool →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upgrade CTA */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Klaar voor meer?</h3>
                  <p className="text-gray-600 mb-4">
                    Unlock AI-powered tools en geavanceerde features met Kickstart Toolkit
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push('/kickstart-toolkit')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Bekijk Kickstart Toolkit
                    </Button>
                    <Button
                      onClick={() => router.push('/pro-arsenal')}
                      variant="outline"
                    >
                      Of bekijk Pro Arsenal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Tools */}
        <TabsContent value="badges">
          {user && <BadgesShowcase userId={user.id} />}
        </TabsContent>

        <TabsContent value="activity">
          {user && <DatingActivityLogger userId={user.id} />}
        </TabsContent>

        <TabsContent value="recommendations">
          <PersonalRecommendations />
        </TabsContent>

        <TabsContent value="stats">
          <StatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
