'use client';

/**
 * Smart Home Tab - Gepersonaliseerde dashboard met AI-driven suggesties
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, Target, Calendar, ArrowRight,
  Heart, Camera, MessageCircle, FileText, CheckCircle2,
  Zap, Crown, User, Lightbulb, Play, Pause, Volume2, VolumeX, Brain
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
import { AttachmentAssessmentFlow } from '@/components/attachment-assessment/attachment-assessment-flow';
import { DatingStyleFlow } from '@/components/dating-style/dating-style-flow';
import { EmotioneleReadinessFlow } from '@/components/emotional-readiness/emotionele-readiness-flow';

interface SmartHomeTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

// Icon mapping
const iconMap: Record<string, any> = {
  'Heart': Heart,
  'Sparkles': Sparkles,
  'User': User,
  'Camera': Camera,
  'FileText': FileText,
  'MessageCircle': MessageCircle,
  'Target': Target,
  'Calendar': Calendar,
  'TrendingUp': TrendingUp,
  'Lightbulb': Lightbulb,
  'Crown': Crown,
  'Zap': Zap,
  'CheckCircle2': CheckCircle2,
  'Brain': Brain
};

// Color mapping
const colorMap: Record<string, string> = {
  'pink': 'bg-pink-100 text-pink-600',
  'blue': 'bg-blue-100 text-blue-600',
  'purple': 'bg-purple-100 text-purple-600',
  'green': 'bg-green-100 text-green-600',
  'indigo': 'bg-indigo-100 text-indigo-600',
  'teal': 'bg-teal-100 text-teal-600',
  'orange': 'bg-orange-100 text-orange-600',
  'rose': 'bg-rose-100 text-rose-600',
  'yellow': 'bg-yellow-100 text-yellow-600',
  'gold': 'bg-yellow-100 text-yellow-600',
  'purple-pink': 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
};

const borderColorMap: Record<string, string> = {
  'pink': 'border-pink-200 hover:border-pink-300',
  'blue': 'border-blue-200 hover:border-blue-300',
  'purple': 'border-purple-200 hover:border-purple-300',
  'green': 'border-green-200 hover:border-green-300',
  'indigo': 'border-indigo-200 hover:border-indigo-300',
  'teal': 'border-teal-200 hover:border-teal-300',
  'orange': 'border-orange-200 hover:border-orange-300',
  'rose': 'border-rose-200 hover:border-rose-300',
  'yellow': 'border-yellow-200 hover:border-yellow-300',
  'gold': 'border-yellow-200 hover:border-yellow-300',
  'purple-pink': 'border-purple-300 hover:border-pink-400'
};

// Helper to check if suggestion is a scan
const isScanSuggestion = (suggestion: Suggestion) => {
  const scanUrls = ['/hechtingsstijl', '/datingstijl', '/emotionele-readiness'];
  return suggestion.actionHref && scanUrls.some(url => suggestion.actionHref?.includes(url));
};

// Helper to get scan metadata for ScanCard
const getScanMetadata = (suggestion: Suggestion) => {
  const scanType = suggestion.actionHref?.replace('/', '') || '';

  // Map scan type to quote and badge
  const scanData: Record<string, { quote: string; badgeText: string; color: 'pink' | 'purple' | 'blue' | 'green' }> = {
    'hechtingsstijl': {
      quote: 'Begrijpen hoe jij liefhebt is de basis van betere dates',
      badgeText: 'Aanbevolen',
      color: 'purple'
    },
    'datingstijl': {
      quote: 'Ontdek je dating patronen en blinde vlekken',
      badgeText: 'Populair',
      color: 'pink'
    },
    'emotionele-readiness': {
      quote: 'Ben je klaar voor dating? Leer het in 3-4 minuten',
      badgeText: 'Tip',
      color: 'blue'
    }
  };

  return scanData[scanType] || {
    quote: 'Ontdek meer over jezelf in een paar minuten',
    badgeText: 'Aanbevolen',
    color: 'pink' as const
  };
};

export function SmartHomeTab({ onTabChange, userId }: SmartHomeTabProps) {
  const router = useRouter();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [phaseActions, setPhaseActions] = useState<any[]>([]);
  const [nextAction, setNextAction] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Modal state for scans
  const [scanModal, setScanModal] = useState<{
    isOpen: boolean;
    scanType: string | null;
    title: string;
    component: React.ReactNode | null;
  }>({
    isOpen: false,
    scanType: null,
    title: '',
    component: null,
  });

  // Gamification hook - auto track login
  const { trackLogin } = useGamification(userId);

  // Video controls
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const dismissWelcomeVideo = () => {
    setShowWelcomeVideo(false);
    localStorage.setItem('dashboard_welcome_video_dismissed', 'true');
  };

  useEffect(() => {
    // Check if we should show welcome video (only once after onboarding)
    const dismissed = localStorage.getItem('dashboard_welcome_video_dismissed');
    if (!dismissed) {
      setShowWelcomeVideo(true);
    }
  }, []);

  useEffect(() => {
    const fetchUserContext = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Track daily login for streak & points
        trackLogin();

        // Fetch user profile en journey data
        const [profileRes, journeyRes] = await Promise.all([
          fetch(`/api/user/profile?userId=${userId}`),
          fetch(`/api/journey/status?userId=${userId}`)
        ]);

        const profile = profileRes.ok ? await profileRes.json() : null;
        const journey = journeyRes.ok ? await journeyRes.json() : null;

        // Build user context
        const context: UserContext = {
          userId,
          journeyPhase: journey?.currentPhase || 1,
          completedAssessments: [], // TODO: fetch from database
          hasProfilePhoto: profile?.hasPhoto || false,
          hasProfileText: profile?.hasBio || false,
          lastActivity: new Date(), // TODO: track real last activity
          goals: profile?.goals || [],
          subscriptionType: profile?.subscriptionType || 'free'
        };

        setUserContext(context);

        // Generate smart suggestions
        const dailySuggestions = generateDailySuggestions(context);
        setSuggestions(dailySuggestions);

        // Get phase-specific quick actions
        const actions = getPhaseQuickActions(context.journeyPhase);
        setPhaseActions(actions);

        // Get next recommended action
        const next = getNextRecommendedAction(context);
        setNextAction(next);

      } catch (error) {
        console.error('Error fetching user context:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContext();
  }, [userId]);

  // Open scan in modal
  const openScanModal = (scanType: string, title: string) => {
    let component: React.ReactNode | null = null;

    switch (scanType) {
      case 'hechtingsstijl':
        component = <AttachmentAssessmentFlow onClose={closeScanModal} />;
        break;
      case 'dating-stijl':
      case 'datingstijl':
        component = <DatingStyleFlow onClose={closeScanModal} />;
        break;
      case 'emotionele-readiness':
        component = <EmotioneleReadinessFlow onClose={closeScanModal} />;
        break;
      default:
        component = null;
    }

    if (component) {
      setScanModal({
        isOpen: true,
        scanType,
        title,
        component,
      });
    }
  };

  // Close scan modal
  const closeScanModal = () => {
    setScanModal({
      isOpen: false,
      scanType: null,
      title: '',
      component: null,
    });
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Check if this is a scan that should open in a modal
    const scanUrls = ['/hechtingsstijl', '/datingstijl', '/emotionele-readiness'];
    const isScan = suggestion.actionHref && scanUrls.some(url => suggestion.actionHref?.includes(url));

    if (isScan && suggestion.actionHref) {
      // Extract scan type from URL
      const scanType = suggestion.actionHref.replace('/', '');
      openScanModal(scanType, suggestion.title);
    } else if (suggestion.actionHref) {
      router.push(suggestion.actionHref);
    } else if (suggestion.actionTab) {
      onTabChange?.(suggestion.actionTab);
    }
  };

  const handleQuickActionClick = (action: any) => {
    // Check if this is a scan that should open in a modal
    const scanUrls = ['/hechtingsstijl', '/datingstijl', '/emotionele-readiness'];
    const isScan = action.href && scanUrls.some(url => action.href?.includes(url));

    if (isScan && action.href) {
      // Extract scan type from URL
      const scanType = action.href.replace('/', '');
      openScanModal(scanType, action.title);
    } else if (action.href) {
      router.push(action.href);
    } else if (action.tab) {
      onTabChange?.(action.tab);
    }
  };

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
        {/* Iris Welkom Video - eenmalig na onboarding */}
        {showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-0 rounded-2xl shadow-sm overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-pink-200">
                {!videoError ? (
                  <>
                    <video
                      ref={videoRef}
                      src="/videos/onboarding/iris-dashboard-intro.mp4"
                      className="absolute inset-0 w-full h-full object-cover"
                      muted={isMuted}
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={() => setVideoError(true)}
                      onEnded={dismissWelcomeVideo}
                      poster="/images/iris-poster.jpg"
                    />

                    {/* Play Button Overlay */}
                    {!isPlaying && (
                      <button
                        onClick={handlePlayPause}
                        className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                          <Play className="w-7 h-7 text-pink-500 ml-1" />
                        </div>
                      </button>
                    )}

                    {/* Video Controls */}
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      {isPlaying && (
                        <button
                          onClick={handlePlayPause}
                          className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <Pause className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <button
                        onClick={handleMuteToggle}
                        className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Fallback als video niet laadt */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-white">I</span>
                      </div>
                      <p className="text-gray-600 text-sm">Iris, je persoonlijke coach</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Caption with dismiss button */}
              <div className="p-4 bg-white flex items-start justify-between gap-4">
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  Welkom op je dashboard! Dit is je startpunt voor alles wat je nodig hebt om succesvol te daten. Laat me je rondleiden!
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissWelcomeVideo}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  Begrepen
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Welkom Sectie */}
        {!showWelcomeVideo && <PersonalizedWelcome />}

        {/* Quick Wins Today - Direct actie-items */}
        <QuickWinsToday userId={userId} onTabChange={onTabChange} />

        {/* Next Recommended Action - Highlighted */}
        {nextAction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {isScanSuggestion(nextAction) ? (
              // Use premium ScanCard for scans
              (() => {
                const IconComponent = iconMap[nextAction.icon] || Sparkles;
                const scanMeta = getScanMetadata(nextAction);
                return (
                  <ScanCard
                    icon={<IconComponent />}
                    title={nextAction.title}
                    subtitle={nextAction.description}
                    quote={scanMeta.quote}
                    actionLabel={nextAction.actionText}
                    onAction={() => handleSuggestionClick(nextAction)}
                    badgeText={scanMeta.badgeText}
                    color={scanMeta.color}
                  />
                );
              })()
            ) : (
              // Regular card for non-scans
              <Card className={cn(
                "border-2 shadow-lg overflow-hidden",
                borderColorMap[nextAction.color] || 'border-pink-200'
              )}>
                {/* Badge - Responsive positioning */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <Badge className="bg-pink-500 text-white text-xs">Aanbevolen</Badge>
                </div>
                <CardContent className="p-4 sm:p-6 pt-10 sm:pt-6">
                  {/* Mobile: Icon + Title inline, Desktop: Side by side layout */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    {/* Icon + Title row on mobile */}
                    <div className="flex items-center gap-3 sm:block">
                      <div className={cn(
                        "w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0",
                        colorMap[nextAction.color] || 'bg-pink-100 text-pink-600'
                      )}>
                        {(() => {
                          const IconComponent = iconMap[nextAction.icon];
                          return IconComponent ? <IconComponent className="w-5 h-5 sm:w-7 sm:h-7" /> : <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />;
                        })()}
                      </div>
                      {/* Title visible on mobile next to icon */}
                      <h3 className="sm:hidden text-lg font-bold text-gray-900">
                        {nextAction.title}
                      </h3>
                    </div>
                    <div className="flex-1">
                      {/* Title hidden on mobile (shown above) */}
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
            )}
          </motion.div>
        )}

        {/* Fase-specifieke Quick Actions */}
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
              const IconComponent = iconMap[action.icon] || Sparkles;
              const scanUrls = ['/hechtingsstijl', '/datingstijl', '/emotionele-readiness'];
              const isActionScan = action.href && scanUrls.some((url: string) => action.href?.includes(url));

              if (isActionScan) {
                // Render scans with premium ScanCard
                const scanType = action.href?.replace('/', '') || '';
                const scanData: Record<string, { quote: string; badgeText: string; color: 'pink' | 'purple' | 'blue' | 'green' }> = {
                  'hechtingsstijl': {
                    quote: 'Begrijpen hoe jij liefhebt is de basis van betere dates',
                    badgeText: 'Fase Actie',
                    color: 'purple'
                  },
                  'datingstijl': {
                    quote: 'Ontdek je dating patronen en blinde vlekken',
                    badgeText: 'Fase Actie',
                    color: 'pink'
                  },
                  'emotionele-readiness': {
                    quote: 'Ben je klaar voor dating? Leer het in 3-4 minuten',
                    badgeText: 'Fase Actie',
                    color: 'blue'
                  }
                };
                const scanMeta = scanData[scanType] || {
                  quote: 'Ontdek meer over jezelf in een paar minuten',
                  badgeText: 'Fase Actie',
                  color: 'pink' as const
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="sm:col-span-2 md:col-span-3"
                  >
                    <ScanCard
                      icon={<IconComponent />}
                      title={action.title}
                      subtitle={action.description}
                      quote={scanMeta.quote}
                      actionLabel="Start Scan"
                      onAction={() => handleQuickActionClick(action)}
                      badgeText={scanMeta.badgeText}
                      color={scanMeta.color}
                    />
                  </motion.div>
                );
              }

              // Regular action cards
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
                          colorMap[action.color] || 'bg-pink-100 text-pink-600'
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

        {/* Vandaag voor jou - Smart Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Vandaag voor jou</h2>
          </div>

          {suggestions.slice(1, 4).map((suggestion, index) => {
            const IconComponent = iconMap[suggestion.icon] || Sparkles;
            const isScan = isScanSuggestion(suggestion);

            if (isScan) {
              // Render scans with premium ScanCard
              const scanMeta = getScanMetadata(suggestion);
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <ScanCard
                    icon={<IconComponent />}
                    title={suggestion.title}
                    subtitle={suggestion.description}
                    quote={scanMeta.quote}
                    actionLabel={suggestion.actionText}
                    onAction={() => handleSuggestionClick(suggestion)}
                    badgeText={scanMeta.badgeText}
                    color={scanMeta.color}
                  />
                </motion.div>
              );
            }

            // Render non-scans as compact list items in a card
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <div
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        colorMap[suggestion.color] || 'bg-pink-100 text-pink-600'
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
          })}
        </motion.div>

        {/* Mijn Programma's Widget - Shows Kickstart and other programs */}
        <MyProgramsWidget />

        {/* Mijn Cursussen Widget - Professional Integration */}
        <MijnCursussenWidget onTabChange={onTabChange} />

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          {/* Je Reis */}
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

          {/* Recente Activiteit */}
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
          transition={{ delay: 0.4 }}
        >
          <GamificationWidget userId={userId} compact />
        </motion.div>
      </div>

      {/* Scan Modal - Opens scans in beautiful modal overlay */}
      <ToolModal
        isOpen={scanModal.isOpen}
        onClose={closeScanModal}
      >
        {scanModal.component}
      </ToolModal>
    </div>
  );
}
