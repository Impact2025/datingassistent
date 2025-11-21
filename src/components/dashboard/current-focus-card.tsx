"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Zap,
  Loader2
} from "lucide-react";
import { CoachingProfile } from "@/lib/coaching-profile-service";

interface CurrentFocusCardProps {
  userId: number;
  onNavigate: (tab: string) => void;
}

interface NextAction {
  action: string;
  tool?: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export function CurrentFocusCard({ userId, onNavigate }: CurrentFocusCardProps) {
  const [profile, setProfile] = useState<CoachingProfile | null>(null);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoachingProfile();
    loadNextAction();
  }, [userId]);

  const loadCoachingProfile = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/coaching-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading coaching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextAction = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/coaching-profile/next-action', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNextAction(data);
      }
    } catch (error) {
      console.error('Error loading next action:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'intake':
        return 'Kennismaking';
      case 'foundation':
        return 'Basis leggen';
      case 'skills':
        return 'Skills ontwikkelen';
      case 'mastery':
        return 'Meesterschap';
      case 'maintenance':
        return 'Onderhoud';
      default:
        return phase;
    }
  };

  const getPhaseProgress = (phase: string, journeyDay: number) => {
    switch (phase) {
      case 'intake':
        return Math.min(100, (journeyDay / 3) * 100); // First 3 days
      case 'foundation':
        return Math.min(100, ((journeyDay - 3) / 4) * 100); // Days 4-7
      case 'skills':
        return Math.min(100, ((journeyDay - 7) / 21) * 100); // Days 8-28
      case 'mastery':
        return Math.min(100, ((journeyDay - 28) / 30) * 100); // Days 29-58
      case 'maintenance':
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!profile || !nextAction) {
    return null;
  }

  const phaseProgress = getPhaseProgress(profile.currentPhase, profile.journeyDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Jouw Huidige Focus
        </h2>
        <p className="text-sm text-muted-foreground">Persoonlijke begeleiding gebaseerd op je voortgang</p>
      </div>

      {/* Focus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Journey Phase Card */}
        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/20 dark:to-gray-900">
          <CardContent className="p-4 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-pink-500 text-white flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Jouw Fase</h3>
                <p className="text-xs text-muted-foreground">{getPhaseLabel(profile.currentPhase)}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Dag {profile.journeyDay}</span>
                    <span>{Math.round(phaseProgress)}%</span>
                  </div>
                  <Progress value={phaseProgress} className="h-1.5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Action Card */}
        <Card className={`border-2 ${nextAction.priority === 'high' ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20'}`}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full ${nextAction.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'} text-white flex items-center justify-center`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Volgende Stap</h3>
                  {nextAction.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs mt-1">Belangrijk</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium leading-tight">{nextAction.action}</p>
                <p className="text-xs text-muted-foreground leading-tight">{nextAction.reason}</p>

                {nextAction.tool && (
                  <Button
                    onClick={() => onNavigate(nextAction.tool!)}
                    size="sm"
                    className="w-full text-xs bg-pink-500 hover:bg-pink-600"
                  >
                    Start nu
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Focus Card */}
        {profile.weeklyFocus && (
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-gray-900">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Week Focus</h3>
                  <p className="text-xs text-muted-foreground leading-tight">{profile.weeklyFocus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview Card */}
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-gray-900 md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Jouw Voortgang</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{Object.keys(profile.toolsUsed).length}</div>
                    <div className="text-xs text-muted-foreground">Tools</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{profile.completedSteps.length}</div>
                    <div className="text-xs text-muted-foreground">Stappen</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{profile.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Tools Card */}
        {profile.recommendedTools.length > 0 && (
          <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-gray-900 md:col-span-2">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">Aanbevolen Tools</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.recommendedTools.map((tool, index) => {
                    const isUsed = profile.toolsUsed[tool] && profile.toolsUsed[tool] > 0;
                    return (
                      <button
                        key={index}
                        onClick={() => onNavigate(tool)}
                        className={`
                          px-3 py-1.5 rounded-full text-xs font-medium transition-all
                          ${isUsed
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200'
                          }
                        `}
                      >
                        {isUsed && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {tool.replace(/-/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
