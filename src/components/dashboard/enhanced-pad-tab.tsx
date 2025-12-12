'use client';

/**
 * Enhanced Pad Tab - Interactieve 5-fase journey met visuele progress tracking
 * Nu met geïntegreerde Kickstart support!
 */

import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Heart, MessageCircle, Calendar, TrendingUp,
  CheckCircle2, Circle, Lock, ArrowRight, Sparkles,
  Target, Award, Zap, Trophy, BookOpen, Rocket, Loader2
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { JourneyTimeline } from '../journey/journey-timeline';
import { AchievementShowcase } from '../achievements/achievement-showcase';
import { KickstartDashboard } from '../kickstart/KickstartDashboard';

interface EnrolledProgram {
  program_id: number;
  program_slug: string;
  program_name: string;
  program_type: 'kickstart' | 'standard';
  overall_progress_percentage: number;
  completed_days?: number;
  total_days?: number;
  next_day?: number;
}

interface EnhancedPadTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

interface JourneyPhase {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progress: number;
  tools: Array<{
    name: string;
    href?: string;
    tab?: string;
    completed?: boolean;
  }>;
  description: string;
  estimatedTime: string;
}

type ViewMode = 'programs' | 'kickstart' | 'journey';

export const EnhancedPadTab = memo(function EnhancedPadTab({ onTabChange, userId }: EnhancedPadTabProps) {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [overallProgress, setOverallProgress] = useState(15);
  const [loading, setLoading] = useState(true);
  const [enrolledPrograms, setEnrolledPrograms] = useState<EnrolledProgram[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('programs');
  const [hasKickstart, setHasKickstart] = useState(false);

  // Fetch enrolled programs
  useEffect(() => {
    const fetchEnrolledPrograms = async () => {
      try {
        const response = await fetch('/api/user/enrolled-programs');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.programs) {
            setEnrolledPrograms(data.programs);

            // Check if user has Kickstart
            const kickstart = data.programs.find(
              (p: EnrolledProgram) => p.program_slug === 'kickstart'
            );
            if (kickstart) {
              setHasKickstart(true);
              // Auto-show Kickstart if user has it
              setViewMode('kickstart');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching enrolled programs:', error);
      }
    };

    if (userId) {
      fetchEnrolledPrograms();
    }
  }, [userId]);

  // Fetch journey status
  useEffect(() => {
    const fetchJourneyStatus = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/journey/status?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentPhase(data.currentPhase || 1);
          setOverallProgress(data.overallProgress || 15);
        }
      } catch (error) {
        console.error('Error fetching journey status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyStatus();
  }, [userId]);

  const phases: JourneyPhase[] = [
    {
      id: 1,
      title: 'Fundament',
      subtitle: 'Ken jezelf',
      icon: User,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      status: currentPhase >= 1 ? (currentPhase > 1 ? 'completed' : 'in_progress') : 'locked',
      progress: currentPhase > 1 ? 100 : (currentPhase === 1 ? 60 : 0),
      tools: [
        { name: 'Hechtingsstijl Scan', action: 'profile-suite', completed: false },
        { name: 'Emotionele Ready Check', action: 'profile-suite', completed: false },
        { name: 'Zelfbeeld Assessment', action: 'profile-suite', completed: false },
        { name: 'Dating Archetypes', action: 'datingstijl', completed: false }
      ],
      description: 'Begin met zelfkennis. Ontdek je hechtingsstijl, emotionele beschikbaarheid en dating energie.',
      estimatedTime: '2-3 uur'
    },
    {
      id: 2,
      title: 'Profiel',
      subtitle: 'Presenteer jezelf',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      status: currentPhase >= 2 ? (currentPhase > 2 ? 'completed' : 'in_progress') : (currentPhase === 1 ? 'available' : 'locked'),
      progress: currentPhase > 2 ? 100 : (currentPhase === 2 ? 40 : 0),
      tools: [
        { name: 'Profiel Bouwer', action: 'profile-suite', completed: false },
        { name: 'Foto Analyse', action: 'foto-advies', completed: false },
        { name: 'Dating Stijl Scan', action: 'datingstijl', completed: false },
        { name: 'Platform Match Tool', action: 'profile-suite', completed: false }
      ],
      description: 'Bouw je aantrekkelijke profiel. Van foto\'s tot bio, maak je eerste indruk perfect.',
      estimatedTime: '3-4 uur'
    },
    {
      id: 3,
      title: 'Communicatie',
      subtitle: 'Connect & converseer',
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: currentPhase >= 3 ? (currentPhase > 3 ? 'completed' : 'in_progress') : (currentPhase >= 2 ? 'available' : 'locked'),
      progress: currentPhase > 3 ? 100 : (currentPhase === 3 ? 30 : 0),
      tools: [
        { name: 'Gesprek Starter Generator', action: 'chat-coach', completed: false },
        { name: 'Chat Coach AI', action: 'chat-coach', completed: false },
        { name: 'Gesprekstechnieken', action: 'communicatie-matching', completed: false },
        { name: 'Bio Generator Pro', action: 'profile-suite', completed: false }
      ],
      description: 'Master je gesprekken. Van openers tot diepgaande conversaties, leer effectief communiceren.',
      estimatedTime: '2-3 uur'
    },
    {
      id: 4,
      title: 'Actief Daten',
      subtitle: 'Practice & leer',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      status: currentPhase >= 4 ? (currentPhase > 4 ? 'completed' : 'in_progress') : (currentPhase >= 3 ? 'available' : 'locked'),
      progress: currentPhase > 4 ? 100 : (currentPhase === 4 ? 20 : 0),
      tools: [
        { name: 'Date Planner AI', action: 'dateplanner', completed: false },
        { name: 'Date Voorbereiding', action: 'dateplanner', completed: false },
        { name: 'Reflectie Tool', action: 'groei-doelen', completed: false },
        { name: 'Dating Activity Logger', action: 'dashboard', completed: false }
      ],
      description: 'Ga daadwerkelijk daten. Plan dates, bereid je voor en leer van elke ervaring.',
      estimatedTime: 'Doorlopend'
    },
    {
      id: 5,
      title: 'Verdieping',
      subtitle: 'Groei & relaties',
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      status: currentPhase >= 5 ? 'in_progress' : (currentPhase === 4 ? 'available' : 'locked'),
      progress: currentPhase === 5 ? 10 : 0,
      tools: [
        { name: 'Relatiepatronen Analyse', action: 'groei-doelen', completed: false },
        { name: 'Levensvisie Tool', action: 'groei-doelen', completed: false },
        { name: 'Relationship Coach AI', action: 'chat-coach', completed: false },
        { name: 'Doelen & Groei', action: 'groei-doelen', completed: false }
      ],
      description: 'Verdiep je inzichten. Analyseer patronen, ontwikkel jezelf en bouw betekenisvolle relaties.',
      estimatedTime: 'Doorlopend'
    }
  ];

  const handlePhaseClick = (phase: JourneyPhase) => {
    if (phase.status === 'locked') return;
    // Scroll to phase or expand details
  };

  const handleToolClick = (tool: any) => {
    if (tool.href) {
      router.push(tool.href);
    } else if (tool.action) {
      onTabChange?.(tool.action);
    } else if (tool.tab) {
      onTabChange?.(tool.tab);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Je programma's laden...</p>
        </div>
      </div>
    );
  }

  // Show Kickstart when in kickstart mode - clean minimalist design within dashboard
  if (viewMode === 'kickstart' && hasKickstart && userId) {
    return <KickstartDashboard onBack={() => setViewMode('journey')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">Jouw Dating Reis</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Volg je voortgang door 5 fases: van zelfkennis tot betekenisvolle relaties
          </p>

          {/* View Switcher when user has Kickstart */}
          {hasKickstart && (
            <div className="flex justify-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setViewMode('kickstart')}
                className="bg-gradient-to-r from-pink-500 to-pink-600"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Ga naar Kickstart
              </Button>
            </div>
          )}

          {/* Overall Progress */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Totale voortgang</span>
              <span className="font-medium text-pink-600">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Award className="w-4 h-4" />
              <span>Fase {currentPhase} van 5</span>
            </div>
          </div>
        </motion.div>

        {/* Journey Phases */}
        <div className="space-y-6">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isActive = phase.id === currentPhase;
            const isCompleted = phase.status === 'completed';
            const isLocked = phase.status === 'locked';

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "border-2 transition-all cursor-pointer",
                    isActive && "ring-4 ring-pink-100 shadow-lg",
                    isCompleted && "border-green-300 bg-green-50/30",
                    isLocked && "opacity-50 cursor-not-allowed",
                    !isLocked && "hover:shadow-md",
                    phase.borderColor
                  )}
                  onClick={() => handlePhaseClick(phase)}
                >
                  <CardContent className="p-6">
                    {/* Phase Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0",
                        phase.bgColor,
                        isLocked && "opacity-50"
                      )}>
                        {isLocked ? (
                          <Lock className={cn("w-7 h-7", phase.color)} />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-7 h-7 text-green-600" />
                        ) : (
                          <Icon className={cn("w-7 h-7", phase.color)} />
                        )}
                      </div>

                      {/* Title & Status */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Fase {phase.id}: {phase.title}
                          </h3>
                          {isActive && (
                            <Badge className="bg-pink-500 text-white">
                              <Zap className="w-3 h-3 mr-1" />
                              Actief
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Voltooid
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="secondary">
                              <Lock className="w-3 h-3 mr-1" />
                              Vergrendeld
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{phase.subtitle}</p>
                        <p className="text-gray-700 mb-4">{phase.description}</p>

                        {/* Progress Bar */}
                        {!isLocked && (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Voortgang</span>
                              <span className={cn(
                                "font-medium",
                                isCompleted ? "text-green-600" : "text-pink-600"
                              )}>
                                {phase.progress}%
                              </span>
                            </div>
                            <Progress value={phase.progress} className="h-2" />
                          </div>
                        )}

                        {/* Tools Grid */}
                        {!isLocked && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {phase.tools.map((tool, toolIndex) => (
                              <button
                                key={toolIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToolClick(tool);
                                }}
                                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all text-left group"
                              >
                                <Circle className="w-4 h-4 text-gray-400 group-hover:text-pink-500" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 flex-1">
                                  {tool.name}
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pink-500" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Estimated Time */}
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                          <Target className="w-4 h-4" />
                          <span>Geschatte tijd: {phase.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Achievement Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Jouw Achievements</h2>
              </div>
              <AchievementShowcase userId={userId} compact />
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Klaar voor de volgende stap?
              </h3>
              <p className="text-gray-600 mb-4">
                Praat met Iris, je AI dating coach, voor persoonlijk advies
              </p>
              <Button
                onClick={() => onTabChange?.('coach')}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Gesprek met Iris
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});
