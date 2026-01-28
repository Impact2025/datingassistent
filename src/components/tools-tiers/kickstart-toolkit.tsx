"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccessControl } from '@/hooks/use-access-control';
import {
  MessageCircle,
  Wand2,
  Camera,
  Heart,
  Bot,
  ArrowLeft,
  Rocket,
  Lock,
  Crown
} from 'lucide-react';
import { GesprekStarterTab } from '@/components/dashboard/gesprek-starter-tab';
import { DatingProfilerAI } from '@/components/dashboard/dating-profiler-ai';
import { PhotoAnalysisTab } from '@/components/dashboard/photo-analysis-tab';
import { ChatCoachTab } from '@/components/dashboard/chat-coach-tab';
import { AttachmentAssessmentFlow } from '@/components/attachment-assessment/attachment-assessment-flow';

export function KickstartToolkit() {
  const router = useRouter();
  const { user } = useUser();
  const { userTier, isLoading } = useAccessControl();
  const [activeTab, setActiveTab] = useState('overview');

  const hasAccess = userTier !== 'free';

  const kickstartTools = [
    {
      id: 'conversation',
      title: 'Conversation Starters',
      description: 'AI-powered openingszinnen en icebreakers',
      icon: <MessageCircle className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
      limit: '3x per dag (Kickstart)',
    },
    {
      id: 'profile',
      title: 'AI Profile Builder',
      description: 'Genereer complete dating profielen met AI',
      icon: <Wand2 className="w-6 h-6" />,
      gradient: 'from-purple-500 to-coral-500',
      limit: '1x gebruik (Kickstart)',
    },
    {
      id: 'photos',
      title: 'Photo Analysis',
      description: 'AI feedback op je profielfoto\'s',
      icon: <Camera className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      limit: '2x per dag (Kickstart)',
    },
    {
      id: 'chat',
      title: 'Chat Coach',
      description: '24/7 AI dating coach voor al je vragen',
      icon: <Bot className="w-6 h-6" />,
      gradient: 'from-coral-500 to-rose-500',
      limit: '10x per dag (Kickstart)',
    },
    {
      id: 'hechtingsstijl',
      title: 'Hechtingsstijl Scan',
      description: 'Ontdek je hechtingsstijl voor betere relaties',
      icon: <Heart className="w-6 h-6" />,
      gradient: 'from-red-500 to-coral-500',
      limit: 'Unlimited',
    },
  ];

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Kickstart Toolkit</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Unlock AI-powered tools om je dating journey te versnellen. Start met het 21-dagen Kickstart programma en krijg toegang tot alle tools.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">AI Conversation Starters</Badge>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">Profile Builder</Badge>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">Photo Analysis</Badge>
                <Badge className="bg-coral-100 text-coral-700 dark:bg-coral-900/50 dark:text-coral-300">24/7 Chat Coach</Badge>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/kickstart')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Start Kickstart (€47)
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Terug
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kickstart Toolkit</h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered tools voor je dating success</p>
          </div>
        </div>

        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
          <Rocket className="w-3 h-3 mr-1" />
          5 AI Tools - Kickstart Member
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="conversation">Gesprek AI</TabsTrigger>
          <TabsTrigger value="profile">Profile Builder</TabsTrigger>
          <TabsTrigger value="photos">Foto's</TabsTrigger>
          <TabsTrigger value="chat">Chat Coach</TabsTrigger>
          <TabsTrigger value="hechtingsstijl">Hechtingsstijl</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2 dark:text-white">Jouw AI Toolkit</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Deze tools gebruiken AI om je te helpen met profielen, gesprekken en foto's. Perfect voor een vliegende start!
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tip: Wil je unlimited access? Upgrade naar Pro Arsenal voor onbeperkt gebruik van alle tools
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kickstartTools.map((tool) => (
              <Card
                key={tool.id}
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-600 dark:bg-gray-800 dark:border-gray-700"
                onClick={() => setActiveTab(tool.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white`}
                    >
                      {tool.icon}
                    </div>
                    <Badge variant="outline" className="text-xs dark:border-gray-500">{tool.limit}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.description}</p>
                  <Button size="sm" variant="ghost" className="group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                    Open Tool →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upgrade CTA */}
          <Card className="border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-coral-50 dark:from-purple-900/30 dark:to-coral-900/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xl font-bold dark:text-white">Wil je meer?</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Unlock Pro Arsenal voor Skills Assessment, Date Planner en unlimited gebruik van alle tools
                  </p>
                  <Button
                    onClick={() => router.push('/pro-arsenal')}
                    className="bg-gradient-to-r from-purple-500 to-coral-500 hover:from-purple-600 hover:to-coral-600 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Bekijk Pro Arsenal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Tools */}
        <TabsContent value="conversation">
          <GesprekStarterTab />
        </TabsContent>

        <TabsContent value="profile">
          <DatingProfilerAI />
        </TabsContent>

        <TabsContent value="photos">
          <PhotoAnalysisTab />
        </TabsContent>

        <TabsContent value="chat">
          <ChatCoachTab />
        </TabsContent>

        <TabsContent value="hechtingsstijl">
          <AttachmentAssessmentFlow />
        </TabsContent>
      </Tabs>
    </div>
  );
}
