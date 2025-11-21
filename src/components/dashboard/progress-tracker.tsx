'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  MessageCircle,
  User,
  Calendar,
  Star,
  Award,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@/providers/user-provider';

interface ProgressMetrics {
  profileScore: number;
  conversationQuality: number;
  consistency: number;
  overallScore: number;
  weekStart: Date;
}

interface WeeklyInsight {
  id: number;
  type: 'improvement' | 'celebration' | 'warning' | 'tip';
  title: string;
  description: string;
  actionable: boolean;
  priority: number;
}

interface UserBadge {
  id: number;
  type: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

interface ProgressData {
  progress: ProgressMetrics | null;
  insights: WeeklyInsight[];
  badges: UserBadge[];
}

interface ProgressTrackerProps {
  onTabChange?: (tab: string) => void;
}

export function ProgressTracker({ onTabChange }: ProgressTrackerProps) {
  const { user } = useUser();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProgressData();
    }
  }, [user?.id]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/progress/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (response.ok) {
        const progressData = await response.json();
        setData(progressData);
      } else {
        setError('Kon voortgangsgegevens niet laden');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Er is een fout opgetreden bij het laden van je voortgang');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'celebration': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'improvement': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-purple-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'celebration': return 'border-yellow-200 bg-yellow-50';
      case 'improvement': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'tip': return 'border-purple-200 bg-purple-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  // Convert metrics to professional progress steps
  const getProgressSteps = (progress: ProgressMetrics | null) => {
    if (!progress) return [];

    const steps = [
      {
        id: 1,
        title: 'Profiel Optimalisatie',
        description: 'Profielscore verbeteren voor betere zichtbaarheid',
        status: progress.profileScore >= 70 ? 'completed' : progress.profileScore >= 40 ? 'in-progress' : 'available',
        icon: User,
        score: progress.profileScore,
        action: 'profiel-coach',
        actionLabel: 'Optimaliseren'
      },
      {
        id: 2,
        title: 'Communicatie Skills',
        description: 'Gespreksvaardigheden ontwikkelen en verfijnen',
        status: progress.conversationQuality >= 70 ? 'completed' : progress.conversationQuality >= 40 ? 'in-progress' : 'available',
        icon: MessageCircle,
        score: progress.conversationQuality,
        action: 'chat-coach',
        actionLabel: 'Ontwikkelen'
      },
      {
        id: 3,
        title: 'Activiteit & Consistentie',
        description: 'Regelmatige aanwezigheid op dating platforms',
        status: progress.consistency >= 70 ? 'completed' : progress.consistency >= 40 ? 'in-progress' : 'available',
        icon: Calendar,
        score: progress.consistency,
        action: 'date-planner',
        actionLabel: 'Beheren'
      },
      {
        id: 4,
        title: 'Algemene Prestaties',
        description: 'Totale dating index en voortgangsoverzicht',
        status: progress.overallScore >= 80 ? 'completed' : progress.overallScore >= 60 ? 'in-progress' : 'available',
        icon: TrendingUp,
        score: progress.overallScore,
        action: 'profiel-analyse',
        actionLabel: 'Analyseren',
        isMainGoal: true
      }
    ];

    return steps;
  };

  const getStatusIcon = (status: string, IconComponent: any) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>;
      case 'available':
        return <IconComponent className="w-5 h-5 text-blue-600" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'in-progress':
        return 'Bezig';
      case 'available':
        return 'Beschikbaar';
      default:
        return 'Vergrendeld';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'available':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="bg-secondary/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                  <div className="w-6 h-6 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-secondary/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">{error || 'Kon voortgangsgegevens niet laden'}</p>
          <Button onClick={fetchProgressData} variant="outline">
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { progress, insights, badges } = data;
  const progressSteps = getProgressSteps(progress);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="space-y-4">
        {progressSteps.map((step, index) => {
          const IconComponent = step.icon;
          const isLastStep = index === progressSteps.length - 1;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                step.status === 'available' || step.status === 'in-progress'
                  ? 'bg-background border-primary/20'
                  : step.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-muted/50 border-muted'
              }`}
            >
              <div className="flex flex-col items-center mt-1">
                <div className="relative">
                  {getStatusIcon(step.status, IconComponent)}
                  {step.isMainGoal && (
                    <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                {!isLastStep && (
                  <div className="h-8 w-0.5 bg-border mt-1"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-sm font-medium">Score: {step.score}/100</div>
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${step.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border font-medium ${getStatusColor(step.status)}`}>
                    {getStatusText(step.status)}
                  </span>
                </div>

                {step.isMainGoal && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded border">Belangrijkste doel</span>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {step.status === 'available' && (
                    <Button size="sm" onClick={() => onTabChange?.(step.action)}>
                      {step.actionLabel}
                    </Button>
                  )}
                  {step.status === 'in-progress' && (
                    <Button size="sm" variant="outline" onClick={() => onTabChange?.(step.action)}>
                      Ga verder
                    </Button>
                  )}
                  {step.status === 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => onTabChange?.(step.action)}>
                      Bekijk opnieuw
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Wekelijkse Inzichten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 3)
                .map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                        {insight.actionable && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Actie vereist
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges Collection */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Jouw Badges ({badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.slice(0, 8).map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-sm text-gray-900">{badge.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
            {badges.length > 8 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                En nog {badges.length - 8} andere badges...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Blijf je vaardigheden ontwikkelen</h3>
          <p className="text-slate-600 mb-4">
            Gebruik de tools regelmatig om je voortgang te optimaliseren
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange?.('profiel-coach')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Profiel verbeteren
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange?.('chat-coach')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Chat skills oefenen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange?.('profiel-analyse')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Analyse bekijken
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  isMainMetric?: boolean;
}

function MetricCard({ title, value, icon, color, description, isMainMetric }: MetricCardProps) {
  return (
    <Card className={`${color} ${isMainMetric ? 'ring-2 ring-pink-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-full ${isMainMetric ? 'bg-pink-100' : 'bg-white/50'}`}>
            {icon}
          </div>
          <div className={`text-2xl font-bold ${isMainMetric ? 'text-pink-700' : 'text-gray-900'}`}>
            {value}
          </div>
        </div>
        <h3 className={`font-semibold text-sm ${isMainMetric ? 'text-pink-800' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}