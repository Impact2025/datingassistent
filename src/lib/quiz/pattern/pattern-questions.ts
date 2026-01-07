/**
 * Pattern Quiz Questions
 *
 * 10 questions in 3 phases based on attachment theory (ECR-R model).
 * Each question maps to anxiety and/or avoidance dimensions.
 *
 * PHASE 1 (Opening, Q1-2): Engagement + Context
 * PHASE 2 (Middle, Q3-7): Attachment Dimensions (core scoring)
 * PHASE 3 (Closing, Q8-10): Readiness + Segmentation
 */

import {
  Clock,
  AlertCircle,
  MessageCircle,
  Heart,
  Users,
  Brain,
  Target,
  TrendingUp,
  Compass,
  Sparkles,
} from 'lucide-react';
import type { PatternQuestion } from './pattern-types';

export const PATTERN_QUESTIONS: PatternQuestion[] = [
  // =========================================================
  // FASE 1: OPENING (Q1-2) - Engagement + Context
  // =========================================================
  {
    id: 1,
    phase: 'opening',
    question: 'Hoe lang ben je al actief aan het daten?',
    description: 'Een zachte start om je situatie te begrijpen',
    icon: Clock,
    options: [
      {
        value: 'less_than_6_months',
        label: 'Minder dan 6 maanden',
        description: 'Net begonnen',
      },
      {
        value: '6_months_to_2_years',
        label: '6 maanden - 2 jaar',
        description: 'Al even bezig',
      },
      {
        value: '2_to_5_years',
        label: '2-5 jaar',
        description: 'Ervaren dater',
      },
      {
        value: 'more_than_5_years',
        label: 'Meer dan 5 jaar',
        description: 'Veteraan',
      },
      {
        value: 'just_started_again',
        label: 'Ik ben net weer begonnen na een pauze',
        description: 'Nieuwe start',
      },
    ],
  },
  {
    id: 2,
    phase: 'opening',
    question: 'Wat frustreert je het meest aan daten op dit moment?',
    description: 'Wees eerlijk - dit helpt ons je beter te begrijpen',
    icon: AlertCircle,
    options: [
      {
        value: 'not_enough_matches',
        label: 'Ik krijg te weinig matches of reacties',
        description: 'Het lukt niet om contact te maken',
      },
      {
        value: 'conversations_die',
        label: 'Ik krijg matches, maar gesprekken lopen dood',
        description: 'Van match naar date is lastig',
      },
      {
        value: 'dates_go_nowhere',
        label: 'Dates leiden zelden tot iets serieus',
        description: 'Het blijft bij 1-2 dates',
      },
      {
        value: 'wrong_type',
        label: 'Ik trek steeds het verkeerde type aan',
        description: 'Dezelfde patronen herhalen zich',
      },
      {
        value: 'exhausted',
        label: 'Ik voel me uitgeput door het hele proces',
        description: 'Dating burnout',
      },
    ],
  },

  // =========================================================
  // FASE 2: MIDDEN (Q3-7) - Attachment Dimensions (CORE)
  // =========================================================
  {
    id: 3,
    phase: 'middle',
    question: 'Stel: je hebt een goede eerste date gehad. De volgende dag hoor je niets. Wat doe je?',
    description: 'Er is geen goed of fout antwoord',
    icon: MessageCircle,
    options: [
      {
        value: 'send_message',
        label: 'Ik stuur zelf een berichtje — geen big deal',
        description: 'Initiatief nemen voelt natuurlijk',
        anxietyWeight: 0,
        avoidanceWeight: 0,
      },
      {
        value: 'wait_but_check',
        label: 'Ik wacht af, maar check mijn telefoon vaker dan normaal',
        description: 'Probeer geduldig te zijn',
        anxietyWeight: 15,
        avoidanceWeight: 0,
      },
      {
        value: 'analyze',
        label: 'Ik analyseer de date: wat heb ik verkeerd gedaan?',
        description: 'Zoeken naar signalen',
        anxietyWeight: 20,
        avoidanceWeight: 5,
      },
      {
        value: 'assume_not_interested',
        label: 'Ik ga ervan uit dat ze niet geïnteresseerd zijn',
        description: 'Verwachtingen laag houden',
        anxietyWeight: 5,
        avoidanceWeight: 20,
      },
      {
        value: 'feel_restless',
        label: 'Ik voel me onrustig tot ik iets hoor',
        description: 'De stilte is moeilijk',
        anxietyWeight: 25,
        avoidanceWeight: 0,
      },
    ],
  },
  {
    id: 4,
    phase: 'middle',
    question: 'Hoe snel voel jij je comfortabel om persoonlijke dingen te delen met iemand die je aan het daten bent?',
    description: 'Denk aan kwetsbare onderwerpen',
    icon: Heart,
    options: [
      {
        value: 'very_fast',
        label: 'Vrij snel — openheid creëert verbinding',
        description: 'Authenticiteit is belangrijk',
        anxietyWeight: 5,
        avoidanceWeight: 0,
      },
      {
        value: 'after_few_dates',
        label: 'Na een paar dates, als ik ze wat beter ken',
        description: 'Eerst vertrouwen opbouwen',
        anxietyWeight: 0,
        avoidanceWeight: 5,
      },
      {
        value: 'wait_for_them',
        label: 'Ik wacht tot zij eerst iets delen',
        description: 'Volg de ander',
        anxietyWeight: 10,
        avoidanceWeight: 15,
      },
      {
        value: 'keep_private',
        label: 'Ik houd persoonlijke dingen liever voor mezelf',
        description: 'Privacy is belangrijk',
        anxietyWeight: 0,
        avoidanceWeight: 25,
      },
      {
        value: 'depends_on_safety',
        label: 'Het hangt er heel erg van af of ik me veilig voel',
        description: 'Veiligheid eerst',
        anxietyWeight: 15,
        avoidanceWeight: 15,
      },
    ],
  },
  {
    id: 5,
    phase: 'middle',
    question: 'Herken je dit? Je bent geïnteresseerd in iemand, maar hoe meer je investeert, hoe onzekerder je wordt over hun gevoelens.',
    description: 'Dit is een patroon herkenningsvraag',
    icon: Brain,
    options: [
      {
        value: 'no',
        label: 'Nee, dat herken ik niet',
        description: 'Dit is geen issue voor mij',
        anxietyWeight: 0,
        avoidanceWeight: 5,
      },
      {
        value: 'sometimes',
        label: 'Soms, bij bepaalde mensen',
        description: 'Hangt van de persoon af',
        anxietyWeight: 10,
        avoidanceWeight: 0,
      },
      {
        value: 'yes_pattern',
        label: 'Ja, dit is een terugkerend patroon',
        description: 'Ik herken dit goed',
        anxietyWeight: 20,
        avoidanceWeight: 0,
      },
      {
        value: 'yes_cost_relationships',
        label: 'Ja, en het heeft relaties gekost',
        description: 'Dit heeft impact gehad',
        anxietyWeight: 25,
        avoidanceWeight: 0,
      },
    ],
  },
  {
    id: 6,
    phase: 'middle',
    question: 'Herken je dit? Zodra iemand serieuze intenties toont, voel je de neiging om afstand te nemen — ook al vind je diegene leuk.',
    description: 'Nog een patroon herkenningsvraag',
    icon: Users,
    options: [
      {
        value: 'no',
        label: 'Nee, dat herken ik niet',
        description: 'Dit is geen issue voor mij',
        anxietyWeight: 0,
        avoidanceWeight: 0,
      },
      {
        value: 'sometimes_unsure',
        label: 'Soms, maar ik weet niet waarom',
        description: 'Het gebeurt wel eens',
        anxietyWeight: 5,
        avoidanceWeight: 15,
      },
      {
        value: 'yes_often',
        label: 'Ja, ik heb dit vaker gehad',
        description: 'Een terugkerend patroon',
        anxietyWeight: 5,
        avoidanceWeight: 20,
      },
      {
        value: 'yes_dont_understand',
        label: 'Ja, en ik snap niet waarom ik dit doe',
        description: 'Het frustreert me',
        anxietyWeight: 10,
        avoidanceWeight: 25,
      },
    ],
  },
  {
    id: 7,
    phase: 'middle',
    question: 'Welke uitspraak past het beste bij jou?',
    description: 'Kies degene die het meest resoneert',
    icon: Compass,
    options: [
      {
        value: 'comfortable_both',
        label: '"Ik ben comfortabel met intimiteit én met alleen zijn"',
        description: 'Balans voelt natuurlijk',
        anxietyWeight: 0,
        avoidanceWeight: 0,
        directPattern: 'secure',
      },
      {
        value: 'want_connection_fear_rejection',
        label: '"Ik verlang naar een diepe connectie, maar ben bang afgewezen te worden"',
        description: 'Het verlangen is sterk',
        anxietyWeight: 25,
        avoidanceWeight: 0,
        directPattern: 'anxious',
      },
      {
        value: 'value_independence',
        label: '"Ik waardeer mijn onafhankelijkheid en vind het lastig om iemand echt toe te laten"',
        description: 'Vrijheid is belangrijk',
        anxietyWeight: 0,
        avoidanceWeight: 25,
        directPattern: 'avoidant',
      },
      {
        value: 'want_intimacy_but_withdraw',
        label: '"Ik wil intimiteit, maar zodra het dichtbij komt trek ik me terug"',
        description: 'Een innerlijke strijd',
        anxietyWeight: 20,
        avoidanceWeight: 20,
        directPattern: 'fearful_avoidant',
      },
    ],
  },

  // =========================================================
  // FASE 3: CLOSING (Q8-10) - Readiness + Segmentation
  // =========================================================
  {
    id: 8,
    phase: 'closing',
    question: 'Als je terugkijkt op je laatste 3 dates of relaties: zie je een patroon?',
    description: 'Bewustwording is de eerste stap',
    icon: TrendingUp,
    options: [
      {
        value: 'same_type',
        label: 'Ja, ik val steeds op hetzelfde type persoon',
        description: 'Dezelfde aantrekkingskracht',
      },
      {
        value: 'same_ending',
        label: 'Ja, het eindigt steeds op dezelfde manier',
        description: 'Hetzelfde eindpunt',
      },
      {
        value: 'both',
        label: 'Ja, allebei',
        description: 'Type én afloop herhalen zich',
      },
      {
        value: 'no_pattern',
        label: 'Nee, het is steeds anders',
        description: 'Geen duidelijk patroon',
      },
      {
        value: 'never_thought',
        label: 'Ik heb er nooit zo over nagedacht',
        description: 'Nieuwe vraag voor mij',
      },
    ],
  },
  {
    id: 9,
    phase: 'closing',
    question: 'Hoeveel tijd besteed je gemiddeld per week aan daten?',
    description: 'Apps checken, dates, nadenken over dates...',
    icon: Clock,
    options: [
      {
        value: 'less_than_1_hour',
        label: 'Minder dan 1 uur',
        description: 'Minimale investering',
      },
      {
        value: '1_to_3_hours',
        label: '1-3 uur',
        description: 'Af en toe',
      },
      {
        value: '3_to_7_hours',
        label: '3-7 uur',
        description: 'Regelmatig',
      },
      {
        value: 'more_than_7_hours',
        label: 'Meer dan 7 uur',
        description: 'Veel tijd',
      },
      {
        value: 'feels_like_job',
        label: 'Het voelt als een tweede baan',
        description: 'Overweldigend',
      },
    ],
  },
  {
    id: 10,
    phase: 'closing',
    question: 'Wat zou je het liefst willen bereiken in je dating leven?',
    description: 'Jouw doel bepaalt jouw pad',
    icon: Target,
    options: [
      {
        value: 'more_confidence',
        label: 'Meer zelfvertrouwen in het contact maken',
        description: 'Zekerder worden',
      },
      {
        value: 'understand_myself',
        label: 'Begrijpen waarom ik doe wat ik doe',
        description: 'Zelfinzicht',
      },
      {
        value: 'stop_wasting_time',
        label: 'Stoppen met tijd verspillen aan de verkeerde mensen',
        description: 'Efficiënter daten',
      },
      {
        value: 'find_relationship',
        label: 'Een relatie vinden die écht past',
        description: 'De juiste match',
      },
      {
        value: 'peace_of_mind',
        label: 'Rust in mijn hoofd over dit onderwerp',
        description: 'Minder stress',
      },
    ],
  },
];

export const TOTAL_QUESTIONS = PATTERN_QUESTIONS.length;
