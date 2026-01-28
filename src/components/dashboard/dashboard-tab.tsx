"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User,
  MessageCircle,
  Calendar,
  Camera,
  Heart,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Brain,
  BarChart3,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/providers/user-provider";
import { PersonalizedWelcome } from "@/components/dashboard/personalized-welcome";

// Import interactive components
import { AIConfidenceCoach } from "@/components/quiz/ai-confidence-coach";
import { InteractiveProfileBuilder } from "@/components/interactive/interactive-profile-builder";
import { GamificationSystem } from "@/components/interactive/gamification-system";
import { RealTimeAIFeedback } from "@/components/interactive/real-time-ai-feedback";
import { SocialLearning } from "@/components/interactive/social-learning";
import dynamic from "next/dynamic";

// Dynamic imports for heavy components
const SlideViewer = dynamic(() => import("@/components/slides/slide-viewer"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
      Slides worden geladen…
    </div>
  ),
});

// Import slide data
import { executiveAssessmentSlides } from "@/data/confidence-mastery-slides";

const DATING_TIPS = [
  "Wees geduldig. De juiste connectie vinden kost tijd. Elke interactie is een leermoment.",
  "Stel open vragen in je gesprek voor betere interactie. Dit nodigt uit tot een uitgebreider antwoord.",
  "Een goede profielfoto is recent en laat duidelijk je gezicht zien. Een spontane lach doet wonderen!",
  "Houd het positief in je profiel en focus op wat je zoekt, niet op wat je niet wilt.",
  "Durf specifiek te zijn. 'Ik probeer elke zondag een nieuw recept' vertelt veel meer dan 'Ik hou van koken'."
];

interface UserGoal {
  id: number;
  title: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
}

export function DashboardTab({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { user, userProfile } = useUser();
  const [dailyTip, setDailyTip] = useState("");
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [savedProfilesCount, setSavedProfilesCount] = useState(0);

  useEffect(() => {
    setDailyTip(DATING_TIPS[Math.floor(Math.random() * DATING_TIPS.length)]);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadGoals();
      // Load saved profiles count
      const saved = localStorage.getItem(`datespark_saved_profiles_${user.id}`);
      setSavedProfilesCount(saved ? JSON.parse(saved).length : 0);
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data.slice(0, 3)); // Top 3 goals
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const quickActions = [
    {
      icon: User,
      title: "Jouw profiel",
      description: "Bekijk en optimaliseer",
      action: "profiel-analyse",
      color: "from-coral-500 to-rose-500"
    },
    {
      icon: MessageCircle,
      title: "Gesprek Coach",
      description: "Real-time feedback",
      action: "gesprek-coach",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageCircle,
      title: "Chat coach",
      description: "24/7 hulp bij gesprekken",
      action: "chat-coach",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Calendar,
      title: "Dateplanner",
      description: "Creatieve date ideeën",
      action: "dateplanner",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Camera,
      title: "Foto check",
      description: "Professionele feedback",
      action: "foto-advies",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Heart,
      title: "Vaardigheden",
      description: "Persoonlijke assessment",
      action: "skills-assessment",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: BarChart3,
      title: "Succes Metrics",
      description: "Je voortgang",
      action: "succes-metrics",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Brain,
      title: "Hechtingsstijl Test",
      description: "Ontdek je relatiepatronen",
      action: "hechtingsstijl",
      color: "from-purple-500 to-coral-500"
    },
    {
      icon: Sparkles,
      title: "Dating Stijl Scan",
      description: "Stijl & blinde vlekken",
      action: "datingstijl",
      color: "from-coral-500 to-rose-500"
    },
    {
      icon: BookOpen,
      title: "Cursus",
      description: "Leer en groei",
      action: "online-cursus",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const stats = [
    { label: "Opgeslagen profielen", value: savedProfilesCount.toString(), icon: User },
    { label: "Foto analyse check", value: "?", icon: Camera },
    { label: "Platform matchmaker", value: "✓", icon: CheckCircle },
    { label: "Vaardigheden", value: "?", icon: Heart }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Jouw Dating Succes Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Welkom bij je persoonlijke dating-cockpit. Begin met de 'Online Cursus' voor een vliegende start,
              of ga direct aan de slag met de andere tools!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personalized AI Welcome */}
      <PersonalizedWelcome onTabChange={onTabChange} />

      {/* Learning Path Card */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Jouw persoonlijke leertraject
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Gebaseerd op je vaardighedenbeoordeling hebben we een leertraject voor je samengesteld.
              </p>
              <Button
                onClick={() => onTabChange?.('doelen')}
                size="sm"
                className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Bekijk leertraject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Snelle acties</h2>
            <p className="text-gray-600 dark:text-gray-300">Direct toegang tot je meest gebruikte tools</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {quickActions.slice(0, 8).map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.action}
                  className="cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-700"
                  onClick={() => {
                    console.log('Quick action clicked:', action.action);
                    onTabChange?.(action.action);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tip of the Day */}
      {dailyTip && (
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <Lightbulb className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Tip van de coach
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {dailyTip}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {goals.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Je actieve doelen</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTabChange?.('doelen')}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full"
              >
                Alles bekijken
              </Button>
            </div>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 dark:text-white">{goal.title}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {goal.current_value}/{goal.target_value}
                    </span>
                  </div>
                  <Progress value={goal.progress_percentage} className="h-2 bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Tools Section */}
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Interactieve Tools</h2>
          <p className="text-gray-600 dark:text-gray-300">Ontdek je potentieel met onze professionele hulpmiddelen</p>
        </div>

        {/* AI Confidence Coach */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Confidence Coach</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gepersonaliseerd advies voor je dating zelfvertrouwen</p>
              </div>
            </div>
            <AIConfidenceCoach
              userId={user?.id?.toString()}
              currentModule={1}
              userProfile={userProfile}
              compact={true}
              context="Dashboard - Zelfvertrouwen boost"
            />
          </CardContent>
        </Card>

        {/* Interactive Profile Builder */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Profiel Builder</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Bouw je ideale dating profiel stap voor stap</p>
              </div>
            </div>
            <InteractiveProfileBuilder
              onComplete={(profile, score) => {
                console.log('Profile completed:', profile, 'Score:', score);
              }}
              initialProfile=""
            />
          </CardContent>
        </Card>

        {/* Gamification System */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Voortgang & Punten</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Verdien punten en volg je dating voortgang</p>
              </div>
            </div>
            <GamificationSystem
              userId={user?.id?.toString() || ''}
              courseId="dashboard-gamification"
              onPointsEarned={(points, reason) => {
                console.log(`Earned ${points} points for: ${reason}`);
              }}
            />
          </CardContent>
        </Card>

        {/* Real-time AI Feedback */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Feedback</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Krijg direct feedback op je teksten</p>
              </div>
            </div>
            <RealTimeAIFeedback
              text=""
              onTextChange={() => {}}
              onFeedbackUpdate={(feedback) => {
                console.log('Feedback updated:', feedback);
              }}
            />
          </CardContent>
        </Card>

        {/* Social Learning */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Community Learning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Leer van anderen in de community</p>
              </div>
            </div>
            <SocialLearning
              currentUserId={user?.id?.toString() || ''}
              onReviewSubmitted={(review) => {
                console.log('Review submitted:', review);
              }}
              onProfileShared={(profile) => {
                console.log('Profile shared:', profile);
              }}
            />
          </CardContent>
        </Card>

        {/* Introductory Slides */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Executive Assessment Intro</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Ontdek je sterke punten met deze interactieve presentatie</p>
              </div>
            </div>
            <SlideViewer deck={executiveAssessmentSlides} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
