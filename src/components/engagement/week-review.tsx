"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Flame,
  Star
} from "lucide-react";

interface WeekReviewProps {
  userId: number;
  weekNumber: number;
  onComplete?: () => void;
}

interface WeeklyStats {
  matchesCount: number;
  conversationsCount: number;
  datesCount: number;
  profileUpdates: number;
  consistencyScore: number;
  socialActivityScore: number;
  overallProgressScore: number;
  biggestWin?: string;
  biggestChallenge?: string;
  completedTasks: number;
  totalTasks: number;
  streakDays: number;
  pointsEarned: number;
}

export function WeekReview({ userId, weekNumber, onComplete }: WeekReviewProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Simulated data - in production, fetch from API
  const stats: WeeklyStats = {
    matchesCount: 12,
    conversationsCount: 8,
    datesCount: 1,
    profileUpdates: 3,
    consistencyScore: 85,
    socialActivityScore: 72,
    overallProgressScore: 78,
    biggestWin: "Eerste date gepland! Super gesprek gehad.",
    biggestChallenge: "Soms moeilijk om het gesprek gaande te houden",
    completedTasks: 15,
    totalTasks: 18,
    streakDays: 6,
    pointsEarned: 185
  };

  const taskCompletionRate = (stats.completedTasks / stats.totalTasks) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-300";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-orange-100 text-orange-700 border-orange-300";
  };

  const achievements = [
    { icon: "🔥", title: "6-day Streak", description: "Bijna de hele week actief!" },
    { icon: "💬", title: "Great Conversationalist", description: "8 gesprekken deze week" },
    { icon: "📸", title: "Profile Optimizer", description: "3x profiel verbeterd" },
    { icon: "⭐", title: "185 Points", description: "Top 20% van gebruikers" }
  ];

  const nextWeekGoals = [
    { category: "social", goal: "Plan nog 1 date", icon: "🙋" },
    { category: "practical", goal: "Update bio met nieuwe hobby", icon: "🛠️" },
    { category: "mindset", goal: "Dagelijks 1 compliment geven", icon: "🧠" }
  ];

  const handleSetNewGoals = async () => {
    setLoading(true);
    // In production: save new week goals
    setTimeout(() => {
      setLoading(false);
      if (onComplete) onComplete();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              Week {weekNumber} Review 🎉
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              Je Overall Score: <Badge variant="secondary" className={`text-xl px-3 py-1 ${getScoreBadge(stats.overallProgressScore)}`}>
                {stats.overallProgressScore}/100
              </Badge>
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dit is je eerste week review! Bekijk je vooruitgang en stel nieuwe doelen.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-blue-900">{stats.matchesCount}</div>
              <div className="text-sm text-blue-700">Matches</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold text-green-900">{stats.conversationsCount}</div>
              <div className="text-sm text-green-700">Gesprekken</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-bold text-purple-900">{stats.datesCount}</div>
              <div className="text-sm text-purple-700">Dates</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-3xl font-bold text-orange-900">{stats.streakDays}</div>
              <div className="text-sm text-orange-700">Dagen Streak</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Review Tabs */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Gedetailleerde Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">📊 Overzicht</TabsTrigger>
              <TabsTrigger value="scores">🎯 Scores</TabsTrigger>
              <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
              <TabsTrigger value="reflection">💭 Reflectie</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Taken Voltooid</span>
                    <Badge variant="secondary">{stats.completedTasks}/{stats.totalTasks}</Badge>
                  </div>
                  <Progress value={taskCompletionRate} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    {taskCompletionRate >= 80 ? "🔥 Geweldig!" : taskCompletionRate >= 60 ? "💪 Goed bezig!" : "📈 Blijf doorgaan!"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Punten Verdiend</span>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                      {stats.pointsEarned} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Top 20% van alle gebruikers deze week! 🌟
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Profiel Updates</span>
                    <span className="font-bold text-lg">{stats.profileUpdates}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Je profiel wordt steeds beter! 📸
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Scores Tab */}
            <TabsContent value="scores" className="space-y-4 pt-4">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Consistentie Score</span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(stats.consistencyScore)}`}>
                      {stats.consistencyScore}
                    </span>
                  </div>
                  <Progress value={stats.consistencyScore} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    Je was {stats.streakDays} van de 7 dagen actief. Keep it up!
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Social Activiteit Score</span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(stats.socialActivityScore)}`}>
                      {stats.socialActivityScore}
                    </span>
                  </div>
                  <Progress value={stats.socialActivityScore} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    {stats.conversationsCount} gesprekken is een goede start!
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Overall Vooruitgang</span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(stats.overallProgressScore)}`}>
                      {stats.overallProgressScore}
                    </span>
                  </div>
                  <Progress value={stats.overallProgressScore} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    Sterke eerste week! Je bent op de goede weg. 🚀
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div>
                            <h4 className="font-semibold text-lg">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Reflection Tab */}
            <TabsContent value="reflection" className="space-y-4 pt-4">
              <div className="space-y-6">
                {stats.biggestWin && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      Grootste Win
                    </h3>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <p className="text-gray-800">{stats.biggestWin}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {stats.biggestChallenge && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      Grootste Uitdaging
                    </h3>
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <p className="text-gray-800">{stats.biggestChallenge}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    AI Coach Tip
                  </h3>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-gray-800">
                        Je doet het geweldig met gesprekken starten! Tip voor volgende week:
                        probeer meer open vragen te stellen om het gesprek dieper te maken.
                        Bijvoorbeeld: "Wat is het leukste wat je deze week hebt gedaan?" 💬
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Next Week Goals */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-600" />
            Jouw Doelen voor Week {weekNumber + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextWeekGoals.map((goal, i) => (
            <Card key={i} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{goal.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{goal.goal}</h4>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {goal.category}
                    </Badge>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">
              Klaar voor Week {weekNumber + 1}? 🚀
            </h3>
            <p className="text-purple-100 mb-6">
              Laten we je doelen vastzetten en nog betere resultaten behalen!
            </p>
            <Button
              onClick={handleSetNewGoals}
              disabled={loading}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold"
            >
              {loading ? 'Bezig...' : 'Start Week ' + (weekNumber + 1)}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
