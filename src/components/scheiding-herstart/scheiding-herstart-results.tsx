'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle, AlertTriangle, Flame, Star, RefreshCw,
  ArrowRight, ExternalLink, Save, Lightbulb, Calendar,
  TrendingUp, Shield, Heart, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScanResult, IntakeData, Scores } from './types';

const PROFILES = {
  heler: {
    naam: 'De Heler',
    emoji: '🌱',
    kleur: 'text-rose-700 bg-rose-50 border-rose-200',
    accentBg: 'bg-rose-500',
    headerBg: 'bg-gradient-to-br from-rose-50 to-rose-100',
    omschrijving: 'Jouw hart is nog aan het helen — en dat is precies goed. Heling vraagt moed en tijd. Je bent op de goede weg.',
    tagline: 'Geef jezelf de ruimte om te helen voor je nieuwe start',
  },
  waker: {
    naam: 'De Waker',
    emoji: '🌤️',
    kleur: 'text-amber-700 bg-amber-50 border-amber-200',
    accentBg: 'bg-amber-500',
    headerBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    omschrijving: 'Je wordt wakker na de scheiding. Je bent onderweg — klaar voor voorzichtige stappen zonder druk.',
    tagline: 'Lichte stappen, bewust tempo — jij bepaalt wanneer',
  },
  starter: {
    naam: 'De Starter',
    emoji: '🚀',
    kleur: 'text-blue-700 bg-blue-50 border-blue-200',
    accentBg: 'bg-blue-500',
    headerBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    omschrijving: 'Je staat klaar voor een nieuwe start. Met bewustzijn, kracht en een frisse blik — dat is jouw kracht.',
    tagline: 'Jij hebt de tools en de mindset. Nu de actie.',
  },
  bloeier: {
    naam: 'De Bloeier',
    emoji: '🌸',
    kleur: 'text-green-700 bg-green-50 border-green-200',
    accentBg: 'bg-green-500',
    headerBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    omschrijving: 'Je staat in volle bloei. Je ervaringen hebben je rijker gemaakt — dit is het beste moment voor nieuwe ontmoetingen.',
    tagline: 'Je ervaringen zijn geen baggage, het zijn jouw superkrachten',
  },
};

const DIMENSION_LABELS: Record<string, string> = {
  emotioneleVerwerking: 'Emotionele verwerking',
  identiteitskracht: 'Identiteit & eigenwaarde',
  datingMindset: 'Dating mindset',
  praktischeStabiliteit: 'Praktische stabiliteit',
  externeBevestiging: 'Externe bevestiging',
};

const REBOUND_COLORS = {
  laag: 'text-green-700 bg-green-50 border-green-200',
  gemiddeld: 'text-amber-700 bg-amber-50 border-amber-200',
  hoog: 'text-red-700 bg-red-50 border-red-200',
};

const REBOUND_LABELS = {
  laag: 'Laag rebound risico',
  gemiddeld: 'Gemiddeld rebound risico',
  hoog: 'Hoog rebound risico',
};

const FALLBACK_ANALYSIS = {
  heler: {
    watGaedGaat: [
      'Je neemt je eigen heling serieus — dat vraagt moed',
      'Je bent eerlijk over waar je staat, dat is kracht',
      'Je hebt gezien dat heling prioriteit heeft boven haast',
    ],
    aandachtspunten: [
      'Emotionele beschikbaarheid voor iemand anders',
      'Het risico van daten als afleiding in plaats van verbinding',
      'Grenzen stellen als je pijn nog aanwezig is',
    ],
    actieplan: {
      week1: [
        'Schrijf dagelijks 5 minuten wat je voelt — zonder oordeel',
        'Plan één activiteit die je vroeger alleen deed maar nu opnieuw wilt proberen',
        'Zeg hardop: "Ik geef mijzelf toestemming om te helen"',
      ],
      maand1: [
        'Spreek met een vertrouwenspersoon over je scheiding (vriend, therapeut)',
        'Maak een lijst van 10 dingen die jou definiëren — los van de relatie',
        'Lees ons artikel over wanneer je klaar bent om opnieuw te daten',
      ],
      maand3: [
        'Evalueer eerlijk: voel ik me significant beter dan 3 maanden geleden?',
        'Overweeg een eerste oriënterende date — zonder verwachtingen',
        'Maak je profiel klaar mét je verhaal — scheidingen zijn geen shame',
      ],
    },
    datinTip: 'Als je gaat daten, wees dan eerlijk: "Ik ben pas gescheiden en verken voorzichtig." Dat is aantrekkelijker dan je verhaal verstoppen.',
    reboundAlerts: ['Daten als emotionele vlucht', 'Snel hechten uit angst voor eenzaamheid'],
  },
  waker: {
    watGaedGaat: [
      'Je begint jezelf te herkennen buiten de relatie',
      'Je kunt al deels reflecteren op wat er is gebeurd',
      'Je verlangen naar verbinding is gezond en aanwezig',
    ],
    aandachtspunten: [
      'Ongeduld — het verlangen om "door te gaan" kan te vroeg zijn',
      'De identiteitsvraag: wie ben jij nu, los van de relatie?',
      'Openheid over je achtergrond op eerste dates',
    ],
    actieplan: {
      week1: [
        'Schrijf op: wat wil jij over 1 jaar anders hebben dan nu?',
        'Doe één sociale activiteit die niets met daten te maken heeft',
        'Beoordeel: voel ik mij comfortabel alleen zijn?',
      ],
      maand1: [
        'Probeer één eerste date — zonder doel, puur als experiment',
        'Stel voor jezelf vast: welke 3 dingen zijn voor mij niet onderhandelbaar in een partner?',
        'Praat over je scheiding met één persoon die je vertrouwt',
      ],
      maand3: [
        'Evalueer je dates: voel ik me aangetrokken vanuit kracht of vanuit behoefte?',
        'Bouw een consistente dating routine op — zonder obsessie',
        'Werk aan het comfortabel bespreken van je scheiding op dates',
      ],
    },
    datinTip: 'Je kunt daten en tegelijk nog aan jezelf werken. Het sleutelwoord: tempo. Laat verbinding langzaam groeien.',
    reboundAlerts: ['Teveel dating apps tegelijk (dopamine cyclus)', 'Vergelijken met je ex-relatie'],
  },
  starter: {
    watGaedGaat: [
      'Je emotionele basis is sterk genoeg om te daten',
      'Je weet wie je bent en wat je wilt',
      'Je kunt je scheiding bespreken zonder erin te verliezen',
    ],
    aandachtspunten: [
      'Soms te hoge verwachtingen na een lange zoektocht',
      'Neiging om te snel ernst te zoeken',
      'Vergeten dat daten ook gewoon leuk mag zijn',
    ],
    actieplan: {
      week1: [
        'Maak een sterk dating profiel — jouw verhaal, jouw kracht',
        'Start op 1-2 apps en wees consistent, maar niet obsessief',
        'Zet je eerste date-actie: stuur 3 berichten naar interessante matches',
      ],
      maand1: [
        'Plan minstens 2 eerste dates — met lage verwachtingen, hoge nieuwsgierigheid',
        'Evalueer hoe je je voelt NA een date, niet alleen TIJDENS',
        'Praat over je scheiding als het ter sprake komt — eerlijk en zonder drama',
      ],
      maand3: [
        'Reflecteer: welk type persoon trekt mij aan en waarom?',
        'Bouw ritme op: sociaal, actief, open voor verbinding',
        'Overweeg: heb ik nog coaching/begeleiding nodig?',
      ],
    },
    datinTip: 'Vertel je scheiding-verhaal als kracht, niet als bagage. "Ik heb veel geleerd over wat ik wil en niet wil" opent deuren.',
    reboundAlerts: ['Perfectionist: elke match toetsen aan de ideale partner', 'Terugschrikken als het te goed voelt'],
  },
  bloeier: {
    watGaedGaat: [
      'Je staat emotioneel sterk en zelfbewust in het leven',
      'Je hebt je scheiding verwerkt en kunt er openly over spreken',
      'Je weet wat je wilt — en je bent er klaar voor',
    ],
    aandachtspunten: [
      'Hoge standaard kan isolerend zijn — blijf open voor verrassing',
      'Soms ongeduldig als dating niet snel gaat',
      'Bewaar de kalmte van de heler in je wanneer het spannend wordt',
    ],
    actieplan: {
      week1: [
        'Maak een concreet actieplan: app, profiel, eerste contacten',
        'Stel een doel: 2 dates per maand gedurende 3 maanden',
        'Deel je verhaal met iemand — jouw groei verdient bewondering',
      ],
      maand1: [
        'Ga op meerdere dates — diversiteit in kennismakingen',
        'Wees selectief maar niet angstvallend — vertrouw je gevoel',
        'Evalueer: hoe gaan de eerste gesprekken? Wat werkt?',
      ],
      maand3: [
        'Ben je iemand tegengekomen die je aandacht verdient? Investeer dan bewust',
        'Kijk terug: hoe ver ben je gekomen? Vier dat',
        'Gebruik je scheiding als context — niet als excuus of muur',
      ],
    },
    datinTip: 'Jij hebt het grote voordeel dat je precies weet wat je wilt. Vertrouw dat kompas — het is aangescherpt door ervaring.',
    reboundAlerts: ['Zelfverzekerdheid die overgaat in nonchalance', 'Te snel "klaar" met iemand verklaren'],
  },
};

const PROFILE_UPSELL: Record<string, {
  headline: string;
  pitch: string;
  bullets: string[];
  urgency: string;
  cta: string;
}> = {
  heler: {
    headline: 'Je weet nu waar je staat. Heling gaat sneller met begeleiding.',
    pitch: 'Heling duurt gemiddeld 14 maanden als je het alleen doet. Met de juiste begeleiding is dat 4–6 maanden. Onze coaches kennen de Heler-fase precies — en helpen je er gezond en krachtig doorheen.',
    bullets: [
      'AI coach beschikbaar 24/7 — ook op de moeilijkste avonden',
      'Hechtingsstijl analyse: ontdek waarom je aantrekt wie je aantrekt',
      '21-daags traject specifiek voor mensen na een scheiding',
    ],
    urgency: 'Helers die coaching starten zien gemiddeld 60% verbetering na 3 weken.',
    cta: 'Begin je hersteltraject',
  },
  waker: {
    headline: 'Je staat op het kantelpunt. Laat het niet voorbijgaan.',
    pitch: 'Van Waker naar Starter gaat soms vanzelf — en soms sta je maanden stil. Onze begeleiding helpt je dit momentum omzetten in echte stappen, zonder de valkuilen die de meeste mensen in jouw fase maken.',
    bullets: [
      'Concreet stappenplan voor jouw eerste date na de scheiding',
      'Leer selecteren op verbinding, niet op afleiding of eenzaamheid',
      'Coach die jouw tempo respecteert — geen druk, wel richting',
    ],
    urgency: '78% van onze Wakers plant hun eerste geslaagde date binnen 5 weken.',
    cta: 'Zet de volgende stap',
  },
  starter: {
    headline: "Je bent klaar — nu telt hoe je het aanpakt.",
    pitch: 'Klaar zijn is het begin. Maar de overgang van klaar-zijn naar echte, goede connecties is de stap die de meeste Starters onderschatten. Hier helpen we je precies bij.',
    bullets: [
      'Dating profiel dat je scheiding-verhaal als kracht vertelt',
      'Van eerste bericht tot tweede date: praktische coaching',
      'Inzicht in wat je nú écht zoekt — anders dan voor de scheiding',
    ],
    urgency: 'Starters in ons programma plannen gemiddeld 2× meer kwalitatieve dates.',
    cta: 'Optimaliseer je dating aanpak',
  },
  bloeier: {
    headline: 'Je bloeit. Zorg dat je ook de juiste match aantrekt.',
    pitch: 'Jouw positie is sterk — en dat is zeldzaam. Maar zelfs de meest zelfbewuste singles missen de juiste match zonder een bewuste strategie. Onze coaching zet jouw kracht om in echte, duurzame verbinding.',
    bullets: [
      'Dating strategie afgestemd op wie jij nu bent',
      'Selectiever zijn zonder kansen te missen — meer kwaliteit',
      'Community van mensen die serieus zoeken, net als jij',
    ],
    urgency: 'Bloeiers in ons programma vinden 40% sneller een echte klik.',
    cta: 'Verfijn je strategie',
  },
};

function ProfileUpsell({ profiel, onRestart }: { profiel: string; onRestart: () => void }) {
  const upsell = PROFILE_UPSELL[profiel] ?? PROFILE_UPSELL.starter;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50 border-2 border-rose-200 p-6 space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Jouw volgende stap</p>
        <h3 className="text-xl font-bold text-gray-900 leading-snug">{upsell.headline}</h3>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{upsell.pitch}</p>

      <div className="space-y-2.5">
        {upsell.bullets.map((bullet, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{bullet}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-rose-700 font-medium italic border-l-2 border-rose-300 pl-3">
        {upsell.urgency}
      </p>

      <div className="space-y-3 pt-1">
        <Button asChild className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-5 text-base rounded-full shadow-lg shadow-rose-500/20">
          <a href="/prijzen">
            {upsell.cta}
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </Button>
        <p className="text-xs text-center text-gray-400">Vanaf €47 · 21 dagen · Geen langetermijn verplichtingen</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-rose-100">
        <button
          onClick={onRestart}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Scan opnieuw doen
        </button>
        <a
          href="/dashboard"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Naar dashboard
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

interface Props {
  result: ScanResult;
  intake: IntakeData;
  onRestart: () => void;
  onClose?: () => void;
}

export function ScheidingHerstartResults({ result, intake, onRestart, onClose }: Props) {
  const { scores } = result;
  const profile = PROFILES[scores.profiel];
  const analysis = result.aiAnalysis ?? FALLBACK_ANALYSIS[scores.profiel];

  const dimensionScores = [
    { key: 'emotioneleVerwerking', value: scores.emotioneleVerwerking },
    { key: 'identiteitskracht', value: scores.identiteitskracht },
    { key: 'datingMindset', value: scores.datingMindset },
    { key: 'praktischeStabiliteit', value: scores.praktischeStabiliteit },
    { key: 'externeBevestiging', value: scores.externeBevestiging },
  ];

  return (
    <div className="space-y-5">
      {/* Save notification */}
      {onClose && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm">Resultaten opgeslagen</p>
                <p className="text-xs text-green-700">Terug te vinden bij "Mijn Scans"</p>
              </div>
            </div>
            <Button onClick={onClose} size="sm" className="bg-green-600 hover:bg-green-700 text-white flex gap-1">
              <Save className="w-3.5 h-3.5" />
              Sluiten
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profiel">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="profiel">Jouw Profiel</TabsTrigger>
          <TabsTrigger value="actieplan">Actieplan</TabsTrigger>
          <TabsTrigger value="inzichten">Inzichten</TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFIEL */}
        <TabsContent value="profiel" className="space-y-5 mt-5">
          {/* Profile hero card */}
          <Card className={cn('border-2', profile.kleur)}>
            <CardContent className={cn('p-8 text-center rounded-xl', profile.headerBg)}>
              <div className="text-5xl mb-3">{profile.emoji}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile.naam}</h2>
              <p className="text-sm font-medium text-gray-600 italic mb-4">{profile.tagline}</p>

              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className={cn('px-4 py-1.5 text-base font-bold border', profile.kleur)}>
                  Herstartscore: {scores.overallScore}/100
                </Badge>
                <Badge className={cn('px-3 py-1.5 text-sm border', REBOUND_COLORS[scores.reboundNiveau])}>
                  {REBOUND_LABELS[scores.reboundNiveau]}
                </Badge>
              </div>

              <p className="text-gray-700 leading-relaxed max-w-lg mx-auto">
                {analysis.profielOmschrijving ?? profile.omschrijving}
              </p>
            </CardContent>
          </Card>

          {/* Score breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                Jouw dimensiescores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dimensionScores.map(({ key, value }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">{DIMENSION_LABELS[key]}</span>
                    <span className="font-semibold text-gray-900">{value}%</span>
                  </div>
                  <Progress
                    value={value}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Wat goed gaat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Wat goed gaat bij jou
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(analysis.watGaedGaat ?? []).map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-900">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aandachtspunten */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Aandachtspunten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(analysis.aandachtspunten ?? []).map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-amber-900">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dating tip */}
          {analysis.datinTip && (
            <Card className="bg-gradient-to-r from-purple-50 to-rose-50 border-purple-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900 text-sm mb-1">Dating tip voor jou</p>
                    <p className="text-sm text-purple-800 leading-relaxed">{analysis.datinTip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: ACTIEPLAN */}
        <TabsContent value="actieplan" className="space-y-5 mt-5">
          <p className="text-sm text-gray-500 text-center">
            Jouw persoonlijk 3-fase actieplan op basis van profiel <strong>{profile.naam}</strong>
          </p>

          {[
            { fase: 'week1', label: 'Week 1 — Begin', icon: Calendar, color: 'blue' },
            { fase: 'maand1', label: 'Maand 1 — Opbouw', icon: TrendingUp, color: 'purple' },
            { fase: 'maand3', label: 'Maand 3 — Doorbraak', icon: Star, color: 'green' },
          ].map(({ fase, label, icon: FaseIcon, color }) => (
            <Card key={fase} className={cn('border-2', {
              'border-blue-200': color === 'blue',
              'border-purple-200': color === 'purple',
              'border-green-200': color === 'green',
            })}>
              <CardHeader className={cn('pb-3', {
                'bg-blue-50': color === 'blue',
                'bg-purple-50': color === 'purple',
                'bg-green-50': color === 'green',
              })}>
                <CardTitle className={cn('text-base flex items-center gap-2', {
                  'text-blue-800': color === 'blue',
                  'text-purple-800': color === 'purple',
                  'text-green-800': color === 'green',
                })}>
                  <FaseIcon className="w-4 h-4" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {(analysis.actieplan?.[fase as keyof typeof analysis.actieplan] ?? []).map((stap: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5', {
                      'bg-blue-100 text-blue-700': color === 'blue',
                      'bg-purple-100 text-purple-700': color === 'purple',
                      'bg-green-100 text-green-700': color === 'green',
                    })}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{stap}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* CTA to blog */}
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-900 text-sm mb-1">Meer verdieping nodig?</p>
                  <p className="text-sm text-rose-800 mb-3">
                    Lees ons volledige artikel over opnieuw daten na een scheiding.
                  </p>
                  <a
                    href="/blog/opnieuw-daten-na-een-scheiding-wanneer-ben-je-klaar-en-hoe-begin-je"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 hover:text-rose-900 underline"
                  >
                    Lees het artikel <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: INZICHTEN */}
        <TabsContent value="inzichten" className="space-y-5 mt-5">
          {/* Rebound risk detail */}
          <Card className={cn('border-2', REBOUND_COLORS[scores.reboundNiveau])}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className={cn('w-4 h-4', {
                  'text-green-600': scores.reboundNiveau === 'laag',
                  'text-amber-600': scores.reboundNiveau === 'gemiddeld',
                  'text-red-600': scores.reboundNiveau === 'hoog',
                })} />
                Rebound Risico: {REBOUND_LABELS[scores.reboundNiveau]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Risicoscore</span>
                  <span className="font-semibold">{scores.reboundRisk}/100</span>
                </div>
                <Progress value={scores.reboundRisk} className="h-2" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {scores.reboundNiveau === 'laag' && 'Goed nieuws: jouw kans op een ongezonde rebound-relatie is klein. Je staat stabiel.'}
                {scores.reboundNiveau === 'gemiddeld' && 'Er zijn enkele risicofactoren aanwezig. Wees bewust van je motivaties als je gaat daten.'}
                {scores.reboundNiveau === 'hoog' && 'Let op: er zijn significante risicofactoren. Daten vanuit heling is altijd beter dan daten als vlucht.'}
              </p>
              {(analysis.reboundAlerts ?? []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Specifieke aandachtspunten:</p>
                  {(analysis.reboundAlerts ?? []).map((alert: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="text-gray-700">{alert}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Context samenvatting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Jouw situatie in context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: 'Scheiding geleden',
                  value: {
                    less_3m: '< 3 maanden',
                    '3_6m': '3–6 maanden',
                    '6_12m': '6–12 maanden',
                    '1_2y': '1–2 jaar',
                    more_2y: '2+ jaar',
                  }[intake.tijdSindsScheiding] ?? '—',
                },
                {
                  label: 'Relatieduur',
                  value: {
                    short: '< 2 jaar',
                    medium: '2–7 jaar',
                    long: '7+ jaar (of getrouwd)',
                  }[intake.relatieduur] ?? '—',
                },
                {
                  label: 'Kinderen betrokken',
                  value: {
                    no: 'Nee',
                    yes_young: 'Ja — jonge kinderen',
                    yes_teen: 'Ja — tieners',
                  }[intake.kinderen] ?? '—',
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Score summary */}
          <Card className="bg-gradient-to-br from-gray-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Volledige scorekaarst</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-gray-900">{scores.overallScore}</div>
                <div className="text-gray-500 text-sm">van de 100 punten</div>
              </div>
              <div className="space-y-3">
                {dimensionScores.map(({ key, value }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-32 flex-shrink-0">{DIMENSION_LABELS[key]}</span>
                    <Progress value={value} className="h-1.5 flex-1" />
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="text-center text-xs text-gray-400 bg-gray-50 p-4 rounded-xl">
            <p>
              Deze scan geeft richtinggevende inzichten maar is geen psychologische diagnose.
              Bij ernstige emotionele uitdagingen na een scheiding, raadpleeg een professionele hulpverlener.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upsell (landing page only) or simple actions (dashboard) */}
      {!onClose ? (
        <ProfileUpsell profiel={scores.profiel} onRestart={onRestart} />
      ) : (
        <div className="flex gap-3">
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Opnieuw
          </Button>
          <Button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <Save className="w-4 h-4" />
            Sluiten
          </Button>
        </div>
      )}
    </div>
  );
}
