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
  Target,
  Calendar,
  Eye,
  Layers,
  ArrowLeft,
  Crown,
  Lock,
  Infinity
} from 'lucide-react';
import { SkillsAssessment } from '@/components/dashboard/skills-assessment';
import { DatePlannerTab } from '@/components/dashboard/date-planner-tab';
import { ZelfbeeldFlow } from '@/components/zelfbeeld/zelfbeeld-flow';
import { PlatformMatchTool } from '@/components/dashboard/platform-match-tool';

export function ProArsenal() {
  const router = useRouter();
  const { user } = useUser();
  const { userTier, isLoading } = useAccessControl();
  const [activeTab, setActiveTab] = useState('overview');

  const hasAccess = userTier === 'transformatie' || userTier === 'vip';

  const proTools = [
    {
      id: 'skills',
      title: 'Skills Assessment',
      description: 'Ontdek je dating sterke punten en groei gebieden',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
      premium: true,
    },
    {
      id: 'dateplanner',
      title: 'Date Planner',
      description: 'Plan geslaagde dates met checklists en tips',
      icon: <Calendar className="w-6 h-6" />,
      gradient: 'from-rose-500 to-pink-500',
      premium: true,
    },
    {
      id: 'zelfbeeld',
      title: 'Zelfbeeld & Eerste Indruk',
      description: 'Diepe zelfinzichten voor betere dating',
      icon: <Eye className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-500',
      premium: true,
    },
    {
      id: 'platform',
      title: 'Platform Match',
      description: 'Ontdek welke dating app perfect bij jou past',
      icon: <Layers className="w-6 h-6" />,
      gradient: 'from-blue-500 to-indigo-500',
      premium: true,
    },
  ];

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Pro Arsenal</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Premium dating tools voor maximale resultaten. Krijg toegang tot geavanceerde assessments, date planning en unlimited gebruik van alle tools.
            </p>

            <div className="bg-white rounded-lg p-6 mb-6 max-w-md mx-auto">
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Skills Assessment</div>
                    <div className="text-sm text-gray-600">Ontdek je dating DNA</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Date Planner</div>
                    <div className="text-sm text-gray-600">Plan perfecte dates</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Zelfbeeld Scan</div>
                    <div className="text-sm text-gray-600">Diepe zelfinzichten</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Infinity className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Unlimited Alles</div>
                    <div className="text-sm text-gray-600">Geen limieten meer</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade naar Transformatie
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pro Arsenal</h1>
            <p className="text-gray-600">Premium tools voor maximale dating success</p>
          </div>
        </div>

        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          Premium Member - Unlimited Access
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="dateplanner">Date Planner</TabsTrigger>
          <TabsTrigger value="zelfbeeld">Zelfbeeld</TabsTrigger>
          <TabsTrigger value="platform">Platform Match</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Premium Dating Arsenal</h2>
              <p className="text-gray-600 mb-4">
                Deze geavanceerde tools geven je diepe inzichten en praktische hulp voor dating success.
                Plus: unlimited gebruik van alle Kickstart tools!
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Infinity className="w-4 h-4 text-purple-600" />
                <span className="text-purple-600 font-semibold">Unlimited access - geen limieten</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proTools.map((tool) => (
              <Card
                key={tool.id}
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300"
                onClick={() => setActiveTab(tool.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white`}
                    >
                      {tool.icon}
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                  <Button size="sm" variant="ghost" className="group-hover:bg-purple-100">
                    Open Tool →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Infinity className="w-5 h-5 text-green-600" />
                Jouw Premium Voordelen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                  <span>Unlimited Conversation Starters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                  <span>Unlimited Photo Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                  <span>Unlimited Profile Builds</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                  <span>Unlimited Chat Coach</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                  <span>Skills Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                  <span>Date Planner</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Tools */}
        <TabsContent value="skills">
          <SkillsAssessment />
        </TabsContent>

        <TabsContent value="dateplanner">
          <DatePlannerTab />
        </TabsContent>

        <TabsContent value="zelfbeeld">
          <ZelfbeeldFlow />
        </TabsContent>

        <TabsContent value="platform">
          <PlatformMatchTool />
        </TabsContent>
      </Tabs>
    </div>
  );
}
