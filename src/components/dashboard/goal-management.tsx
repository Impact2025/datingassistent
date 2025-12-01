"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Target,
  Plus,
  CheckCircle,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Star,
  MessageCircle,
  Users,
  User,
  Camera,
  Heart,
  Brain,
  Shield,
  Puzzle
} from 'lucide-react';
import { useUser } from '@/providers/user-provider';

interface UserGoal {
  id: number;
  goal_type: string;
  title: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  status: string;
  priority: number;
  due_date: string;
  progress_percentage: number;
  tool_link?: string;
}

interface GoalManagementProps {
  onTabChange?: (tab: string) => void;
}

export function GoalManagement({ onTabChange }: GoalManagementProps) {
  const { user } = useUser();
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '',
    target_value: 0,
    goal_type: 'monthly'
  });

  useEffect(() => {
    if (user?.id) {
      loadGoals();

    }
  }, [user]);

  // Refresh goals when component mounts or when tab becomes active
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        loadGoals();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const loadGoals = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch(`/api/goals?userId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.category) return;

    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newGoal,
          userId: user?.id
        })
      });

      if (response.ok) {
        setNewGoal({
          title: '',
          description: '',
          category: '',
          target_value: 0,
          goal_type: 'monthly'
        });
        setShowAddGoal(false);
        loadGoals();
      } else {
        const errorData = await response.json();
        console.error('Error adding goal:', errorData);
        alert(`Fout bij toevoegen doel: ${errorData.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Er ging iets mis bij het toevoegen van het doel. Probeer het opnieuw.');
    }
  };

  const updateGoalProgress = async (goalId: number, newValue: number) => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch(`/api/goals/${goalId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          progress_value: newValue
        })
      });

      if (response.ok) {
        loadGoals();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return User;
      case 'messages': return MessageCircle;
      case 'dates': return Calendar;
      case 'mindset': return Brain;
      case 'confidence': return Shield;
      case 'attachment': return Heart;
      default: return Target;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'profile': return 'Profiel';
      case 'messages': return 'Berichten';
      case 'dates': return 'Dates';
      case 'mindset': return 'Mindset';
      case 'confidence': return 'Zelfvertrouwen';
      case 'attachment': return 'Relaties';
      default: return category;
    }
  };

  const monthlyGoals = goals.filter(g => g.goal_type === 'monthly');
  const weeklyGoals = goals.filter(g => g.goal_type === 'weekly');
  const allGoals = goals; // Show all goals regardless of type

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }


  // Check if user has seen goals onboarding
  const hasSeenOnboarding = localStorage.getItem('goals_onboarding_watched');

  return (
    <div className="space-y-6">
      {/* Welcome Section - Only show for new users */}
      {!hasSeenOnboarding && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-pink-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welkom bij je Doelen Dashboard
                </h2>

                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Leer hoe je doelen stelt en je voortgang bijhoudt voor maximale dating success.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Stel Slimme Doelen</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Specifiek, meetbaar en haalbaar - voor echte resultaten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Track Voortgang</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Visualiseer je success en blijf gemotiveerd.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Krijg Ondersteuning</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      AI coach en community staan voor je klaar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Klaar om te beginnen?
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setShowAddGoal(true)}
                    size="lg"
                    className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Start met je Eerste Doel
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      localStorage.setItem('goals_onboarding_watched', 'true');
                      // Force re-render by updating state
                      window.location.reload();
                    }}
                    className="px-8 py-3 border-gray-200 hover:bg-gray-50"
                  >
                    Misschien Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddGoal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nieuw Doel
        </Button>
      </div>

      {/* No Goals Message */}
      {allGoals.length === 0 && !loading && (
        <Card className="bg-secondary/50">
          <CardContent className="p-8 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nog geen doelen ingesteld</h3>
            <p className="text-muted-foreground mb-4">
              Stel je eerste dating doel in om je voortgang bij te houden en gemotiveerd te blijven.
            </p>
            <Button onClick={() => setShowAddGoal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Eerste Doel Toevoegen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Goals - Show all goals regardless of type */}
      {allGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary" />
              Alle Doelen ({allGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {React.createElement(getCategoryIcon(goal.category), {
                          className: "w-6 h-6 text-primary"
                        })}
                      </div>
                      <div>
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{getCategoryLabel(goal.category)}</Badge>
                          <Badge variant="outline" className="capitalize">{goal.goal_type}</Badge>
                          <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                            {goal.status === 'completed' ? 'Voltooid' : 'Actief'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {goal.current_value}/{goal.target_value}
                      </div>
                      <div className="text-sm text-muted-foreground">voltooid</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Voortgang</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                  </div>

                  {goal.status !== 'completed' && (
                    <div className="flex gap-2 mt-3">
                      {goal.tool_link && (
                        <Button
                          size="sm"
                          className="bg-pink-500 hover:bg-pink-600"
                          onClick={() => onTabChange?.(goal.tool_link!)}
                        >
                          Open Tool
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, Math.min(goal.current_value + 1, goal.target_value))}
                      >
                        +1 Voortgang
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateGoalProgress(goal.id, goal.target_value)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Voltooien
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Goals */}
      {monthlyGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary" />
              Maandelijkse Doelen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {React.createElement(getCategoryIcon(goal.category), {
                          className: "w-6 h-6 text-primary"
                        })}
                      </div>
                      <div>
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{getCategoryLabel(goal.category)}</Badge>
                          <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                            {goal.status === 'completed' ? 'Voltooid' : 'Actief'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {goal.current_value}/{goal.target_value}
                      </div>
                      <div className="text-sm text-muted-foreground">voltooid</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Voortgang</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                  </div>

                  {goal.status !== 'completed' && (
                    <div className="flex gap-2 mt-3">
                      {goal.tool_link && (
                        <Button
                          size="sm"
                          className="bg-pink-500 hover:bg-pink-600"
                          onClick={() => onTabChange?.(goal.tool_link!)}
                        >
                          Open Tool
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, Math.min(goal.current_value + 1, goal.target_value))}
                      >
                        +1 Voortgang
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateGoalProgress(goal.id, goal.target_value)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Voltooien
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Goals */}
      {weeklyGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary" />
              Wekelijkse Doelen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {weeklyGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-primary/10 rounded">
                      {React.createElement(getCategoryIcon(goal.category), {
                        className: "w-4 h-4 text-primary"
                      })}
                    </div>
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {goal.current_value}/{goal.target_value} voltooid
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress_percentage} className="w-20 h-2" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateGoalProgress(goal.id, goal.current_value + 1)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Nieuw Doel Toevoegen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Type doel</label>
              <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal(prev => ({ ...prev, goal_type: value }))}>
                <SelectTrigger className="bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Wekelijks</SelectItem>
                  <SelectItem value="monthly">Maandelijks</SelectItem>
                  <SelectItem value="yearly">Jaarlijks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Categorie</label>
              <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Profiel Optimaliseren</SelectItem>
                  <SelectItem value="messages">Berichten Verbeteren</SelectItem>
                  <SelectItem value="dates">Dates Plannen</SelectItem>
                  <SelectItem value="mindset">Mindset Ontwikkelen</SelectItem>
                  <SelectItem value="confidence">Zelfvertrouwen Opbouwen</SelectItem>
                  <SelectItem value="attachment">Relatiepatronen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Titel</label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Bijv: 3 professionele foto's uploaden"
                className="bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Beschrijving</label>
              <Textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Waarom is dit doel belangrijk voor jou?"
                className="bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Doelwaarde (optioneel)</label>
              <Input
                type="number"
                value={newGoal.target_value}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) || 0 }))}
                placeholder="Bijv: 3 (voor 3 foto's)"
                className="bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddGoal} disabled={!newGoal.title || !newGoal.category}>
                Doel Toevoegen
              </Button>
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange?.('community')}>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="font-medium">Deel je voortgang</div>
            <div className="text-sm text-muted-foreground">In de community</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange?.('online-cursus')}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="font-medium">Cursus modules</div>
            <div className="text-sm text-muted-foreground">Gerelateerd aan je doelen</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange?.('chat-coach')}>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="font-medium">AI Coach hulp</div>
            <div className="text-sm text-muted-foreground">Voor je doelen</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}