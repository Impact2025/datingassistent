"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Camera,
  MessageCircle,
  User,
  TrendingUp,
  Target,
  Star,
  CheckCircle,
  AlertCircle,
  Zap,
  Award,
  Settings
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { ProfileAnalysis } from '@/components/profile-analysis';
import { PhotoAnalysisTab } from '@/components/dashboard/photo-analysis-tab';

interface ProfileStatus {
  completeness: number;
  hasBio: boolean;
  hasPhotos: boolean;
  hasInterests: boolean;
  lastAnalysis?: Date;
  optimizationScore?: number;
}

export default function ProfielPage() {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showPhotoAnalysis, setShowPhotoAnalysis] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>({
    completeness: 0,
    hasBio: false,
    hasPhotos: false,
    hasInterests: false
  });

  // Calculate profile completeness
  useEffect(() => {
    if (userProfile) {
      const completeness = calculateProfileCompleteness(userProfile);
      setProfileStatus(prev => ({ ...prev, ...completeness }));
    }
  }, [userProfile]);

  const calculateProfileCompleteness = (profile: any) => {
    let score = 0;
    const total = 4; // bio, photos, interests, demographics

    if (profile.bio && profile.bio.trim().length > 10) {
      score += 1;
    }
    if (profile.photos && profile.photos.length > 0) {
      score += 1;
    }
    if (profile.interests && profile.interests.length > 0) {
      score += 1;
    }
    if (profile.age && profile.location) {
      score += 1;
    }

    return {
      completeness: Math.round((score / total) * 100),
      hasBio: !!(profile.bio && profile.bio.trim().length > 10),
      hasPhotos: !!(profile.photos && profile.photos.length > 0),
      hasInterests: !!(profile.interests && profile.interests.length > 0)
    };
  };

  const quickActions = [
    {
      id: 'analyze',
      icon: <Target className="w-5 h-5" />,
      title: 'Profiel Analyse',
      subtitle: 'AI assessment van je profiel',
      action: () => setShowAnalysis(true),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'photos',
      icon: <Camera className="w-5 h-5" />,
      title: 'Foto Optimalisatie',
      subtitle: 'Professionele foto tips',
      action: () => setShowPhotoAnalysis(true),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'bio',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Bio Coach',
      subtitle: 'AI-gedreven bio verbetering',
      action: () => router.push('/tools?tool=ai-bio-generator'),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'chat-coach',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Chat Coach',
      subtitle: 'Persoonlijk gesprek advies',
      action: () => router.push('/chat'),
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  if (showAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnalysis(false)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profiel Analyse</h1>
              <p className="text-sm text-gray-600">AI assessment van je dating profiel</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <ProfileAnalysis onAnalysisComplete={(results) => {
            console.log('Analysis complete:', results);
          }} />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (showPhotoAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPhotoAnalysis(false)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Foto Analyse</h1>
              <p className="text-sm text-gray-600">AI beoordeling van je profielfoto's</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <PhotoAnalysisTab />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Profiel Hub</h1>
            <p className="text-sm text-gray-600">Je centrale profiel command center</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Profile Status Overview */}
        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profiel Status</h2>
                <p className="text-sm text-gray-600">Compleetheid van je profiel</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{profileStatus.completeness}%</div>
                <div className="text-xs text-gray-500">compleet</div>
              </div>
            </div>
            <Progress value={profileStatus.completeness} className="mb-4" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={`flex items-center gap-2 ${profileStatus.hasBio ? 'text-green-600' : 'text-pink-400'}`}>
                {profileStatus.hasBio ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                Bio
              </div>
              <div className={`flex items-center gap-2 ${profileStatus.hasPhotos ? 'text-green-600' : 'text-pink-400'}`}>
                {profileStatus.hasPhotos ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                Foto's
              </div>
              <div className={`flex items-center gap-2 ${profileStatus.hasInterests ? 'text-green-600' : 'text-pink-400'}`}>
                {profileStatus.hasInterests ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                Interesses
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Basis info
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Snelle Acties</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="bg-white border-0 shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={action.action}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bgColor}`}>
                      <div className={action.color}>
                        {action.icon}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                      <p className="text-xs text-gray-600">{action.subtitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Optimization Insights */}
        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-600">Laatste optimalisatie tips</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-sm text-gray-700">Voeg een foto toe waar je lacht om meer benaderbaarheid te tonen</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-sm text-gray-700">Maak je bio persoonlijker met een specifiek verhaal</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-sm text-gray-700">Voeg interesses toe die gesprekken kunnen starten</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAnalysis(true)}
              className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Target className="w-4 h-4 mr-2" />
              Volledige AI Analyse
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profiel Voortgang</h3>
                <p className="text-sm text-gray-600">Je optimalisatie journey</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profiel compleetheid</span>
                <span className="text-sm font-medium text-gray-900">{profileStatus.completeness}%</span>
              </div>
              <Progress value={profileStatus.completeness} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Laatste update: vandaag</span>
                <span>Doel: 100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}