'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  User,
  MessageCircle,
  Calendar,
  Shield,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Play,
  ArrowRight,
  AlertCircle,
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
          const data = await response.json();
          setReviews(data);
        } else {
          setReviews([
            {
              id: 1,
              name: 'Marieke',
              role: 'Business coach',
              content: 'Binnen drie weken kreeg ik 2x zoveel kwalitatieve reacties. Vooral de AI-profielscan gaf scherpe inzichten.',
              rating: 5,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=M',
            },
            {
              id: 2,
              name: 'Thomas',
              role: 'Product manager',
              content: 'De openingszinnen voelen authentiek en leveren reacties op. Ik hoef niet meer te twijfelen over wat ik stuur.',
              rating: 4,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=T',
            },
            {
              id: 3,
              name: 'Sanne',
              role: 'Content creator',
              content: 'De foto-feedback en tone-of-voice tips zorgden voor een consistent verhaal. Ik merk meteen meer matches.',
              rating: 5,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=S',
            },
            {
              id: 4,
              name: 'Jasper',
              role: 'UX designer',
              content: 'Ik gebruik vooral de chatcoach tijdens gesprekken. Soms nog wat traag, maar de suggesties zijn spot-on.',
              rating: 4,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=J',
            },
            {
              id: 5,
              name: 'Noor',
              role: 'HR adviseur',
              content: 'Fijn dat de cursussen kort en toepasbaar zijn. Ik geef vier sterren omdat ik nog meer voorbeelden wil zien.',
              rating: 4,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=N',
            },
            {
              id: 6,
              name: 'Eva',
              role: 'Consultant',
              content: 'Premium AI coaching voelt echt als persoonlijke begeleiding. Iedere week concrete opdrachten én feedback.',
              rating: 5,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=E',
            },
            {
              id: 7,
              name: 'Ruben',
              role: 'Sales lead',
              content: 'Door de match-analyse snap ik waarom sommige gesprekken stilvielen. Vier sterren omdat ik nog op nieuwe modules wacht.',
              rating: 4,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=R',
            },
            {
              id: 8,
              name: 'Mila',
              role: 'Student',
              content: 'Handige app, maar ik mis af en toe live events voor jongeren. Wel veel geleerd, dus drie sterren.',
              rating: 3,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=MI',
            },
            {
              id: 9,
              name: 'Selena',
              role: 'Ondernemer',
              content: 'De combinatie van AI + human expertise is uniek. Ik voel me zekerder tijdens dates en krijg gerichte feedback.',
              rating: 5,
              avatar: 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=SE',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?type=latest&limit=3');

        if (response.ok) {
          const posts = await response.json();
          const mappedBlogs = posts.map((post: any, index: number) => ({
            id: index + 1,
            title: post.title,
            excerpt: post.excerpt,
            slug: post.slug,
            featured_image: post.featured_image,
          }));
          setBlogs(mappedBlogs);
          setBlogsError(null);
        } else {
          setBlogsError('Kan blogs momenteel niet laden. Probeer het later opnieuw.');
        }
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
      window.location.href = `/register?plan=${packageType}&billing=yearly&redirect_after_payment=true`;
    } else {
      window.location.href = `/register`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {hero ?? <HeroSection />}

      <section id="tools" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ontdek al onze AI tools</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Van profiel optimalisatie tot date planning - wij helpen je bij elke stap
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-pink-50 flex items-center justify-center">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Profiel Coach</h3>
                <p className="text-sm text-gray-600 leading-relaxed">AI analyseert je profiel voor 3x meer matches</p>
              </div>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Chat Coach</h3>
                <p className="text-sm text-gray-600 leading-relaxed">24/7 AI hulp bij elk gesprek</p>
              </div>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-green-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Date Planner</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Creatieve date ideeën</p>
              </div>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-purple-50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Opener Lab</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Originele openingszinnen</p>
              </div>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-orange-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Match Analyse</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Begrijp waarom mensen swipen</p>
              </div>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 flex items-center justify-center">
                <Play className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Foto Check</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Professionele foto feedback</p>
              </div>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Voortgang Tracker</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Volg je dating succes</p>
              </div>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Veiligheid</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Herken rode vlaggen</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/features">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all">Bekijk al onze tools</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Zo werkt het</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Van eerste match naar eerste date - wij begeleiden je stap voor stap
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-pink-500">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-pink-200 -translate-x-10"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Maak je profiel</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transformeer je datingprofiel gratis met onze AI, die je analyseert en gepersonaliseerde verbeteringen (inclusief foto- en bio-advies) geeft voor 3x meer matches.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-pink-500">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-pink-200 -translate-x-10"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Krijg AI hulp</h3>
                <p className="text-gray-600 leading-relaxed">
                  Profiteer van 24/7 AI hulp via onze tools, zoals de Chat Coach voor contextuele antwoorden, de Profiel Coach voor openingszinnen, en een Foto Check voor professionele feedback.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-pink-500">3</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Plan je date</h3>
                <p className="text-gray-600 leading-relaxed">
                  Onze Date Planner helpt je vervolgens met creatieve ideeën voor elke fase, van de eerste ontmoeting tot een langdurige relatie, inclusief locatie- en gesprekstips voor memorabele ervaringen.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all">
                Start je dating succes vandaag!
              </Button>
            </Link>
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

      <section id="programmas" className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block mb-4">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 text-sm">
                🎉 Beta Launch - Exclusieve vroegboekkorting!
              </Badge>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Transformeer je dating leven in <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">90 dagen</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Van "Ik weet niet wat ik verkeerd doe" naar "Ik date met vertrouwen en krijg de dates die ik wil"
            </p>
          </div>

          {/* Program Cards */}
          <ProgramCards />

          {/* Benefits Below */}
          <div className="mt-16 space-y-8">
            {/* Transformation Over Tools */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-100 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Niet gewoon tools, maar een complete transformatie
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  DatingAssistent is meer dan een verzameling AI-tools. Het is een bewezen 3-fase systeem
                  dat je van onzeker swiper naar zelfverzekerde dater brengt. Met Iris als je persoonlijke
                  coach die je 24/7 begeleidt door elke stap.
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl font-bold text-pink-500 mb-2">85%</div>
                <p className="text-sm text-gray-600">Heeft minimaal 1 date binnen 90 dagen</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl font-bold text-pink-500 mb-2">3x</div>
                <p className="text-sm text-gray-600">Meer matches na week 3</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl font-bold text-pink-500 mb-2">100%</div>
                <p className="text-sm text-gray-600">Rapporteert meer zelfvertrouwen</p>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">30 dagen niet-goed-geld-terug garantie</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We zijn zo overtuigd van onze aanpak dat we je geld terugstorten als je binnen
                    30 dagen niet tevreden bent. Geen vragen, geen gedoe.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Notice */}
            <div className="mt-8 text-center text-sm text-gray-500 max-w-2xl mx-auto">
              <p>
                Alle prijzen zijn inclusief btw. Beta korting is geldig tot einde van het jaar.
                <br />
                Programma's zijn éénmalige betalingen - geen abonnement, geen verborgen kosten.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Over DatingAssistent</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Het verhaal achter onze missie om daten toegankelijker te maken</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">10+ Jaar Ervaring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sinds 2013 helpen we mensen succesvol te daten. Van traditioneel datingbureau tot AI-powered platform: we hebben alles gezien, alles geleerd en weten precies wat écht werkt.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Van Traditioneel naar Digitaal</h3>
                <p className="text-gray-600 leading-relaxed">
                  Wat begon als een datingbureau voor mensen met een beperking (o.a. bekend van het tv-programma The Undateables), is uitgegroeid tot de meest complete AI-driven dating coach van Nederland. We combineren bewezen psychologie met cutting-edge technologie om daten makkelijker, leuker en effectiever te maken.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Vincent van Munster</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sinds 2013 heb ik talloze mensen mogen helpen liefde te vinden, zelfvertrouwen op te bouwen en de regie over hun liefdesleven terug te pakken. Met DatingAssistent is mijn missie helder: daten toegankelijker, persoonlijker en succesvoller maken voor iedereen.
                </p>
              </div>

              <div className="pt-4">
                <Link href="/register">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all">Ontdek onze tools</Button>
                </Link>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 text-center flex items-center justify-center">
                  <Image
                    src="/images/Vincent van Munster.png"
                    alt="Vincent van Munster - Oprichter DatingAssistent"
                    width={120}
                    height={120}
                    className="rounded-2xl object-cover"
                    priority
                  />
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center flex flex-col justify-center h-full">
                  <div className="text-lg font-bold text-pink-500 mb-2">Bekend van</div>
                  <div className="text-sm text-gray-600">The Undateables (TV)</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">4.9/5</div>
                  <div className="text-sm text-gray-600">Gemiddelde beoordeling</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">10+</div>
                  <div className="text-sm text-gray-600">Jaar ervaring</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                <h4 className="font-bold text-gray-900 mb-2">Onze Missie</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Mijn missie blijft onveranderd<br />
                  ''Mijn missie blijft onveranderd: jouw datingleven makkelijker, persoonlijker en succesvoller maken. Of je nu net begint, al even bezig bent of compleet vastloopt, DatingAssistent helpt je graag om met meer rust, helderheid en vertrouwen je volgende stap te zetten richting liefde.''
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Wat gebruikers zeggen</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Ontdek waarom mensen DatingAssistent vertrouwen</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-lg transition-all space-y-4">
                <div className="flex text-pink-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed text-sm">"{review.content}"</p>

                <div className="flex items-center gap-3 pt-2">
                  <Image className="w-10 h-10 rounded-full" src={review.avatar} alt={`${review.name} - Verified user`} width={40} height={40} loading="lazy" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-400">Geverifieerd</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Veelgestelde vragen</h3>
              <p className="text-gray-500">Antwoorden op de meest gestelde vragen</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Is DatingAssistent gratis?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ja! Je kunt gratis beginnen met een account aanmaken en basis tools uitproberen. Premium features zijn beschikbaar via betaalde abonnementen.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Voor welke dating apps werkt het?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Onze tools werken met alle populaire dating apps zoals Tinder, Bumble, Hinge, en meer. Je kunt onze hulp gebruiken op elk platform.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Hoe snel zie ik resultaten?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  De meeste gebruikers zien verbeteringen binnen 1-2 weken. Met consistente toepassing van onze tips zie je gemiddeld 89% meer matches.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Kan ik opzeggen wanneer ik wil?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Absoluut! Je kunt je abonnement op elk moment opzeggen zonder extra kosten. Geen verplichtingen, geen gedoe.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/faq" className="text-pink-500 hover:text-pink-600 font-medium transition-all">
                Bekijk alle veelgestelde vragen →
              </Link>
            </div>
          </div>

          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Klaar om te beginnen?</h3>
              <p className="text-gray-500 mb-6">Sluit je aan bij iedereen die met meer vertrouwen, duidelijkheid en succes wil daten.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                    Start gratis
                  </Button>
                </Link>
                <Link href="#programmas">
                  <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                    Bekijk programma's
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
      <BottomNavigation />
      <CookieConsentBanner />

      {/* Chat Widget - Only show for non-registered members */}
      {!user && (
        <ChatWidgetWrapper
          apiUrl="/api/chatbot"
          position="bottom-right"
          primaryColor="#E14874"
          companyName="Iris"
          welcomeMessage="Hoi! 👋 Ik ben Iris, je dating coach. Heb je een vraag over de les of je dating reis? Ik help je graag!"
          enableProactiveInvites={true}
          proactiveDelay={20000}
          proactiveMessage="Hoi! 👋 Ik zie dat je rondkijkt. Heb je vragen over DatingAssistent?"
          agentName="Iris"
        />
      )}
    </div>
  );
}

