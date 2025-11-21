"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  Star,
  Award,
  MessageSquare,
  Camera,
  Heart
} from "lucide-react";

interface DailyTask {
  id: number;
  taskTitle: string;
  taskDescription?: string;
  taskCategory: 'social' | 'practical' | 'mindset';
  targetValue: number;
  currentValue: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

interface EngagementData {
  journeyDay: number;
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  weeklyActive: boolean;
}

interface DailyDashboardProps {
  userId: number;
  onTaskComplete?: (taskId: number) => void;
  onCheckIn?: () => void;
}

export function DailyDashboard({ userId, onTaskComplete, onCheckIn }: DailyDashboardProps) {
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagementData();
  }, [userId]);

  const loadEngagementData = async () => {
    try {
      // First get engagement data
      const engagementResponse = await fetch(`/api/engagement/dashboard?userId=${userId}`);
      let engagementData = null;
      if (engagementResponse.ok) {
        const data = await engagementResponse.json();
        engagementData = data.engagement;
        setEngagement(data.engagement);
        setTotalPoints(data.totalPoints || 0);
      }

      // Generate AI-powered tasks
      const journeyDay = engagementData?.journeyDay || 1;
      const taskResponse = await fetch('/api/daily-tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          journeyDay,
          userProfile: null, // Will be fetched by API
          recentActivity: null, // Will be fetched by API
          completedTasks: null // Will be fetched by API
        })
      });

      if (taskResponse.ok) {
        const taskData = await taskResponse.json();
        setTasks(taskData.tasks || []);
      } else {
        // Fallback to basic tasks if AI generation fails
        console.warn('AI task generation failed, using fallback');
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load engagement data:', error);
      // Set empty state on error
      setEngagement(null);
      setTasks([]);
      setTotalPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: number, newValue: number) => {
    try {
      const response = await fetch('/api/engagement/task-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, currentValue: newValue })
      });

      if (response.ok) {
        await loadEngagementData();
        if (onTaskComplete) onTaskComplete(taskId);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return <MessageSquare className="w-5 h-5" />;
      case 'practical': return <Camera className="w-5 h-5" />;
      case 'mindset': return <Heart className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'practical': return 'bg-green-100 text-green-700 border-green-300';
      case 'mindset': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-lg"></div>
        <div className="h-60 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{engagement?.currentStreak || 0}</div>
            <div className="text-sm text-muted-foreground">Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">Dag {engagement?.journeyDay || 1}</div>
            <div className="text-sm text-muted-foreground">Journey</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{completedTasks}/{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Taken</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Punten</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Jouw Taken voor Vandaag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {completedTasks} van {tasks.length} taken voltooid
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {Math.round(completionPercentage)}%
            </Badge>
          </div>
          <Progress value={completionPercentage} className="h-2 mb-6" />

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Geen taken voor vandaag. Kom morgen terug!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {tasks.map((task, index) => {
                  const isCompleted = task.status === 'completed';
                  const progress = task.targetValue > 0 ? (task.currentValue / task.targetValue) * 100 : 0;

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getCategoryColor(task.taskCategory)}`}>
                              {React.createElement(getCategoryIcon(task.taskCategory), {
                                className: "w-5 h-5"
                              })}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.taskTitle}
                              </h4>
                              {task.taskDescription && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {task.taskDescription}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`capitalize ${getCategoryColor(task.taskCategory)}`}>
                                  {task.taskCategory}
                                </Badge>
                                {isCompleted && (
                                  <Badge variant="default" className="bg-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Voltooid
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {task.currentValue}/{task.targetValue}
                            </div>
                            <div className="text-sm text-muted-foreground">voltooid</div>
                          </div>
                        </div>

                        {task.targetValue > 1 && (
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span>Voortgang</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {!isCompleted && (
                          <div className="flex gap-2">
                            {task.targetValue === 1 ? (
                              <Button
                                onClick={() => handleTaskUpdate(task.id, 1)}
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Voltooien
                              </Button>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleTaskUpdate(task.id, task.currentValue + 1)}
                                  size="sm"
                                  variant="outline"
                                  disabled={task.currentValue >= task.targetValue}
                                >
                                  +1 Vooruitgang
                                </Button>
                                {task.currentValue >= task.targetValue && (
                                  <Button
                                    onClick={() => handleTaskUpdate(task.id, task.targetValue)}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Voltooien
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md">
                            <Award className="w-4 h-4" />
                            <span className="font-medium">+10 punten verdiend!</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Check-in CTA for Day 3, 6, 7 */}
          {engagement && [3, 6, 7].includes(engagement.journeyDay) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">
                    {engagement.journeyDay === 3 && "📊"}
                    {engagement.journeyDay === 6 && "📈"}
                    {engagement.journeyDay === 7 && "🎯"}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {engagement.journeyDay === 3 && "Tijd voor je voortgangs-check!"}
                    {engagement.journeyDay === 6 && "Hoe ging deze week?"}
                    {engagement.journeyDay === 7 && "Week 1 Review!"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {engagement.journeyDay === 3 && "Deel hoe het gaat (10 seconden)"}
                    {engagement.journeyDay === 6 && "Kies je gevoel: Goed / OK / Lastig"}
                    {engagement.journeyDay === 7 && "Bekijk je scores en nieuwe doelen"}
                  </p>
                  <Button
                    onClick={onCheckIn}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Start Check-in
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Message */}
      {completionPercentage === 100 && tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold mb-2">
                Geweldig! Alle taken voltooid!
              </h3>
              <p className="text-muted-foreground">
                Je bent on fire vandaag! Kom morgen terug voor nieuwe uitdagingen.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
