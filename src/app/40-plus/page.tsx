'use client';

import { ReactNode, useState, useEffect } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  AlertCircle,
  MessageCircle,
  Heart,
  CheckCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Smartphone,
  HelpCircle,
  User,
  Shield,
  Calendar,
  Eye,
  TrendingUp,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/providers/user-provider';
import { HeroMature } from '@/components/landing/40plus/hero-mature';
import { TrustBuilder } from '@/components/landing/40plus/trust-builder';
import { SuccessStories40Plus } from '@/components/landing/40plus/success-stories-40plus';
import { SimplifiedJourney } from '@/components/landing/40plus/simplified-journey';

/**
 * 40-PLUS LANDING PAGE
 *
 * Wereldklasse landingspagina speciaal voor 40+ singles
 * Gebaseerd op homepage-v4 structuur met aangepaste messaging
 *
 * @see /src/styles/variables.css voor kleur documentatie
 */

// SEO Metadata - Export separately since this is a client component
// Note: In Next.js App Router, metadata can only be exported from Server Components
// This page will need a separate metadata export or layout wrapper

// Early bird configuration
const EARLY_BIRD_DEADLINE = '1 maart 2026';
const EARLY_BIRD_END_DATE = new Date('2026-03-01T23:59:59');
const isEarlyBirdActive = () => new Date() <= EARLY_BIRD_END_DATE;

const colors = {
  deepPurple: 'var(--color-deep-purple, #722F37)',
  dustyRose: 'var(--color-dusty-rose, #E3867D)',
  softBlush: 'var(--color-soft-blush, #F5E6E8)',
  cream: 'var(--color-cream, #FFF8F3)',
  warmCoral: 'var(--color-warm-coral, #FF7B54)',
  sageGreen: 'var(--color-sage-green, #A8B5A0)',
  charcoal: 'var(--color-charcoal, #2D3142)',
  mediumGray: 'var(--color-medium-gray, #6B6B6B)',
  roseGold: 'var(--color-rose-gold, #B76E79)',
  royalPurple: 'var(--color-royal-purple, #6B4D8A)',
};

// ============================================================================
// VALIDATION SECTION - "Herken Je Dit?"
// ============================================================================

function ValidationSection() {
  const problems = [
    {
      icon: HelpCircle,
      title: 'Is iedereen al bezet?',
      desc: 'Na je scheiding lijkt het alsof alle goede matches al vergeven zijn',
      color: colors.warmCoral
    },
    {
      icon: Smartphone,
      title: 'Hoe werkt dit allemaal?',
      desc: 'Tinder, Bumble... Je weet niet waar te beginnen en bent bang fouten te maken',
      color: colors.dustyRose
    },
    {
      icon: Heart,
      title: 'Ben ik wel klaar?',
      desc: 'Je vraagt je af: ben ik emotioneel klaar voor iets nieuws?',
      color: colors.sageGreen
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Herken je dit?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              className="text-center p-8 rounded-2xl border-2 bg-white"
              style={{ borderColor: colors.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
            >
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: problem.color }}
              >
                <problem.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.deepPurple }}>
                {problem.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: colors.mediumGray }}>
                {problem.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center p-8 rounded-2xl"
          style={{ backgroundColor: colors.softBlush }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xl font-semibold leading-relaxed" style={{ color: colors.charcoal }}>
            Goed nieuws: Dit zijn geen barrières.{' '}
            <span style={{ color: colors.roseGold }}>
              Dit zijn voordelen.
            </span>
            <br />
            Jouw zelfkennis is je superkracht.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// TOOLS SECTION - "Waarom 40-plussers succesvol zijn"
// ============================================================================

function ToolsSection40Plus() {
  const tools = [
    {
      icon: User,
      title: 'Profiel privacy coach',
      description: 'Foto\'s en bio die professioneel zijn, zonder je privacy op te offeren',
      color: colors.warmCoral,
    },
    {
      icon: Heart,
      title: 'Emotionele ready scan',
      description: 'Wetenschappelijke check: ben je echt klaar om opnieuw te daten? Voorkom herhaling van oude patronen',
      color: colors.dustyRose,
    },
    {
      icon: TrendingUp,
      title: 'Kwaliteit over kwantiteit match AI',
      description: 'Geen eindeloos swipen - focus op lange-termijn potentie. Filters voor levensfase-compatibiliteit',
      color: colors.sageGreen,
    },
    {
      icon: MessageCircle,
      title: '24/7 dating begeleiding',
      description: 'Chat coach die begrijpt dat je 20 jaar uit de datescene bent',
      color: colors.deepPurple,
    },
  ];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Waarom 40-plussers succesvol zijn
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Tools die écht begrijpen waar jij staat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-8 border-2 hover:shadow-lg transition-all"
              style={{ borderColor: `${tool.color}30` }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${tool.color}20` }}
                >
                  <tool.icon className="w-7 h-7" style={{ color: tool.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2" style={{ color: colors.deepPurple }}>
                    {tool.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: colors.mediumGray }}>
                    {tool.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING SECTION - Adapted for 40+
// ============================================================================

function PricingSection40Plus() {
  const router = useRouter();

  const plans = [
    {
      name: 'Kickstart',
      subtitle: '21 dagen discrete start',
      oldPrice: '€97',
      price: '€47',
      color: colors.deepPurple,
      features: [
        '21-Dagen Video Challenge',
        'AI Foto Check (Onbeperkt)',
        'Bio Builder',
        'Discrete Profiel Review',
        'Werkboek & Templates',
      ],
      cta: 'Meer info',
      variant: 'outline' as const,
      slug: 'kickstart',
    },
    {
      name: 'Transformatie',
      subtitle: 'Complete opleiding',
      oldPrice: '€297',
      price: '€147',
      color: colors.warmCoral,
      highlight: true,
      badge: 'MEEST GEKOZEN DOOR 40-PLUSSERS',
      features: [
        'Alles uit Kickstart +',
        '12 Module Video Academy',
        'Pro AI Suite (90 dagen)',
        '24/7 Chat Coach',
        '3x Live Q&A',
        'Privacy-first approach',
      ],
      cta: 'Kies dit plan',
      variant: 'primary' as const,
      slug: 'transformatie',
    },
    {
      name: 'VIP Reis',
      subtitle: '6 maanden persoonlijk',
      oldPrice: '€997',
      price: '€797',
      color: colors.royalPurple,
      badge: 'MAXIMALE PRIVACY',
      features: [
        'Alles uit Transformatie +',
        '60 min Video Intake',
        '6x 1-op-1 Coaching',
        'Confidential WhatsApp Support',
        'Levenslang Toegang',
        'Max 10 plekken/maand',
      ],
      cta: 'Start VIP',
      variant: 'vip' as const,
      slug: 'vip',
    },
  ];

  return (
    <section className="py-24 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {/* Early Bird Badge */}
          {isEarlyBirdActive() && (
            <motion.div
              className="inline-flex items-center gap-2 mb-6 px-6 py-2 rounded-full shadow-lg text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Zap className="w-4 h-4" />
              <span className="font-semibold text-sm">Early Bird Actie - Geldig tot {EARLY_BIRD_DEADLINE}</span>
            </motion.div>
          )}

          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Investeer in jezelf
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Van snelle start tot complete transformatie
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative rounded-2xl bg-white border-2 overflow-hidden ${
                plan.highlight ? 'md:scale-105 shadow-xl' : 'hover:shadow-lg'
              }`}
              style={{ borderColor: plan.highlight ? plan.color : colors.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.badge && (
                <div
                  className="absolute top-0 left-0 right-0 py-2 text-center text-xs font-bold text-white"
                  style={{ backgroundColor: plan.color }}
                >
                  {plan.badge}
                </div>
              )}

              <div className={`p-6 ${plan.badge ? 'pt-12' : ''}`}>
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors.deepPurple }}>
                  {plan.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.mediumGray }}>
                  {plan.subtitle}
                </p>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg line-through" style={{ color: colors.mediumGray }}>
                      {plan.oldPrice}
                    </span>
                    <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs">
                      Bespaar €{parseInt(plan.oldPrice.replace('€', '')) - parseInt(plan.price.replace('€', ''))}
                    </Badge>
                  </div>
                  <span className="text-4xl font-bold" style={{ color: plan.color }}>
                    {plan.price}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: colors.charcoal }}>
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.sageGreen }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => router.push(`/register?source=40plus&program=${plan.slug}`)}
                  className={`w-full py-3 font-semibold ${
                    plan.variant === 'outline' ? '' : 'text-white'
                  }`}
                  variant={plan.variant === 'outline' ? 'outline' : 'default'}
                  style={
                    plan.variant === 'outline'
                      ? { borderColor: plan.color, color: plan.color }
                      : { backgroundColor: plan.color }
                  }
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-10 flex items-center justify-center gap-2" style={{ color: colors.mediumGray }}>
          <Lock className="w-4 h-4" />
          30 dagen geld-terug garantie op alle plannen
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ SECTION - 40+ Specific Questions
// ============================================================================

function FAQSection40Plus() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs = [
    {
      id: 'age',
      question: 'Ben ik niet te oud om te daten?',
      answer: 'Absoluut niet. De gemiddelde leeftijd van onze leden is 42 jaar. Veel 40-plussers vinden juist nu de meest gezonde relaties omdat ze beter weten wat ze willen en niet willen. Levenservaring is een voordeel, geen nadeel.',
    },
    {
      id: 'tech',
      question: 'Ik ben 20 jaar uit de datescene. Is het nu niet heel anders?',
      answer: 'Ja, daten is veranderd door apps. Maar dat is juist waarom we er zijn. We leiden je stap-voor-stap door het proces, van profiel aanmaken tot eerste date. Je krijgt concrete templates en begeleiding - geen overweldigende theorie.',
    },
    {
      id: 'privacy',
      question: 'Hoe bescherm ik mijn privacy?',
      answer: 'Privacy staat bij ons voorop, vooral voor 40-plussers met carrière en kinderen. We leren je: welke foto\'s veilig zijn, hoe je werkgever-proof profiel maakt, welke apps privacy-vriendelijk zijn, en hoe je persoonlijke info beschermt.',
    },
    {
      id: 'readiness',
      question: 'Wat als ik nog niet over mijn scheiding heen ben?',
      answer: 'Dat is precies waarom we beginnen met de Emotionele Ready Scan. We helpen je eerlijk te kijken of je klaar bent. Als je nog niet klaar bent, krijg je eerst tools om te helen. Rushed daten na een scheiding leidt vaak tot herhaling van patronen.',
    },
    {
      id: 'kids',
      question: 'Ik heb kinderen. Hoe ga ik daarmee om?',
      answer: 'We behandelen co-parenting en kinderen expliciet in het programma. Inclusief: wanneer vertel je over je kinderen, hoe bescherm je hun privacy, hoe date je met een druk schema, en hoe introduceer je een nieuwe partner (als het zover is).',
    },
    {
      id: 'pool',
      question: 'Zijn er wel andere 40-plussers op dating apps?',
      answer: 'Ja! Op apps als Lexa, EliteDating, en zelfs Tinder zijn enorm veel 40-plussers actief. We helpen je de juiste apps kiezen voor jouw situatie en doelen. De dating pool is groter dan je denkt.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Veelgestelde vragen
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Alle antwoorden die 40-plussers willen weten
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              className="rounded-2xl border-2 overflow-hidden bg-white hover:border-opacity-70 transition-all"
              style={{ borderColor: colors.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-lg" style={{ color: colors.deepPurple }}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5 transform rotate-90" style={{ color: colors.mediumGray }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-5 pb-5 pt-0">
                      <p className="leading-relaxed" style={{ color: colors.charcoal }}>
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQPage Schema for Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}

// ============================================================================
// FINAL CTA SECTION - Emotional
// ============================================================================

function FinalCTASection() {
  return (
    <section className="py-24 px-4" style={{ backgroundColor: colors.softBlush }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: colors.deepPurple }}>
            Klaar voor je nieuwe hoofdstuk?
          </h2>

          <div className="mb-10 space-y-4">
            <p className="text-xl leading-relaxed" style={{ color: colors.charcoal }}>
              Je hebt al zoveel doorgemaakt. Een scheiding. Misschien verlies.
              Zeker verandering.
            </p>
            <p className="text-xl leading-relaxed font-semibold" style={{ color: colors.roseGold }}>
              Maar hier sta je - klaar om opnieuw lief te hebben.
              <br />
              Dat vraagt moed. En die heb je.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/quiz/emotionele-readiness-40plus">
              <Button
                className="text-white px-10 py-6 rounded-full shadow-xl font-semibold text-lg flex items-center gap-3"
                style={{
                  backgroundColor: colors.warmCoral,
                  boxShadow: '0 4px 16px var(--color-warm-coral-shadow, rgba(255, 123, 84, 0.3))'
                }}
              >
                <Sparkles className="w-5 h-5" />
                Start Gratis Analyse
              </Button>
            </Link>
            <a href="#pricing">
              <Button
                variant="outline"
                className="px-10 py-6 rounded-full font-semibold text-lg"
                style={{ borderColor: colors.deepPurple, color: colors.deepPurple }}
              >
                Bekijk Programma's
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Zap, text: 'Direct toegang' },
              { icon: Lock, text: '100% Privacy' },
              { icon: Shield, text: '30 dagen garantie' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-base" style={{ color: colors.mediumGray }}>
                <item.icon className="w-5 h-5" style={{ color: colors.sageGreen }} />
                {item.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// BLOG SECTION - Filter 40+ Content
// ============================================================================

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  slug: string;
}

function BlogSection40Plus() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // TODO: Add filtering for 40+ tagged posts when implemented
        const response = await fetch('/api/blogs?type=latest&limit=3');
        const data = await response.json();
        setBlogs(data.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt,
          featured_image: blog.featured_image || blog.image,
          slug: blog.slug,
        })));
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: colors.deepPurple }}>
              Dating advies voor 40-plussers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 rounded-t-2xl" style={{ backgroundColor: colors.softBlush }} />
                <div className="p-4 bg-white rounded-b-2xl space-y-3">
                  <div className="h-4 rounded" style={{ backgroundColor: colors.softBlush, width: '80%' }} />
                  <div className="h-3 rounded" style={{ backgroundColor: colors.softBlush, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) return null;

  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: colors.deepPurple }}>
            Dating advies voor 40-plussers
          </h2>
          <p style={{ color: colors.mediumGray }}>Praktische tips voor jouw situatie</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((blog, i) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/blog/${blog.slug}`} className="block group">
                <div
                  className="bg-white rounded-2xl overflow-hidden border-2 hover:shadow-lg transition-all h-full"
                  style={{ borderColor: colors.softBlush }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={blog.featured_image || '/images/hero-dating.jpg.png'}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3
                      className="font-bold mb-2 line-clamp-2 group-hover:underline"
                      style={{ color: colors.deepPurple }}
                    >
                      {blog.title}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: colors.mediumGray }}>
                      {blog.excerpt}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs" style={{ color: colors.mediumGray }}>5 min lezen</span>
                      <span className="text-sm font-medium group-hover:translate-x-1 transition-transform" style={{ color: colors.warmCoral }}>
                        Lees meer →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/blog">
            <Button
              variant="outline"
              className="rounded-full px-6"
              style={{ borderColor: colors.deepPurple, color: colors.deepPurple }}
            >
              Bekijk alle blogs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  const footerLinks = {
    product: [
      { label: 'Cursussen', href: '/cursussen' },
      { label: 'Prijzen', href: '/#programmas' },
      { label: 'Blog', href: '/blog' },
    ],
    overOns: [
      { label: 'Ons verhaal', href: '/over-ons' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacyverklaring' },
      { label: 'Voorwaarden', href: '/algemene-voorwaarden' },
      { label: 'Cookies', href: '/cookies' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Status', href: '/status' },
    ],
  };

  return (
    <footer className="py-12 px-4 border-t bg-white" style={{ borderColor: colors.softBlush }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image
                src="/images/LogoDA.png"
                alt="DatingAssistent Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xl font-bold" style={{ color: colors.deepPurple }}>
                DatingAssistent
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: colors.mediumGray }}>
              Jouw persoonlijke datingcoach voor een nieuwe start na 40
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:underline" style={{ color: colors.mediumGray }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Over ons</h4>
            <ul className="space-y-2">
              {footerLinks.overOns.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:underline" style={{ color: colors.mediumGray }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:underline" style={{ color: colors.mediumGray }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:underline" style={{ color: colors.mediumGray }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: colors.softBlush }}>
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm" style={{ color: colors.mediumGray }}>
              © {new Date().getFullYear()} DatingAssistent.nl. Alle rechten voorbehouden.
            </p>
            <p className="text-xs" style={{ color: colors.mediumGray }}>
              Laatst bijgewerkt: 15 februari 2026
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function FortyPlusPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();

  const navLinks = [
    { href: '/over-ons', label: 'Over Ons' },
    { href: '#pricing', label: 'Prijzen' },
    { href: '/blog', label: 'Blog' },
    { href: '/kennisbank', label: 'Kennisbank' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md" style={{ borderColor: colors.softBlush }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/LogoDA.png"
              alt="DatingAssistent Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <span className="text-xl font-bold" style={{ color: colors.deepPurple }}>
              DatingAssistent
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100"
                style={{ color: colors.charcoal }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="text-white font-semibold px-6 py-2 rounded-full shadow-lg" style={{ backgroundColor: colors.warmCoral }}>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="text-white font-semibold px-6 py-2 rounded-full shadow-lg" style={{ backgroundColor: colors.warmCoral }}>
                  Inloggen
                </Button>
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" style={{ color: colors.charcoal }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" style={{ color: colors.charcoal }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t"
              style={{ borderColor: colors.softBlush, backgroundColor: 'white' }}
            >
              <nav className="px-4 py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium rounded-xl hover:bg-gray-50"
                      style={{ color: colors.charcoal }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="pt-4 mt-4 border-t"
                  style={{ borderColor: colors.softBlush }}
                >
                  {user ? (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full text-white font-semibold py-3 rounded-full shadow-lg" style={{ backgroundColor: colors.warmCoral }}>
                        Naar Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full text-white font-semibold py-3 rounded-full shadow-lg" style={{ backgroundColor: colors.warmCoral }}>
                        Inloggen
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <HeroMature />
      <ValidationSection />
      <ToolsSection40Plus />
      <SuccessStories40Plus />
      <SimplifiedJourney />
      <div id="pricing">
        <PricingSection40Plus />
      </div>
      <TrustBuilder />
      <FAQSection40Plus />
      <BlogSection40Plus />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
