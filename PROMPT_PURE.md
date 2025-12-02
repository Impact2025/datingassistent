# CONTEXT

Je bent een senior full-stack developer die een wereldklasse onboarding bouwt voor DatingAssistent.nl — een Nederlands dating coaching platform.

## Project Setup
- Framework: Next.js 15 met App Router
- Taal: TypeScript
- Database: PostgreSQL (Neon)
- Styling: Tailwind CSS
- Authenticatie: Bestaat al (users tabel aanwezig)
- Payments: Mollie (komt later, nu mock)

## Wat al bestaat
- Homepage met 3 programma's (Kickstart €47, Transformatie €147, VIP €497)
- Users tabel met basis authenticatie
- Programs tabel met de 3 programma's
- Basis dashboard layout

## Wat je gaat bouwen
Een complete post-purchase onboarding flow die nieuwe betalende klanten door een persoonlijke kennismaking leidt en ze naar hun eerste actie brengt.

---

# DE ONBOARDING FLOW

## Route Structuur

```
/onboarding
  /welcome          → Stap 1: Welkom + confetti
  /intake           → Stap 2: Persoonlijke intake (3 vragen)
  /roadmap          → Stap 3: Gepersonaliseerde roadmap
  
/dashboard          → Stap 4: Gepersonaliseerd dashboard (eerste bezoek)
/tools/[slug]       → Stap 5: Eerste tool gebruik
```

## Flow Logica

```
Betaling succesvol
       ↓
  /onboarding/welcome (confetti, Iris video placeholder, naam)
       ↓
  /onboarding/intake (3 vragen in chat-stijl)
       ↓
  /onboarding/roadmap (persoonlijk plan gebaseerd op antwoorden)
       ↓
  /dashboard (gepersonaliseerd, eerste actie highlighted)
       ↓
  /tools/profiel-analyse (of andere aanbevolen tool)
```

---

# TECHNISCHE SPECIFICATIES

## 1. Database Schema (Neon PostgreSQL)

Voeg deze tabellen toe:

```sql
-- User Onboarding State
CREATE TABLE user_onboarding (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,
  program_id INTEGER REFERENCES programs(id),
  
  -- Progress tracking
  current_step VARCHAR(50) DEFAULT 'welcome',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Intake antwoorden
  primary_goal TEXT,
  biggest_challenge VARCHAR(100),
  experience_level INTEGER, -- 1-3
  
  -- Afgeleide voorkeuren
  recommended_path VARCHAR(50), -- 'profile', 'conversation', 'dating', 'confidence'
  priority_tools TEXT[], -- ['profiel-analyse', 'bio-builder', etc]
  iris_personality VARCHAR(50) DEFAULT 'supportive',
  
  -- Engagement tracking
  first_tool_used VARCHAR(100),
  first_tool_completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Achievements
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  achievement_id VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  xp_awarded INTEGER DEFAULT 0,
  
  UNIQUE(user_id, achievement_id)
);

-- User Progress & XP
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 2. API Routes

```typescript
// POST /api/onboarding/start
// Maakt user_onboarding record aan na succesvolle betaling
// Input: { userId, programId }
// Output: { success, redirectUrl: '/onboarding/welcome' }

// GET /api/onboarding/status
// Haalt huidige onboarding status op
// Output: { currentStep, intake, recommendedPath, ... }

// POST /api/onboarding/intake
// Slaat intake antwoorden op + berekent recommended path
// Input: { userId, primaryGoal, biggestChallenge, experienceLevel }
// Output: { recommendedPath, priorityTools, irisPersonality }

// POST /api/onboarding/complete
// Markeert onboarding als voltooid
// Output: { success, achievements: [...] }

// GET /api/dashboard/personalized
// Haalt gepersonaliseerde dashboard data op
// Output: { priorityAction, progress, achievements, irisMessages }
```

## 3. Recommendation Algorithm

```typescript
// utils/getRecommendedPath.ts

interface IntakeData {
  primaryGoal: string;
  biggestChallenge: string;
  experienceLevel: number;
}

export function getRecommendedPath(intake: IntakeData): {
  path: 'profile' | 'conversation' | 'dating' | 'confidence';
  priorityTools: string[];
  irisPersonality: 'supportive' | 'direct' | 'motivational';
} {
  const { biggestChallenge, experienceLevel } = intake;
  
  // Path bepalen op basis van grootste uitdaging
  const pathMap: Record<string, string> = {
    'weinig-matches': 'profile',
    'gesprekken-dood': 'conversation', 
    'geen-dates': 'dating',
    'geen-zelfvertrouwen': 'confidence',
    'fotos-niet-goed': 'profile',
    'weet-niet-wat-zeggen': 'conversation',
  };
  
  const path = pathMap[biggestChallenge] || 'profile';
  
  // Priority tools per path
  const toolsMap: Record<string, string[]> = {
    'profile': ['profiel-analyse', 'bio-builder', 'foto-coach'],
    'conversation': ['chat-coach', 'eerste-bericht', 'gespreksstarters'],
    'dating': ['date-prep', 'gespreksonderwerpen', 'date-coach'],
    'confidence': ['zelfbeeld-analyse', 'affirmaties', 'profiel-analyse'],
  };
  
  // Iris personality op basis van ervaring
  const personality = experienceLevel === 1 
    ? 'supportive' 
    : experienceLevel === 2 
      ? 'motivational' 
      : 'direct';
  
  return {
    path,
    priorityTools: toolsMap[path],
    irisPersonality: personality,
  };
}
```

## 4. Achievement Definitions

```typescript
// lib/achievements.ts

export const ACHIEVEMENTS = {
  FIRST_STEP: {
    id: 'first_step',
    name: 'Eerste Stap',
    description: 'Je bent begonnen aan je transformatie',
    icon: '🚀',
    xp: 50,
  },
  QUICK_STARTER: {
    id: 'quick_starter', 
    name: 'Quick Starter',
    description: 'Onboarding voltooid binnen 10 minuten',
    icon: '⚡',
    xp: 100,
  },
  PHOTO_WARRIOR: {
    id: 'photo_warrior',
    name: 'Foto Warrior', 
    description: 'Je eerste foto-analyse voltooid',
    icon: '📸',
    xp: 75,
  },
  BIO_BUILDER: {
    id: 'bio_builder',
    name: 'Bio Builder',
    description: 'Je eerste bio gegenereerd',
    icon: '✍️',
    xp: 75,
  },
};
```

---

# PAGE SPECIFICATIES

## Stap 1: Welcome Page (`/onboarding/welcome`)

```tsx
// Elementen:
// 1. Confetti animatie (canvas-confetti library)
// 2. Iris video placeholder (16:9 container met play button)
// 3. Welkom tekst met {firstName} uit database
// 4. "Dit gaan we doen" preview (3 stappen)
// 5. CTA button "Start met Iris →"

// State:
// - Haal user data op (naam, programma)
// - Check of onboarding al gestart is

// Design:
// - Centered layout
// - Confetti bij page load (3 seconden)
// - Grote Iris avatar of video container
// - Warme kleuren, feestelijke sfeer
```

### Video Placeholder Component

```tsx
// components/IrisVideoPlaceholder.tsx
// Voor nu: toont een placeholder met Iris avatar
// Later: vervangen door echte HeyGen video's

interface IrisVideoPlaceholderProps {
  videoId: string; // 'welcome', 'intake-intro', 'roadmap-profile', etc.
  fallbackText: string; // Tekst die Iris zou zeggen
  onComplete?: () => void;
}

// Placeholder toont:
// - Iris avatar (grote cirkel met afbeelding of gradient)
// - Speech bubble met fallbackText
// - "Video komt binnenkort" badge (klein, subtiel)
// - Play button styling (voor later)
```

## Stap 2: Intake Page (`/onboarding/intake`)

```tsx
// Chat-achtige interface, GEEN formulier

// Flow:
// 1. Iris video/avatar + "Ik wil je beter leren kennen"
// 2. Vraag 1: "Wat wil je bereiken?" (open input)
// 3. Iris reactie + Vraag 2: "Wat houdt je tegen?" (chips/buttons)
// 4. Iris reactie + Vraag 3: "Je ervaring?" (slider)
// 5. "Ik maak je plan..." loading state
// 6. Redirect naar /roadmap

// Chips voor vraag 2:
const challengeOptions = [
  { value: 'weinig-matches', label: 'Ik krijg te weinig matches' },
  { value: 'gesprekken-dood', label: 'Gesprekken lopen dood' },
  { value: 'geen-dates', label: 'Ik durf geen dates te plannen' },
  { value: 'weet-niet-wat-zeggen', label: 'Ik weet niet wat ik moet zeggen' },
  { value: 'fotos-niet-goed', label: 'Mijn foto\'s zijn niet goed' },
  { value: 'geen-zelfvertrouwen', label: 'Ik mis zelfvertrouwen' },
];

// Design:
// - Chat bubbles (Iris links, user rechts)
// - Typing indicator bij Iris responses
// - Smooth scroll naar nieuwe berichten
// - Progress indicator bovenaan (stap 2/4)
```

## Stap 3: Roadmap Page (`/onboarding/roadmap`)

```tsx
// Elementen:
// 1. Iris video placeholder (roadmap variant based on path)
// 2. "Jouw Persoonlijke Transformatie" header
// 3. Subheader: "Gebaseerd op: {biggestChallenge}"
// 4. Animated timeline (3 fasen)
// 5. Iris recommendation box
// 6. CTA "Bekijk mijn dashboard →"

// Timeline component:
// - Week 1-3: Fundament (tools gebaseerd op path)
// - Week 4-8: Connectie
// - Week 9-12: Dates
// - Staggered reveal animatie (fase voor fase)

// Design:
// - Verticale timeline met connecting line
// - Fase cards met icon, titel, focus, tools
// - Huidige fase highlighted
// - Locked fases subtiel grayed out
```

## Stap 4: Dashboard (eerste bezoek)

```tsx
// Detecteer eerste bezoek via user_onboarding.completed_at

// Eerste bezoek elementen:
// 1. Welkom banner (dismissable) met Iris video placeholder
// 2. Priority Action card (highlighted, gebaseerd op path)
// 3. Transformatie progress (3 fasen, fase 1 = 0%)
// 4. Stats preview (dagen actief: 1, tools: 0, voltooid: 0%)
// 5. Iris chat widget (proactief bericht)

// Priority Action gebaseerd op recommended_path:
const priorityActions = {
  'profile': {
    tool: 'profiel-analyse',
    headline: 'Je Eerste Stap: AI Profiel Analyse',
    iris: 'Begin hier. Dit is de snelste manier om meer matches te krijgen.',
  },
  'conversation': {
    tool: 'chat-coach',
    headline: 'Je Eerste Stap: Chat Coach', 
    iris: 'Laten we je gesprekken naar een hoger niveau tillen.',
  },
  'dating': {
    tool: 'date-prep',
    headline: 'Je Eerste Stap: Date Prep',
    iris: 'Je bent klaar voor de volgende stap. Laten we je voorbereiden.',
  },
  'confidence': {
    tool: 'zelfbeeld-analyse',
    headline: 'Je Eerste Stap: Zelfbeeld Analyse',
    iris: 'Laten we beginnen bij de basis: wie jij bent.',
  },
};
```

## Stap 5: First Tool Experience

```tsx
// Op /tools/[slug] pagina, detecteer eerste gebruik

// Eerste gebruik elementen:
// 1. Iris video placeholder (tool-specifiek)
// 2. Guided intro tekst
// 3. Tool interface (bestaand)
// 4. Na completion: celebration + achievement popup
// 5. "Volgende stap" suggestie van Iris

// Achievement popup:
// - Confetti (klein)
// - Achievement icon + naam
// - XP awarded
// - "Ga door" button
```

---

# COMPONENTEN TE BOUWEN

```
components/
  onboarding/
    ConfettiCelebration.tsx    → Canvas confetti wrapper
    IrisVideoPlaceholder.tsx   → Video placeholder met avatar fallback
    IrisAvatar.tsx             → Circulaire Iris afbeelding (gradient als placeholder)
    IrisSpeechBubble.tsx       → Chat bubble voor Iris berichten
    IntakeChat.tsx             → Chat-style intake interface
    IntakeChips.tsx            → Selecteerbare opties
    IntakeSlider.tsx           → Ervaring level slider
    RoadmapTimeline.tsx        → Animated verticale timeline
    PhaseCard.tsx              → Individuele fase in timeline
    ProgressBar.tsx            → Algemene progress bar
    WelcomeBanner.tsx          → Dismissable welkom banner
    PriorityActionCard.tsx     → Highlighted actie card
    AchievementPopup.tsx       → Achievement earned popup
    StatsCard.tsx              → Kleine stat display
    
  dashboard/
    PersonalizedDashboard.tsx  → Dashboard wrapper met personalisatie
    TransformationProgress.tsx → 3-fase progress display
    IrisChatWidget.tsx         → Floating chat widget
```

---

# STYLING RICHTLIJNEN

## Kleuren (Tailwind)

```typescript
// DatingAssistent brand colors - gebruik deze in Tailwind classes
// Primary (roze/magenta): bg-pink-500, hover:bg-pink-600, text-pink-500
// Secondary (paars): bg-purple-600, text-purple-600
// Iris paars: bg-violet-500, from-violet-500, to-pink-500

// Voorbeelden:
// CTA buttons: bg-pink-500 hover:bg-pink-600 text-white
// Iris gradient: bg-gradient-to-r from-violet-500 to-pink-500
// Cards: bg-white rounded-2xl shadow-lg border border-gray-100
// Text: text-gray-900 (primary), text-gray-500 (muted)
```

## Component Styling Voorbeelden

```tsx
// Primary Button
<button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl">
  Start nu →
</button>

// Card
<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">

// Iris Avatar Placeholder (gradient cirkel)
<div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
  I
</div>

// Progress Bar
<div className="bg-gray-200 rounded-full h-2 overflow-hidden">
  <div 
    className="bg-pink-500 rounded-full h-2 transition-all duration-500" 
    style={{ width: '30%' }} 
  />
</div>

// Chat Bubble (Iris)
<div className="flex gap-3">
  <IrisAvatar size="sm" />
  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
    <p className="text-gray-800">Iris tekst hier...</p>
  </div>
</div>

// Chat Bubble (User)
<div className="flex gap-3 justify-end">
  <div className="bg-pink-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md">
    <p>User tekst hier...</p>
  </div>
</div>

// Highlighted Card (Priority Action)
<div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl p-6 border-2 border-pink-200 shadow-lg">
  <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">
    ⭐ Aanbevolen door Iris
  </span>
  ...
</div>
```

---

# BELANGRIJK

## Video Placeholders
Alle Iris video's zijn PLACEHOLDERS voor nu. Bouw een `IrisVideoPlaceholder` component die:
1. Een container toont met correcte aspect ratio (16:9 of 1:1)
2. Iris avatar in het midden (gradient cirkel met "I" of paars/roze gradient)
3. De `fallbackText` als speech bubble eronder
4. Later makkelijk te vervangen is door echte `<video>` element

```tsx
// Voorbeeld implementatie:
function IrisVideoPlaceholder({ videoId, fallbackText }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
        <span className="text-white text-3xl font-bold">I</span>
      </div>
      
      {/* Speech bubble */}
      <div className="bg-white rounded-2xl px-6 py-4 shadow-md max-w-md text-center">
        <p className="text-gray-700">{fallbackText}</p>
      </div>
    </div>
  );
}
```

## Eerst Werkend, Dan Mooi
1. Bouw eerst de complete flow (alle routes, basis UI)
2. Dan pas de animaties en polish
3. Video's komen later

## Database Migraties
Voer eerst de SQL migraties uit voordat je de pagina's bouwt.

## Taal
Alle UI teksten in het NEDERLANDS. Geen Engelse teksten in de interface.

## Confetti
Installeer `canvas-confetti`:
```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

---

# START INSTRUCTIE

Begin met:

1. **Database**: Voer de SQL migraties uit (tabellen aanmaken)
2. **Packages**: Installeer canvas-confetti
3. **Componenten**: Bouw de basis componenten (IrisVideoPlaceholder, IrisAvatar, ConfettiCelebration)
4. **API routes**: Bouw de 4 API endpoints
5. **Welcome page**: `/onboarding/welcome`
6. **Intake page**: `/onboarding/intake` 
7. **Roadmap page**: `/onboarding/roadmap`
8. **Dashboard aanpassingen**: Eerste bezoek detectie + personalisatie
9. **Polish**: Animaties, transitions, responsive

Vraag mij om verduidelijking als iets onduidelijk is. Bouw dit als een pro — dit moet wereldklasse worden.
