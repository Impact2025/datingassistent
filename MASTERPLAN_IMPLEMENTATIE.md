# 🚀 DATINGASSISTENT.NL — WERELDKLASSE IMPLEMENTATIE MASTERPLAN

**Versie:** 1.0
**Datum:** 1 December 2025
**Status:** Ready to Execute
**Doel:** Platform lanceerklaar maken met transformatie-gebaseerde programma's

---

## 📋 EXECUTIVE SUMMARY

### Missie
Transform DatingAssistent.nl van een tool-platform naar een **transformatie-platform** met 3 outcome-gebaseerde programma's die singles helpen succesvol te daten.

### Kern Transformatie
```
VAN: "23 AI tools platform"
NAAR: "90 dagen transformatie met Iris als je persoonlijke coach"
```

### Succes Metrics
- ✅ 3 programma's live en koopbaar
- ✅ Outcome-gebaseerde messaging overal
- ✅ Onboarding quiz → aanbeveling → aankoop flow
- ✅ Eerste 10 beta klanten binnen 2 weken

---

## 🎯 STRATEGISCHE PIJLERS

### 1. Transformatie > Tools
**Principe**: We verkopen geen toegang tot tools, maar resultaten.

**Voor elke feature vragen we:**
- Welk probleem lost dit op?
- Welk tastbaar resultaat bereikt de gebruiker?
- Hoe meten we succes?

### 2. Iris als Gids
**Principe**: Iris is de verpersoonlijking van 10+ jaar expertise.

**Iris is:**
- ✅ Persoonlijke coach die meekijkt
- ✅ 24/7 beschikbare expert
- ✅ Menselijk, empathisch, professioneel

**Iris is NIET:**
- ❌ Een chatbot
- ❌ Een verzameling tools
- ❌ Een vervanging van menselijk contact

### 3. De Reis = Het Product
**Principe**: De 3-fase transformatie is wat we verkopen.

```
FASE 1: Fundament (Week 1-3)
├─ Probleem: Onzichtbaar profiel
├─ Oplossing: Profiel dat past én aantrekt
└─ Bewijs: 3x meer profielweergaven

FASE 2: Connectie (Week 4-8)
├─ Probleem: Matches die doodlopen
├─ Oplossing: Gesprekken die vloeien
└─ Bewijs: 80% response rate

FASE 3: Dates (Week 9-12)
├─ Probleem: Eindeloos chatten
├─ Oplossing: Dates met zelfvertrouwen
└─ Bewijs: Eerste dates gepland
```

---

## 🏗️ IMPLEMENTATIE ROADMAP

### FASE A: FUNDAMENT (Week 1-2) ⚡ PRIORITEIT
**Doel**: Database + programma's klaar voor lancering

#### A1. Database Schema Upgrade
**Status**: 🔴 Te bouwen

**Tabellen**:
```sql
-- Programma's (outcome-based)
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline TEXT NOT NULL,              -- "Binnen 3 weken een profiel dat werkt"
  transformation_promise TEXT NOT NULL, -- De kern belofte
  price_regular INTEGER NOT NULL,
  price_beta INTEGER,
  duration_days INTEGER NOT NULL,
  outcome_category VARCHAR(50),        -- 'fundament', 'connectie', 'dates'
  target_audience TEXT NOT NULL,
  tangible_proof TEXT NOT NULL,        -- "Gemiddeld 3x meer matches"
  tier VARCHAR(20) NOT NULL,           -- 'kickstart', 'transformatie', 'vip', 'alumni'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Programma Outcomes (uitkomsten per programma)
CREATE TABLE program_outcomes (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id),
  outcome_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  icon VARCHAR(50),                    -- 'check', 'star', 'trophy'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Programma Features (als onderdeel van reis)
CREATE TABLE program_features (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id),
  feature_text TEXT NOT NULL,
  feature_type VARCHAR(50),            -- 'video', 'tool', 'support', 'community'
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Programs (aankopen)
CREATE TABLE user_programs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  program_id INTEGER REFERENCES programs(id),
  purchased_at TIMESTAMP DEFAULT NOW(),
  price_paid INTEGER NOT NULL,
  access_until TIMESTAMP,              -- Toegang tot datum
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'expired'
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Program Upsells
CREATE TABLE program_upsells (
  id SERIAL PRIMARY KEY,
  from_program_id INTEGER REFERENCES programs(id),
  to_program_id INTEGER REFERENCES programs(id),
  discount_amount INTEGER,
  timing VARCHAR(50),                  -- 'during', 'after_completion'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Seed Data**:
```typescript
// KICKSTART
{
  slug: 'kickstart',
  name: 'De Kickstart',
  tagline: 'Binnen 3 weken een profiel dat de juiste mensen aantrekt',
  transformation_promise: 'Van onzichtbaar naar opvallend in 21 dagen',
  price_regular: 9700,  // €97
  price_beta: 4700,     // €47
  duration_days: 30,
  outcome_category: 'fundament',
  target_audience: 'Je hebt weinig/geen matches en weet niet waarom',
  tangible_proof: 'Gemiddeld 3x meer matches na week 3',
  tier: 'kickstart'
}

// TRANSFORMATIE
{
  slug: 'transformatie',
  name: 'De Transformatie',
  tagline: 'In 90 dagen van onzeker swiper naar zelfverzekerde dater',
  transformation_promise: 'De complete reis van profiel tot date',
  price_regular: 29700,  // €297
  price_beta: 14700,     // €147
  duration_days: 90,
  outcome_category: 'complete',
  target_audience: 'Je wilt écht leren daten, niet alleen trucs',
  tangible_proof: '85% heeft minimaal 1 date binnen 90 dagen',
  tier: 'transformatie'
}

// VIP
{
  slug: 'vip-reis',
  name: 'De VIP Reis',
  tagline: 'Persoonlijke begeleiding totdat je succesvol date',
  transformation_promise: 'Expert kijkt mee met jouw specifieke situatie',
  price_regular: 99700,  // €997
  price_beta: 49700,     // €497
  duration_days: 180,
  outcome_category: 'premium',
  target_audience: 'Je wilt niet alleen leren, je wilt iemand die meekijkt',
  tangible_proof: '100% rapporteert meer zelfvertrouwen',
  tier: 'vip'
}
```

#### A2. API Endpoints
**Status**: 🔴 Te bouwen

```typescript
// /api/programs/route.ts - Lijst alle programma's
GET /api/programs
Response: { programs: Program[] }

// /api/programs/[slug]/route.ts - Detail van 1 programma
GET /api/programs/kickstart
Response: {
  program: Program,
  outcomes: Outcome[],
  features: Feature[],
  upsells: Upsell[]
}

// /api/programs/purchase/route.ts - Koop een programma
POST /api/programs/purchase
Body: { programId, userId, couponCode? }
Response: {
  success: boolean,
  userProgram: UserProgram,
  paymentUrl: string
}

// /api/programs/user/route.ts - Programma's van user
GET /api/programs/user
Response: { userPrograms: UserProgram[] }
```

---

### FASE B: HOMEPAGE TRANSFORMATIE (Week 2) 🎨
**Doel**: Outcome-gebaseerde homepage live

#### B1. Hero Section
```tsx
<section className="hero">
  <h1>Van onzeker swiper naar zelfverzekerde dater</h1>
  <p>In 90 dagen met Iris als je persoonlijke AI dating coach</p>
  <Button href="/onboarding">START GRATIS SCAN</Button>

  <SocialProof>
    • 10+ jaar ervaring
    • Duizenden mensen geholpen
    • Bekend van The Undateables
  </SocialProof>
</section>
```

#### B2. De 3 Reizen Section
```tsx
<section className="programs">
  <h2>Kies jouw reis</h2>

  <ProgramCard tier="kickstart">
    <Badge>€97 / Beta €47</Badge>
    <h3>De Kickstart</h3>
    <p className="tagline">Binnen 3 weken een profiel dat werkt</p>

    <Outcomes>
      ✓ Foto's die werken (niet meer raden)
      ✓ Bio die gesprekken start
      ✓ Weten welk platform bij je past
    </Outcomes>

    <Proof>"Gemiddeld 3x meer matches na week 3"</Proof>

    <Button>Start met Kickstart</Button>
  </ProgramCard>

  <ProgramCard tier="transformatie" featured>
    <Badge variant="primary">⭐ €297 / Beta €147</Badge>
    <h3>De Transformatie</h3>
    <p className="tagline">In 90 dagen van swiper naar dater</p>

    <Outcomes>
      ✓ Profiel dat past bij wie je bent
      ✓ Gesprekken die vloeien
      ✓ Dates plannen zonder angst
    </Outcomes>

    <Proof>"85% heeft minimaal 1 date binnen 90 dagen"</Proof>

    <Button variant="primary">Start transformatie</Button>
  </ProgramCard>

  <ProgramCard tier="vip">
    <Badge>€997 / Beta €497</Badge>
    <h3>De VIP Reis</h3>
    <p className="tagline">Persoonlijke begeleiding tot je date hebt</p>

    <Outcomes>
      ✓ Expert kijkt mee met jouw situatie
      ✓ 1-op-1 coaching calls
      ✓ Video profiel-audit
    </Outcomes>

    <Proof>"100% rapporteert meer zelfvertrouwen"</Proof>

    <Button>Upgrade naar VIP</Button>
  </ProgramCard>
</section>
```

#### B3. Ontmoet Iris Section
```tsx
<section className="meet-iris">
  <h2>Ontmoet Iris, je persoonlijke dating coach</h2>

  <HeyGenVideo src="/videos/iris-intro.mp4" />

  <IrisFeatures>
    • 24/7 beschikbaar
    • 10+ jaar ervaring gebundeld
    • Persoonlijk advies voor jouw situatie
  </IrisFeatures>

  <p>
    "Iris is niet zomaar AI. Het is de kennis van duizenden
    geslaagde daters, altijd bij de hand."
  </p>
</section>
```

#### B4. Hoe Het Werkt Section
```tsx
<section className="how-it-works">
  <h2>Jouw reis in 3 fases</h2>

  <Phase number={1}>
    <h3>Fundament (Week 1-3)</h3>
    <p>Van onzichtbaar naar opvallend</p>
    <Transformation>
      Start: Profiel dat niemand ziet
      →
      Einde: Profiel dat matcht met wie je bent
    </Transformation>
    <Proof>3x meer profielweergaven</Proof>
  </Phase>

  <Phase number={2}>
    <h3>Connectie (Week 4-8)</h3>
    <p>Van match naar gesprek</p>
    <Transformation>
      Start: Matches die doodlopen
      →
      Einde: Gesprekken die vloeien
    </Transformation>
    <Proof>80% response rate</Proof>
  </Phase>

  <Phase number={3}>
    <h3>Dates (Week 9-12)</h3>
    <p>Van gesprek naar ontmoeting</p>
    <Transformation>
      Start: Eindeloos chatten
      →
      Einde: Dates met zelfvertrouwen
    </Transformation>
    <Proof>Eerste dates gepland</Proof>
  </Phase>
</section>
```

#### B5. Over Vincent Section
```tsx
<section className="about-vincent">
  <img src="/images/vincent.jpg" alt="Vincent van Munster" />

  <div>
    <h2>Vincent van Munster</h2>
    <h3>Oprichter DatingAssistent.nl</h3>

    <p>
      "Na meer dan 10 jaar duizenden singles helpen hun liefde
      te vinden, heb ik alle kennis gebundeld in Iris. Zodat
      iedereen toegang heeft tot persoonlijke dating coaching."
    </p>

    <Credentials>
      • 10+ jaar dating coach
      • Bekend van The Undateables (TV)
      • Duizenden mensen geholpen
    </Credentials>
  </div>
</section>
```

---

### FASE C: ONBOARDING FLOW (Week 3) 🎯
**Doel**: Quiz → Aanbeveling → Aankoop flow live

#### C1. Quiz Structure
```typescript
// Onboarding Quiz (7-10 vragen)
const quizQuestions = [
  {
    id: 'dating_goal',
    question: 'Wat is je grootste datingdoel op dit moment?',
    type: 'single-choice',
    options: [
      { value: 'more_matches', label: 'Meer matches krijgen', score: { kickstart: 3 } },
      { value: 'better_conversations', label: 'Betere gesprekken', score: { transformatie: 3 } },
      { value: 'get_dates', label: 'Écht dates plannen', score: { transformatie: 3 } },
      { value: 'relationship', label: 'Een relatie vinden', score: { vip: 2, transformatie: 2 } }
    ]
  },
  {
    id: 'current_struggle',
    question: 'Wat is je grootste uitdaging?',
    type: 'single-choice',
    options: [
      { value: 'profile', label: 'Mijn profiel trekt niemand', score: { kickstart: 3 } },
      { value: 'photos', label: 'Ik weet niet welke foto\'s', score: { kickstart: 3 } },
      { value: 'conversations', label: 'Gesprekken lopen dood', score: { transformatie: 3 } },
      { value: 'confidence', label: 'Ik durf niet te daten', score: { vip: 2, transformatie: 2 } }
    ]
  },
  {
    id: 'experience_level',
    question: 'Hoeveel ervaring heb je met online daten?',
    type: 'single-choice',
    options: [
      { value: 'beginner', label: 'Net begonnen', score: { kickstart: 2 } },
      { value: 'intermediate', label: 'Enige ervaring', score: { transformatie: 2 } },
      { value: 'experienced', label: 'Veel ervaring', score: { vip: 2 } }
    ]
  },
  {
    id: 'time_commitment',
    question: 'Hoeveel tijd kun je per week besteden?',
    type: 'single-choice',
    options: [
      { value: 'minimal', label: '1-2 uur', score: { kickstart: 2 } },
      { value: 'moderate', label: '3-5 uur', score: { transformatie: 2 } },
      { value: 'serious', label: '5+ uur', score: { vip: 2 } }
    ]
  },
  {
    id: 'investment_readiness',
    question: 'Wat past bij jou?',
    type: 'single-choice',
    options: [
      { value: 'quick_fix', label: 'Ik wil snel mijn profiel fixen', score: { kickstart: 3 } },
      { value: 'learn_skills', label: 'Ik wil echt leren daten', score: { transformatie: 3 } },
      { value: 'personal_guidance', label: 'Ik wil persoonlijke begeleiding', score: { vip: 3 } }
    ]
  }
];
```

#### C2. Recommendation Algorithm
```typescript
function calculateRecommendation(answers: QuizAnswer[]): ProgramRecommendation {
  const scores = {
    kickstart: 0,
    transformatie: 0,
    vip: 0
  };

  // Calculate scores
  answers.forEach(answer => {
    const question = quizQuestions.find(q => q.id === answer.questionId);
    const option = question?.options.find(o => o.value === answer.value);

    if (option?.score) {
      Object.entries(option.score).forEach(([program, points]) => {
        scores[program] += points;
      });
    }
  });

  // Determine recommendation
  const recommended = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0][0];

  return {
    primary: recommended,
    reasoning: generateReasoning(recommended, answers),
    alternatives: getAlternatives(recommended)
  };
}

function generateReasoning(program: string, answers: QuizAnswer[]): string {
  const reasoningMap = {
    kickstart: "Op basis van je antwoorden zie ik dat je vooral hulp nodig hebt bij je profiel. De Kickstart is perfect om binnen 3 weken een profiel te hebben dat werkt.",
    transformatie: "Je bent klaar voor de complete reis! Je wilt niet alleen je profiel fixen, maar echt leren daten. De Transformatie neemt je in 90 dagen mee van profiel tot dates.",
    vip: "Ik zie dat je serieus bent en persoonlijke aandacht waardeert. De VIP Reis geeft je expert begeleiding totdat je succesvol date."
  };

  return reasoningMap[program];
}
```

#### C3. Recommendation Page
```tsx
<section className="recommendation">
  <h1>Jouw perfecte reis: {program.name}</h1>

  <IrisMessage>
    <IrisAvatar />
    <p>{reasoning}</p>
  </IrisMessage>

  <ProgramHighlight program={program}>
    {/* Show full program details */}
  </ProgramHighlight>

  <SuccessStories program={program}>
    {/* Testimonials specific to this program */}
  </SuccessStories>

  <Pricing>
    <PriceTag regular={program.price_regular} beta={program.price_beta} />
    <BetaBadge>Beta lancering: 50% korting!</BetaBadge>
    <Guarantee>30 dagen geld-terug-garantie</Guarantee>
  </Pricing>

  <CTASection>
    <Button size="large" onClick={handlePurchase}>
      Start met {program.name}
    </Button>
    <Button variant="outline" onClick={showAlternatives}>
      Bekijk andere opties
    </Button>
  </CTASection>

  <FAQ programSpecific />
</section>
```

---

### FASE D: CONTENT STRUCTUUR (Week 4-5) 📚
**Doel**: Kickstart volledig uitgewerkt, Transformatie structuur klaar

#### D1. Module Structuur Herziening
```typescript
// Nieuwe module structuur (outcome-based)
interface Module {
  id: number;
  program_id: number;
  phase: 'fundament' | 'connectie' | 'dates';
  title: string;
  outcome_promise: string;  // "Na deze module heb je..."
  order_index: number;
  duration_estimate: string; // "1 week"
}

// Voorbeeld: Kickstart Module 1
{
  phase: 'fundament',
  title: 'Profiel Fundament',
  outcome_promise: 'Na deze module weet je precies welke foto\'s en bio tekst bij jou passen',
  duration_estimate: '1 week'
}
```

#### D2. Kickstart Content (21 dagen)
```markdown
# DE KICKSTART — CONTENT OUTLINE

## Week 1: Fundament
### Module 1: Profiel Analyse
- Les 1.1: Waarom je huidige profiel niet werkt (Video 7 min)
- Les 1.2: De 3 pijlers van een goed profiel (Video 8 min)
- Les 1.3: [TOOL] Profiel Scan met Iris (Interactive)
- Opdracht: Analyseer je huidige profiel

### Module 2: Foto Strategie
- Les 2.1: Foto's die matchen (niet catfishen) (Video 6 min)
- Les 2.2: De do's en don'ts (Video 7 min)
- Les 2.3: [TOOL] Foto Check met Iris (Interactive)
- Opdracht: Selecteer je 3 beste foto's

### Module 3: Bio Craft
- Les 3.1: Wat werkt en wat niet (Video 6 min)
- Les 3.2: Jouw unieke verhaal (Video 8 min)
- Les 3.3: [TOOL] Bio Generator met Iris (Interactive)
- Opdracht: Schrijf je nieuwe bio

## Week 2: Optimalisatie
### Module 4: Platform Keuze
- Les 4.1: Tinder vs Bumble vs Hinge (Video 7 min)
- Les 4.2: Waar vind je jouw match? (Video 6 min)
- Opdracht: Kies je primaire platform

### Module 5: Profiel Live Zetten
- Les 5.1: Je profiel updaten (Video 5 min)
- Les 5.2: De eerste 48 uur (Video 6 min)
- Les 5.3: [TOOL] IJsbreker Generator (Interactive)
- Opdracht: Profiel live + eerste matches

## Week 3: Eerste Resultaten
### Module 6: Analyse & Iteratie
- Les 6.1: Je resultaten meten (Video 6 min)
- Les 6.2: Wat aanpassen als het niet werkt (Video 7 min)
- Les 6.3: Live Q&A sessie (60 min)
- Opdracht: Resultaten delen in community

### Module 7: Volgende Stappen
- Les 7.1: Van match naar gesprek (preview) (Video 5 min)
- Les 7.2: Upgrade naar Transformatie? (Video 4 min)
```

---

### FASE E: DASHBOARD UPGRADE (Week 5-6) 📊
**Doel**: User ziet hun transformatie reis, niet een tool dashboard

#### E1. Dashboard Herstructuring
```tsx
// Oude dashboard: Tool-gecentreerd
<Dashboard>
  <Tools>
    <ToolCard name="Foto Check" />
    <ToolCard name="Bio Generator" />
    {/* 23 tools... */}
  </Tools>
</Dashboard>

// Nieuwe dashboard: Reis-gecentreerd
<Dashboard>
  <WelcomeSection>
    <h1>Hey {user.name}, welkom bij je {program.name}!</h1>
    <CurrentPhase phase={user.currentPhase} />
  </WelcomeSection>

  <TransformationProgress>
    <ProgressBar
      current={user.completion}
      phases={['Fundament', 'Connectie', 'Dates']}
    />
    <Milestone>
      "Je bent 45% op weg naar je eerste date!"
    </Milestone>
  </TransformationProgress>

  <NextSteps>
    <h2>Wat je nu moet doen</h2>
    <NextLesson lesson={nextLesson} />
    <RecommendedTool tool={contextualTool} />
  </NextSteps>

  <IrisInsights>
    <IrisMessage>
      "Ik zie dat je 3 matches hebt deze week!
      Laten we ze omzetten naar gesprekken."
    </IrisMessage>
    <SuggestedAction />
  </IrisInsights>

  <JourneyOverview>
    <Phase status="completed">Fundament ✓</Phase>
    <Phase status="in-progress">Connectie (Week 2/4)</Phase>
    <Phase status="locked">Dates</Phase>
  </JourneyOverview>
</Dashboard>
```

#### E2. Progress Tracking
```typescript
// Track meaningful progress
interface UserProgress {
  userId: number;
  programId: number;

  // Phase progress
  currentPhase: 'fundament' | 'connectie' | 'dates';
  completionPercentage: number;

  // Outcome metrics
  profileViews: number;
  matchCount: number;
  conversationCount: number;
  dateCount: number;

  // Engagement
  lessonsCompleted: number;
  toolsUsed: string[];
  lastActivity: Date;

  // Milestones reached
  milestones: {
    profile_optimized: boolean;
    first_match: boolean;
    first_conversation: boolean;
    first_date_planned: boolean;
  };
}
```

---

### FASE F: PAYMENTS & CHECKOUT (Week 6-7) 💳
**Doel**: Soepele aankoop flow met Mollie/Stripe

#### F1. Checkout Flow
```typescript
// /api/checkout/route.ts
POST /api/checkout
Body: {
  programId: number,
  userId: number,
  couponCode?: string
}

Response: {
  success: boolean,
  paymentUrl: string,  // Mollie/Stripe checkout URL
  orderId: string
}
```

#### F2. Payment Confirmation
```tsx
// /payment/success page
<PaymentSuccess>
  <ConfettiAnimation />

  <h1>Welkom bij {program.name}! 🎉</h1>

  <IrisWelcome>
    <IrisAvatar />
    <p>
      "Gefeliciteerd! Je hebt zojuist de eerste stap gezet
      naar succesvol daten. Laten we beginnen!"
    </p>
  </IrisWelcome>

  <NextSteps>
    <Step number={1}>
      Check je email voor de bevestiging
    </Step>
    <Step number={2}>
      Start vandaag nog met les 1
    </Step>
    <Step number={3}>
      Join de community en stel je voor
    </Step>
  </NextSteps>

  <Button href="/dashboard">
    Start je transformatie
  </Button>
</PaymentSuccess>
```

---

### FASE G: EMAIL FLOWS (Week 7-8) 📧
**Doel**: Automated onboarding & engagement emails

#### G1. Welkom Email (Immediate)
```markdown
Subject: Welkom bij DatingAssistent.nl! Hier begint jouw reis 🎉

Hoi {name},

Wat tof dat je ervoor hebt gekozen om met {program_name} te starten!

Je hebt zojuist de eerste stap gezet naar succesvol daten. En ik ga
je daar persoonlijk bij helpen.

**Wat nu?**

1. Log in op je dashboard: [Link]
2. Start met les 1: "{first_lesson_title}"
3. Stel jezelf voor in de community

Over 21/90 dagen kijk je terug op dit moment als het begin van
jouw dating succes. Ik kijk ernaar uit je te begeleiden!

Groeten,
Vincent & Iris

P.S. Heb je vragen? Iris is 24/7 bereikbaar in je dashboard.
```

#### G2. Progress Check-ins
```markdown
# Week 1 Check-in
Subject: Hoe gaat het, {name}? Iris checkt in 👋

# Week 4 Milestone
Subject: Je hebt 25% van {program_name} afgerond! 🎯

# Stuck Nudge (if no activity for 7 days)
Subject: We missen je, {name}! Kan Iris helpen?
```

---

## 📊 IMPLEMENTATIE PRIORITEITEN

### Sprint 1 (Week 1-2) — FOUNDATION 🔴
**Kritiek voor lancering**

- [ ] Database schema voor programs
- [ ] Seed 3 programma's (Kickstart, Transformatie, VIP)
- [ ] API endpoints voor programs
- [ ] Homepage hero section
- [ ] Homepage 3 programma cards

**Definition of Done**:
- Programs zichtbaar op homepage
- Prijzen en descriptions outcome-based
- Links werken maar checkout kan nog fake zijn

---

### Sprint 2 (Week 3) — ONBOARDING 🟡
**Belangrijk voor conversie**

- [ ] Onboarding quiz (7 vragen)
- [ ] Recommendation algorithm
- [ ] Recommendation page met program details
- [ ] "Start nu" CTA's (kunnen nog fake checkout zijn)

**Definition of Done**:
- Quiz → Recommendation flow werkt
- User ziet welk programma bij hem past
- Duidelijke "waarom" uitleg

---

### Sprint 3 (Week 4-5) — CONTENT 🟢
**Nodig voor delivery**

- [ ] Kickstart content structure (21 dagen)
- [ ] Eerste 3 video's opgenomen met HeyGen
- [ ] Dashboard toont "next lesson"
- [ ] Progress tracking basic werkend

**Definition of Done**:
- User kan les 1-3 van Kickstart volgen
- Progress wordt opgeslagen
- Dashboard toont voortgang

---

### Sprint 4 (Week 6-7) — PAYMENTS 🔵
**Kritiek voor omzet**

- [ ] Mollie/Stripe integratie
- [ ] Checkout flow compleet
- [ ] Payment success page
- [ ] User program access logic

**Definition of Done**:
- User kan écht betalen
- Toegang wordt automatisch gegeven
- Payment failure wordt afgehandeld

---

### Sprint 5 (Week 8) — POLISH & LAUNCH 🎨
**Voor professionele uitstraling**

- [ ] Email flows (welkom, progress)
- [ ] FAQ sectie op homepage
- [ ] Over Vincent sectie
- [ ] Mobile optimalisatie
- [ ] Beta badge toevoegen

**Definition of Done**:
- Platform 100% lanceerklaar
- Alle teksten outcome-based
- Email automation live
- Mobile werkt perfect

---

## 🎯 SUCCESS CRITERIA

### Launch Metrics
- ✅ 3 programma's koopbaar
- ✅ Quiz → Recommendation → Purchase flow werkt
- ✅ Kickstart minimaal 7 lessen content
- ✅ Dashboard toont transformatie reis
- ✅ Payments verwerkt via Mollie/Stripe

### Quality Checklist
- [ ] Geen "23 tools" messaging meer
- [ ] Alle prijzen outcome-based gepresenteerd
- [ ] Iris prominent aanwezig (avatar + messaging)
- [ ] Mobiel 100% geoptimaliseerd
- [ ] Geen technische bugs in critical path

### Beta Launch Goals
- 🎯 10 beta klanten binnen 2 weken
- 🎯 5 testimonials verzamelen
- 🎯 80% completion rate van Kickstart deelnemers
- 🎯 Feedback voor iteratie

---

## 🚀 NEXT STEPS

### Immediate Actions (Deze week)
1. **Database**: Programs schema + seed data
2. **Homepage**: Hero + 3 program cards
3. **Styling**: Outcome-based messaging overal

### Week 2
1. **API**: Program endpoints werkend
2. **Quiz**: Onboarding flow basic versie
3. **Dashboard**: Eerste reis-gecentreerde layout

### Week 3
1. **Content**: Kickstart eerste 7 lessen
2. **Video**: HeyGen setup + eerste opnames
3. **Progress**: Tracking werkend

### Week 4+
1. **Payments**: Mollie integratie live
2. **Emails**: Automation flows
3. **Launch**: Beta 🚀

---

## 💬 VRAGEN VOOR VINCENT

1. **Content**: Heb je bestaande video's die we kunnen gebruiken/hergebruiken?
2. **HeyGen**: Is je account al opgezet? Welke avatar wil je gebruiken?
3. **Payments**: Voorkeur voor Mollie of Stripe? (Mollie = NL, Stripe = global)
4. **Beta Pricing**: 50% korting echt beschikbaar? Tot wanneer?
5. **Launch Date**: Wanneer wil je live? (Suggestie: 2 weken = 15 dec)

---

## 📝 NOTES

**Filosofie**:
- Build fast, iterate based on feedback
- Launch > Perfect
- Outcome messaging is non-negotiable
- Iris = Hart van het product

**Technisch**:
- Next.js 15.5 + TypeScript
- PostgreSQL voor data
- HeyGen voor video
- Mollie/Stripe voor payments
- Vercel voor hosting

**Marketing**:
- Beta = 50% korting = urgency
- Social proof = 10+ jaar
- Testimonials kritiek voor conversie
- Vincent's verhaal = authenticiteit

---

**VERSIE HISTORIE**
- v1.0 (1 Dec 2025): Initial masterplan

**EIGENAAR**: Vincent van Munster
**UITVOERING**: Claude Code (AI Development Assistant)
**STATUS**: Ready to Execute 🚀
