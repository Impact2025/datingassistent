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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

/**
 * PALET 1: "Warm Vertrouwen"
 *
 * Primaire kleuren:
 * - Deep Purple (Bordeaux): #722F37 (headers, logo, navigatie)
 * - Dusty Rose: #E3867D (secundaire accenten, secties)
 * - Soft Blush: #F5E6E8 (achtergronden, cards)
 *
 * Accent kleuren:
 * - Warm Coral: #FF7B54 (CTA buttons)
 * - Sage Green: #A8B5A0 (success states, vertrouwen)
 * - Cream: #FFF8F3 (hoofdachtergrond)
 *
 * Typografie:
 * - Hoofdtekst: #2D3142 (warm donkergrijs)
 * - Secundaire tekst: #6B6B6B
 */

const colors = {
  deepPurple: '#722F37',      // Eigenlijk bordeaux/wijnrood
  dustyRose: '#E3867D',       // Secundaire accenten
  softBlush: '#F5E6E8',       // Achtergronden, cards
  warmCoral: '#FF7B54',       // CTA buttons
  sageGreen: '#A8B5A0',       // Success states
  cream: '#FFF8F3',           // Hoofdachtergrond
  textPrimary: '#2D3142',     // Warm donkergrijs
  textSecondary: '#6B6B6B',   // Secundaire tekst
};

// Custom Video Player with Palet 1 colors
function IrisVideoPlayerV3() {
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
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <motion.div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: colors.textPrimary }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0.3, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Decorative gradient border - Deep Purple to Dusty Rose */}
        <div
          className="absolute inset-0 rounded-3xl p-[3px] -z-10"
          style={{ background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.dustyRose})` }}
        />

        <div className="relative aspect-video rounded-3xl overflow-hidden" style={{ backgroundColor: colors.textPrimary }}>
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
            Je browser ondersteunt geen video.
          </video>

          {!isLoaded && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: colors.textPrimary }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="w-12 h-12 border-4 rounded-full"
                  style={{ borderColor: `${colors.dustyRose}30`, borderTopColor: colors.dustyRose }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p style={{ color: colors.softBlush }} className="text-sm">Video laden...</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group"
                onClick={handlePlay}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${colors.warmCoral}30` }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-shadow"
                    style={{ background: `linear-gradient(135deg, ${colors.warmCoral}, ${colors.dustyRose})` }}
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
            <motion.div
              className="absolute bottom-4 right-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={toggleMute}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </motion.div>
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
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center px-4">
              <Link href="/quiz/dating-patroon">
                <Button
                  className="text-white px-10 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all rounded-full flex items-center justify-center gap-3"
                  style={{ backgroundColor: colors.warmCoral }}
                >
                  Ontdek Je Dating Patroon
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
              <p className="mt-4 text-sm" style={{ color: colors.textSecondary }}>
                2 minuten • 10 vragen • Direct resultaat
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hero Section with Palet 1
function HeroSectionV3() {
  return (
    <section
      className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${colors.cream}, white)` }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8" style={{ color: colors.textPrimary }}>
                <span className="block mb-3">Daten is</span>
                <span className="block mb-3">geen geluk.</span>
                <span
                  className="block"
                  style={{
                    background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.dustyRose})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Het is een
                </span>
                <span
                  className="block"
                  style={{
                    background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.dustyRose})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  patroon.
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-xl sm:text-2xl md:text-3xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              style={{ color: colors.textPrimary }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Ontdek in 2 minuten waarom je steeds op de verkeerde valt.
            </motion.p>

            <motion.p
              className="text-base sm:text-lg max-w-xl mx-auto lg:mx-0"
              style={{ color: colors.textSecondary }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Gratis quiz gebaseerd op attachment theory
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/quiz/dating-patroon">
                <Button
                  className="text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all rounded-full flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.warmCoral }}
                >
                  Start de Gratis Quiz
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm self-center" style={{ color: colors.textSecondary }}>
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
            <IrisVideoPlayerV3 />
          </motion.div>
        </div>

        {/* Social Proof Bar */}
        <motion.div
          className="mt-12 pt-8 border-t"
          style={{ borderColor: colors.softBlush }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
              <Tv className="w-5 h-5" style={{ color: colors.dustyRose }} />
              <span className="text-sm font-medium">10+ Jaar ervaring (Bekend van TV)</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
              <Lock className="w-5 h-5" style={{ color: colors.sageGreen }} />
              <span className="text-sm font-medium">100% Privacy & Veilig</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
              <Flag className="w-5 h-5" style={{ color: colors.warmCoral }} />
              <span className="text-sm font-medium">Nederlands product</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Program Cards with Palet 1
function ProgramCardsV3() {
  const router = useRouter();

  const handleSelectProgram = (slug: string) => {
    router.push(`/register?program=${slug}`);
  };

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-lg leading-relaxed" style={{ color: colors.textPrimary }}>
          Investeer in jezelf. Een traditionele coach kost €150 per uur. Met DatingAssistent krijg je maandenlange begeleiding voor de prijs van één etentje.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        {/* Plan 1: Kickstart */}
        <Card className="relative h-full flex flex-col transition-all hover:shadow-lg" style={{ borderColor: colors.softBlush, borderWidth: '2px', backgroundColor: 'white' }}>
          <CardContent className="p-8 space-y-6 flex flex-col flex-grow">
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Kickstart</h3>
              <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                Snel resultaat in 21 dagen
              </p>
            </div>

            <div className="text-center py-4 border-y" style={{ borderColor: colors.softBlush }}>
              <Badge className="text-white px-3 py-1 text-xs font-bold mb-2" style={{ backgroundColor: colors.sageGreen }}>
                EARLYBIRD t/m 25 januari
              </Badge>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-2xl line-through" style={{ color: colors.textSecondary }}>€97</span>
                <span className="text-5xl font-bold" style={{ color: colors.textPrimary }}>€47</span>
              </div>
            </div>

            <div className="space-y-3 flex-grow">
              <ul className="space-y-3">
                {['21-Dagen Video Challenge', 'AI Foto Check (Onbeperkt)', 'Bio Builder (AI schrijft je tekst)', 'Kickstart Werkboek & Templates'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: colors.textPrimary }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.sageGreen }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleSelectProgram('kickstart')}
              variant="outline"
              className="w-full"
              style={{ borderColor: colors.deepPurple, color: colors.deepPurple }}
            >
              Meer informatie
            </Button>
          </CardContent>
        </Card>

        {/* Plan 2: Transformatie (HERO) */}
        <Card
          className="relative h-full flex flex-col transition-all hover:shadow-2xl md:scale-105 shadow-xl"
          style={{ borderColor: colors.warmCoral, borderWidth: '4px', backgroundColor: 'white' }}
        >
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="text-white px-4 py-2 text-sm font-bold shadow-lg" style={{ backgroundColor: colors.warmCoral }}>
              ONZE AANRADER
            </Badge>
          </div>

          <CardContent className="p-8 space-y-6 flex flex-col flex-grow pt-12">
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Transformatie</h3>
              <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                De complete opleiding tot succesvol daten
              </p>
            </div>

            <div className="text-center py-4 border-y" style={{ borderColor: colors.softBlush }}>
              <Badge className="text-white px-3 py-1 text-xs font-bold mb-2" style={{ backgroundColor: colors.sageGreen }}>
                EARLYBIRD t/m 25 januari
              </Badge>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-2xl line-through" style={{ color: colors.textSecondary }}>€297</span>
                <span className="text-5xl font-bold" style={{ color: colors.warmCoral }}>€147</span>
              </div>
            </div>

            <div className="space-y-3 flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm" style={{ color: colors.textPrimary }}>
                  <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.warmCoral }} />
                  <span className="font-medium">Alles uit Kickstart, plus:</span>
                </li>
                {['Complete Video Academy (12 Modules)', 'Pro AI Suite (90 Dagen onbeperkt)', '24/7 Chat Coach & Match Analyse', '3x Live Q&A Sessies'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: colors.textPrimary }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.sageGreen }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleSelectProgram('transformatie')}
              className="w-full text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.warmCoral }}
            >
              Kies dit programma
            </Button>
          </CardContent>
        </Card>

        {/* Plan 3: VIP Reis */}
        <Card
          className="relative h-full flex flex-col transition-all hover:shadow-lg"
          style={{
            borderColor: colors.deepPurple,
            borderWidth: '2px',
            background: `linear-gradient(to bottom, ${colors.softBlush}80, white)`
          }}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="text-white px-3 py-1 text-xs font-bold shadow-md" style={{ backgroundColor: colors.deepPurple }}>
              MAX 10 PLEKKEN/MAAND
            </Badge>
          </div>

          <CardContent className="p-8 space-y-6 flex flex-col flex-grow pt-10">
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>VIP Reis</h3>
              <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                6 maanden persoonlijke begeleiding
              </p>
            </div>

            <div className="text-center py-4 border-y" style={{ borderColor: colors.softBlush }}>
              <Badge className="text-white px-3 py-1 text-xs font-bold mb-2" style={{ backgroundColor: colors.sageGreen }}>
                EARLYBIRD t/m 25 januari
              </Badge>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-2xl line-through" style={{ color: colors.textSecondary }}>€997</span>
                <span className="text-5xl font-bold" style={{ color: colors.deepPurple }}>€797</span>
              </div>
            </div>

            <div className="space-y-3 flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm" style={{ color: colors.textPrimary }}>
                  <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.deepPurple }} />
                  <span className="font-medium">Alles uit Transformatie, plus:</span>
                </li>
                {['Persoonlijke Intake (60 min video)', '6x 1-op-1 Coaching Calls', 'WhatsApp Support (Directe lijn)', 'Professionele Fotoshoot Planning', 'Levenslang Toegang tot alles'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: colors.textPrimary }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.sageGreen }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleSelectProgram('vip')}
              className="w-full text-white font-semibold"
              style={{ backgroundColor: colors.deepPurple }}
            >
              Start VIP Traject
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <AlertCircle className="w-4 h-4" style={{ color: colors.deepPurple }} />
              <p className="text-xs font-medium" style={{ color: colors.deepPurple }}>
                Beperkte plekken beschikbaar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-center gap-3">
          <Lock className="w-5 h-5" style={{ color: colors.textSecondary }} />
          <p className="text-base font-medium" style={{ color: colors.textPrimary }}>
            Probeer het risicoloos: Op alle plannen geldt een 30 dagen niet-goed-geld-terug garantie.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main Homepage V3 with Palet 1
export default function HomePageV3() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
      {/* Simple Header for Preview */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur" style={{ borderColor: colors.softBlush }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/homepage-v3" className="text-xl font-bold" style={{ color: colors.deepPurple }}>
            DatingAssistent
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: colors.softBlush, color: colors.deepPurple }}>
              PALET 1: Warm Vertrouwen
            </span>
            <Link href="/">
              <Button variant="outline" size="sm" style={{ borderColor: colors.deepPurple, color: colors.deepPurple }}>
                Bekijk Origineel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <HeroSectionV3 />

      {/* Sectie 2: Het Probleem */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.textPrimary }}>Herken je dit?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Pijn Blok 1 */}
            <div
              className="rounded-2xl p-8 border-2 hover:shadow-xl transition-all space-y-4"
              style={{ borderColor: colors.softBlush, backgroundColor: 'white' }}
            >
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: colors.warmCoral }}
              >
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center" style={{ color: colors.textPrimary }}>De Match-Droogte</h3>
              <p className="text-center leading-relaxed" style={{ color: colors.textPrimary }}>
                Je swipet je een ongeluk, maar de leuke matches blijven uit.
              </p>
            </div>

            {/* Pijn Blok 2 */}
            <div
              className="rounded-2xl p-8 border-2 hover:shadow-xl transition-all space-y-4"
              style={{ borderColor: colors.softBlush, backgroundColor: 'white' }}
            >
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: colors.dustyRose }}
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center" style={{ color: colors.textPrimary }}>De Gespreks-Dood</h3>
              <p className="text-center leading-relaxed" style={{ color: colors.textPrimary }}>
                Leuke matches veranderen in penfriends of bloeden dood na &apos;Hoi, hoe is het?&apos;
              </p>
            </div>

            {/* Pijn Blok 3 */}
            <div
              className="rounded-2xl p-8 border-2 hover:shadow-xl transition-all space-y-4"
              style={{ borderColor: colors.softBlush, backgroundColor: 'white' }}
            >
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: colors.deepPurple }}
              >
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center" style={{ color: colors.textPrimary }}>De &apos;Situationship&apos;</h3>
              <p className="text-center leading-relaxed" style={{ color: colors.textPrimary }}>
                Je trekt partners aan die zich niet willen binden of ineens verdwijnen (ghosting).
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl md:text-2xl font-semibold max-w-3xl mx-auto" style={{ color: colors.textPrimary }}>
              Het ligt niet aan jou. Het ligt aan je strategie. En die gaan we samen fixen.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 px-4" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.textPrimary }}>Jouw 24/7 Wingman Team</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textPrimary }}>
              Van foto-analyse tot gesprekshulp—AI-tools die je direct verder helpen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: User, title: 'Profiel Coach', subtitle: 'Nooit meer raden wat werkt', desc: 'AI analyseert foto\'s, bio en selectie. Krijg 7-12 concrete verbeteringen → gemiddeld 3x meer matches binnen 48 uur', color: colors.dustyRose },
              { icon: MessageCircle, title: '24/7 Chat Coach', subtitle: 'Weet altijd wat je moet zeggen', desc: 'Match krijgen? Check. Gesprek doodlopen? Never again. Real-time suggesties gebaseerd op context', color: colors.deepPurple },
              { icon: Sparkles, title: 'Opener Lab', subtitle: 'Stop met "Hey, hoe gaat ie?"', desc: 'Originele openingszinnen op basis van hun profiel. 64% respons rate vs 12% met standaard openers', color: colors.warmCoral },
              { icon: TrendingUp, title: 'Match Analyse', subtitle: 'Begrijp wie past bij jou', desc: 'AI vergelijkt profielen en voorspelt compatibiliteit. Focus op matches met potentie, bespaar tijd', color: colors.dustyRose },
              { icon: Play, title: 'AI Foto Check', subtitle: 'Professionele feedback in seconden', desc: 'Upload foto → AI geeft score + verbeterpunten. Welke foto\'s werken? Welke weg? Data-driven keuzes', color: colors.deepPurple },
              { icon: Calendar, title: 'Date Planner', subtitle: 'Van "koffie?" naar onvergetelijk', desc: 'AI bedenkt creatieve date-ideeën op basis van jullie interesses. Inclusief gesprekstarters', color: colors.warmCoral },
              { icon: CheckCircle, title: 'Voortgang Tracker', subtitle: 'Zie je groei week na week', desc: 'Track matches, gesprekken, dates. Zie wat werkt en leer van je successen', color: colors.sageGreen },
              { icon: Shield, title: 'Veiligheid Check', subtitle: 'Date veilig, date slim', desc: 'AI herkent rode vlaggen en catfish signalen. Dating tips voor veilige eerste dates', color: colors.sageGreen },
            ].map((tool, i) => (
              <div
                key={i}
                className="space-y-4 p-6 rounded-xl bg-white border hover:shadow-lg transition-all group"
                style={{ borderColor: colors.softBlush }}
              >
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${tool.color}20` }}
                >
                  <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>{tool.title}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: colors.textPrimary }}>
                    <strong>{tool.subtitle}</strong>
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                    {tool.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 px-4" style={{ background: `linear-gradient(to br, ${colors.cream}, white)` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.textPrimary }}>Van intake tot zelfverzekerde date: Jouw reis</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textPrimary }}>
              Geen snelle trucjes, maar een bewezen proces van inzicht, ontwikkeling en resultaat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Analyse & Inzicht', badge: 'Het Fundament', color: colors.dustyRose, items: ['Diepte-Intake: We starten met een uitgebreide scan van wie jij bent en wat je zoekt.', 'Blinde Vlekken: AI & video-analyse leggen direct bloot waar het nu misgaat.', 'Profiel Reset: We bouwen een nieuw profiel op basis van data, niet op de gok.'], conclusion: 'Je weet precies wat je valkuilen zijn en hoe je ze fixt.' },
              { num: '2', title: 'Trainen & Toepassen', badge: 'Actie & Ontwikkeling', color: colors.deepPurple, items: ['Leren door doen: Dagelijkse video\'s en praktische opdrachten uit je werkboek.', '24/7 Begeleiding: Oefen gesprekken met de Chat Coach voordat je ze echt stuurt.', 'Veilig experimenteren: Pas nieuwe skills direct toe in de praktijk met onze steun.'], conclusion: 'Je ontwikkelt vaardigheden die je de rest van je leven houdt.' },
              { num: '3', title: 'Zelfvertrouwen & Succes', badge: 'Meesterschap', color: colors.warmCoral, items: ['Mindset Shift: We transformeren onzekerheid naar natuurlijke aantrekkingskracht.', 'Date Strategie: Van de eerste ontmoeting naar een vervolgdate (zonder stress).', 'Blijvende Groei: Je wordt je eigen datingcoach, klaar voor een duurzame relatie.'], conclusion: 'Je date niet meer vanuit schaarste, maar vanuit kracht.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div
                  className="bg-white rounded-2xl p-8 border-2 hover:shadow-xl transition-all space-y-6"
                  style={{ borderColor: `${step.color}50` }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}
                    >
                      <span className="text-2xl font-bold text-white">{step.num}</span>
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${step.color}20`, color: step.color }}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{step.title}</h3>
                    <div className="space-y-2 text-sm" style={{ color: colors.textPrimary }}>
                      {step.items.map((item, j) => (
                        <p key={j}>✓ {item}</p>
                      ))}
                    </div>
                    <div className="pt-2 border-t" style={{ borderColor: colors.softBlush }}>
                      <p className="text-xs font-semibold" style={{ color: step.color }}>
                        {step.conclusion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-16 text-center rounded-2xl p-8 border"
            style={{
              background: `linear-gradient(to r, ${colors.softBlush}80, ${colors.dustyRose}30)`,
              borderColor: colors.softBlush
            }}
          >
            <p className="mb-6 text-lg" style={{ color: colors.textPrimary }}>
              <strong>Klaar om te beginnen?</strong> Het kost letterlijk 60 seconden om je account aan te maken
            </p>
            <Link href="/register">
              <Button
                className="text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
                style={{ backgroundColor: colors.warmCoral }}
              >
                Start gratis →
              </Button>
            </Link>
            <p className="text-sm mt-4" style={{ color: colors.textSecondary }}>
              ✓ Geen creditcard nodig • ✓ Direct toegang • ✓ 30 dagen geld-terug garantie
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programmas" className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold" style={{ color: colors.textPrimary }}>
              Kies jouw route naar succes
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
              Van snelle profiel-fix tot complete transformatie met persoonlijke begeleiding
            </p>
          </div>

          <ProgramCardsV3 />

          <div className="mt-16 text-center">
            <p className="flex items-center justify-center gap-2" style={{ color: colors.textSecondary }}>
              <span className="text-2xl">💰</span>
              <span className="font-medium">30 dagen geld-terug garantie</span>
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 px-4" style={{ background: `linear-gradient(to br, ${colors.cream}, white)` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.textPrimary }}>Resultaten van mensen zoals jij</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textPrimary }}>
              Echte verhalen van mensen die hun dating leven transformeerden
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: 'Na 3 weken mijn eerste echte date. De AI Foto Check liet me direct zien wat er mis was met mijn profiel. Binnen 2 dagen had ik 3x meer matches!', name: 'Mark, 29 jaar', program: 'Transformatie programma' },
              { quote: 'Eindelijk snap ik wat ik fout deed. De Chat Coach hielp me uit de \'friend zone\' en ik weet nu precies hoe ik flirty maar authentiek kan zijn.', name: 'Lisa, 32 jaar', program: 'Transformatie programma' },
              { quote: 'De Kickstart was perfect. Mijn profiel is nu top en ik krijg complimenten over mijn openingszinnen. Dit is echt de beste investering die ik heb gedaan.', name: 'Tom, 27 jaar', program: 'Kickstart programma' },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border-2 hover:shadow-xl transition-all space-y-4"
                style={{ borderColor: colors.softBlush }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="leading-relaxed italic" style={{ color: colors.textPrimary }}>
                  &quot;{review.quote}&quot;
                </p>
                <div className="pt-4 border-t" style={{ borderColor: colors.softBlush }}>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>{review.name}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{review.program}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4" style={{ background: `linear-gradient(to br, ${colors.softBlush}50, white)` }}>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <Card className="border-2 shadow-xl bg-white" style={{ borderColor: colors.dustyRose }}>
            <CardContent className="p-8 text-center space-y-6">
              <h3 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                Stop met wachten. Start met groeien.
              </h3>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${colors.dustyRose}20` }}>
                  <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: colors.dustyRose }} />
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Gratis starten</p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${colors.deepPurple}20` }}>
                  <Sparkles className="w-5 h-5 mx-auto mb-1" style={{ color: colors.deepPurple }} />
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Direct toegang</p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${colors.sageGreen}20` }}>
                  <TrendingUp className="w-5 h-5 mx-auto mb-1" style={{ color: colors.sageGreen }} />
                  <p className="text-xs" style={{ color: colors.textSecondary }}>30 dagen garantie</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 transition-all cursor-pointer hover:shadow-lg" style={{ borderColor: colors.dustyRose, background: `linear-gradient(to r, ${colors.softBlush}50, ${colors.dustyRose}20)` }}>
              <Link href="/quiz">
                <CardContent className="p-6 text-center relative">
                  <Badge
                    className="absolute top-3 right-3 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium"
                    style={{ backgroundColor: colors.warmCoral }}
                  >
                    Tip
                  </Badge>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.dustyRose}30` }}>
                    <Sparkles className="w-6 h-6" style={{ color: colors.dustyRose }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: colors.dustyRose }}>
                    Doe de Quiz
                  </h3>
                  <p className="text-sm mb-2" style={{ color: colors.textPrimary }}>
                    Ontdek je dating stijl
                  </p>
                  <p className="text-xs italic mb-4" style={{ color: colors.dustyRose }}>
                    "Krijg binnen 2 minuten inzicht in jouw valkuilen"
                  </p>
                  <Button
                    className="w-full text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                    style={{ background: `linear-gradient(to r, ${colors.warmCoral}, ${colors.dustyRose})` }}
                  >
                    Gratis Starten
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer bg-white" style={{ borderColor: colors.softBlush }}>
              <Link href="/register">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.deepPurple}20` }}>
                    <Users className="w-6 h-6" style={{ color: colors.deepPurple }} />
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
                    Direct Beginnen
                  </h3>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                    Maak gratis een account
                  </p>
                  <Button variant="outline" className="w-full" style={{ borderColor: colors.deepPurple, color: colors.deepPurple }}>
                    Registreren
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-4 border-t bg-white" style={{ borderColor: colors.softBlush }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            © 2024 DatingAssistent - Dit is een preview van Palet 1 "Warm Vertrouwen"
          </p>
          <div className="mt-4 flex justify-center gap-8">
            <Link href="/" className="text-sm hover:underline" style={{ color: colors.deepPurple }}>
              ← Terug naar originele homepage
            </Link>
            <Link href="/homepage-v2" className="text-sm hover:underline" style={{ color: colors.dustyRose }}>
              Bekijk Palet 2 →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
