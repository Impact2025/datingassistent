"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Heart,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Star
} from 'lucide-react';
import { AIRelationshipCoachTutorial } from '@/components/onboarding/tutorials/ai-relationship-coach-tutorial';

export default function AIRelationshipCoachPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [insights, setInsights] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      loadCoachData();
    }
  }, [user, loading, router]);

  const loadCoachData = async () => {
    try {
      setLoadingData(true);

      // Load insights
      const insightsResponse = await fetch(`/api/relationship-coach/insights?userId=${user?.id}`);
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.insights || []);
      }

      // Load plans
      const plansResponse = await fetch(`/api/relationship-coach/plans?userId=${user?.id}`);
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans || []);
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">AI Relationship Coach laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-25 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>

            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">AI-PRO Tool</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🤖 AI Relationship Coach Dashboard
            </h1>

            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Geïntegreerde inzichten uit al je tools met personalized coaching plannen en progress tracking.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge className="px-4 py-2 bg-blue-100 text-blue-800 border-blue-200">
                AI-Gedreven
              </Badge>
              <Badge className="px-4 py-2 bg-purple-100 text-purple-800 border-purple-200">
                Personalized
              </Badge>
              <Badge className="px-4 py-2 bg-green-100 text-green-800 border-green-200">
                Real-time
              </Badge>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Cross-Tool Insights */}
            <Card data-tutorial="cross-tool-insights" className="border-2 border-blue-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Cross-Tool Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.length > 0 ? (
                    insights.slice(0, 3).map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{insight.title}</p>
                        <p className="text-xs text-blue-600 mt-1">{insight.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nog geen inzichten beschikbaar. Gebruik meer tools om inzichten te genereren.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personalized Plans */}
            <Card data-tutorial="coaching-plans" className="border-2 border-purple-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Coaching Plannen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plans.length > 0 ? (
                    plans.slice(0, 3).map((plan, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">{plan.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={plan.progress} className="flex-1 h-2" />
                          <span className="text-xs text-purple-600">{plan.progress}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nog geen plannen beschikbaar. Complete assessments om plannen te genereren.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card data-tutorial="success-metrics" className="border-2 border-green-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tools Completed</span>
                    <span className="font-semibold text-green-600">7/12</span>
                  </div>
                  <Progress value={58} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Relationship Goals</span>
                    <span className="font-semibold text-green-600">3/5</span>
                  </div>
                  <Progress value={60} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confidence Score</span>
                    <span className="font-semibold text-green-600">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              data-tutorial="goals-button"
              onClick={() => router.push('/dashboard?tab=groei-doelen')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Target className="w-6 h-6" />
              <span className="font-medium">Doelen Beheren</span>
              <span className="text-xs opacity-90">Stel en track je relatie doelen</span>
            </Button>

            <Button
              data-tutorial="skills-button"
              onClick={() => router.push('/dashboard?tab=leren-ontwikkelen')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Brain className="w-6 h-6" />
              <span className="font-medium">Skills Ontwikkelen</span>
              <span className="text-xs opacity-90">Leer nieuwe dating skills</span>
            </Button>

            <Button
              data-tutorial="chat-coach-button"
              onClick={() => router.push('/dashboard?tab=communicatie-matching')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <Users className="w-6 h-6" />
              <span className="font-medium">Chat Coach</span>
              <span className="text-xs opacity-90">AI hulp bij gesprekken</span>
            </Button>

            <Button
              data-tutorial="date-planning-button"
              onClick={() => router.push('/dashboard?tab=daten-relaties')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Heart className="w-6 h-6" />
              <span className="font-medium">Date Planning</span>
              <span className="text-xs opacity-90">Plan perfecte dates</span>
            </Button>
          </div>

          {/* Premium Features Notice */}
          <Card data-tutorial="premium-upgrade" className="mt-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium AI Coaching</h3>
              <p className="text-gray-600 mb-4">
                Upgrade naar premium voor geavanceerde AI inzichten, personalized coaching plannen, en real-time progress tracking.
              </p>
              <Button
                onClick={() => router.push('/select-package')}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                Upgrade naar Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Relationship Coach Tutorial */}
      <AIRelationshipCoachTutorial />
    </div>
  );
}