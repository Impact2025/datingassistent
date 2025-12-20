/**
 * De Dating Snapshot - Complete Onboarding Flow
 *
 * 7 sections, 42 questions, ~12 minutes
 * Designed for deep personalization of the Transformatie experience.
 */

import type { OnboardingSection } from '@/types/dating-snapshot.types';

export const DATING_SNAPSHOT_FLOW: OnboardingSection[] = [
  // =====================================================
  // SECTION 1: BASIS PROFIEL
  // =====================================================
  {
    id: 1,
    slug: 'basis-profiel',
    title: 'Wie Ben Jij?',
    subtitle: 'De basis om je te leren kennen',
    icon: 'user-circle',
    estimated_minutes: 2,
    intro_text: 'Laten we beginnen met de basics. Hoe mag ik je noemen?',
    questions: [
      {
        id: 'display_name',
        type: 'text',
        label: 'Hoe mag ik je noemen?',
        placeholder: 'Je voornaam of nickname',
        required: true,
        validation: { min_length: 2, max_length: 50 },
        helper_text: 'Dit gebruik ik in onze gesprekken',
      },
      {
        id: 'age',
        type: 'number',
        label: 'Hoe oud ben je?',
        placeholder: 'Leeftijd',
        required: true,
        validation: { min: 18, max: 99 },
      },
      {
        id: 'location_city',
        type: 'text',
        label: 'In welke stad woon je?',
        placeholder: 'Bijv. Amsterdam, Antwerpen',
        required: false,
        helper_text: 'Voor relevante suggesties',
      },
      {
        id: 'occupation',
        type: 'text',
        label: 'Wat doe je voor werk of studie?',
        placeholder: 'Bijv. Marketing Manager, Student Psychologie',
        required: false,
        helper_text: 'Helpt me je dagelijkse energie inschatten',
      },
      {
        id: 'single_since',
        type: 'select',
        label: 'Hoe lang ben je al single?',
        required: true,
        options: [
          { value: 'less_than_3_months', label: 'Minder dan 3 maanden' },
          { value: '3_to_6_months', label: '3 tot 6 maanden' },
          { value: '6_to_12_months', label: '6 maanden tot een jaar' },
          { value: '1_to_2_years', label: '1 tot 2 jaar' },
          { value: '2_to_5_years', label: '2 tot 5 jaar' },
          { value: 'more_than_5_years', label: 'Meer dan 5 jaar' },
          { value: 'always', label: 'Ik heb nooit een relatie gehad' },
        ],
      },
      {
        id: 'longest_relationship_months',
        type: 'select',
        label: 'Hoe lang duurde je langste relatie?',
        required: false,
        options: [
          { value: '0', label: 'Nooit een relatie gehad' },
          { value: '6', label: 'Minder dan 6 maanden' },
          { value: '12', label: '6 maanden tot 1 jaar' },
          { value: '24', label: '1 tot 2 jaar' },
          { value: '48', label: '2 tot 4 jaar' },
          { value: '60', label: 'Meer dan 4 jaar' },
        ],
      },
    ],
  },

  // =====================================================
  // SECTION 2: DATING SITUATIE
  // =====================================================
  {
    id: 2,
    slug: 'dating-situatie',
    title: 'Je Dating Situatie',
    subtitle: 'Waar sta je nu?',
    icon: 'smartphone',
    estimated_minutes: 2,
    intro_text: 'Vertel me over je huidige dating ervaring. Dit helpt me begrijpen waar je tegenaan loopt.',
    questions: [
      {
        id: 'apps_used',
        type: 'multi_select',
        label: 'Welke dating apps gebruik je?',
        required: true,
        max_selections: 5,
        options: [
          { value: 'tinder', label: 'Tinder' },
          { value: 'bumble', label: 'Bumble' },
          { value: 'hinge', label: 'Hinge' },
          { value: 'happn', label: 'Happn' },
          { value: 'inner_circle', label: 'Inner Circle' },
          { value: 'badoo', label: 'Badoo' },
          { value: 'lexa', label: 'Lexa' },
          { value: 'parship', label: 'Parship' },
          { value: 'none', label: 'Ik gebruik geen apps' },
        ],
      },
      {
        id: 'app_experience_months',
        type: 'select',
        label: 'Hoe lang gebruik je al dating apps?',
        required: true,
        options: [
          { value: '0', label: 'Nog nooit / net begonnen' },
          { value: '3', label: 'Minder dan 3 maanden' },
          { value: '6', label: '3 tot 6 maanden' },
          { value: '12', label: '6 maanden tot 1 jaar' },
          { value: '24', label: '1 tot 2 jaar' },
          { value: '36', label: 'Meer dan 2 jaar' },
        ],
      },
      {
        id: 'matches_per_week',
        type: 'select',
        label: 'Hoeveel matches krijg je gemiddeld per week?',
        required: true,
        options: [
          { value: '0', label: '0 - Vrijwel geen matches' },
          { value: '1', label: '1-2 matches' },
          { value: '3', label: '3-5 matches' },
          { value: '7', label: '5-10 matches' },
          { value: '15', label: '10-20 matches' },
          { value: '25', label: 'Meer dan 20 matches' },
        ],
      },
      {
        id: 'matches_to_conversations_pct',
        type: 'slider',
        label: 'Hoeveel % van je matches leidt tot een echt gesprek?',
        required: true,
        min: 0,
        max: 100,
        step: 10,
        default: 30,
        unit: '%',
        helper_text: 'Een gesprek = meer dan "hoi hoe gaat het"',
      },
      {
        id: 'conversations_to_dates_pct',
        type: 'slider',
        label: 'Hoeveel % van die gesprekken leidt tot een date?',
        required: true,
        min: 0,
        max: 100,
        step: 10,
        default: 20,
        unit: '%',
      },
      {
        id: 'dates_last_3_months',
        type: 'select',
        label: 'Hoeveel eerste dates heb je gehad in de afgelopen 3 maanden?',
        required: true,
        options: [
          { value: '0', label: '0 dates' },
          { value: '1', label: '1 date' },
          { value: '2', label: '2 dates' },
          { value: '4', label: '3-5 dates' },
          { value: '7', label: '5-10 dates' },
          { value: '12', label: 'Meer dan 10 dates' },
        ],
      },
    ],
  },

  // =====================================================
  // SECTION 3: ENERGIE PROFIEL
  // =====================================================
  {
    id: 3,
    slug: 'energie-profiel',
    title: 'Je Energie Profiel',
    subtitle: 'Introvert, extrovert, of ergens ertussenin?',
    icon: 'battery-medium',
    estimated_minutes: 2,
    intro_text: 'Deze vragen helpen me begrijpen hoe jij met sociale energie omgaat. Er is geen goed of fout.',
    questions: [
      {
        id: 'energy_after_social',
        type: 'scale',
        label: 'Na een dag vol sociale interacties voel ik me...',
        required: true,
        scale_type: 'labeled',
        min: 1,
        max: 5,
        labels: {
          1: 'Compleet uitgeput',
          2: 'Behoorlijk moe',
          3: 'Neutraal',
          4: 'Best energiek',
          5: 'Helemaal opgeladen',
        },
      },
      {
        id: 'conversation_preference',
        type: 'select',
        label: 'Ik praat het liefst...',
        required: true,
        options: [
          {
            value: 'deep_1on1',
            label: '1-op-1 en diepgaand',
            description: 'Liever één goed gesprek dan veel oppervlakkige',
          },
          {
            value: 'light_groups',
            label: 'In groepen en luchtig',
            description: 'Ik geniet van gezelligheid met meerdere mensen',
          },
          {
            value: 'mixed',
            label: 'Hangt van mijn stemming af',
            description: 'Soms het een, soms het ander',
          },
        ],
      },
      {
        id: 'call_preparation',
        type: 'scale',
        label: 'Voordat ik iemand bel, bereid ik me voor wat ik ga zeggen',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: {
          1: 'Nooit',
          3: 'Soms',
          5: 'Altijd',
        },
      },
      {
        id: 'post_date_need',
        type: 'select',
        label: 'Na een date heb ik meestal...',
        required: true,
        options: [
          { value: 'alone_time', label: 'Alleen-tijd nodig om te herstellen' },
          { value: 'more_contact', label: 'Zin in meer contact en opvolging' },
          { value: 'depends', label: 'Hangt af van hoe de date was' },
        ],
      },
      {
        id: 'recharge_method',
        type: 'select',
        label: 'Hoe laad jij je sociale batterij op?',
        required: true,
        options: [
          { value: 'alone', label: 'Alleen zijn — rust, lezen, series kijken' },
          { value: 'close_friends', label: 'Bij een paar goede vrienden zijn' },
          { value: 'activities', label: 'Actief bezig zijn — sporten, hobby\'s' },
          { value: 'sleep', label: 'Slapen en vroeg naar bed' },
        ],
      },
      {
        id: 'social_battery_capacity',
        type: 'slider',
        label: 'Hoe groot is jouw sociale batterij?',
        required: true,
        min: 1,
        max: 10,
        step: 1,
        default: 5,
        labels: {
          1: 'Klein — snel leeg',
          10: 'Groot — bijna nooit leeg',
        },
        helper_text: 'Geen oordeel — dit is wie je bent',
      },
    ],
  },

  // =====================================================
  // SECTION 4: PIJNPUNTEN
  // =====================================================
  {
    id: 4,
    slug: 'pijnpunten',
    title: 'Je Uitdagingen',
    subtitle: 'Waar loop je tegenaan?',
    icon: 'target',
    estimated_minutes: 2,
    intro_text: 'Dit is misschien het belangrijkste deel. Wees eerlijk — zo kan ik je het beste helpen.',
    questions: [
      {
        id: 'pain_points_ranked',
        type: 'ranking',
        label: 'Sleep deze uitdagingen in volgorde van meest naar minst frustrerend:',
        required: true,
        instruction: 'Bovenaan = meest frustrerend',
        options: [
          { value: 'few_matches', label: 'Ik krijg te weinig matches' },
          { value: 'conversations_die', label: 'Gesprekken drogen op' },
          { value: 'no_dates', label: 'Gesprekken leiden niet tot dates' },
          { value: 'ghosting', label: 'Ik word vaak geghostd' },
          { value: 'burnout', label: 'Ik voel me uitgeput/burned out' },
          { value: 'wrong_people', label: 'Ik val steeds op de verkeerde mensen' },
          { value: 'confidence', label: 'Ik durf niet te beginnen / ben onzeker' },
          { value: 'second_dates', label: 'Eerste dates leiden niet tot tweede dates' },
        ],
      },
      {
        id: 'pain_point_severity',
        type: 'slider',
        label: 'Hoe erg heb je last van je grootste uitdaging?',
        required: true,
        min: 1,
        max: 10,
        step: 1,
        default: 5,
        labels: {
          1: 'Milde irritatie',
          5: 'Behoorlijk vervelend',
          10: 'Het houdt me echt tegen',
        },
      },
      {
        id: 'biggest_frustration',
        type: 'textarea',
        label: 'In je eigen woorden: wat frustreert je het meest aan daten?',
        placeholder: 'Vertel vrij — ik luister',
        required: false,
        validation: { max_length: 500 },
        helper_text: 'Dit helpt me je echt begrijpen',
      },
      {
        id: 'tried_solutions',
        type: 'multi_select',
        label: 'Wat heb je al geprobeerd?',
        required: false,
        options: [
          { value: 'new_photos', label: 'Nieuwe foto\'s' },
          { value: 'bio_changes', label: 'Bio herschreven' },
          { value: 'different_apps', label: 'Andere apps geprobeerd' },
          { value: 'friends_advice', label: 'Advies van vrienden' },
          { value: 'youtube_tips', label: 'YouTube/TikTok tips' },
          { value: 'coaching', label: 'Dating coaching' },
          { value: 'therapy', label: 'Therapie' },
          { value: 'breaks', label: 'Pauzes genomen' },
          { value: 'nothing', label: 'Nog niet veel' },
        ],
      },
    ],
  },

  // =====================================================
  // SECTION 5: HECHTINGSSTIJL
  // =====================================================
  {
    id: 5,
    slug: 'hechtingsstijl',
    title: 'Je Hechtingsstijl',
    subtitle: 'Een eerste inzicht in je relatiepatronen',
    icon: 'heart-handshake',
    estimated_minutes: 2,
    intro_text: 'Deze 7 stellingen geven een eerste indicatie van je hechtingsstijl. In Module 2 gaan we hier veel dieper op in.',
    instruction: 'Geef aan in hoeverre elke stelling op jou van toepassing is.',
    outro_text: 'Dit is een eerste indicatie — in Module 2 krijg je een complete analyse.',
    questions: [
      {
        id: 'attachment_q1_abandonment',
        type: 'scale',
        label: 'Ik maak me snel zorgen dat iemand die ik leuk vind me zal verlaten of afwijzen',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: { 1: 'Helemaal niet', 3: 'Soms', 5: 'Heel erg' },
      },
      {
        id: 'attachment_q2_trust',
        type: 'scale',
        label: 'Ik vind het moeilijk om volledig op anderen te vertrouwen',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: { 1: 'Helemaal niet', 3: 'Soms', 5: 'Heel erg' },
      },
      {
        id: 'attachment_q3_intimacy',
        type: 'scale',
        label: 'Ik voel me ongemakkelijk als relaties te intiem of te serieus worden',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: { 1: 'Helemaal niet', 3: 'Soms', 5: 'Heel erg' },
      },
      {
        id: 'attachment_q4_validation',
        type: 'scale',
        label: 'Ik heb veel bevestiging nodig van iemand waar ik mee date',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: { 1: 'Helemaal niet', 3: 'Soms', 5: 'Heel erg' },
      },
      {
        id: 'attachment_q5_withdraw',
        type: 'scale',
        label: 'Ik trek me terug als iemand emotioneel te dichtbij komt',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: { 1: 'Helemaal niet', 3: 'Soms', 5: 'Heel erg' },
      },
      {
        id: 'attachment_q6_independence',
        type: 'scale',
        label: 'Ik houd graag mijn onafhankelijkheid, ook in een relatie',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: { 1: 'Helemaal niet', 3: 'Soms', 5: 'Heel erg' },
      },
      {
        id: 'attachment_q7_closeness',
        type: 'scale',
        label: 'Ik verlang naar meer nabijheid dan de ander comfortabel lijkt te vinden',
        required: true,
        scale_type: 'agreement',
        min: 1,
        max: 5,
        labels: { 1: 'Helemaal niet', 3: 'Soms', 5: 'Heel erg' },
      },
    ],
  },

  // =====================================================
  // SECTION 6: DOELEN
  // =====================================================
  {
    id: 6,
    slug: 'doelen-intentie',
    title: 'Je Doel',
    subtitle: 'Wat wil je bereiken?',
    icon: 'flag',
    estimated_minutes: 2,
    intro_text: 'Laatste inhoudelijke sectie! Laten we het hebben over waar je naartoe wilt.',
    questions: [
      {
        id: 'relationship_goal',
        type: 'select',
        label: 'Wat zoek je op dit moment?',
        required: true,
        options: [
          { value: 'serious_relationship', label: 'Een serieuze relatie' },
          { value: 'casual_dating', label: 'Casual daten — kijken waar het schip strandt' },
          { value: 'marriage', label: 'Iemand om mee te trouwen / kinderen te krijgen' },
          { value: 'unsure', label: 'Ik weet het nog niet precies' },
        ],
      },
      {
        id: 'timeline_preference',
        type: 'select',
        label: 'Hoe snel wil je dit bereiken?',
        required: true,
        options: [
          { value: 'no_rush', label: 'Geen haast — het mag tijd kosten' },
          { value: 'within_year', label: 'Graag binnen een jaar' },
          { value: 'asap', label: 'Zo snel mogelijk' },
          { value: 'exploring', label: 'Ik exploreer nog' },
        ],
      },
      {
        id: 'one_year_vision',
        type: 'textarea',
        label: 'Over 1 jaar wil ik...',
        placeholder: 'Beschrijf je ideale situatie over een jaar',
        required: true,
        validation: { min_length: 20, max_length: 500 },
        helper_text: 'Wees specifiek — dit komt terug in Module 12',
      },
      {
        id: 'success_definition',
        type: 'textarea',
        label: 'Succes na deze cursus is voor mij...',
        placeholder: 'Wanneer zou je zeggen: dit was het waard?',
        required: true,
        validation: { min_length: 10, max_length: 300 },
      },
      {
        id: 'commitment_level',
        type: 'slider',
        label: 'Hoe committed ben je aan deze transformatie?',
        required: true,
        min: 1,
        max: 10,
        step: 1,
        default: 7,
        labels: {
          1: 'Ik probeer het wel',
          5: 'Behoorlijk serieus',
          10: '100% all-in',
        },
      },
      {
        id: 'weekly_time_available',
        type: 'select',
        label: 'Hoeveel uur per week kun je aan deze cursus besteden?',
        required: true,
        options: [
          { value: '1', label: '1 uur of minder' },
          { value: '2', label: '1-2 uur' },
          { value: '4', label: '2-4 uur' },
          { value: '6', label: '4-6 uur' },
          { value: '8', label: 'Meer dan 6 uur' },
        ],
      },
    ],
  },

  // =====================================================
  // SECTION 7: CONTEXT
  // =====================================================
  {
    id: 7,
    slug: 'eerdere-ervaringen',
    title: 'Context',
    subtitle: 'Enkele laatste vragen voor de context',
    icon: 'clock-history',
    estimated_minutes: 1,
    intro_text: 'Bijna klaar! Nog een paar vragen om je volledige plaatje te begrijpen.',
    questions: [
      {
        id: 'has_been_ghosted',
        type: 'boolean',
        label: 'Ben je weleens geghostd?',
        required: true,
        options: [
          { value: true, label: 'Ja' },
          { value: false, label: 'Nee' },
        ],
      },
      {
        id: 'ghosting_frequency',
        type: 'select',
        label: 'Hoe vaak is dit gebeurd?',
        required: false,
        show_if: { field: 'has_been_ghosted', equals: true },
        options: [
          { value: 'once', label: 'Eén keer' },
          { value: 'rarely', label: 'Een paar keer' },
          { value: 'sometimes', label: 'Meerdere keren' },
          { value: 'often', label: 'Regelmatig' },
          { value: 'very_often', label: 'Heel vaak' },
        ],
      },
      {
        id: 'ghosting_impact',
        type: 'slider',
        label: 'Hoeveel impact heeft ghosting op je gehad?',
        required: false,
        show_if: { field: 'has_been_ghosted', equals: true },
        min: 1,
        max: 10,
        step: 1,
        default: 5,
        labels: {
          1: 'Nauwelijks',
          5: 'Behoorlijk',
          10: 'Heel veel',
        },
      },
      {
        id: 'has_experienced_burnout',
        type: 'boolean',
        label: 'Heb je ooit dating burnout ervaren?',
        required: true,
        description: 'Burnout = je voelde je uitgeput, gefrustreerd, of wilde compleet stoppen',
        options: [
          { value: true, label: 'Ja' },
          { value: false, label: 'Nee' },
        ],
      },
      {
        id: 'burnout_severity',
        type: 'slider',
        label: 'Hoe erg was/is deze burnout?',
        required: false,
        show_if: { field: 'has_experienced_burnout', equals: true },
        min: 1,
        max: 10,
        step: 1,
        default: 5,
        labels: {
          1: 'Mild — even pauze',
          5: 'Serieus — maanden gestopt',
          10: 'Zwaar — wilde stoppen',
        },
      },
      {
        id: 'how_found_us',
        type: 'select',
        label: 'Hoe heb je DatingAssistent gevonden?',
        required: false,
        options: [
          { value: 'google', label: 'Google zoeken' },
          { value: 'social_media', label: 'Social media' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'friend', label: 'Via een vriend/kennis' },
          { value: 'podcast', label: 'Podcast' },
          { value: 'other', label: 'Anders' },
        ],
      },
    ],
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getTotalQuestions(): number {
  return DATING_SNAPSHOT_FLOW.reduce((total, section) => total + section.questions.length, 0);
}

export function getTotalEstimatedMinutes(): number {
  return DATING_SNAPSHOT_FLOW.reduce((total, section) => total + section.estimated_minutes, 0);
}

export function getSectionById(id: number): OnboardingSection | undefined {
  return DATING_SNAPSHOT_FLOW.find((section) => section.id === id);
}

export function calculateCompletionPercentage(completedSections: number[]): number {
  const totalSections = DATING_SNAPSHOT_FLOW.length;
  return Math.round((completedSections.length / totalSections) * 100);
}

export function shouldShowQuestion(
  question: { show_if?: { field: string; equals?: any; not_equals?: any } },
  answers: Record<string, any>
): boolean {
  if (!question.show_if) return true;

  const { field, equals, not_equals } = question.show_if;
  const fieldValue = answers[field];

  if (equals !== undefined) {
    return fieldValue === equals;
  }
  if (not_equals !== undefined) {
    return fieldValue !== not_equals;
  }

  return true;
}
