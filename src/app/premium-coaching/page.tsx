"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  Trophy,
  TrendingUp,
  Star,
  Calendar,
  Award,
  ArrowLeft,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';

export default function PremiumCoachingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [coachingData, setCoachingData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      loadCoachingData();
    }
  }, [user, loading, router]);

  const loadCoachingData = async () => {
    try {
      setLoadingData(true);

      // Load premium coaching data
      const response = await fetch(`/api/premium-coaching/dashboard?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setCoachingData(data);
      }
    } catch (error) {
      console.error('Error loading coaching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Premium Coaching Dashboard laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
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

            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-200 mb-4">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">VIP Tool</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              👑 Premium Coaching & Progress Dashboard
            </h1>

            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Complete user progress tracking, success metrics en VIP coaching integration voor elite results.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge className="px-4 py-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
              <Badge className="px-4 py-2 bg-purple-100 text-purple-800 border-purple-200">
                <Trophy className="w-3 h-3 mr-1" />
                VIP
              </Badge>
              <Badge className="px-4 py-2 bg-green-100 text-green-800 border-green-200">
                <BarChart3 className="w-3 h-3 mr-1" />
                Analytics
              </Badge>
            </div>
          </div>

          {/* Premium Status Banner */}
          <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Premium Member</h3>
                    <p className="text-sm text-gray-600">Geniet van alle VIP features en geavanceerde analytics</p>
                  </div>
                </div>
                <Badge className="bg-yellow-500 text-white px-3 py-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Success Metrics */}
            <Card className="border-2 border-green-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Match Rate</span>
                    <span className="font-semibold text-green-600">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-semibold text-green-600">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date Success</span>
                    <span className="font-semibold text-green-600">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* VIP Coaching Sessions */}
            <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  VIP Coaching Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Weekly Strategy Call</span>
                      <Badge variant="outline" className="text-xs">Tomorrow 14:00</Badge>
                    </div>
                    <p className="text-xs text-purple-600">Review progress and adjust strategy</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Profile Optimization</span>
                      <Badge variant="outline" className="text-xs">Completed</Badge>
                    </div>
                    <p className="text-xs text-purple-600">Photos and bio optimized for 40% more matches</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Communication Coaching</span>
                      <Badge variant="outline" className="text-xs">Next Week</Badge>
                    </div>
                    <p className="text-xs text-purple-600">Advanced conversation techniques</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card className="border-2 border-blue-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">First Date Success</p>
                      <p className="text-xs text-blue-600">Completed your first successful date</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Star className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Profile Master</p>
                      <p className="text-xs text-blue-600">Optimized profile for maximum appeal</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Goal Crusher</p>
                      <p className="text-xs text-blue-600">Achieved 3 out of 5 relationship goals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics */}
          <Card className="border-2 border-indigo-200 bg-white/90 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Advanced Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">127</div>
                  <div className="text-sm text-gray-600">Total Matches</div>
                  <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">23</div>
                  <div className="text-sm text-gray-600">Dates Scheduled</div>
                  <div className="text-xs text-green-600 mt-1">+8% vs last month</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">89%</div>
                  <div className="text-sm text-gray-600">Profile Views</div>
                  <div className="text-xs text-green-600 mt-1">+15% vs last month</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">4.8</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                  <div className="text-xs text-green-600 mt-1">+0.3 vs last month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/dashboard?tab=groei-doelen')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              <Target className="w-6 h-6" />
              <span className="font-medium">Personalized Goals</span>
              <span className="text-xs opacity-90">AI-generated goal setting</span>
            </Button>

            <Button
              onClick={() => router.push('/dashboard?tab=leren-ontwikkelen')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Trophy className="w-6 h-6" />
              <span className="font-medium">VIP Learning Path</span>
              <span className="text-xs opacity-90">Exclusive premium content</span>
            </Button>

            <Button
              onClick={() => router.push('/dashboard?tab=subscription')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <Crown className="w-6 h-6" />
              <span className="font-medium">Manage Subscription</span>
              <span className="text-xs opacity-90">Premium features & billing</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}