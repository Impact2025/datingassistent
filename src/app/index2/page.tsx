'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Sparkles,
  Shield,
  Zap,
  Users,
  User,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Star,
  ArrowRight,
  Play,
  Quote,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default function Index2Page() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <PublicHeader />

      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">De #1 Dating Assistent van Nederland</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Vind je perfecte match met{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                expert begeleiding
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Van je eerste match tot een succesvolle relatie. Onze bewezen methode helpt
              duizenden singles om authentieke connecties te maken.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full group" asChild>
                <Link href="/register">
                  Start Nu Gratis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full" asChild>
                <Link href="#how-it-works">
                  <Play className="mr-2 w-5 h-5" />
                  Bekijk Hoe Het Werkt
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-background" />
                  ))}
                </div>
                <span className="text-muted-foreground">5.000+ tevreden gebruikers</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-muted-foreground">4.8/5 gemiddelde beoordeling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '5.000+', label: 'Actieve Gebruikers' },
              { number: '10.000+', label: 'Succesvolle Matches' },
              { number: '4.8/5', label: 'Gemiddelde Rating' },
              { number: '95%', label: 'Tevredenheid' },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">Waarom Kiezen Voor Ons</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Alles wat je nodig hebt voor{' '}
              <span className="text-primary">dating succes</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Van profiel optimalisatie tot eerste date tips - wij begeleiden je bij elke stap
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Profiel Optimalisatie',
                description: 'AI-gedreven tips om je profiel aantrekkelijker te maken en meer matches te krijgen.',
                color: 'text-red-500',
                bgColor: 'bg-red-500/10',
              },
              {
                icon: MessageCircle,
                title: 'Gesprek Starters',
                description: 'Unieke openingszinnen die gegarandeerd reacties krijgen. Nooit meer awkward beginnen.',
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
              },
              {
                icon: Sparkles,
                title: 'Date Planning',
                description: 'Perfecte date ideeën voor elke gelegenheid en budget. Van eerste ontmoeting tot relatie.',
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
              },
              {
                icon: Shield,
                title: 'Safety & Red Flags',
                description: 'Herken red flags en blijf veilig online en offline. Jouw veiligheid staat voorop.',
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
              },
              {
                icon: TrendingUp,
                title: 'Match Analytics',
                description: 'Inzicht in wat werkt en wat niet. Verbeter je dating game met data.',
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
              },
              {
                icon: Zap,
                title: '24/7 Coaching',
                description: 'Krijg direct antwoord op al je dating vragen. Onze AI coach staat altijd voor je klaar.',
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500/10',
              },
            ].map((feature, i) => (
              <Card key={i} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                <CardContent className="pt-6 space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-muted/30" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">Zo Werkt Het</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Van start tot succes in{' '}
              <span className="text-primary">3 eenvoudige stappen</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Maak Je Profiel',
                description: 'Registreer je gratis en vertel ons over jezelf. Onze AI analyseert je profiel en geeft direct verbeterpunten.',
                icon: User,
              },
              {
                step: '02',
                title: 'Leer & Verbeter',
                description: 'Volg onze bewezen cursussen over profiel optimalisatie, gesprek technieken en date planning. Leer in je eigen tempo.',
                icon: TrendingUp,
              },
              {
                step: '03',
                title: 'Vind Je Match',
                description: 'Pas je nieuwe skills toe en zie je matches en dates toenemen. Onze coaches helpen je bij elke stap.',
                icon: Heart,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute left-16 top-24 w-0.5 h-32 bg-gradient-to-b from-primary to-purple-500" />
                )}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                      {item.step}
                    </div>
                  </div>
                  <Card className="flex-1 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                      </div>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">Success Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Wat onze gebruikers{' '}
              <span className="text-primary">over ons zeggen</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Lisa van der Berg',
                role: 'Gevonden via Tinder',
                content: 'Na 3 maanden frustratie met online dating, heb ik binnen 2 weken na het volgen van de cursussen mijn huidige vriendje ontmoet. De tips zijn echt goud waard!',
                rating: 5,
                image: '👩‍💼',
              },
              {
                name: 'Mark Jansen',
                role: 'Gevonden via Bumble',
                content: 'Ik kreeg eerst nooit matches. Nu heb ik een volledig profiel en weet ik precies hoe ik een gesprek moet starten. Game changer!',
                rating: 5,
                image: '👨‍💻',
              },
              {
                name: 'Sophie Bakker',
                role: 'Gevonden via Hinge',
                content: 'De red flags cursus heeft me geholpen om tijdverspillers te herkennen. Nu ben ik al 6 maanden samen met iemand die echt bij me past.',
                rating: 5,
                image: '👩‍🎨',
              },
            ].map((testimonial, i) => (
              <Card key={i} className="relative overflow-hidden hover:shadow-xl transition-all">
                <div className="absolute top-4 right-4 text-6xl opacity-10">
                  <Quote />
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-32 bg-muted/30" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">Transparante Prijzen</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Kies het plan dat bij{' '}
              <span className="text-primary">jou past</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Start gratis en upgrade wanneer je klaar bent voor meer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Gratis',
                period: 'altijd',
                description: 'Perfect om te beginnen',
                features: [
                  '3 gratis cursussen',
                  'Basis profiel analyse',
                  'Community toegang',
                  'Wekelijkse tips',
                ],
                cta: 'Start Gratis',
                popular: false,
              },
              {
                name: 'Pro',
                price: '€24,50',
                period: 'per maand',
                description: 'Voor serieuze daters',
                features: [
                  'Alle cursussen',
                  'AI profiel optimalisatie',
                  'Onbeperkte coach vragen',
                  'Gepersonaliseerde tips',
                  'Prioriteit support',
                  'Exclusive webinars',
                ],
                cta: 'Kies Pro',
                popular: true,
              },
              {
                name: 'VIP',
                price: '€44,50',
                period: 'per maand',
                description: 'Maximaal resultaat',
                features: [
                  'Alles van Pro',
                  '1-op-1 coaching sessies',
                  'Profiel makeover',
                  'Date planning service',
                  'Levenslange toegang',
                  '30 dagen geld terug',
                ],
                cta: 'Word VIP',
                popular: false,
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`relative hover:shadow-2xl transition-all ${
                  plan.popular
                    ? 'border-primary shadow-lg scale-105 md:scale-110'
                    : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Meest Populair</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">
                      {plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.period}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    asChild
                  >
                    <Link href="/register">
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Alle plannen kunnen maandelijks worden opgezegd. Geen verborgen kosten.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">Veelgestelde Vragen</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Alles wat je moet{' '}
              <span className="text-primary">weten</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Hoe snel zie ik resultaten?',
                a: 'De meeste gebruikers zien binnen 1-2 weken al verbetering in hun matches en gesprekken. Het hangt natuurlijk af van hoeveel tijd je erin steekt.',
              },
              {
                q: 'Werkt dit ook als ik nog nooit gedatet heb?',
                a: 'Absoluut! Onze cursussen beginnen bij de basis en bouwen langzaam op. We hebben speciaal materiaal voor complete beginners.',
              },
              {
                q: 'Kan ik opzeggen wanneer ik wil?',
                a: 'Ja, alle abonnementen zijn maandelijks opzegbaar. Geen verborgen kosten of lange contracten.',
              },
              {
                q: 'Is er een geld-terug-garantie?',
                a: 'Ja, we bieden een 30-dagen geld-terug-garantie op alle betaalde plannen. Niet tevreden? Gewoon je geld terug.',
              },
              {
                q: 'Werkt dit voor alle dating apps?',
                a: 'Ja! Onze tips en strategieën werken op Tinder, Bumble, Hinge, en alle andere dating platforms.',
              },
            ].map((faq, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground pl-8">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Klaar om je dating leven te transformeren?
            </h2>
            <p className="text-xl opacity-90">
              Sluit je aan bij 5.000+ singles die al succesvol zijn met onze methode.
              Start vandaag nog gratis!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-full" asChild>
                <Link href="/register">
                  Start Nu Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full bg-transparent hover:bg-white/10 text-white border-white/30" asChild>
                <Link href="/login">
                  Ik heb al een account
                </Link>
              </Button>
            </div>
            <p className="text-sm opacity-75 pt-4">
              ✓ Geen creditcard vereist • ✓ Direct toegang • ✓ 30 dagen geld terug garantie
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
