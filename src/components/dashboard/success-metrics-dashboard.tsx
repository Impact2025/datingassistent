'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  MessageCircle,
  Heart,
  Star,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trophy
} from 'lucide-react';

interface SuccessMetrics {
  overallScore: number;
  weeklyProgress: {
    week: string;
    score: number;
    activities: number;
    matches: number;
    conversations: number;
  }[];
  keyMetrics: {
    profileViews: number;
    messagesSent: number;
    responseRate: number;
    matchRate: number;
    conversationDepth: number;
    dateSuccess: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    metric: string;
  }[];
  insights: {
    type: 'success' | 'improvement' | 'warning' | 'tip';
    title: string;
    description: string;
    actionable: boolean;
  }[];
  predictions: {
    nextWeekActivity: number;
    expectedMatches: number;
    confidence: number;
  };
}

export function SuccessMetricsDashboard() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('SuccessMetricsDashboard error:', error, errorInfo);
      }}
    >
      <SuccessMetricsDashboardInner />
    </ErrorBoundary>
  );
}

function SuccessMetricsDashboardInner() {
  const { user } = useUser();
  const [metrics, setMetrics] = useState<SuccessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    if (user?.id) {
      loadMetrics();
    }
  }, [user?.id, timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/success-metrics?userId=${user?.id}&timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to load success metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Bezig met laden van je succes metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Geen data beschikbaar</h3>
          <p className="text-muted-foreground">
            Gebruik meer tools om je succes metrics te zien
          </p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'improvement': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'tip': return <Zap className="w-5 h-5 text-purple-500" />;
      default: return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">📊 Je Dating Succes Dashboard</h1>
        <p className="text-muted-foreground">
          Gedetailleerde inzichten in je dating voortgang en kansen
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          {[
            { value: 'week', label: 'Deze week' },
            { value: 'month', label: 'Deze maand' },
            { value: 'quarter', label: 'Laatste 3 maanden' }
          ].map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range.value as any)}
              className="px-4"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Inzichten</TabsTrigger>
          <TabsTrigger value="predictions">Voorspellingen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                      {metrics.overallScore}
                    </div>
                    <div className="text-xs text-muted-foreground">/100</div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Totale Succes Score</h2>
                <Progress value={metrics.overallScore} className="max-w-md mx-auto" />
                <p className="text-muted-foreground">
                  {metrics.overallScore >= 80 ? 'Uitstekende voortgang!' :
                   metrics.overallScore >= 60 ? 'Goede basis, ruimte voor verbetering' :
                   'Focus op de verbeterpunten hieronder'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Profiel views',
                value: metrics.keyMetrics.profileViews,
                icon: Users,
                suffix: '',
                color: 'text-blue-600'
              },
              {
                label: 'Berichten verzonden',
                value: metrics.keyMetrics.messagesSent,
                icon: MessageCircle,
                suffix: '',
                color: 'text-green-600'
              },
              {
                label: 'Response rate',
                value: metrics.keyMetrics.responseRate,
                icon: Heart,
                suffix: '%',
                color: 'text-pink-600'
              },
              {
                label: 'Match rate',
                value: metrics.keyMetrics.matchRate,
                icon: Target,
                suffix: '%',
                color: 'text-purple-600'
              },
              {
                label: 'Gesprek diepte',
                value: metrics.keyMetrics.conversationDepth,
                icon: MessageCircle,
                suffix: '/10',
                color: 'text-indigo-600'
              },
              {
                label: 'Date succes',
                value: metrics.keyMetrics.dateSuccess,
                icon: Star,
                suffix: '%',
                color: 'text-yellow-600'
              }
            ].map((metric) => (
              <Card key={metric.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className={`text-2xl font-bold ${metric.color}`}>
                        {metric.value}{metric.suffix}
                      </p>
                    </div>
                    <metric.icon className={`w-8 h-8 ${metric.color} opacity-60`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Wekelijkse Voortgang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.weeklyProgress.slice(-4).map((week, index) => (
                  <div key={week.week} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">
                      Week {week.week}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Score: {week.score}/100</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{week.activities} activiteiten</span>
                          <span>{week.matches} matches</span>
                          <span>{week.conversations} gesprekken</span>
                        </div>
                      </div>
                      <Progress value={week.score} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Prestatie Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(trend.direction)}
                      <div>
                        <p className="font-medium">{trend.metric}</p>
                        <p className="text-sm text-muted-foreground">
                          {trend.direction === 'up' ? 'Verbetering' :
                           trend.direction === 'down' ? 'Achteruitgang' : 'Stabiel'}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      trend.direction === 'up' ? 'text-green-600' :
                      trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                      {Math.abs(trend.percentage)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            {metrics.insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                insight.type === 'success' ? 'border-l-green-500' :
                insight.type === 'improvement' ? 'border-l-blue-500' :
                insight.type === 'warning' ? 'border-l-yellow-500' : 'border-l-purple-500'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          Actie vereist
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Voorspellingen
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gebaseerd op je huidige patronen en markttrends
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Activity className="w-8 h-8 mx-auto text-blue-600" />
                      <h3 className="font-semibold">Verwachte Activiteit</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.predictions.nextWeekActivity}
                      </p>
                      <p className="text-sm text-muted-foreground">berichten volgende week</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Heart className="w-8 h-8 mx-auto text-green-600" />
                      <h3 className="font-semibold">Verwachte Matches</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics.predictions.expectedMatches}
                      </p>
                      <p className="text-sm text-muted-foreground">nieuwe matches volgende week</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Voorspellings Betrouwbaarheid</h3>
                      <p className="text-sm text-muted-foreground">
                        Gebaseerd op historische data en huidige trends
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {metrics.predictions.confidence}%
                      </p>
                      <p className="text-sm text-muted-foreground">betrouwbaar</p>
                    </div>
                  </div>
                  <Progress value={metrics.predictions.confidence} className="mt-3" />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}