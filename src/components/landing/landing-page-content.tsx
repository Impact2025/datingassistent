'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  User,
  Users,
  MessageCircle,
  Calendar,
  Shield,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Play,
  ArrowRight,
  AlertCircle,
  Target,
  Heart,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { ChatWidgetWrapper } from '@/components/live-chat/chat-widget-wrapper';
import { HeroSection } from '@/components/landing/hero-section';
import { ProgramCards } from '@/components/landing/program-cards';
import { useUser } from '@/providers/user-provider';

type Review = {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
};

type Blog = {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
};

type Plan = {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular: boolean;
};

type LandingPageContentProps = {
  hero?: ReactNode;
};

export function LandingPageContent({ hero }: LandingPageContentProps) {
  const router = useRouter();
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const plans: Plan[] = [
    {
      name: 'Core',
      description: 'Slim starten met AI',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        '50 AI-berichten per week',
        'Profiel Coach – analyseer en verbeter je bio',
        'Chat Coach – 24/7 hulp bij gesprekken',
        'AI Foto Check – feedback op je foto\'s',
        '1 cursus per maand',
        'Voortgang Tracker – zie je groei week na week',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      description: 'Versnel je groei met AI & feedback',
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        '125 AI-berichten per week',
        'Alle tools van Core, plus:',
        'Opener Lab – originele openingszinnen',
        'Match Analyse – waarom wel/niet matches',
        'Date Planner – creatieve date-ideeën',
        '2 cursussen per maand',
        'Prioriteit Support',
        'Maandelijkse AI-profielreview',
      ],
      popular: true,
    },
    {
      name: 'Premium AI',
      description: 'Persoonlijke begeleiding met slimme AI-assistentie',
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        'Alle tools en cursussen direct unlocked',
        '250 AI-berichten per week',
        'Persoonlijke intake (45 minuten video)',
        'Persoonlijk verbeterplan op maat',
        '3 Coach Check-ins (chat of voice)',
        'Voortgangsrapporten en AI-feedback',
        'Exclusieve AI-tools (Personality Match, Voice Chat)',
      ],
      popular: false,
    },
    {
      name: 'Premium Plus',
      description: 'De complete persoonlijke datingtransformatie',
      monthlyPrice: 2490,
      yearlyPrice: 2490,
      features: [
        'Alles uit Premium AI Coaching',
        'Live startgesprek van 2 uur met jouw coach',
        '4 extra 1-op-1 sessies van 60 minuten',
        'Persoonlijke fotoshoot met professionele fotograaf',
        'Feedback op profiel, gesprekken en dates',
        'Wekelijkse persoonlijke begeleiding en evaluaties',
        'Nazorggesprek na afronding',
      ],
      popular: false,
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews?limit=6&published=true');
        if (response.ok) {
          // Safe JSON parsing - handle empty or malformed responses
          const text = await response.text();
          if (text && text.trim() !== '') {
            try {
              const data = JSON.parse(text);
              if (Array.isArray(data) && data.length > 0) {
                setReviews(data);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing reviews JSON:', parseError);
            }
          }
        }
        // Fallback to default reviews if API fails or returns empty
        setReviews([
            {
              id: 1,
              name: 'Jasmine Vermeer',
              role: 'Lid sinds september 2025',
              content: '',
              rating: 5,
              avatar: 'https://placehold.co/100x100/ec4899/fff?text=JV',
            },
            {
              id: 2,
              name: 'Kevin Pieters',
              role: 'Lid sinds september 2025',
              content: '',
              rating: 5,
              avatar: 'https://placehold.co/100x100/3b82f6/fff?text=KP',
            },
            {
              id: 3,
              name: 'Lisa Chen',
              role: 'Lid sinds september 2025',
              content: '',
              rating: 5,
              avatar: 'https://placehold.co/100x100/8b5cf6/fff?text=LC',
            },
          ]);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?type=latest&limit=3');

        if (response.ok) {
          // Safe JSON parsing - handle empty or malformed responses
          const text = await response.text();
          if (text && text.trim() !== '') {
            try {
              const posts = JSON.parse(text);
              if (Array.isArray(posts)) {
                const mappedBlogs = posts.map((post: any, index: number) => ({
                  id: index + 1,
                  title: post.title,
                  excerpt: post.excerpt,
                  slug: post.slug,
                  featured_image: post.featured_image,
                }));
                setBlogs(mappedBlogs);
                setBlogsError(null);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing blogs JSON:', parseError);
            }
          }
        }
        setBlogsError('Kan blogs momenteel niet laden. Probeer het later opnieuw.');
      } catch (error) {
        setBlogsError('Er trad een fout op tijdens het laden van blogs.');
      }
    };

    fetchReviews();
    fetchBlogs();
  }, [isClient]);

  const handleCheckout = (planName: string) => {
    const planMapping: Record<string, string> = {
      Core: 'core',
      Pro: 'pro',
      'Premium AI': 'premium',
      'Premium Plus': 'premium',
    };

    const packageType = planMapping[planName] || planName.toLowerCase();

    if (packageType !== 'free' && packageType !== 'gratis') {
      router.push(`/register?plan=${packageType}&billing=yearly&redirect_after_payment=true`);
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {hero ?? <HeroSection />}

      <section id="tools" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Los elk obstakel op in je dating journey</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Van "waarom krijg ik geen matches?" tot "hoe houd ik het gesprek gaande?"—AI die snapt waar je zit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">Profiel Coach</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Nooit meer raden wat werkt</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  AI analyseert foto's, bio en selectie. Krijg 7-12 concrete verbeteringen → gemiddeld 3x meer matches binnen 48 uur
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">24/7 Chat Coach</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Weet altijd wat je moet zeggen</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Match krijgen? Check. Gesprek doodlopen? Never again. Real-time suggesties gebaseerd op context
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">Opener Lab</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Stop met "Hey, hoe gaat ie?"</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Originele openingszinnen op basis van hun profiel. 64% respons rate vs 12% met standaard openers
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">Match Analyse</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Begrijp wie past bij jou</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  AI vergelijkt profielen en voorspelt compatibiliteit. Focus op matches met potentie, bespaar tijd
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <Play className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">AI Foto Check</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Professionele feedback in seconden</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Upload foto → AI geeft score + verbeterpunten. Welke foto's werken? Welke weg? Data-driven keuzes
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">Date Planner</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Van "koffie?" naar onvergetelijk</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  AI bedenkt creatieve date-ideeën op basis van jullie interesses. Inclusief gesprekstarters
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">Voortgang Tracker</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Zie je groei week na week</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Track matches, gesprekken, dates. Zie wat werkt en leer van je successen
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900">Veiligheid Check</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Date veilig, date slim</strong>
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  AI herkent rode vlaggen en catfish signalen. Dating tips voor veilige eerste dates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Van profiel tot date in 3 simpele stappen</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Geen ingewikkelde trucs. Gewoon concrete hulp bij elke stap
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border-2 border-pink-200 hover:border-pink-300 hover:shadow-xl transition-all space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">5 minuten</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">Optimaliseer je profiel</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>✓ Upload 3-5 foto's</p>
                    <p>✓ AI geeft instant feedback</p>
                    <p>✓ Pas 3 dingen aan</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-pink-600">
                      → Je profiel scoort nu 8.2/10 vs 4.3 gemiddeld
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-pink-300 to-transparent -translate-x-4"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-300 hover:shadow-xl transition-all space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Week 1-2</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">Start gesprekken</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>✓ Krijg matches</p>
                    <p>✓ Chat Coach helpt bij elk bericht</p>
                    <p>✓ Plan je eerste date</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-blue-600">
                      → 78% heeft date binnen 14 dagen bij actief gebruik
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-x-4"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 hover:border-purple-300 hover:shadow-xl transition-all space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Doorlopend</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">Blijf groeien</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>✓ Volg 21-dagen programma's</p>
                    <p>✓ Leer advanced dating skills</p>
                    <p>✓ Word de beste versie van jezelf</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-purple-600">
                      → Blijvende resultaten, niet afhankelijk van geluk
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-100">
            <p className="text-gray-700 mb-6 text-lg">
              <strong>Klaar om te beginnen?</strong> Het kost letterlijk 60 seconden om je account aan te maken
            </p>
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg">
                Start gratis →
              </Button>
            </Link>
            <p className="text-sm text-gray-600 mt-4">
              ✓ Geen creditcard nodig • ✓ Direct toegang • ✓ 30 dagen geld-terug garantie
            </p>
          </div>
        </div>
      </section>

      {/* Quiz Section - Logout Page Style */}
      <section className="py-24 px-4 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Main Card */}
          <Card className="border-2 border-pink-200 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              {/* Title */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Ontdek je Dating Stijl
                </h2>
                <p className="text-lg text-gray-600">
                  AI-analyse van je gedrag met direct persoonlijk actieplan
                </p>
              </div>

              {/* Quick Stats - 3 colored boxes */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                  <p className="text-xs text-gray-600">Persoonlijkheid</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Target className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-gray-600">Valkuilen</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-gray-600">Actieplan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards - 2 column grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Quiz Card */}
            <Card className="border-2 hover:border-pink-300 transition-all cursor-pointer hover:shadow-lg">
              <Link href="/quiz">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Start de Quiz
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Ontdek jouw dating stijl in 2 minuten
                  </p>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                    Gratis Analyse
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Register Card */}
            <Card className="border-2 hover:border-purple-300 transition-all cursor-pointer hover:shadow-lg">
              <Link href="/register">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Direct Beginnen
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Maak gratis een account aan
                  </p>
                  <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50">
                    Registreren
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Footer text */}
          <div className="text-center text-sm text-gray-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-pink-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>27 mensen deze week</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Dating tips & advies</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Ontdek inspirerende verhalen van onze experts</p>
          </div>

          {blogsError ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-200">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 text-sm">{blogsError}</p>
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="block group">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-pink-200 hover:shadow-lg transition-all h-full">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={blog.featured_image || '/images/hero-dating.jpg.png'}
                        alt={blog.title || 'Dating blog article'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-400">5 min lezen</span>
                        <span className="text-sm text-pink-500 group-hover:translate-x-1 transition-transform">Lees meer →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/blog">
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-6 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl">
                Bekijk alle blogs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="programmas" className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900">
              Kies jouw programma
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transformeer je dating leven met persoonlijke AI-coaching
            </p>
          </div>

          {/* Program Cards */}
          <ProgramCards />

          {/* Simple guarantee */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-medium">30 dagen geld-terug garantie</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Van pionier in 2009 tot jouw AI-coach vandaag</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Het begon in 2009, toen ik de eerste datingsite lanceerde voor mensen met een beperking. Ik zag hoe groot de behoefte aan goede begeleiding was, wat in 2014 leidde tot de start van DatingAssistent.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Als coach (ook bekend van TV-programma <strong>The Undateables</strong>) heb ik met trots en plezier honderden mensen 1-op-1 geholpen. Het probleem? Ik kon maar 5-10 mensen per maand begeleiden. Bovendien is persoonlijke coaching (€150/uur) simpelweg niet voor iedereen betaalbaar.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed font-medium">
                  Daarom bouwde ik deze AI-versie van mezelf:
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Al mijn kennis uit 10+ jaar praktijkervaring, direct toepasbaar.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Geen €150 per uur, maar €147 voor 3 maanden onbeperkt advies.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>24/7 beschikbaar, precies op het moment dat jij het nodig hebt.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
                <p className="text-gray-800 leading-relaxed italic">
                  "De missie blijft sinds 2014 onveranderd: Jouw datingleven makkelijker en succesvoller maken, zonder dat je er failliet aan gaat."
                </p>
                <p className="text-sm text-gray-600 mt-3 font-medium">
                  — Vincent van Munster, Oprichter
                </p>
              </div>

              <div className="pt-4">
                <Link href="/register">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold">
                    Start je transformatie gratis →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 text-center flex items-center justify-center col-span-2">
                  <Image
                    src="/images/Vincent van Munster.png"
                    alt="Vincent van Munster - Oprichter DatingAssistent"
                    width={160}
                    height={160}
                    className="rounded-2xl object-cover"
                    priority
                  />
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center flex flex-col justify-center">
                  <div className="text-lg font-bold text-pink-500 mb-2">Bekend van</div>
                  <div className="text-sm text-gray-600 font-medium">The Undateables</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">2009</div>
                  <div className="text-sm text-gray-600">Sinds</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">10+</div>
                  <div className="text-sm text-gray-600">Jaar expertise</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Beschikbaar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Gratis: Ontdek je Dating Stijl</h2>
          </div>

          {/* Simple member display */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="flex items-center gap-3 bg-white rounded-full px-6 py-3 border-2 border-pink-200 shadow-sm">
                <Image className="w-10 h-10 rounded-full ring-2 ring-pink-100" src={review.avatar} alt={review.name} width={40} height={40} loading="lazy" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-5xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Veelgestelde vragen</h3>
              <p className="text-gray-500">Alle antwoorden om je laatste twijfels weg te nemen</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pricing & Value */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">💳 Is DatingAssistent echt gratis?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ja! Je kunt gratis starten zonder creditcard. Je krijgt toegang tot basis tools zoals de Profiel Coach en beperkte Chat Coach berichten. Upgrade naar Pro (€39/maand) wanneer je meer wilt.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">💰 Is de investering het waard?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  De gemiddelde gebruiker bespaart 15+ uur per maand door gerichte hulp vs. zelf uitproberen. Plus: kwaliteit over kwantiteit betekent minder tijdverspilling aan verkeerde matches. Veel gebruikers zeggen dat één goede date de investering al waard was.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">🔄 Kan ik opzeggen wanneer ik wil?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Absoluut! Geen langdurige contracten. Opzeggen kan met één klik in je account settings. Je hebt toegang tot je betaalde features tot het einde van je betaalperiode.
                </p>
              </div>

              {/* Effectiveness */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">⏱️ Hoe snel zie ik resultaten?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Profiel verbeteringen zie je binnen 48 uur (meer matches). Betere gesprekken starten binnen 1 week. Voor de meeste gebruikers: eerste betekenisvolle date binnen 2-4 weken bij actief gebruik.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">🤔 Werkt dit ook als ik weinig/geen matches krijg?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Juist dan! Onze Profiel Coach analyseert precies waarom je geen matches krijgt (foto's, bio, selectie) en geeft concrete verbeteringen. 78% van gebruikers met minder dan 5 matches/maand komt uit op 15+ matches na profiel optimalisatie.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">📱 Voor welke dating apps werkt het?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Alle! Tinder, Bumble, Hinge, Lexa, Relatieplanet, etc. Onze tips zijn platform-onafhankelijk omdat het gaat om menselijke psychologie, niet om app-specifieke trucjes.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">🤖 Is dit niet gewoon een algemene chatbot?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nee! DatingAssistent gebruikt context-aware AI gebaseerd op 10 jaar coaching ervaring. De AI ziet je profiel, je match's profiel, en gesprekscontext. Het geeft specifieke suggesties, geen algemene "wees jezelf" adviezen.
                </p>
              </div>

              {/* Privacy & Trust */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">🔒 Is mijn data veilig?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  100%. We gebruiken SSL encryptie, opslaan geen gevoelige persoonlijke data langer dan nodig, en verkopen nooit je informatie. GDPR-compliant en gehost in Nederland.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">👀 Zien anderen dat ik een dating coach gebruik?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nee, niemand ziet dat je DatingAssistent gebruikt. De suggesties die je krijgt zijn jouw eigen woorden—wij helpen je alleen om authentiek én aantrekkelijk over te komen.
                </p>
              </div>

              {/* Target Audience */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">👤 Ben ik te oud/jong voor DatingAssistent?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Onze gebruikers zijn van 18-65+. De meeste tips zijn leeftijd-onafhankelijk. Wel: onze tone of voice en voorbeelden zijn het meest gericht op 25-45 jaar.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">🏳️‍🌈 Werkt dit ook voor LGBTQ+ dating?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ja! Onze AI is getraind op diverse dating scenario's. Of je nu man, vrouw, non-binair bent of op zoek naar welke gender dan ook—de principes van goede communicatie zijn universeel.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-3">⚡ Heb ik technische kennis nodig?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nee! Als je een dating app kunt gebruiken, kun je DatingAssistent gebruiken. Simpele interface, geen installatie, werkt in je browser én als app.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/faq" className="text-pink-500 hover:text-pink-600 font-medium transition-all inline-flex items-center gap-2">
                Bekijk alle 20+ veelgestelde vragen →
              </Link>
            </div>
          </div>

          {/* Start vandaag - Logout page style */}
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Main Card */}
            <Card className="border-2 border-pink-200 shadow-xl">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-gray-900">
                    Stop met wachten. Start met groeien.
                  </h3>
                </div>

                {/* Quick Stats - 3 colored boxes */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <Heart className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                    <p className="text-xs text-gray-600">Gratis starten</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                    <p className="text-xs text-gray-600">Direct toegang</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-xs text-gray-600">30 dagen garantie</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Cards - 2 column grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Quiz Card */}
              <Card className="border-2 hover:border-pink-300 transition-all cursor-pointer hover:shadow-lg">
                <Link href="/quiz">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Doe de Quiz
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Ontdek je dating stijl
                    </p>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                      Gratis Starten
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              {/* Register Card */}
              <Card className="border-2 hover:border-purple-300 transition-all cursor-pointer hover:shadow-lg">
                <Link href="/register">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Direct Beginnen
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Maak gratis een account
                    </p>
                    <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50">
                      Registreren
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
      {/* Only show BottomNavigation for logged-in users */}
      {user && <BottomNavigation />}
      <CookieConsentBanner />

      {/* Chat Widget - Only show for non-registered visitors (no proactive invite) */}
      {!user && (
        <ChatWidgetWrapper
          apiUrl="/api/chatbot"
          position="bottom-right"
          primaryColor="#E14874"
          companyName="DatingAssistent"
          welcomeMessage="Hoi! 👋 Heb je vragen over DatingAssistent? Ik help je graag!"
          enableProactiveInvites={false}
          agentName="Support"
        />
      )}
    </div>
  );
}

