# 🧪 Test Instructies - Sprint 1
## Jouw Nieuwe Coaching Profile Systeem

**Server:** http://localhost:9000
**Status:** ✅ Klaar voor testing!

---

## 🎯 Wat is er Nieuw?

### De Grote Verbetering
**VOOR:** Coach geeft advies → Tools staan in lijst → Niet klikbaar → Gebruiker weet niet wat te doen

**NU:** Coach geeft advies → Tools zijn KLIKBAAR → Goals automatisch aangemaakt → Dashboard toont "Wat nu?" → Gebruiker weet precies volgende stap!

### Visueel Verschil
```
VOOR het dashboard:
┌────────────────────────────────┐
│ Welkom bij je Dashboard        │
│                                 │
│ [23 tabs met tools]             │
│                                 │
│ 😕 Wat moet ik doen?            │
└────────────────────────────────┘

NA op het dashboard:
┌────────────────────────────────┐
│ Welkom bij je Dashboard        │
│                                 │
│ ✨ JOUW HUIDIGE FOCUS           │
│ ├─ Fase: Kennismaking (Dag 1)  │
│ ├─ Deze week: Profiel verbeteren│
│ ├─ Volgende stap: [Tool] →     │
│ └─ Stats: 0 tools, 1 streak     │
│                                 │
│ [23 tabs met tools]             │
│                                 │
│ 😊 Duidelijke richting!         │
└────────────────────────────────┘
```

---

## ⚡ Snelle Test (5 minuten)

### Stap 1: Open Browser
```
http://localhost:9000
```

### Stap 2: Login
Gebruik je bestaande account (degene waarmee je personality scan hebt gedaan)

### Stap 3: Test Console Script
1. Druk op **F12** (open console)
2. Kopieer en plak dit script:

```javascript
// Creëer test coaching profile
const token = localStorage.getItem('datespark_auth_token');

const response = await fetch('/api/coaching-profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalityType: 'De Gemotiveerde Starter',
    comfortLevel: 7,
    primaryGoal: 'Meer betekenisvolle dates',
    mainChallenge: 'Profiel optimalisatie',
    strengths: ['Eerlijk', 'Gemotiveerd', 'Sociaal'],
    growthAreas: ['Meer zelfvertrouwen', 'Betere foto\'s'],
    weeklyFocus: 'Optimaliseer je profiel en maak het authentiek',
    nextAction: 'Start met Profiel Coach om je bio te verbeteren',
    recommendedTools: ['profiel-coach', 'foto-advies', 'chat-coach'],
    currentPhase: 'intake',
    journeyDay: 1,
    currentStreak: 1
  })
});

const result = await response.json();
console.log('✅ Profile created:', result);

// Auto-refresh na 1 seconde
setTimeout(() => {
  console.log('🔄 Refreshing...');
  location.reload();
}, 1000);
```

3. Druk op **Enter**
4. Wacht 1 seconde → Pagina refresht automatisch

### Stap 4: Verifieer
Je ziet nu bovenaan het dashboard een nieuwe card:

```
┌──────────────────────────────────────────┐
│ ✨ Jouw Huidige Focus        [Dag 1]     │
├──────────────────────────────────────────┤
│ Fase: Kennismaking                       │
│ [████░░░░░░░░] 33%                       │
│                                           │
│ 🎯 Focus deze week                       │
│ Optimaliseer je profiel en maak het      │
│ authentiek                                │
│                                           │
│ ⚡ Volgende stap         [Belangrijk]    │
│ Start met Profiel Coach om je bio te     │
│ verbeteren                                │
│ [Start nu →]                              │
│                                           │
│ 🛠️ Aanbevolen tools                      │
│ [profiel-coach] [foto-advies] [chat-coach]│
│                                           │
│ 📊  0 Tools  |  0 Steps  |  1 Streak     │
└──────────────────────────────────────────┘
```

**✅ SUCCESS!** Als je dit ziet werkt alles!

---

## 🔬 Volledige Flow Test (15 minuten)

Voor een complete test van alle nieuwe features:

### Test 1: Nieuwe Gebruiker Flow

1. **Logout** (of open incognito window)
2. **Registreer nieuw test account**
   - Email: test@example.com
   - Wachtwoord: Test1234!
3. **Kies package** (bijv. Pro - yearly)
4. **Voltooi payment** (test mode)
5. **Vul profiel in**
6. **Start Personality Scan**

7. **Beantwoord 7 vragen:**
   - Vraag 1: Huidige situatie
   - Vraag 2: Comfort level (slider)
   - Vraag 3: Grootste uitdaging (checkboxes)
   - Vraag 4: Gewenst resultaat
   - Vraag 5: Sterke punten
   - Vraag 6: Werk punten
   - Vraag 7: Tijd commitment

8. **Bekijk Coach Advice:**
   - Zie AI gegenereerde advice
   - Zie lijst met aanbevolen tools
   - **CHECK:** Zijn de tools KLIKBAAR? (hover → cursor changes)

9. **Klik op een tool** (bijv. "Profiel Coach")
   - **CHECK:** Zie je toast "Aanbevelingen opgeslagen!"?
   - **CHECK:** Navigeert het naar de tool?

10. **Ga terug naar Dashboard**
    - **CHECK:** Zie je "Jouw Huidige Focus" card?
    - **CHECK:** Toont het je weekly focus?
    - **CHECK:** Toont het next action?

### Test 2: Goal Creation Verificatie

1. Ga naar **Goals tab** (of Doelen)
2. **CHECK:** Zie je 2 nieuwe goals?
   - 1x Week goal: [Beschrijving van weekly focus]
   - 1x Dag goal: [Beschrijving van today action]
3. **CHECK:** Hebben beide goals een due date?

### Test 3: Tool Tracking

1. Klik op **"Start nu"** in Current Focus card
2. Navigeer naar aanbevolen tool
3. Gebruik de tool kort
4. Ga terug naar **Dashboard**
5. **CHECK:** Is tool usage count verhoogd?
6. **CHECK:** Heeft gebruikte tool een groen checkmark?

---

## 🎨 Wat Je Moet Zien

### Current Focus Card Details

**Kleur Codes:**
- 🔴 Hoge prioriteit: Rode border en background
- 🟠 Medium prioriteit: Oranje kleuren
- 🔵 Lage prioriteit: Blauwe kleuren

**Journey Fasen:**
- Dag 1-3: "Kennismaking" (intake)
- Dag 4-7: "Basis leggen" (foundation)
- Dag 8-28: "Skills ontwikkelen" (skills)
- Dag 29-58: "Meesterschap" (mastery)
- Dag 59+: "Onderhoud" (maintenance)

**Progress Bar:**
Toont voortgang binnen huidige fase (0-100%)

**Stats Dashboard:**
- **Tools gebruikt:** Aantal unieke tools aangeklikt
- **Steps voltooid:** Aantal coaching stappen afgerond
- **Dag streak:** Consecutieve dagen actief

### Tool Aanbevelingen

**Statussen:**
- Grijs/Wit: Nog niet gebruikt
- Groen met ✓: Al gebruikt
- Hover effect: Lichtjes opgelicht

---

## 🐛 Troubleshooting

### Card Laadt Niet (Alleen Spinner)

**Oorzaak:** Geen coaching profile in database

**Oplossing:** Run het console script uit "Snelle Test" hierboven

### Card Toont Niet (Helemaal Weg)

**Oorzaak:** Geen data in profile OF geen nextAction

**Oplossing:**
```javascript
// Check in console:
const token = localStorage.getItem('datespark_auth_token');
const res = await fetch('/api/coaching-profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profile = await res.json();
console.log('Profile:', profile);

// Als profile leeg is, run PATCH script
```

### Login Loop

**Oorzaak:** Oude middleware cache

**Oplossing:**
1. Hard refresh: **Ctrl+Shift+R**
2. Clear localStorage: `localStorage.clear()`
3. Login opnieuw

### Tools Niet Klikbaar in Coach Advice

**Oorzaak:** Oude versie geladen

**Oplossing:**
1. Check of je op `/onboarding` bent (personality scan flow)
2. Hard refresh de pagina
3. Controleer console voor JavaScript errors

### Goals Niet Aangemaakt

**Check:**
```javascript
// In console:
const token = localStorage.getItem('datespark_auth_token');
const res = await fetch('/api/goals', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const goals = await res.json();
console.log('Goals:', goals);
```

---

## 📊 Verwachte Gedrag

### Na Personality Scan
1. ✅ Coach advice toont met aanbevelingen
2. ✅ Tools zijn klikbaar (cursor pointer on hover)
3. ✅ Bij klik: Toast notification
4. ✅ Navigate naar tool met `?onboarding=true`

### Op Dashboard
1. ✅ Current Focus card bovenaan (na welcome)
2. ✅ Journey dag en fase zichtbaar
3. ✅ Progress bar toont fase voortgang
4. ✅ Weekly focus aanwezig (als set)
5. ✅ Next action toont met priority
6. ✅ Recommended tools klikbaar
7. ✅ Stats tonen accurate counts

### Na Tool Gebruik
1. ✅ tools_used count verhoogt
2. ✅ Tool krijgt checkmark in lijst
3. ✅ Next action kan veranderen (als logica bepaalt)

---

## ✅ Success Criteria

Je implementatie werkt correct als:

- [ ] Current Focus card verschijnt op dashboard
- [ ] Journey dag en fase tonen correct
- [ ] Weekly focus toont (als aanwezig)
- [ ] Next action is klikbaar
- [ ] Recommended tools zijn klikbaar
- [ ] Tool click opent correct tool
- [ ] Goals worden automatisch aangemaakt
- [ ] Stats updaten bij tool gebruik
- [ ] Geen console errors
- [ ] Geen infinite loops
- [ ] Smooth navigatie tussen pagina's

---

## 🎁 Bonus: Advanced Testing

### Test Next Action Logic

Simuleer verschillende journey states:

```javascript
const token = localStorage.getItem('datespark_auth_token');

// Test Dag 1: Nieuwe gebruiker
await fetch('/api/coaching-profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    journeyDay: 1,
    toolsUsed: {},
    completedSteps: ['scan']
  })
});

// Test Dag 5: Wat ervaring
await fetch('/api/coaching-profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    journeyDay: 5,
    toolsUsed: { 'profiel-coach': 2, 'foto-advies': 1 },
    completedSteps: ['scan', 'coach_advice', 'profile_viewed']
  })
});

// Check next action na elke update
const res = await fetch('/api/coaching-profile/next-action', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log('Next Action:', await res.json());
```

### Test Phase Progression

```javascript
const token = localStorage.getItem('datespark_auth_token');

// Test elke fase
const phases = [
  { day: 1, phase: 'intake' },
  { day: 4, phase: 'foundation' },
  { day: 10, phase: 'skills' },
  { day: 30, phase: 'mastery' },
  { day: 60, phase: 'maintenance' }
];

for (const test of phases) {
  await fetch('/api/coaching-profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ journeyDay: test.day })
  });

  console.log(`Dag ${test.day} → Fase should be: ${test.phase}`);
  location.reload();
  // Wacht en check visueel
  await new Promise(r => setTimeout(r, 3000));
}
```

---

## 📞 Hulp Nodig?

**Documentatie:**
- Uitgebreide guide: `SPRINT_1_IMPLEMENTATION_GUIDE.md`
- Quick start: `SPRINT_1_QUICK_START.md`
- Complete analyse: `COACHING_SYSTEM_IMPLEMENTATION_SUMMARY.md`

**Verificatie:**
```bash
node verify-sprint1.js
```

**Server Logs:**
Check de terminal waar `npm run dev` draait voor real-time logs

**Database Check:**
Ga naar Neon dashboard om data te inspecteren:
- Table: `coaching_profiles`
- Check `user_id`, `journey_day`, `current_phase`

---

## 🎉 Veel Succes met Testen!

Je nieuwe Coaching Profile System is een **enorme upgrade** voor je app.

Gebruikers krijgen nu:
- ✅ Duidelijke richting (geen "wat nu?")
- ✅ Zichtbare vooruitgang (journey tracking)
- ✅ Gepersonaliseerde begeleiding (next actions)
- ✅ Motivatie (streaks en stats)

**Dit is het verschil tussen een tool platform en een coaching experience!** 🚀
