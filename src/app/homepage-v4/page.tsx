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
  Lock,
  Tv,
  Flag,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronRight,
  Zap,
  Eye,
  Brain,
  Rocket,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

/**
 * HOMEPAGE V4 - "Warm Vertrouwen" - Wereldklasse Editie
 *
 * Refactored voor:
 * - Minder tekst, meer impact
 * - Tabbed tools interface
 * - Interactive journey timeline
 * - Progressive disclosure
 *
 * @see /src/styles/variables.css voor kleur documentatie
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
  iconOrange: 'var(--icon-analysis, #FF7B54)',
  iconRose: 'var(--icon-emotional, #E3867D)',
  iconPurple: 'var(--icon-strategy, #8B7BA8)',
  iconMint: 'var(--icon-growth, #A8B5A0)',
  roseGold: 'var(--color-rose-gold, #B76E79)',
  royalPurple: 'var(--color-royal-purple, #6B4D8A)',
  terracotta: 'var(--color-terracotta, #E07A5F)',
};

// ============================================================================
// VIDEO PLAYER
// ============================================================================

function IrisVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showCTA, setShowCTA] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => setShowCTA(true), 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 3000);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <motion.div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: colors.charcoal }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0.3, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0 rounded-3xl p-[3px] -z-10"
          style={{ background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.roseGold})` }}
        />

        <div className="relative aspect-video rounded-3xl overflow-hidden" style={{ backgroundColor: colors.charcoal }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster="/images/iris-video-poster.jpg"
            muted={isMuted}
            playsInline
            onLoadedData={() => setIsLoaded(true)}
            onEnded={handleVideoEnd}
            onPlay={() => setIsPlaying(true)}
          >
            <source src="/videos/iris-intro.mp4" type="video/mp4" />
          </video>

          {!isLoaded && (
            <motion.div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: colors.charcoal }}>
              <motion.div
                className="w-12 h-12 border-4 rounded-full"
                style={{ borderColor: `${colors.roseGold}30`, borderTopColor: colors.roseGold }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}

          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                onClick={handlePlay}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${colors.warmCoral}30` }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: colors.warmCoral }}
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </motion.div>
                <motion.p
                  className="absolute bottom-8 text-white text-xl font-semibold drop-shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Bekijk hoe Iris je helpt
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {isPlaying && !videoEnded && (
            <motion.button
              className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              onClick={toggleMute}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </motion.button>
          )}

          <AnimatePresence>
            {videoEnded && (
              <motion.div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${colors.cream}, ${colors.cream}F2, ${colors.cream}CC)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCTA && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/quiz/dating-patroon">
              <Button
                className="text-white px-10 py-6 text-xl font-semibold shadow-xl rounded-full flex items-center gap-3"
                style={{ backgroundColor: colors.warmCoral }}
              >
                Ontdek Je Patroon <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8">
                <span className="block mb-3" style={{ color: colors.charcoal }}>Daten is</span>
                <span className="block mb-3" style={{ color: colors.charcoal }}>geen geluk.</span>
                <span className="block" style={{ color: colors.roseGold }}>Het is een</span>
                <span className="block" style={{ color: colors.roseGold }}>patroon.</span>
              </h1>
            </motion.div>

            <motion.p
              className="text-xl sm:text-2xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              style={{ color: colors.charcoal }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Ontdek in 2 minuten waarom je steeds op de verkeerde valt.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/quiz/dating-patroon">
                <Button
                  className="text-white px-8 py-6 text-lg font-semibold shadow-xl rounded-full flex items-center gap-2"
                  style={{ backgroundColor: colors.warmCoral, boxShadow: '0 4px 12px var(--color-warm-coral-shadow, rgba(255, 123, 84, 0.25))' }}
                >
                  Start de Gratis Quiz <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm self-center" style={{ color: colors.mediumGray }}>
                2 min • 10 vragen • Direct resultaat
              </p>
            </motion.div>
          </div>

          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <IrisVideoPlayer />
          </motion.div>
        </div>

        {/* Trust Bar - Compact */}
        <motion.div
          className="mt-12 pt-8 border-t flex flex-wrap items-center justify-center gap-8"
          style={{ borderColor: colors.softBlush }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { icon: Tv, text: '10+ Jaar ervaring', color: colors.dustyRose },
            { icon: Lock, text: '100% Privacy', color: colors.sageGreen },
            { icon: Flag, text: 'Nederlands product', color: colors.warmCoral },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2" style={{ color: colors.mediumGray }}>
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PROBLEM SECTION - Compact
// ============================================================================

function ProblemSection() {
  const problems = [
    { icon: AlertCircle, title: 'Match-Droogte', desc: 'Swipen zonder resultaat', color: colors.iconOrange },
    { icon: MessageCircle, title: 'Gespreks-Dood', desc: 'Chats die doodlopen', color: colors.iconRose },
    { icon: Heart, title: 'Situationship', desc: 'Partners die verdwijnen', color: colors.iconPurple },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>Herken je dit?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              className="text-center p-6 rounded-2xl border-2 bg-white"
              style={{ borderColor: colors.softBlush }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: problem.color }}
              >
                <problem.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: colors.deepPurple }}>{problem.title}</h3>
              <p className="text-sm" style={{ color: colors.mediumGray }}>{problem.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xl font-semibold" style={{ color: colors.charcoal }}>
          Het ligt niet aan jou. Het ligt aan je <span style={{ color: colors.roseGold }}>strategie</span>.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// TOOLS SECTION - Tabbed Interface
// ============================================================================

const toolCategories = [
  {
    id: 'analyse',
    label: 'Analyse',
    icon: Eye,
    color: colors.iconOrange,
    tools: [
      { icon: User, title: 'Profiel Coach', desc: 'AI analyseert je profiel → gemiddeld 3x meer matches' },
      { icon: TrendingUp, title: 'Match Analyse', desc: 'Voorspelt compatibiliteit, focus op matches met potentie' },
    ]
  },
  {
    id: 'gesprekken',
    label: 'Gesprekken',
    icon: MessageCircle,
    color: colors.iconRose,
    tools: [
      { icon: MessageCircle, title: '24/7 Chat Coach', desc: 'Real-time suggesties, nooit meer een doodlopend gesprek' },
      { icon: Sparkles, title: 'Opener Lab', desc: '64% respons rate vs 12% met standaard openers' },
    ]
  },
  {
    id: 'strategie',
    label: 'Strategie',
    icon: Brain,
    color: colors.iconPurple,
    tools: [
      { icon: Play, title: 'AI Foto Check', desc: 'Upload → score + verbeterpunten in seconden' },
      { icon: Shield, title: 'Veiligheid Check', desc: 'Herkent rode vlaggen en catfish signalen' },
    ]
  },
  {
    id: 'groei',
    label: 'Groei',
    icon: Rocket,
    color: colors.iconMint,
    tools: [
      { icon: Calendar, title: 'Date Planner', desc: 'Creatieve date-ideeën + gesprekstarters' },
      { icon: CheckCircle, title: 'Voortgang Tracker', desc: 'Zie wat werkt, leer van je successen' },
    ]
  },
];

function ToolsSection() {
  const [activeTab, setActiveTab] = useState('analyse');
  const activeCategory = toolCategories.find(c => c.id === activeTab)!;

  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: colors.deepPurple }}>
            Jouw 24/7 Wingman Team
          </h2>
          <p style={{ color: colors.mediumGray }}>AI-tools die je direct verder helpen</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {toolCategories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${
                activeTab === cat.id ? 'text-white shadow-lg' : 'bg-white border-2'
              }`}
              style={{
                backgroundColor: activeTab === cat.id ? cat.color : 'white',
                borderColor: activeTab === cat.id ? 'transparent' : colors.softBlush,
                color: activeTab === cat.id ? 'white' : colors.charcoal,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Tools Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {activeCategory.tools.map((tool, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 hover:shadow-lg transition-shadow"
                style={{ borderColor: `${activeCategory.color}30` }}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${activeCategory.color}20` }}
                  >
                    <tool.icon className="w-6 h-6" style={{ color: activeCategory.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: colors.deepPurple }}>{tool.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: colors.mediumGray }}>{tool.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Category indicator dots */}
        <div className="flex justify-center gap-2 mt-6">
          {toolCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: activeTab === cat.id ? cat.color : colors.softBlush,
                transform: activeTab === cat.id ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// JOURNEY SECTION - Interactive Timeline
// ============================================================================

const journeySteps = [
  {
    num: '1',
    title: 'Analyse',
    subtitle: 'Het Fundament',
    color: colors.iconOrange,
    summary: 'We ontdekken je valkuilen',
    details: [
      'Diepte-intake van wie jij bent',
      'AI legt blinde vlekken bloot',
      'Profiel reset op basis van data',
    ],
    result: 'Je weet exact wat je moet fixen',
  },
  {
    num: '2',
    title: 'Training',
    subtitle: 'Actie & Groei',
    color: colors.iconPurple,
    summary: 'Je ontwikkelt nieuwe skills',
    details: [
      'Dagelijkse video\'s en opdrachten',
      'Oefen met de Chat Coach',
      'Direct toepassen in de praktijk',
    ],
    result: 'Skills die je leven lang blijven',
  },
  {
    num: '3',
    title: 'Succes',
    subtitle: 'Meesterschap',
    color: colors.iconMint,
    summary: 'Van onzekerheid naar kracht',
    details: [
      'Mindset transformatie',
      'Date strategie zonder stress',
      'Je wordt je eigen coach',
    ],
    result: 'Daten vanuit kracht, niet schaarste',
  },
];

function JourneySection() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: colors.deepPurple }}>
            Jouw reis naar succes
          </h2>
          <p style={{ color: colors.mediumGray }}>Klik op een fase voor meer details</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection line */}
          <div
            className="hidden md:block absolute top-12 left-0 right-0 h-1 rounded-full"
            style={{ backgroundColor: colors.softBlush }}
          />

          <div className="grid md:grid-cols-3 gap-6 md:gap-4">
            {journeySteps.map((step, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {/* Step card */}
                <motion.div
                  className={`rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                    expandedStep === i ? 'shadow-xl' : 'hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: expandedStep === i ? colors.softBlush : 'white',
                    borderColor: expandedStep === i ? step.color : colors.softBlush,
                  }}
                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  whileHover={{ y: -2 }}
                >
                  {/* Number badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-md"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.num}
                    </div>
                    <motion.div
                      animate={{ rotate: expandedStep === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5" style={{ color: colors.mediumGray }} />
                    </motion.div>
                  </div>

                  <h3 className="text-xl font-bold mb-1" style={{ color: colors.deepPurple }}>{step.title}</h3>
                  <p className="text-sm mb-2" style={{ color: step.color }}>{step.subtitle}</p>
                  <p className="text-sm" style={{ color: colors.charcoal }}>{step.summary}</p>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedStep === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t" style={{ borderColor: `${step.color}30` }}>
                          <ul className="space-y-2 mb-4">
                            {step.details.map((detail, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm" style={{ color: colors.charcoal }}>
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: step.color }} />
                                {detail}
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm font-semibold" style={{ color: step.color }}>
                            → {step.result}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/register">
            <Button
              className="text-white px-8 py-4 rounded-full shadow-lg font-semibold text-lg"
              style={{ backgroundColor: colors.warmCoral, boxShadow: '0 4px 12px var(--color-warm-coral-shadow, rgba(255, 123, 84, 0.25))' }}
            >
              Begin jouw reis →
            </Button>
          </Link>
          <p className="text-sm mt-3" style={{ color: colors.mediumGray }}>
            Geen creditcard nodig • 30 dagen garantie
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING SECTION
// ============================================================================

function PricingSection() {
  const router = useRouter();

  const plans = [
    {
      name: 'Kickstart',
      subtitle: '21 dagen snelle start',
      oldPrice: '€97',
      price: '€47',
      color: colors.deepPurple,
      features: ['21-Dagen Video Challenge', 'AI Foto Check (Onbeperkt)', 'Bio Builder', 'Werkboek & Templates'],
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
      badge: 'MEEST GEKOZEN',
      features: ['Alles uit Kickstart +', '12 Module Video Academy', 'Pro AI Suite (90 dagen)', '24/7 Chat Coach', '3x Live Q&A'],
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
      badge: 'MAX 10/MAAND',
      features: ['Alles uit Transformatie +', '60 min Video Intake', '6x 1-op-1 Coaching', 'WhatsApp Support', 'Levenslang Toegang'],
      cta: 'Start VIP',
      variant: 'vip' as const,
      slug: 'vip',
    },
  ];

  return (
    <section className="py-24 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Kies jouw route
          </h2>
          <p style={{ color: colors.mediumGray }}>Van snelle fix tot complete transformatie</p>
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
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors.deepPurple }}>{plan.name}</h3>
                <p className="text-sm mb-4" style={{ color: colors.mediumGray }}>{plan.subtitle}</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-lg line-through" style={{ color: colors.mediumGray }}>{plan.oldPrice}</span>
                  <span className="text-4xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
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
                  onClick={() => router.push(`/register?program=${plan.slug}`)}
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
// REVIEWS SECTION - Compact Carousel Style
// ============================================================================

function ReviewsSection() {
  const reviews = [
    { quote: 'Na 3 weken mijn eerste echte date. 3x meer matches binnen 48 uur!', name: 'Mark, 29', program: 'Transformatie' },
    { quote: 'Eindelijk snap ik wat ik fout deed. Uit de friend zone, eindelijk!', name: 'Lisa, 32', program: 'Transformatie' },
    { quote: 'Beste investering ooit. Complimenten over mijn openingszinnen!', name: 'Tom, 27', program: 'Kickstart' },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: colors.deepPurple }}>
            Echte resultaten
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-6 border-2"
              style={{ borderColor: colors.dustyRose, backgroundColor: colors.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-4 leading-relaxed" style={{ color: colors.charcoal }}>
                "{review.quote}"
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm" style={{ color: colors.deepPurple }}>{review.name}</span>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: colors.dustyRose, color: 'white' }}>
                  {review.program}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA SECTION
// ============================================================================

function FinalCTASection() {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.softBlush }}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Klaar om te starten?
          </h2>
          <p className="mb-8" style={{ color: colors.charcoal }}>
            Ontdek je dating patroon in 2 minuten
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz/dating-patroon">
              <Button
                className="text-white px-8 py-4 rounded-full shadow-xl font-semibold text-lg flex items-center gap-2"
                style={{ backgroundColor: colors.warmCoral, boxShadow: '0 4px 12px var(--color-warm-coral-shadow, rgba(255, 123, 84, 0.25))' }}
              >
                <Sparkles className="w-5 h-5" />
                Doe de Gratis Quiz
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                className="px-8 py-4 rounded-full font-semibold"
                style={{ borderColor: colors.deepPurple, color: colors.deepPurple }}
              >
                Direct Registreren
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { icon: Zap, text: 'Direct toegang' },
              { icon: Lock, text: 'Geen creditcard' },
              { icon: Shield, text: '30 dagen garantie' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: colors.mediumGray }}>
                <item.icon className="w-4 h-4" style={{ color: colors.sageGreen }} />
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

function BlogSection() {
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
              Dating tips & advies
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
            Dating tips & advies
          </h2>
          <p style={{ color: colors.mediumGray }}>Inspiratie van onze experts</p>
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
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/homepage-v4" className="flex items-center gap-2 mb-3">
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
              Jouw persoonlijke datingcoach: altijd beschikbaar, veilig en eerlijk advies.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: colors.mediumGray }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Over ons */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Over ons</h4>
            <ul className="space-y-2">
              {footerLinks.overOns.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: colors.mediumGray }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: colors.mediumGray }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.charcoal }}>Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: colors.mediumGray }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: colors.softBlush }}>
          <p className="text-sm" style={{ color: colors.mediumGray }}>
            © {new Date().getFullYear()} DatingAssistent.nl. Alle rechten voorbehouden.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: colors.mediumGray }}>Volg ons:</span>
            <div className="flex gap-3">
              {[
                { name: 'Instagram', href: 'https://instagram.com/datingassistent' },
                { name: 'TikTok', href: 'https://tiktok.com/@datingassistent' },
                { name: 'YouTube', href: 'https://youtube.com/@datingassistent' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                  style={{ color: colors.deepPurple }}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function HomePageV4() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur" style={{ borderColor: colors.softBlush }}>
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/over-ons" className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100" style={{ color: colors.charcoal }}>
              Over Ons
            </Link>
            <Link href="/prijzen" className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100" style={{ color: colors.charcoal }}>
              Prijzen
            </Link>
            <Link href="/blog" className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100" style={{ color: colors.charcoal }}>
              Blog
            </Link>
            <Link href="/kennisbank" className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100" style={{ color: colors.charcoal }}>
              Kennisbank
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm transition-colors hover:opacity-80" style={{ color: colors.charcoal }}>
              Inloggen
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-white font-semibold px-5 py-2 rounded-full" style={{ backgroundColor: colors.warmCoral }}>
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />
      <ProblemSection />
      <ToolsSection />
      <JourneySection />
      <PricingSection />
      <ReviewsSection />
      <BlogSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
