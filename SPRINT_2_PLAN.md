# 🚀 Sprint 2: Smart Routing & Tool Onboarding

**Datum:** 16 november 2025
**Status:** 📋 **IN PLANNING**
**Geschatte tijd:** 12-16 uur

---

## 🎯 Sprint Doel

**Van:** Basic tracking en first-time alerts
**Naar:** Professionele tool onboarding met interactive overlays, step completion tracking, en contextual guidance

---

## 📊 Huidige Situatie (Na Sprint 1)

✅ **Wat we hebben:**
- Unified coaching profile systeem
- Enhanced coach advice met klikbare tools
- Current Focus dashboard card
- Basic tool tracking (view events)
- First-time alert messages
- Custom event tracking per tool

⚠️ **Wat ontbreekt:**
- Interactive onboarding tutorials
- Step-by-step guidance binnen tools
- Completion tracking per tool actie
- Visual progress indicators
- Contextual tooltips en hints
- "Mark as completed" functionaliteit

---

## 🎯 Sprint 2 Deliverables

### 1️⃣ Tool Onboarding Overlay Component

**Component:** `src/components/shared/tool-onboarding-overlay.tsx`

**Features:**
- Modal/Dialog overlay bij first-time tool gebruik
- Multi-step tutorial met progress dots
- Tool-specific content en screenshots
- "Don't show again" optie
- Skip mogelijkheid
- Keyboard navigation (Enter, Escape)

**Design:**
```
┌────────────────────────────────────────┐
│  Welkom bij [Tool Name]!        [X]    │
├────────────────────────────────────────┤
│                                         │
│  [Screenshot/Icon]                      │
│                                         │
│  Stap 1 van 3                           │
│  ● ○ ○                                  │
│                                         │
│  [Title]                                │
│  [Description text explaining feature]  │
│                                         │
│  [Skip]              [Volgende →]      │
└────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface ToolOnboardingProps {
  toolName: string;
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  highlightElement?: string; // CSS selector
}
```

---

### 2️⃣ Completion Tracking System

**Hook:** `src/hooks/use-tool-completion.ts`

**Features:**
- Track tool actions/steps completion
- Local + Database persistence
- Progress percentage berekening
- "Mark as completed" functie
- Reset completion mogelijkheid

**API Endpoint:**
```typescript
POST /api/coaching-profile/complete-action
{
  toolName: 'profiel-coach',
  actionName: 'bio_generated',
  metadata?: { /* extra data */ }
}
```

**Hook Interface:**
```typescript
interface UseToolCompletion {
  completedActions: string[];
  progressPercentage: number;
  markAsCompleted: (actionName: string) => Promise<void>;
  isCompleted: (actionName: string) => boolean;
  resetProgress: () => Promise<void>;
}
```

---

### 3️⃣ Contextual Tooltips Component

**Component:** `src/components/shared/contextual-tooltip.tsx`

**Features:**
- Inline tooltips bij form fields
- Info icons met hover/click
- Positioning logic (top, bottom, left, right)
- Mobile-friendly (tap to open)
- Accessible (ARIA labels)

**Usage:**
```tsx
<ContextualTooltip
  content="Upload een foto in natuurlijk licht voor beste resultaten"
  position="top"
>
  <Button>Upload Foto</Button>
</ContextualTooltip>
```

---

### 4️⃣ Tool-Specific Implementations

Per tool implementeren we:

#### Profiel Coach
- **Onboarding steps:**
  1. "Welkom - Dit is de Profiel Coach"
  2. "Vul je huidige bio in"
  3. "Krijg AI feedback en suggesties"

- **Completion actions:**
  - `bio_viewed` - Feedback bekeken
  - `bio_improved` - Bio aangepast
  - `bio_saved` - Nieuwe bio opgeslagen

- **Tooltips:**
  - Bio input: "Wees authentiek en specifiek"
  - Tone selector: "Kies een toon die bij je past"

#### Foto Advies
- **Onboarding steps:**
  1. "Welkom bij Foto Advies"
  2. "Upload je beste profielfoto"
  3. "Krijg professionele feedback"

- **Completion actions:**
  - `photo_uploaded` - Foto geüpload
  - `analysis_viewed` - Analyse bekeken
  - `photo_improved` - Nieuwe foto geanalyseerd (hoger score)

- **Tooltips:**
  - Upload button: "JPG, PNG max 10MB"
  - Type selector: "Kies 'screenshot' voor app profiel"

#### Chat Coach
- **Onboarding steps:**
  1. "Chat met je AI dating coach"
  2. "Stel specifieke vragen"
  3. "Oefen gesprekstechnieken"

- **Completion actions:**
  - `first_question_asked` - Eerste vraag gesteld
  - `conversation_continued` - 3+ berichten uitgewisseld
  - `practice_completed` - Practice sessie afgerond

- **Tooltips:**
  - Input field: "Vraag specifiek naar situaties"

#### Gesprek Starters
- **Onboarding steps:**
  1. "Vind het perfecte platform"
  2. "Genereer custom openers"
  3. "Check gesprek veiligheid"

- **Completion actions:**
  - `platform_matched` - Platform aanbevelingen ontvangen
  - `opener_generated` - Opener gegenereerd
  - `opener_saved` - Opener bewaard voor gebruik

#### Date Planner
- **Onboarding steps:**
  1. "Plan de perfecte date"
  2. "Bereid je voor met checklist"
  3. "Reflecteer en leer"

- **Completion actions:**
  - `date_planned` - Date idee gevonden
  - `checklist_reviewed` - Voorbereidingschecklist bekeken
  - `reflection_completed` - Post-date reflectie gedaan

---

## 📐 Architectuur

### Component Structuur
```
src/components/
├── shared/
│   ├── tool-onboarding-overlay.tsx      [NIEUW]
│   ├── contextual-tooltip.tsx           [NIEUW]
│   ├── progress-indicator.tsx           [NIEUW]
│   └── completion-badge.tsx             [NIEUW]
├── dashboard/
│   ├── profiel-coach-tab.tsx            [UPDATE]
│   ├── foto-advies-tab.tsx              [UPDATE]
│   ├── chat-coach-tab.tsx               [UPDATE]
│   ├── gesprek-starter-tab.tsx          [UPDATE]
│   └── date-planner-tab.tsx             [UPDATE]

src/hooks/
├── use-coaching-tracker.ts              [EXISTING]
├── use-tool-completion.ts               [NIEUW]
└── use-onboarding-overlay.ts            [NIEUW]

src/app/api/
└── coaching-profile/
    ├── complete-action/
    │   └── route.ts                     [NIEUW]
    └── track-tool/
        └── route.ts                     [EXISTING]
```

### Database Schema Updates
```sql
-- Optie 1: Uitbreiden van JSONB column (eenvoudig)
ALTER TABLE coaching_profiles
ADD COLUMN IF NOT EXISTS completed_actions JSONB DEFAULT '{}';

-- completed_actions format:
{
  "profiel-coach": ["bio_viewed", "bio_improved", "bio_saved"],
  "foto-advies": ["photo_uploaded", "analysis_viewed"],
  ...
}

-- Optie 2: Nieuwe table (meer flexibel)
CREATE TABLE tool_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  action_name VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, tool_name, action_name)
);

CREATE INDEX idx_tool_completions_user ON tool_completions(user_id);
CREATE INDEX idx_tool_completions_tool ON tool_completions(tool_name);
```

---

## 🎨 Visual Design Principles

### Onboarding Overlay
- **Timing:** Show on first tool visit OR when `?onboarding=true`
- **Animation:** Fade in 200ms, scale from 0.95 to 1.0
- **Backdrop:** Semi-transparent dark (rgba(0,0,0,0.5))
- **Max width:** 500px
- **Mobile:** Full screen on small devices
- **Accessibility:** Focus trap, ESC to close, ARIA modal

### Progress Indicators
```tsx
// Linear progress bar
<div className="w-full bg-secondary rounded-full h-2">
  <div
    className="bg-primary h-2 rounded-full transition-all"
    style={{ width: `${progressPercentage}%` }}
  />
</div>

// Circular progress (voor tools)
<div className="relative w-16 h-16">
  <svg className="transform -rotate-90">
    <circle
      cx="32" cy="32" r="28"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      strokeDasharray={`${progress * 176} 176`}
    />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center">
    {progress}%
  </span>
</div>
```

### Completion Badges
```tsx
// Tool completed badge
<Badge variant={isCompleted ? "default" : "outline"}>
  {isCompleted && <CheckCircle2 className="w-3 h-3 mr-1" />}
  {toolName}
</Badge>
```

---

## 🔄 User Flow Updates

### Current Flow (Sprint 1)
```
Personality Scan
  ↓
Coach Advice (klikbare tools)
  ↓
Dashboard (Current Focus card)
  ↓
Tool (met first-time alert)
  ↓
Tool gebruik (tracking)
```

### New Flow (Sprint 2)
```
Personality Scan
  ↓
Coach Advice (klikbare tools)
  ↓
Dashboard (Current Focus card + progress)
  ↓
Tool (met first-time alert)
  ↓
[NIEUW] Onboarding Overlay (3 steps)
  ↓
Tool gebruik (met tooltips)
  ↓
[NIEUW] Completion tracking
  ↓
[NIEUW] Progress update in dashboard
```

---

## 📝 Implementation Checklist

### Phase 1: Core Components (4 uur)
- [ ] Create `tool-onboarding-overlay.tsx`
- [ ] Create `contextual-tooltip.tsx`
- [ ] Create `progress-indicator.tsx`
- [ ] Create `completion-badge.tsx`
- [ ] Add Storybook stories voor components

### Phase 2: Hooks & Logic (3 uur)
- [ ] Create `use-tool-completion.ts` hook
- [ ] Create `use-onboarding-overlay.ts` hook
- [ ] Update `use-coaching-tracker.ts` met completion logic
- [ ] Add TypeScript interfaces

### Phase 3: API & Database (2 uur)
- [ ] Create completion tracking API endpoint
- [ ] Update coaching profile schema
- [ ] Add database migration
- [ ] Test API endpoints

### Phase 4: Tool Integration (4 uur)
- [ ] Update Profiel Coach tab
- [ ] Update Foto Advies tab
- [ ] Update Chat Coach tab
- [ ] Update Gesprek Starters tab
- [ ] Update Date Planner tab

### Phase 5: Dashboard Updates (2 uur)
- [ ] Add progress indicators to Current Focus card
- [ ] Show completion badges per tool
- [ ] Add "Continue where you left off" section

### Phase 6: Testing & Polish (3 uur)
- [ ] Test complete onboarding flow
- [ ] Test completion tracking
- [ ] Test mobile responsive
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation update

---

## 🧪 Testing Scenarios

### Scenario 1: First-Time User Journey
```
1. Nieuwe user completeert personality scan
2. Klikt op aanbevolen tool vanuit coach advice
3. Ziet onboarding overlay (3 steps)
4. Doorloopt tutorial
5. Gebruikt tool met tooltips
6. Completeert actie
7. Ziet progress update in dashboard
```

### Scenario 2: Returning User
```
1. User opent bekende tool
2. Geen onboarding overlay (al gezien)
3. Ziet tooltips bij hover
4. Completeert nieuwe actie
5. Progress percentage stijgt
6. Completion badge update
```

### Scenario 3: Skip Onboarding
```
1. User ziet onboarding
2. Klikt "Skip"
3. LocalStorage: onboarding_seen_[tool] = true
4. Direct naar tool
5. Kan later opnieuw bekijken via "?" icon
```

---

## 📊 Success Metrics

### User Engagement
- **Tool completion rate:** >60% (vs <30% nu)
- **Onboarding completion:** >75% doorlopen full tutorial
- **Skip rate:** <25% skip onboarding
- **Return to tool:** >50% komt terug na eerste gebruik

### Feature Adoption
- **Tooltip interaction:** >40% hovert/klikt tooltips
- **Progress awareness:** >70% checked hun progress
- **Completion badges:** >50% earned minimaal 1 badge

### Business Impact
- **Tool activation:** +40% meer tools gebruikt
- **Time in app:** +30% langere sessies
- **Retention:** +25% users komt terug binnen 7 dagen

---

## 🎯 Non-Functional Requirements

### Performance
- Onboarding overlay load: <100ms
- Tooltip render: <16ms (60fps)
- Completion API call: <200ms
- No layout shift (CLS < 0.1)

### Accessibility
- Keyboard navigable
- Screen reader friendly
- ARIA labels op alle interactive elements
- Focus management in modals
- Color contrast ratio ≥ 4.5:1

### Mobile
- Touch-friendly buttons (min 44x44px)
- Responsive tooltips
- Full-screen overlay op <640px
- Swipeable onboarding steps

---

## 🚀 Deployment Plan

### Staging (Week 1)
```bash
# 1. Database migration
node scripts/sprint-2-migration.js

# 2. Deploy
git checkout staging
git merge sprint-2-implementation
vercel --env staging

# 3. Test
# - Run manual test scenarios
# - Collect user feedback
```

### Production (Week 2)
```bash
# After 2 days staging testing
git checkout main
git merge staging
vercel --prod
```

---

## 📚 Documentation Deliverables

1. **`SPRINT_2_IMPLEMENTATION_GUIDE.md`** - Technical implementation details
2. **`TOOL_ONBOARDING_CONTENT.md`** - All onboarding copy and steps
3. **`COMPLETION_TRACKING_GUIDE.md`** - How to add completion actions
4. **Updated `README_SPRINT1.md`** → Rename to project README

---

## 🔮 Sprint 3 Preview

Na Sprint 2 bouwen we verder met:
- **Unified Assessment** - Merge personality + skills scan
- **Adaptive difficulty** - Content based on skill level
- **Smart suggestions** - AI recommendations based on progress
- **Weekly reports** - Email met progress update

---

## ✅ Ready to Start?

**Volgende stap:** Create onboarding overlay component

Klaar om te beginnen? 🚀
