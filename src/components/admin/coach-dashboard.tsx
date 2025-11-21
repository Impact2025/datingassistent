"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Calendar,
  Target,
  Brain,
  Shield,
  Heart,
  User,
  BarChart3,
  Bell,
  FileText,
  Star
} from 'lucide-react';

interface ClientData {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  lastActivity: string;
  goalsCompleted: number;
  totalGoals: number;
  riskLevel: 'low' | 'medium' | 'high';
  recentSuccesses: string[];
  pendingNotifications: number;
  monthlyReport?: any;
  weeklyReview?: any;
}

interface CoachNotification {
  id: number;
  userId: number;
  userName: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  createdAt: string;
}

export function CoachDashboard() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [notifications, setNotifications] = useState<CoachNotification[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReports, setGeneratingReports] = useState(false);
  const [runningCronJob, setRunningCronJob] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [sendingEmails, setSendingEmails] = useState<string | null>(null);

  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
    try {
      // Load clients data
      const clientsResponse = await fetch('/api/admin/coach/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      }

      // Load notifications
      const notificationsResponse = await fetch('/api/admin/coach/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReports = async (reportType: string) => {
    setGeneratingReports(true);
    try {
      const response = await fetch('/api/admin/coach/generate-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({ reportType })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Reload data to show new reports/notifications
        loadCoachData();
      } else {
        alert('Fout bij het genereren van rapporten');
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Fout bij het genereren van rapporten');
    } finally {
      setGeneratingReports(false);
    }
  };

  const runCronJob = async (jobType: string) => {
    setRunningCronJob(jobType);
    try {
      const response = await fetch('/api/admin/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({ jobType })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Reload data to show new notifications
        loadCoachData();
      } else {
        const error = await response.json();
        alert(`Fout: ${error.error}`);
      }
    } catch (error) {
      console.error('Error running cron job:', error);
      alert('Fout bij het uitvoeren van cron job');
    } finally {
      setRunningCronJob(null);
    }
  };

  const sendEmails = async (emailType: string) => {
    setSendingEmails(emailType);
    try {
      const response = await fetch('/api/admin/coach/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({ emailType })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        const error = await response.json();
        alert(`Fout: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Fout bij het versturen van emails');
    } finally {
      setSendingEmails(null);
    }
  };

  const generateAnalyticsReport = async () => {
    setGeneratingReports(true);
    try {
      const response = await fetch('/api/admin/coach/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({ action: 'generate-coach-report' })
      });

      if (response.ok) {
        const result = await response.json();
        setAnalyticsData(result.report);
        alert('Analytics rapport succesvol gegenereerd!');
      } else {
        const error = await response.json();
        alert(`Fout bij analytics generatie: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating analytics:', error);
      alert('Fout bij het genereren van analytics');
    } finally {
      setGeneratingReports(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return User;
      case 'messages': return MessageSquare;
      case 'dates': return Calendar;
      case 'mindset': return Brain;
      case 'confidence': return Shield;
      case 'attachment': return Heart;
      default: return Target;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Coach Dashboard</h1>
          <p className="text-muted-foreground">Beheer je cliënten met AI-gedreven inzichten</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {clients.length} Cliënten
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {notifications.length} Notificaties
          </Badge>
        </div>
      </div>

      {/* AI Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">AI Rapporten Genereren</h3>
              <p className="text-sm text-blue-700">
                Genereer automatisch AI-analyses voor al je cliënten
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => generateReports('monthly')}
                disabled={generatingReports}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Maandelijkse Rapporten
              </Button>
              <Button
                onClick={() => generateReports('weekly')}
                disabled={generatingReports}
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Wekelijkse Reviews
              </Button>
              <Button
                onClick={() => generateReports('notifications')}
                disabled={generatingReports}
                variant="outline"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notificaties
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Control */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Email Verzending</h3>
              <p className="text-sm text-purple-700">
                Verstuur AI rapporten en reviews naar je cliënten
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => sendEmails('monthly-reports')}
                disabled={sendingEmails === 'monthly-reports'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                📧 Maandelijkse Rapporten
              </Button>
              <Button
                onClick={() => sendEmails('weekly-reviews')}
                disabled={sendingEmails === 'weekly-reviews'}
                variant="outline"
              >
                📝 Wekelijkse Reviews
              </Button>
            </div>
          </div>
          <div className="mt-4 text-xs text-purple-600">
            💡 Tip: Rapporten worden automatisch verzonden na AI generatie. Gebruik deze knoppen voor handmatige verzending.
          </div>
        </CardContent>
      </Card>

      {/* Cron Jobs Control */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">Automatische Taken</h3>
              <p className="text-sm text-green-700">
                Handmatig uitvoeren van geautomatiseerde AI processen
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => runCronJob('monthly-reports')}
                disabled={runningCronJob === 'monthly-reports'}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                📊 Maandelijks
              </Button>
              <Button
                onClick={() => runCronJob('weekly-reviews')}
                disabled={runningCronJob === 'weekly-reviews'}
                size="sm"
                variant="outline"
              >
                📝 Wekelijks
              </Button>
              <Button
                onClick={() => runCronJob('daily-notifications')}
                disabled={runningCronJob === 'daily-notifications'}
                size="sm"
                variant="outline"
              >
                🔔 Dagelijks
              </Button>
              <Button
                onClick={() => runCronJob('hourly-analysis')}
                disabled={runningCronJob === 'hourly-analysis'}
                size="sm"
                variant="outline"
              >
                🤖 Analyse
              </Button>
              <Button
                onClick={() => runCronJob('weekly-cleanup')}
                disabled={runningCronJob === 'weekly-cleanup'}
                size="sm"
                variant="outline"
              >
                🧹 Opschoning
              </Button>
            </div>
          </div>
          <div className="mt-4 text-xs text-green-600">
            💡 Tip: Deze taken draaien normaal automatisch volgens schema. Gebruik alleen voor testing of handmatige triggers.
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="clients">Cliënten</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
          <TabsTrigger value="reports">Rapporten</TabsTrigger>
          <TabsTrigger value="notifications">Notificaties</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{clients.length}</div>
                    <div className="text-sm text-muted-foreground">Actieve Cliënten</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {clients.reduce((sum, c) => sum + c.goalsCompleted, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Doelen Behaald</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {clients.filter(c => c.riskLevel === 'high').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Hoge Prioriteit</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.goalsCompleted / Math.max(c.totalGoals, 1)), 0) / clients.length * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Gem. Voortgang</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & High Priority */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Priority Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" />
                  Hoge Prioriteit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.filter(c => c.riskLevel === 'high').slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.pendingNotifications} notificaties
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setSelectedClient(client)}>
                        Bekijken
                      </Button>
                    </div>
                  ))}
                  {clients.filter(c => c.riskLevel === 'high').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Geen cliënten met hoge prioriteit 🎉
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Successes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-yellow-500" />
                  Recente Successen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.flatMap(client =>
                    client.recentSuccesses.map((success, idx) => ({
                      clientName: client.name,
                      success,
                      id: `${client.id}-${idx}`
                    }))
                  ).slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{item.clientName}</div>
                        <div className="text-sm text-muted-foreground">{item.success}</div>
                      </div>
                    </div>
                  ))}
                  {clients.flatMap(c => c.recentSuccesses).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nog geen successen deze week
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid gap-4">
            {clients.map((client) => (
              <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getRiskColor(client.riskLevel)} className="flex items-center gap-1">
                            {getRiskIcon(client.riskLevel)}
                            {client.riskLevel}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Laatste activiteit: {new Date(client.lastActivity).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {client.goalsCompleted}/{client.totalGoals}
                      </div>
                      <div className="text-sm text-muted-foreground">doelen voltooid</div>
                      <Progress
                        value={(client.goalsCompleted / Math.max(client.totalGoals, 1)) * 100}
                        className="w-24 h-2 mt-2"
                      />
                    </div>
                  </div>

                  {client.recentSuccesses.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium mb-2">Recente successen:</div>
                      <div className="flex flex-wrap gap-2">
                        {client.recentSuccesses.slice(0, 3).map((success, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {success}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Geavanceerde Analytics</h2>
              <p className="text-muted-foreground">AI-gedreven inzichten en patroonherkenning</p>
            </div>
            <Button
              onClick={() => generateAnalyticsReport()}
              disabled={generatingReports}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Genereer Analytics Rapport
            </Button>
          </div>

          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {analyticsData ? Math.round(analyticsData.averageRiskScore) : '--'}
                    </div>
                    <div className="text-sm text-muted-foreground">Gem. Risico Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData ? Math.round(analyticsData.averageEngagementScore) : '--'}
                    </div>
                    <div className="text-sm text-muted-foreground">Gem. Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData ? Math.round(analyticsData.averageSuccessProbability) : '--'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Succes Kans</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pattern Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary" />
                Gedetecteerde Patronen
              </CardTitle>
              <CardDescription>
                AI-gedreven patroonherkenning in client gedrag en voortgang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData ? (
                  <div className="space-y-4">
                    {analyticsData.clientAnalytics?.map((client: any) => (
                      <div key={client.clientId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{client.clientName}</h4>
                          <div className="flex gap-2">
                            <Badge variant={client.riskScore > 70 ? 'destructive' : client.riskScore > 40 ? 'secondary' : 'default'}>
                              Risico: {client.riskScore}
                            </Badge>
                            <Badge variant="outline">
                              Succes: {Math.round(client.successProbability)}%
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {client.patterns?.slice(0, 2).map((pattern: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{pattern.type}:</span>
                              <div className="flex items-center gap-2">
                                <span>{pattern.pattern}</span>
                                <Badge
                                  variant={
                                    pattern.trend === 'improving' ? 'default' :
                                    pattern.trend === 'declining' ? 'destructive' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {pattern.trend}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        {client.insights?.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm font-medium mb-2">🔍 Belangrijkste Inzichten:</div>
                            <div className="space-y-1">
                              {client.insights.slice(0, 2).map((insight: any, idx: number) => (
                                <div key={idx} className="text-xs text-muted-foreground">
                                  • {insight.title}: {insight.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {analyticsData.aggregatedInsights?.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">📊 Coach Overzicht</h4>
                        <div className="space-y-1">
                          {analyticsData.aggregatedInsights.map((insight: any, idx: number) => (
                            <div key={idx} className="text-sm text-blue-800">
                              • {insight.title}: {insight.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Klik op "Genereer Analytics Rapport" om AI-analyses te starten</p>
                    <p className="text-sm mt-2">Dit analyseert gedragspatronen, voorspelt risico's en geeft inzichten</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-primary" />
                Voorspellende Inzichten
              </CardTitle>
              <CardDescription>
                AI-voorspellingen over client gedrag en resultaten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Succes Voorspellingen</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analyse van welke clients waarschijnlijk hun doelen zullen halen
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Risico Indicatoren</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vroege waarschuwingen voor clients die mogelijk afhaken
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Optimalisatie Suggesties</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Concrete aanbevelingen om resultaten te verbeteren
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Trend Analyse</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Langetermijn ontwikkelingen in client voortgang
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI Prompt Management</h2>
              <p className="text-muted-foreground">Beheer en customize AI prompts voor verschillende doeleinden</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <FileText className="w-4 h-4 mr-2" />
              Nieuwe Prompt
            </Button>
          </div>

          {/* Prompt Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Client Communicatie</div>
                    <div className="text-sm text-muted-foreground">Berichten en gesprekken</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Doel Setting</div>
                    <div className="text-sm text-muted-foreground">Feedback en planning</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Rapporten</div>
                    <div className="text-sm text-muted-foreground">Voortgangsrapporten</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary" />
                Beschikbare Templates
              </CardTitle>
              <CardDescription>
                Kant-en-klare prompt templates die je kunt gebruiken als basis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Motiverend Bericht</h4>
                      <Badge variant="outline">Communicatie</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Persoonlijk motiverend bericht gebaseerd op client voortgang
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Gebruiken</Button>
                      <Button size="sm" variant="outline">Bewerken</Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Doel Feedback</h4>
                      <Badge variant="outline">Doelen</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Constructieve feedback op gestelde doelen
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Gebruiken</Button>
                      <Button size="sm" variant="outline">Bewerken</Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Voortgangsrapport</h4>
                      <Badge variant="outline">Rapporten</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gedetailleerd rapport over client voortgang
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Gebruiken</Button>
                      <Button size="sm" variant="outline">Bewerken</Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Client Assessment</h4>
                      <Badge variant="outline">Assessment</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Beoordeling van client readiness en behoeften
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Gebruiken</Button>
                      <Button size="sm" variant="outline">Bewerken</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="text-primary" />
                Jouw Custom Prompts
              </CardTitle>
              <CardDescription>
                Persoonlijk aangepaste prompts die je hebt gemaakt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Je hebt nog geen custom prompts gemaakt</p>
                <p className="text-sm mt-2">Gebruik een template als basis om je eerste custom prompt te maken</p>
                <Button className="mt-4">Start met Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" />
                Maandelijkse AI Rapporten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Maandelijkse rapporten worden automatisch gegenereerd op de 1e van elke maand.
                <br />
                Hier kun je alle gegenereerde rapporten bekijken en bewerken.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-primary" />
                AI Coach Notificaties ({notifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                          {notification.priority}
                        </Badge>
                        <span className="font-medium">{notification.userName}</span>
                        <Badge variant="outline">{notification.type}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                    <div className="flex gap-2">
                      <Button size="sm">Afhandelen</Button>
                      <Button size="sm" variant="outline">Later</Button>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Geen notificaties 🎉
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}