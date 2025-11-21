"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  Trophy,
  Heart,
  Star,
  Zap,
  Download,
  ArrowRight
} from "lucide-react";
import { generateYearlyReport, YearlyReport } from "@/lib/yearly-report-service";

interface YearlyReviewProps {
  userId: number;
  year: number;
}

interface YearlyStats {
  totalMatches: number;
  totalConversations: number;
  totalDates: number;
  secondDates: number;
  daysActive: number;
  totalDays: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalPointsEarned: number;
  badgesEarned: number;
  goalsAchieved: number;
  profileScore: number;
  topMonths: Array<{
    month: string;
    score: number;
    highlight: string;
  }>;
  growthAreas: Array<{
    area: string;
    improvement: number;
    trend: string;
  }>;
  highlights: string[];
  achievements: Array<{
    title: string;
    icon: string;
    description: string;
  }>;
}

export function YearlyReview({ userId, year }: YearlyReviewProps) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<YearlyReport | null>(null);

  useEffect(() => {
    const loadYearlyReport = async () => {
      try {
        setLoading(true);
        const yearlyReport = await generateYearlyReport(userId, year);
        setReport(yearlyReport);
      } catch (error) {
        console.error('Failed to load yearly report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadYearlyReport();
  }, [userId, year]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Kon jaaroverzicht niet laden.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, insights } = report;
  const consistencyRate = stats.consistencyScore;
  const dateConversionRate = stats.totalDates > 0 ? (stats.secondDates / stats.totalDates) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Jaaroverzicht {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Een overzicht van jouw dating prestaties en groei in {year}.
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <div className="text-sm text-muted-foreground">Matches</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <div className="text-sm text-muted-foreground">Gesprekken</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.totalDates}</div>
            <div className="text-sm text-muted-foreground">Dates</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{stats.consistencyScore}%</div>
            <div className="text-sm text-muted-foreground">Consistentie</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Analyse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Algemene Voortgang</span>
              <Badge variant="secondary">{insights.overallProgress}%</Badge>
            </div>
            <Progress value={insights.overallProgress} className="h-2" />
          </div>

          <p className="text-sm text-muted-foreground">{insights.aiSummary}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Sterke punten</h4>
              <ul className="text-sm space-y-1">
                {insights.strengthAreas.map((area, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Verbeterpunten</h4>
              <ul className="text-sm space-y-1">
                {insights.improvementAreas.map((area, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Areas */}
      {stats.growthAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Groei Gebieden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.growthAreas.map((area, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{area.area}</div>
                    <div className="text-sm text-muted-foreground">{area.trend}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">+{area.improvement}%</div>
                    <TrendingUp className="w-4 h-4 text-green-600 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Score Progress */}
      {(stats.startProfileScore > 0 || stats.endProfileScore > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Profiel Ontwikkeling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Start {year}</div>
                <div className="text-3xl font-bold">{stats.startProfileScore || 0}</div>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Eind {year}</div>
                <div className="text-3xl font-bold">{stats.endProfileScore || 0}</div>
              </div>
            </div>
            {stats.profileImprovement !== 0 && (
              <div className="text-center mt-4">
                <Badge variant="secondary">
                  {stats.profileImprovement > 0 ? '+' : ''}{stats.profileImprovement} punten verbetering
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Highlights */}
      {insights.highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Jaar Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.highlights.map((highlight, i) => (
                <div key={i} className="p-3 border-l-4 border-l-primary bg-muted/50 rounded-r-lg">
                  <p className="text-sm">{highlight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {insights.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prestaties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.achievements.map((achievement, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <div className="font-medium">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Future Goals */}
      {insights.nextYearFocus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Focus voor {year + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.nextYearFocus.map((focus, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm">{focus}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      {insights.motivationalMessage && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-lg font-medium">{insights.motivationalMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3 justify-center">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Rapport
            </Button>
            <Button>
              Doelen voor {year + 1}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

