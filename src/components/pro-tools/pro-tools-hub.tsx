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
  MessageCircle,
  Target,
  Sparkles,
  Wand2,
  ArrowLeft,
  Crown,
  Zap
} from 'lucide-react';
import { BadgesShowcase } from '@/components/engagement/badges-showcase';
import { DatingActivityLogger } from '@/components/engagement/dating-activity-logger';
import { GesprekStarterTab } from '@/components/dashboard/gesprek-starter-tab';
import { SkillsAssessment } from '@/components/dashboard/skills-assessment';
import { PersonalRecommendations } from '@/components/dashboard/personal-recommendations';
import { DatingProfilerAI } from '@/components/dashboard/dating-profiler-ai';

interface ProTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: string;
  value: string;
}

export function ProToolsHub() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const proTools: ProTool[] = [
    {
      id: 'badges',
      title: 'Achievements & Badges',
      description: 'Verdien badges en unlock achievements terwijl je groeit',
      icon: <Trophy className="w-6 h-6" />,
      badge: 'Gamification',
      gradient: 'from-yellow-500 to-orange-500',
      value: '+35% Retention'
    },
    {
      id: 'activity-log',
      title: 'Dating Activity Logger',
      description: 'Track je matches, gesprekken en dates met data-driven insights',
      icon: <TrendingUp className="w-6 h-6" />,
      badge: 'Analytics',
      gradient: 'from-blue-500 to-cyan-500',
      value: 'Data Insights'
    },
    {
      id: 'conversation-ai',
      title: 'Conversation Starter AI',
      description: 'AI-powered openers, icebreakers en safety checks',
      icon: <MessageCircle className="w-6 h-6" />,
      badge: 'AI Powered',
      gradient: 'from-green-500 to-emerald-500',
      value: 'Instant Results'
    },
    {
      id: 'skills',
      title: 'Skills Assessment',
      description: 'Ontdek je sterke punten en groei gebieden met personalized feedback',
      icon: <Target className="w-6 h-6" />,
      badge: 'Personalization',
      gradient: 'from-purple-500 to-pink-500',
      value: 'Custom Path'
    },
    {
      id: 'recommendations',
      title: 'Personal Recommendations',
      description: 'AI-driven aanbevelingen specifiek voor jouw dating journey',
      icon: <Sparkles className="w-6 h-6" />,
      badge: 'Smart AI',
      gradient: 'from-pink-500 to-rose-500',
      value: 'Personalized'
    },
    {
      id: 'profile-generator',
      title: 'AI Profiel Generator 2.0',
      description: 'Genereer complete profielen en bio varianten met AI',
      icon: <Wand2 className="w-6 h-6" />,
      badge: 'Premium',
      gradient: 'from-indigo-500 to-purple-500',
      value: 'Pro Feature'
    }
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pro Tools</h1>
            <p className="text-gray-600">Geavanceerde tools voor maximale dating success</p>
          </div>
        </div>

        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Zap className="w-3 h-3 mr-1" />
          6 Premium Tools Beschikbaar
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview" className="text-xs lg:text-sm">
            Overzicht
          </TabsTrigger>
          <TabsTrigger value="badges" className="text-xs lg:text-sm">
            Badges
          </TabsTrigger>
          <TabsTrigger value="activity-log" className="text-xs lg:text-sm">
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="conversation-ai" className="text-xs lg:text-sm">
            Gesprek AI
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs lg:text-sm">
            Skills
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs lg:text-sm">
            Aanbevelingen
          </TabsTrigger>
          <TabsTrigger value="profile-generator" className="text-xs lg:text-sm">
            Profiel AI
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Welkom bij Pro Tools</h2>
              <p className="text-gray-600 mb-4">
                Deze collectie van geavanceerde tools is ontworpen om je dating success naar het volgende niveau te tillen.
                Elk tool biedt unieke insights en features die je helpen groeien.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-purple-600">Gamification</div>
                  <div className="text-gray-600">Badges & Achievements voor motivatie</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-blue-600">Data Analytics</div>
                  <div className="text-gray-600">Track en optimize je dating activiteit</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-green-600">AI Powered</div>
                  <div className="text-gray-600">Slimme suggesties en content generatie</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proTools.map((tool) => (
              <Card
                key={tool.id}
                className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-300"
                onClick={() => setActiveTab(tool.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white`}
                    >
                      {tool.icon}
                    </div>
                    {tool.badge && (
                      <Badge variant="outline" className="text-xs">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-600">{tool.value}</span>
                    <Button size="sm" variant="ghost" className="group-hover:bg-purple-100">
                      Open →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual Tool Tabs */}
        <TabsContent value="badges">
          {user && <BadgesShowcase userId={user.id} />}
        </TabsContent>

        <TabsContent value="activity-log">
          {user && <DatingActivityLogger userId={user.id} />}
        </TabsContent>

        <TabsContent value="conversation-ai">
          <GesprekStarterTab />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsAssessment />
        </TabsContent>

        <TabsContent value="recommendations">
          <PersonalRecommendations />
        </TabsContent>

        <TabsContent value="profile-generator">
          <DatingProfilerAI />
        </TabsContent>
      </Tabs>
    </div>
  );
}
