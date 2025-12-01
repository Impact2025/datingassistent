# MASTERPLAN: DatingAssistent Drie-Lagen Model

## VISIE

DatingAssistent transformeren van een tool-georiënteerde app naar een coach-georiënteerde ervaring. De AI Coach wordt het hart van de app - gebruikers praten met hun coach, en de coach routeert intelligent naar tools en cursussen.

---

## HET DRIE-LAGEN MODEL

```
┌─────────────────────────────────────────────────────────────────┐
│   LAAG 1: DE AI COACH (80% van interacties)                     │
│   ═══════════════════                                           │
│   • Centrale chat interface                                     │
│   • Kent volledige user context                                 │
│   • Routeert naar tools/cursussen                               │
│   • Voelt als echte coach, niet als software                    │
├─────────────────────────────────────────────────────────────────┤
│   LAAG 2: HET PAD (gestructureerde journey)                     │
│   ═══════════════                                               │
│   • 5 fases van beginner tot relatie-ready                      │
│   • Tools + cursussen gebundeld per fase                        │
│   • Gamification: streaks, badges, challenges                   │
├─────────────────────────────────────────────────────────────────┤
│   LAAG 3: DE TOOLKIT (power users)                              │
│   ══════════════════                                            │
│   • Alle 23 tools direct toegankelijk                           │
│   • Cursusbibliotheek                                           │
│   • Geavanceerde filters                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## NIEUWE NAVIGATIE

```
VAN (5-6 tabs):
Dashboard | Profiel & Persoonlijkheid | Communicatie & Matching | 
Daten & Relaties | Groei & Doelen | Leren & Ontwikkelen

NAAR (4 tabs):
┌────────────────────────────────────────────────────────────┐
│     🏠          📚          💬          👤                 │
│    Home        Pad        Coach      Profiel               │
└────────────────────────────────────────────────────────────┘
```

---

## SPRINT 1: AI COACH UPGRADE

### 1.1 Nieuwe Coach Interface

**Locatie:** `/app/(main)/coach/page.tsx`

Full-screen chat interface (niet modal/sidebar):

```tsx
// Structuur
<div className="flex flex-col h-screen">
  {/* Header */}
  <header className="p-4 border-b">
    <h1>Je Coach</h1>
  </header>
  
  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4">
    {messages.map(msg => <CoachMessage key={msg.id} {...msg} />)}
  </div>
  
  {/* Quick Suggestions */}
  <CoachSuggestions suggestions={contextualSuggestions} />
  
  {/* Input */}
  <CoachInput onSend={handleSend} onUpload={handleUpload} />
</div>
```

### 1.2 Coach Components

**Locatie:** `/components/coach/`

```
/components/coach/
├── CoachChat.tsx           - Hoofdcontainer
├── CoachMessage.tsx        - Bericht (user/coach styling)
├── CoachSuggestions.tsx    - Quick action buttons
├── CoachInput.tsx          - Tekst input + upload
├── CoachTyping.tsx         - Typing indicator
└── CoachToolCard.tsx       - Tool suggestie in chat
```

### 1.3 Coach Personality & Prompts

**Locatie:** `/lib/coach/prompts.ts`

```typescript
export const COACH_SYSTEM_PROMPT = `
Je bent de AI Dating Coach van DatingAssistent.nl. 

## Jouw Persoonlijkheid
- Warm maar niet soft
- Direct maar niet hard  
- Expert maar niet neerbuigend
- Ondersteunend maar niet slijmerig

## Taalgebruik
- Nederlandse spreektaal, geen jargon
- Korte zinnen
- Maximaal 1 emoji per bericht
- Geen overdreven enthousiasme ("geweldig!", "super!")

## Wat Je Weet
Je hebt toegang tot de volledige context van de gebruiker:
- Profiel: naam, leeftijd, locatie, situatie
- Assessments: alle voltooide scans en scores
- Journey: huidige fase, voortgang, volgende stappen
- Geschiedenis: eerdere gesprekken en acties

## Jouw Taken
1. BEANTWOORD vragen over dating, relaties, zelfvertrouwen
2. ROUTEER naar tools wanneer relevant (nooit pushen)
3. MOTIVEER zonder te overdrijven
4. SIGNALEER wanneer professionele hulp nodig is

## Tool Routing
Wanneer een tool relevant is, bied deze aan als optie:
- "Ik kan je foto's analyseren als je wilt"
- "Zal ik een paar openers voor je maken?"
- "Wil je eerst de scan doen of direct advies?"

Gebruik NOOIT:
- "Geweldig!" "Super!" "Fantastisch!"
- Overdreven emoji's
- Neerbuigende taal
- Vakjargon

## Bij Gevoelige Onderwerpen
- Erken emoties eerst
- Vraag door voordat je adviseert
- Bij crisis: verwijs naar 113 Zelfmoordpreventie
`;
```

### 1.4 Context Builder

**Locatie:** `/lib/coach/context.ts`

```typescript
interface CoachContext {
  user: {
    id: string;
    name: string;
    age: number;
    location: string;
    situation: string;
    painPoints: string[];
    goal: string;
    timeCommitment: string;
  };
  
  assessments: {
    emotionalReady?: { score: number; date: string; };
    attachmentStyle?: { primary: string; secondary: string; };
    datingStyle?: { style: string; };
    blindSpots?: { patterns: string[]; };
  };
  
  journey: {
    currentPhase: number;
    phaseName: string;
    completedItems: string[];
    nextItem: string;
  };
  
  engagement: {
    streak: number;
    lastActive: string;
    toolsUsed: string[];
  };
  
  recentConversations: {
    topics: string[];
    pendingActions: string[];
  };
}

export async function buildCoachContext(userId: string): Promise<CoachContext> {
  // Haal alle relevante data op uit database
  // Combineer tot één context object
  // Return voor gebruik in system prompt
}
```

### 1.5 Tool Routing

**Locatie:** `/lib/coach/routing.ts`

```typescript
interface ToolRoute {
  tool: string;
  confidence: number;
  suggestedResponse: string;
}

export function detectToolIntent(message: string, context: CoachContext): ToolRoute | null {
  // Patronen voor tool routing
  const patterns = {
    'foto|picture|foto\'s|photos': {
      tool: 'foto-analyse',
      response: 'Ik kan je foto\'s analyseren. Wil je er een paar uploaden?'
    },
    'opener|eerste bericht|beginnen|aanspreken': {
      tool: 'openingszinnen',
      response: 'Ik kan je helpen met een opener. Vertel me iets over degene die je wilt aanschrijven.'
    },
    'gesprek|chat|loopt vast|dood': {
      tool: 'gespreksassistent',
      response: 'Deel het gesprek met me, dan kijk ik waar het beter kan.'
    },
    'veilig|red flag|raar|onveilig': {
      tool: 'veiligheidscheck',
      response: 'Laten we even checken. Deel het gesprek en ik analyseer het op rode vlaggen.'
    },
    // etc.
  };
  
  // Match tegen patronen
  // Return tool suggestion of null
}
```

---

## SPRINT 2: NIEUWE NAVIGATIE & HOME

### 2.1 Bottom Navigation

**Locatie:** `/components/navigation/BottomNav.tsx`

```tsx
const navItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: BookOpen, label: 'Pad', href: '/pad' },
  { icon: MessageCircle, label: 'Coach', href: '/coach' },
  { icon: User, label: 'Profiel', href: '/profiel' },
];
```

### 2.2 Smart Home Page

**Locatie:** `/app/(main)/home/page.tsx`

```tsx
// Structuur
<div className="p-4 space-y-6">
  {/* Welkom */}
  <WelcomeHeader name={user.name} />
  
  {/* Volgende Actie - DE HERO */}
  <NextActionCard 
    action={getNextAction(userJourney)}
    onStart={handleStartAction}
  />
  
  {/* Voortgang Snapshot */}
  <ProgressSnapshot 
    phase={currentPhase}
    streak={streak}
    badges={recentBadges}
  />
  
  {/* Coach Tip */}
  <CoachTipCard tip={dailyTip} />
  
  {/* Snelle Toegang */}
  <QuickAccess recentTools={recentlyUsed} />
</div>
```

### 2.3 NextActionCard Logic

```typescript
function getNextAction(journey: UserJourney): NextAction {
  // Prioriteit volgorde:
  // 1. Onvoltooide items in huidige fase
  // 2. Volgende fase unlocken
  // 3. Dagelijkse check-in
  // 4. Suggestie van coach
  
  if (journey.currentPhaseIncomplete) {
    return {
      type: 'continue',
      title: journey.nextItem.title,
      description: `Ga verder met ${journey.currentPhase.name}`,
      action: journey.nextItem.href,
      duration: journey.nextItem.duration
    };
  }
  
  // etc.
}
```

---

## SPRINT 3: HET PAD

### 3.1 Fase Structuur

**Locatie:** `/lib/pad/phases.ts`

```typescript
export const PHASES = [
  {
    id: 1,
    name: "Fundament",
    slug: "fundament",
    description: "Ken jezelf voordat je anderen leert kennen",
    duration: "Week 1",
    icon: "🧠",
    items: [
      {
        id: "emotional-ready-scan",
        type: "tool",
        name: "Emotionele Ready Scan",
        description: "Ben je klaar voor dating?",
        duration: "15 min",
        required: true,
        href: "/tools/emotional-ready-scan"
      },
      {
        id: "attachment-scan",
        type: "tool",
        name: "Hechtingsstijl QuickScan",
        description: "Ontdek hoe je verbindt",
        duration: "20 min",
        required: true,
        href: "/tools/attachment-scan"
      },
      {
        id: "course-dating-dna",
        type: "course",
        name: "Mini-cursus: Jouw Dating DNA",
        description: "Begrijp je resultaten",
        duration: "15 min",
        required: true,
        href: "/courses/dating-dna"
      },
      {
        id: "dating-archetypes",
        type: "tool",
        name: "Dating Archetypes",
        description: "Jouw energie type",
        duration: "10 min",
        required: false,
        href: "/tools/dating-archetypes"
      }
    ],
    badge: {
      id: "self-aware-dater",
      name: "Self-Aware Dater",
      icon: "🏆"
    },
    unlockCondition: null
  },
  {
    id: 2,
    name: "Profiel",
    slug: "profiel",
    description: "Laat zien wie je bent",
    duration: "Week 2-3",
    icon: "📸",
    items: [
      {
        id: "foto-analyse",
        type: "tool",
        name: "Foto Analyse",
        description: "Welke foto's werken?",
        duration: "15 min",
        required: true,
        href: "/tools/foto-analyse"
      },
      {
        id: "course-photo-psychology",
        type: "course",
        name: "De Psychologie van Foto's",
        description: "Waarom sommige foto's werken",
        duration: "20 min",
        required: true,
        href: "/courses/photo-psychology"
      },
      {
        id: "profiel-bouwer",
        type: "tool",
        name: "Profiel Bouwer",
        description: "Schrijf een bio die werkt",
        duration: "20 min",
        required: true,
        href: "/tools/profiel-bouwer"
      },
      {
        id: "platform-match",
        type: "tool",
        name: "Platform Match",
        description: "Kies de juiste app",
        duration: "10 min",
        required: false,
        href: "/tools/platform-match"
      }
    ],
    badge: {
      id: "profile-pro",
      name: "Profile Pro",
      icon: "📸"
    },
    unlockCondition: { phase: 1, requiredItemsCompleted: true }
  },
  {
    id: 3,
    name: "Communicatie",
    slug: "communicatie",
    description: "Voer gesprekken die verbinden",
    duration: "Week 3-4",
    icon: "💬",
    items: [
      {
        id: "dating-stijl-scan",
        type: "tool",
        name: "Dating Stijl Scan",
        description: "Hoe communiceer jij?",
        duration: "15 min",
        required: true,
        href: "/tools/dating-stijl-scan"
      },
      {
        id: "course-first-message",
        type: "course",
        name: "Het Perfecte Eerste Bericht",
        description: "Openers die werken",
        duration: "25 min",
        required: true,
        href: "/courses/first-message"
      },
      {
        id: "openingszinnen",
        type: "tool",
        name: "Openingszinnen Generator",
        description: "Praktijk: maak openers",
        duration: "10 min",
        required: true,
        href: "/tools/openingszinnen"
      },
      {
        id: "course-conversations",
        type: "course",
        name: "Gesprekken die Verbinden",
        description: "Van opener naar date",
        duration: "30 min",
        required: true,
        href: "/courses/conversations"
      },
      {
        id: "ijsbrekers",
        type: "tool",
        name: "IJsbrekers Generator",
        description: "Gesprekstarters",
        duration: "10 min",
        required: false,
        href: "/tools/ijsbrekers"
      }
    ],
    badge: {
      id: "conversation-starter",
      name: "Conversation Starter",
      icon: "💬"
    },
    unlockCondition: { phase: 2, requiredItemsCompleted: true }
  },
  {
    id: 4,
    name: "Actief Daten",
    slug: "actief-daten",
    description: "Ga ervoor",
    duration: "Week 5+",
    icon: "🎯",
    items: [
      {
        id: "chat-coach-intro",
        type: "tool",
        name: "Chat Coach",
        description: "24/7 hulp bij gesprekken",
        duration: "Doorlopend",
        required: true,
        href: "/coach"
      },
      {
        id: "veiligheidscheck",
        type: "tool",
        name: "Veiligheidscheck",
        description: "Herken red flags",
        duration: "10 min",
        required: true,
        href: "/tools/veiligheidscheck"
      },
      {
        id: "course-chat-to-date",
        type: "course",
        name: "Van Chat naar Date",
        description: "De stap maken",
        duration: "25 min",
        required: true,
        href: "/courses/chat-to-date"
      },
      {
        id: "date-planner",
        type: "tool",
        name: "Date Planner",
        description: "Creatieve date ideeën",
        duration: "10 min",
        required: false,
        href: "/tools/date-planner"
      },
      {
        id: "gespreksassistent",
        type: "tool",
        name: "GespreksAssistent",
        description: "Feedback op je chats",
        duration: "15 min",
        required: false,
        href: "/tools/gespreksassistent"
      }
    ],
    badge: {
      id: "active-dater",
      name: "Active Dater",
      icon: "🎯"
    },
    unlockCondition: { phase: 3, requiredItemsCompleted: true }
  },
  {
    id: 5,
    name: "Verdieping",
    slug: "verdieping",
    description: "Begrijp je patronen",
    duration: "Na 4+ weken",
    icon: "🔮",
    items: [
      {
        id: "blind-vlek-scan",
        type: "tool",
        name: "Blind Vlek Scan",
        description: "Ontdek onbewuste patronen",
        duration: "25 min",
        required: true,
        href: "/tools/blind-vlek-scan"
      },
      {
        id: "course-attraction-patterns",
        type: "course",
        name: "Waarom Je Valt op Wie Je Valt",
        description: "Diepe patronen begrijpen",
        duration: "40 min",
        required: true,
        href: "/courses/attraction-patterns"
      },
      {
        id: "course-rejection",
        type: "course",
        name: "Omgaan met Afwijzing",
        description: "Veerkracht bouwen",
        duration: "30 min",
        required: false,
        href: "/courses/rejection"
      },
      {
        id: "match-analyse",
        type: "tool",
        name: "Match Analyse",
        description: "Waarom wel/niet?",
        duration: "15 min",
        required: false,
        href: "/tools/match-analyse"
      }
    ],
    badge: {
      id: "dating-master",
      name: "Dating Master",
      icon: "👑"
    },
    unlockCondition: { phase: 4, weeksActive: 4 }
  }
];
```

### 3.2 Pad Overview Page

**Locatie:** `/app/(main)/pad/page.tsx`

Visual journey met alle fases, locked/unlocked states, progress indicators.

### 3.3 Fase Detail Page

**Locatie:** `/app/(main)/pad/[fase]/page.tsx`

Items binnen fase met checkmarks, progress bar, badge preview.

---

## SPRINT 4: GAMIFICATION & INTEGRATIE

### 4.1 Streak Systeem

**Locatie:** `/lib/gamification/streaks.ts`

```typescript
interface Streak {
  current: number;
  longest: number;
  lastCheckIn: Date;
}

// Dagelijkse check-in opties:
// - Log stemming
// - Doe micro-actie (2 min)
// - Chat met coach
// - Voltooi tool/cursus item
```

### 4.2 Badge Systeem

**Locatie:** `/lib/gamification/badges.ts`

```typescript
const BADGES = {
  // Fundament
  'self-aware-dater': {
    name: 'Self-Aware Dater',
    icon: '🏆',
    condition: 'Fase 1 compleet'
  },
  'safety-first': {
    name: 'Safety First',
    icon: '🛡️',
    condition: 'Veiligheidscheck voltooid'
  },
  
  // Actie
  'first-move': {
    name: 'First Move',
    icon: '💬',
    condition: 'Eerste opener verstuurd'
  },
  
  // Commitment
  'week-warrior': {
    name: 'Week Warrior',
    icon: '🔥',
    condition: '7 dagen streak'
  },
  'month-master': {
    name: 'Month Master',
    icon: '🔥🔥',
    condition: '30 dagen streak'
  },
  
  // etc.
};
```

### 4.3 Weekly Challenges

```typescript
const WEEKLY_CHALLENGES = [
  {
    id: 'opener-challenge',
    name: 'Opener Challenge',
    description: 'Stuur 5 persoonlijke openers',
    target: 5,
    reward: { type: 'badge', value: 'opener-master' }
  },
  {
    id: 'conversation-challenge',
    name: 'Conversation Challenge',
    description: 'Voer 3 gesprekken van 10+ berichten',
    target: 3,
    reward: { type: 'bonus_messages', value: 25 }
  }
];
```

---

## DATABASE UITBREIDING

```sql
-- User Journey Progress
CREATE TABLE user_journey (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  current_phase INT DEFAULT 1,
  phase_started_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fase Item Completions  
CREATE TABLE user_phase_items (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  phase_id INT NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  score JSONB,
  UNIQUE(user_id, item_id)
);

-- Badges
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  badge_id VARCHAR(255) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Streaks
CREATE TABLE user_streaks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_check_in DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach Context Cache
CREATE TABLE coach_context_cache (
  user_id VARCHAR(255) PRIMARY KEY,
  context JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## IMPLEMENTATIE VOLGORDE

```
WEEK 1-2: Sprint 1 - AI Coach Upgrade
├── Dag 1-2: Coach interface (/app/coach)
├── Dag 3-4: Coach prompts & context
├── Dag 5: Tool routing basics
└── Test & iterate

WEEK 2-3: Sprint 2 - Navigatie & Home
├── Dag 1: Bottom nav component
├── Dag 2-3: Home page met NextAction
├── Dag 4: Layout restructure
└── Test & iterate

WEEK 3-4: Sprint 3 - Het Pad
├── Dag 1-2: Fase structuur & data
├── Dag 3-4: Pad pages
├── Dag 5: Progress tracking
└── Test & iterate

WEEK 4-5: Sprint 4 - Gamification
├── Dag 1-2: Streak systeem
├── Dag 3: Badge systeem  
├── Dag 4: Challenges
├── Dag 5: Final integration
└── Full test
```

---

## START INSTRUCTIE VOOR CLAUDE CODE

Open je terminal in de project folder en run:

```
claude
```

Eerste prompt:

```
Lees het bestand MASTERPLAN_DRIE_LAGEN_MODEL.md in de project root 
(of waar het staat). Dit bevat het complete implementatieplan.

Analyseer daarna de huidige projectstructuur:
1. Waar staat de chat-coach/Iris logica?
2. Hoe is de navigatie opgebouwd?
3. Welke tools bestaan er al?
4. Wat is het database schema?

Geef me een overzicht en dan beginnen we met Sprint 1: 
de AI Coach interface upgraden.
```
