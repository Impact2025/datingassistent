# 🎯 Complete Interactieve Components Plan
## Module "Herken de 5 Rode Vlaggen"

---

## 📊 HUIDIGE STATUS

### ✅ Al Interactief (COMPLETED)
1. **Pre-Quiz: Hoe alert ben jij?** - True/False quiz met score tracking
2. **Kennisquiz: De 5 V's** - 5 scenario-based multiple choice vragen
3. **Post-Quiz: Meet je groei** - Vergelijking met pre-quiz score
4. **Forum Discussie: Herkenning en groei** - 4-staps post generator

### 🔨 Nog Te Maken (TO DO)
**Module 1:**
- Les 2: 💭 Reflectie-oefening (assignment)
- Les 4: 💬 Forum Discussie: Wat betekent veiligheid voor jou? (text)
- Les 5: 📓 Download: Werkboek Les 1 (assignment)

**Module 2:**
- Les 2: 🔍 Observatie-oefening (assignment)
- Les 4: 💭 Reflectie: Welke V zie jij het vaakst? (assignment)
- Les 7: 📓 Download: Werkboek Les 2 (assignment)

**Video's:**
- Module 1, Les 1: 🎬 Video: Waarom Dit Belangrijk Is (video upload needed)
- Module 2, Les 1: 🎬 Video: De 5 V's (video upload needed)

---

## 🚀 IMPLEMENTATIE PLAN

### Priority 1: Core Interactive Assignments (High Impact)

#### 1. 🔍 **Observatie-oefening Component**
**Module 2, Les 2**

**Concept:** Interactive scenario analyzer met drag-and-drop of multi-select

**Features:**
- 3 realistische dating scenario's
- Voor elk scenario: identificeer welke V's aanwezig zijn
- Visual feedback per scenario
- Score berekening (20 punten totaal)
- Uitleg waarom bepaalde V's wel/niet van toepassing zijn

**UX Flow:**
```
Scenario 1: [Chat conversation display]
┌─────────────────────────────────┐
│ "Hey! Wat leuk dat we matchen!  │
│  Ik voel zo'n connectie met je. │
│  Je bent echt speciaal..."      │
│  [3 berichten later]            │
│  "Ik denk dat ik verliefd op    │
│   je ben 😍"                     │
└─────────────────────────────────┘

Welke rode vlaggen zie je? (meerdere mogelijk)
☐ V1 - Vage foto's/info
☐ V2 - Vlotte oppervlakkige praat
☐ V3 - Verhalen vol drama
☐ V4 - Verdoezelde antwoorden
☑ V5 - Verliefdheidsbombardement  ✓ Correct!
☐ V6 - Verleggen van grenzen

[Controleer Antwoord]
```

**Component Name:** `ObservationExercise`
**File:** `src/components/quiz/observation-exercise.tsx`

**Technical Details:**
- 3 hardcoded scenarios met correcte antwoorden
- Checkbox multi-select per scenario
- Submit per scenario met immediate feedback
- Progress tracking (Scenario 1/3)
- Final score display met explanation

---

#### 2. 💭 **Reflectie-oefening Component (Module 1)**
**Module 1, Les 2**

**Concept:** Guided reflection journey met autosave

**Features:**
- Multi-step reflection wizard (4-5 vragen)
- Autosave to database per vraag
- Character counter (encourages detail)
- Optional: AI-powered insights based on answers
- Privacy focused - only user can see their answers
- Download reflection as PDF option

**Questions:**
1. "Wanneer voelde jij je onveilig in een dating situatie?"
2. "Hoe reageerde je op dat gevoel?"
3. "Wat zou je nu anders doen?"
4. "Wat betekent 'veiligheid' voor jou in dating?"

**UX Flow:**
```
Vraag 1 van 4
─────────────────────────
Wanneer voelde jij je onveilig in een dating situatie?

[Large textarea - 500 chars]
Characters: 0/500

💡 Tip: Denk aan situaties waar je gevoel
    "iets klopt niet" zei, maar je ratio
    "geef het nog een kans" zei.

[✓ Opgeslagen] [Volgende →]
```

**Component Name:** `SafetyReflectionExercise`
**File:** `src/components/quiz/safety-reflection-exercise.tsx`

---

#### 3. 💭 **Reflectie: Welke V zie jij het vaakst? (Module 2)**
**Module 2, Les 4**

**Concept:** Interactive V-frequency analyzer met personal insights

**Features:**
- Ranking interface (drag to reorder)
- For each V: short explanation why you ranked it there
- Personal pattern recognition
- Action plan generator
- Shareable insights (optional)

**UX Flow:**
```
Rangschik de V's die JIJ het vaakst tegenkomt:
(Sleep om te rangschikken)

1. [V5 - Verliefdheidsbombardement] ☰
   └─ Waarom? [textarea]

2. [V2 - Vlotte oppervlakkige praat] ☰
   └─ Waarom? [textarea]

3. [V1 - Vage foto's/info] ☰
   └─ Waarom? [textarea]

...

[Analyseer Mijn Patronen]

┌─────────────────────────────────────┐
│ 📊 Jouw Persoonlijke Profiel       │
│                                     │
│ Top 3 rode vlaggen die jij ziet:   │
│ 1. V5 (42% van je ervaringen)      │
│ 2. V2 (28%)                        │
│ 3. V1 (18%)                        │
│                                     │
│ 💡 Aanbeveling:                    │
│ Focus op het vroeg herkennen       │
│ van love bombing patronen...       │
└─────────────────────────────────────┘
```

**Component Name:** `VFrequencyReflection`
**File:** `src/components/quiz/v-frequency-reflection.tsx`

---

### Priority 2: Forum & Community Integration

#### 4. 💬 **Forum Discussie: Wat betekent veiligheid voor jou?**
**Module 1, Les 4**

**Concept:** Similar to existing forum generator, maar specifiek voor veiligheid

**Features:**
- 3-stap wizard
- Pre-filled prompts gebaseerd op reflectie-oefening (if completed)
- Direct post to forum category
- Community preview (zie wat anderen delen)

**Steps:**
1. Wat betekent veiligheid voor jou?
2. Welke grenzen stel jij?
3. Hoe communiceer je die grenzen?

**Component Name:** `SafetyForumGenerator`
**File:** `src/components/quiz/safety-forum-generator.tsx`

---

### Priority 3: Enhanced Downloads & Resources

#### 5. 📓 **Interactive Werkboek Generator**
**Module 1, Les 5 & Module 2, Les 7**

**Concept:** Generate personalized PDF werkboek with user's answers

**Features:**
- Pulls data from all completed exercises
- Generates custom PDF with:
  - User's reflection answers
  - Their quiz scores
  - Personal V-ranking
  - Action plan
  - Checklist
- Download button
- Preview before download
- Optional: email to self

**UX Flow:**
```
┌─────────────────────────────────────┐
│ 📓 Jouw Persoonlijke Werkboek      │
│                                     │
│ ✓ Pre-Quiz score: 3/5              │
│ ✓ Reflectie antwoorden: 4 vragen   │
│ ✓ Post-Quiz score: 5/5 (+2!)      │
│ ✓ V-ranking compleet               │
│                                     │
│ Jouw werkboek is klaar! 🎉         │
│                                     │
│ [📥 Download PDF]                  │
│ [📧 Email naar mij]                │
│ [👁️ Preview]                       │
└─────────────────────────────────────┘
```

**Component Name:** `PersonalizedWorkbookGenerator`
**File:** `src/components/quiz/personalized-workbook-generator.tsx`

**Technical:**
- Use `react-pdf` or `jsPDF` for PDF generation
- Pull data from database (user_lesson_responses)
- Template-based generation

---

## 🎨 DESIGN SYSTEM

### Consistent Visual Language

**Colors:**
- Primary: Purple (#9333EA) - Action & Progress
- Success: Green (#10B981) - Correct Answers
- Warning: Orange (#F59E0B) - Attention Points
- Danger: Red (#EF4444) - V6 & Wrong Answers
- Info: Blue (#3B82F6) - Tips & Hints

**Component Structure:**
```tsx
<ComponentWrapper>
  <ProgressBar />
  <ContentArea>
    <QuestionHeader />
    <InteractiveElement />
    <FeedbackArea />
  </ContentArea>
  <NavigationButtons />
  <HelpSection />
</ComponentWrapper>
```

**Animations:**
- Smooth transitions between steps
- Celebrate correct answers (confetti for perfect scores)
- Gentle shake for incorrect (not too aggressive)
- Progress bar fills with satisfaction

---

## 💾 DATA ARCHITECTURE

### Database Schema Updates Needed

**New Tables:**

1. **`user_reflection_responses`**
```sql
CREATE TABLE user_reflection_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER REFERENCES course_lessons(id),
  question_number INTEGER,
  response_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. **`user_scenario_responses`**
```sql
CREATE TABLE user_scenario_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER REFERENCES course_lessons(id),
  scenario_number INTEGER,
  selected_flags JSONB, -- Array of V flags
  is_correct BOOLEAN,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. **`user_v_rankings`**
```sql
CREATE TABLE user_v_rankings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER REFERENCES course_lessons(id),
  v_ranking JSONB, -- Array like ["V5", "V2", "V1", "V4", "V3", "V6"]
  explanations JSONB, -- Object with explanations per V
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 RESPONSIVE & ACCESSIBILITY

**Mobile First:**
- All components work on 320px width
- Touch-friendly buttons (min 44px)
- Swipe gestures for scenario navigation
- Collapsible sections for long content

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators

---

## 🧪 TESTING STRATEGY

**Per Component:**
1. Unit tests (Jest + React Testing Library)
2. Integration tests (data save/load)
3. E2E tests (Playwright - full user flow)
4. Mobile testing (real devices)
5. Accessibility audit (axe-core)

**Test Scenarios:**
- User completes exercise → data saves
- User returns → sees previous answers
- User changes answer → updates correctly
- Network error → graceful handling
- Offline mode → local storage backup

---

## 📈 ANALYTICS & INSIGHTS

**Track:**
- Completion rate per exercise
- Average time spent per component
- Most common V-rankings
- Pre/post quiz improvement distribution
- Forum post creation rate
- Workbook download rate

**Insights:**
- Which scenarios are hardest?
- Which V do users struggle with most?
- What reflection questions get longest answers?
- Completion bottlenecks

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Core Exercises (Week 1)
- [ ] ObservationExercise component
- [ ] SafetyReflectionExercise component
- [ ] Database tables setup
- [ ] API endpoints for data storage

### Phase 2: Advanced Reflections (Week 2)
- [ ] VFrequencyReflection component
- [ ] SafetyForumGenerator component
- [ ] Integration with existing forum

### Phase 3: Enhanced Resources (Week 3)
- [ ] PersonalizedWorkbookGenerator
- [ ] PDF generation system
- [ ] Email delivery system

### Phase 4: Polish & Optimization (Week 4)
- [ ] Animations & transitions
- [ ] Mobile optimization
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Analytics integration

---

## 💡 ADDITIONAL IDEAS (Nice to Have)

### Gamification
- Achievement badges for completion
- Streak tracking (daily engagement)
- Leaderboard (anonymized, opt-in)
- Progress visualization (animated tree/path)

### Social Features
- Share achievements (anonymized)
- "Study buddy" matching
- Group reflection sessions
- Community challenges

### AI Enhancement
- AI-powered feedback on reflections
- Personalized tips based on answers
- Pattern recognition in user responses
- Suggested forum discussions based on profile

### Advanced Analytics
- Personal "red flag radar" score
- Risk assessment based on patterns
- Confidence level tracking over time
- Personalized learning path

---

## 📋 NEXT STEPS

1. **Review & Approve Plan** with stakeholders
2. **Prioritize Components** based on user impact
3. **Design Mockups** for each component
4. **Setup Development Environment** (database, APIs)
5. **Start Implementation** with Priority 1 components
6. **Iterate Based on User Feedback**

---

## 🎯 SUCCESS METRICS

**Engagement:**
- 80%+ completion rate for interactive exercises
- Average 5+ minutes per reflection
- 30%+ forum post creation from generator

**Learning Outcomes:**
- Average 2+ point improvement pre→post quiz
- 70%+ correct on observation exercise
- Diverse V-ranking (not everyone picks same V)

**User Satisfaction:**
- 4.5+ stars average rating
- Positive feedback in forum
- Low dropout rate

---

**Status:** 📝 Ready for Implementation
**Last Updated:** 2025-11-10
**Maintainer:** Dating Assistent Team
