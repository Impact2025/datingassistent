export type MembershipTier = 'free' | 'sociaal' | 'core' | 'pro' | 'premium';

export const MEMBERSHIP_ORDER: MembershipTier[] = ['free', 'sociaal', 'core', 'pro', 'premium'];

export const MEMBERSHIP_LABELS: Record<MembershipTier, string> = {
  free: 'Gratis',
  sociaal: 'Sociaal',
  core: 'Sociaal & Core',
  pro: 'Pro',
  premium: 'Premium',
};

export const MEMBERSHIP_RANK: Record<MembershipTier, number> = {
  free: 0,
  sociaal: 1,
  core: 1,
  pro: 2,
  premium: 3,
};

export type StarterResourceFormat = 'video' | 'email' | 'audio' | 'infographic' | 'worksheet' | 'bundle';

export interface StarterResource {
  id: string;
  title: string;
  format: StarterResourceFormat;
  description: string;
}

export const FREE_STARTER_RESOURCES: StarterResource[] = [
  {
    id: 'starter-3',
    title: 'Boost je dating zelfvertrouwen',
    format: 'audio',
    description: 'Een audio pep-talk van tien minuten om met een positieve mindset te daten.',
  },
  {
    id: 'starter-1',
    title: 'De perfecte profielfoto in 5 stappen',
    format: 'bundle',
    description: 'Checklist met vijf stappen en drie mini-video\'s om je profielfoto\'s direct te verbeteren.',
  },
  {
    id: 'starter-5',
    title: '1. Je profieltekst die wél werkt',
    format: 'bundle',
    description: 'Complete 2-uur masterclass: Transformeer je profiel van onzichtbaar naar onweerstaanbaar met 8 professionele modules, AI-tools en data-gedreven optimalisatie.',
  },
  {
    id: 'starter-4',
    title: 'Herken de 5 grootste "red flags"',
    format: 'infographic',
    description: 'Infographic en video die je leren hoe je veilig blijft en waarschuwingssignalen herkent.',
  },
  {
    id: 'starter-2',
    title: 'Van match naar date in 3 berichten',
    format: 'bundle',
    description:
      'Een interactieve module in het platform die laat zien hoe je een match in drie strategische berichten naar een echte date leidt.',
  },
  {
    id: 'starter-6',
    title: 'De Psychologie van de Onweerstaanbare Profieltekst',
    format: 'bundle',
    description: 'Complete 11-module masterclass over de psychologie van aantrekkingskracht. Leer profielteksten schrijven die consistent quality matches binnenhalen met data, AI-tools en bewezen methodes.',
  },
];

export const STARTER_RESOURCE_COURSE_MAP: Record<string, string> = {
  'starter-1': 'perfecte-profielfoto',
  'starter-2': 'match-naar-date-3-berichten',
  'starter-3': 'boost-je-dating-zelfvertrouwen',
  'starter-4': 'herken-de-5-red-flags',
  'starter-5': 'je-profieltekst-die-wel-werkt',
  'starter-6': 'de-psychologie-van-de-onweerstaanbare-profieltekst',
  'onweerstaanbare-profieltekst': 'de-psychologie-van-de-onweerstaanbare-profieltekst',
};

// SEO-friendly URL mappings for direct course access
export const SEO_COURSE_URLS: Record<string, string> = {
  'boost-je-dating-zelfvertrouwen': '/dashboard/boost-je-dating-zelfvertrouwen',
  'perfecte-profielfoto': '/dashboard/perfecte-profielfoto',
  'match-naar-date-3-berichten': '/dashboard/match-naar-date-3-berichten',
  'herken-de-5-red-flags': '/dashboard/herken-de-5-red-flags',
  'je-profieltekst-die-wel-werkt': '/dashboard/je-profieltekst-die-wel-werkt',
  'de-psychologie-van-de-onweerstaanbare-profieltekst': '/dashboard/onweerstaanbare-profieltekst-psychologie',
  'onweerstaanbare-profieltekst': '/dashboard/onweerstaanbare-profieltekst',
  'je-bent-een-topper': '/dashboard/je-bent-een-topper',
};

export type CourseLessonType = 'video' | 'audio' | 'lesson' | 'exercise' | 'tip' | 'download' | 'interactive' | 'quiz';

export interface CourseLesson {
  id: string;
  title: string;
  type: CourseLessonType;
  description: string;
  bullets?: string[];
  downloads?: string[];
}

export interface CourseSection {
  id: string;
  label: string;
  emoji?: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  exercises?: string[];
  downloads?: string[];
  interactive?: string;
  quiz?: string;
}

export interface DetailedCourse {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: string;
  format: string;
  language: string;
  accessTier: MembershipTier;
  summary: string;
  sections: CourseSection[];
}

export const DETAILED_COURSES: DetailedCourse[] = [
  {
    id: 'de-fundering',
    title: 'De Fundering',
    provider: 'DatingAssistent',
    duration: '1 module',
    level: 'Beginner',
    format: 'Online & interactief',
    language: 'Nederlands',
    accessTier: 'free',
    summary: 'Bouw een solide basis voor je datingleven. Deze cursus helpt je de fundamenten van zelfkennis en intentie te leggen voordat je begint met swipen.',
    sections: [
      {
        id: 'module-0-welkom',
        label: 'MODULE 0',
        emoji: ' фундамент',
        title: 'Welkom & Introductie',
        description: 'Start met het leggen van een sterk fundament voor je dating avontuur.',
        lessons: [
          {
            id: 'lesson-0-1-welkom',
            type: 'video',
            title: 'Les 0.1: Welkom bij De Fundering',
            description: 'Een introductie tot de cursus en wat je kunt verwachten te leren over jezelf en je datingdoelen.',
            bullets: [
              'Het belang van een sterke basis',
              'Overzicht van de cursusmodules',
              'Hoe je het meeste uit deze cursus haalt',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'perfecte-profielfoto',
    title: 'De perfecte profielfoto in 5 stappen',
    provider: 'DatingAssistent',
    duration: '5 modules + bonusmateriaal',
    level: 'Beginner tot semi-professioneel',
    format: 'Online & interactief',
    language: 'Nederlands',
    accessTier: 'free',
    summary:
      'Leer stap voor stap hoe je een profielfoto maakt die jouw persoonlijkheid, professionaliteit en merk versterkt.',
    sections: [
      {
        id: 'module-0',
        label: 'MODULE 0',
        emoji: '🟢',
        title: 'Welkom & introductie',
        description: 'Start met een warme welkom, de vijf stappen en het eindresultaat dat je gaat bereiken.',
        lessons: [
          {
            id: 'lesson-0-1',
            type: 'video',
            title: 'Les 0.1: Welkom bij de cursus',
            description:
              'Welkomstvideo met persoonlijke boodschap, introductie van de fotograaf en overzicht van het proces.',
            bullets: [
              'Kennismaking met de docent',
              'Uitleg van de vijf stappen',
              'Resultaat: een profielfoto die kracht en professionaliteit uitstraalt',
            ],
          },
        ],
        exercises: [
          'Wat wil jij uitstralen met jouw profielfoto?',
          'Waar ga je de foto voornamelijk voor gebruiken (LinkedIn, website, cv, social media)?',
        ],
        downloads: [
          'Checklist – Wat je nodig hebt voor deze cursus (camera of smartphone, statief, neutrale achtergrond, lichtbron, kledingopties)',
        ],
      },
      {
        id: 'step-1',
        label: 'STAP 1',
        emoji: '🔵',
        title: 'Ontdek je Persoonlijke Merk',
        description:
          'Definieer jouw personal brand, zodat je profielfoto meteen de juiste eerste indruk maakt.',
        lessons: [
          {
            id: 'lesson-1-1',
            type: 'video',
            title: 'Les 1.1: Wat is personal branding?',
            description:
              'Waarom je profielfoto een strategisch marketingmoment is en hoe je binnen seconden de juiste indruk wekt.',
            bullets: [
              'Het eerste visuele contactpunt van je merk',
              'Mensen vormen in minder dan twee seconden een indruk',
            ],
          },
          {
            id: 'lesson-1-2',
            type: 'lesson',
            title: 'Les 1.2: Wie ben jij als merk?',
            description:
              'Inventariseer kernwoorden, waarden en voorbeelden van inspirerende profielfoto’s die bij jou passen.',
            downloads: ['Mijn Persoonlijke Merkwaarden – invulbaar werkblad'],
          },
          {
            id: 'lesson-1-3',
            type: 'interactive',
            title: 'Interactieve test: Welke stijl past bij jou?',
            description:
              'Vijf meerkeuzevragen leiden naar jouw stijlprofiel: Corporate Pro, Creatieve Expressor of Authentieke Storyteller.',
          },
          {
            id: 'lesson-1-tip',
            type: 'video',
            title: 'Tipvideo: Zo vertaal je jouw merkstijl naar beeldtaal',
            description:
              'Praktische voorbeelden om je merkwaarden te vertalen naar poses, kleurgebruik en setting.',
          },
        ],
        exercises: ['Vul het werkblad “Mijn Persoonlijke Merkprofiel” volledig in.'],
        downloads: ['Template – Mijn Persoonlijke Merkwaarden'],
      },
      {
        id: 'step-2',
        label: 'STAP 2',
        emoji: '🟣',
        title: 'Styling & Kledingkeuze',
        description:
          'Kies kleuren, kleding, haar en make-up die jouw merkverhaal versterken zonder afleiding.',
        lessons: [
          {
            id: 'lesson-2-1',
            type: 'lesson',
            title: 'Les 2.1: De psychologie van kleur',
            description:
              'Leer hoe kleuren verschillende associaties oproepen en kies combinaties die passen bij jouw uitstraling.',
            bullets: [
              'Blauw staat voor vertrouwen',
              'Zwart straalt autoriteit uit',
              'Groen geeft een frisse indruk',
            ],
            downloads: ['Kleurengids voor jouw profielfoto'],
          },
          {
            id: 'lesson-2-2',
            type: 'lesson',
            title: 'Les 2.2: Kleding, haar & make-up',
            description:
              'Tips voor een verzorgde, natuurlijke uitstraling zonder onnodige glans of afleiding.',
            bullets: [
              'Vermijd drukke patronen en glanzende stoffen',
              'Focus op comfortabele kleding die bij je merk past',
            ],
          },
          {
            id: 'lesson-2-tip',
            type: 'video',
            title: 'Video: Do’s & Don’ts van profielfoto-styling',
            description:
              'Voorbeelden van geslaagde en minder geslaagde stylingkeuzes, plus praktische checklist tips.',
          },
        ],
        exercises: [
          'Selecteer twee outfits die passen bij je gewenste uitstraling en leg ze klaar voor de shoot.',
        ],
        downloads: ['Checklist – Shoot ready: kleding, achtergrond, accessoires'],
        interactive:
          'Upload twee testfoto’s met verschillende outfits voor automatische stijlfeedback of feedback van de community.',
      },
      {
        id: 'step-3',
        label: 'STAP 3',
        emoji: '🟠',
        title: 'Licht, Locatie & Compositie',
        description:
          'Ontdek hoe licht, achtergrond en kadrering het verschil maken tussen gemiddeld en professioneel.',
        lessons: [
          {
            id: 'lesson-3-1',
            type: 'lesson',
            title: 'Les 3.1: Licht is alles',
            description:
              'Gebruik natuurlijk licht, voorkom harde schaduwen en maak gebruik van reflecties voor een zachte uitstraling.',
          },
          {
            id: 'lesson-3-2',
            type: 'lesson',
            title: 'Les 3.2: De juiste achtergrond',
            description:
              'Kies een rustige achtergrond die jouw verhaal ondersteunt en vrij is van rommel of afleidingen.',
          },
          {
            id: 'lesson-3-3',
            type: 'lesson',
            title: 'Les 3.3: Compositie & camerahoek',
            description:
              'Werk met de regel van derden, plaats de camera op ooghoogte en speel subtiel met hoeken voor dynamiek.',
            downloads: ['Visuals – Goede vs. slechte kadreringen'],
          },
          {
            id: 'lesson-3-demo',
            type: 'video',
            title: 'Demovideo: Perfect licht creëren zonder studio',
            description:
              'Stap-voor-stap instructies om thuis met een raam en simpele hulpmiddelen professioneel licht neer te zetten.',
          },
        ],
        exercises: [
          'Maak drie testfoto’s met verschillende achtergronden en belichting en noteer wat het beste werkt.',
        ],
        quiz:
          'Quiz “Herken de fout”: identificeer wat er misgaat in vijf voorbeeldfoto’s (belichting, pose, achtergrond, etc.).',
      },
      {
        id: 'step-4',
        label: 'STAP 4',
        emoji: '🔴',
        title: 'De Shoot: Posing & Expressie',
        description:
          'Werk aan houding, lichaamstaal en expressie zodat je ontspannen en authentiek op de foto staat.',
        lessons: [
          {
            id: 'lesson-4-1',
            type: 'lesson',
            title: 'Les 4.1: Lichaamstaal & houding',
            description:
              'Tips voor rechte houding, ontspannen schouders en natuurlijke positie van armen en handen.',
          },
          {
            id: 'lesson-4-2',
            type: 'lesson',
            title: 'Les 4.2: De kracht van je blik',
            description:
              'Werk met een micro-smile, kijk licht langs de lens en denk aan iets positiefs voor een warme uitstraling.',
          },
          {
            id: 'lesson-4-3',
            type: 'lesson',
            title: 'Les 4.3: De shoot voorbereiden',
            description:
              'Gebruik de tien-minuten checklist voor licht, lens, outfit en ontspanning voordat je op de sluiter drukt.',
            downloads: ['Checklist – Shoot ready in 10 minuten'],
          },
          {
            id: 'lesson-4-video',
            type: 'video',
            title: 'Video: Van ongemakkelijk naar zelfverzekerd voor de camera',
            description:
              'Praktische demonstratie om spanning los te laten en authentiek te lachen.',
          },
        ],
        exercises: [
          'Oefen drie poses voor de spiegel of camera en noteer welke het meest natuurlijk voelt.',
        ],
        interactive:
          'Maak drie testfoto’s met verschillende expressies (serieus, vriendelijk, open) en vraag AI- of peer-feedback.',
      },
      {
        id: 'confidence-reflection',
        label: 'REFLECTIE',
        emoji: '💪',
        title: 'Camera Angst & Zelfvertrouwen Reflectie',
        description:
          'Ontdek je diepste camera-angsten en bouw je fotografische zelfvertrouwen op met deze diepgaande reflectie oefening.',
        lessons: [
          {
            id: 'confidence-reflection-lesson',
            type: 'interactive',
            title: 'Camera Angst & Zelfvertrouwen voor de Lens',
            description:
              'Een diepgaande reflectie over je relatie met fotografie, camera-angst en hoe je meer zelfvertrouwen kunt ontwikkelen voor de lens.',
          },
        ],
        exercises: [
          'Beantwoord alle reflectie vragen eerlijk en neem de tijd voor elk antwoord.',
          'Herlees je antwoorden na een week en merk op wat er veranderd is.',
        ],
      },
      {
        id: 'step-5',
        label: 'STAP 5',
        emoji: '🟢',
        title: 'Selectie & Nabewerking',
        description:
          'Kies de beste foto, bewerk subtiel en maak een consistente presentatie voor al je kanalen.',
        lessons: [
          {
            id: 'lesson-5-1',
            type: 'lesson',
            title: 'Les 5.1: Kies de juiste foto',
            description:
              'Selecteer op uitstraling, vraag feedback aan drie mensen en test verschillende opties.',
          },
          {
            id: 'lesson-5-2',
            type: 'lesson',
            title: 'Les 5.2: Basis nabewerking',
            description:
              'Werk met Canva, Lightroom Mobile of Snapseed voor subtiele correcties zonder overbewerking.',
            bullets: [
              'Corrigeer belichting en contrast',
              'Pas kleuren subtiel aan en retoucheer alleen kleine imperfecties',
            ],
          },
          {
            id: 'lesson-5-3',
            type: 'lesson',
            title: 'Les 5.3: De eindpresentatie',
            description:
              'Combineer je profielfoto met naam en functietitel in een consistent merktemplate.',
            downloads: ['Template – Profielfoto presentatie met naam en functietitel'],
          },
          {
            id: 'lesson-5-video',
            type: 'video',
            title: 'Video: Eenvoudige nabewerking voor beginners',
            description: 'Hands-on walkthrough van een snelle retouche-workflow.',
          },
        ],
        exercises: [
          'Maak een shortlist van drie foto’s, gebruik de Profielfoto Keuzehulp en kies je uiteindelijke winnaar.',
        ],
      },
      {
        id: 'bonus',
        label: 'BONUSMODULE',
        emoji: '🟣',
        title: 'Strategisch Gebruik van Je Profielfoto',
        description:
          'Leer hoe je jouw profielfoto inzet op verschillende platformen en hoe je herkenbaar blijft bij updates.',
        lessons: [
          {
            id: 'lesson-b-1',
            type: 'lesson',
            title: 'Les B.1: Foto op LinkedIn, Instagram & website',
            description:
              'Platformspecifieke formaten, consistentie en slimme combinaties met banners of logo’s.',
            downloads: ['Social media formaatgids (LinkedIn, Instagram, Facebook, X, enz.)'],
          },
          {
            id: 'lesson-b-2',
            type: 'lesson',
            title: 'Les B.2: Profielfoto-update strategie',
            description:
              'Waarom je elke 1–2 jaar vernieuwt en hoe je herkenbaarheid bewaart.',
            downloads: ['Bonuschecklist – Blijf zichtbaar, blijf jezelf'],
          },
        ],
      },
      {
        id: 'certificering',
        label: 'CERTIFICERING',
        emoji: '🎓',
        title: 'Reflectie, Evaluatie & Certificaat',
        description:
          'Sluit af met reflectie, toets je kennis en claim je certificaat en badge.',
        lessons: [
          {
            id: 'lesson-c-1',
            type: 'lesson',
            title: 'Les C.1: Reflectie & Evaluatie',
            description:
              'Beantwoord reflectievragen over je leerproces en hoe je de foto gaat inzetten.',
            bullets: [
              'Wat heb je geleerd over jezelf?',
              'Wat maakt jouw foto nu sterker dan voorheen?',
              'Hoe ga je dit inzetten voor je merk?',
            ],
          },
          {
            id: 'lesson-c-2',
            type: 'lesson',
            title: 'Les C.2: Certificaat van afronding',
            description:
              'Download het certificaat “Gecertificeerd Profielfoto-Pro” en badge voor LinkedIn of je website.',
            downloads: ['Certificaat – Gecertificeerd Profielfoto-Pro', 'Badge – Profielfoto Pro voor LinkedIn'],
          },
        ],
        quiz: 'Eindquiz met de belangrijkste leerpunten uit alle stappen.',
      },
    ],
  },
  {
    id: 'basiscursus-dating-fundament',
    title: 'Basiscursus: Dating Fundament',
    provider: 'DatingAssistent',
    duration: '5 modules (25+ opdrachten)',
    level: 'Beginner',
    format: 'Online training met video, werkbladen en AI-tools',
    language: 'Nederlands',
    accessTier: 'sociaal',
    summary:
      'Leg een stevig fundament voordat je gaat swipen: van mindset en verwachtingen tot een onweerstaanbaar profiel met foto’s, bio en prompts.',
    sections: [
      {
        id: 'module-1-mindset',
        label: 'MODULE 1',
        emoji: '🧭',
        title: 'Mindset & voorbereiding',
        description:
          'Krijg haarscherp wat jij zoekt, ontwikkel realistische verwachtingen en kies bewust de apps die bij je doel passen.',
        lessons: [
          {
            id: 'module-1-lesson-1',
            type: 'video',
            title: 'Les 1.1: Wat zoek je écht? Jouw Dating Kompas',
            description:
              'In 5 minuten zoom je in op je intenties, kernwaarden en must-haves versus nice-to-haves vóórdat je begint met daten.',
            bullets: [
              'Herken het verschil tussen serieuze relatie, vriendschap of casual daten.',
              'Gebruik kernwaarden om betere matches te herkennen.',
              'Bepaal duidelijke doelen voor de komende zes maanden.',
            ],
            downloads: ['Werkblad – Mijn Dating Kompas (PDF)'],
          },
          {
            id: 'module-1-lesson-2',
            type: 'video',
            title: 'Les 1.2: De Kunst van Realistische Verwachtingen',
            description:
              'Een korte reality-check over daten anno nu: hoe je plezier houdt en teleurstellingen voorkomt.',
            bullets: [
              'Daten is een proces, geen eindbestemming.',
              'Focus op kleine successen en leer van iedere interactie.',
              'Maak van daten een experiment in plaats van een test.',
            ],
          },
          {
            id: 'module-1-lesson-3',
            type: 'video',
            title: 'Les 1.3: De Juiste Dating App Kiezen',
            description:
              'Leer welke Nederlandse apps bij jouw persoonlijkheid passen en waarom je het beste met één of twee tegelijk start.',
            bullets: [
              'Overzicht van Tinder, Bumble, Hinge, Lexa, Paiq en Inner Circle.',
              'Voor- en nadelen per platform, inclusief premium features.',
              'Waarom focus belangrijker is dan everywhere swipen.',
            ],
            downloads: ['Vergelijkingstabel – Nederlandse datingapps (PDF)'],
          },
        ],
        exercises: [
          'Vul het werkblad “Mijn Dating Kompas” in en noteer je top 3 kernwaarden.',
          'Definieer je belangrijkste relatiedoel voor de komende zes maanden.',
          'Formuleer een positieve mantra voor momenten dat gesprekken minder lopen.',
          'Bedenk een persoonlijk succescriterium dat niet afhankelijk is van matches.',
          'Beschrijf het verschil tussen hoopvol en wanhopig en hoe jij hoopvol blijft.',
          'Kies maximaal twee datingapps op basis van de vergelijkingstabel (accounts pas maken in Module 2).',
          'Bestudeer profielen op de gekozen apps en noteer wat de cultuur is.',
        ],
        interactive:
          'AI integratie: start de Vaardigheden-scan als nulmeting, sla je score op en raadpleeg later opnieuw; gebruik daarna de Aanbevelingen-tool om app-adviezen en matchcriteria te bewaren.',
      },
      {
        id: 'module-2-profiel',
        label: 'MODULE 2',
        emoji: '✨',
        title: 'Het onweerstaanbare profiel',
        description:
          'Bouw een profiel dat vertrouwen uitstraalt, gesprekjes triggert en perfect past bij je doelen.',
        lessons: [
          {
            id: 'module-2-lesson-1',
            type: 'video',
            title: 'Les 2.1: De complete foto-strategie',
            description:
              'In 7 minuten leer je welke zes foto’s je nodig hebt, welke no-go’s je vermijdt en hoe je de beste shots maakt.',
            bullets: [
              'Selecteer een headshot, full-body, passie, sociaal, spontane en humor foto.',
              'Gebruik natuurlijk licht, variatie in outfits en laat filters achterwege.',
              'Werk stapsgewijs: 50 foto’s maken, top 6 kiezen, volgorde bepalen.',
            ],
            downloads: ['Checklist – 6 onmisbare datingfoto’s (PDF)'],
          },
          {
            id: 'module-2-lesson-2',
            type: 'lesson',
            title: 'Les 2.2: De psychologie van eerste indrukken',
            description:
              'Leer hoe mensen binnen 3 seconden een eerste indruk vormen en hoe je foto\'s kiest die de juiste boodschap overbrengen.',
            bullets: [
              'Waarom eerste indrukken cruciaal zijn in dating',
              'De rol van gezichtsuitdrukkingen en lichaamstaal',
              'Hoe foto\'s je persoonlijkheid communiceren',
              'De balans tussen aantrekkelijk en authentiek'
            ]
          },
          {
            id: 'module-2-lesson-3',
            type: 'video',
            title: 'Les 2.3: Profielprompts & vragen',
            description:
              'Ontdek hoe je app-specifieke prompts (Hinge, Bumble, Tinder) gebruikt om je persoonlijkheid te laten spreken.',
            bullets: [
              'Voorzie Hinge-prompts van humor en mini-verhalen.',
              'Gebruik badges en “What I’m looking for” op Bumble voor extra duidelijkheid.',
              'Combineer anthem + interesses op Tinder voor instant gespreksonderwerpen.',
            ],
            downloads: ['Database – Sterke prompt antwoorden (PDF)'],
          },
          {
            id: 'module-2-lesson-4',
            type: 'lesson',
            title: 'Les 2.4: Final check & live gaan',
            description:
              'Loop de complete checklist door voordat je jouw profiel live zet op maximaal twee apps.',
            bullets: [
              'Controleer spelling, privacy en matching-filters.',
              'Houd screenshots bij als ijkpunt voor latere optimalisaties.',
              'Vier het moment dat je profiel live gaat – je fundament staat.',
            ],
            downloads: ['Checklist – Het complete profiel (PDF)'],
          },
        ],
        exercises: [
          'Analyseer je huidige foto\'s: Welke eerste indruk wekken ze? Welke boodschap communiceren ze over je persoonlijkheid?',
          'Bekijk succesvolle profielen: Wat maakt dat mensen binnen 3 seconden besluiten om verder te kijken?',
          'Fotografie oefening: Neem één foto die specifiek je persoonlijkheid uitstraalt en analyseer wat deze communiceert.',
          'Reflectie: Welke eerste indruk wil jij maken en hoe kun je dat vertalen naar je foto-selectie?',
          'Verzamel minimaal 10 tot 15 ruwe foto\'s en selecteer jouw top zes.',
          'Upload je beste drie foto\'s naar de AI Foto-Checker en noteer de feedback.',
          'Upload je volledige set van zes foto\'s in de AI Foto Advies-tool, pas de volgorde aan en herhaal dit ieder kwartaal.',
          'Schrijf drie bio-versies (humor, authentiek, mysterieus) en lees ze hardop voor.',
          'Vraag feedback van een vriend(in) en kies de bio die het meest als jou klinkt.',
          'Bedenk antwoorden op minimaal drie prompts of profielvragen van jouw gekozen app.',
          'Doorloop de complete profielchecklist, maak screenshots en zet je profiel live.',
        ],
        interactive:
          'AI integraties: gebruik de AI Profiel-Optimalisatie en Profiel Coach voor bio’s en prompts, laat de Foto Checker en Foto Advies tools je beeldselectie valideren en voer een finale profiel-audit uit met de Profiel Coach om een totaalscore en laatste tips te ontvangen.',
      },
      {
        id: 'module-3-matchen',
        label: 'MODULE 3',
        emoji: '🎯',
        title: 'Effectief swipen & matchen',
        description:
          'Leer strategisch swipen, stel slimme filters in en schrijf openingsberichten die binnenkomen alsof ze voor de ander zijn gemaakt.',
        lessons: [
          {
            id: 'module-3-lesson-1',
            type: 'video',
            title: 'Les 3.1: Swipe als een curator, niet als een verzamelaar',
            description:
              'Ontdek hoe je swipetempo, filterinstellingen en app-ritme zorgen voor kwalitatieve matches in plaats van eindeloos scrollen.',
            bullets: [
              'Gebruik tijdsblokken en duidelijke criteria zodat je gefocust blijft.',
              'Pas je zoekradius en leeftijdsfilters aan op basis van je Dating Kompas.',
              'Leer welke signalen in foto’s en bios iets zeggen over consistentie.',
            ],
          },
          {
            id: 'module-3-lesson-2',
            type: 'lesson',
            title: 'Les 3.2: Matchscripts & openingslijnen',
            description:
              'Bouw een mini-script voor je eerste bericht: herken iets, koppel het aan jezelf en stel een open vraag.',
            bullets: [
              'Gebruik het “zie – verbind – vraag”-model.',
              'Voorkom generieke complimenten: focus op een detail uit hun profiel.',
              'Plan varianten voor introverts vs. extraverts, zodat je altijd iets paraat hebt.',
            ],
          },
          {
            id: 'module-3-lesson-3',
            type: 'tip',
            title: 'Les 3.3: Quality Score voor je matches',
            description:
              'Maak een scorecard (1–5) op basis van intentie, gesprekspotentieel en energie zodat je makkelijker beslist wie je een bericht stuurt.',
            downloads: ['Template – Match Scorecard (Notion/Sheets)'],
          },
        ],
        exercises: [
          'Pas je app-filters aan op basis van je kernwaarden (noteer welke je wijzigt).',
          'Maak drie openingsberichten met het “zie – verbind – vraag”-model en test ze in de IJsbreker Generator.',
          'Gebruik de Match Scorecard op vijf recente matches en bepaal wie je bericht stuurt.',
        ],
        interactive:
          'AI integratie: start de Platform Match in het dashboard om apps én doelgroepfilters te laten aanbevelen, en genereer daarna openingszinnen via de IJsbreker Generator voor de hoogste score matches.',
      },
      {
        id: 'module-4-gesprek',
        label: 'MODULE 4',
        emoji: '💬',
        title: 'De kunst van het gesprek',
        description:
          'Hou energie in een chat: van eerste toon tot het verdiepen en bewaken van je grenzen.',
        lessons: [
          {
            id: 'module-4-lesson-1',
            type: 'video',
            title: 'Les 4.1: Het drieluik Openen – Verdiepen – Afronden',
            description:
              'Leer hoe je met ritme, humor en checkpoints voorkomt dat gesprekken doodbloeden of te veel energie vragen.',
            bullets: [
              'Gebruik het AAA-model: Aandacht, Aansluiting, Afspraken.',
              'Plan micro-doelen per gesprek (bijv. van smalltalk naar gedeelde ervaring).',
              'Maak bewust gebruik van audio en video om vertrouwen op te bouwen.',
            ],
          },
          {
            id: 'module-4-lesson-2',
            type: 'lesson',
            title: 'Les 4.2: Signalen van rode vlaggen herkennen',
            description:
              'Check-in op inconsistent gedrag, pressie en pings die niet goed voelen zodat je tijdig kunt bijsturen.',
            bullets: [
              'Let op snelheid, toon en empathie in antwoorden.',
              'Documenteer opvallende patronen zodat je objectief kunt besluiten te stoppen.',
            ],
            downloads: ['Checklist – Chat rode vlaggen vs. groene vlaggen'],
          },
          {
            id: 'module-4-lesson-3',
            type: 'tip',
            title: 'Les 4.3: Van chat naar meet-up',
            description:
              'Gebruik het “mini-samenvatting + voorstel + escape”-script om soepel richting offline af te spreken te bewegen.',
          },
        ],
        exercises: [
          'Schrijf drie conversation starters voor matches met uiteenlopende interesses en test ze via de AI Conversatie Starter.',
          'Gebruik de Gespreks EHBO (AI Veiligheidscheck) op een gesprek dat twijfels oproept en noteer welke feedback je krijgt.',
          'Stel een eigen “van chat naar date”-script samen en oefen het hardop.',
        ],
        interactive:
          'AI integratie: gebruik de Conversatie Starter om openingslijnen te testen en de Gespreks EHBO (AI veiligheidscheck) om riskante gesprekken te screenen vóórdat je verder investeert.',
      },
      {
        id: 'module-5-date',
        label: 'MODULE 5',
        emoji: '📅',
        title: 'De eerste date',
        description:
          'Plan een date die klopt bij jullie energie, bewaken grenzen en evalueer slim zodat je momentum behoudt.',
        lessons: [
          {
            id: 'module-5-lesson-1',
            type: 'video',
            title: 'Les 5.1: Dateformats die werken',
            description:
              'Kies formats op basis van activiteiten, duur en exit-strategie zodat je altijd grip houdt op het tempo.',
            bullets: [
              'Ontwikkel een A/B/C-dateformat (koffie, activiteit, avondvariant).',
              'Plan dates op neutraal terrein en communiceer je grenzen vooraf.',
            ],
          },
          {
            id: 'module-5-lesson-2',
            type: 'lesson',
            title: 'Les 5.2: Microdynamiek tijdens de date',
            description:
              'Gebruik gesprekspatronen (luister – spiegel – deel) en check-ins om spanning te managen en verbinding te bouwen.',
            bullets: [
              'Werk met nieuwsgierige vervolgvragen en deel mini-verhalen.',
              'Observeer lichaamstaal en energie om comfort te peilen.',
            ],
          },
          {
            id: 'module-5-lesson-3',
            type: 'lesson',
            title: 'Les 5.3: Evalueren en opvolgen',
            description:
              'Beslis of je een tweede date plant via een reflectie op connectie, leerpunten en enthousiasme.',
            downloads: ['Werkblad – Date reflectie & follow-up plan'],
          },
        ],
        exercises: [
          'Gebruik de Date Planner AI om een eerste date-format te kiezen en koppel er een backup-plan aan.',
          'Maak een “veiligheid + logistiek”-checklist (locatie, buddy, exit plan) en deel die met een vriend(in).',
          'Vul na je volgende date het reflectiewerkblad in en verstuur een passende follow-up.',
        ],
        interactive:
          'AI integratie: plan je date met de Date Planner AI, voer na afloop een korte reflectie in de Profiel Coach in om feedback op je vervolgbericht te krijgen en gebruik optioneel de Gespreks EHBO om twijfels te checken.',
      },
    ],
  },
  {
    id: 'connectie-en-diepgang-programma',
    title: 'Intermediate: Connectie & Diepgang',
    provider: 'DatingAssistent',
    duration: '5 modules (20+ opdrachten)',
    level: 'Gemiddeld',
    format: 'Coachende videolessen, frameworks en AI-oefeningen',
    language: 'Nederlands',
    accessTier: 'pro',
    summary:
      'Ontwikkel sociale intelligentie, flirtvaardigheden en emotionele veerkracht om gesprekken naar echte verbinding te tillen.',
    sections: [
      {
        id: 'module-6-aantrekkingskracht',
        label: 'MODULE 6',
        emoji: '🧠',
        title: 'De psychologie van aantrekkingskracht',
        description:
          'Ontdek wat nieuwsgierigheid triggert, welke cues vertrouwen wekken en hoe je zelfverzekerd overkomt – online en offline.',
        lessons: [
          {
            id: 'module-6-lesson-1',
            type: 'video',
            title: 'Les 6.1: Aantrekkingskracht ontleed',
            description:
              'Leer welke mix van zelfbeeld, lichaamstaal en storytelling onweerstaanbare profielen én gesprekken opleveren.',
            bullets: [
              'Inzicht in dopamine, nieuwsgierigheid en spiegelgedrag.',
              'Praktische tweaks voor houding, stem en micro-expressies.',
            ],
          },
          {
            id: 'module-6-lesson-2',
            type: 'lesson',
            title: 'Les 6.2: Personal branding in de praktijk',
            description:
              'Verbind je kernwaarden aan zichtbare elementen (foto, bio, chat) en houd je merk consistent.',
            downloads: ['Canvas – Persoonlijk aantrekkingsprofiel'],
          },
          {
            id: 'module-6-lesson-3',
            type: 'tip',
            title: 'Les 6.3: Reflecteer met feedback',
            description:
              'Gebruik structured feedback van vrienden, community en AI-analyses om continue bij te sturen.',
          },
        ],
        exercises: [
          'Laat de AI Foto-Checker en Profiel Coach je huidige uitstraling scoren en noteer verbeterpunten.',
          'Interview een vriend(in) voor drie woorden die jouw energie het best beschrijven.',
          'Werk je Persoonlijk aantrekkingsprofiel-canvas uit en deel het in de community (optioneel).',
        ],
        interactive:
          'AI integratie: analyseer je foto’s en bio via Foto Checker en Profiel Coach, en gebruik Chat met Coach om concrete verbeterstappen te prioriteren.',
      },
      {
        id: 'module-7-diepgaand-gesprek',
        label: 'MODULE 7',
        emoji: '🗝️',
        title: 'Diepgaande gesprekken voeren',
        description:
          'Leer luisteren op meerdere lagen, stel vragen die verbinden en herken wanneer het tijd is om dieper te gaan of juist te vertragen.',
        lessons: [
          {
            id: 'module-7-lesson-1',
            type: 'video',
            title: 'Les 7.1: Luisteren met nieuwsgierigheid',
            description:
              'Pas het LAA-model toe (Luisteren, Aanduiden, Aansluiten) om mensen écht gezien te laten voelen.',
          },
          {
            id: 'module-7-lesson-2',
            type: 'lesson',
            title: 'Les 7.2: Vraagtechnieken & story-stacking',
            description:
              'Gebruik open vragen, contrastvragen en future pacing om emotionele band op te bouwen.',
            downloads: ['Toolkit – 30 verdiepingvragen per thema'],
          },
          {
            id: 'module-7-lesson-3',
            type: 'tip',
            title: 'Les 7.3: Grenzen herkennen tijdens het gesprek',
            description:
              'Ontwikkel antennes voor overwhelm, pushback en onveiligheid zodat je respectvol kan bijsturen.',
          },
        ],
        exercises: [
          'Voer drie mini-interviews met vrienden en oefen het LAA-model (kies verschillende onderwerpen).',
          'Gebruik de Conversatie Starter AI om vervolgvragen te laten genereren op jouw eigen antwoorden.',
          'Maak een “red flag respons-script” voor situaties waarin jij grenzen wil bewaken.',
        ],
        interactive:
          'AI integratie: laat de Conversatie Starter AI je vragen uitbreiden en gebruik Chat met Coach om scenario’s te simuleren waar je grenzen moet aangeven.',
      },
      {
        id: 'module-8-flirten',
        label: 'MODULE 8',
        emoji: '🔥',
        title: 'Flirten, humor & spanning',
        description:
          'Ontwikkel een speelse stijl die bij jou past en leer spanning opbouwen zonder ongemakkelijk te worden.',
        lessons: [
          {
            id: 'module-8-lesson-1',
            type: 'video',
            title: 'Les 8.1: Speelse dynamiek creëren',
            description:
              'Gebruik contrast, plagen en call-backs om luchtige spanning te bouwen.',
          },
          {
            id: 'module-8-lesson-2',
            type: 'lesson',
            title: 'Les 8.2: Humor zonder risico',
            description:
              'Leer drie humorlijnen kennen (observatie, hyperbool, zelfspot) en wanneer je ze het beste inzet.',
          },
          {
            id: 'module-8-lesson-3',
            type: 'lesson',
            title: 'Les 8.3: Spanning doseren met lichaamstaal',
            description:
              'Ontdek micro-signalen (tempo, aanraking, pauzes) die spanning verhogen of juist kalmeren.',
          },
        ],
        exercises: [
          'Schrijf vijf flirterige opmerkingen en laat de AI Profiel Coach controleren of ze speels en respectvol blijven.',
          'Gebruik Chat met Coach voor een speelse dialoog en experimenteer met call-backs.',
          'Plan een speelse activiteit (bijv. mini-challenge) voor je volgende date en noteer je observaties.',
        ],
        interactive:
          'AI integratie: oefen flirterige berichten via Chat met Coach (speelse modus) en laat de Profiel Coach feedback geven op toon en balans.',
      },
      {
        id: 'module-9-veerkracht',
        label: 'MODULE 9',
        emoji: '🛡️',
        title: 'Omgaan met onzekerheid & afwijzing',
        description:
          'Bouw emotionele veerkracht op, herkader afwijzing en maak een plan om terug te veren zonder jezelf te sluiten.',
        lessons: [
          {
            id: 'module-9-lesson-1',
            type: 'video',
            title: 'Les 9.1: Afwijzing is data',
            description:
              'Zie afwijzing als feedback – je leert waar je staat, niet wie je bent.',
          },
          {
            id: 'module-9-lesson-2',
            type: 'lesson',
            title: 'Les 9.2: Patronen van onzekerheid doorbreken',
            description:
              'Herken triggers (ghosting, stilte) en formuleer rituelen om rustig te blijven.',
            downloads: ['Werkblad – Emotionele veerkracht & rituelen'],
          },
          {
            id: 'module-9-lesson-3',
            type: 'tip',
            title: 'Les 9.3: De aftercare check',
            description:
              'Maak een follow-upplan voor je mentale gezondheid na elke date/call.',
          },
        ],
        exercises: [
          'Vul het veerkrachtwerkblad in en kies twee rituelen voor moeilijke dagen.',
          'Gebruik Chat met Coach om een afwijzingsbericht te herschrijven in neutrale taal.',
          'Laat de Gespreks EHBO een ongemakkelijk gesprek analyseren en noteer welke aanwijzingen je voortaan eerder wil zien.',
        ],
        interactive:
          'AI integratie: gebruik Chat met Coach voor mindset reframing en de Gespreks EHBO om onveilige patronen te identificeren voordat ze escaleren.',
      },
      {
        id: 'module-10-green-flags',
        label: 'MODULE 10',
        emoji: '🌿',
        title: 'Herkennen van “green flags”',
        description:
          'Focus op positieve signalen van beschikbaarheid, consistentie en gedeelde waarden zodat je niet blijft hangen in red flag-scanmodus.',
        lessons: [
          {
            id: 'module-10-lesson-1',
            type: 'video',
            title: 'Les 10.1: Van controle naar vertrouwen',
            description:
              'Leer hoe je je radar reset van gevaar naar potentieel – zonder naïef te worden.',
          },
          {
            id: 'module-10-lesson-2',
            type: 'lesson',
            title: 'Les 10.2: Observatiegids voor green flags',
            description:
              'Analyseer gedrag in chat, date en vervolg om oprechte interesse te herkennen.',
            downloads: ['Checklist – 30 green flags in gesprekken & dates'],
          },
          {
            id: 'module-10-lesson-3',
            type: 'tip',
            title: 'Les 10.3: Samen evalueren',
            description:
              'Leer hoe je met vrienden of coach evalueert zonder cynisme of roze bril.',
          },
        ],
        exercises: [
          'Maak een persoonlijk green-flagprofiel (top 5 gedragingen) en deel dit met een accountability buddy.',
          'Voer na elke date de green-flag checklist in en bepaal of je vervolg investeert.',
          'Laat de Profiel Coach je gesprekken scannen op positieve signalen voor een realistisch beeld.',
        ],
        interactive:
          'AI integratie: laad chatfragmenten in de Profiel Coach of Gespreks EHBO voor een objectieve scan op positieve signalen en verbeterpunten.',
      },
    ],
  },
  {
    id: 'meesterschap-in-relaties-programma',
    title: 'Premium: Meesterschap in relaties',
    provider: 'DatingAssistent',
    duration: '3 modules (15+ opdrachten)',
    level: 'Gevorderd',
    format: 'Deep-dive coaching, frameworks en reflectie met AI-support',
    language: 'Nederlands',
    accessTier: 'premium',
    summary:
      'Begeleid de overgang van daten naar een duurzame relatie met focus op hechting, communicatie en gezamenlijke toekomstplanning.',
    sections: [
      {
        id: 'module-11-hechting',
        label: 'MODULE 11',
        emoji: '🧩',
        title: 'Jouw hechtingsstijl & datingpatronen',
        description:
          'Ontdek hoe je relaties benadert, breek patronen die niet werken en creëer een plan om veilig en open te verbinden.',
        lessons: [
          {
            id: 'module-11-lesson-1',
            type: 'video',
            title: 'Les 11.1: Hechtingsstijlen in daten',
            description:
              'Herken vermijdende, angstige en veilige patronen en hoe ze terugkomen in je matchgedrag.',
          },
          {
            id: 'module-11-lesson-2',
            type: 'lesson',
            title: 'Les 11.2: Trigger map & herstelplan',
            description:
              'Kaart situaties die je nervous system activeren en ontwerp kalmerende routines.',
            downloads: ['Werkblad – Trigger map & herstelplan'],
          },
          {
            id: 'module-11-lesson-3',
            type: 'tip',
            title: 'Les 11.3: Attachment conversations',
            description:
              'Leer hoe je open gesprekken voert over behoeften zonder drama of schuld.',
          },
        ],
        exercises: [
          'Vul het trigger-werkblad in en stel drie herstelacties op voor stressmomenten.',
          'Gebruik Chat met Coach om een kwetsbaar gesprek te oefenen over jouw behoeften.',
          'Vraag twee naasten hoe zij jouw hechtingsstijl zien en noteer overlappende feedback.',
        ],
        interactive:
          'AI integratie: gebruik Chat met Coach voor rollenspellen rond moeilijke gesprekken en laat de Profiel Coach toetsen of je communicatie consistent blijft met je doelen.',
      },
      {
        id: 'module-12-communicatie',
        label: 'MODULE 12',
        emoji: '🗣️',
        title: 'Communicatie voorbij de eerste dates',
        description:
          'Leer behoeften, grenzen en verwachtingen bespreken terwijl je verbonden blijft en escalation voorkomt.',
        lessons: [
          {
            id: 'module-12-lesson-1',
            type: 'video',
            title: 'Les 12.1: Needs, boundaries & agreements',
            description:
              'Gebruik het NBA-model om wensen te communiceren zonder oordeel of eisen.',
          },
          {
            id: 'module-12-lesson-2',
            type: 'lesson',
            title: 'Les 12.2: Conflict als groeimoment',
            description:
              'Leer technieken voor repair: reflect, validate, request.',
          },
          {
            id: 'module-12-lesson-3',
            type: 'lesson',
            title: 'Les 12.3: Digitale hygiëne & transparantie',
            description:
              'Maak afspraken over appgebruik, tempo en check-ins zodat jullie aligned blijven.',
            downloads: ['Template – Relatie overview & afspraken'],
          },
        ],
        exercises: [
          'Schrijf drie statements volgens het NBA-model en laat Chat met Coach feedback geven.',
          'Observeer een recent meningsverschil en pas het repair-framework toe (noteer uitkomst).',
          'Vul de relatie-overview in met je partner of dating buddy om te checken of jullie verwachtingen matchen.',
        ],
        interactive:
          'AI integratie: oefen needs-gesprekken met Chat met Coach en gebruik de Gespreks EHBO om mogelijke misverstanden vooraf te spotten.',
      },
      {
        id: 'module-13-overgang-relatie',
        label: 'MODULE 13',
        emoji: '💞',
        title: 'Van daten naar een relatie',
        description:
          'Begeleid de overgang naar exclusiviteit of een next step met duidelijke verwachtingen, rituelen en toekomstvisie.',
        lessons: [
          {
            id: 'module-13-lesson-1',
            type: 'video',
            title: 'Les 13.1: Het “wat zijn we?”-gesprek',
            description:
              'Plan timing, locatie en structuur zodat het een open uitwisseling wordt i.p.v. een kruisverhoor.',
          },
          {
            id: 'module-13-lesson-2',
            type: 'lesson',
            title: 'Les 13.2: Gezamenlijke visie & rituelen',
            description:
              'Ontwikkel mini-rituelen (wekelijkse check-in, date-night) en lange termijndoelen.',
          },
          {
            id: 'module-13-lesson-3',
            type: 'tip',
            title: 'Les 13.3: Evalueren & bijsturen',
            description:
              'Gebruik kwartaalreflecties om groei te vieren en verbeterpunten te tackelen.',
          },
        ],
        exercises: [
          'Schrijf een script voor het exclusiviteitsgesprek en toets het bij Chat met Coach.',
          'Ontwerp samen drie mini-rituelen en leg vast wie wat initieert.',
          'Plan een kwartaalreview met reflectievragen (download) en noteer eventuele afspraken.',
        ],
        interactive:
          'AI integratie: laat Chat met Coach je exclusiviteitsgesprek simuleren en gebruik de Date Planner AI om gezamenlijke rituelen op de agenda te zetten.',
      },
    ],
  },
  {
    id: 'je-profieltekst-die-wel-werkt',
    title: 'Een profieltekst die wél werkt',
    provider: 'DatingAssistent',
    duration: '2 uur complete masterclass',
    level: 'Van beginner naar profiel-expert',
    format: '8-staps leertraject met video, oefeningen, AI-tools en persoonlijke coaching',
    language: 'Nederlands',
    accessTier: 'free',
    summary:
      'Transformeer je dating profiel van onzichtbaar naar onweerstaanbaar. Leer in 8 professionele stappen hoe je een profieltekst schrijft die 5x meer quality matches oplevert, gebaseerd op psychologie, data en bewezen methodes.',
    sections: [
      {
        id: 'module-0-welkom-masterclass',
        label: 'WELKOM',
        emoji: '🎯',
        title: 'Welkom bij je Profiel Transformatie',
        description:
          'Ontdek waarom 94% van de dating profielen falen en hoe jij in 2 uur leert om tot de top 6% te behoren die écht resultaten boeken.',
        lessons: [
          {
            id: 'welkom-video-impact',
            type: 'video',
            title: 'De Impact van een Goede Bio (3 minuten)',
            description:
              'Zie hoe één zin in een profieltekst leidde tot 47 berichten in één week - met echte voorbeelden en data.',
            bullets: [
              'Waarom eerste indrukken in 3 seconden worden bepaald',
              'De 7 dodelijke zonden van slechte profielen',
              'Hoe top 6% van profielen 10x meer matches krijgen',
            ],
          },
          {
            id: 'wetenschap-aantrekkingskracht',
            type: 'lesson',
            title: 'De Wetenschap Achter Aantrekkingskracht',
            description:
              'Leer de psychologische principes die bepalen of iemand reageert op je profiel.',
            bullets: [
              'Similarity-attraction effect: Waarom mensen op gelijken vallen',
              'Social proof: Waarom verhalen werken beter dan feiten',
              'Emotional contagion: Hoe stemmingen overslaan via tekst',
              'Cognitive ease: Waarom eenvoudige taal meer reacties krijgt',
            ],
          },
          {
            id: 'jouw-doelen-claar',
            type: 'interactive',
            title: 'Jouw Dating Doelen Tool',
            description: 'Stel je persoonlijke doelen voor deze masterclass vast.',
          },
          {
            id: 'profiel-kennis-quiz',
            type: 'interactive',
            title: 'Profieltekst Kennis Quiz',
            description: 'Test je huidige kennis over wat werkt in dating profielen voordat je begint met schrijven.',
          },
          {
            id: 'wat-je-gaat-leren',
            type: 'lesson',
            title: 'Wat Je Gaat Bereiken in 8 Stappen',
            description: 'Van onzekere schrijver naar confident profiel-expert.',
            bullets: [
              'Profieltekst die authentiek voelt én professioneel werkt',
              '5x meer quality berichten van mensen die bij je passen',
              'Duidelijke communicatiestijl die gesprekken verlengt',
              'Data-gedreven optimalisatie voor continue verbetering',
              'Persoonlijk merk dat consistent is over alle platformen',
            ],
          },
        ],
        exercises: [
          // 1. Jouw dating doelen tool
          'Jouw dating doelen tool – Stel je persoonlijke doelen voor deze masterclass vast.',
          'Vraag 1: Wat is je exacte doel (bijvoorbeeld: "een serieuze relatie", "leuke dates", "uitbreiding van mijn sociale cirkel")?',
          'Vraag 2: Hoeveel kwaliteitsmatches wil je per week (kies een realistisch, meetbaar doel)?',
          'Vraag 3: Wat is het tijdspad dat je jezelf geeft om dit te bereiken met deze masterclass (bijvoorbeeld: 30 dagen)?',
          // 3. Oefeningen: frustratie & profiel-angst
          'Oefening: frustratie & profiel-angst – Beschrijf je huidige frustratie met dating apps.',
          'Wat is je grootste profiel-angst?',
          'Welke 3 woorden wil je dat mensen gebruiken om jou te beschrijven?',
          'Wat voor relatie zoek je echt (wees specifiek)?',
        ],
        interactive:
          'Start de Doelen Tool om je persoonlijke roadmap voor deze masterclass te creëren.',
      },
      {
        id: 'module-1-zelfkennis-fundament',
        label: 'MODULE 1',
        emoji: '🔍',
        title: 'Zelfkennis - Het Fundament van Authenticiteit',
        description: 'Voordat je schrijft, leer jezelf kennen. Ontdek je kernwaarden, triggers en wat jou uniek maakt in de dating wereld.',
        lessons: [
          {
            id: 'zelfkennis-belangrijk',
            type: 'video',
            title: 'Waarom Zelfkennis de Basis Is (8 minuten)',
            description:
              'Leer waarom oppervlakkige profielen worden overgeslagen en diepe zelfkennis de sleutel is tot betekenisvolle connecties.',
            bullets: [
              'Waarom mensen voelen wanneer iets niet authentiek is',
              'Hoe zelfkennis leidt tot betere match kwaliteit',
              'De valkuil van "wat anderen willen horen"',
            ],
          },
          {
            id: 'kernwaarden-explorer',
            type: 'interactive',
            title: 'Kernwaarden Explorer Tool',
            description: 'Ontdek je top 5 relatie-waarden door middel van scenario-based vragen.',
          },
          {
            id: 'persoonlijkheid-dimensies',
            type: 'lesson',
            title: 'De 4 Persoonlijkheidsdimensies voor Dating',
            description: 'Structureer je zelfkennis met wetenschappelijk onderbouwde dimensies.',
            bullets: [
              'Emotionele intelligentie: Hoe ga je om met gevoelens?',
              'Sociale energie: Introvert vs. extravert in dating context',
              'Levensstijl alignment: Stad vs. natuur, routine vs. avontuur',
              'Relatie visie: Wat betekent commitment voor jou?',
            ],
          },
          {
            id: 'unieke-verhalen-ontdekken',
            type: 'lesson',
            title: 'Je Unieke Verhalen Ontdekken',
            description: 'Leer welke verhalen uit je leven perfect zijn voor je profiel.',
            bullets: [
              'Transformatie verhalen: Hoe je bent gegroeid',
              'Passie verhalen: Wat je doet wanneer je helemaal jezelf bent',
              'Authenticiteit verhalen: Momenten die je karakter tonen',
              'Humor verhalen: Hoe je de wereld ziet',
            ],
          },
        ],
        exercises: [
          'Beschrijf een recente ervaring die perfect je persoonlijkheid toont',
          'Wat is je favoriete manier om een vrije dag door te brengen?',
          'Welke 3 kernwaarden zijn niet-onderhandelbaar in je relaties?',
          'Wat zou je beste vriend(in) zeggen dat jou uniek maakt?',
          'Beschrijf een "aha-moment" uit je leven dat je veranderde',
          'Wat doe je wanneer niemand kijkt?',
        ],
        interactive:
          'Gebruik de Kernwaarden Explorer om je relatie-DNA te ontdekken. Dit vormt de basis voor al je volgende schrijfoefeningen.',
        downloads: ['Zelfkennis Workbook - 25 reflectievragen'],
      },
      {
        id: 'module-2-doelgroep-psychologie',
        label: 'MODULE 2',
        emoji: '🎯',
        title: 'Doelgroep Psychologie - Voor Wie Schrijf Je?',
        description: 'Leer je ideale match te definiëren en schrijf specifiek voor die persoon in plaats van voor iedereen.',
        lessons: [
          {
            id: 'doelgroep-belang',
            type: 'video',
            title: 'Waarom Universele Teksten Falend (6 minuten)',
            description:
              'Ontdek waarom "voor iedereen" schrijven betekent "voor niemand" schrijven.',
            bullets: [
              'Waarom specifieke taal 3x meer engagement krijgt',
              'De paradox van keuze: Meer opties = minder beslissingen',
              'Hoe psychologische relevantie nieuwsgierigheid triggert',
            ],
          },
          {
            id: 'relatie-landscape-mapping',
            type: 'interactive',
            title: 'Relatie Landscape Mapping Tool',
            description: 'Creëer een gedetailleerd profiel van je ideale partner.',
          },
          {
            id: 'energie-compatibility',
            type: 'lesson',
            title: 'Energie Compatibility Framework',
            description: 'Leer energie-patronen herkennen en matchen.',
            bullets: [
              'High-energy vs. low-energy persoonlijkheden',
              'Sociale behoeften: Hoeveel connectie heb je nodig?',
              'Levensritme: Vroege vogel vs. nachtuil',
              'Communicatiestijl: Direct vs. diplomatiek',
            ],
          },
          {
            id: 'waarden-alignment',
            type: 'lesson',
            title: 'Waarden Alignment Strategie',
            description: 'Leer welke waarden essentieel zijn voor relatie-succes.',
            bullets: [
              'Kernwaarden vs. voorkeuren: Wat is niet-onderhandelbaar?',
              'Culturele compatibiliteit: Gedeelde normen en waarden',
              'Toekomst visie: Waar ga je heen?',
              'Levensdoelen: Individueel vs. gezamenlijk',
            ],
          },
        ],
        exercises: [
          'Beschrijf je ideale eerste date tot in detail',
          'Wat zijn je 3 belangrijkste waarden in een relatie?',
          'Welke energie-level past perfect bij jou?',
          'Wat zou je partner moeten weten over jou voordat jullie elkaar ontmoeten?',
          'Welke 3 eigenschappen maken iemand "dateable" voor jou?',
          'Beschrijf hoe je wilt dat iemand zich voelt bij jou',
        ],
        interactive:
          'Gebruik de Relatie Landscape Tool om je ideale partner profiel te creëren. Dit wordt je kompas voor alle schrijfbeslissingen.',
        downloads: ['Doelgroep Profiel Template', 'Waarden Compatibility Checklist'],
      },
      {
        id: 'module-3-structuur-meesterschap',
        label: 'MODULE 3',
        emoji: '🏗️',
        title: 'Structuur Meesterschap - Het Skelet van Succes',
        description: 'Leer de bewezen 4-delige structuur die 78% meer reacties oplevert, gebaseerd op oogbewegingsonderzoek.',
        lessons: [
          {
            id: 'structuur-wetenschap',
            type: 'video',
            title: 'Waarom Deze Structuur Werkt (10 minuten)',
            description:
              'Leer over oogbewegingsonderzoek en hoe mensen teksten lezen op dating apps.',
            bullets: [
              'F-pattern vs. Z-pattern lezing',
              'Attention spans op mobiele apparaten',
              'Emotional hooks in de eerste 3 woorden',
              'Call-to-action optimalisatie',
            ],
          },
          {
            id: 'hook-mastery',
            type: 'lesson',
            title: 'Hook Mastery - De Eerste 5 Woorden',
            description: 'Leer hooks schrijven die onmiddellijk aandacht trekken.',
            bullets: [
              'Paradox hooks: "Ik ben spontaan georganiseerd"',
              'Question hooks: "Kun jij koken zonder recept?"',
              'Vulnerability hooks: "Ik praat tegen mijn planten"',
              'Contradiction hooks: "Ik ben introvert extravert"',
            ],
          },
          {
            id: 'intrigue-building',
            type: 'lesson',
            title: 'Intrigue Building - Diepte in 15 Woorden',
            description: 'Leer nieuwsgierigheid opbouwen zonder alles weg te geven.',
            bullets: [
              'Show, don\'t tell principe',
              'Specifieke details vs. algemene uitspraken',
              'Psychologische spanning creëren',
              'Preview van je persoonlijkheid',
            ],
          },
          {
            id: 'depth-authenticity',
            type: 'lesson',
            title: 'Depth & Authenticity - Laat Jezelf Zien',
            description: 'Leer authentiek te zijn zonder te veel te delen.',
            bullets: [
              'Vulnerability zonder oversharing',
              'Sterke verhalen in 25 woorden',
              'Emotionele resonantie creëren',
              'Uniekheid tonen',
            ],
          },
          {
            id: 'cta-optimization',
            type: 'lesson',
            title: 'Call-to-Action Optimalisatie',
            description: 'Leer uitnodigende afsluitingen schrijven.',
            bullets: [
              'Directe uitnodigingen vs. subtiele hints',
              'Specifieke acties vragen',
              'Psychologische veiligheid bieden',
              'Momentum behouden',
            ],
          },
        ],
        exercises: [
          'Schrijf 10 verschillende hooks voor je profiel',
          'Test welke hooks het meest nieuwsgierig maken',
          'Bouw de complete 4-delige structuur met je zelfkennis',
          'Schrijf 3 verschillende CTA\'s en kies de beste',
          'Laat vrienden raden welke versie van jou is',
        ],
        downloads: ['Structuur Template - 4-delige bio opbouw', 'Hook Examples Database'],
      },
      {
        id: 'module-4-cliches-eliminatie',
        label: 'MODULE 4',
        emoji: '🚫',
        title: 'Clichés Eliminatie - Van Generiek naar Geniaal',
        description: 'Transformeer oppervlakkige uitspraken naar verhalen die opvallen en verbinden.',
        lessons: [
          {
            id: 'waarom-cliches-schadelijk-zijn',
            type: 'video',
            title: 'Waarom Clichés Je Profiel Doden (7 minuten)',
            description:
              'Leer over cognitieve vermoeidheid en waarom generieke teksten onzichtbaar worden.',
            bullets: [
              'Pattern recognition in de hersenen',
              'Waarom mensen scrollen door bekende zinnen',
              'De kost van oppervlakkigheid',
            ],
          },
          {
            id: 'transformatie-technieken',
            type: 'lesson',
            title: 'Transformatie Technieken - Van Slecht naar Sterk',
            description: 'Concrete methodes om clichés te vermijden.',
            bullets: [
              'Specifisering: "Reizen" → "Spontane treinreizen door Europa"',
              'Emotionalisering: "Humor" → "Ik lach om dingen die niemand grappig vindt"',
              'Vulnerability: "Spontaan" → "Ik zeg ja tegen plannen die me eigenlijk eng vinden"',
              'Uniekmaking: "Creatief" → "Ik teken cartoons over mijn slechte dagen"',
            ],
          },
          {
            id: 'authenticiteit-framework',
            type: 'interactive',
            title: 'Authenticiteit Scanner Tool',
            description: 'Analyseer je tekst op clichés en oppervlakkigheid.',
          },
          {
            id: 'verhaal-crafting',
            type: 'lesson',
            title: 'Verhaal Crafting - Jouw Unieke Narrative',
            description: 'Leer verhalen te construeren die mensen raken.',
            bullets: [
              'Character development: Jouw reis tonen',
              'Conflict resolution: Groei verhalen',
              'Emotional arcs: Van probleem naar oplossing',
              'Authentic voice: Jouw unieke perspectief',
            ],
          },
        ],
        exercises: [
          'Identificeer alle clichés in je huidige profiel',
          'Transformeer 5 generieke zinnen naar verhalen',
          'Schrijf een "transformation story" over jezelf',
          'Test je verhalen op vrienden voor authenticiteit',
          'Creëer 3 verschillende versies van dezelfde eigenschap',
        ],
        interactive:
          'Gebruik de Authenticiteit Scanner om je tekst te analyseren en verbeterpunten te identificeren.',
        downloads: ['Cliché naar Charisma Transformatie Guide', 'Verhaal Crafting Workbook'],
      },
      {
        id: 'module-4-authenticity-quiz',
        label: 'QUIZ',
        emoji: '🎯',
        title: 'Authenticiteit Detector Quiz',
        description: 'Test je vermogen om clichés te herkennen en authentieke verhalen te schrijven.',
        lessons: [
          {
            id: 'authenticity-quiz-lesson',
            type: 'interactive',
            title: 'Authenticiteit Detector Quiz',
            description: 'Een interactieve quiz die je leert clichés herkennen en authentieke verhalen schrijven.',
          },
        ],
        exercises: [
          'Beantwoord alle vragen zorgvuldig en neem de tijd om na te denken.',
          'Herlees je antwoorden na afloop om te zien waar je intuïtie klopte.',
        ],
      },
      {
        id: 'module-5-ai-optimalisatie',
        label: 'MODULE 5',
        emoji: '🤖',
        title: 'AI-Optimalisatie - Professionele Verfijning',
        description: 'Gebruik AI als professionele editor om je tekst naar het volgende niveau te tillen.',
        lessons: [
          {
            id: 'ai-als-professional',
            type: 'video',
            title: 'AI als Je Persoonlijke Profiel Coach (5 minuten)',
            description:
              'Leer AI in te zetten voor objectieve feedback en professionele verbeteringen.',
            bullets: [
              'Waarom AI betere feedback geeft dan vrienden',
              'Hoe AI psychologische principes toepast',
              'Wanneer AI gebruiken in je schrijfproces',
            ],
          },
          {
            id: 'toon-experimentatie',
            type: 'lesson',
            title: 'Toon Experimentatie - Vind Je Stem',
            description: 'Leer verschillende professionele toon-opties.',
            bullets: [
              'Vlot: Energiek, benaderbaar, positief',
              'Grappig: Speels, zelfrelativerend, humoristisch',
              'Charmant: Warm, attent, licht flirterig',
              'Authentiek: Eerlijk, direct, down-to-earth',
              'Mysterieus: Intrigerend, subtiel, nieuwsgierig makend',
            ],
          },
          {
            id: 'ai-bio-generator-pro',
            type: 'interactive',
            title: 'AI Bio Generator Pro Tool',
            description: 'Geavanceerde tool die 5 professionele varianten genereert.',
          },
          {
            id: 'a-b-testing-setup',
            type: 'lesson',
            title: 'A/B Testing voor Profiel Optimalisatie',
            description: 'Leer wetenschappelijk testen welke versie beter werkt.',
            bullets: [
              'Test verschillende hooks',
              'Vergelijk toon-opties',
              'Meet respons rates en kwaliteit',
              'Iteratieve verbetering gebaseerd op data',
            ],
          },
        ],
        exercises: [
          'Voer je concept in de AI Bio Generator Pro',
          'Vergelijk de 5 varianten - welke voelt het meest als jou?',
          'Test verschillende tonen voor verschillende doelgroepen',
          'Stel een A/B test op voor je profiel',
          'Analyseer resultaten na 3 dagen',
        ],
        interactive:
          'Start de AI Bio Generator Pro voor professionele varianten, A/B-test suggesties en optimaliseer voor maximale aantrekkingskracht.',
        downloads: ['AI-Optimalisatie Playbook', 'A/B Testing Template'],
      },
      {
        id: 'module-6-validatie-mastery',
        label: 'MODULE 6',
        emoji: '✅',
        title: 'Validatie Mastery - Test & Optimaliseer',
        description: 'Leer je profieltekst grondig te testen voordat je live gaat, met professionele checklists en validatie tools.',
        lessons: [
          {
            id: 'professionele-checklist',
            type: 'video',
            title: 'De Complete Profiel Audit (12 minuten)',
            description:
              'Leer de 27-punts checklist die professionele profielschrijvers gebruiken.',
            bullets: [
              'Authenticiteit: Klinkt het als jou?',
              'Specificiteit: Gebruik je concrete details?',
              'Intrigue: Wekt het nieuwsgierigheid?',
              'Energie: Is de toon aantrekkelijk?',
              'Uitnodiging: Roept het op tot actie?',
            ],
          },
          {
            id: 'peer-feedback-setup',
            type: 'lesson',
            title: 'Peer Feedback Optimalisatie',
            description: 'Leer feedback effectief in te zetten voor verbetering.',
            bullets: [
              'Juiste vragen stellen aan reviewers',
              'Bias herkennen in feedback',
              'Constructieve kritiek omzetten in actie',
              'Wanneer feedback negeren',
            ],
          },
          {
            id: 'data-driven-optimization',
            type: 'interactive',
            title: 'Profiel Analytics Dashboard',
            description: 'Track je profiel prestaties met data.',
          },
          {
            id: 'platform-specific-tuning',
            type: 'lesson',
            title: 'Platform-Specific Tuning',
            description: 'Optimaliseer voor Tinder, Bumble, Hinge, etc.',
            bullets: [
              'Tinder: Visuele, korte, energieke',
              'Bumble: Authentiek, verhaal-gedreven',
              'Hinge: Specifiek, prompts-gebaseerd',
              'Lexa: Professioneel, doelgericht',
            ],
          },
        ],
        exercises: [
          'Loop de complete 27-punts checklist door',
          'Laat 5 mensen je profiel reviewen met specifieke vragen',
          'Stel je Profiel Analytics Dashboard op',
          'Maak platform-specifieke versies',
          'Test respons rates na optimalisatie',
        ],
        interactive:
          'Gebruik het Profiel Analytics Dashboard om je prestaties te meten en verbeterpunten te identificeren.',
        downloads: ['Professionele Validatie Checklist (27 punten)', 'Peer Feedback Guide'],
      },
      {
        id: 'module-7-lancering-mastery',
        label: 'MODULE 7',
        emoji: '🚀',
        title: 'Lancering Mastery - Live Gaan & Momentum',
        description: 'Leer strategisch te lanceren, momentum op te bouwen en continue verbetering te garanderen.',
        lessons: [
          {
            id: 'strategische-lancering',
            type: 'video',
            title: 'Strategische Lancering voor Maximaal Impact (9 minuten)',
            description:
              'Leer wanneer, hoe en waarom je je profiel lanceert voor optimale resultaten.',
            bullets: [
              'Beste dagen en tijden voor lancering',
              'Momentum building technieken',
              'Eerste 24 uur optimalisatie',
              'Long-term strategie voor groei',
            ],
          },
          {
            id: 'momentum-building',
            type: 'lesson',
            title: 'Momentum Building Systeem',
            description: 'Leer hoe je positieve energie en resultaten opbouwt.',
            bullets: [
              'Micro-wins vieren',
              'Momentum loops creëren',
              'Psychologische momentum technieken',
              'Recovery van slow periods',
            ],
          },
          {
            id: 'continue-optimalisatie',
            type: 'interactive',
            title: 'Continue Optimalisatie Dashboard',
            description: 'Blijf je profiel verbeteren met data en feedback.',
          },
          {
            id: 'expert-mindset',
            type: 'lesson',
            title: 'Expert Mindset Ontwikkelen',
            description: 'Word de persoon die altijd betere resultaten behaalt.',
            bullets: [
              'Growth mindset voor dating',
              'Data-driven besluitvorming',
              'Patience en persistence',
              'Expert-level zelfreflectie',
            ],
          },
        ],
        exercises: [
          'Plan je strategische lancering',
          'Stel momentum building rituals op',
          'Configureer je Continue Optimalisatie Dashboard',
          'Schrijf je expert mindset affirmations',
          'Maak een 30-dagen verbeterplan',
        ],
        interactive:
          'Activeer het Continue Optimalisatie Dashboard voor ongoing profiel verbetering.',
        downloads: ['Lancering Playbook', '30-Dagen Optimalisatie Plan'],
      },
      {
        id: 'module-8-mastery-certificering',
        label: 'MODULE 8',
        emoji: '🏆',
        title: 'Mastery & Certificering - Jouw Transformatie Compleet',
        description: 'Vier je succes, ontvang je certificaat en word lid van de Profiel Expert Community.',
        lessons: [
          {
            id: 'reflectie-transformatie',
            type: 'video',
            title: 'Jouw Transformatie Review (8 minuten)',
            description:
              'Bekijk hoe ver je bent gekomen en wat je hebt geleerd.',
            bullets: [
              'Voor en na vergelijking',
              'Geleerde vaardigheden overzicht',
              'Toekomstige toepassingen',
              'Mentale transformatie',
            ],
          },
          {
            id: 'expert-certificaat',
            type: 'download',
            title: 'Profieltekst Expert Certificaat',
            description: 'Download je professionele certificaat.',
          },
          {
            id: 'community-access',
            type: 'lesson',
            title: 'Profiel Expert Community',
            description: 'Word lid van de exclusieve community van profiel experts.',
            bullets: [
              'Wekelijkse expert calls',
              'Peer feedback groepen',
              'Nieuwe technieken en trends',
              'Lifetime support',
            ],
          },
          {
            id: 'leven-lang-leren',
            type: 'lesson',
            title: 'Leven Lang Leren in Dating',
            description: 'Profiel optimalisatie is een journey, geen destination.',
            bullets: [
              'Nieuwe technieken blijven leren',
              'Platform veranderingen bijhouden',
              'Persoonlijke groei integreren',
              'Community blijven voeden',
            ],
          },
        ],
        exercises: [
          'Schrijf je persoonlijke transformatie verhaal',
          'Deel je succes in de community',
          'Mentor een beginner met je nieuwe kennis',
          'Stel je volgende leerdoelen vast',
        ],
        downloads: ['Profieltekst Expert Certificate', 'Community Access Guide'],
      },
      {
        id: 'bonus-expert-materials',
        label: 'BONUS',
        emoji: '🎁',
        title: 'Expert Bonus Materials - Diepgaande Mastery',
        description: 'Exclusieve content voor mensen die écht de diepte in willen gaan.',
        lessons: [
          {
            id: 'bonus-psychologie-deep-dive',
            type: 'video',
            title: 'Diepe Psychologie van Aantrekkingskracht',
            description: 'Wetenschappelijke inzichten voor gevorderden.',
          },
          {
            id: 'bonus-copywriting-masterclass',
            type: 'video',
            title: 'Copywriting voor Dating Profielen',
            description: 'Professionele schrijftechnieken toegepast op dating.',
          },
          {
            id: 'bonus-platform-secrets',
            type: 'download',
            title: 'Platform Secrets & Hacks',
            description: 'Insider informatie over alle grote dating platforms.',
          },
          {
            id: 'bonus-ai-advanced',
            type: 'interactive',
            title: 'AI Advanced Tools Suite',
            description: 'Geavanceerde AI-tools voor profiel experts.',
          },
        ],
        downloads: ['Complete Expert Toolkit', 'Advanced Psychology Guide', 'Platform Secrets Manual'],
      },
    ],
  },
  {
    id: 'match-naar-date-3-berichten',
    title: 'Van match naar date in 3 berichten',
    provider: 'DatingAssistent',
    duration: '3 interactieve lessen',
    level: 'Sociaal & Core',
    format: 'Online module met opdrachten',
    language: 'Nederlands',
    accessTier: 'sociaal',
    summary:
      'Leer hoe je met drie strategische berichten een match laat uitgroeien tot een echte date — inclusief voorbeelden, opdrachten en tools binnen het platform.',
    sections: [
      {
        id: 'lesson-1',
        label: 'LES 1',
        emoji: '💬',
        title: 'Het Perfecte Openingsbericht',
        description:
          'Ontdek waarom het eerste bericht je digitale handdruk is en hoe je het persoonlijk, nieuwsgierig en positief houdt.',
        lessons: [
          {
            id: 'lesson-1-1',
            type: 'lesson',
            title: 'Waarom “Hoi” niet werkt',
            description:
              'Leer waarom standaardgroeten verdwijnen in de massa en wat een onderscheidend openingsbericht wél doet.',
          },
          {
            id: 'lesson-1-2',
            type: 'lesson',
            title: 'Persoonlijk, nieuwsgierig en energiek',
            description:
              'Gebruik signalen uit bio’s of foto’s en stel open vragen die een verhaal uitlokken.',
          },
          {
            id: 'lesson-1-3',
            type: 'tip',
            title: 'Voorbeeld en analyse',
            description:
              '“Hey [Naam]! Ik zag dat je van koken houdt – wat is jouw geheime ingrediënt voor een perfecte pasta?” Ontleed waarom dit werkt.',
          },
        ],
        exercises: [
          'Start de AI IJsbreker Generator en vul een hobby of interesse van je match in.',
          'Kies één openingszin en noteer waarom deze past bij de match en bij jouw stijl.',
        ],
        interactive:
          'Invulveld “Mijn gekozen openingszin en motivatie”. Gebruik de knop “AI IJsbreker Generator starten” om direct een voorstel te laten genereren.',
      },
      {
        id: 'lesson-2',
        label: 'LES 2',
        emoji: '🤝',
        title: 'Interesse Tonen & Vragen Stellen',
        description:
          'Leer hoe je een beginnend gesprek warm houdt met open vragen, actief luisteren en reciproce storytelling.',
        lessons: [
          {
            id: 'lesson-2-1',
            type: 'lesson',
            title: 'Open vragen in de praktijk',
            description:
              'Voorkom ja/nee-antwoorden en lok verhalen uit door vragen te stellen die uitnodigen tot delen.',
          },
          {
            id: 'lesson-2-2',
            type: 'lesson',
            title: 'Actief luisteren en spiegelen',
            description:
              'Reageer op wat je match vertelt, vat het samen en stel vervolgvraag die laat zien dat je oplet.',
          },
          {
            id: 'lesson-2-3',
            type: 'lesson',
            title: 'Verhalen delen voor balans',
            description:
              'Deel korte anekdotes van jezelf om het gesprek levendig en gelijkwaardig te houden.',
          },
          {
            id: 'lesson-2-example',
            type: 'tip',
            title: 'Voorbeeld dialoog',
            description:
              'Match: “Ik ben gek op hardlopen in het park.” Jij: “Leuk! Hardlopen is ook mijn ding. Welke route in het park is jouw favoriet?”',
          },
        ],
        exercises: [
          'Noteer drie open vragen die je uit je match willen halen wat hem/haar enthousiast maakt.',
          'Schrijf korte verhalen van jezelf die aansluiten op de antwoorden van je match.',
        ],
        interactive:
          'Invulveld “Mijn 3 persoonlijke vragen + korte verhalen” met een gedeelde feedbackknop “Deel in community voor tips”.',
      },
      {
        id: 'lesson-3',
        label: 'LES 3',
        emoji: '📅',
        title: 'Het Voorstel Doen',
        description:
          'Na een paar goede berichten is het tijd om relaxed en concreet af te spreken — zonder druk, mét enthousiasme.',
        lessons: [
          {
            id: 'lesson-3-1',
            type: 'lesson',
            title: 'Van gesprek naar afspraak',
            description:
              'Leer het juiste moment herkennen om over te stappen naar een datevoorstel (na 1–2 sterke uitwisselingen).',
          },
          {
            id: 'lesson-3-2',
            type: 'lesson',
            title: 'Concreet, luchtig en uitnodigend',
            description:
              'Benoem dag, activiteit en locatie, en laat ruimte voor een eigen suggestie van je match.',
          },
          {
            id: 'lesson-3-3',
            type: 'tip',
            title: 'Voorbeeldbericht ontleed',
            description:
              '“Het lijkt me leuk om ons gesprek voort te zetten bij een koffie in [leuk tentje]. Heb je vrijdagmiddag tijd, of past zaterdag beter?”',
          },
        ],
        exercises: [
          'Stel op basis van jullie gedeelde interesse een concreet voorstel op (activiteit, dag en tijd).',
          'Gebruik de AI IJsbreker Generator nogmaals voor variaties en sla je favoriet op.',
        ],
        interactive:
          'Invulveld “Mijn concrete voorstel” plus knop “AI IJsbreker Generator opnieuw gebruiken” voor directe assistentie.',
        downloads: ['Checklist – Van Match naar Date in 3 Berichten'],
      },
    ],
  },
  {
    id: 'boost-je-dating-zelfvertrouwen',
    title: 'Pro: Zelfvertrouwen Mastery - Van Angst naar Autoriteit',
    provider: 'DatingAssistent',
    duration: '8 modules (40+ professionele oefeningen)',
    level: 'Professioneel - Executive Level',
    format: 'AI-gedreven coaching programma met diepgaande psychologie en gedragsverandering',
    language: 'Nederlands',
    accessTier: 'pro',
    summary:
      'Transformeer jezelf van onzekere dater naar zelfverzekerde autoriteit. Een wetenschappelijk onderbouwd programma met AI-coaching, professionele mindset technieken en executive-level strategieën voor dating succes.',
    sections: [
      {
        id: 'executive-assessment',
        label: 'EXECUTIVE ASSESSMENT',
        emoji: '🎯',
        title: 'Executive Confidence Audit - Waar Sta Je Nu?',
        description:
          'Voer een diepgaande analyse uit van je huidige zelfvertrouwen niveau, identificatie patronen en executive presence in dating context.',
        lessons: [
          {
            id: 'executive-assessment-slides',
            type: 'lesson',
            title: 'Executive Assessment Slides - De Wetenschappelijke Basis',
            description:
              'Start met uitgebreide slides over executive confidence assessment, limiting beliefs en ontwikkelroadmap.',
          },
          {
            id: 'executive-self-assessment',
            type: 'interactive',
            title: 'Executive Self-Assessment Framework',
            description:
              'Een wetenschappelijk onderbouwde zelfanalyse die je huidige zelfvertrouwen niveau meet op 12 dimensies van executive presence.',
            bullets: [
              'Cognitive Confidence: Hoe zeker ben je van je intellectuele capaciteiten?',
              'Emotional Resilience: Hoe goed ga je om met afwijzing en kritiek?',
              'Social Authority: Hoe comfortabel ben je met leiderschap in sociale situaties?',
              'Physical Presence: Hoe straal je autoriteit uit door lichaamstaal?',
              'Communication Mastery: Hoe effectief communiceer je behoeften en grenzen?',
              'Relationship Intelligence: Hoe goed begrijp je relationele dynamieken?',
            ],
          },
          {
            id: 'limiting-beliefs-audit',
            type: 'lesson',
            title: 'Limiting Beliefs Inventory - De Verborgen Saboteurs',
            description:
              'Identificeer de diepgewortelde overtuigingen die je zelfvertrouwen ondermijnen en creëer een strategie om ze te transformeren.',
            bullets: [
              'Core Identity Beliefs: "Ik ben niet goed genoeg"',
              'Performance Beliefs: "Ik faal altijd in belangrijke momenten"',
              'Social Beliefs: "Mensen vinden me niet interessant"',
              'Success Beliefs: "Ik verdien geen liefde"',
            ],
          },
          {
            id: 'executive-presence-baseline',
            type: 'lesson',
            title: 'Executive Presence Baseline Measurement',
            description:
              'Meet je huidige executive presence op een schaal van 1-10 en identificeer specifieke verbetergebieden.',
          },
        ],
        exercises: [
          'Voer de Executive Self-Assessment uit en noteer je scores op alle 12 dimensies.',
          'Identificeer je top 3 limiting beliefs en schrijf een counter-statement voor elk.',
          'Beschrijf een situatie waarin je executive presence sterk was en een waarin het zwak was.',
          'Creëer een persoonlijke ontwikkel roadmap voor de komende 8 weken.',
        ],
        interactive:
          'Gebruik de AI Confidence Coach om je assessment resultaten te analyseren en een persoonlijk ontwikkelplan te ontvangen.',
      },
      {
        id: 'cognitive-restructuring',
        label: 'MODULE 3',
        emoji: '🧠',
        title: 'Cognitive Restructuring - Herschrijf Je Innerlijke Dialoog',
        description:
          'Transformeer negatieve gedachtepatronen naar empowering overtuigingen met geavanceerde cognitieve gedragstechnieken.',
        lessons: [
          {
            id: 'cognitive-restructuring-slides',
            type: 'lesson',
            title: 'Cognitive Restructuring Slides - Gedachten Herschrijven',
            description:
              'Professionele slides over cognitive gedragstherapie principes toegepast op dating zelfvertrouwen.',
          },
          {
            id: 'cognitive-distortions',
            type: 'lesson',
            title: 'Cognitive Distortions in Dating Context',
            description:
              'Leer de 15 meest voorkomende denkfouten te herkennen die je zelfvertrouwen saboteren in dating situaties.',
            bullets: [
              'All-or-Nothing Thinking: "Als deze date niet perfect gaat, ben ik een mislukkeling"',
              'Catastrophizing: "Als ze me afwijst, betekent dat niemand me ooit wil"',
              'Mind Reading: "Ze vindt me vast saai"',
              'Emotional Reasoning: "Ik voel me onzeker, dus moet ik wel onaantrekkelijk zijn"',
              'Should Statements: "Ik zou perfect moeten zijn"',
            ],
          },
          {
            id: 'executive-belief-system',
            type: 'interactive',
            title: 'Executive Belief System Architecture',
            description:
              'Bouw een nieuw fundament van overtuigingen gebaseerd op evidence-based psychologie en executive mindset principes.',
          },
          {
            id: 'neural-rewiring',
            type: 'lesson',
            title: 'Neural Rewiring Techniques - Hersenen Herschrijven',
            description:
              'Gebruik neuroplasticiteit principes om nieuwe, empowering gedachtepatronen te installeren.',
            bullets: [
              'Repetition Training: 21 dagen consistente affirmaties',
              'Pattern Interruption: Bewuste onderbreking van negatieve spirals',
              'Evidence-Based Beliefs: Onderbouwde overtuigingen vs. emotionele assumpties',
              'Context Reframing: Situaties anders interpreteren',
            ],
          },
        ],
        exercises: [
          'Identificeer 5 cognitive distortions die je deze week hebt ervaren en herschrijf ze naar rationele alternatieven.',
          'Creëer 10 evidence-based affirmaties gebaseerd op je echte kwaliteiten en prestaties.',
          'Ontwikkel een "Neural Rewiring Protocol" voor dagelijks gebruik (15 minuten per dag).',
          'Houd een Cognitive Journal bij voor 7 dagen en analyseer patronen.',
        ],
        interactive:
          'Gebruik de AI Confidence Coach voor real-time gedachte patroon analyse en executive-level reframing technieken.',
      },
      {
        id: 'executive-presence-mastery',
        label: 'MODULE 4',
        emoji: '👑',
        title: 'Executive Presence Mastery - Stral Autoriteit Uit',
        description:
          'Ontwikkel een onwankelbare executive presence die mensen onmiddellijk herkennen als leider in sociale situaties.',
        lessons: [
          {
            id: 'executive-presence-slides',
            type: 'lesson',
            title: 'Executive Presence Slides - Autoriteit Stralen',
            description:
              'Professionele slides over executive presence, lichaamstaal van leiders en autoriteit in sociale situaties.',
          },
          {
            id: 'executive-body-language',
            type: 'lesson',
            title: 'Executive Body Language - De Taal van Autoriteit',
            description:
              'Leer de lichaamstaal van CEO\'s en wereldleiders die vertrouwen en respect afdwingen zonder woorden.',
            bullets: [
              'Power Postures: De "CEO Stance" voor instant autoriteit',
              'Executive Eye Contact: Dominant maar niet intimiderend',
              'Commanding Voice: Diep, kalm en zelfverzekerd spreken',
              'Spatial Awareness: Hoe je ruimte inneemt als leider',
            ],
          },
          {
            id: 'social-authority-framework',
            type: 'interactive',
            title: 'Social Authority Framework - Leid in Sociale Situaties',
            description:
              'Bouw een framework voor het nemen van natuurlijke leiderschap in gesprekken en groepssituaties.',
          },
          {
            id: 'executive-communication-mastery',
            type: 'lesson',
            title: 'Executive Communication Mastery - Woorden met Gewicht',
            description:
              'Leer communiceren met de precisie en impact van een executive die gewend is gehoord te worden.',
            bullets: [
              'Concise Expression: Zeg meer met minder woorden',
              'Strategic Pausing: Gebruik stilte als krachttool',
              'Executive Questions: Vragen die diepgang en betrokkenheid creëren',
              'Boundary Setting: Grenzen stellen met autoriteit en respect',
            ],
          },
        ],
        exercises: [
          'Film jezelf in een "executive presentation" van 2 minuten en analyseer je lichaamstaal.',
          'Oefen de CEO Stance voor 10 minuten per dag en noteer gedragsveranderingen.',
          'Stel executive-level vragen in je volgende 5 gesprekken en observeer de respons.',
          'Creëer een "Executive Presence Ritual" voor belangrijke sociale momenten.',
        ],
        interactive:
          'Gebruik de AI Confidence Coach voor executive presence feedback en oefeningen.',
      },
      {
        id: 'advanced-resilience-training',
        label: 'MODULE 5',
        emoji: '🛡️',
        title: 'Advanced Resilience Training - Onverwoestbare Mentale Veerkracht',
        description:
          'Bouw een onverwoestbare mentale veerkracht die je beschermt tegen afwijzing en tegenslagen in dating.',
        lessons: [
          {
            id: 'resilience-slides',
            type: 'lesson',
            title: 'Resilience Slides - Onverwoestbare Mentale Veerkracht',
            description:
              'Professionele slides over resilience psychologie, post-traumatische groei en mentale veerkracht in dating context.',
          },
          {
            id: 'resilience-psychology',
            type: 'lesson',
            title: 'Resilience Psychology - Wetenschappelijke Fundamenten',
            description:
              'Leer de psychologie achter mentale veerkracht en hoe topperformers met tegenslagen omgaan.',
            bullets: [
              'Post-Traumatic Growth: Groeien door tegenslagen',
              'Cognitive Flexibility: Aanpassen aan veranderende omstandigheden',
              'Emotional Regulation: Controle over emotionele responsen',
              'Self-Compassion: Vriendelijkheid naar jezelf in moeilijke tijden',
            ],
          },
          {
            id: 'executive-rejection-handling',
            type: 'interactive',
            title: 'Executive Rejection Handling Framework',
            description:
              'Ontwikkel een professionele aanpak voor het omgaan met afwijzing die je kracht versterkt in plaats van verzwakt.',
          },
          {
            id: 'failure-to-feedback-loop',
            type: 'lesson',
            title: 'Failure to Feedback Loop - Van Mislukking naar Meesterschap',
            description:
              'Transformeer elke "mislukking" in waardevolle data voor verbetering en groei.',
            bullets: [
              'Data-Driven Analysis: Objectieve evaluatie van ervaringen',
              'Pattern Recognition: Herkennen van verbetergebieden',
              'Iterative Improvement: Continue optimalisatie van aanpak',
              'Success Metrics: Concrete meetbare doelen stellen',
            ],
          },
        ],
        exercises: [
          'Analyseer je laatste 5 "mislukte" ervaringen en identificeer 3 leerpunten per ervaring.',
          'Creëer een "Rejection Response Protocol" voor verschillende scenario\'s.',
          'Stel een "Growth Through Adversity" journal op voor dagelijks reflectie.',
          'Ontwikkel 5 resilience-building rituals voor verschillende uitdagingen.',
        ],
        interactive:
          'Gebruik de AI Confidence Coach voor resilience strategieën en afwijzing verwerking.',
      },
      {
        id: 'strategic-relationship-building',
        label: 'MODULE 6',
        emoji: '🎯',
        title: 'Strategic Relationship Building - Langetermijn Succes',
        description:
          'Leer relaties opbouwen met strategische visie, gebaseerd op executive relatiebouw principes.',
        lessons: [
          {
            id: 'relationship-slides',
            type: 'lesson',
            title: 'Relationship Slides - Strategische Relatiebouw',
            description:
              'Professionele slides over relatie architectuur, executive dating strategieën en langetermijn relatieplanning.',
          },
          {
            id: 'relationship-architecture',
            type: 'lesson',
            title: 'Relationship Architecture - Het Ontwerp van Verbinding',
            description:
              'Leer relaties te ontwerpen met duidelijke structuur, doelen en groeipaden.',
            bullets: [
              'Foundation Building: Sterke basis leggen in vroege stadia',
              'Value Alignment: Delen van kernwaarden en levensvisie',
              'Growth Partnership: Samen groeien en ontwikkelen',
              'Long-term Vision: Duidelijke toekomstplanning',
            ],
          },
          {
            id: 'executive-dating-strategy',
            type: 'interactive',
            title: 'Executive Dating Strategy Framework',
            description:
              'Ontwikkel een professionele dating strategie die efficiency combineert met betekenisvolle connecties.',
          },
          {
            id: 'authentic-leadership-in-love',
            type: 'lesson',
            title: 'Authentic Leadership in Love - Leiderschap in Relaties',
            description:
              'Leer authentiek leiderschap tonen in romantische relaties zonder dominantie.',
            bullets: [
              'Servant Leadership: Anderen eerst zetten met liefde',
              'Emotional Intelligence: Diep begrijpen van partner behoeften',
              'Conflict Resolution: Professionele conflictoplossing',
              'Growth Facilitation: Partner helpen groeien en ontwikkelen',
            ],
          },
        ],
        exercises: [
          'Ontwerp een "Relationship Blueprint" voor je ideale langetermijn relatie.',
          'Creëer een "Dating Strategy Roadmap" voor de komende 6 maanden.',
          'Oefen authentic leadership in je huidige relaties en noteer resultaten.',
          'Stel concrete relatie milestones vast voor verschillende fases.',
        ],
        interactive:
          'Gebruik de AI Confidence Coach voor relatie strategie advies en langetermijn planning.',
      },
      {
        id: 'mastery-integration',
        label: 'MODULE 7',
        emoji: '🏆',
        title: 'Mastery Integration - Van Kennis naar Uitmuntendheid',
        description:
          'Integreer alle geleerde technieken tot een coherente, automatische aanpak voor dating succes.',
        lessons: [
          {
            id: 'mastery-slides',
            type: 'lesson',
            title: 'Mastery Integration Slides - Van Kennis naar Uitmuntendheid',
            description:
              'Professionele slides over skill synthesis, executive performance coaching en mastery assessment frameworks.',
          },
          {
            id: 'skill-synthesis',
            type: 'lesson',
            title: 'Skill Synthesis - Alle Technieken Samenbrengen',
            description:
              'Leer hoe je alle technieken combineert tot een natuurlijke, vloeiende aanpak.',
            bullets: [
              'Cognitive Restructuring + Executive Presence',
              'Resilience Training + Strategic Relationship Building',
              'Integrated Response Patterns: Automatische juiste reacties',
              'Flow State Achievement: Natuurlijke excellentie bereiken',
            ],
          },
          {
            id: 'executive-performance-coaching',
            type: 'interactive',
            title: 'Executive Performance Coaching Session',
            description:
              'Een diepgaande coaching sessie om je geïntegreerde aanpak te perfectioneren.',
          },
          {
            id: 'mastery-assessment',
            type: 'lesson',
            title: 'Mastery Assessment - Waar Sta Je Nu?',
            description:
              'Een uitgebreide evaluatie van je voortgang en resterende ontwikkelgebieden.',
            bullets: [
              'Comprehensive Skills Audit: Alle geleerde competenties',
              'Integration Level Assessment: Hoe goed combineer je technieken',
              'Performance Metrics: Concrete resultaten meting',
              'Future Growth Planning: Volgende ontwikkelstappen',
            ],
          },
        ],
        exercises: [
          'Voer een complete "Skills Integration Audit" uit en identificeer sterke en zwakke punten.',
          'Creëer een "Mastery Action Plan" voor de komende 30 dagen.',
          'Oefen geïntegreerde technieken in 3 verschillende sociale situaties.',
          'Stel concrete mastery milestones vast en meet je voortgang.',
        ],
        interactive:
          'Gebruik de AI Confidence Coach voor geïntegreerde techniek oefeningen en mastery coaching.',
      },
      {
        id: 'executive-mastery-certification',
        label: 'MODULE 8',
        emoji: '🎓',
        title: 'Executive Mastery Certification - De Transformatie Compleet',
        description:
          'Vier je transformatie, ontvang je executive mastery certificaat en word lid van de elite gemeenschap.',
        lessons: [
          {
            id: 'certification-slides',
            type: 'lesson',
            title: 'Executive Mastery Certification Slides - De Transformatie Compleet',
            description:
              'Professionele slides over executive transformation review, certificering en legacy building voor confidence masters.',
          },
          {
            id: 'transformation-review',
            type: 'lesson',
            title: 'Executive Transformation Review - Jouw Reis',
            description:
              'Een diepgaande reflectie op je transformatie van onzekere dater naar zelfverzekerde executive.',
            bullets: [
              'Before & After Analysis: Concrete verandering meting',
              'Skill Mastery Demonstration: Toon je nieuwe competenties',
              'Impact Assessment: Hoe je leven is veranderd',
              'Future Vision: Waar je heen gaat als executive',
            ],
          },
          {
            id: 'executive-certification',
            type: 'download',
            title: 'Executive Confidence Mastery Certificate',
            description: 'Ontvang je professionele certificaat als executive confidence master.',
          },
          {
            id: 'elite-community-access',
            type: 'lesson',
            title: 'Elite Executive Community - Levenslang Ondersteuning',
            description: 'Word lid van de exclusieve gemeenschap van executive confidence masters.',
            bullets: [
              'Monthly Mastermind Sessions: Strategische discussies met gelijkgestemden',
              'Executive Coaching Access: Continue professionele begeleiding',
              'Advanced Content Library: Diepgaande mastery materialen',
              'Peer Accountability Groups: Wekelijkse voortgang sessies',
              'Lifetime Support: Altijd toegang tot je executive coach',
            ],
          },
          {
            id: 'legacy-building',
            type: 'lesson',
            title: 'Legacy Building - Jouw Impact op Anderen',
            description: 'Leer anderen te helpen met je nieuwe executive confidence mastery.',
            bullets: [
              'Mentorship Programs: Leid anderen op tot confidence masters',
              'Knowledge Sharing: Deel je inzichten in de community',
              'Executive Presence Workshops: Leid workshops voor anderen',
              'Philanthropic Impact: Gebruik je skills voor groter goed',
            ],
          },
        ],
        exercises: [
          'Schrijf je "Executive Transformation Story" en deel deze in de community.',
          'Mentor een beginner met je nieuwe executive confidence technieken.',
          'Stel een "Legacy Impact Plan" op voor de komende 5 jaar.',
          'Creëer een persoonlijk "Executive Confidence Manifesto".',
        ],
        downloads: ['Executive Confidence Mastery Certificate', 'Elite Community Access Guide'],
        interactive:
          'Deel je transformatie verhaal in de executive community en ontvang feedback van masters.',
      },
    ],
  },
  {
    id: 'herken-de-5-red-flags',
    title: 'Herken de 5 grootste red flags',
    provider: 'DatingAssistent',
    duration: 'Video + 6 lessen',
    level: 'Beginner',
    format: 'Video en interactieve opdrachten',
    language: 'Nederlands',
    accessTier: 'free',
    summary:
      'Krijg helder zicht op de vijf meest voorkomende red flags, bewaak je grenzen met vertrouwen en creëer een veilig datingritme zonder paranoia.',
    sections: [
      {
        id: 'intro-veilig-online-daten',
        label: 'INTRO',
        emoji: '🎬',
        title: 'Veilig Online Daten – Introductievideo',
        description:
          'Start met de video en leer waarom online veiligheid essentieel is, hoe je verdacht gedrag herkent en welke afspraken je direct kunt maken voor veilige ontmoetingen.',
        lessons: [
          {
            id: 'intro-video',
            type: 'video',
            title: 'Video: Veilig Online Daten',
            description:
              'Krijg praktische tips over grenzen aangeven, wat je doet als iemand over je grens gaat en hoe je voorbereid naar een eerste afspraak gaat.',
            bullets: [
              'Waarom online veiligheid vandaag belangrijker is dan ooit',
              'Signalen die direct vragen om alert te zijn',
              'To do’s voor eerste dates: locatie, communicatie en privacy',
            ],
          },
        ],
        exercises: ['Welke tip uit de video ga jij direct toepassen tijdens je volgende gesprek of date?'],
        interactive:
          'Schrijf na de video je grootste inzicht op en bepaal welke stap jij neemt voordat je iemand offline ontmoet.',
      },
      {
        id: 'red-flag-1',
        label: 'RED FLAG 1',
        emoji: '🚩',
        title: 'Te snel, te intens',
        description:
          'Leer love bombing herkennen en blijf trouw aan jouw tempo voordat iemand exclusiviteit afdwingt.',
        lessons: [
          {
            id: 'red-flag-1-lesson',
            type: 'lesson',
            title: 'Herken love bombing signalen',
            description:
              'Als iemand in een paar dagen grootse woorden gebruikt en volledige aandacht opeist kan dat onveilig zijn.',
            bullets: [
              'Overdadige complimenten en liefdesverklaringen zonder gezamenlijke basis',
              'Berichtenregen of direct plannen voor een relatie of samenwonen',
              'Druk om snel af te spreken of de app te verlaten',
            ],
          },
        ],
        exercises: [
          'Schrijf een moment op waarop iemand te snel ging. Hoe voelde dat en wat had je toen kunnen zeggen of doen?',
        ],
        interactive: 'Wat betekent een gezond tempo voor jou in een beginnende relatie?',
      },
      {
        id: 'safety-boundary-reflection',
        label: 'REFLECTIE',
        emoji: '🛡️',
        title: 'Veiligheid & Grenzen Reflectie',
        description: 'Ontdek je persoonlijke veiligheidsstrategieën en grensbewaking in dating.',
        lessons: [
          {
            id: 'safety-boundary-lesson',
            type: 'interactive',
            title: 'Grenzen & Veiligheid Reflectie',
            description: 'Een diepgaande reflectie over je relatie met rode vlaggen, persoonlijke grenzen en veiligheidsstrategieën.',
          },
        ],
        exercises: [
          'Beantwoord alle vragen met volledige eerlijkheid.',
          'Neem de tijd voor elk antwoord en schrijf gedetailleerd.',
          'Herlees je antwoorden na een week om te zien wat er veranderd is.',
        ],
      },
      {
        id: 'red-flag-2',
        label: 'RED FLAG 2',
        emoji: '🚩',
        title: 'Gebrekkige transparantie',
        description:
          'Screen vage antwoorden en ontdek hoe je vriendelijk, maar duidelijk om eerlijkheid vraagt.',
        lessons: [
          {
            id: 'red-flag-2-lesson',
            type: 'lesson',
            title: 'Signalen van beperkte openheid',
            description:
              'Wanneer iemand gesprekken oppervlakkig houdt of weigert om persoonlijke details te delen, kan dat een waarschuwing zijn.',
            bullets: [
              'Vermijden van videobellen of fysieke ontmoetingen',
              'Altijd druk en vaag over agenda of woonplaats',
              'Voorzichtig bij opmerkingen als “zoek me niet online op”',
            ],
          },
          {
            id: 'red-flag-2-tip',
            type: 'tip',
            title: 'Voorbeeldvragen die transparantie testen',
            description:
              'Gebruik open vragen zoals “Wat vind je het leukst aan je werk?” in plaats van dichte vragen als “Waar werk je?”.',
          },
        ],
        exercises: ['Noteer drie open vragen die je kunt stellen om eerlijkheid en consistentie te testen.'],
        interactive: 'Hoe reageer je als antwoorden ontwijkend blijven en wanneer trek jij een grens?',
      },
      {
        id: 'red-flag-3',
        label: 'RED FLAG 3',
        emoji: '🚩',
        title: 'Schuldgevoel of druk',
        description:
          'Bescherm jezelf tegen subtiele chantage of emotionele druk die jouw grenzen ondermijnt.',
        lessons: [
          {
            id: 'red-flag-3-lesson',
            type: 'lesson',
            title: 'Manipulatieve patronen herkennen',
            description:
              'Let op zinnen als “als je echt interesse had…” of plotselinge stiltes wanneer jij niet direct reageert.',
            bullets: [
              'Je voelt je schuldig wanneer je tijd voor jezelf neemt',
              'De ander koppelt aandacht aan voorwaardes of dreigementen',
              'Het gesprek voelt als een test die je steeds moet halen',
            ],
          },
          {
            id: 'red-flag-3-affirmatie',
            type: 'tip',
            title: 'Affirmatie voor gezonde grenzen',
            description: '“Ik ben niet verantwoordelijk voor andermans emoties.”',
          },
        ],
        exercises: ['Noteer een communicatiegrens die je wilt bewaken (bijv. “Ik reageer wanneer het voor mij goed voelt”).'],
        interactive: 'Welke reactie helpt jou om kalm te blijven wanneer iemand druk uitoefent?',
      },
      {
        id: 'red-flag-4',
        label: 'RED FLAG 4',
        emoji: '🚩',
        title: 'Inconsistent gedrag',
        description:
          'Voorkom verwarring door te letten op daden in plaats van alleen woorden.',
        lessons: [
          {
            id: 'red-flag-4-lesson',
            type: 'lesson',
            title: 'Hot-cold gedrag ontmaskeren',
            description:
              'Wisselvallige aandacht en onvoorspelbare reacties kunnen wijzen op emotionele onbeschikbaarheid of manipulatie.',
            bullets: [
              'Super enthousiast de ene dag, afstandelijk de volgende',
              'Geen duidelijke verklaring voor stemmingswisselingen',
              'Gebrek aan follow-up op plannen of afspraken',
            ],
          },
        ],
        exercises: ['Hoe voel jij je bij wisselend contact en wat heb je nodig om je veilig te voelen?'],
        interactive: 'Bepaal welke actie je neemt wanneer iemands gedrag niet aansluit op hun woorden.',
      },
      {
        id: 'red-flag-5',
        label: 'RED FLAG 5',
        emoji: '🚩',
        title: 'Geen respect voor grenzen',
        description:
          'Herken wanneer iemand jouw “nee” negeert en hoe je stevig toch vriendelijk grenzen aangeeft.',
        lessons: [
          {
            id: 'red-flag-5-lesson',
            type: 'lesson',
            title: 'Grenzen bewaken in elke fase',
            description:
              'Wanneer jouw tempo, mening of fysieke grenzen niet gerespecteerd worden is dat een heldere rode vlag.',
            bullets: [
              'Aandringen ondanks duidelijke signalen van jou',
              'Bagatelliseren van jouw gevoelens of “nee”',
              'Blijven pushen om persoonlijke info of foto’s te delen',
            ],
          },
        ],
        exercises: [
          'Noteer een voorbeeld van een grens die belangrijk voor je is tijdens daten. Hoe communiceer je die rustig en duidelijk?',
        ],
        interactive: 'Welke zin gebruik jij om je grenzen te bewaken wanneer iemand blijft aandringen?',
      },
      {
        id: 'veiligheids-checklist',
        label: 'CHECKLIST',
        emoji: '✅',
        title: 'Veilig & Bewust Daten Checklist',
        description:
          'Veranker je nieuwe inzichten met een checklist en maak je persoonlijke veiligheidsafspraak.',
        lessons: [
          {
            id: 'checklist-lesson',
            type: 'lesson',
            title: 'Checklist in zes stappen',
            description:
              'Gebruik deze lijst vóór elke date om jezelf te herinneren aan wat jij belangrijk vindt.',
            bullets: [
              'Ken je grenzen en vertrouw op je intuïtie',
              'Laat iemand weten waar je afspreekt en met wie',
              'Gebruik videobellen voordat je offline afspreekt',
              'Zeg nee tegen druk of schuldgevoelens',
              'Zet je gevoel niet opzij om iemand te pleasen',
              'Blijf altijd baas over je eigen tempo',
            ],
          },
        ],
        exercises: ['Wat is jouw persoonlijke “veilig daten”-regel die je voortaan toepast?'],
        downloads: ['Checklist – Veilig & Bewust Daten'],
        interactive: 'Loop de checklist stap voor stap door en vink mentaal af wat je hebt gedaan.',
      },
      {
        id: 'bonus-quiz',
        label: 'BONUS',
        emoji: '🧠',
        title: 'Herken jij de Red Flags? Kennisquiz',
        description:
          'Test je kennis met een interactieve quiz van tien vragen en ontdek waar je nog scherper mag zijn.',
        lessons: [
          {
            id: 'lesson-quiz-1',
            type: 'interactive',
            title: 'Quiz: Herken jij de Red Flags bij Online Daten?',
            description:
              'Beantwoord tien scenario-vragen, ontvang direct feedback per antwoord en sluit af met een persoonlijke samenvatting.',
          },
        ],
      },
      {
        id: 'bonus-toolkit',
        label: 'BONUS',
        emoji: '🎁',
        title: 'Veilig Daten Toolkit',
        description:
          'Breid je kennis uit met extra tips, groene vlaggen en hulplijnen voor noodgevallen.',
        lessons: [
          {
            id: 'bonus-toolkit-overview',
            type: 'download',
            title: 'Toolkit overzicht',
            description:
              'Samenvatting van alle red flags, 10 tips voor veilig online daten en voorbeelden van gezonde “green flags”.',
            bullets: [
              '5 red flags compact uitgelegd',
              '10 praktische veiligheidstips',
              'Healthy green flags om naar uit te kijken',
              'Crisis- en hulpcontacten voor als je twijfelt',
            ],
          },
        ],
        downloads: ['Veilig Daten Toolkit (PDF)'],
        interactive: 'Plan het moment waarop je de toolkit doorkijkt en deel één inzicht met een vertrouwenspersoon.',
      },
    ],
  },
  {
    id: 'de-psychologie-van-de-onweerstaanbare-profieltekst',
    title: 'De Psychologie van de Onweerstaanbare Profieltekst',
    provider: 'DatingAssistent',
    duration: '11 modules + bonus materiaal',
    level: 'Van beginner naar profiel-expert',
    format: 'Online masterclass met psychologie, data en AI-tools',
    language: 'Nederlands',
    accessTier: 'pro',
    summary: 'Transformeer je dating profiel van onzichtbaar naar onweerstaanbaar met de psychologie van aantrekkingskracht. Leer in 11 modules hoe je profielteksten schrijft die consistent quality matches binnenhalen - geen gokwerk meer, maar slimme psychologie en data. Gebaseerd op vier pijlers: Psychologische transformatie, Didactische structuur, Technologische interactie en Resultaatgerichte meting.',
    sections: [
      {
        id: 'module-1-goed-jezelf-kennen',
        label: 'MODULE 1',
        emoji: '🧭',
        title: 'Goed Jezelf Kennen - De Basis Om Echt Te Zijn',
        description: 'Alle onzekerheden wegnemen en de diepste, leukste kanten van jouw persoonlijkheid blootleggen. Echt zijn is de enige valuta die werkt in dating.',
        lessons: [
          {
            id: 'module-1-video-intro',
            type: 'video',
            title: 'Introductie Module 1: Goed Jezelf Kennen',
            description: 'Waarom zelfkennis de basis is voor aantrekkelijke profielen en hoe je onzekerheden omzet in kracht.',
          },
          {
            id: 'module-1-video-impact',
            type: 'video',
            title: 'De Impact van een Goede Bio - 47 Berichten in Één Week',
            description: 'Echte casestudy: Hoe één zin in een profieltekst leidde tot 47 berichten met data en psychologie uitgelegd.',
          },
          {
            id: 'module-1-lesstof-wetenschap',
            type: 'lesson',
            title: 'De Wetenschap Achter Aantrekkingskracht',
            description: 'Leer de psychologische principes die bepalen of iemand reageert: reciprociteit, unieke waarde, deelbare kwetsbaarheid, sociale bewijskracht.',
          },
          {
            id: 'module-1-lesstof-stappen',
            type: 'lesson',
            title: 'Wat Je Gaat Bereiken in 8 Stappen',
            description: 'Van authentieke kern naar gecertificeerde profiel-expert met meetbare resultaten.',
          },
          {
            id: 'module-1-lesstof-kaik-regel',
            type: 'lesson',
            title: 'De K.A.I.K. Regel - Aantrekkelijkheid als Vaardigheid',
            description: 'Kennis, Actie, Interactie, Korrel: Hoe je profieltekst een proef wordt die je optimaliseert met data.',
          },
          {
            id: 'module-1-lesstof-verhalen',
            type: 'lesson',
            title: 'Je Echte Verhalen Vinden - Kern van de Module',
            description: 'Waarom harde feiten saai zijn en zachte verhalen mensen raken: passie, humor, kwetsbaarheid.',
          },
          {
            id: 'module-1-opdrachten-doelen',
            type: 'interactive',
            title: 'Jouw Dating Doelen Tool',
            description: 'Stel je persoonlijke doelen voor deze masterclass vast met meetbare targets.',
          },
          {
            id: 'module-1-opdrachten-quiz',
            type: 'interactive',
            title: 'Profieltekst Kennis Quiz',
            description: 'Test je huidige kennis over wat werkt in dating profielen voordat je begint.',
          },
          {
            id: 'module-1-opdrachten-frustratie',
            type: 'exercise',
            title: 'Oefeningen: Frustratie & Profiel-angst',
            description: 'Beschrijf je huidige frustratie, grootste angsten en welke woorden mensen over jou moeten gebruiken.',
          },
          {
            id: 'module-1-opdrachten-reflectie',
            type: 'exercise',
            title: 'Oefeningen: Reflectie - Weg met Negatieve Gedachten',
            description: 'Vind je hardnekkige negatieve gedachten en draai ze om in krachtige power statements.',
          },
        ],
        exercises: [
          'Schrijf 3 korte verhalen over je passie, humor en kwetsbaarheid',
          'Bepaal je 3 ononderhandelbare trefwoorden',
          'Wat zouden familie/vrienden zeggen dat jou uniek maakt?',
          'Beschrijf een "fake moment" dat je veranderde',
          'Wat doe je wanneer je iemand blij maakt?',
        ],
        downloads: ['Zelfkennis Workbook - 25 reflectievragen'],
      },
      {
        id: 'module-2-diepgaande-psychologie',
        label: 'MODULE 2',
        emoji: '🎯',
        title: 'Diepgaande Psychologie - Voor Wie Schrijf Jij?',
        description: 'De psychologische fundamenten van aantrekkingskracht begrijpen en een ideale partner blueprint creëren om te weten voor wie je schrijft.',
        lessons: [
          {
            id: 'module-2-video-kosten',
            type: 'video',
            title: 'Waarom \'Ik Hou van Reizen\' Je Berichten Kost',
            description: 'De onbekende tevredenheids-kosten van generieke zinnen en de psychologie erachter.',
          },
          {
            id: 'module-2-lesstof-blueprint',
            type: 'lesson',
            title: 'Jouw Ideale Partner Blueprint',
            description: 'Het partner shopping principe: schrijf niet voor iedereen, schrijf voor je ideale partner.',
          },
          {
            id: 'module-2-lesstof-energie',
            type: 'lesson',
            title: 'Energie Compatibility Framework',
            description: 'High vs. low energy types en hoe je energie uitstraalt in je profiel.',
          },
          {
            id: 'module-2-lesstof-must-haves',
            type: 'lesson',
            title: 'De 3 Must-Haves - Ononderhandelbare Eigenschappen',
            description: 'Identificeer de 3 kernkaraktereigenschappen die je zoekt en hoe je ze zelf toont.',
          },
          {
            id: 'module-2-opdrachten-shopping',
            type: 'interactive',
            title: 'Partner Shopping Tool',
            description: 'Creëer gedetailleerd profiel van je ideale partner.',
          },
          {
            id: 'module-2-opdrachten-optimalisatie',
            type: 'exercise',
            title: 'Oefeningen: De Partner Optimalisatie',
            description: 'Typ je ideale date tot in detail en definieer je energie level.',
          },
          {
            id: 'module-2-opdrachten-diepgaand',
            type: 'exercise',
            title: 'Oefeningen: Diepgaande Zelfreflectie',
            description: 'Welke activiteiten kosten je energie? Wat zijn je must-haves? Wat is je ideale toekomstbeeld?',
          },
        ],
        exercises: [
          'Beantwoord: Wat is de core value van je ideale partner?',
          'Beschrijf je dominante energie (high/low) in 3 zinnen',
          'Wat zijn je 3 dealbreakers?',
          'Hoe wil je dat iemand zich voelt bij jou?',
        ],
        downloads: ['Partner Blueprint Template', 'Energie Compatibility Guide'],
      },
      {
        id: 'module-3-structuur-meesterschap',
        label: 'MODULE 3',
        emoji: '🏗️',
        title: 'Structuur Meesterschap - Het Skelet van Succes',
        description: 'De 4 onweerstaanbare profiel-structuren leren en toepassen om jouw unieke waarde over te brengen in de meest compacte en aantrekkelijke vorm.',
        lessons: [
          {
            id: 'module-3-video-ritmisch',
            type: 'video',
            title: 'Waarom Zinnen Ritmisch Werken - De 4 Ritmes van Aantrekkingskracht',
            description: 'Waarom je bio een ritmisch liedje is dat de lezer meeneemt, niet een statische tekst.',
          },
          {
            id: 'module-3-lesstof-8-woorden',
            type: 'lesson',
            title: 'De Perfecte 8 Woorden - Hook, Bridge & Anchor',
            description: 'Hook (eerste zin), Bridge (authenticiteit) en Anchor (call-to-action) voor maximale impact.',
          },
          {
            id: 'module-3-lesstof-18-seconden',
            type: 'lesson',
            title: 'De 18-Seconden Regel - Bondig en Krachtig',
            description: 'Hoe mensen profielen lezen en waarom je moet schrappen wat niet essentieel is.',
          },
          {
            id: 'module-3-opdrachten-ritme',
            type: 'interactive',
            title: 'Oefeningen: Ritme Bouwen',
            description: 'Bouw de complete 4-delige structuur met je zelfkennis.',
          },
          {
            id: 'module-3-opdrachten-diepte',
            type: 'exercise',
            title: 'Oefeningen: Diepte & Schrapbaarheid',
            description: 'Herschrijf je huidige bio met 40% minder woorden maar 100% meer impact.',
          },
        ],
        exercises: [
          'Schrijf 10 verschillende hooks voor je profiel',
          'Bouw de complete 4-delige structuur',
          'Schrijf 3 verschillende CTA\'s en kies de beste',
          'Laat vrienden raden welke versie van jou is',
        ],
        downloads: ['Structuur Template - 4-delige bio opbouw', 'Hook Examples Database'],
      },
      {
        id: 'module-4-charisma-eliminatie',
        label: 'MODULE 4',
        emoji: '🚫',
        title: 'Charisma Eliminatie - Van Generiek naar Geniaal',
        description: 'Leren hoe je de meest generieke, \'dode\' zinnen uit je bio omzet in charisma-statements die onmiddellijk opvallen en verbinding creëren.',
        lessons: [
          {
            id: 'module-4-video-charisma',
            type: 'video',
            title: 'Charisma Eliminatie - Van \'Gezellig\' naar \'Onweerstaanbaar\'',
            description: 'Waarom clichés doden en hoe je ze transformeert met 3 formule technieken.',
          },
          {
            id: 'module-4-lesstof-zelfbeeld',
            type: 'lesson',
            title: 'Het Verbeterd Zelfbeeld - Verhaal Creatie',
            description: 'Je bio moet je karakter en waarden tonen, niet alleen je hobby\'s.',
            bullets: [
              'Waarom verhalen werken: Hersenen onthouden verhalen 22x beter dan feiten',
              'Van "Ik hou van reizen" naar "Ik heb mijn baan opgezegd om 6 maanden door Azië te backpacken"',
              'Kernwaarden als kompas: Integriteit, verbinding, groei, avontuur, rust',
              'Authenticiteit schept vertrouwen: Mensen voelen wanneer iets echt is',
              'Uniciteit trekt de juiste mensen aan: Sta op tussen de grijze massa'
            ],
          },
          {
            id: 'module-4-lesstof-verhaal-framework',
            type: 'lesson',
            title: 'Het Verhaal Framework - Van Hobby naar Karakter',
            description: 'Leer de 5-staps methode om verhalen te creëren die je ware zelf tonen.',
            bullets: [
              'Stap 1: Identificeer je kernwaarde (Wat drijft je echt?)',
              'Stap 2: Kies een authentiek moment (Wanneer leefde je deze waarde?)',
              'Stap 3: Voeg emotionele diepte toe (Wat voelde je? Wat leerde je?)',
              'Stap 4: Maak het specifiek (Concrete details maken het levend)',
              'Stap 5: Sluit af met inzicht (Wat zegt dit over wie je bent?)'
            ],
          },
          {
            id: 'module-4-lesstof-transformatie-voorbeelden',
            type: 'lesson',
            title: 'Transformatie Voorbeelden - Voor & Na',
            description: 'Zie hoe gewone hobby\'s transformeren naar verhalen die karakter tonen.',
            bullets: [
              'VOOR: "Ik hou van sporten" → NA: "Ik begon met hardlopen na mijn scheiding - het gaf me kracht terug"',
              'VOOR: "Ik lees graag" → NA: "Ik lees filosofie om mijn wereldbeeld te verbreden"',
              'VOOR: "Ik kook voor vrienden" → NA: "Ik geloof in het samenbrengen van mensen rond eten - het verbindt ons"',
              'VOOR: "Ik reis veel" → NA: "Ik heb mijn comfortzone verlaten door alleen naar Japan te reizen"',
              'VOOR: "Ik ben creatief" → NA: "Ik teken om mijn gedachten te verwerken wanneer woorden tekortschieten"'
            ],
          },
          {
            id: 'module-4-opdrachten-verhaal-creatie',
            type: 'interactive',
            title: 'Verhaal Creatie Workshop',
            description: 'Stapsgewijze oefening om je eerste karakter-verhaal te creëren.',
          },
          {
            id: 'module-4-opdrachten-waardentest',
            type: 'interactive',
            title: 'Kernwaarden Discovery Tool',
            description: 'Ontdek je top 3 kernwaarden door middel van scenario-based vragen.',
          },
          {
            id: 'module-4-lesstof-ankers',
            type: 'lesson',
            title: 'De 3 Soorten Ankers - Emotie, Actie, Intrigue',
            description: 'Elke zin moet een emotional anchor creëren die mensen raakt.',
          },
          {
            id: 'module-4-lesstof-dode-zinnen',
            type: 'lesson',
            title: 'De Dode Zinnen Detector - Authenticiteit Scannen',
            description: 'Herken zinnen die door iedereen gebruikt kunnen worden en leiden niet tot reactie.',
          },
          {
            id: 'module-4-opdrachten-charisma',
            type: 'interactive',
            title: 'Oefeningen: Charisma Transformeren',
            description: 'Transformeer 5 generieke zinnen naar charisma-statements.',
          },
          {
            id: 'module-4-opdrachten-authentiek',
            type: 'exercise',
            title: 'Oefeningen: De Authentieke Waarde Vinden',
            description: 'Vertel een verhaal over een \'faal\'-moment dat achteraf een kracht bleek.',
          },
        ],
        exercises: [
          'Identificeer alle \'dode\' zinnen in je huidige profiel',
          'Creëer 3 verschillende versies van dezelfde eigenschap',
          'Test je verhalen op authenticiteit bij vrienden',
          'Schrijf een verhaal dat je kernwaarde toont in plaats van een hobby te noemen',
          'Transformeer "Ik ben spontaan" naar een verhaal dat karakter toont',
          'Kies één kernwaarde en schrijf er een profielverhaal over',
        ],
        downloads: ['Cliché naar Charisma Transformatie Guide', 'Verhaal Crafting Workbook'],
      },
      {
        id: 'module-5-authenticiteit-detector',
        label: 'MODULE 5',
        emoji: '🎯',
        title: 'De Authenticiteit Detector Quiz',
        description: 'Je vermogen trainen om échte authenticiteit te herkennen in profielen en tegelijkertijd je eigen \'bullshit detector\' op scherp zetten.',
        lessons: [
          {
            id: 'module-5-quiz-lesstof',
            type: 'interactive',
            title: 'Authenticiteit Detector Quiz',
            description: 'Beoordeel profielzinnen: authentiek (specifiek, kwetsbaar) of generiek (vlak, onpersoonlijk).',
          },
          {
            id: 'module-5-opdrachten-analyse',
            type: 'interactive',
            title: 'Oefeningen: Analyseer en Herschrijf',
            description: 'Herkende je waar je details miste? Herschrijf generieke zinnen authentiek.',
          },
          {
            id: 'module-5-opdrachten-spiegel',
            type: 'exercise',
            title: 'Oefeningen: De Spiegel Test',
            description: 'Lees je nieuwe profiel hardop: klinkt het als jou op je beste dag?',
          },
        ],
        exercises: [
          'Beantwoord alle vragen zorgvuldig en neem de tijd om na te denken',
          'Herschrijf de 5 generieke zinnen uit de quiz zodat ze wél authentiek worden',
        ],
        downloads: ['Authenticiteit Detector Quiz Guide'],
      },
      {
        id: 'module-6-ai-optimalisatie',
        label: 'MODULE 6',
        emoji: '🤖',
        title: 'AI-Optimalisatie - Professionele Verbetering',
        description: 'Leer hoe je AI inzet als je professionele editor en testing partner om je profieltekst te finetunen tot het hoogste niveau, zonder je eigen stem te verliezen.',
        lessons: [
          {
            id: 'module-6-video-ai-coach',
            type: 'video',
            title: 'AI als Je Profiel Co-Coach - Niet Vervanging, Maar Verbetering',
            description: 'AI is fantastisch in optimalisatie, maar schrijf nooit scratch met AI - behoud je authenticiteit.',
          },
          {
            id: 'module-6-lesstof-3-prompts',
            type: 'lesson',
            title: 'De 3 Gouden AI Prompts',
            description: 'Variatie prompt, Optimalisatie prompt, Compatibiliteits prompt voor professionele resultaten.',
          },
          {
            id: 'module-6-lesstof-tonaal',
            type: 'lesson',
            title: 'Tonaal Repertoire & Testing Strategie',
            description: '4 professionele tonen (vlot, grappig, charmant, authentiek) en A/B testing voor data-driven optimalisatie.',
          },
          {
            id: 'module-6-opdrachten-genereer',
            type: 'interactive',
            title: 'Oefeningen: Genereer en Analyseer',
            description: 'Voer je concept in de AI Bio Generator Pro en vergelijk de 5 varianten.',
          },
          {
            id: 'module-6-opdrachten-testing',
            type: 'exercise',
            title: 'Oefeningen: AI Testing Storyplan',
            description: 'Stel een A/B test op voor je profiel met hypotheses en meetpunten.',
          },
        ],
        exercises: [
          'Test verschillende tonen voor verschillende doelgroepen',
          'Analyseer resultaten na 3 dagen testing',
          'Welke variant ging beter werken en waarom?',
        ],
        downloads: ['AI-Optimalisatie Playbook', 'A/B Testing Template'],
      },
      {
        id: 'module-7-validatie-mastery',
        label: 'MODULE 7',
        emoji: '✅',
        title: 'Validatie Mastery - Test & Optimaliseer',
        description: 'Leren hoe je data verzamelt om je profiel te valideren, feedback in winst omzet en platform-specifieke tuning toepast voor maximale resultaten.',
        lessons: [
          {
            id: 'module-7-video-feedback',
            type: 'video',
            title: 'Stop met Gissen - Het Validatie Dashboard',
            description: 'Elke match en elk bericht is feedback - leer data zien als je beste vriend.',
          },
          {
            id: 'module-7-lesstof-3-cs',
            type: 'lesson',
            title: 'De 3 C\'s van Feedback - Collect, Categorize, Correct',
            description: 'Systeem voor het omzetten van ervaringen in concrete verbeteringen.',
          },
          {
            id: 'module-7-lesstof-dashboard',
            type: 'interactive',
            title: 'Profiel Analyse Dashboard',
            description: 'Track je performance: kwaliteit matches, gesprek starters, respons rates.',
          },
          {
            id: 'module-7-lesstof-platform',
            type: 'lesson',
            title: 'Platform-Specific Tuning - Tinder vs. Bumble vs. Hinge',
            description: 'Optimaliseer voor elk platform: korter voor Tinder, diepte voor Hinge.',
          },
          {
            id: 'module-7-opdrachten-data',
            type: 'interactive',
            title: 'Oefeningen: Data Verzamelen',
            description: 'Loop de 27-punts checklist door en laat mensen je profiel reviewen.',
          },
          {
            id: 'module-7-opdrachten-diepgaand',
            type: 'exercise',
            title: 'Oefeningen: Diepgaande Feedback Analyse',
            description: 'Wat ging mis in ongewenste matches? Herschrijf je bio om die types af te schrikken.',
          },
        ],
        exercises: [
          'Maak platform-specifieke versies van je profiel',
          'Test respons rates na optimalisatie',
          'Analyseer wat werkt en wat niet werkt',
        ],
        downloads: ['Professionele Validatie Checklist (27 punten)', 'Platform Tuning Guide'],
      },
      {
        id: 'module-8-lancering-mastery',
        label: 'MODULE 8',
        emoji: '🚀',
        title: 'Lancering Mastery - Loop Clean & Momentum',
        description: 'Je profiel lanceren, een onderhoudssysteem opbouwen en het momentum vasthouden om langdurige, hoogwaardige resultaten te garanderen.',
        lessons: [
          {
            id: 'module-8-video-30-dagen',
            type: 'video',
            title: 'Je 30 Dagen Succes Plan - Momentum Building System',
            description: 'Van lancering naar onderhoud: dagelijkse clean, wekelijkse check-in, psychologische momentum.',
          },
          {
            id: 'module-8-lesstof-momentum',
            type: 'lesson',
            title: 'Het Momentum Building Systeem',
            description: 'Micro-wins vieren, macro-optimalisatie en psychologische momentum technieken.',
          },
          {
            id: 'module-8-lesstof-dualiteit',
            type: 'lesson',
            title: 'Project Profiel Dualiteit - Kwetsbaarheid + Kracht',
            description: 'De perfecte balans tussen zachtheid en autoriteit die mensen aantrekt.',
          },
          {
            id: 'module-8-opdrachten-lancering',
            type: 'interactive',
            title: 'Oefeningen: De Lancering',
            description: 'Plan je strategische lancering en momentum building rituals.',
          },
          {
            id: 'module-8-opdrachten-expert',
            type: 'exercise',
            title: 'Oefeningen: De Profiel Expert',
            description: 'Schrijf je transformatieverhaal en word lid van de expert community.',
          },
        ],
        exercises: [
          'Stel je 30-dagen verbeterplan op',
          'Configureer je continue optimalisatie dashboard',
          'Schrijf je expert mindset affirmaties',
        ],
        downloads: ['Lancering Playbook', '30-Dagen Optimalisatie Plan'],
      },
      {
        id: 'module-9-mastery-certificering',
        label: 'MODULE 9',
        emoji: '🏆',
        title: 'Mastery & Certificering - Jouw Transformatie Compleet',
        description: 'Afronding van het traject, zelfreflectie en het behalen van de certificering, en toetreden tot de expert community.',
        lessons: [
          {
            id: 'module-9-lesstof-review',
            type: 'lesson',
            title: 'Jouw Transformatie Review',
            description: 'Bekijk je voortgang: van frustraties naar zelfverzekerde profiel-expert.',
          },
          {
            id: 'module-9-lesstof-community',
            type: 'lesson',
            title: 'Profiel Expert Community',
            description: 'De plek voor continue feedback, nieuwe trends en expert-level ondersteuning.',
          },
          {
            id: 'module-9-lesstof-leven-lang',
            type: 'lesson',
            title: 'Leven Lang Leren in Dating',
            description: 'Profiel optimalisatie is een journey - blijf je levend document onderhouden.',
          },
          {
            id: 'module-9-opdrachten-transformatie',
            type: 'interactive',
            title: 'Oefeningen: Transformatie & Community',
            description: 'Deel je succes in de community en mentor een beginner.',
          },
          {
            id: 'module-9-opdrachten-certificering',
            type: 'exercise',
            title: 'Oefeningen: Je Certificering',
            description: 'Download je certificaat en reflecteer op je moeilijkste inzichten.',
          },
        ],
        exercises: [
          'Schrijf je persoonlijke transformatie verhaal',
          'Wat was het moeilijkste deel van deze cursus?',
          'Stel 3 nieuwe dating doelen voor de komende 3 maanden',
        ],
        downloads: ['Profieltekst Expert Certificate', 'Community Access Guide'],
      },
      {
        id: 'module-10-expert-bonus',
        label: 'MODULE 10',
        emoji: '🎁',
        title: 'Expert Bonus Materiaal - Diepgaande Mastery',
        description: 'Exclusieve verdieping voor mensen die het spel écht willen beheersen en de psychologie achter aantrekkingskracht tot in detail willen begrijpen.',
        lessons: [
          {
            id: 'module-10-lesstof-overzicht',
            type: 'lesson',
            title: 'Bonus Inhoudsoverzicht',
            description: 'Diepe psychologie, coaching voor niche-profielen, platform secrets en AI advanced tools.',
          },
          {
            id: 'module-10-psychologie-diep',
            type: 'video',
            title: 'Diepe Psychologie van Aantrekkingskracht',
            description: 'Wetenschappelijke inzichten over feromonen, spiegelneuronen en onbewuste waardeprioriteiten.',
          },
          {
            id: 'module-10-copywriting-masterclass',
            type: 'video',
            title: 'Copywriting voor Dating Profielen',
            description: 'Professionele schrijftechnieken toegepast op niche-dating (veganisten, d&d-spelers, ceo\'s).',
          },
          {
            id: 'module-10-platform-secrets',
            type: 'download',
            title: 'Platform Secrets Manual',
            description: 'Insider informatie over ranking algoritmes van grote dating platforms.',
          },
          {
            id: 'module-10-ai-advanced',
            type: 'interactive',
            title: 'AI Advanced Tools Guide',
            description: 'Geavanceerde AI-tools, prompts en workflows voor profiel experts.',
          },
        ],
        downloads: ['Complete Expert Toolkit', 'Advanced Psychology Guide', 'Platform Secrets Manual'],
      },
      {
        id: 'module-11-koelkast',
        label: 'MODULE 11',
        emoji: '📁',
        title: 'Koelkast - Alle Downloads & Tools',
        description: 'Een centrale plek voor alle downloadbare bronnen, tools en checklists uit de cursus.',
        lessons: [
          {
            id: 'module-11-downloads-overzicht',
            type: 'download',
            title: 'Complete Expert Toolkit',
            description: 'Alle templates, checklists en werkbladen in één download.',
          },
          {
            id: 'module-11-advanced-psychology',
            type: 'download',
            title: 'Advanced Psychology Guide',
            description: 'Diepgaande inzichten in menselijke aantrekkingskracht.',
          },
          {
            id: 'module-11-platform-secrets',
            type: 'download',
            title: 'Platform Secrets Manual',
            description: 'Insider kennis over algoritmes en optimalisatie.',
          },
          {
            id: 'module-11-zelfkennis-workbook',
            type: 'download',
            title: 'Zelfkennis Workbook (PDF)',
            description: '25 reflectievragen voor diepgaande zelfkennis.',
          },
          {
            id: 'module-11-configuratie-template',
            type: 'download',
            title: 'Configuratie Profiel Template',
            description: 'Template voor het opzetten van je ideale profiel.',
          },
          {
            id: 'module-11-woorden-checklist',
            type: 'download',
            title: 'Woorden Compatibility Checklist',
            description: 'Checklist voor taalgebruik en compatibiliteit.',
          },
          {
            id: 'module-11-verbal-crafting',
            type: 'download',
            title: 'Verbal Crafting Workbook',
            description: 'Werkboek voor het craften van aantrekkelijke teksten.',
          },
          {
            id: 'module-11-expert-certificaat',
            type: 'download',
            title: 'Profiel Expert Certificaat (PDF)',
            description: 'Jouw professionele certificaat als profiel expert.',
          },
        ],
        downloads: [
          'Complete Expert Toolkit',
          'Advanced Psychology Guide',
          'Platform Secrets Manual',
          'Zelfkennis Workbook (PDF)',
          'Configuratie Profiel Template',
          'Woorden Compatibility Checklist',
          'Verbal Crafting Workbook',
          'Profiel Expert Certificaat (PDF)',
        ],
      },
    ],
  },
  {
    id: 'je-bent-een-topper',
    title: 'Je bent een topper',
    provider: 'DatingAssistent',
    duration: '10 lessen masterclass',
    level: 'Van beginner naar zelfverzekerde dater',
    format: 'Interactieve masterclass met video, oefeningen en AI-tools',
    language: 'Nederlands',
    accessTier: 'free',
    summary: 'De psychologische transformatie van de cursist is de basis. Authenticiteit is de enige valuta in dating. Leer hoe je jezelf positioneert als de persoon die anderen willen ontmoeten.',
    sections: [
      {
        id: 'module-1-welkom-transformatie',
        label: 'MODULE 1',
        emoji: '🎯',
        title: 'Welkom: Jouw Profiel is geen CV, maar een Magneet',
        description: 'Start je transformatie met de fundamentele mindset shift: van perfectie naar authenticiteit.',
        lessons: [
          {
            id: 'les-1-1-welkom-video',
            type: 'video',
            title: 'Les 1.1: Welkom - Jouw Profiel is geen CV, maar een Magneet',
            description: 'Echt zijn is de enige valuta in dating. De mythe van perfectie versus de aantrekkingskracht van authenticiteit. Doel: niet kwantiteit, maar kwaliteit matches.',
            bullets: [
              'Waarom oppervlakkige profielen worden overgeslagen',
              'De psychologische kracht van authenticiteit',
              'Hoe je jezelf positioneert als iemand die anderen willen ontmoeten',
              'Het verschil tussen "perfect" en "authentiek aantrekkelijk"'
            ],
          },
          {
            id: 'les-1-2-persoonlijk-doel',
            type: 'interactive',
            title: 'Les 1.2: Definieer je Persoonlijke Doel',
            description: 'Stel je persoonlijke doel voor deze module vast en maak het meetbaar.',
          },
          {
            id: 'les-1-3-startmeting',
            type: 'interactive',
            title: 'Les 1.3: Startmeting - Jouw Grootste Frustratie',
            description: 'Identificeer je huidige pijnpunten in dating apps.',
          },
        ],
        exercises: [
          'Schrijf op wat je wilt bereiken met deze cursus (specifiek en meetbaar)',
          'Beantwoord: Wat is je grootste frustratie met dating apps?',
          'Maak een lijst van 3 dingen die je uniek maken als persoon',
        ],
        interactive: 'Startmeting Poll: Selecteer je grootste frustratie (verkeerde types / te weinig matches / weet niet wat te schrijven)',
      },
      {
        id: 'module-2-specificiteit-case',
        label: 'MODULE 2',
        emoji: '🎯',
        title: 'De 47-Berichten Case: De Kracht van Specificiteit',
        description: 'Leer hoe één specifieke zin een meetbaar verschil maakt in je dating resultaten.',
        lessons: [
          {
            id: 'les-2-1-case-study',
            type: 'video',
            title: 'Les 2.1: De 47-Berichten Case Study',
            description: 'Hoe één unieke, specifieke zin leidde tot 47 berichten in één week. De psychologie achter waarom details werken.',
            bullets: [
              'Voorbeeld van generiek ("Ik hou van reizen") vs. specifiek',
              'Waarom hersenen verhalen 22x beter onthouden dan feiten',
              'Specificity binds: de psychologische reden waarom details de lezer grijpen',
              'Hoe je jezelf onderscheidt in een zee van oppervlakkige profielen'
            ],
          },
          {
            id: 'les-2-2-specificiteit-quiz',
            type: 'interactive',
            title: 'Les 2.2: Specificiteit Test',
            description: 'Test je vermogen om generieke uitspraken om te zetten in specifieke verhalen.',
          },
          {
            id: 'les-2-3-jouw-ding',
            type: 'exercise',
            title: 'Les 2.3: Jouw Ding - Met Waarom',
            description: 'Noteer één ding dat je graag doet, inclusief de diepere waarom-reden.',
          },
        ],
        exercises: [
          'Analyseer je huidige profieltekst: hoeveel procent is specifiek?',
          'Herschrijf één generieke zin naar iets specifieks',
          'Deel je "ding met waarom" in de community voor feedback',
        ],
        interactive: 'Specificiteit Quiz: 1 vraag over de 47 berichten casestudy om specificiteit te testen',
      },
      {
        id: 'module-3-psychologische-principes',
        label: 'MODULE 3',
        emoji: '🧠',
        title: 'De 4 Psychologische Principes van Aantrekkelijkheid',
        description: 'De wetenschappelijke fundamenten van wat mensen echt aantrekt in profielen.',
        lessons: [
          {
            id: 'les-3-1-principes-uitleg',
            type: 'lesson',
            title: 'Les 3.1: De 4 Principes Uitgelegd',
            description: 'Leer de psychologische principes die bepalen of iemand reageert.',
            bullets: [
              '1. Reciprociteit: De uitnodiging tot actie - mensen reageren op mensen die initiatief tonen',
              '2. Unieke waarde: Jouw onderscheidende eigenschap - wat maakt jou anders dan anderen?',
              '3. Deelbare kwetsbaarheid: Het creëren van vertrouwen door menselijkheid te tonen',
              '4. Sociale bewijskracht: Indirect bewijs van gewildheid door verhalen te vertellen'
            ],
          },
          {
            id: 'les-3-2-principe-toepassing',
            type: 'interactive',
            title: 'Les 3.2: Principe Detector Tool',
            description: 'Analyseer bestaande profielen op deze 4 principes.',
          },
          {
            id: 'les-3-3-jouw-principes',
            type: 'exercise',
            title: 'Les 3.3: Identificeer Jouw Sterkste Principes',
            description: 'Welke van de 4 principes komen het meest natuurlijk bij jou naar voren?',
          },
        ],
        exercises: [
          'Analyseer 3 succesvolle profielen op de 4 principes',
          'Schrijf voor elk principe één zin die bij jou past',
          'Combineer 2 principes in één profielzin',
        ],
        downloads: ['Psychologische Principes Cheat Sheet'],
      },
      {
        id: 'module-4-kernwaarden-ontdekken',
        label: 'MODULE 4',
        emoji: '💎',
        title: 'Kernwaarden Ontdekken - Wat Drijft Je Echt?',
        description: 'Ontdek je diepste waarden en hoe je ze vertaalt naar aantrekkelijke profielcontent.',
        lessons: [
          {
            id: 'les-4-1-waardentest',
            type: 'interactive',
            title: 'Les 4.1: Kernwaarden Discovery Test',
            description: 'Een diepgaande test om je top 5 relatie-waarden te identificeren.',
          },
          {
            id: 'les-4-2-waarden-vertalen',
            type: 'lesson',
            title: 'Les 4.2: Van Waarden naar Verhalen',
            description: 'Leer hoe je abstracte waarden omzet in concrete, aantrekkelijke verhalen.',
            bullets: [
              'Integriteit: "Ik zeg altijd wat ik bedoel, ook als het moeilijk is"',
              'Verbinding: "Ik geloof in diepgaande gesprekken die ertoe doen"',
              'Groei: "Ik zie elke ervaring als een kans om te leren"',
              'Avontuur: "Ik omarm nieuwe ervaringen met open armen"',
              'Rust: "Ik creëer kalmte te midden van de chaos"'
            ],
          },
          {
            id: 'les-4-3-waarden-matching',
            type: 'exercise',
            title: 'Les 4.3: Welke Partner Past Bij Jouw Waarden?',
            description: 'Beschrijf de persoon die perfect aansluit bij je kernwaarden.',
          },
        ],
        exercises: [
          'Doorloop de Kernwaarden Discovery Test volledig',
          'Kies je top 3 waarden en schrijf er een verhaal over',
          'Beschrijf hoe je ideale partner je waarden weerspiegelt',
        ],
        interactive: 'Kernwaarden Discovery Tool: Scenario-based vragen om je relatie-DNA te ontdekken',
      },
      {
        id: 'module-5-verhaal-creatie-workshop',
        label: 'MODULE 5',
        emoji: '📖',
        title: 'Verhaal Creatie Workshop - Van Hobby naar Karakter',
        description: 'Stapsgewijze workshop om je eerste karakter-verhaal te creëren.',
        lessons: [
          {
            id: 'les-5-1-verhaal-framework',
            type: 'lesson',
            title: 'Les 5.1: Het 5-Stappen Verhaal Framework',
            description: 'De bewezen methode om verhalen te creëren die karakter tonen.',
            bullets: [
              'Stap 1: Identificeer je kernwaarde (Wat drijft je echt?)',
              'Stap 2: Kies een authentiek moment (Wanneer leefde je deze waarde?)',
              'Stap 3: Voeg emotionele diepte toe (Wat voelde je? Wat leerde je?)',
              'Stap 4: Maak het specifiek (Concrete details maken het levend)',
              'Stap 5: Sluit af met inzicht (Wat zegt dit over wie je bent?)'
            ],
          },
          {
            id: 'les-5-2-verhaal-builder',
            type: 'interactive',
            title: 'Les 5.2: Verhaal Builder Tool',
            description: 'Stapsgewijze tool om je verhaal op te bouwen volgens het framework.',
          },
          {
            id: 'les-5-3-verhaal-feedback',
            type: 'exercise',
            title: 'Les 5.3: Peer Feedback Rondje',
            description: 'Deel je verhaal in de community voor eerlijke feedback.',
          },
        ],
        exercises: [
          'Bouw een compleet verhaal volgens het 5-stappen framework',
          'Test je verhaal op 3 mensen buiten de app',
          'Herschrijf je verhaal op basis van feedback',
        ],
        interactive: 'Verhaal Creatie Workshop: Stapsgewijze oefening om je eerste karakter-verhaal te creëren',
      },
      {
        id: 'module-6-transformatie-voorbeelden',
        label: 'MODULE 6',
        emoji: '🔄',
        title: 'Transformatie Voorbeelden - Voor & Na',
        description: 'Zie hoe gewone uitspraken transformeren naar verhalen die karakter tonen.',
        lessons: [
          {
            id: 'les-6-1-voorbeelden-database',
            type: 'lesson',
            title: 'Les 6.1: Transformatie Voorbeelden Database',
            description: 'Voor & na voorbeelden van verschillende persoonlijkheden.',
            bullets: [
              'VOOR: "Ik hou van sporten" → NA: "Ik begon met hardlopen na mijn scheiding - het gaf me kracht terug"',
              'VOOR: "Ik lees graag" → NA: "Ik lees filosofie om mijn wereldbeeld te verbreden"',
              'VOOR: "Ik kook voor vrienden" → NA: "Ik geloof in het samenbrengen van mensen rond eten - het verbindt ons"',
              'VOOR: "Ik reis veel" → NA: "Ik heb mijn comfortzone verlaten door alleen naar Japan te reizen"',
              'VOOR: "Ik ben creatief" → NA: "Ik teken om mijn gedachten te verwerken wanneer woorden tekortschieten"'
            ],
          },
          {
            id: 'les-6-2-jouw-transformatie',
            type: 'interactive',
            title: 'Les 6.2: Jouw Persoonlijke Transformatie Tool',
            description: 'Transformeer je eigen generieke uitspraken naar verhalen.',
          },
          {
            id: 'les-6-3-transformatie-quiz',
            type: 'interactive',
            title: 'Les 6.3: Transformatie Mastery Quiz',
            description: 'Test je vermogen om clichés te herkennen en te transformeren.',
          },
        ],
        exercises: [
          'Transformeer 5 uitspraken uit je huidige profiel',
          'Kies je favoriete transformatie en schrijf er een volledig verhaal over',
          'Deel je "voor & na" in de community',
        ],
        downloads: ['Transformatie Voorbeelden Database (PDF)'],
      },
      {
        id: 'module-7-ai-optimalisatie',
        label: 'MODULE 7',
        emoji: '🤖',
        title: 'AI-Optimalisatie - Professionele Verfijning',
        description: 'Gebruik AI als professionele editor om je verhalen naar het volgende niveau te tillen.',
        lessons: [
          {
            id: 'les-7-1-ai-principes',
            type: 'video',
            title: 'Les 7.1: AI als Je Persoonlijke Profiel Coach',
            description: 'Leer AI in te zetten voor objectieve feedback en professionele verbeteringen.',
          },
          {
            id: 'les-7-2-ai-bio-generator',
            type: 'interactive',
            title: 'Les 7.2: AI Bio Generator Pro Tool',
            description: 'Geavanceerde tool die 5 professionele varianten genereert van je verhaal.',
          },
          {
            id: 'les-7-3-ai-feedback-analyse',
            type: 'exercise',
            title: 'Les 7.3: AI Feedback Analyse',
            description: 'Analyseer welke AI suggesties werken voor jouw stem.',
          },
        ],
        exercises: [
          'Voer je verhaal in de AI Bio Generator Pro',
          'Vergelijk de 5 varianten - welke voelt het meest als jou?',
          'Pas 3 AI suggesties toe en test het resultaat',
        ],
        interactive: 'AI Bio Generator Pro Tool: Geavanceerde tool die 5 professionele varianten genereert',
      },
      {
        id: 'module-8-validatie-mastery',
        label: 'MODULE 8',
        emoji: '✅',
        title: 'Validatie Mastery - Test & Optimaliseer',
        description: 'Leer je verhalen te testen voordat je live gaat met professionele checklists.',
        lessons: [
          {
            id: 'les-8-1-professionele-checklist',
            type: 'lesson',
            title: 'Les 8.1: De Complete Profiel Audit Checklist',
            description: '27-punts checklist die professionele profielschrijvers gebruiken.',
          },
          {
            id: 'les-8-2-peer-feedback-setup',
            type: 'interactive',
            title: 'Les 8.2: Peer Feedback Optimalisatie',
            description: 'Leer feedback effectief in te zetten voor verbetering.',
          },
          {
            id: 'les-8-3-data-tracking',
            type: 'exercise',
            title: 'Les 8.3: Resultaten Tracking Setup',
            description: 'Stel een systeem op om je voortgang te meten.',
          },
        ],
        exercises: [
          'Loop de complete 27-punts checklist door',
          'Laat 5 mensen je verhaal reviewen',
          'Stel meetbare doelen vast voor je resultaten',
        ],
        downloads: ['Professionele Validatie Checklist (27 punten)'],
      },
      {
        id: 'module-9-lancering-strategie',
        label: 'MODULE 9',
        emoji: '🚀',
        title: 'Lancering Strategie - Live Gaan & Momentum',
        description: 'Strategisch lanceren voor maximale impact en momentum opbouwen.',
        lessons: [
          {
            id: 'les-9-1-lancering-timing',
            type: 'video',
            title: 'Les 9.1: Strategische Lancering voor Maximaal Impact',
            description: 'Leer wanneer, hoe en waarom je je verhalen lanceert.',
          },
          {
            id: 'les-9-2-momentum-building',
            type: 'lesson',
            title: 'Les 9.2: Momentum Building Systeem',
            description: 'Leer positieve energie en resultaten op te bouwen.',
          },
          {
            id: 'les-9-3-30-dagen-plan',
            type: 'interactive',
            title: 'Les 9.3: Jouw 30 Dagen Succes Plan',
            description: 'Creëer je persoonlijke roadmap voor de komende maand.',
          },
        ],
        exercises: [
          'Plan je strategische lancering (dag, tijd, volgorde)',
          'Stel momentum building rituals op',
          'Maak je 30 dagen verbeterplan',
        ],
        downloads: ['Lancering Playbook & 30 Dagen Template'],
      },
      {
        id: 'module-10-mastery-certificering',
        label: 'MODULE 10',
        emoji: '🏆',
        title: 'Mastery & Certificering - Jouw Transformatie Compleet',
        description: 'Vier je succes, ontvang je certificaat en word lid van de Topper Community.',
        lessons: [
          {
            id: 'les-10-1-transformatie-review',
            type: 'video',
            title: 'Les 10.1: Jouw Transformatie Review',
            description: 'Bekijk hoe ver je bent gekomen en wat je hebt geleerd.',
          },
          {
            id: 'les-10-2-topper-certificaat',
            type: 'download',
            title: 'Les 10.2: Je bent een Topper Certificaat',
            description: 'Download je professionele certificaat.',
          },
          {
            id: 'les-10-3-community-access',
            type: 'lesson',
            title: 'Les 10.3: Topper Community Access',
            description: 'Word lid van de exclusieve gemeenschap van toppers.',
          },
        ],
        exercises: [
          'Schrijf je persoonlijke transformatie verhaal',
          'Deel je succes in de community',
          'Mentor een beginner met je nieuwe kennis',
        ],
        downloads: ['Je bent een Topper Certificate', 'Community Access Guide'],
      },
    ],
  },
];

export type CourseGroupId = 'dating-fundament' | 'connectie-en-diepgang' | 'meesterschap-in-relaties';

export interface CourseGroup {
  id: CourseGroupId;
  title: string;
  description: string;
  minTier: MembershipTier;
  moduleIds: number[];
}

export const COURSE_GROUPS: CourseGroup[] = [
  {
    id: 'dating-fundament',
    title: 'Basiscursus: dating fundament',
    description: 'Leg het fundament voor succesvol daten met mindset, profiel en gespreksvaardigheden.',
    minTier: 'core',
    moduleIds: [1, 2, 3, 4, 5],
  },
  {
    id: 'connectie-en-diepgang',
    title: 'Intermediate: connectie & diepgang',
    description: 'Verdiep je aanpak met psychologie, flirttechnieken en veerkracht in het daten.',
    minTier: 'pro',
    moduleIds: [6, 7, 8, 9, 10],
  },
  {
    id: 'meesterschap-in-relaties',
    title: 'Premium: meesterschap in relaties',
    description: 'Ontwikkel duurzame relatievaardigheden met persoonlijke begeleiding en coaching.',
    minTier: 'premium',
    moduleIds: [11, 12, 13],
  },
];

export interface ModuleDefinition {
  id: number;
  title: string;
  theme: string;
  icon: string;
  completed: boolean;
  courseId: CourseGroupId;
  minTier: MembershipTier;
  detailedCourseId?: string;
  sectionId?: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    id: 1,
    title: 'Mindset & voorbereiding',
    theme: 'Wat zoek je écht? Realistische verwachtingen en de juiste app kiezen.',
    icon: 'Compass',
    completed: false,
    courseId: 'dating-fundament',
    minTier: 'core',
    detailedCourseId: 'basiscursus-dating-fundament',
    sectionId: 'module-1-mindset',
  },
  {
    id: 2,
    title: 'Het onweerstaanbare profiel',
    theme: 'Fotostrategie en bios die gesprekken uitlokken.',
    icon: 'Sparkles',
    completed: false,
    courseId: 'dating-fundament',
    minTier: 'core',
    detailedCourseId: 'basiscursus-dating-fundament',
    sectionId: 'module-2-profiel',
  },
  {
    id: 3,
    title: 'Effectief swipen & matchen',
    theme: 'Efficiënt zoeken, kwaliteit boven kwantiteit en slimme swipetactieken.',
    icon: 'Camera',
    completed: false,
    courseId: 'dating-fundament',
    minTier: 'core',
    detailedCourseId: 'basiscursus-dating-fundament',
    sectionId: 'module-3-matchen',
  },
  {
    id: 4,
    title: 'De kunst van het gesprek',
    theme: 'Van openingszin naar een vloeiend gesprek dat blijft lopen.',
    icon: 'MessageCircle',
    completed: false,
    courseId: 'dating-fundament',
    minTier: 'core',
    detailedCourseId: 'basiscursus-dating-fundament',
    sectionId: 'module-4-gesprek',
  },
  {
    id: 5,
    title: 'De eerste date',
    theme: 'Een goede date plannen, gespreksonderwerpen kiezen en veiligheid bewaken.',
    icon: 'Calendar',
    completed: false,
    courseId: 'dating-fundament',
    minTier: 'core',
    detailedCourseId: 'basiscursus-dating-fundament',
    sectionId: 'module-5-date',
  },
  {
    id: 6,
    title: 'De psychologie van aantrekkingskracht',
    theme: 'Humor, zelfvertrouwen en lichaamstaal begrijpen en inzetten.',
    icon: 'Brain',
    completed: false,
    courseId: 'connectie-en-diepgang',
    minTier: 'pro',
    detailedCourseId: 'connectie-en-diepgang-programma',
    sectionId: 'module-6-aantrekkingskracht',
  },
  {
    id: 7,
    title: 'Diepgaande gesprekken voeren',
    theme: 'De kunst van het vragen stellen, actief luisteren en verbinding maken.',
    icon: 'MessageSquare',
    completed: false,
    courseId: 'connectie-en-diepgang',
    minTier: 'pro',
    detailedCourseId: 'connectie-en-diepgang-programma',
    sectionId: 'module-7-diepgaand-gesprek',
  },
  {
    id: 8,
    title: 'Flirten, humor & spanning',
    theme: 'Respectvol flirten, speelse spanning creëren en grenzen bewaken.',
    icon: 'Flame',
    completed: false,
    courseId: 'connectie-en-diepgang',
    minTier: 'pro',
    detailedCourseId: 'connectie-en-diepgang-programma',
    sectionId: 'module-8-flirten',
  },
  {
    id: 9,
    title: 'Omgaan met onzekerheid & afwijzing',
    theme: 'Ghosting verwerken, afwijzing relativeren en een sterke mindset bouwen.',
    icon: 'Shield',
    completed: false,
    courseId: 'connectie-en-diepgang',
    minTier: 'pro',
    detailedCourseId: 'connectie-en-diepgang-programma',
    sectionId: 'module-9-veerkracht',
  },
  {
    id: 10,
    title: 'Herkennen van "green flags"',
    theme: 'Signalen van oprechte interesse en beschikbaarheid herkennen.',
    icon: 'Flag',
    completed: false,
    courseId: 'connectie-en-diepgang',
    minTier: 'pro',
    detailedCourseId: 'connectie-en-diepgang-programma',
    sectionId: 'module-10-green-flags',
  },
  {
    id: 11,
    title: 'Jouw hechtingsstijl & datingpatronen',
    theme: 'Ontdek je patronen en hoe ze je partnerkeuze beïnvloeden.',
    icon: 'Puzzle',
    completed: false,
    courseId: 'meesterschap-in-relaties',
    minTier: 'premium',
    detailedCourseId: 'meesterschap-in-relaties-programma',
    sectionId: 'module-11-hechting',
  },
  {
    id: 12,
    title: 'Communicatie voorbij de eerste dates',
    theme: 'Grenzen aangeven en kwetsbaarheid als kracht inzetten.',
    icon: 'Users',
    completed: false,
    courseId: 'meesterschap-in-relaties',
    minTier: 'premium',
    detailedCourseId: 'meesterschap-in-relaties-programma',
    sectionId: 'module-12-communicatie',
  },
  {
    id: 13,
    title: 'Van daten naar een relatie',
    theme: 'Het "wat zijn we?"-gesprek voeren en de overgang naar een relatie begeleiden.',
    icon: 'Heart',
    completed: false,
    courseId: 'meesterschap-in-relaties',
    minTier: 'premium',
    detailedCourseId: 'meesterschap-in-relaties-programma',
    sectionId: 'module-13-overgang-relatie',
  },
];

export interface MembershipFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  minTier: MembershipTier;
}

export const MEMBERSHIP_FEATURES: MembershipFeature[] = [
  {
    id: 'community-access',
    title: 'Community & forum',
    description: 'Toegang tot de besloten community om ervaringen te delen en vragen te stellen.',
    icon: 'Users',
    minTier: 'core',
  },
  {
    id: 'ai-core',
    title: 'AI-tools (basiscredits)',
    description: 'Maandelijkse credits om de AI-coach en hulpmiddelen in te zetten.',
    icon: 'Bot',
    minTier: 'core',
  },
  {
    id: 'weekly-tip',
    title: 'Wekelijkse datingtip',
    description: 'Elke week een korte, praktische tip in je inbox.',
    icon: 'Mail',
    minTier: 'core',
  },
  {
    id: 'content-library',
    title: 'Contentbibliotheek',
    description: 'Toegang tot een groeiende bibliotheek van mini-workshops en achtergrondmateriaal.',
    icon: 'BookOpen',
    minTier: 'pro',
  },
  {
    id: 'ai-pro',
    title: 'Uitgebreide AI-credits',
    description: 'Extra ruime hoeveelheid credits voor alle AI-tools.',
    icon: 'Cpu',
    minTier: 'pro',
  },
  {
    id: 'live-qa',
    title: 'Maandelijkse live Q&A',
    description: 'Interactieve sessie met een coach om je vragen te stellen.',
    icon: 'Mic',
    minTier: 'pro',
  },
  {
    id: 'group-coaching',
    title: 'Exclusieve groepscoachingsessies',
    description: 'Live groepssessies alleen voor premium-leden.',
    icon: 'Video',
    minTier: 'premium',
  },
  {
    id: 'one-on-one',
    title: 'Maandelijkse 1-op-1 profielaudit',
    description: 'Videocall met persoonlijke feedback op je profiel en voortgang.',
    icon: 'UserCheck',
    minTier: 'premium',
  },
  {
    id: 'priority-support',
    title: 'Voorrang bij support',
    description: 'Premium-leden krijgen prioriteit bij vragen en ondersteuning.',
    icon: 'LifeBuoy',
    minTier: 'premium',
  },
  {
    id: 'ai-premium',
    title: 'Maximale AI-toegang',
    description: 'De hoogste hoeveelheid credits voor alle AI-coaching functies.',
    icon: 'Sparkles',
    minTier: 'premium',
  },
];

// Add skills assessment module
export const ASSESSMENT_MODULE = {
  id: 7,
  title: 'Vaardigheden Beoordeling',
  theme: 'Ontdek je datingsterkte',
  icon: 'ClipboardList'
};

export const DATING_PLATFORMS = [
  { name: 'Tinder', style: 'snel', audience: 'jong', cost: 'gratis', type: 'app', tech: 'hoog', identity: ['algemeen', 'lhbtq+'] },
  { name: 'Parship', style: 'serieus', audience: '30+', cost: 'betaald', type: 'website', tech: 'gemiddeld', identity: ['algemeen', 'hoogopgeleid'] },
  { name: '50plusmatch', style: 'serieus', audience: '50+', cost: 'betaald', type: 'website', tech: 'laag', identity: ['50+'] },
  { name: 'Lexa', style: 'breed', audience: 'breed', cost: 'gemengd', type: 'website', tech: 'gemiddeld', identity: ['algemeen'] },
  { name: 'Bumble', style: 'snel', audience: 'jong', cost: 'gratis', type: 'app', tech: 'hoog', identity: ['algemeen'] },
  { name: 'Happn', style: 'snel', audience: 'jong', cost: 'gratis', type: 'app', tech: 'hoog', identity: ['algemeen'] },
  { name: 'Inner Circle', style: 'serieus', audience: 'hoogopgeleid', cost: 'betaald', type: 'app', tech: 'hoog', identity: ['hoogopgeleid'] },
  { name: 'OogvoorLiefde', style: 'doelgroep', audience: 'beperking', cost: 'betaald', type: 'website', tech: 'laag', identity: ['beperking'] },
  { name: 'Grindr', style: 'snel', audience: 'lhbtq+', cost: 'gratis', type: 'app', tech: 'hoog', identity: ['lhbtq+'] },
  { name: 'Funky Fish', style: 'doelgroep', audience: 'christelijk', cost: 'betaald', type: 'website', tech: 'laag', identity: ['christelijk'] },
  { name: 'Feeld', style: 'open-minded', audience: 'jong', cost: 'gemengd', type: 'app', tech: 'hoog', identity: ['lhbtq+', 'algemeen'] }
];