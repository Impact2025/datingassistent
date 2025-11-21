"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, HelpCircle, ShieldCheck, Map, ClipboardList, Target, TrendingUp, User, MessageCircle, Calendar, Brain, Shield, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/providers/user-provider";
import { LearningPath } from "@/components/dashboard/learning-path";
import { SimpleOnboardingCard } from "@/components/dashboard/simple-onboarding-card";

const SAVED_PROFILES_KEY_PREFIX = "datespark_saved_profiles_";

const DATING_TIPS = [
  "Deel nooit direct je adres of financiële gegevens. Spreek de eerste keer af op een openbare plek. Jouw veiligheid staat voorop!",
  "Stel open vragen in je gesprek, zoals 'Wat was het leukste dat je deze week hebt meegemaakt?' in plaats van 'Heb je een leuke week gehad?'. Dit nodigt uit tot een uitgebreider antwoord.",
  "Een goede profielfoto is recent en laat duidelijk je gezicht zien. Een spontane lach doet wonderen!",
  "Houd het positief in je profiel. Focus op wat je leuk vindt en wat je zoekt, in plaats van wat je níet wilt.",
  "Wees geduldig. De juiste connectie vinden kost tijd. Elke interactie is een leermoment, geen mislukking.",
  "Durf specifiek te zijn in je profiel. 'Ik hou van koken' is prima, maar 'Ik probeer elke zondag een nieuw recept uit de Italiaanse keuken' vertelt veel meer over jou.",
  "Het is oké als een gesprek doodloopt. Niet elke match is een voltreffer. Forceer het niet en ga verder.",
  "Stel voor om na een paar dagen chatten te bellen of een videogesprek te voeren. Het geeft een betere indruk dan alleen tekst."
];

interface UserGoal {
  id: number;
  goal_type: string;
  title: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  status: string;
  progress_percentage: number;
}

export function DashboardTab({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { user, userProfile } = useUser();
  const [savedProfilesCount, setSavedProfilesCount] = useState(0);
  const [dailyTip, setDailyTip] = useState("");
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  // Load user goals
  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/goals', {
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
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    // Select a random tip when the component mounts
    // This will run on the client-side to avoid hydration errors
    setDailyTip(DATING_TIPS[Math.floor(Math.random() * DATING_TIPS.length)]);
  }, []);


  useEffect(() => {
    if (user?.id) {
      const key = SAVED_PROFILES_KEY_PREFIX + user.id;
      const saved = localStorage.getItem(key);
      const savedProfiles = saved ? JSON.parse(saved) : [];
      setSavedProfilesCount(savedProfiles.length);
    }

    const handleStorageChange = () => {
        if (user?.id) {
            const key = SAVED_PROFILES_KEY_PREFIX + user.id;
            const saved = localStorage.getItem(key);
            const savedProfiles = saved ? JSON.parse(saved) : [];
            setSavedProfilesCount(savedProfiles.length);
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, [user]);

  // Check if user has taken the skills assessment
  const hasTakenAssessment = userProfile &&
    ((userProfile as any).datingExperience ||
      (userProfile as any).strengths ||
      (userProfile as any).areasForImprovement);

  // Determine user state for personalized workflow
  const isPremium = user?.subscriptionType && user.subscriptionType !== 'free';
  const hasBasicProfile = userProfile && (userProfile.bio || userProfile.interests?.length);
  const hasCompleteProfile = userProfile && userProfile.bio && userProfile.interests?.length && userProfile.location;
  const isNewUser = !hasBasicProfile;

  // Render personalized workflow based on user state
  const renderWorkflowCard = () => {
    if (isNewUser) {
      // New users - focus on profile creation
      const steps = [
        {
          id: 1,
          title: 'Profieltekst Ontwikkelen',
          description: 'Creëer een professionele profieltekst die de aandacht trekt',
          status: 'available',
          icon: 'FileText',
          action: 'profiel-coach',
          actionLabel: 'Start met schrijven'
        },
        {
          id: 2,
          title: 'Fotomateriaal Optimaliseren',
          description: 'Upload en optimaliseer je professionele foto\'s',
          status: 'locked',
          icon: 'Camera',
          action: 'foto-advies',
          actionLabel: 'Foto\'s toevoegen'
        }
      ];

      return (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="text-primary" />
              Welkom! Laten we je profiel opbouwen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Je bent nieuw hier. Volg deze stappen om een professioneel profiel te creëren dat meer matches oplevert.
            </p>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const isLastStep = index === steps.length - 1;
                const IconComponent = step.icon === 'FileText' ? CheckCircle :
                                    step.icon === 'Camera' ? CheckCircle :
                                    CheckCircle;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      step.status === 'available'
                        ? 'bg-background border-primary/20'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center mt-1">
                      <div className="relative">
                        {step.status === 'available' ? (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <IconComponent className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                            <IconComponent className="w-4 h-4" />
                          </div>
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
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.status === 'available' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'available' ? 'Beschikbaar' : 'Vergrendeld'}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {step.status === 'available' && (
                          <Button size="sm" onClick={() => onTabChange?.(step.action)}>
                            {step.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    } else if (!hasCompleteProfile) {
      // Users with basic profile - focus on completion
      const steps = [
        {
          id: 1,
          title: 'Profieltekst Optimaliseren',
          description: 'Verbeter je bestaande tekst voor maximale impact',
          status: 'available',
          icon: 'FileText',
          action: 'profiel-coach',
          actionLabel: 'Optimaliseren'
        },
        {
          id: 2,
          title: 'Fotografie Professionaliseren',
          description: 'Verbeter je foto\'s voor een professionele uitstraling',
          status: 'available',
          icon: 'Camera',
          action: 'foto-advies',
          actionLabel: 'Professionaliseren'
        },
        {
          id: 3,
          title: 'Prestaties Evalueren',
          description: 'Analyseer je voortgang en ontvang strategische inzichten',
          status: 'available',
          icon: 'BarChart3',
          action: 'profiel-analyse',
          actionLabel: 'Evalueren'
        }
      ];

      return (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="text-primary" />
              Maak je profiel compleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Je hebt een basis profiel. Volg deze stappen om het compleet te maken voor betere dating resultaten.
            </p>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const isLastStep = index === steps.length - 1;
                const IconComponent = step.icon === 'FileText' ? CheckCircle :
                                    step.icon === 'Camera' ? CheckCircle :
                                    step.icon === 'BarChart3' ? CheckCircle :
                                    CheckCircle;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      step.status === 'available'
                        ? 'bg-background border-primary/20'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center mt-1">
                      <div className="relative">
                        {step.status === 'available' ? (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <IconComponent className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                            <IconComponent className="w-4 h-4" />
                          </div>
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
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.status === 'available' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'available' ? 'Beschikbaar' : 'Vergrendeld'}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {step.status === 'available' && (
                          <Button size="sm" onClick={() => onTabChange?.(step.action)}>
                            {step.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    } else if (isPremium) {
      // Premium users - advanced optimization
      const steps = [
        {
          id: 1,
          title: 'Geavanceerde Tekst Optimalisatie',
          description: 'Gebruik AI-tools voor professionele profieltekst',
          status: 'available',
          icon: 'Sparkles',
          action: 'profiel-coach',
          actionLabel: 'Optimaliseer tekst'
        },
        {
          id: 2,
          title: 'Professionele Foto Analyse',
          description: 'Diepgaande AI-analyse van je foto\'s',
          status: 'available',
          icon: 'Camera',
          action: 'foto-advies',
          actionLabel: 'Analyseer foto\'s'
        },
        {
          id: 3,
          title: 'Uitgebreide Profiel Analyse',
          description: 'Complete AI-gedreven profielbeoordeling',
          status: 'available',
          icon: 'BarChart3',
          action: 'profiel-analyse',
          actionLabel: 'Uitgebreide analyse'
        }
      ];

      return (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="text-primary" />
              Premium profiel optimalisatie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Als premium gebruiker heb je toegang tot geavanceerde AI-tools voor maximale dating success.
            </p>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const isLastStep = index === steps.length - 1;
                const IconComponent = step.icon === 'Sparkles' ? CheckCircle :
                                    step.icon === 'Camera' ? CheckCircle :
                                    step.icon === 'BarChart3' ? CheckCircle :
                                    CheckCircle;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      step.status === 'available'
                        ? 'bg-background border-primary/20'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center mt-1">
                      <div className="relative">
                        {step.status === 'available' ? (
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <IconComponent className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                            <IconComponent className="w-4 h-4" />
                          </div>
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
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.status === 'available' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'available' ? 'Beschikbaar' : 'Vergrendeld'}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {step.status === 'available' && (
                          <Button size="sm" onClick={() => onTabChange?.(step.action)}>
                            {step.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // Free users with complete profile - limited but useful workflow
      const steps = [
        {
          id: 1,
          title: 'Profiel Analyse',
          description: 'Bekijk je huidige profielscore en tips',
          status: 'available',
          icon: 'BarChart3',
          action: 'profiel-analyse',
          actionLabel: 'Analyseer profiel'
        },
        {
          id: 2,
          title: 'Upgrade naar Premium',
          description: 'Ontgrendel alle AI-tools voor betere resultaten',
          status: 'available',
          icon: 'Star',
          action: 'select-package',
          actionLabel: 'Upgrade nu',
          isUpgrade: true
        }
      ];

      return (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="text-primary" />
              Gratis profiel tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Je hebt een compleet profiel! Upgrade naar premium voor geavanceerde AI-tools en betere resultaten.
            </p>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const isLastStep = index === steps.length - 1;
                const IconComponent = step.icon === 'BarChart3' ? CheckCircle :
                                    step.icon === 'Star' ? CheckCircle :
                                    CheckCircle;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      step.status === 'available'
                        ? step.isUpgrade
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200'
                          : 'bg-background border-primary/20'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center mt-1">
                      <div className="relative">
                        {step.status === 'available' ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                            step.isUpgrade ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-orange-500'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                            <IconComponent className="w-4 h-4" />
                          </div>
                        )}
                        {step.isUpgrade && (
                          <div className="absolute -top-1 -right-1 text-yellow-500">
                            ⭐
                          </div>
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
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.status === 'available'
                            ? step.isUpgrade
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'available' ? 'Beschikbaar' : 'Vergrendeld'}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {step.status === 'available' && (
                          <Button
                            size="sm"
                            className={step.isUpgrade ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' : ''}
                            onClick={() => onTabChange?.(step.action)}
                          >
                            {step.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Jouw Dashboard</h3>
      <p className="text-muted-foreground">
        Welkom bij je persoonlijke dating-cockpit. Begin met de 'Online Cursus' voor een vliegende start, of ga direct aan de slag met de andere tools!
      </p>

      {/* Simple Onboarding Card - Shows only if journey not completed */}
      <SimpleOnboardingCard onTabChange={onTabChange} />

      {/* Personalized Profile Workflow */}
      {renderWorkflowCard()}

      {/* Goals Overview */}
      {!goalsLoading && goals.length > 0 && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary" />
              Jouw Doelen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-4 border rounded-lg bg-background">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-primary/10 rounded">
                        {goal.category === 'profile' ? <User className="w-4 h-4 text-primary" /> :
                         goal.category === 'messages' ? <MessageCircle className="w-4 h-4 text-primary" /> :
                         goal.category === 'dates' ? <Calendar className="w-4 h-4 text-primary" /> :
                         goal.category === 'mindset' ? <Brain className="w-4 h-4 text-primary" /> :
                         goal.category === 'confidence' ? <Shield className="w-4 h-4 text-primary" /> :
                         goal.category === 'attachment' ? <Heart className="w-4 h-4 text-primary" /> :
                         <Target className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{goal.goal_type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Voortgang</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-1.5" />
                    <div className="text-xs text-muted-foreground">
                      {goal.current_value} / {goal.target_value} voltooid
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {goals.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" onClick={() => onTabChange?.('goals')}>
                  Bekijk alle doelen ({goals.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Learning Path Recommendation */}
      {!hasTakenAssessment ? (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="text-primary" />
              Persoonlijk leertraject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Neem eerst de vaardighedenbeoordeling om een persoonlijk leertraject te krijgen dat aansluit op jouw niveau en doelen.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => onTabChange?.('skills-assessment')}>
                Start vaardighedenbeoordeling
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="text-primary" />
              Jouw persoonlijke leertraject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Gebaseerd op je vaardighedenbeoordeling hebben we een leertraject voor je samengesteld.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowLearningPath(!showLearningPath)}>
                {showLearningPath ? 'Verberg leertraject' : 'Bekijk leertraject'}
              </Button>
            </div>
            {showLearningPath && (
              <div className="mt-4">
                <LearningPath />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-secondary/50 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">{savedProfilesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Opgeslagen profielen</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 text-center">
          <CardHeader>
            <CardTitle className="flex justify-center text-3xl font-bold text-destructive">
              <HelpCircle className="h-8 w-8" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Foto analyse check</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 text-center">
          <CardHeader>
            <CardTitle className="flex justify-center text-3xl font-bold text-green-500">
                <CheckCircle className="h-8 w-8" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Platform matchmaker check</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 rounded-lg bg-secondary/50 p-4">
        <h4 className="mb-2 flex items-center font-semibold">
          <ShieldCheck className="mr-2 h-4 w-4 text-green-400" />
          Tip van de coach
        </h4>
        <p className="text-sm text-muted-foreground">
          {dailyTip || "Laden..."}
        </p>
      </div>
    </div>
  );
}