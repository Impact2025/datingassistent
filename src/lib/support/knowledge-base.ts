/**
 * Support Knowledge Base
 * Wereldklasse Helpdesk - DatingAssistent.nl
 *
 * Uitgebreide kennisbank voor AI-powered zoeken en support
 */

import type { KBArticle, QuickAction, UserSegment } from './types';

// ============================================================================
// KNOWLEDGE BASE ARTICLES
// ============================================================================

export const KB_ARTICLES: KBArticle[] = [
  // === GETTING STARTED ===
  {
    id: 'getting-started-account',
    slug: 'account-aanmaken',
    title: 'Account aanmaken en activeren',
    summary: 'Stap-voor-stap guide voor het aanmaken van je DatingAssistent account',
    content: `
## Account aanmaken

1. Ga naar datingassistent.nl/register
2. Vul je e-mailadres en kies een sterk wachtwoord
3. Klik op "Account aanmaken"
4. Check je inbox voor de bevestigingsmail
5. Klik op de activatielink in de e-mail

## Problemen met activatie?

- Check je spam/ongewenste mail folder
- De activatielink is 24 uur geldig
- Geen mail ontvangen? Klik op "Opnieuw versturen" op de login pagina

## Na activatie

Je wordt automatisch doorgestuurd naar de onboarding waar je:
- Je profiel kunt invullen
- De hechtingsstijl assessment kunt doen
- Je doelen kunt instellen
    `,
    category: 'Aan de slag',
    tags: ['account', 'registreren', 'activeren', 'email', 'wachtwoord'],
    helpfulCount: 234,
    viewCount: 1890,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'getting-started-onboarding',
    slug: 'eerste-stappen-onboarding',
    title: 'Eerste stappen: De onboarding',
    summary: 'Alles over de onboarding en hoe je het meeste uit DatingAssistent haalt',
    content: `
## De Onboarding Journey

Na het aanmaken van je account doorloop je onze slimme onboarding:

### Stap 1: Persoonlijke Assessments
- **Hechtingsstijl Test** - Ontdek je relationele patroon
- **Emotionele Ready Scan** - Ben je klaar om te daten?
- **Waarden Kompas** - Wat is belangrijk voor jou?

### Stap 2: Profiel Opbouwen
- Upload je beste foto's
- Schrijf je bio (of laat Iris je helpen!)
- Stel je voorkeuren in

### Stap 3: Doelen Bepalen
- Wat zoek je? Casual dates, relatie, of ontdekken?
- Iris past haar advies aan op jouw doelen

## Tips voor de onboarding

- Neem de tijd, haast niet door de assessments
- Wees eerlijk - de AI werkt beter met echte data
- Je kunt altijd terug om antwoorden aan te passen
    `,
    category: 'Aan de slag',
    tags: ['onboarding', 'assessment', 'profiel', 'eerste keer', 'start'],
    helpfulCount: 189,
    viewCount: 1456,
    videoUrl: '/tutorials/onboarding-guide',
    lastUpdated: '2024-11-28',
  },

  // === FEATURES & TOOLS ===
  {
    id: 'feature-iris-coach',
    slug: 'iris-ai-coach',
    title: 'Iris: Je Persoonlijke AI Dating Coach',
    summary: 'Leer hoe je het meeste uit Iris haalt, je 24/7 beschikbare dating coach',
    content: `
## Wat is Iris?

Iris is je persoonlijke AI dating coach die:
- Je hechtingsstijl en waarden kent
- 24/7 beschikbaar is voor advies
- Gepersonaliseerde tips geeft
- Je berichten helpt schrijven
- Date ideeën genereert

## Hoe gebruik je Iris?

### In het Dashboard
Klik op het Iris icoon rechtsonder om direct te chatten.

### Contextual Help
Op elke pagina kun je Iris om hulp vragen over die specifieke feature.

### Voorbeeldvragen voor Iris
- "Hoe verbeter ik mijn profielfoto's?"
- "Help me een opener schrijven voor [naam]"
- "Wat zijn goede date ideeën in Amsterdam?"
- "Ik voel me onzeker, help me"

## Iris Modes

Iris schakelt automatisch naar de juiste modus:
- **Profiel Review** - Feedback op je profiel
- **Match Analyse** - Hulp bij matches begrijpen
- **Date Prep** - Voorbereiding op dates
- **Bericht Review** - Help bij berichten schrijven
    `,
    category: 'Features & Tools',
    tags: ['iris', 'ai', 'coach', 'chat', 'advies', 'hulp'],
    helpfulCount: 312,
    viewCount: 2890,
    lastUpdated: '2024-12-03',
  },
  {
    id: 'feature-photo-analysis',
    slug: 'foto-analyse',
    title: 'Foto Analyse: Optimaliseer je profielfoto\'s',
    summary: 'AI-powered analyse van je dating foto\'s met concrete verbeterpunten',
    content: `
## Hoe werkt Foto Analyse?

Onze AI analyseert je foto's op:
- **Eerste indruk** - Wat straalt de foto uit?
- **Technische kwaliteit** - Belichting, scherpte, achtergrond
- **Emotie & Uitstraling** - Lach, oogcontact, houding
- **Geschiktheid voor dating** - Werkt deze foto op dating apps?

## Foto uploaden

1. Ga naar Dashboard > Foto Analyse
2. Upload je foto (max 10MB, JPG/PNG)
3. Wacht 10-30 seconden op de analyse
4. Bekijk je gedetailleerde rapport

## Tips voor betere foto's

- Gebruik natuurlijk licht (bij raam of buiten)
- Kijk in de camera voor connectie
- Lach natuurlijk, niet geforceerd
- Toon je hobby's en interesses
- Vermijd groepsfoto's als hoofdfoto
    `,
    category: 'Features & Tools',
    tags: ['foto', 'analyse', 'profiel', 'tips', 'verbeteren'],
    helpfulCount: 267,
    viewCount: 2134,
    videoUrl: '/tutorials/foto-analyse',
    lastUpdated: '2024-11-25',
  },
  {
    id: 'feature-opener-lab',
    slug: 'opener-lab',
    title: 'Opener Lab: Perfecte openingszinnen',
    summary: 'Genereer gepersonaliseerde openingszinnen voor je matches',
    content: `
## Opener Lab

Nooit meer "Hoi, hoe gaat het?" - laat de AI unieke openers genereren.

## Hoe het werkt

1. Voer informatie in over je match
   - Naam
   - Interesses (uit profiel)
   - Bijzonderheden die opvielen
2. Kies je stijl (grappig, serieus, creatief)
3. Ontvang 3-5 gepersonaliseerde openers
4. Pas aan naar je eigen stem

## Voorbeelden

**Input:** Lisa, houdt van reizen en koken
**Output:** "Lisa, als je één gerecht uit al je reizen mocht meenemen naar een onbewoond eiland, welke zou dat zijn? Ik stem voor Thaise curry! 🌶️"

## Tips

- Verwijs naar specifieke profieldetails
- Stel een vraag om reactie uit te lokken
- Wees authentiek - pas de suggestie aan
- Test verschillende stijlen
    `,
    category: 'Features & Tools',
    tags: ['opener', 'berichten', 'match', 'gesprek', 'starten'],
    helpfulCount: 445,
    viewCount: 3567,
    lastUpdated: '2024-12-01',
  },

  // === ABONNEMENTEN & BILLING ===
  {
    id: 'billing-plans',
    slug: 'abonnementen-overzicht',
    title: 'Abonnementen & Prijzen',
    summary: 'Overzicht van alle DatingAssistent abonnementen en wat ze bevatten',
    content: `
## Onze Abonnementen

### Core - €29/maand
- Iris AI Coach (basis)
- Profiel analyse
- 10 opener suggesties/maand
- Email support

### Pro - €49/maand
- Alles van Core, plus:
- Onbeperkt Iris gesprekken
- Foto analyse
- Date Planner
- Priority support

### Premium AI - €99/maand
- Alles van Pro, plus:
- Geavanceerde AI matching
- Video date coaching
- 1-op-1 support calls
- Exclusieve content

### 21-Dagen Kickstart - €197 eenmalig
- Intensief 3-weken programma
- Dagelijkse video's & opdrachten
- Persoonlijke begeleiding
- Lifetime toegang tot content

## Betalen & Opzeggen

- Betaal met iDEAL, creditcard, of PayPal
- Maandelijks opzegbaar, geen verplichtingen
- Jaarabonnement = 2 maanden gratis
    `,
    category: 'Abonnementen',
    tags: ['prijzen', 'abonnement', 'kosten', 'premium', 'pro', 'core'],
    helpfulCount: 189,
    viewCount: 4532,
    lastUpdated: '2024-12-02',
  },
  {
    id: 'billing-payment-issues',
    slug: 'betaling-problemen',
    title: 'Betaling mislukt of problemen',
    summary: 'Hulp bij betalingsproblemen en hoe je ze oplost',
    content: `
## Betaling mislukt?

### Stap 1: Check je betaalmethode
- Is je kaart nog geldig?
- Heb je voldoende saldo?
- Is online betalen geactiveerd?

### Stap 2: Probeer opnieuw
1. Ga naar Dashboard > Abonnement
2. Klik op "Betaling opnieuw proberen"
3. Of kies een andere betaalmethode

### Stap 3: Alternatieve betaalmethode
- iDEAL (NL banken)
- Creditcard (Visa, Mastercard)
- PayPal
- Bankoverschrijving (op aanvraag)

## Nog steeds problemen?

Neem contact op met support:
- Live chat (direct)
- Email: support@datingassistent.nl
- We lossen het binnen 24 uur op

## Geld-terug garantie

Niet tevreden? Binnen 14 dagen kun je je geld terugvragen, geen vragen gesteld.
    `,
    category: 'Abonnementen',
    tags: ['betaling', 'mislukt', 'probleem', 'creditcard', 'ideal', 'geld'],
    helpfulCount: 156,
    viewCount: 987,
    lastUpdated: '2024-11-30',
  },
  {
    id: 'billing-cancel',
    slug: 'abonnement-opzeggen',
    title: 'Abonnement opzeggen',
    summary: 'Hoe je je abonnement kunt opzeggen of pauzeren',
    content: `
## Abonnement opzeggen

### Via je Dashboard
1. Ga naar Dashboard > Abonnement
2. Scroll naar "Abonnement beheren"
3. Klik op "Opzeggen"
4. Bevestig je keuze

### Wat gebeurt er na opzegging?
- Je behoudt toegang tot het einde van je betaalperiode
- Je data blijft bewaard (30 dagen)
- Je kunt altijd opnieuw activeren

## Liever pauzeren?

Ga je op vakantie of even focussen op andere dingen?
- Pauzeer tot 3 maanden zonder kosten
- Je data en voortgang blijft bewaard
- Hervat wanneer je wilt

## Feedback

We vinden het jammer dat je gaat! Help ons verbeteren:
- Wat misten we?
- Wat kunnen we beter doen?

Mail je feedback naar feedback@datingassistent.nl
    `,
    category: 'Abonnementen',
    tags: ['opzeggen', 'annuleren', 'stoppen', 'pauzeren'],
    helpfulCount: 134,
    viewCount: 876,
    lastUpdated: '2024-11-28',
  },

  // === ACCOUNT & PRIVACY ===
  {
    id: 'account-password-reset',
    slug: 'wachtwoord-vergeten',
    title: 'Wachtwoord vergeten of resetten',
    summary: 'Stappen om je wachtwoord te resetten en weer toegang te krijgen',
    content: `
## Wachtwoord resetten

### Via de login pagina
1. Ga naar datingassistent.nl/login
2. Klik op "Wachtwoord vergeten?"
3. Vul je e-mailadres in
4. Check je inbox (ook spam!)
5. Klik op de reset link
6. Kies een nieuw, sterk wachtwoord

### Tips voor een sterk wachtwoord
- Minimaal 8 karakters
- Mix van letters, cijfers, symbolen
- Niet je naam of geboortedatum
- Uniek voor DatingAssistent

## Geen reset email ontvangen?

- Check je spam/ongewenste mail
- Wacht 5 minuten en probeer opnieuw
- Gebruik je het juiste e-mailadres?
- Neem contact op met support

## Account beveiligen

Na het resetten, overweeg:
- 2-factor authenticatie inschakelen
- Je wachtwoord manager gebruiken
    `,
    category: 'Account & Privacy',
    tags: ['wachtwoord', 'vergeten', 'reset', 'login', 'toegang'],
    helpfulCount: 298,
    viewCount: 1654,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'account-privacy',
    slug: 'privacy-en-data',
    title: 'Privacy & Je Data',
    summary: 'Hoe we met je data omgaan en je privacy rechten',
    content: `
## Onze Privacy Belofte

- Je data is van jou, niet van ons
- We verkopen NOOIT je gegevens
- Alles is versleuteld opgeslagen
- GDPR/AVG compliant

## Wat we opslaan

- Account gegevens (email, naam)
- Assessment resultaten
- Gesprekken met Iris
- Gebruiksstatistieken

## Wat we NIET opslaan

- Wachtwoorden (alleen gehashte versie)
- Betaalgegevens (via beveiligde payment provider)
- Gesprekken met derden

## Je rechten

### Data inzien
Dashboard > Instellingen > Privacy > "Download mijn data"

### Data verwijderen
Dashboard > Instellingen > Account > "Account verwijderen"
- Alle data wordt binnen 30 dagen gewist
- Dit is onomkeerbaar

### Data corrigeren
Pas je gegevens aan via Dashboard > Profiel
    `,
    category: 'Account & Privacy',
    tags: ['privacy', 'data', 'gdpr', 'avg', 'verwijderen', 'rechten'],
    helpfulCount: 167,
    viewCount: 934,
    lastUpdated: '2024-11-25',
  },

  // === TROUBLESHOOTING ===
  {
    id: 'trouble-login',
    slug: 'kan-niet-inloggen',
    title: 'Kan niet inloggen - Probleemoplossing',
    summary: 'Stap-voor-stap hulp bij inlogproblemen',
    content: `
## Inlogproblemen oplossen

### Stap 1: Basis checks
- Is je internetverbinding stabiel?
- Gebruik je het juiste e-mailadres?
- Let op hoofdletters in je wachtwoord

### Stap 2: Browser problemen
- Wis je browser cache en cookies
- Probeer een incognito/privé venster
- Test een andere browser (Chrome, Firefox, Safari)

### Stap 3: Account status
- Is je account geactiveerd? Check je email
- Is je abonnement nog actief?

### Stap 4: Wachtwoord resetten
Als bovenstaande niet werkt:
1. Klik op "Wachtwoord vergeten"
2. Volg de instructies in de email

## Nog steeds problemen?

Neem contact op via live chat of email met:
- Je e-mailadres
- Browser en apparaat
- Foutmelding (screenshot helpt!)
    `,
    category: 'Probleemoplossing',
    tags: ['login', 'inloggen', 'probleem', 'error', 'toegang'],
    helpfulCount: 234,
    viewCount: 1345,
    lastUpdated: '2024-12-02',
  },
  {
    id: 'trouble-app-slow',
    slug: 'app-traag-of-crasht',
    title: 'App traag of crasht',
    summary: 'Oplossingen voor prestatieproblemen',
    content: `
## App presteert niet goed?

### Snelle fixes

1. **Vernieuw de pagina** (F5 of Ctrl+R)
2. **Wis browser cache**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

3. **Check je internet**
   - Minimaal 4G of stabiel WiFi
   - Test op speedtest.net

### Browser optimaliseren

- Update naar laatste versie
- Schakel extensies tijdelijk uit
- Sluit andere tabbladen

### Apparaat checks

- Herstart je apparaat
- Check beschikbare opslag
- Update je besturingssysteem

## Blijft het probleem?

Stuur ons:
- Browser versie
- Apparaat type
- Screenshot van het probleem
- Console errors (F12 > Console)
    `,
    category: 'Probleemoplossing',
    tags: ['traag', 'langzaam', 'crash', 'laden', 'performance'],
    helpfulCount: 145,
    viewCount: 678,
    lastUpdated: '2024-11-28',
  },
];

// ============================================================================
// QUICK ACTIONS PER USER SEGMENT
// ============================================================================

export const QUICK_ACTIONS: QuickAction[] = [
  // NEW USERS (< 7 dagen)
  {
    id: 'action-complete-profile',
    title: 'Maak je profiel af',
    description: 'Voltooi je profiel voor betere resultaten',
    icon: 'UserCircle',
    action: 'link',
    target: '/dashboard?tab=profiel',
    priority: 1,
    segments: ['new_user'],
  },
  {
    id: 'action-first-tutorial',
    title: 'Bekijk de startersgids',
    description: '5-minuten video over de belangrijkste features',
    icon: 'PlayCircle',
    action: 'modal',
    target: 'tutorial-video',
    priority: 2,
    segments: ['new_user'],
  },
  {
    id: 'action-chat-iris-new',
    title: 'Stel Iris een vraag',
    description: 'Je AI coach staat klaar om te helpen',
    icon: 'MessageCircle',
    action: 'chat',
    target: 'iris-support',
    priority: 3,
    segments: ['new_user'],
  },

  // ACTIVE DATERS
  {
    id: 'action-improve-chat',
    title: 'Verbeter je gesprekken',
    description: 'Tips voor betere matches en dates',
    icon: 'Zap',
    action: 'link',
    target: '/dashboard?tab=chat-coach',
    priority: 1,
    segments: ['active_dater'],
  },
  {
    id: 'action-photo-tips',
    title: 'Foto analyse',
    description: 'AI feedback op je profielfoto\'s',
    icon: 'Camera',
    action: 'link',
    target: '/dashboard?tab=foto-analyse',
    priority: 2,
    segments: ['active_dater'],
  },

  // STRUGGLING USERS
  {
    id: 'action-book-call',
    title: 'Gratis adviesgesprek',
    description: '15 min persoonlijke hulp van ons team',
    icon: 'Phone',
    action: 'link',
    target: '/book-call',
    priority: 1,
    segments: ['struggling'],
  },
  {
    id: 'action-profile-review',
    title: 'AI Profiel Review',
    description: 'Laat Iris je profiel analyseren',
    icon: 'Search',
    action: 'chat',
    target: 'iris-profile-review',
    priority: 2,
    segments: ['struggling'],
  },
  {
    id: 'action-success-stories',
    title: 'Lees succesverhalen',
    description: 'Inspiratie van andere gebruikers',
    icon: 'Heart',
    action: 'link',
    target: '/succesverhalen',
    priority: 3,
    segments: ['struggling'],
  },

  // PREMIUM USERS
  {
    id: 'action-vip-support',
    title: 'VIP Support',
    description: 'Priority hulp voor Premium leden',
    icon: 'Crown',
    action: 'chat',
    target: 'vip-support',
    priority: 1,
    segments: ['premium'],
  },
  {
    id: 'action-account-manager',
    title: 'Account Manager',
    description: 'Direct contact met je persoonlijke begeleider',
    icon: 'User',
    action: 'link',
    target: '/account-manager',
    priority: 2,
    segments: ['premium'],
  },

  // CHURNING USERS
  {
    id: 'action-whats-new',
    title: 'Wat is er nieuw?',
    description: 'Bekijk de laatste features en updates',
    icon: 'Sparkles',
    action: 'link',
    target: '/updates',
    priority: 1,
    segments: ['churning'],
  },
  {
    id: 'action-reactivate-offer',
    title: 'Welkom terug aanbieding',
    description: 'Speciale korting voor terugkerende gebruikers',
    icon: 'Gift',
    action: 'modal',
    target: 'reactivate-offer',
    priority: 2,
    segments: ['churning'],
  },

  // ANONYMOUS (not logged in)
  {
    id: 'action-how-it-works',
    title: 'Hoe werkt het?',
    description: 'Ontdek wat DatingAssistent voor jou kan doen',
    icon: 'HelpCircle',
    action: 'link',
    target: '/hoe-werkt-het',
    priority: 1,
    segments: ['anonymous'],
  },
  {
    id: 'action-try-free',
    title: 'Probeer gratis',
    description: 'Start vandaag nog met je dating journey',
    icon: 'ArrowRight',
    action: 'link',
    target: '/register',
    priority: 2,
    segments: ['anonymous'],
  },
  {
    id: 'action-chat-questions',
    title: 'Stel een vraag',
    description: 'Chat met onze AI voor antwoorden',
    icon: 'MessageCircle',
    action: 'chat',
    target: 'iris-anonymous',
    priority: 3,
    segments: ['anonymous'],
  },
];

// ============================================================================
// FAQ CATEGORIES
// ============================================================================

export const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Aan de slag',
    icon: 'Rocket',
    description: 'Eerste stappen en onboarding',
  },
  {
    id: 'features',
    title: 'Features & Tools',
    icon: 'Wrench',
    description: 'Hoe de tools werken',
  },
  {
    id: 'billing',
    title: 'Abonnementen',
    icon: 'CreditCard',
    description: 'Prijzen, betaling, opzeggen',
  },
  {
    id: 'account',
    title: 'Account & Privacy',
    icon: 'Shield',
    description: 'Instellingen en data',
  },
  {
    id: 'troubleshooting',
    title: 'Probleemoplossing',
    icon: 'AlertTriangle',
    description: 'Hulp bij problemen',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getArticlesByCategory(category: string): KBArticle[] {
  return KB_ARTICLES.filter(
    (article) => article.category.toLowerCase() === category.toLowerCase()
  );
}

export function getQuickActionsForSegment(segment: UserSegment): QuickAction[] {
  return QUICK_ACTIONS
    .filter((action) => action.segments.includes(segment))
    .sort((a, b) => a.priority - b.priority);
}

export function searchKnowledgeBase(query: string): KBArticle[] {
  const lowerQuery = query.toLowerCase();
  return KB_ARTICLES.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.summary.toLowerCase().includes(lowerQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  ).slice(0, 10);
}

export function getPopularArticles(limit = 5): KBArticle[] {
  return [...KB_ARTICLES]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function getRelatedArticles(articleId: string, limit = 3): KBArticle[] {
  const article = KB_ARTICLES.find((a) => a.id === articleId);
  if (!article) return [];

  return KB_ARTICLES
    .filter((a) => a.id !== articleId)
    .filter((a) =>
      a.category === article.category ||
      a.tags.some((tag) => article.tags.includes(tag))
    )
    .slice(0, limit);
}
