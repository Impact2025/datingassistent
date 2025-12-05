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
  Zap, Crown, User, Lightbulb, Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { PersonalizedWelcome } from './personalized-welcome';
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
  'CheckCircle2': CheckCircle2
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
  'gold': 'bg-yellow-100 text-yellow-600'
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
  'gold': 'border-yellow-200 hover:border-yellow-300'
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

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.actionHref) {
      router.push(suggestion.actionHref);
    } else if (suggestion.actionTab) {
      onTabChange?.(suggestion.actionTab);
    }
  };

  const handleQuickActionClick = (action: any) => {
    if (action.href) {
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Iris Welkom Video - eenmalig na onboarding */}
        {showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-0 rounded-2xl shadow-sm overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100">
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
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
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
            <Card className={cn(
              "border-2 shadow-lg overflow-hidden",
              borderColorMap[nextAction.color] || 'border-pink-200'
            )}>
              <div className="absolute top-0 right-0 p-3">
                <Badge className="bg-pink-500 text-white">Aanbevolen</Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0",
                    colorMap[nextAction.color] || 'bg-pink-100 text-pink-600'
                  )}>
                    {(() => {
                      const IconComponent = iconMap[nextAction.icon];
                      return IconComponent ? <IconComponent className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {nextAction.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {nextAction.description}
                    </p>
                    <Button
                      onClick={() => handleSuggestionClick(nextAction)}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
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

        {/* Fase-specifieke Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Fase {userContext?.journeyPhase || 1} Quick Actions
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange?.('pad')}
              className="text-pink-600 hover:text-pink-700"
            >
              Bekijk je Pad
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phaseActions.map((action, index) => {
              const IconComponent = iconMap[action.icon] || Sparkles;
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
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          colorMap[action.color] || 'bg-pink-100 text-pink-600'
                        )}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
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
        >
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-pink-500" />
                <h2 className="text-lg font-semibold text-gray-900">Vandaag voor jou</h2>
              </div>

              <div className="space-y-3">
                {suggestions.slice(1, 4).map((suggestion, index) => {
                  const IconComponent = iconMap[suggestion.icon] || Sparkles;
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        colorMap[suggestion.color] || 'bg-pink-100 text-pink-600'
                      )}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                        <p className="text-xs text-gray-600">{suggestion.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Je Reis */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Je Reis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Huidige fase</span>
                  <Badge variant="secondary">Fase {userContext?.journeyPhase || 1}/5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voltooide assessments</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userContext?.completedAssessments?.length || 0}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTabChange?.('pad')}
                  className="w-full mt-2"
                >
                  Bekijk voortgang
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recente Activiteit */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Recente Activiteit</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Je bent actief bezig met je dating journey! 🎉</p>
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
    </div>
  );
}
