"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Crown,
  ArrowRight,
} from 'lucide-react';
import { GesprekStarterTab } from '@/components/dashboard/gesprek-starter-tab';
import { DatingProfilerAI } from '@/components/dashboard/dating-profiler-ai';
import { PhotoAnalysisTab } from '@/components/dashboard/photo-analysis-tab';
import { ChatCoachTab } from '@/components/dashboard/chat-coach-tab';
import { AttachmentAssessmentFlow } from '@/components/attachment-assessment/attachment-assessment-flow';

const kickstartTools = [
  {
    id: 'conversation',
    title: 'Conversation Starters',
    description: 'AI-powered openingszinnen en icebreakers',
    icon: MessageCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    limit: '3x per dag',
  },
  {
    id: 'profile',
    title: 'AI Profile Builder',
    description: 'Genereer complete dating profielen met AI',
    icon: Wand2,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    limit: '1x gebruik',
  },
  {
    id: 'photos',
    title: 'Photo Analysis',
    description: 'AI feedback op je profielfoto\'s',
    icon: Camera,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    limit: '2x per dag',
  },
  {
    id: 'chat',
    title: 'Chat Coach',
    description: '24/7 AI dating coach voor al je vragen',
    icon: Bot,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    limit: '10x per dag',
  },
  {
    id: 'hechtingsstijl',
    title: 'Hechtingsstijl Scan',
    description: 'Ontdek je hechtingsstijl voor betere relaties',
    icon: Heart,
    iconColor: 'text-coral-600',
    iconBg: 'bg-coral-50',
    limit: 'Onbeperkt',
  },
];

export function KickstartToolkit() {
  const router = useRouter();
  const { user } = useUser();
  const { userTier, isLoading } = useAccessControl();
  const [activeTab, setActiveTab] = useState('overview');

  const hasAccess = userTier !== 'free';

  if (!hasAccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Lock className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Kickstart Toolkit</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            Start het 21-dagen Kickstart programma en krijg direct toegang tot AI Conversation Starters, Profile Builder, Photo Analysis en meer.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/kickstart')} className="bg-gray-900 hover:bg-gray-800 text-white">
            <Rocket className="w-4 h-4 mr-2" />
            Start Kickstart — €47
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Terug
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard')}
        className="mb-6 text-gray-500 hover:text-gray-900 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Dashboard
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Kickstart Toolkit</h1>
        <p className="text-sm text-gray-500">5 AI tools voor je dating succes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto bg-gray-100">
          <TabsTrigger value="overview" className="text-xs">Overzicht</TabsTrigger>
          <TabsTrigger value="conversation" className="text-xs">Gesprek AI</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs">Profile Builder</TabsTrigger>
          <TabsTrigger value="photos" className="text-xs">Foto's</TabsTrigger>
          <TabsTrigger value="chat" className="text-xs">Chat Coach</TabsTrigger>
          <TabsTrigger value="hechtingsstijl" className="text-xs">Hechtingsstijl</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-0">
          {kickstartTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="border border-gray-200 shadow-none hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white rounded-xl"
                onClick={() => setActiveTab(tool.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${tool.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-medium text-gray-900 text-sm">{tool.title}</h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{tool.limit}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Upgrade CTA */}
          <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Wil je onbeperkt gebruik?</p>
                <p className="text-xs text-gray-500">
                  Pro Arsenal geeft je Skills Assessment, Date Planner en unlimited toegang tot alle tools.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => router.push('/pro-arsenal')}
                className="bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap flex-shrink-0"
              >
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                Pro Arsenal
              </Button>
            </div>
          </div>
        </TabsContent>

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
