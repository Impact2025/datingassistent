/**
 * Smart Home Tab - OPTIMIZED WERELDKLASSE VERSION
 * Refactored for performance, maintainability, and code quality
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, CheckCircle2, Zap, ArrowRight, Badge as BadgeIcon
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
import { MyProgramsWidget } from './my-programs-widget';
import { ToolModal } from '@/components/tools/tool-modal';
import { WelcomeVideoCard } from './sections/welcome-video-card';
import { ToolsGridSection } from './sections/tools-grid-section';
import { ScansSection } from './sections/scans-section';

// Optimized hooks
import { useScanManager } from '@/hooks/use-scan-manager';

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

export const SmartHomeTabOptimized = React.memo(function SmartHomeTabOptimized({
  onTabChange,
  userId
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

  // Check if welcome video should be shown
  useEffect(() => {
    const dismissed = localStorage.getItem(CACHE_KEYS.WELCOME_VIDEO_DISMISSED);
    if (!dismissed) {
      setShowWelcomeVideo(true);
    }
  }, []);

  // Fetch user context - optimized with parallel requests
  useEffect(() => {
    const fetchUserContext = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        trackLogin();

        const [profileRes, journeyRes] = await Promise.all([
          fetch(API_ENDPOINTS.USER_PROFILE(userId)),
          fetch(API_ENDPOINTS.JOURNEY_STATUS(userId)),
        ]);

        const profile = profileRes.ok ? await profileRes.json() : null;
        const journey = journeyRes.ok ? await journeyRes.json() : null;

        const context: UserContext = {
          userId,
          journeyPhase: journey?.currentPhase || 1,
          completedAssessments: [],
          hasProfilePhoto: profile?.hasPhoto || false,
          hasProfileText: profile?.hasBio || false,
          lastActivity: new Date(),
          goals: profile?.goals || [],
          subscriptionType: profile?.subscriptionType || 'free'
        };

        setUserContext(context);
      } catch (error) {
        console.error('Error fetching user context:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContext();
  }, [userId, trackLogin]);

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

        {/* My Programs Widget */}
        {!showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION_DELAYS.PROGRAMS }}
          >
            <MyProgramsWidget />
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
      </div>

      {/* Scan Modal */}
      <ToolModal isOpen={scanModal.isOpen} onClose={closeScan}>
        {scanModal.component}
      </ToolModal>
    </div>
  );
});
