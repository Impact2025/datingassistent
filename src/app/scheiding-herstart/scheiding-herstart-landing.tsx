'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/public-header';
import {
  Heart,
  Shield,
  Sparkles,
  Clock,
  CheckCircle,
  Star,
  ChevronDown,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { ScheidingHerstartFlow } from '@/components/scheiding-herstart/scheiding-herstart-flow';

const c = {
  deepPurple: '#722F37',
  softBlush: '#F5E6E8',
  cream: '#FFF8F3',
  warmCoral: '#FF7B54',
  sageGreen: '#A8B5A0',
  charcoal: '#2D3142',
  mediumGray: '#6B6B6B',
  roseGold: '#B76E79',
  royalPurple: '#6B4D8A',
  rose: '#f43f5e',
  dustyRose: '#E3867D',
};

// ============================================================================
// HERO
// ============================================================================

function HeroSection() {
  return (
    <section id="scan" className="relative py-10 sm:py-14 lg:py-20 px-4 overflow-hidden" style={{ backgroundColor: c.cream }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* LEFT: Copy */}
          <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-5"
                style={{ backgroundColor: c.softBlush, color: c.deepPurple }}
              >
                <Sparkles className="w-4 h-4" />
                Gratis scan · Direct resultaat
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-black leading-[1.05] mb-5">
                <span style={{ color: c.charcoal }}>Opnieuw daten</span>
                <br />
                <span style={{ color: c.charcoal }}>na een scheiding:</span>
                <br />
                <span style={{ color: c.rose }}>wanneer ben je klaar</span>
                <br />
                <span style={{ color: c.rose }}>en hoe begin je?</span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg sm:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0"
              style={{ color: c.charcoal }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              Doe de scan in 4 minuten en ontdek eerlijk waar jij staat — inclusief rebound risico check en een persoonlijk actieplan.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { icon: Clock, text: '± 4 minuten' },
                { icon: Heart, text: '12 vragen' },
                { icon: Shield, text: '100% privé' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: c.mediumGray }}>
                  <item.icon className="w-4 h-4" style={{ color: c.rose }} />
                  {item.text}
                </div>
              ))}
            </motion.div>

            {/* Artikel link */}
            <motion.p
              className="text-xs"
              style={{ color: c.mediumGray }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Gebaseerd op ons artikel:{' '}
              <Link
                href="/blog/opnieuw-daten-na-een-scheiding-wanneer-ben-je-klaar-en-hoe-begin-je"
                className="underline hover:text-gray-700"
              >
                Opnieuw daten na een scheiding
              </Link>
            </motion.p>
          </div>

          {/* RIGHT: Scan widget */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ScheidingHerstartFlow />
          </motion.div>
        </div>

        {/* Trust bar */}
        <motion.div
          className="mt-12 pt-8 border-t flex flex-wrap items-center justify-center gap-8"
          style={{ borderColor: c.softBlush }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { text: 'AVG-proof · geen spam' },
            { text: 'Nederlands product' },
            { text: 'Gebaseerd op wetenschappelijk onderzoek' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: c.mediumGray }}>
              <CheckCircle className="w-4 h-4" style={{ color: c.sageGreen }} />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PAIN SECTION
// ============================================================================

function PainSection() {
  const pains = [
    {
      icon: Heart,
      title: 'Je mist je ex — maar wil je verder',
      desc: 'Je wil opnieuw liefde, maar je weet niet of je los genoeg bent. De scan laat zien waar je echt staat.',
      color: c.rose,
    },
    {
      icon: Clock,
      title: 'Wanneer is "te vroeg" te vroeg?',
      desc: 'Niemand kan je dat exact vertellen — maar op basis van jouw antwoorden geeft de scan een eerlijk beeld.',
      color: c.royalPurple,
    },
    {
      icon: Shield,
      title: 'Je kinderen staan voorop. Maar jij ook.',
      desc: 'De scan houdt rekening met je gezinssituatie en geeft advies dat werkt voor jou als ouder.',
      color: c.sageGreen,
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: c.deepPurple }}>
            Herken je dit?
          </h2>
          <p className="text-lg" style={{ color: c.mediumGray }}>
            Je staat er niet alleen voor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-2xl border-2 bg-white"
              style={{ borderColor: c.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${pain.color}18` }}
              >
                <pain.icon className="w-6 h-6" style={{ color: pain.color }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: c.deepPurple }}>{pain.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: c.mediumGray }}>{pain.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// RESULTS SECTION
// ============================================================================

function ResultsSection() {
  const results = [
    {
      emoji: '🧭',
      title: 'Jouw Herstart-profiel',
      desc: 'Heler, Waker, Starter of Bloeier — met uitleg wat dit betekent voor jou en je volgende stap.',
    },
    {
      emoji: '⚡',
      title: 'Rebound Risico Indicator',
      desc: 'Is jouw timing laag, gemiddeld of hoog risico? Eerlijk en onderbouwd — geen oordeel, wel inzicht.',
    },
    {
      emoji: '📋',
      title: 'Persoonlijk 3-fase actieplan',
      desc: 'Wat doe je de eerste week, de eerste maand en na 3 maanden? Concreet en op jouw situatie afgestemd.',
    },
    {
      emoji: '💌',
      title: 'Volledige analyse per mail',
      desc: 'Jouw rapport wordt ook naar je inbox gestuurd zodat je het rustig kunt teruglezen.',
    },
  ];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: c.cream }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: c.deepPurple }}>
            Wat je ontdekt na de scan
          </h2>
          <p style={{ color: c.mediumGray }}>
            Alles wat je nodig hebt om een eerlijk besluit te nemen.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {results.map((r, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-6 border-2 flex items-start gap-4"
              style={{ borderColor: c.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-3xl leading-none mt-1">{r.emoji}</span>
              <div>
                <h3 className="font-bold mb-1" style={{ color: c.deepPurple }}>{r.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: c.mediumGray }}>{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS
// ============================================================================

function HowItWorksSection() {
  const steps = [
    {
      num: '1',
      title: 'Beantwoord 12 vragen',
      desc: '4 minuten eerlijk over jezelf. Geen goede of foute antwoorden — alleen jouw situatie.',
      color: c.rose,
    },
    {
      num: '2',
      title: 'AI analyseert je situatie',
      desc: 'Op basis van je antwoorden én context: hoelang geleden, kinderen, duur van de relatie.',
      color: c.royalPurple,
    },
    {
      num: '3',
      title: 'Persoonlijk rapport',
      desc: 'Direct online én in je inbox: jouw profiel, rebound risico en concreet actieplan.',
      color: c.sageGreen,
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: c.deepPurple }}>
            Hoe het werkt
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div
            className="hidden md:block absolute top-8 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-0.5"
            style={{ backgroundColor: c.softBlush }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg mx-auto mb-4 relative z-10"
                style={{ backgroundColor: step.color }}
              >
                {step.num}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: c.deepPurple }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: c.mediumGray }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// VIDEO SECTION
// ============================================================================

function VideoSection() {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: c.cream }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: c.deepPurple }}>
            Opnieuw daten na een scheiding
          </h2>
          <p style={{ color: c.mediumGray }}>
            Bekijk de video en ontdek wat de wetenschap zegt over timing en hoe je gezond opnieuw begint.
          </p>
        </motion.div>

        <motion.div
          className="relative rounded-2xl overflow-hidden shadow-xl"
          style={{ border: `2px solid ${c.softBlush}` }}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/BJvoVKqbadc"
              title="Opnieuw daten na een scheiding"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-white px-7 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto"
            style={{ backgroundColor: c.rose }}
          >
            <Sparkles className="w-4 h-4" />
            Doe de scan nu gratis
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

function TestimonialsSection() {
  const reviews = [
    {
      initials: 'SV',
      color: c.rose,
      quote: 'Na 12 jaar huwelijk wist ik echt niet waar ik stond. De scan zei "Waker" — en dat klopte precies. Eindelijk woorden voor wat ik voelde.',
      name: 'Sandra V.',
      location: 'Leiden',
      timeAgo: '3 maanden geleden',
    },
    {
      initials: 'MR',
      color: c.royalPurple,
      quote: 'Het rebound risico was "hoog". Hard om te lezen, maar eerlijk. Ik heb een maand gewacht en dat was de juiste beslissing.',
      name: 'Mark R.',
      location: 'Den Haag',
      timeAgo: '5 weken geleden',
    },
    {
      initials: 'LB',
      color: c.sageGreen,
      quote: 'Ik verwachtte een of andere online quiz. Maar het actieplan was écht concreet. Week 1 stond er "schrijf op wat je wilt in een relatie". Dat had ik nog nooit gedaan.',
      name: 'Laura B.',
      location: 'Amsterdam',
      timeAgo: '2 maanden geleden',
    },
  ];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: c.cream }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: c.deepPurple }}>
            Wat anderen zeggen
          </h2>
          <p style={{ color: c.mediumGray }}>Ervaringen van mensen die de scan deden.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-6 border-2"
              style={{ borderColor: c.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: review.color }}
                >
                  {review.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm" style={{ color: c.deepPurple }}>{review.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.sageGreen }} />
                  </div>
                  <p className="text-xs" style={{ color: c.mediumGray }}>{review.location} · {review.timeAgo}</p>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: c.charcoal }}>
                "{review.quote}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ
// ============================================================================

const faqs = [
  {
    q: 'Hoe lang moet ik wachten na een scheiding voor ik ga daten?',
    a: 'Er is geen universele regel. Wetenschappelijk onderzoek suggereert dat mensen gemiddeld 1 tot 2 jaar nodig hebben om een langdurige relatie te verwerken — maar jouw tijdlijn hangt af van veel persoonlijke factoren. Precies wat deze scan in kaart brengt.',
  },
  {
    q: 'Is de scan ook nuttig als ik jonge kinderen heb?',
    a: 'Absoluut. De scan vraagt expliciet naar je gezinssituatie en past het advies daarop aan. Als je kinderen hebt, spelen andere factoren mee bij de timing van een nieuwe relatie — en dat wordt meegenomen in jouw persoonlijk profiel.',
  },
  {
    q: 'Wat als ik hoog scoor op het rebound risico?',
    a: 'Geen reden tot paniek — het is juist waardevol om dit te weten vóór je begint. Je actieplan geeft concrete stappen om dit risico te verlagen voordat je de datingapp weer opent. Eerlijk inzicht nu bespaart je teleurstelling later.',
  },
  {
    q: 'Is mijn e-mailadres verplicht?',
    a: 'Je vult je e-mail in om de volledige analyse te ontvangen. We sturen je daarna geen spam — alleen relevante tips over daten na een scheiding als je daarvoor kiest. Je kunt je altijd uitschrijven. Je data worden nooit gedeeld met derden.',
  },
  {
    q: 'Verschilt dit van een gewone dating quiz?',
    a: 'Ja. De scan is opgebouwd op basis van psychologisch onderzoek naar rouw, hechtingsstijlen en herstelprocessen na een relatie. De resultaten worden bovendien gecombineerd met je persoonlijke situatie (duur van de relatie, tijd na de scheiding, kinderen) via AI-analyse.',
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: c.deepPurple }}>
            Veelgestelde vragen
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border-2 rounded-2xl overflow-hidden"
              style={{ borderColor: c.softBlush }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold pr-4 text-sm sm:text-base" style={{ color: c.charcoal }}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5" style={{ color: c.mediumGray }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: c.mediumGray }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================

function FinalCTASection() {
  const scrollToScan = () => {
    document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 px-4" style={{ backgroundColor: c.softBlush }}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: c.deepPurple }}>
            Ontdek waar jij nu staat
          </h2>
          <p className="text-lg mb-8" style={{ color: c.charcoal }}>
            4 minuten eerlijk. Gratis. Direct inzicht.
          </p>

          <Button
            onClick={scrollToScan}
            className="text-white px-8 py-4 rounded-full shadow-xl font-semibold text-lg flex items-center gap-2 mx-auto"
            style={{ backgroundColor: c.rose }}
          >
            <Sparkles className="w-5 h-5" />
            Start de Gratis Scan
            <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { icon: Clock, text: '± 4 minuten' },
              { icon: Lock, text: 'Geen creditcard' },
              { icon: Shield, text: 'AVG-proof' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: c.mediumGray }}>
                <item.icon className="w-4 h-4" style={{ color: c.sageGreen }} />
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
// FOOTER
// ============================================================================

function SimpleFooter() {
  return (
    <footer className="py-8 px-4 border-t bg-white" style={{ borderColor: c.softBlush }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/LogoDA.png" alt="DatingAssistent" width={28} height={28} className="object-contain" />
          <span className="font-bold" style={{ color: c.deepPurple }}>DatingAssistent</span>
        </Link>

        <div className="flex flex-wrap justify-center gap-5 text-sm" style={{ color: c.mediumGray }}>
          <Link href="/blog" className="hover:underline">Blog</Link>
          <Link href="/kennisbank" className="hover:underline">Kennisbank</Link>
          <Link href="/prijzen" className="hover:underline">Prijzen</Link>
          <Link href="/privacyverklaring" className="hover:underline">Privacy</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>

        <p className="text-sm" style={{ color: c.mediumGray }}>
          © {new Date().getFullYear()} DatingAssistent.nl
        </p>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function ScheidingHerstartLanding() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: c.cream }}>
      <PublicHeader />

      <main>
        <HeroSection />
        <PainSection />
        <ResultsSection />
        <HowItWorksSection />
        <VideoSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <SimpleFooter />
    </div>
  );
}
