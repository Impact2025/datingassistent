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
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { ProgramCards } from '@/components/landing/program-cards';
import { FAQSection } from '@/components/landing/faq-section';
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

      {/* Hoe het werkt sectie - targeted by "Of bekijk hoe het werkt" link */}
      <HowItWorksSection />

      {/* Sectie 2: Het Probleem (Agitatie) */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Herken je dit?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Pijn Blok 1: De Match-Droogte */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-xl transition-all space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 text-center">De Match-Droogte</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                Je swipet je een ongeluk, maar de leuke matches blijven uit.
              </p>
            </div>

            {/* Pijn Blok 2: De Gespreks-Dood */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-xl transition-all space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 text-center">De Gespreks-Dood</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                Leuke matches veranderen in penfriends of bloeden dood na &apos;Hoi, hoe is het?&apos;
              </p>
            </div>

            {/* Pijn Blok 3: De 'Situationship' */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-xl transition-all space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 text-center">De &apos;Situationship&apos;</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                Je trekt partners aan die zich niet willen binden of ineens verdwijnen (ghosting).
              </p>
            </div>
          </div>

          {/* Conclusie */}
          <div className="text-center">
            <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-50 max-w-3xl mx-auto">
              Het ligt niet aan jou. Het ligt aan je strategie. En die gaan we samen fixen.
            </p>
          </div>
        </div>
      </section>

      <section id="tools" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Jouw 24/7 Wingman Team</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Van foto-analyse tot gesprekshulp—AI-tools die je direct verder helpen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center group-hover:bg-pink-100 dark:group-hover:bg-pink-900/50 transition-colors">
                <User className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">Profiel Coach</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Nooit meer raden wat werkt</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  AI analyseert foto's, bio en selectie. Krijg 7-12 concrete verbeteringen → gemiddeld 3x meer matches binnen 48 uur
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">24/7 Chat Coach</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Weet altijd wat je moet zeggen</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  Match krijgen? Check. Gesprek doodlopen? Never again. Real-time suggesties gebaseerd op context
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">Opener Lab</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Stop met "Hey, hoe gaat ie?"</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  Originele openingszinnen op basis van hun profiel. 64% respons rate vs 12% met standaard openers
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">Match Analyse</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Begrijp wie past bij jou</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  AI vergelijkt profielen en voorspelt compatibiliteit. Focus op matches met potentie, bespaar tijd
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                <Play className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">AI Foto Check</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Professionele feedback in seconden</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  Upload foto → AI geeft score + verbeterpunten. Welke foto's werken? Welke weg? Data-driven keuzes
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">Date Planner</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Van "koffie?" naar onvergetelijk</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  AI bedenkt creatieve date-ideeën op basis van jullie interesses. Inclusief gesprekstarters
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">Voortgang Tracker</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Zie je groei week na week</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  Track matches, gesprekken, dates. Zie wat werkt en leer van je successen
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-50">Veiligheid Check</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <strong>Date veilig, date slim</strong>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  AI herkent rode vlaggen en catfish signalen. Dating tips voor veilige eerste dates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Van intake tot zelfverzekerde date: Jouw reis</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Geen snelle trucjes, maar een bewezen proces van inzicht, ontwikkeling en resultaat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-pink-200 dark:border-pink-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-xl transition-all space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 px-3 py-1 rounded-full">Het Fundament</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Analyse & Inzicht</h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>✓ Diepte-Intake: We starten met een uitgebreide scan van wie jij bent en wat je zoekt.</p>
                    <p>✓ Blinde Vlekken: AI & video-analyse leggen direct bloot waar het nu misgaat.</p>
                    <p>✓ Profiel Reset: We bouwen een nieuw profiel op basis van data, niet op de gok.</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">
                      Je weet precies wat je valkuilen zijn en hoe je ze fixt.
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-pink-300 to-transparent -translate-x-4"></div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">Actie & Ontwikkeling</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Trainen & Toepassen</h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>✓ Leren door doen: Dagelijkse video's en praktische opdrachten uit je werkboek.</p>
                    <p>✓ 24/7 Begeleiding: Oefen gesprekken met de Chat Coach voordat je ze echt stuurt.</p>
                    <p>✓ Veilig experimenteren: Pas nieuwe skills direct toe in de praktijk met onze steun.</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Je ontwikkelt vaardigheden die je de rest van je leven houdt.
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-x-4"></div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl transition-all space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">Meesterschap</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Zelfvertrouwen & Succes</h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>✓ Mindset Shift: We transformeren onzekerheid naar natuurlijke aantrekkingskracht.</p>
                    <p>✓ Date Strategie: Van de eerste ontmoeting naar een vervolgdate (zonder stress).</p>
                    <p>✓ Blijvende Groei: Je wordt je eigen datingcoach, klaar voor een duurzame relatie.</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      Je date niet meer vanuit schaarste, maar vanuit kracht.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-2xl p-8 border border-pink-100 dark:border-pink-700">
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
              <strong>Klaar om te beginnen?</strong> Het kost letterlijk 60 seconden om je account aan te maken
            </p>
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg">
                Start gratis →
              </Button>
            </Link>
            <p className="text-sm text-gray-700 dark:text-gray-400 mt-4">
              ✓ Geen creditcard nodig • ✓ Direct toegang • ✓ 30 dagen geld-terug garantie
            </p>
          </div>
        </div>
      </section>

      <section id="programmas" className="py-32 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-50">
              Kies jouw route naar succes
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-400 max-w-2xl mx-auto">
              Van snelle profiel-fix tot complete transformatie met persoonlijke begeleiding
            </p>
          </div>

          {/* Program Cards */}
          <ProgramCards />

          {/* Simple guarantee */}
          <div className="mt-16 text-center">
            <p className="text-gray-700 dark:text-gray-400 flex items-center justify-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-medium">30 dagen geld-terug garantie</span>
            </p>
          </div>
        </div>
      </section>

      <section id="over-ons" className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Van Datingcoach naar AI-Architect</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Technologie met een menselijk hart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Het begon in 2014. Ik startte als datingcoach (o.a. bekend van <strong>The Undateables</strong>) en begeleidde twee jaar lang intensief singles. Maar ik was toen al vooral <strong>de bedenker</strong>: de strateeg die zocht naar methodes die écht werken.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ik zag in die praktijkjaren precies waar mensen vastliepen. Maar ik zag ook de beperking: als coach kon ik maar een handjevol mensen helpen.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  In de jaren daarna heb ik mijn vizier verbreed. Als <strong>Impact Maker</strong> en <strong>AI Expert</strong> help ik nu organisaties om te innoveren. Maar mijn oude missie liet me niet los.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  Met de kennis van nu heb ik de ervaring van toen gedigitaliseerd:
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Al mijn kennis uit 10+ jaar praktijkervaring, direct toepasbaar.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Geen €150 per uur, maar €147 voor 3 maanden onbeperkt advies.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>24/7 beschikbaar, precies op het moment dat jij het nodig hebt.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl p-6 border border-pink-100 dark:border-pink-700">
                <p className="text-gray-800 dark:text-gray-100 leading-relaxed italic">
                  "Ik ben misschien geen fulltime datingcoach meer, maar ik ben wel de architect die jouw datingleven makkelijker maakt."
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-400 mt-3 font-medium">
                  — Vincent van Munster, Founder & AI Expert
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
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center flex items-center justify-center col-span-2">
                  <Image
                    src="/images/Vincent van Munster.png"
                    alt="Vincent van Munster - Oprichter DatingAssistent"
                    width={160}
                    height={160}
                    className="rounded-2xl object-cover"
                    priority
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center flex flex-col justify-center">
                  <div className="text-lg font-bold text-pink-500 dark:text-pink-400 mb-2">Bekend van</div>
                  <div className="text-sm text-gray-700 dark:text-gray-400 font-medium">The Undateables</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 dark:text-pink-400 mb-2">2009</div>
                  <div className="text-sm text-gray-700 dark:text-gray-400">Sinds</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 dark:text-pink-400 mb-2">10+</div>
                  <div className="text-sm text-gray-700 dark:text-gray-400">Jaar expertise</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 dark:text-pink-400 mb-2">24/7</div>
                  <div className="text-sm text-gray-700 dark:text-gray-400">Beschikbaar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectie 6: Social Proof */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Resultaten van mensen zoals jij</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Echte verhalen van mensen die hun dating leven transformeerden
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-pink-200 dark:border-pink-700 hover:shadow-xl transition-all space-y-4">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                &quot;Na 3 weken mijn eerste echte date. De AI Foto Check liet me direct zien wat er mis was met mijn profiel. Binnen 2 dagen had ik 3x meer matches!&quot;
              </p>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-gray-50">Mark, 29 jaar</p>
                <p className="text-sm text-gray-700 dark:text-gray-400">Transformatie programma</p>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-pink-200 dark:border-pink-700 hover:shadow-xl transition-all space-y-4">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                &quot;Eindelijk snap ik wat ik fout deed. De Chat Coach hielp me uit de &apos;friend zone&apos; en ik weet nu precies hoe ik flirty maar authentiek kan zijn.&quot;
              </p>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-gray-50">Lisa, 32 jaar</p>
                <p className="text-sm text-gray-700 dark:text-gray-400">Transformatie programma</p>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-pink-200 dark:border-pink-700 hover:shadow-xl transition-all space-y-4">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                &quot;De Kickstart was perfect. Mijn profiel is nu top en ik krijg complimenten over mijn openingszinnen. Dit is echt de beste investering die ik heb gedaan.&quot;
              </p>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-gray-50">Tom, 27 jaar</p>
                <p className="text-sm text-gray-700 dark:text-gray-400">Kickstart programma</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-pink-50 via-pink-25 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Gratis: Ontdek je Dating Stijl</h2>
          </div>

          {/* Simple member display */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-6 py-3 border-2 border-pink-200 dark:border-pink-700 shadow-sm">
                <Image className="w-10 h-10 rounded-full ring-2 ring-pink-100 dark:ring-pink-700" src={review.avatar} alt={review.name} width={40} height={40} loading="lazy" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{review.name}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-400">{review.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section - Now as separate component */}
          <FAQSection />

          {/* Start vandaag - Logout page style */}
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Main Card */}
            <Card className="border-2 border-pink-200 dark:border-pink-700 shadow-xl">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    Stop met wachten. Start met groeien.
                  </h3>
                </div>

                {/* Quick Stats - 3 colored boxes */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                    <Heart className="w-5 h-5 mx-auto mb-1 text-pink-600 dark:text-pink-400" />
                    <p className="text-xs text-gray-700 dark:text-gray-400">Gratis starten</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-gray-700 dark:text-gray-400">Direct toegang</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-gray-700 dark:text-gray-400">30 dagen garantie</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Cards - 2 column grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Quiz Card */}
              <Card className="border-2 border-pink-200 dark:border-pink-700 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 transition-all cursor-pointer hover:shadow-lg relative">
                <Link href="/quiz">
                  <CardContent className="p-6 text-center">
                    <Badge className="absolute top-3 right-3 bg-pink-500 dark:bg-pink-600 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">
                      Tip
                    </Badge>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-pink-600 dark:text-pink-400 mb-2">
                      Doe de Quiz
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Ontdek je dating stijl
                    </p>
                    <p className="text-xs text-pink-700 dark:text-pink-400 italic mb-4">
                      "Krijg binnen 2 minuten inzicht in jouw valkuilen"
                    </p>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
                      Gratis Starten
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              {/* Register Card */}
              <Card className="border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer hover:shadow-lg">
                <Link href="/register">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
                      Direct Beginnen
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400 mb-3">
                      Maak gratis een account
                    </p>
                    <Button variant="outline" className="w-full border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30">
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

      {/* Dating tips & advies - na FAQ */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Dating tips & advies</h2>
            <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto">Ontdek inspirerende verhalen van onze experts</p>
          </div>

          {blogsError ? (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-700 dark:text-gray-400 text-sm">{blogsError}</p>
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="block group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-600 hover:shadow-lg transition-all h-full">
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-700 dark:text-gray-400">5 min lezen</span>
                        <span className="text-sm text-pink-500 dark:text-pink-400 group-hover:translate-x-1 transition-transform">Lees meer →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/blog">
              <Button variant="outline" className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-pink-500 dark:hover:border-pink-400 hover:text-pink-500 dark:hover:text-pink-400 px-6 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl">
                Bekijk alle blogs
              </Button>
            </Link>
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

