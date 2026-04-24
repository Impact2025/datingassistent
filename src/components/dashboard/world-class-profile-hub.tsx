"use client";

import { useState, useEffect, useCallback } from 'react';
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
  Zap,
  TrendingUp,
  Sparkles,
  Trophy,
  Star,
  ArrowRight,
  Heart,
  Brain,
  Wand2,
  MapPin,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Clock,
  Flame
} from 'lucide-react';
import { ProfileAnalysis } from '@/components/profile-analysis';
import { PhotoAnalysisTab } from '@/components/dashboard/photo-analysis-tab';
import { ProfielOptimalisatie } from '@/components/dashboard/profiel-optimalisatie';
import { getValidToken } from '@/lib/client-auth';
import { logger } from '@/lib/logger';

interface ProfileStatus {
  completeness: number;
  hasBio: boolean;
  hasPhotos: boolean;
  hasInterests: boolean;
  hasLocation: boolean;
  hasAge: boolean;
  bioLength: number;
  interestCount: number;
}

interface SmartInsight {
  id: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  icon: React.ElementType;
  color: 'red' | 'blue' | 'green' | 'purple' | 'amber';
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  source: 'profile' | 'ai';
}

interface LastAnalysis {
  overallScore: number;
  optimizationSuggestions: Array<{
    priority: string;
    title: string;
    description: string;
    expectedImpact: number;
    category: string;
  }>;
  predictedPerformance: {
    currentMatches: number;
    optimizedMatches: number;
    improvement: number;
  };
  analysisDate: string;
}

interface WorldClassProfileHubProps {
  embedded?: boolean;
}

const COLOR_CONFIG = {
  red:    { bg: 'from-red-50 to-rose-50',       border: 'border-red-200',    icon: 'bg-red-500',    text: 'text-red-900',    badge: 'bg-red-100 text-red-700' },
  blue:   { bg: 'from-blue-50 to-cyan-50',      border: 'border-blue-200',   icon: 'bg-blue-500',   text: 'text-blue-900',   badge: 'bg-blue-100 text-blue-700' },
  green:  { bg: 'from-green-50 to-emerald-50',  border: 'border-green-200',  icon: 'bg-green-500',  text: 'text-green-900',  badge: 'bg-green-100 text-green-700' },
  purple: { bg: 'from-purple-50 to-violet-50',  border: 'border-purple-200', icon: 'bg-purple-500', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-700' },
  amber:  { bg: 'from-amber-50 to-yellow-50',   border: 'border-amber-200',  icon: 'bg-amber-500',  text: 'text-amber-900',  badge: 'bg-amber-100 text-amber-700' },
};

const PRIORITY_LABEL: Record<SmartInsight['priority'], string> = {
  high: 'Urgent',
  medium: 'Aanbevolen',
  low: 'Optioneel',
};

const MILESTONE_LABELS: Record<number, { label: string; reward: string }> = {
  25:  { label: 'Starter',    reward: 'Basis compleet' },
  50:  { label: 'Groeiend',   reward: '2x meer zichtbaarheid' },
  75:  { label: 'Sterk',      reward: '5x meer matches' },
  100: { label: 'Wereld­klasse', reward: 'Top 10% profielen' },
};

export function WorldClassProfileHub({ embedded = false }: WorldClassProfileHubProps) {
  const router = useRouter();
  const { user, userProfile } = useUser();

  const [showAnalysis, setShowAnalysis]                   = useState(false);
  const [showPhotoAnalysis, setShowPhotoAnalysis]         = useState(false);
  const [showProfielOptimalisatie, setShowProfielOptimalisatie] = useState(false);
  const [profileStatus, setProfileStatus]                 = useState<ProfileStatus>({
    completeness: 0, hasBio: false, hasPhotos: false,
    hasInterests: false, hasLocation: false, hasAge: false,
    bioLength: 0, interestCount: 0,
  });
  const [lastAnalysis, setLastAnalysis]   = useState<LastAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [insights, setInsights]           = useState<SmartInsight[]>([]);

  // ── Profile completeness ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile) return;
    const status = calculateStatus(userProfile);
    setProfileStatus(status);
    setInsights(generateSmartInsights(userProfile, status));
  }, [userProfile]);

  // ── Load last AI analysis ─────────────────────────────────────────────────
  const fetchLastAnalysis = useCallback(async () => {
    const token = getValidToken();
    if (!token) { setLoadingAnalysis(false); return; }

    try {
      const res = await fetch('/api/profile-analysis', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.hasAnalysis && data.currentAnalysis) {
        setLastAnalysis(data.currentAnalysis);
        // Merge top AI suggestions into insights
        if (data.currentAnalysis.optimizationSuggestions?.length) {
          setInsights(prev => mergeAiInsights(prev, data.currentAnalysis.optimizationSuggestions));
        }
      }
    } catch (e) {
      logger.log('Could not fetch last analysis', e);
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  useEffect(() => { fetchLastAnalysis(); }, [fetchLastAnalysis]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function calculateStatus(profile: any): ProfileStatus {
    const hasBio       = !!(profile.bio && profile.bio.trim().length > 10);
    const hasPhotos    = !!(profile.photos && profile.photos.length > 0);
    const hasInterests = !!(profile.interests && profile.interests.length > 0);
    const hasLocation  = !!profile.location;
    const hasAge       = !!profile.age;
    const bioLength    = profile.bio ? profile.bio.trim().length : 0;
    const interestCount = Array.isArray(profile.interests) ? profile.interests.length : 0;

    const criteria = [hasBio, hasPhotos, hasInterests, hasLocation && hasAge];
    const score = criteria.filter(Boolean).length;
    return {
      completeness: Math.round((score / criteria.length) * 100),
      hasBio, hasPhotos, hasInterests, hasLocation, hasAge, bioLength, interestCount,
    };
  }

  function generateSmartInsights(profile: any, status: ProfileStatus): SmartInsight[] {
    const list: SmartInsight[] = [];

    // No bio
    if (!status.hasBio) {
      list.push({ id: 'no-bio', priority: 'high', impact: 40, icon: MessageCircle, color: 'red',
        text: 'Je hebt nog geen bio — profielen met een bio krijgen 3× meer matches',
        actionLabel: 'Bio schrijven', onAction: () => router.push('/tools?tool=ai-bio-generator'), source: 'profile' });
    } else if (status.bioLength < 80) {
      list.push({ id: 'short-bio', priority: 'high', impact: 25, icon: MessageCircle, color: 'blue',
        text: `Je bio (${status.bioLength} tekens) is te kort — voeg meer persoonlijkheid toe`,
        actionLabel: 'Bio uitbreiden', onAction: () => router.push('/tools?tool=ai-bio-generator'), source: 'profile' });
    } else if (profile.bio && !profile.bio.includes('?')) {
      list.push({ id: 'bio-no-question', priority: 'medium', impact: 15, icon: MessageCircle, color: 'green',
        text: 'Eindig je bio met een vraag — verlaagt de drempel om jou te benadelen',
        actionLabel: 'Bio optimaliseren', onAction: () => router.push('/tools?tool=ai-bio-generator'), source: 'profile' });
    }

    // No photos
    if (!status.hasPhotos) {
      list.push({ id: 'no-photos', priority: 'high', impact: 50, icon: Camera, color: 'red',
        text: 'Geen foto\'s — profielen met foto\'s krijgen 10× meer matches',
        actionLabel: 'Foto tips', onAction: () => setShowPhotoAnalysis(true), source: 'profile' });
    }

    // Interests
    if (!status.hasInterests) {
      list.push({ id: 'no-interests', priority: 'medium', impact: 20, icon: Heart, color: 'purple',
        text: 'Voeg interesses toe — geeft matches een gespreksstarter',
        source: 'profile' });
    } else if (status.interestCount < 3) {
      list.push({ id: 'few-interests', priority: 'medium', impact: 10, icon: Heart, color: 'purple',
        text: `Je hebt ${status.interestCount} interesse(s) — voeg er meer toe voor meer gemeenschappelijk terrein`,
        source: 'profile' });
    }

    // Location / age
    if (!status.hasLocation) {
      list.push({ id: 'no-location', priority: 'low', impact: 10, icon: MapPin, color: 'amber',
        text: 'Voeg je locatie toe voor betere match-suggesties in jouw buurt',
        source: 'profile' });
    }

    // Profile looks complete → nudge to full analysis
    if (list.length === 0) {
      list.push({ id: 'run-analysis', priority: 'medium', impact: 35, icon: Brain, color: 'blue',
        text: 'Profiel ziet er sterk uit! Start een AI analyse voor diepgaandere optimalisatie',
        actionLabel: 'Analyse starten', onAction: () => setShowAnalysis(true), source: 'profile' });
    }

    return list.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])).slice(0, 3);
  }

  function mergeAiInsights(
    existing: SmartInsight[],
    aiSuggestions: LastAnalysis['optimizationSuggestions']
  ): SmartInsight[] {
    // Replace 'run-analysis' placeholder with real AI suggestions if present
    const withoutPlaceholder = existing.filter(i => i.id !== 'run-analysis');
    const slots = 3 - withoutPlaceholder.length;
    if (slots <= 0) return existing;

    const aiInsights: SmartInsight[] = aiSuggestions
      .filter(s => s.priority === 'high')
      .slice(0, slots)
      .map((s, i) => ({
        id: `ai-${i}`,
        priority: 'medium' as const,
        impact: s.expectedImpact || 20,
        icon: Sparkles,
        color: 'amber' as const,
        text: s.title,
        actionLabel: 'Analyse bekijken',
        onAction: () => setShowAnalysis(true),
        source: 'ai' as const,
      }));

    return [...withoutPlaceholder, ...aiInsights]
      .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))
      .slice(0, 3);
  }

  const nextStep = (): { label: string; action: () => void } | null => {
    if (!profileStatus.hasBio)       return { label: 'Schrijf je bio', action: () => router.push('/tools?tool=ai-bio-generator') };
    if (!profileStatus.hasPhotos)    return { label: 'Voeg foto\'s toe', action: () => setShowPhotoAnalysis(true) };
    if (!profileStatus.hasInterests) return { label: 'Vul interesses in', action: () => {} };
    if (!profileStatus.hasLocation)  return { label: 'Voeg locatie toe', action: () => {} };
    return { label: 'Start AI analyse', action: () => setShowAnalysis(true) };
  };

  const estimatedMatchBoost = (): number => {
    const base = insights.reduce((sum, i) => sum + i.impact, 0);
    return Math.min(base, 250);
  };

  const quickActions = [
    { id: 'profiel-optimalisatie', icon: Target,       title: 'Profiel Optimalisatie', subtitle: 'Bouw een profiel dat werkt (+250% matches)', action: () => setShowProfielOptimalisatie(true) },
    { id: 'analyze',               icon: Brain,        title: 'Profiel Analyse',        subtitle: 'AI assessment van je profiel',               action: () => setShowAnalysis(true) },
    { id: 'photos',                icon: Camera,       title: 'Foto Optimalisatie',     subtitle: 'Professionele foto tips',                    action: () => setShowPhotoAnalysis(true) },
    { id: 'bio',                   icon: Wand2,        title: 'Bio Coach',              subtitle: 'AI-gedreven bio verbetering',                action: () => router.push('/tools?tool=ai-bio-generator') },
    { id: 'chat-coach',            icon: MessageCircle,title: 'Chat Coach',             subtitle: 'Persoonlijk gesprek advies',                 action: () => router.push('/chat') },
  ];

  // ── Sub-page renders ──────────────────────────────────────────────────────
  if (showProfielOptimalisatie) return (
    <SubPage onBack={() => setShowProfielOptimalisatie(false)}>
      <ProfielOptimalisatie
        onStartAssessment={() => logger.log('Start Profiel Optimalisatie assessment')}
        onSkipToDashboard={() => setShowProfielOptimalisatie(false)}
      />
    </SubPage>
  );
  if (showAnalysis) return (
    <SubPage onBack={() => setShowAnalysis(false)}>
      <ProfileAnalysis onAnalysisComplete={(r) => { logger.log('Analysis complete:', r); fetchLastAnalysis(); }} />
    </SubPage>
  );
  if (showPhotoAnalysis) return (
    <SubPage onBack={() => setShowPhotoAnalysis(false)}>
      <PhotoAnalysisTab />
    </SubPage>
  );

  const step = nextStep();
  const boost = estimatedMatchBoost();

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-gradient-to-br from-gray-50 via-coral-50/30 to-purple-50/30`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ── Hero: Profiel Compleetheid ── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-coral-500 opacity-10 blur-3xl animate-pulse pointer-events-none" />
          <Card className="relative border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-coral-500 flex items-center justify-center shadow-lg shadow-coral-500/50">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-coral-600">Profiel Hub</h1>
                    <p className="text-sm text-gray-600">Je centrale command center</p>
                  </div>
                </div>
                <Badge className="bg-coral-500 text-white border-0 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Profiel Compleetheid</h2>
                    <p className="text-sm text-gray-600">Optimaliseer voor betere matches</p>
                  </div>
                  <div className="text-4xl font-bold text-coral-600">{profileStatus.completeness}%</div>
                </div>

                <div className="relative">
                  <Progress value={profileStatus.completeness} className="h-3 bg-gray-200" />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full bg-coral-500 transition-all duration-1000 shadow-lg pointer-events-none"
                    style={{ width: `${profileStatus.completeness}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Bio',        status: profileStatus.hasBio,        icon: MessageCircle },
                    { label: 'Foto\'s',    status: profileStatus.hasPhotos,      icon: Camera },
                    { label: 'Interesses', status: profileStatus.hasInterests,   icon: Heart },
                    { label: 'Basis info', status: profileStatus.hasLocation && profileStatus.hasAge, icon: CheckCircle },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-xl transition-all ${
                      item.status
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                        : 'bg-gradient-to-br from-coral-50 to-rose-50 border border-coral-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.status ? 'text-green-600' : 'text-coral-500'}`} />
                        <span className={`text-sm font-medium ${item.status ? 'text-green-700' : 'text-coral-600'}`}>
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

        {/* ── Snelle Acties ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Snelle Acties</h3>
            <Badge variant="outline" className="text-xs">{quickActions.length} tools beschikbaar</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm hover:-translate-y-1"
                onClick={action.action}
              >
                <div className="absolute inset-0 bg-coral-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-coral-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-coral-600 transition-colors text-sm">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1">{action.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-coral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── AI Insights ── */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-20 -mr-32 -mt-32 pointer-events-none" />
          <CardContent className="p-6 sm:p-8 relative">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                  <p className="text-xs text-gray-500">
                    {lastAnalysis
                      ? `Gebaseerd op analyse van ${new Date(lastAnalysis.analysisDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`
                      : 'Gebaseerd op jouw profiel'
                    }
                  </p>
                </div>
              </div>
              {boost > 0 && (
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">+{boost}%</div>
                  <div className="text-xs text-gray-500">potentiële boost</div>
                </div>
              )}
            </div>

            {/* Insights list */}
            <div className="space-y-3 mb-5">
              {loadingAnalysis && insights.length === 0 ? (
                // Skeleton
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))
              ) : (
                insights.map((insight, idx) => {
                  const cfg = COLOR_CONFIG[insight.color];
                  return (
                    <div
                      key={insight.id}
                      className={`group p-4 rounded-xl bg-gradient-to-r ${cfg.bg} border ${cfg.border} transition-all duration-300 hover:shadow-md`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl ${cfg.icon} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                          <insight.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                              {PRIORITY_LABEL[insight.priority]}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">+{insight.impact}% matches</span>
                            {insight.source === 'ai' && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">AI</span>
                            )}
                          </div>
                          <p className={`text-sm font-medium ${cfg.text} leading-snug`}>{insight.text}</p>
                        </div>
                        {insight.actionLabel && insight.onAction && (
                          <button
                            onClick={insight.onAction}
                            className="flex-shrink-0 text-xs font-semibold text-coral-600 hover:text-coral-700 flex items-center gap-0.5 whitespace-nowrap"
                          >
                            {insight.actionLabel}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Button
              onClick={() => setShowAnalysis(true)}
              className="w-full h-12 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Target className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              {lastAnalysis ? 'Nieuwe AI Analyse Starten' : 'Volledige AI Analyse Starten'}
              <Sparkles className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* ── Jouw Journey ── */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-coral-50/50">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-coral-500 rounded-2xl flex items-center justify-center shadow-lg shadow-coral-500/40">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Jouw Journey</h3>
                <p className="text-xs text-gray-500">Optimalisatie voortgang</p>
              </div>
              {lastAnalysis && (
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  Score: <span className="font-bold text-coral-600">{lastAnalysis.overallScore}/100</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Profiel compleetheid</span>
                <span className="font-bold text-coral-600">{profileStatus.completeness}%</span>
              </div>
              <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-coral-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${profileStatus.completeness}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Laatste update: vandaag
                </div>
                <span>Doel: 100%</span>
              </div>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[25, 50, 75, 100].map((milestone) => {
                const reached = profileStatus.completeness >= milestone;
                const info = MILESTONE_LABELS[milestone];
                return (
                  <div key={milestone} className={`text-center p-3 rounded-xl border transition-all ${
                    reached
                      ? 'bg-gradient-to-br from-coral-100 to-purple-100 border-coral-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`text-xs font-bold mb-1 ${reached ? 'text-coral-600' : 'text-gray-400'}`}>
                      {milestone}%
                    </div>
                    <div className={`text-xs font-semibold ${reached ? 'text-gray-800' : 'text-gray-400'}`}>
                      {info.label}
                    </div>
                    {reached && <Star className="w-3 h-3 mx-auto mt-1 text-yellow-500 fill-yellow-500" />}
                    {!reached && (
                      <div className="text-xs text-gray-400 mt-1 leading-tight">{info.reward}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Match improvement from last analysis */}
            {lastAnalysis?.predictedPerformance && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      +{lastAnalysis.predictedPerformance.improvement}% meer matches mogelijk
                    </p>
                    <p className="text-xs text-green-700">
                      Van ~{lastAnalysis.predictedPerformance.currentMatches} naar ~{lastAnalysis.predictedPerformance.optimizedMatches} matches per week na optimalisatie
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next step CTA */}
            {step && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Volgende stap</p>
                      <p className="text-sm font-bold text-blue-900">{step.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={step.action}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Doe het nu <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ── Helper sub-page wrapper ───────────────────────────────────────────────────
function SubPage({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-white/50">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Terug
        </Button>
        {children}
      </div>
    </div>
  );
}
