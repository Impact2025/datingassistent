"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Flame,
  Star,
  Trophy,
  ArrowRight,
  Brain,
  Heart,
  Zap,
  ChevronRight,
  Download
} from "lucide-react";

interface MonthlyReportProps {
  userId: number;
  month: number;
  year: number;
}

interface MonthlyMetrics {
  totalMatches: number;
  qualityMatches: number;
  totalConversations: number;
  meaningfulConversations: number;
  totalDates: number;
  secondDates: number;
  daysActive: number;
  totalDaysInMonth: number;
  consistencyScore: number;
  longestStreak: number;
  tasksCompleted: number;
  totalTasks: number;
  checkinsCompleted: number;
  goalsAchieved: number;
  totalGoals: number;
  pointsEarned: number;
  badgesEarned: number;
}

interface MonthlyInsights {
  overallProgress: number;
  strengthAreas: string[];
  improvementAreas: string[];
  personalizedTips: string[];
  aiSummary: string;
  nextMonthFocus: string[];
  motivationalMessage: string;
}

export function MonthlyReport({ userId, month, year }: MonthlyReportProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MonthlyMetrics | null>(null);
  const [insights, setInsights] = useState<MonthlyInsights | null>(null);
  const [comparison, setComparison] = useState<any>(null);

  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  useEffect(() => {
    loadMonthlyReport();
  }, [userId, month, year]);

  const loadMonthlyReport = async () => {
    try {
      const response = await fetch(`/api/engagement/monthly-report?userId=${userId}&month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setInsights(data.insights);
        setComparison(data.comparison);
      }
    } catch (error) {
      console.error('Failed to load monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!metrics || !insights) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Geen rapport beschikbaar</h3>
          <p className="text-muted-foreground mb-4">
            Er is nog geen maandrapport voor {monthNames[month - 1]} {year}
          </p>
          <Button onClick={loadMonthlyReport}>
            Genereer Rapport
          </Button>
        </CardContent>
      </Card>
    );
  }

  const taskCompletionRate = metrics.totalTasks > 0 ? (metrics.tasksCompleted / metrics.totalTasks * 100) : 0;
  const goalAchievementRate = metrics.totalGoals > 0 ? (metrics.goalsAchieved / metrics.totalGoals * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="text-primary" />
            Maandrapport {monthNames[month - 1]} {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">{insights.overallProgress}/100</div>
              <div className="text-sm text-muted-foreground">Overall score</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">AI Analyse</div>
              <div className="text-sm max-w-xs">{insights.aiSummary}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{metrics.totalMatches}</div>
            <div className="text-sm text-muted-foreground">Matches</div>
            {comparison?.vsLastMonth?.matchesChange !== undefined && (
              <div className="flex items-center justify-center gap-1 text-xs mt-1">
                {getTrendIcon(comparison.vsLastMonth.matchesChange)}
                <span>{Math.abs(Math.round(comparison.vsLastMonth.matchesChange))}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{metrics.totalConversations}</div>
            <div className="text-sm text-muted-foreground">Gesprekken</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{metrics.totalDates}</div>
            <div className="text-sm text-muted-foreground">Dates</div>
            {comparison?.vsLastMonth?.datesChange !== undefined && (
              <div className="flex items-center justify-center gap-1 text-xs mt-1">
                {getTrendIcon(comparison.vsLastMonth.datesChange)}
                <span>{Math.abs(Math.round(comparison.vsLastMonth.datesChange))}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{metrics.consistencyScore}%</div>
            <div className="text-sm text-muted-foreground">Consistentie</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Engagement & Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Activiteit & Prestaties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Actieve dagen</span>
                <span className="text-sm font-medium">{metrics.daysActive}/{metrics.totalDaysInMonth}</span>
              </div>
              <Progress value={(metrics.daysActive / metrics.totalDaysInMonth) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Taken voltooid</span>
                <span className="text-sm font-medium">{metrics.tasksCompleted}/{metrics.totalTasks}</span>
              </div>
              <Progress value={taskCompletionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{metrics.qualityMatches}</div>
                <div className="text-xs text-muted-foreground">Kwaliteit matches</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{metrics.secondDates}</div>
                <div className="text-xs text-muted-foreground">Tweede dates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI Analyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Sterke punten
              </h4>
              <ul className="space-y-1">
                {insights.strengthAreas.slice(0, 2).map((strength, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {strength}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Verbeterpunten
              </h4>
              <ul className="space-y-1">
                {insights.improvementAreas.slice(0, 2).map((area, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {area}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips & Goals */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Persoonlijke tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.personalizedTips.slice(0, 3).map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus volgende maand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.nextMonthFocus.map((focus, i) => (
                <div key={i} className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span className="text-sm">{focus}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Doelen overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span>Doelen behaald</span>
            <span className="font-bold">{metrics.goalsAchieved}/{metrics.totalGoals}</span>
          </div>
          <Progress value={goalAchievementRate} className="h-2" />
          <div className="text-sm text-muted-foreground mt-2">
            {Math.round(goalAchievementRate)}% van doelen voltooid
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-lg font-medium mb-2">{insights.motivationalMessage}</div>
          <div className="text-sm text-muted-foreground">
            Blijf je progressie tracken en jezelf verbeteren.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
