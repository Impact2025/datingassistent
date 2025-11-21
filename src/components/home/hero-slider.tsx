'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Zap,
  Play,
  Award,
  Users,
  MessageCircle,
  User,
  Heart,
  Shield,
  Calendar,
  TrendingUp,
  Sparkles,
  Bot,
  Target,
  Star
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  stats: { value: string; label: string }[];
  cta: { text: string; link: string };
  image?: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: '10+ Jaar Ervaring',
    subtitle: 'Professioneel Daten met AI Coaching',
    description: 'Sinds 2013 helpen we duizenden mensen succesvol te daten. Nu gecombineerd met AI voor de ultieme dating ervaring.',
    icon: Award,
    gradient: 'from-blue-600 via-purple-600 to-pink-600',
    stats: [
      { value: '25K+', label: 'Gebruikers' },
      { value: '89%', label: 'Meer matches' },
      { value: '24/7', label: 'AI support' }
    ],
    cta: { text: 'Start Gratis - 14 Dagen Pro', link: '/register?plan=core&billing=yearly' }
  },
  {
    id: 2,
    title: 'AI Chat Coach',
    subtitle: 'Nooit meer alleen tijdens gesprekken',
    description: 'Realtime advies tijdens je dating gesprekken. 250 berichten per week - altijd de juiste woorden vinden.',
    icon: MessageCircle,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    stats: [
      { value: '250', label: 'Berichten/week' },
      { value: '24/7', label: 'Beschikbaar' },
      { value: '95%', label: 'Succesrate' }
    ],
    cta: { text: 'Probeer Chat Coach', link: '/register?plan=premium&billing=yearly' }
  },
  {
    id: 3,
    title: 'Profiel Optimalisatie',
    subtitle: 'Van onzichtbaar naar onweerstaanbaar',
    description: 'AI-gedreven profiel analyse en foto checks. Verhoog je matches met 89% door professionele optimalisatie.',
    icon: User,
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    stats: [
      { value: '50', label: 'Foto checks' },
      { value: '15', label: 'Bio rewrites' },
      { value: '89%', label: 'Meer matches' }
    ],
    cta: { text: 'Optimaliseer Profiel', link: '/register?plan=premium&billing=yearly' }
  },
  {
    id: 4,
    title: 'Veiligheid & Red Flags',
    subtitle: 'Jouw veiligheid staat voorop',
    description: 'AI detecteert rode vlaggen en waarschuwt voor risico\'s. 50 veiligheid checks per dag voor zorgeloos daten.',
    icon: Shield,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    stats: [
      { value: '50', label: 'Checks/dag' },
      { value: '100%', label: 'Privacy' },
      { value: '24/7', label: 'Bescherming' }
    ],
    cta: { text: 'Veilig Daten', link: '/register?plan=premium&billing=yearly' }
  },
  {
    id: 5,
    title: 'Complete Toolkit',
    subtitle: '10 professionele dating tools',
    description: 'Van icebreakers tot date planning - alles wat je nodig hebt voor dating succes in één platform.',
    icon: Sparkles,
    gradient: 'from-cyan-500 via-blue-500 to-purple-500',
    stats: [
      { value: '10+', label: 'AI Tools' },
      { value: '100', label: 'Per dag' },
      { value: '∞', label: 'Cursussen' }
    ],
    cta: { text: 'Ontdek Alle Tools', link: '/register?plan=premium&billing=yearly' }
  }
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const nextSlide = () => {
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying]);

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-pink-500/10">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Animated */}
          <div
            key={`content-${currentSlide}`}
            className="text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-primary/20 shadow-lg">
              <Icon className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
                10+ Jaar Ervaring • AI-Powered • 25K+ Gebruikers
              </span>
            </div>

            {/* Title with Gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent animate-in fade-in duration-500 delay-100`}>
                {slide.title}
              </span>
              <br />
              <span className="text-foreground animate-in fade-in duration-500 delay-200">
                {slide.subtitle}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-in fade-in duration-500 delay-300">
              {slide.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start animate-in fade-in duration-500 delay-400">
              <Link href={slide.cta.link}>
                <Button size="lg" className={`px-8 py-6 text-lg bg-gradient-to-r ${slide.gradient} hover:opacity-90 transition-opacity shadow-xl w-full sm:w-auto`}>
                  <Zap className="w-5 h-5 mr-2" />
                  {slide.cta.text}
                </Button>
              </Link>
              <Link href="#tools">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-2 hover:bg-primary/10 w-full sm:w-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Bekijk Tools
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 animate-in fade-in duration-500 delay-500">
              {slide.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Interactive Card */}
          <div
            key={`card-${currentSlide}`}
            className="relative animate-in fade-in slide-in-from-right-8 duration-700"
          >
            {/* Floating Success Cards */}
            <div className="absolute -top-4 -left-4 z-10 animate-bounce">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl p-3 border border-primary/20 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{slide.stats[0].value}</div>
                    <div className="text-xs text-muted-foreground">{slide.stats[0].label}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 z-10 animate-bounce delay-700">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl p-3 border border-primary/20 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">4.9/5.0</div>
                    <div className="text-xs text-muted-foreground">Beoordeling</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Card */}
            <div className={`relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${slide.gradient} p-1`}>
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[22px] p-8 flex flex-col justify-between">
                {/* Card Header */}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${slide.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">DatingAssistent AI</h3>
                    <p className="text-sm text-muted-foreground">Jouw persoonlijke coach</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 my-6">
                  <div className="bg-muted p-4 rounded-2xl rounded-bl-sm">
                    <p className="text-sm">"Hoe kan ik mijn dating profiel verbeteren?"</p>
                  </div>
                  <div className={`bg-gradient-to-r ${slide.gradient} p-4 rounded-2xl rounded-br-sm`}>
                    <p className="text-sm text-white">"{slide.description.substring(0, 80)}..."</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className={`flex-1 py-3 px-4 rounded-xl bg-gradient-to-r ${slide.gradient} text-white font-medium text-sm hover:opacity-90 transition-opacity`}>
                    <Bot className="w-4 h-4 inline mr-2" />
                    Start Chat
                  </button>
                  <button className="flex-1 py-3 px-4 rounded-xl border-2 border-primary/20 font-medium text-sm hover:bg-primary/5 transition-colors">
                    <Target className="w-4 h-4 inline mr-2" />
                    Meer Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center mt-12 gap-4">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-primary/20 hover:border-primary shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Progress Indicators */}
          <div className="flex gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? `w-12 h-3 bg-gradient-to-r ${slide.gradient}`
                    : 'w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-primary/20 hover:border-primary shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Auto-play Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`ml-2 w-12 h-12 rounded-full border-2 shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
              isAutoPlaying
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-gray-800 border-primary/20 hover:border-primary'
            }`}
            aria-label={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4">
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} / {SLIDES.length}
          </span>
        </div>
      </div>
    </section>
  );
}
