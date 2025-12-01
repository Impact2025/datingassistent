# Dating Startpunt Onboarding - Test Plan

## ✅ Implementatie Status

### Voltooide Componenten:
- ✅ **DatingDNAAssessment** (`src/components/onboarding/dating-dna-assessment.tsx`)
  - 7 diagnostische vragen met smooth animaties
  - User type determinatie (A/B/C/D) op basis van antwoorden
  - AI context integratie voor personalisatie

- ✅ **ThreePillarsFramework** (`src/components/onboarding/three-pillars-framework.tsx`)
  - Visuele intro van de 3 dating pilaren
  - Modern card design met hover effects
  - Consistent dashboard styling

- ✅ **PersonalizedRoadmap** (`src/components/onboarding/personalized-roadmap.tsx`)
  - Type-gebaseerde aanbevelingen (A/B/C/D)
  - Gratis lead magnet download per type
  - Aanbevolen cursus en abonnement
  - **ALLE producten verwijzen naar BESTAANDE aanbod**

- ✅ **NewOnboardingPage** (`src/app/onboarding/page.tsx`)
  - Complete flow integratie
  - LocalStorage state persistence
  - Progress tracking met API
  - Redirect naar dashboard na voltooiing

### Onboarding Flow:

```
1. Profile Setup
   ↓
2. Welcome Screen
   ↓
3. Three Pillars Framework (Educatie)
   ↓
4. Dating DNA Assessment (7 vragen)
   ↓
5. Personalized Roadmap (Type A/B/C/D)
   ↓
6. Dashboard
```

## 🧪 Test Scenario's

### Test 1: Nieuwe User Flow

**Setup:**
1. Maak nieuwe test account aan via `/register`
2. Voltooi profiel als deze nog niet compleet is

**Test Stappen:**
1. Navigeer naar `/onboarding`
2. **Verwacht**: Welcome screen met "Start Jouw Dating Startpunt" button
3. Klik "Start Jouw Dating Startpunt"
4. **Verwacht**: Three Pillars Framework pagina met 3 kaarten
5. Klik "Ontdek Jouw Startpunt"
6. **Verwacht**: Dating DNA Assessment - Vraag 1/7
7. Beantwoord alle 7 vragen
8. **Verwacht**: Personalized Roadmap met:
   - User type badge (A/B/C/D)
   - Gratis lead magnet download
   - Aanbevolen cursus (€47, €197, of €597)
   - Aanbevolen plan (Starter/Core/Premium)
9. Klik "Ga naar Dashboard"
10. **Verwacht**: Redirect naar `/dashboard`

**Validatie:**
- ✅ Geen compile errors
- ✅ Smooth animaties tussen steps
- ✅ Progress bar toont correcte percentage
- ✅ LocalStorage slaat state op bij elke stap
- ✅ AI context ontvangt DNA antwoorden
- ✅ Producten in roadmap bestaan echt

### Test 2: Resume Onboarding (Mid-Flow Exit)

**Setup:**
1. Start onboarding met nieuwe user
2. Beantwoord 3 van 7 vragen in DNA Assessment
3. Sluit browser tab

**Test Stappen:**
1. Open nieuwe tab en ga naar `/onboarding`
2. **Verwacht**: Resume vanaf vraag 3 waar je was gebleven
3. Voltooi rest van flow

**Validatie:**
- ✅ LocalStorage restore werkt
- ✅ Antwoorden blijven behouden
- ✅ Progress bar reflecteert juiste positie

### Test 3: User Type Determinatie

Test elk user type door specifieke antwoorden te geven:

#### Type A - "De Starter"
**Antwoorden:**
- Q1: "Nee, nog niet" (geen profiel)
- Q2: "Profiel maken die klikt"
- Q6: "Mijn profiel"

**Verwacht Roadmap:**
- Lead Magnet: "De Perfecte Profielfoto" (€27)
- Cursus: "Dating Fundament" (€47)
- Plan: "Starter Plan" (€9,99/maand)

#### Type B - "De Optimaliseerder"
**Antwoorden:**
- Q1: "Ja, actief" (heeft profiel)
- Q2: "Matches krijgen"
- Q6: "Gesprekken voeren"

**Verwacht Roadmap:**
- Lead Magnet: "Van Match naar Date" (€19)
- Cursus: "Dating Fundament" (€47)
- Plan: "Core Plan" (€19,99/maand)

#### Type C - "De Connector"
**Antwoorden:**
- Q1: "Meerdere apps"
- Q2: "Van chat naar date"
- Q6: "Connectie maken"

**Verwacht Roadmap:**
- Lead Magnet: "Match naar Betekenisvolle Date" (€37)
- Cursus: "Connectie & Diepgang" (€197)
- Plan: "Core Plan" (€19,99/maand)

#### Type D - "De Meester"
**Antwoorden:**
- Q2: "Dates die leiden tot meer"
- Q6: "Alles" (complete upgrade)

**Verwacht Roadmap:**
- Lead Magnet: "Succesvol Daten Checklist" (€47)
- Cursus: "Meesterschap" (€597)
- Plan: "Premium Plan" (€29,99/maand)

### Test 4: AI Context Integratie

**Setup:**
1. Voltooi onboarding met specifieke DNA antwoorden

**Test Stappen:**
1. Ga naar `/dashboard`
2. Open AI Chat Coach
3. Vraag: "Wat weet je over mijn dating situatie?"

**Verwacht:**
- AI coach refereert aan DNA antwoorden
- Personalisatie op basis van user type
- Relevante aanbevelingen

**Validatie:**
- Check `/api/ai-context` bevat onboarding data
- Verify structure:
  ```json
  {
    "datingDNA": { "1": "answer1", "2": "answer2", ... },
    "userType": "A" | "B" | "C" | "D",
    "datingSituation": "...",
    "mainChallenge": "...",
    "relationshipGoal": "...",
    "communicationStyle": "...",
    "strengths": "...",
    "improvementFocus": "...",
    "timeCommitment": "..."
  }
  ```

## 🔍 Test voor Bestaande Users

**Scenario:** User heeft journey al voltooid

**Setup:**
1. Login met bestaande user (bijv. user ID 26)

**Test Stappen:**
1. Navigeer naar `/onboarding`
2. **Verwacht**: Automatische redirect naar `/dashboard`

**Validatie:**
- ✅ Journey status check werkt
- ✅ Geen onboarding loop voor completed users

## 🚨 Edge Cases

### Edge Case 1: Onvolledige Profiel
**Scenario:** User heeft account maar geen naam/leeftijd

**Test:**
1. Login met account zonder profiel data
2. Ga naar `/onboarding`
3. **Verwacht**: Start bij "Profile Setup" step

### Edge Case 2: API Failure tijdens DNA Save
**Scenario:** Network error tijdens AI context save

**Test:**
1. Disable network in DevTools na vraag 7
2. Complete DNA assessment
3. **Verwacht**: Flow continues to roadmap (graceful degradation)

### Edge Case 3: Browser Refresh tijdens Assessment
**Scenario:** F5 refresh mid-assessment

**Test:**
1. Start DNA assessment
2. Refresh page (F5)
3. **Verwacht**: Resume van current question

## 📊 Success Criteria

Voor productie release moet alles hieronder ✅ zijn:

- [ ] Alle 4 user types leiden tot correcte roadmap
- [ ] LocalStorage persistence werkt foutloos
- [ ] AI context ontvangt alle 7 DNA antwoorden
- [ ] Lead magnet downloads werken (PDF bestanden bestaan)
- [ ] Alle cursus/plan URLs leiden naar bestaande pagina's
- [ ] Smooth animaties zonder jank
- [ ] Mobile responsive (test op 375px width)
- [ ] Journey status API update werkt
- [ ] Completed users worden geredirect
- [ ] Progress bar accurate (0-100%)

## 🎨 Visual QA Checklist

- [ ] Consistent pink/purple gradient theme
- [ ] Card borders en shadows match dashboard
- [ ] Button hover states werken
- [ ] Icons zijn centered en juiste size
- [ ] Text readable (contrast check)
- [ ] Spacing consistent met dashboard
- [ ] Framer Motion animaties smooth
- [ ] Progress bar fills smoothly

## 🐛 Known Issues

**Issue 1: Lead Magnet PDFs niet aanwezig**
- **Status**: TODO
- **Workaround**: Placeholder links werken, PDFs moeten nog gemaakt worden
- **Path**: `/public/lead-magnets/*.pdf`

**Issue 2: Product Pages niet volledig**
- **Status**: Partially implemented
- **Affected**: `/products/dating-fundament`, `/products/connectie-diepgang`, `/products/meesterschap`
- **Workaround**: URLs zijn correct, maar landing pages moeten nog geoptimaliseerd

**Issue 3: AI Foto Quick Scan**
- **Status**: Not implemented (optional component)
- **Decision**: Skipped for MVP, kan later toegevoegd tussen step 3 en 4

## 📝 Test Results Log

Gebruik dit format voor test results:

```
Test: [Test Name]
Date: [YYYY-MM-DD]
Tester: [Name]
Browser: [Chrome/Firefox/Safari] [Version]
Result: PASS / FAIL
Notes: [Any observations]
```

---

## 🚀 Volgende Stappen

Na succesvolle tests:

1. **Lead Magnets Maken**
   - De Perfecte Profielfoto (PDF)
   - Van Match naar Date (PDF)
   - Match naar Betekenisvolle Date (PDF)
   - Succesvol Daten Checklist (PDF)

2. **Product Pages Bouwen**
   - `/products/dating-fundament`
   - `/products/connectie-diepgang`
   - `/products/meesterschap`

3. **Analytics Toevoegen**
   - Track completion rate per step
   - User type distribution
   - Lead magnet download rate
   - Course/plan conversion rate

4. **A/B Testing**
   - Test verschillende roadmap layouts
   - Test lead magnet positioning
   - Test vraag formulering DNA assessment

5. **SEO Optimalisatie**
   - Meta tags voor /onboarding
   - OG images voor social sharing
   - Schema.org markup

---

**Implementatie Datum:** 29 November 2025
**Versie:** 1.0
**Status:** Ready for Testing
