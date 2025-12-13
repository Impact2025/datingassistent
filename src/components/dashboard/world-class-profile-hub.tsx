"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  MessageCircle,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  Sparkles,
  Trophy,
  Star,
  ArrowRight,
  Eye,
  Heart,
  Brain,
  Wand2
} from 'lucide-react';
import { ProfileAnalysis } from '@/components/profile-analysis';
import { PhotoAnalysisTab } from '@/components/dashboard/photo-analysis-tab';
import { ProfielOptimalisatie } from '@/components/dashboard/profiel-optimalisatie';

interface ProfileStatus {
  completeness: number;
  hasBio: boolean;
  hasPhotos: boolean;
  hasInterests: boolean;
  optimizationScore?: number;
}

interface WorldClassProfileHubProps {
  embedded?: boolean;
}

export function WorldClassProfileHub({ embedded = false }: WorldClassProfileHubProps) {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showPhotoAnalysis, setShowPhotoAnalysis] = useState(false);
  const [showProfielOptimalisatie, setShowProfielOptimalisatie] = useState(false);
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
    const total = 4;

    if (profile.bio && profile.bio.trim().length > 10) score += 1;
    if (profile.photos && profile.photos.length > 0) score += 1;
    if (profile.interests && profile.interests.length > 0) score += 1;
    if (profile.age && profile.location) score += 1;

    return {
      completeness: Math.round((score / total) * 100),
      hasBio: !!(profile.bio && profile.bio.trim().length > 10),
      hasPhotos: !!(profile.photos && profile.photos.length > 0),
      hasInterests: !!(profile.interests && profile.interests.length > 0)
    };
  };

  const quickActions = [
    {
      id: 'profiel-optimalisatie',
      icon: Target,
      title: 'Profiel Optimalisatie',
      subtitle: 'Bouw een profiel dat werkt (+250% matches)',
      action: () => setShowProfielOptimalisatie(true),
      gradient: 'from-pink-500 to-pink-600',
      iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
      glowColor: 'shadow-pink-500/50',
      badge: 'Nieuw'
    },
    {
      id: 'analyze',
      icon: Brain,
      title: 'Profiel Analyse',
      subtitle: 'AI assessment van je profiel',
      action: () => setShowAnalysis(true),
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/50'
    },
    {
      id: 'photos',
      icon: Camera,
      title: 'Foto Optimalisatie',
      subtitle: 'Professionele foto tips',
      action: () => setShowPhotoAnalysis(true),
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      glowColor: 'shadow-purple-500/50'
    },
    {
      id: 'bio',
      icon: Wand2,
      title: 'Bio Coach',
      subtitle: 'AI-gedreven bio verbetering',
      action: () => router.push('/tools?tool=ai-bio-generator'),
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      glowColor: 'shadow-green-500/50'
    },
    {
      id: 'chat-coach',
      icon: MessageCircle,
      title: 'Chat Coach',
      subtitle: 'Persoonlijk gesprek advies',
      action: () => router.push('/chat'),
      gradient: 'from-pink-500 to-rose-500',
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
      glowColor: 'shadow-pink-500/50'
    }
  ];

  const aiInsights = [
    {
      id: 1,
      text: 'Voeg een foto toe waar je lacht om meer benaderbaarheid te tonen',
      priority: 'high',
      icon: Camera,
      color: 'blue'
    },
    {
      id: 2,
      text: 'Maak je bio persoonlijker met een specifiek verhaal',
      priority: 'medium',
      icon: Heart,
      color: 'green'
    },
    {
      id: 3,
      text: 'Voeg interesses toe die gesprekken kunnen starten',
      priority: 'medium',
      icon: Sparkles,
      color: 'purple'
    }
  ];

  if (showProfielOptimalisatie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Button
            variant="ghost"
            onClick={() => setShowProfielOptimalisatie(false)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Terug
          </Button>
          <ProfielOptimalisatie
            onStartAssessment={() => {
              // TODO: Implement assessment flow
              console.log('Start Profiel Optimalisatie assessment');
            }}
            onSkipToDashboard={() => setShowProfielOptimalisatie(false)}
          />
        </div>
      </div>
    );
  }

  if (showAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Button
            variant="ghost"
            onClick={() => setShowAnalysis(false)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Terug
          </Button>
          <ProfileAnalysis onAnalysisComplete={(results) => {
            console.log('Analysis complete:', results);
          }} />
        </div>
      </div>
    );
  }

  if (showPhotoAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Button
            variant="ghost"
            onClick={() => setShowPhotoAnalysis(false)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Terug
          </Button>
          <PhotoAnalysisTab />
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero Section with Animated Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-10 blur-3xl animate-pulse"></div>
          <Card className="relative border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/50">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-purple-900 bg-clip-text text-transparent">
                        Profiel Hub
                      </h1>
                      <p className="text-sm text-gray-600">Je centrale command center</p>
                    </div>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>

              {/* Profile Status with Premium Design */}
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Profiel Compleetheid</h2>
                    <p className="text-sm text-gray-600">Optimaliseer voor betere matches</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {profileStatus.completeness}%
                    </div>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="relative">
                  <Progress
                    value={profileStatus.completeness}
                    className="h-3 bg-gray-200"
                  />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-1000 shadow-lg"
                    style={{ width: `${profileStatus.completeness}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
                  </div>
                </div>

                {/* Status Grid with Modern Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Bio', status: profileStatus.hasBio, icon: MessageCircle },
                    { label: 'Fotos', status: profileStatus.hasPhotos, icon: Camera },
                    { label: 'Interesses', status: profileStatus.hasInterests, icon: Heart },
                    { label: 'Basis info', status: true, icon: CheckCircle }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        item.status
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                          : 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.status ? 'text-green-600' : 'text-pink-500'}`} />
                        <span className={`text-sm font-medium ${item.status ? 'text-green-700' : 'text-pink-600'}`}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions with Stunning Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Snelle Acties</h3>
            <Badge variant="outline" className="text-xs">
              4 tools beschikbaar
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Card
                key={action.id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/90 backdrop-blur-sm hover:-translate-y-2"
                onClick={action.action}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Animated Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon with Glow Effect */}
                    <div className="relative">
                      <div className={`absolute inset-0 ${action.iconBg} blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 ${action.glowColor}`}></div>
                      <div className={`relative w-14 h-14 rounded-2xl ${action.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {action.subtitle}
                      </p>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-4 h-4 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights with Interactive Cards */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>

          <CardContent className="p-6 sm:p-8 relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-600">Gepersonaliseerde optimalisatie tips</p>
              </div>
            </div>

            <div className="space-y-3">
              {aiInsights.map((insight, idx) => {
                const colorConfig = {
                  blue: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', icon: 'bg-gradient-to-br from-blue-500 to-cyan-500', text: 'text-blue-900' },
                  green: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'bg-gradient-to-br from-green-500 to-emerald-500', text: 'text-green-900' },
                  purple: { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', icon: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-purple-900' }
                }[insight.color];

                return (
                  <div
                    key={insight.id}
                    className={`group p-4 rounded-xl bg-gradient-to-r ${colorConfig.bg} border ${colorConfig.border} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl ${colorConfig.icon} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                        <insight.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${colorConfig.text} break-words`}>
                          {insight.text}
                        </p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button with Gradient */}
            <Button
              onClick={() => setShowAnalysis(true)}
              className="w-full mt-6 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <Target className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Volledige AI Analyse Starten
              <Sparkles className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Progress Journey */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50/50">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/50">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Jouw Journey</h3>
                <p className="text-sm text-gray-600">Optimalisatie voortgang</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Profiel compleetheid</span>
                <span className="text-sm font-bold text-pink-600">{profileStatus.completeness}%</span>
              </div>

              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-1000"
                  style={{ width: `${profileStatus.completeness}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Laatste update: vandaag</span>
                </div>
                <span className="font-medium">Doel: 100%</span>
              </div>

              {/* Milestones */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-200">
                {[25, 50, 75, 100].map((milestone) => (
                  <div
                    key={milestone}
                    className={`text-center p-2 rounded-lg transition-all ${
                      profileStatus.completeness >= milestone
                        ? 'bg-gradient-to-br from-pink-100 to-purple-100 border border-pink-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`text-xs font-bold ${
                      profileStatus.completeness >= milestone ? 'text-pink-600' : 'text-gray-400'
                    }`}>
                      {milestone}%
                    </div>
                    {profileStatus.completeness >= milestone && (
                      <Star className="w-3 h-3 mx-auto mt-1 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
