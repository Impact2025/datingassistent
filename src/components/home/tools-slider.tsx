'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MessageCircle,
  Zap,
  Calendar,
  Heart,
  Shield,
  Bot,
  Sparkles,
  GraduationCap,
  Award,
  Users,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  BookOpen,
  Target,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  features: string[];
  color: string;
  gradient: string;
  popular?: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'profile-assistant',
    name: 'Profiel Assistent',
    description: 'AI-gestuurde profiel optimalisatie voor maximale aantrekkingskracht',
    icon: User,
    category: 'Profiel',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Bio optimalisatie', 'Foto analyse', 'Persoonlijkheid matching', 'SEO voor dating apps'],
    popular: true
  },
  {
    id: 'chat-coach',
    name: 'Chat Coach',
    description: 'Realtime advies tijdens gesprekken voor betere connecties',
    icon: MessageCircle,
    category: 'Communicatie',
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Live chat advies', 'Reactie suggesties', 'Gespreksflow analyse', 'Flirt technieken']
  },
  {
    id: 'opener-lab',
    name: 'Opener Lab',
    description: 'Persoonlijke openingszinnen die écht werken',
    icon: Zap,
    category: 'Communicatie',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-coral-500',
    features: ['AI-gegenereerde openers', 'A/B testing', 'Succes statistieken', 'Stijl aanpassing']
  },
  {
    id: 'date-planner',
    name: 'Date Planner',
    description: 'Originele date ideeën en logistieke planning',
    icon: Calendar,
    category: 'Dating',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-500',
    features: ['Locatie suggesties', 'Activiteit matching', 'Budget planning', 'Veiligheid checks']
  },
  {
    id: 'platform-advisor',
    name: 'Platform Advisor',
    description: 'Vind het perfecte dating platform voor jouw doelgroep',
    icon: Heart,
    category: 'Strategie',
    color: 'text-coral-600',
    gradient: 'from-coral-500 to-rose-500',
    features: ['Platform vergelijking', 'Doelgroep analyse', 'Succes statistieken', 'Migratie hulp']
  },
  {
    id: 'safety-guardian',
    name: 'Safety Guardian',
    description: 'Jouw persoonlijke veiligheidscoach tijdens het daten',
    icon: Shield,
    category: 'Veiligheid',
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-blue-500',
    features: ['Rode vlaggen detectie', 'Veiligheid tips', 'Emergency contact', 'Privacy bescherming']
  },
  {
    id: 'ai-coach',
    name: 'AI Coach',
    description: '24/7 persoonlijke dating mentor met AI technologie',
    icon: Bot,
    category: 'Coaching',
    color: 'text-teal-600',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['Persoonlijk advies', 'Voortgang tracking', 'Motivatie boost', 'Doelen stellen']
  },
  {
    id: 'course-academy',
    name: 'Course Academy',
    description: 'Interactieve cursussen over dating psychologie en technieken',
    icon: GraduationCap,
    category: 'Leren',
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-purple-500',
    features: ['Video lessen', 'Praktische opdrachten', 'Certificaten', 'Community toegang']
  },
  {
    id: 'success-tracker',
    name: 'Success Tracker',
    description: 'Analyseer je dating voortgang met gedetailleerde statistieken',
    icon: TrendingUp,
    category: 'Analytics',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-green-500',
    features: ['Match statistieken', 'Conversatie analyse', 'Succes patronen', 'Verbeterpunten']
  },
  {
    id: 'community-forum',
    name: 'Community Forum',
    description: 'Leer van anderen en deel je ervaringen in onze community',
    icon: Users,
    category: 'Community',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    features: ['Ervaringen delen', 'Tips uitwisselen', 'Ondersteuning', 'Mentorship']
  }
];

export function ToolsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(TOOLS.map(tool => tool.category)))];

  const filteredTools = selectedCategory === 'all'
    ? TOOLS
    : TOOLS.filter(tool => tool.category === selectedCategory);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTools.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, filteredTools.length]);

  const currentTool = filteredTools[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Award className="w-4 h-4" />
          10+ Jaar Ervaring • 25K+ Gebruikers • Bewezen Resultaten
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-coral-600 to-purple-600 bg-clip-text text-transparent">
          🚀 Jouw Complete Dating Toolkit
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Ontdek al onze AI tools: Profiel Assistent, Chat Coach, Opener Lab, Date Planner, Platform Advisor, Safety Guardian, AI Coach, Course Academy, Success Tracker & Community Forum. 10 professionele tools gebaseerd op meer dan 10 jaar ervaring voor jouw dating succes.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory(category);
              setCurrentIndex(0);
            }}
            className="capitalize"
          >
            {category === 'all' ? 'Alle Tools' : category}
          </Button>
        ))}
      </div>

      {/* Main Slider */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Tool Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
              {currentTool.popular && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Populair
                  </Badge>
                </div>
              )}

              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${currentTool.gradient} flex items-center justify-center shadow-lg`}>
                    <currentTool.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{currentTool.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {currentTool.category}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                      {currentTool.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {currentTool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button className="bg-gradient-to-r from-primary to-coral-600 hover:from-primary/90 hover:to-coral-600/90">
                        <Play className="w-4 h-4 mr-2" />
                        Probeer Nu
                      </Button>
                      <Button variant="outline">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Meer Info
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={filteredTools.length <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Vorige
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} van {filteredTools.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                >
                  {isAutoPlaying ? '⏸️' : '▶️'}
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={filteredTools.length <= 1}
              >
                Volgende
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tool Thumbnails */}
          <div className="space-y-4">
            <h4 className="font-semibold text-center">Alle Tools</h4>
            <div className="grid grid-cols-2 gap-3">
              {filteredTools.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={() => goToSlide(index)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    index === currentIndex
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tool.gradient} flex items-center justify-center mx-auto mb-2`}>
                    <tool.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-center leading-tight">
                    {tool.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {filteredTools.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <Card className="bg-gradient-to-r from-primary/10 via-coral-500/5 to-purple-500/10 border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Klaar om te beginnen?</h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start vandaag nog met je dating transformatie. Alle tools zijn direct beschikbaar na registratie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register?plan=core&billing=yearly">
                <Button size="lg" className="bg-gradient-to-r from-primary to-coral-600 hover:from-primary/90 hover:to-coral-600/90">
                  <Target className="w-5 h-5 mr-2" />
                  Start Gratis
                </Button>
              </a>
              <Button size="lg" variant="outline">
                <Lightbulb className="w-5 h-5 mr-2" />
                Bekijk Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}