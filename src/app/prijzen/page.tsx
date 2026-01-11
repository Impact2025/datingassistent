'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import {
  CheckCircle,
  X,
  Rocket,
  Sparkles,
  Crown,
  Shield,
  Clock,
  Users,
  MessageCircle,
  Camera,
  Video,
  Phone,
  FileText,
  Infinity,
  ArrowRight,
  Star
} from 'lucide-react';

// Program data based on Value Stack strategy
const programs = [
  {
    id: 'kickstart',
    name: 'De Kickstart',
    tagline: 'Voor de snelle start',
    price: 47,
    duration: '21 dagen toegang',
    icon: Rocket,
    popular: false,
    perfectFor: 'Je profiel nu geen matches oplevert en je dit snel wilt fixen.',
    features: [
      { text: 'De "21-Dagen Profiel Challenge" (Video Cursus)', included: true },
      { text: 'AI Foto Check: Onbeperkt scannen', included: true },
      { text: 'Bio Builder: Laat AI je tekst schrijven', included: true },
      { text: 'Werkboek: Checklists & Templates', included: true },
      { text: 'Toegang tot Chat Coach', included: false },
      { text: 'Diepgaande video modules', included: false },
    ],
    cta: 'Start met Kickstart',
    guarantee: '30 dagen niet-goed-geld-terug',
  },
  {
    id: 'transformatie',
    name: 'De Transformatie',
    tagline: 'De complete opleiding tot succesvol daten',
    price: 147,
    duration: '90 dagen toegang',
    icon: Sparkles,
    popular: true,
    perfectFor: 'Je klaar bent met aanmodderen en het hele spel wilt leren beheersen.',
    includesFrom: 'Alles uit Kickstart, PLUS:',
    features: [
      { text: 'Complete Videocursus (12 Modules in 3 Fases)', included: true, highlight: true },
      { text: 'Fase 1: Design - Fundament & Profiel', included: true, indent: true },
      { text: 'Fase 2: Action - Matchen & Gesprekken', included: true, indent: true },
      { text: 'Fase 3: Surrender - Dates & Relaties', included: true, indent: true },
      { text: 'Pro AI Suite (Onbeperkt)', included: true, highlight: true },
      { text: '24/7 Chat Coach (Screenshots uploaden)', included: true, indent: true },
      { text: 'Match Analyse & Openingszinnen', included: true, indent: true },
      { text: '3x Live Q&A Sessies met het team', included: true },
    ],
    cta: 'Start mijn Transformatie',
    guarantee: '30 dagen niet-goed-geld-terug',
  },
  {
    id: 'vip',
    name: 'De VIP Reis',
    tagline: 'Persoonlijke 1-op-1 begeleiding',
    price: 797,
    duration: '180 dagen toegang',
    icon: Crown,
    popular: false,
    perfectFor: 'Je maximale zekerheid wilt en een stok achter de deur nodig hebt.',
    includesFrom: 'Alles uit Transformatie, PLUS:',
    features: [
      { text: 'Persoonlijke Intake (60 min) via video', included: true, icon: Video },
      { text: '6x Maandelijkse 1-op-1 Calls', included: true, icon: Phone },
      { text: 'WhatsApp Support: Directe lijn met je coach', included: true, icon: MessageCircle },
      { text: 'Photoshoot Begeleiding', included: true, icon: Camera },
      { text: 'Persoonlijk Actieplan op maat', included: true, icon: FileText },
      { text: 'Levenslang toegang tot cursusmateriaal', included: true, icon: Infinity },
    ],
    cta: 'Meld je aan voor VIP',
    guarantee: 'Beperkte plekken beschikbaar',
  },
];

// Comparison table data
const comparisonData = [
  {
    feature: 'Kosten',
    traditional: '€90 - €150 per uur',
    agency: '€3.500 - €5.000+',
    datingassistent: '€147 voor 3 maanden',
    highlight: true,
  },
  {
    feature: 'Beschikbaarheid',
    traditional: 'Alleen tijdens kantooruren',
    agency: 'Wachtlijsten',
    datingassistent: '24/7 Direct Antwoord',
    highlight: false,
  },
  {
    feature: 'Methode',
    traditional: 'Gesprekken',
    agency: 'Matching door anderen',
    datingassistent: 'Je leert het zélf (Skill)',
    highlight: false,
  },
  {
    feature: 'AI Tools',
    traditional: 'Geen',
    agency: 'Geen',
    datingassistent: 'Foto & Chat Analyse',
    highlight: false,
  },
  {
    feature: 'Privacy',
    traditional: 'Menselijk contact',
    agency: 'Menselijk contact',
    datingassistent: '100% Privé & Anoniem',
    highlight: false,
  },
];

export default function PrijzenPage() {
  const router = useRouter();

  const handleSelectProgram = (programId: string) => {
    router.push(`/register?program=${programId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <PublicHeader />

      {/* Hero Section - Value Framing */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50 via-pink-25 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="outline" className="border-pink-200 dark:border-pink-700 text-pink-600 dark:text-pink-400 px-4 py-1">
              Investeer in jezelf
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
              Investeer in jezelf,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">
                niet in eindeloos swipen
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Een traditionele datingcoach kost €150 per uur. Met DatingAssistent krijg je{' '}
              <strong className="text-gray-900 dark:text-gray-100">maandenlange begeleiding, AI-tools en cursussen</strong>{' '}
              voor de prijs van één etentje.
            </p>
          </div>
        </div>
      </section>

      {/* Program Cards Section */}
      <section className="py-16 md:py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {programs.map((program) => {
              const Icon = program.icon;

              return (
                <Card
                  key={program.id}
                  className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-xl ${
                    program.popular
                      ? 'border-2 border-pink-500 dark:border-pink-400 shadow-lg lg:scale-105 lg:-my-4 z-10'
                      : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Popular Badge */}
                  {program.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-pink-500 hover:bg-pink-500 text-white px-4 py-1 text-sm font-semibold shadow-lg">
                        Onze Aanrader
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                        program.popular
                          ? 'bg-pink-100 dark:bg-pink-900/30'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Icon className={`w-7 h-7 ${
                          program.popular
                            ? 'text-pink-600 dark:text-pink-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                        {program.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {program.tagline}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-50">
                          €{program.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          (eenmalig)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {program.duration}
                      </p>
                    </div>

                    {/* Perfect for */}
                    <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Perfect als: </span>
                        {program.perfectFor}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="flex-grow mb-6">
                      {program.includesFrom && (
                        <p className="text-sm font-semibold text-pink-600 dark:text-pink-400 mb-3">
                          {program.includesFrom}
                        </p>
                      )}
                      <ul className="space-y-2.5">
                        {program.features.map((feature, index) => (
                          <li
                            key={index}
                            className={`flex items-start gap-2.5 text-sm ${
                              feature.indent ? 'ml-4' : ''
                            }`}
                          >
                            {feature.included ? (
                              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                feature.highlight
                                  ? 'text-pink-500 dark:text-pink-400'
                                  : 'text-green-500 dark:text-green-400'
                              }`} />
                            ) : (
                              <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
                            )}
                            <span className={`${
                              feature.included
                                ? feature.highlight
                                  ? 'text-gray-900 dark:text-gray-100 font-semibold'
                                  : 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto space-y-3">
                      <Button
                        onClick={() => handleSelectProgram(program.id)}
                        className={`w-full py-6 text-base font-semibold rounded-xl transition-all ${
                          program.popular
                            ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900'
                        }`}
                      >
                        {program.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {program.guarantee}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Anchor Section - Comparison Table */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
              Waarom DatingAssistent de slimste investering is
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Vergelijk de opties en ontdek waarom €147 de beste deal is
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Traditionele Coach
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Relatiebureau
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20">
                    DatingAssistent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {comparisonData.map((row, index) => (
                  <tr key={index} className={row.highlight ? 'bg-pink-50/50 dark:bg-pink-900/10' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                      {row.traditional}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                      {row.agency}
                    </td>
                    <td className={`px-6 py-4 text-sm text-center font-semibold bg-pink-50 dark:bg-pink-900/20 ${
                      row.highlight
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {row.datingassistent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {comparisonData.map((row, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {row.feature}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Traditionele Coach</span>
                      <span className="text-gray-700 dark:text-gray-300">{row.traditional}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Relatiebureau</span>
                      <span className="text-gray-700 dark:text-gray-300">{row.agency}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-pink-600 dark:text-pink-400 font-medium">DatingAssistent</span>
                      <span className="text-pink-600 dark:text-pink-400 font-semibold">{row.datingassistent}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">30 dagen garantie</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Niet goed? Geld terug</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">24/7 Beschikbaar</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Altijd hulp wanneer je het nodig hebt</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">500+ Tevreden klanten</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bewezen resultaten</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">10+ Jaar ervaring</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bekend van The Undateables</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Veelgestelde vragen over prijzen
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Antwoorden op de meest gestelde vragen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Waarom eenmalige betaling?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  We geloven in eerlijke prijzen. Geen verborgen kosten, geen automatische verlengingen.
                  Je betaalt één keer en krijgt volledige toegang voor de aangegeven periode.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Wat als het niet werkt voor mij?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Je krijgt 30 dagen niet-goed-geld-terug garantie. Als je niet tevreden bent,
                  krijg je je volledige investering terug. Geen vragen, geen gedoe.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Kan ik later upgraden?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Ja! Je kunt altijd upgraden naar een hoger programma. Het verschil in prijs wordt
                  naar rato berekend, dus je betaalt nooit dubbel.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Welk programma past bij mij?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong>Kickstart</strong> voor snelle profielverbeteringen. <strong>Transformatie</strong> voor
                  de complete leerervaring. <strong>VIP</strong> als je persoonlijke begeleiding wilt.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Zijn er verborgen kosten?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nee, de prijs die je ziet is wat je betaalt. Inclusief BTW, geen extra kosten,
                  geen verplichte add-ons. Alles wat je nodig hebt zit in je programma.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Hoe snel zie ik resultaten?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  De meeste gebruikers zien binnen 48 uur meer matches na profielverbeteringen.
                  78% heeft binnen 14 dagen hun eerste date bij actief gebruik.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 font-medium">
              Bekijk alle veelgestelde vragen →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-pink-500 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Klaar om te investeren in jezelf?
          </h2>
          <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met De Transformatie en leer het hele dating spel beheersen.
            Of kies het programma dat het beste bij jou past.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => handleSelectProgram('transformatie')}
              className="bg-white hover:bg-gray-100 text-pink-600 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              Start De Transformatie - €147
            </Button>
            <Link href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full">
                Bekijk alle programma's
              </Button>
            </Link>
          </div>
          <p className="text-sm text-pink-100 mt-6">
            30 dagen niet-goed-geld-terug garantie • Geen verborgen kosten • Direct toegang
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
