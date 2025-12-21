/**
 * Smart Home Tab - OPTIMIZED WERELDKLASSE VERSION
 * Refactored for performance, maintainability, and code quality
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, CheckCircle2, Zap, ArrowRight, Badge as BadgeIcon, Gift, Rocket, Crown, Trophy, BarChart3, Heart, Play, BookOpen
} from 'lucide-react';
import { PersonalizedWelcome } from './personalized-welcome';
import { ScanCard } from './scan-card';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import {
  generateDailySuggestions,
  getPhaseQuickActions,
  getNextRecommendedAction,
  type UserContext,
  type Suggestion
} from '@/lib/suggestions/smart-suggestions';
import { GamificationWidget } from '../gamification/gamification-widget';
import { useGamification } from '@/hooks/use-gamification';
import { QuickWinsToday } from './quick-wins-today';
import { MijnCursussenWidget } from './mijn-cursussen-widget';
import { ToolModal } from '@/components/tools/tool-modal';
import { WelcomeVideoCard } from './sections/welcome-video-card';
import { ToolsGridSection } from './sections/tools-grid-section';
import { ScansSection } from './sections/scans-section';

// Optimized hooks
import { useScanManager } from '@/hooks/use-scan-manager';
import { useTransformatieEnrollment } from '@/hooks/use-enrollment-status';

// Constants
import {
  COLOR_MAP,
  BORDER_COLOR_MAP,
  CACHE_KEYS,
  API_ENDPOINTS,
  ANIMATION_DELAYS,
} from '@/lib/constants/dashboard';
import { getIcon } from '@/lib/utils/icon-map';

interface SmartHomeTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
  userProfile?: any; // Optional: pass from parent to avoid duplicate fetch
}

// Memoized suggestion card component
const SuggestionCard = React.memo(function SuggestionCard({
  suggestion,
  index,
  onClick,
}: {
  suggestion: Suggestion;
  index: number;
  onClick: () => void;
}) {
  const IconComponent = getIcon(suggestion.icon);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: ANIMATION_DELAYS.SUGGESTIONS + index * 0.05 }}
    >
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={onClick}
          >
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
              COLOR_MAP[suggestion.color] || COLOR_MAP.pink
            )}>
              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{suggestion.title}</p>
              <p className="text-xs text-gray-600 hidden sm:block">{suggestion.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// World-class Transformatie Hero Card - Premium experience for enrolled users
const TransformatieHeroCard = React.memo(function TransformatieHeroCard({
  progress,
  onClick,
}: {
  progress?: { total: number; completed: number; percentage: number };
  onClick: () => void;
}) {
  const completedLessons = progress?.completed || 0;
  const totalLessons = progress?.total || 48;
  const percentage = progress?.percentage || 0;
  const currentModule = Math.floor(completedLessons / 4) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div
        onClick={onClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Mijn Transformatie</h3>
                <p className="text-sm text-white/80">Je reis naar duurzame liefde</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Play className="w-4 h-4 text-white" fill="white" />
              <span className="text-sm font-semibold text-white">Verder</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/90">
                Module {Math.min(currentModule, 12)} van 12
              </span>
              <span className="text-sm font-bold text-white">
                {percentage}% voltooid
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-white/70">
              <span>{completedLessons} van {totalLessons} lessen</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Video lessen
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-white">{Math.min(currentModule, 12)}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wide">Huidige Module</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-white">{completedLessons}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wide">Lessen Klaar</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-white">{48 - completedLessons}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wide">Te Gaan</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export const SmartHomeTab = React.memo(function SmartHomeTab({
  onTabChange,
  userId,
  userProfile // OPTIMIZED: Accept profile from parent to avoid duplicate fetch
}: SmartHomeTabProps) {
  const router = useRouter();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);

  // Optimized hooks
  const { trackLogin } = useGamification(userId);
  const {
    scanModal,
    scanStatus,
    openScan,
    closeScan,
    handleActionClick,
  } = useScanManager(userId);

  // World-class: Transformatie enrollment status
  const { isEnrolled: hasTransformatie, progress: transformatieProgress } = useTransformatieEnrollment();

  // Handler for Transformatie card click
  const handleTransformatieClick = useCallback(() => {
    router.push('/transformatie');
  }, [router]);

  // Check if welcome video should be shown
  useEffect(() => {
    const dismissed = localStorage.getItem(CACHE_KEYS.WELCOME_VIDEO_DISMISSED);
    if (!dismissed) {
      setShowWelcomeVideo(true);
    }
  }, []);

  // ============================================
  // OPTIMIZED: Use userProfile from parent when available
  // Only fetch journey status (profile already loaded by UserProvider)
  // ============================================
  useEffect(() => {
    const fetchUserContext = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        trackLogin();

        // OPTIMIZED: Only fetch journey status if userProfile is provided from parent
        // This eliminates the duplicate profile fetch (saves ~300ms)
        let profile = userProfile;
        let journey = null;

        if (userProfile) {
          // Profile already loaded by parent - only fetch journey
          const journeyRes = await fetch(API_ENDPOINTS.JOURNEY_STATUS(userId));
          journey = journeyRes.ok ? await journeyRes.json() : null;
        } else {
          // Fallback: fetch both in parallel if no profile provided
          const [profileRes, journeyRes] = await Promise.all([
            fetch(API_ENDPOINTS.USER_PROFILE(userId)),
            fetch(API_ENDPOINTS.JOURNEY_STATUS(userId)),
          ]);
          profile = profileRes.ok ? await profileRes.json() : null;
          journey = journeyRes.ok ? await journeyRes.json() : null;
        }

        const context: UserContext = {
          userId,
          journeyPhase: journey?.currentPhase || 1,
          completedAssessments: [],
          hasProfilePhoto: profile?.hasPhoto || userProfile?.photo || false,
          hasProfileText: profile?.hasBio || userProfile?.bio || false,
          lastActivity: new Date(),
          goals: profile?.goals || userProfile?.goals || [],
          subscriptionType: profile?.subscriptionType || userProfile?.subscription_type || 'free'
        };

        setUserContext(context);
      } catch (error) {
        console.error('Error fetching user context:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContext();
  }, [userId, trackLogin, userProfile]);

  // Memoized suggestions generation
  const suggestions = useMemo(() => {
    if (!userContext) return [];
    return generateDailySuggestions(userContext);
  }, [userContext]);

  const phaseActions = useMemo(() => {
    if (!userContext) return [];
    return getPhaseQuickActions(userContext.journeyPhase);
  }, [userContext]);

  const nextAction = useMemo(() => {
    if (!userContext) return null;
    return getNextRecommendedAction(userContext);
  }, [userContext]);

  // Optimized handlers
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    handleActionClick(suggestion, onTabChange, router);
  }, [handleActionClick, onTabChange, router]);

  const handleQuickActionClick = useCallback((action: any) => {
    handleActionClick(action, onTabChange, router);
  }, [handleActionClick, onTabChange, router]);

  const dismissWelcomeVideo = useCallback(() => {
    setShowWelcomeVideo(false);
    localStorage.setItem(CACHE_KEYS.WELCOME_VIDEO_DISMISSED, 'true');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Video */}
        {showWelcomeVideo && (
          <WelcomeVideoCard onDismiss={dismissWelcomeVideo} />
        )}

        {/* Personalized Welcome */}
        {!showWelcomeVideo && <PersonalizedWelcome />}

        {/* World-class Transformatie Hero Card - Priority placement for enrolled users */}
        {!showWelcomeVideo && hasTransformatie && (
          <TransformatieHeroCard
            progress={transformatieProgress}
            onClick={handleTransformatieClick}
          />
        )}

        {/* Tool Tiers - Minimalist Design */}
        {!showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION_DELAYS.PROGRAMS + 0.1 }}
          >
            <div className="grid grid-cols-3 gap-3">
              {/* Essentials */}
              <button
                onClick={() => router.push('/essentials')}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">Gratis</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Essentials</h3>
                <p className="text-xs text-gray-500 mt-1">Basis tools</p>
              </button>

              {/* Kickstart */}
              <button
                onClick={() => router.push('/kickstart-toolkit')}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Kickstart</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Toolkit</h3>
                <p className="text-xs text-gray-500 mt-1">5 AI tools</p>
              </button>

              {/* Pro */}
              <button
                onClick={() => router.push('/pro-arsenal')}
                className="p-4 bg-white rounded-xl border border-pink-200 hover:border-pink-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="text-xs text-pink-600 font-medium">Premium</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Pro Arsenal</h3>
                <p className="text-xs text-gray-500 mt-1">Alle tools</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* Gratis Dating Tools - Minimalist */}
        {!showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION_DELAYS.PROGRAMS + 0.2 }}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Gratis Dating Tools</h2>
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">100% Gratis</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/essentials?tab=badges')}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Badges & Achievements</p>
                    <p className="text-xs text-pink-500">Open Tool →</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/essentials?tab=activity')}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Dating Activity Logger</p>
                    <p className="text-xs text-pink-500">Open Tool →</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/essentials?tab=recommendations')}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Personal Recommendations</p>
                    <p className="text-xs text-pink-500">Open Tool →</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/essentials?tab=stats')}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Stats & Voortgang</p>
                    <p className="text-xs text-pink-500">Open Tool →</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Featured Hechtingsstijl Scan */}
        {!showWelcomeVideo && scanStatus?.hechtingsstijl && !scanStatus.hechtingsstijl.isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION_DELAYS.PROGRAMS + 0.1 }}
          >
            <ScanCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>}
              title="Ontdek je hechtingsstijl"
              subtitle="Leer hoe je hechtingsstijl je dating gedrag beïnvloedt"
              quote="Wetenschappelijk onderbouwde inzichten voor betere relaties"
              actionLabel="Hechtingsstijl Test"
              onAction={() => openScan('hechtingsstijl')}
              badgeText="Tip"
              color="pink"
            />
          </motion.div>
        )}

        {/* Featured Tools Grid */}
        <ToolsGridSection
          onTabChange={onTabChange}
          onOpenScan={openScan}
          showWelcomeVideo={showWelcomeVideo}
        />

        {/* Quick Wins Today */}
        <QuickWinsToday userId={userId} onTabChange={onTabChange} />

        {/* Scans Section */}
        <ScansSection
          scanStatus={scanStatus}
          onOpenScan={openScan}
          showWelcomeVideo={showWelcomeVideo}
        />

        {/* Next Recommended Action */}
        {nextAction && !showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className={cn(
              "border-2 shadow-lg overflow-hidden",
              BORDER_COLOR_MAP[nextAction.color] || BORDER_COLOR_MAP.pink
            )}>
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <Badge className="bg-pink-500 text-white text-xs">Aanbevolen</Badge>
              </div>
              <CardContent className="p-4 sm:p-6 pt-10 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:block">
                    <div className={cn(
                      "w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0",
                      COLOR_MAP[nextAction.color] || COLOR_MAP.pink
                    )}>
                      {(() => {
                        const IconComponent = getIcon(nextAction.icon);
                        return <IconComponent className="w-5 h-5 sm:w-7 sm:h-7" />;
                      })()}
                    </div>
                    <h3 className="sm:hidden text-lg font-bold text-gray-900">
                      {nextAction.title}
                    </h3>
                  </div>
                  <div className="flex-1">
                    <h3 className="hidden sm:block text-xl font-bold text-gray-900 mb-2">
                      {nextAction.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                      {nextAction.description}
                    </p>
                    <Button
                      onClick={() => handleSuggestionClick(nextAction)}
                      className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                      size="default"
                    >
                      {nextAction.actionText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Phase Quick Actions */}
        {phaseActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Fase {userContext?.journeyPhase || 1} Quick Actions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange?.('pad')}
                className="text-pink-600 hover:text-pink-700 self-start sm:self-auto"
              >
                Bekijk je Pad
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {phaseActions.map((action, index) => {
                const IconComponent = getIcon(action.icon);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Card
                      className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-pink-200"
                      onClick={() => handleQuickActionClick(action)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:mb-3">
                          <div className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            COLOR_MAP[action.color] || COLOR_MAP.pink
                          )}>
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900">{action.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 sm:hidden">{action.description}</p>
                          </div>
                        </div>
                        <p className="hidden sm:block text-sm text-gray-600">{action.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Today's Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION_DELAYS.SUGGESTIONS }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Vandaag voor jou</h2>
          </div>

          {suggestions.slice(1, 4).map((suggestion, index) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              index={index}
              onClick={() => handleSuggestionClick(suggestion)}
            />
          ))}
        </motion.div>

        {/* Mijn Cursussen Widget */}
        <MijnCursussenWidget onTabChange={onTabChange} />

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION_DELAYS.PROGRESS }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          {/* Journey Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Je Reis</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Huidige fase</span>
                  <Badge variant="secondary" className="text-xs">Fase {userContext?.journeyPhase || 1}/5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Voltooide assessments</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {userContext?.completedAssessments?.length || 0}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTabChange?.('pad')}
                  className="w-full mt-2 text-xs sm:text-sm"
                >
                  Bekijk voortgang
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Recente Activiteit</h3>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <p>Je bent actief bezig met je dating journey!</p>
                <p className="text-xs text-gray-500">
                  Laatste activiteit: vandaag
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gamification Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION_DELAYS.GAMIFICATION }}
        >
          <GamificationWidget userId={userId} compact />
        </motion.div>

        {/* Upgrade CTA - Klaar voor meer? */}
        {!showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION_DELAYS.GAMIFICATION + 0.1 }}
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Klaar voor meer?</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Unlock AI-powered tools en geavanceerde features met Kickstart Toolkit of Premium Pro Arsenal
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => router.push('/kickstart-toolkit')}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white w-full sm:w-auto"
                        size="default"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Bekijk Kickstart Toolkit
                      </Button>
                      <Button
                        onClick={() => router.push('/pro-arsenal')}
                        variant="outline"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50 w-full sm:w-auto"
                        size="default"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Of bekijk Pro Arsenal
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Scan Modal */}
      <ToolModal isOpen={scanModal.isOpen} onClose={closeScan}>
        {scanModal.component}
      </ToolModal>
    </div>
  );
});
