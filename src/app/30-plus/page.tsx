'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  CheckCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Smartphone,
  HelpCircle,
  Shield,
  TrendingUp,
  Menu,
  X,
  Zap,
  MessageCircle,
  User,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { HeroMature30Plus } from '@/components/landing/30plus/hero-mature';
import { TrustBuilder30Plus } from '@/components/landing/30plus/trust-builder';
import { SuccessStories30Plus } from '@/components/landing/30plus/success-stories-30plus';
import { SimplifiedJourney30Plus } from '@/components/landing/30plus/simplified-journey';

/**
 * 30-PLUS LANDING PAGE
 *
 * Landingspagina speciaal voor 30+ singles
 * Messaging: bewust daten, intentioneel, druk leven, serieuze relatie
 */

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
      icon: Smartphone,
      title: 'Eindeloos swipen, niets',
      desc: 'Je bent al maanden op apps maar de matches voelen oppervlakkig. Je zoekt iets echts.',
      color: colors.warmCoral,
    },
    {
      icon: Briefcase,
      title: 'Geen tijd voor dating',
      desc: 'Drukke baan, sociale verplichtingen - hoe combineer je dat met serieus daten?',
      color: colors.dustyRose,
    },
    {
      icon: HelpCircle,
      title: 'Steeds hetzelfde patroon',
      desc: 'Je belandt steeds bij dezelfde soort mensen. Je weet dat er iets moet veranderen.',
      color: colors.sageGreen,
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
            Dit zijn geen tekortkomingen.{' '}
            <span style={{ color: colors.roseGold }}>
              Dit zijn signalen.
            </span>
            <br />
            Je bent klaar voor een andere aanpak.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// TOOLS SECTION - "Waarom 30-plussers anders daten"
// ============================================================================

function ToolsSection30Plus() {
  const tools = [
    {
      icon: User,
      title: 'Authentiek profiel',
      description: 'Een profiel dat aantrekt wat jij zoekt - geen trucjes, geen maskers. Puur jij.',
      color: colors.warmCoral,
    },
    {
      icon: Heart,
      title: 'Emotionele ready scan',
      description: 'Check of je klaar bent voor wat jij wilt. Voorkom herhaling van patronen die je al kent.',
      color: colors.dustyRose,
    },
    {
      icon: TrendingUp,
      title: 'Kwaliteit boven kwantiteit',
      description: 'Stop met eindeloos swipen. Focus op matches met echte langetermijn potentie.',
      color: colors.sageGreen,
    },
    {
      icon: MessageCircle,
      title: '24/7 dating begeleiding',
      description: 'Chat coach die begrijpt dat jij een druk leven hebt en toch serieus wil daten.',
      color: colors.deepPurple,
    },
  ];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Bewust daten werkt anders
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Tools die écht begrijpen wat jij zoekt in je 30s
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
// PRICING SECTION - Adapted for 30+
// ============================================================================

function PricingSection30Plus() {
  const router = useRouter();

  const plans = [
    {
      name: 'Kickstart',
      subtitle: '21 dagen bewuste start',
      oldPrice: '€97',
      price: '€47',
      color: colors.deepPurple,
      features: [
        '21-Dagen Video Challenge',
        'AI Foto Check (Onbeperkt)',
        'Bio Builder',
        'Profiel Review',
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
      badge: 'MEEST GEKOZEN DOOR 30-PLUSSERS',
      features: [
        'Alles uit Kickstart +',
        '12 Module Video Academy',
        'Pro AI Suite (90 dagen)',
        '24/7 Chat Coach',
        '3x Live Q&A',
        'Patroon herkenning',
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
      badge: 'MAXIMALE BEGELEIDING',
      features: [
        'Alles uit Transformatie +',
        '60 min Video Intake',
        '6x 1-op-1 Coaching',
        'Persoonlijke WhatsApp Support',
        'Levenslang Toegang',
        'Max 10 plekken/maand',
      ],
      cta: 'Start VIP',
      variant: 'vip' as const,
      slug: 'vip',
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
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
                  onClick={() => router.push(`/register?source=30plus&program=${plan.slug}`)}
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
// FAQ SECTION - 30+ Specific Questions
// ============================================================================

function FAQSection30Plus() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs = [
    {
      id: 'serious',
      question: 'Ik wil serieus daten, maar de apps voelen zo oppervlakkig. Wat nu?',
      answer: 'Dat is precies het probleem met standaard swipen: het is ontworpen voor volume, niet voor kwaliteit. Wij leren je hoe je je profiel instelt, welke apps beter werken voor serieuze relaties, en hoe je gesprekken voert die diepgang hebben. Het verschil is groot.',
    },
    {
      id: 'time',
      question: 'Ik heb een drukke baan. Heb ik wel tijd voor dit?',
      answer: 'Ons programma is ontworpen voor mensen met een druk leven. Je besteedt gemiddeld 20-30 minuten per dag aan de oefeningen. En juist door strategisch te daten in plaats van eindeloos te swipen, bespaar je uiteindelijk veel tijd.',
    },
    {
      id: 'patterns',
      question: 'Ik val steeds op dezelfde type mensen. Hoe doorbreek ik dat?',
      answer: 'Dat is een van de meest waardevolle dingen die we aanpakken. Via de emotionele ready scan en patroon analyse help je jezelf te begrijpen waarom je steeds dezelfde keuzes maakt. Zodra je dat ziet, kun je bewust andere keuzes maken - zonder jezelf te verloochenen.',
    },
    {
      id: 'ready',
      question: 'Ik ben net uit een relatie. Ben ik klaar om te daten?',
      answer: 'Dat is precies wat onze Emotionele Ready Scan bepaalt. Sommige mensen zijn na 3 maanden klaar, anderen na 2 jaar - er is geen regel. We helpen je eerlijk te kijken en voorkomen dat je date vanuit pijn, want dat trekt ook pijn aan.',
    },
    {
      id: 'apps',
      question: 'Welke dating app is het beste in mijn 30s?',
      answer: 'Dat hangt af van wat je zoekt en wie je bent. Hinge en Bumble werken goed voor mensen die een serieuze relatie willen. EliteDating en Lexa zijn populair bij 30+ Nederlanders die bewuster daten. We helpen je de juiste keuze te maken voor jouw specifieke situatie.',
    },
    {
      id: 'different',
      question: 'Wat maakt dit anders dan andere dating coaches?',
      answer: 'Wij focussen niet op trucs of technieken om meer matches te krijgen. We helpen je begrijpen wie je bent, wat je wilt, en hoe je dat authentiek uitstraalt. Het resultaat is niet meer matches - maar betere. En dat is wat je écht wil.',
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
            Alle antwoorden die 30-plussers willen weten
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
// FINAL CTA SECTION
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
            Klaar om het anders te doen?
          </h2>

          <div className="mb-10 space-y-4">
            <p className="text-xl leading-relaxed" style={{ color: colors.charcoal }}>
              Je weet wat je wilt. Je hebt genoeg tijd verspild aan oppervlakkig swipen.
            </p>
            <p className="text-xl leading-relaxed font-semibold" style={{ color: colors.roseGold }}>
              Jouw 30s zijn de perfecte tijd voor de relatie die je echt wil.
              <br />
              Begin vandaag.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/quiz/emotionele-readiness">
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
// BLOG SECTION
// ============================================================================

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  slug: string;
}

function BlogSection30Plus() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
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
              Dating advies voor 30-plussers
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
            Dating advies voor 30-plussers
          </h2>
          <p style={{ color: colors.mediumGray }}>Praktische tips voor bewust daten</p>
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
              Jouw persoonlijke datingcoach voor authentieke verbinding in je 30s
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
              Laatst bijgewerkt: 20 maart 2026
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

export default function ThirtyPlusPage() {
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
      <HeroMature30Plus />
      <ValidationSection />
      <ToolsSection30Plus />
      <SuccessStories30Plus />
      <SimplifiedJourney30Plus />
      <PricingSection30Plus />
      <TrustBuilder30Plus />
      <FAQSection30Plus />
      <BlogSection30Plus />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
