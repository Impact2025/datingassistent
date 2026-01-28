"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Flame,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  MessageCircle,
  Heart,
  Star
} from "lucide-react";

interface DailyEngagementProps {
  userId: number;
  onEngagementComplete?: (type: string, response: any) => void;
}

interface EngagementItem {
  id: string;
  type: 'morning_motivation' | 'evening_checkin' | 'progress_reminder' | 'success_celebration' | 'streak_milestone';
  title: string;
  message: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  icon: any;
  color: string;
  completed: boolean;
  response?: string;
}

export function DailyEngagement({ userId, onEngagementComplete }: DailyEngagementProps) {
  const [engagements, setEngagements] = useState<EngagementItem[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalEngagements: 0,
    engagementRate: 0
  });

  useEffect(() => {
    loadDailyEngagements();
    loadUserStats();
  }, [userId]);

  const loadDailyEngagements = async () => {
    // Simulate loading engagements - in real implementation, this would call the API
    const mockEngagements: EngagementItem[] = [
      {
        id: 'morning-1',
        type: 'morning_motivation',
        title: '🌅 Goedemorgen Kampioen!',
        message: 'Nieuwe dag, nieuwe kansen! Wat is één kleine stap die je vandaag gaat zetten om dichter bij je dating doelen te komen?',
        timeOfDay: 'morning',
        icon: Sun,
        color: 'bg-yellow-500',
        completed: false
      },
      {
        id: 'progress-1',
        type: 'progress_reminder',
        title: '⏰ Tijd voor Actie',
        message: 'Je doelen wachten op je. Wat ga je vandaag doen om momentum op te bouwen?',
        timeOfDay: 'afternoon',
        icon: Clock,
        color: 'bg-blue-500',
        completed: false
      },
      {
        id: 'evening-1',
        type: 'evening_checkin',
        title: '🌙 Avond Reflectie',
        message: 'Hoe was je dag? Welke kleine winst heb je vandaag behaald in je dating journey?',
        timeOfDay: 'evening',
        icon: Moon,
        color: 'bg-purple-500',
        completed: false
      }
    ];

    setEngagements(mockEngagements);
  };

  const loadUserStats = async () => {
    // Simulate loading stats - in real implementation, this would call the API
    setStats({
      currentStreak: 5,
      longestStreak: 12,
      totalEngagements: 47,
      engagementRate: 78.5
    });
  };

  const handleEngagementResponse = async (engagementId: string, response: string) => {
    if (!response.trim()) return;

    // Update local state
    setEngagements(prev =>
      prev.map(eng =>
        eng.id === engagementId
          ? { ...eng, completed: true, response: response.trim() }
          : eng
      )
    );

    // Call completion handler
    const engagement = engagements.find(e => e.id === engagementId);
    if (engagement && onEngagementComplete) {
      onEngagementComplete(engagement.type, { response: response.trim() });
    }

    // Reset response state
    setCurrentResponse('');
    setRespondingTo(null);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Goedemorgen';
    if (hour < 18) return 'Goedemiddag';
    return 'Goedenavond';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Elke expert was ooit een beginner",
      "Voortgang > Perfectie",
      "Kleine stappen, grote resultaten",
      "Jouw toekomstige zelf rekent op je",
      "Consistentie verslaat talent"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-coral-25 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {getTimeBasedGreeting()}! 👋
          </h1>
          <p className="text-lg text-gray-600 italic">
            "{getMotivationalQuote()}"
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Jouw Voortgang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600">{stats.currentStreak}</span>
                  </div>
                  <p className="text-sm text-gray-600">Huidige Streak</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-600">{stats.longestStreak}</span>
                  </div>
                  <p className="text-sm text-gray-600">Langste Streak</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{stats.totalEngagements}</span>
                  </div>
                  <p className="text-sm text-gray-600">Totaal Actief</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Heart className="w-5 h-5 text-coral-500" />
                    <span className="text-2xl font-bold text-coral-600">{stats.engagementRate}%</span>
                  </div>
                  <p className="text-sm text-gray-600">Betrokkenheid</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Week Voortgang</span>
                  <span className="text-sm text-gray-600">5/7 dagen</span>
                </div>
                <Progress value={71} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Engagements */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Vandaag's Check-ins
          </h2>

          <AnimatePresence>
            {engagements.map((engagement, index) => (
              <motion.div
                key={engagement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-0 shadow-lg transition-all duration-300 ${
                  engagement.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white/90 backdrop-blur-sm hover:shadow-xl'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${engagement.color} flex-shrink-0`}>
                        <engagement.icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {engagement.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {engagement.message}
                            </p>
                          </div>

                          {engagement.completed && (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                          )}
                        </div>

                        {engagement.completed ? (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 italic">
                              "{engagement.response}"
                            </p>
                          </div>
                        ) : respondingTo === engagement.id ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            <Textarea
                              placeholder="Deel je gedachten..."
                              value={currentResponse}
                              onChange={(e) => setCurrentResponse(e.target.value)}
                              className="min-h-[80px] resize-none"
                              maxLength={300}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEngagementResponse(engagement.id, currentResponse)}
                                disabled={!currentResponse.trim()}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              >
                                Verstuur
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRespondingTo(null);
                                  setCurrentResponse('');
                                }}
                              >
                                Annuleren
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRespondingTo(engagement.id)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Reageren
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-coral-500 to-coral-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">
                Klaar voor meer momentum?
              </h3>
              <p className="text-coral-100 mb-4">
                Bekijk je doelen of start een nieuwe challenge
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" className="bg-white text-coral-600 hover:bg-gray-100">
                  📊 Mijn Doelen
                </Button>
                <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  🎯 Nieuwe Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}