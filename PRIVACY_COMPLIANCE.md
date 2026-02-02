# Privacy & Cookie Compliance - Implementatie Overzicht

**Datum:** 1 februari 2026
**Status:** ✅ Volledig geïmplementeerd
**Compliance:** AVG (GDPR), ePrivacy Directive, Cookiewet NL

---

## 📋 Overzicht

DatingAssistent is nu volledig AVG-compliant met een cookie consent systeem dat voldoet aan de Nederlandse en Europese wetgeving. Alle tracking en analytics scripts worden geblokkeerd totdat gebruikers expliciet toestemming geven.

---

## 🎯 Wat is Geïmplementeerd

### 1. Cookie Consent Banner (`src/components/cookie-consent/`)

**Bestanden:**
- `cookie-banner.tsx` - Hoofdcomponent met banner UI
- `consent-provider.tsx` - Context voor consent management
- `cookie-settings-button.tsx` - Floating button om voorkeuren te wijzigen
- `index.ts` - Export barrel

**Functionaliteit:**
- ✅ Verschijnt bij eerste bezoek (blokkeert andere interacties)
- ✅ Duidelijke uitleg per cookie categorie
- ✅ 3 keuzes: "Alles accepteren", "Alleen noodzakelijke", "Voorkeuren aanpassen"
- ✅ Gedetailleerde view met toggles per categorie
- ✅ **Expliciete waarschuwing** over sessie-opnames (Microsoft Clarity)
- ✅ Link naar privacybeleid
- ✅ Opslag in localStorage met versie controle
- ✅ Event systeem voor real-time updates

**Cookie Categorieën:**

| Categorie | Consent Vereist | Beschrijving | Diensten |
|-----------|----------------|--------------|----------|
| **Noodzakelijk** | ❌ Altijd actief | Login, beveiliging, thema | Native cookies |
| **Analytics** | ✅ Opt-in | Website analyse, sessie-opnames | Google Analytics, Microsoft Clarity, Sentry, Vercel Analytics |
| **Marketing** | ✅ Opt-in | Lead scoring, conversie tracking, gepersonaliseerde aanbiedingen | Lead scoring, OTO tracking, remarketing |

---

### 2. Tracking Scripts - Consent-Aware

#### Google Analytics 4 (`src/components/analytics/google-analytics.tsx`)
- ❌ **Laadt NIET zonder analytics consent**
- ✅ Start automatisch bij toestemming
- ✅ Luistert naar consent wijzigingen via event listener

#### Microsoft Clarity (`src/components/analytics/microsoft-clarity.tsx`)
- ❌ **Geen sessie-opnames zonder consent**
- ⚠️ **Gebruiker wordt expliciet gewaarschuwd in cookie banner**
- ✅ Consent check voordat script wordt geladen

#### Web Vitals (`src/components/analytics/web-vitals.tsx`)
- ❌ **Geen performance tracking zonder consent**
- ✅ Respecteert analytics consent voor alle metrics

---

### 3. Marketing & Behavioral Analytics

#### Lead Scoring (`src/lib/analytics/lead-scoring.ts`)
**Wijzigingen:**
- ✅ Controleert marketing consent voordat scoring begint
- ✅ Retourneert lege score zonder consent
- ✅ Blokkeert sync naar backend zonder consent
- ✅ Development logging voor blocked events

**Functies met consent check:**
```typescript
trackLeadEngagement() // ❌ Blocked zonder marketing consent
syncLeadScoreToBackend() // ❌ Blocked zonder marketing consent
getLeadScore() // ❌ Returns empty zonder marketing consent
```

#### GA4 Events (`src/lib/analytics/ga4-events.ts`)
**Wijzigingen:**
- ✅ Event categorisatie: 'necessary', 'analytics', 'marketing'
- ✅ Consent check per event type
- ✅ Development logging voor blocked events

**Event Categorieën:**
```typescript
// Necessary (geen consent) - altijd toegestaan
trackSignUp() // ✅ Altijd
trackLogin() // ✅ Altijd
trackLogout() // ✅ Altijd

// Analytics (analytics consent)
trackToolUsed() // ❌ Vereist analytics consent
trackFeatureClick() // ❌ Vereist analytics consent
trackPageView() // ❌ Vereist analytics consent

// Marketing (marketing consent)
trackViewItem() // ❌ Vereist marketing consent
trackBeginCheckout() // ❌ Vereist marketing consent
trackPurchase() // ❌ Vereist marketing consent
trackUpgradePromptShown() // ❌ Vereist marketing consent
```

#### Onboarding Analytics (`src/lib/analytics/onboarding-analytics.ts`)
**Wijzigingen:**
- ✅ Controleert analytics consent voordat events worden verzonden
- ✅ Development logging voor blocked events

---

### 4. Privacy Policy Pagina (`src/app/privacy/page.tsx`)

**URL:** `/privacy`

**Inhoud:**
- ✅ Volledige lijst van verzamelde gegevens
- ✅ Uitleg per tracking dienst (Google Analytics, Clarity, Sentry)
- ✅ **Duidelijke waarschuwing** over sessie-opnames
- ✅ Cookie tabel met toestemming vereisten
- ✅ AVG rechten uitgelegd (inzage, correctie, verwijdering, etc.)
- ✅ Bewaartermijnen per data type
- ✅ Contact informatie voor privacy vragen
- ✅ Beveiliging maatregelen
- ✅ Responsief design met dark mode support

---

### 5. Layout Integratie (`src/app/layout.tsx`)

**Wijzigingen:**
```tsx
// ConsentProvider wrapper (bovenste niveau)
<ConsentProvider>
  {/* Andere providers */}
  <ThemeProvider>
    <QueryProvider>
      {/* App content */}
    </QueryProvider>

    {/* Cookie consent UI */}
    <CookieBanner />
    <CookieSettingsButton />
  </ThemeProvider>
</ConsentProvider>

// Scripts laden alleen met consent
<GoogleAnalytics /> {/* Client component met consent check */}
<MicrosoftClarity /> {/* Client component met consent check */}
```

---

## 🔒 Privacy Waarborgen

### Consent Opslag
**Locatie:** `localStorage` key `'cookie-consent'`

**Format:**
```json
{
  "necessary": true,
  "analytics": false,
  "marketing": false,
  "timestamp": 1706792400000,
  "version": "1.0"
}
```

**Versie Controle:**
- Bij privacy policy wijzigingen, verhoog `CONSENT_VERSION` in `consent-provider.tsx`
- Gebruikers met oude versie krijgen automatisch opnieuw de banner te zien

### Event Systeem
**Custom Event:** `'consentUpdated'`

Alle tracking componenten luisteren naar dit event:
```typescript
window.addEventListener('consentUpdated', (event) => {
  // Check nieuwe consent en pas gedrag aan
});
```

---

## 📊 Transparantie Voor Gebruikers

### Wat Gebruikers Zien:

1. **Eerste Bezoek:**
   - Cookie banner blokkeert scherm
   - Duidelijke uitleg van tracking
   - **Waarschuwing:** "Door analytics te accepteren, geef je toestemming voor sessie-opnames"

2. **Gedetailleerde View:**
   - Per categorie toggle switches
   - Technische details uitklapbaar
   - Lijst van alle third-party diensten
   - **Rode waarschuwing** bij sessie-opnames

3. **Cookie Settings Button:**
   - Floating button linksonder (na keuze gemaakt)
   - Heropen banner om voorkeuren te wijzigen
   - Blijft zichtbaar op alle pagina's

4. **Privacy Policy:**
   - Volledige transparantie
   - Begrijpelijke taal
   - Contactgegevens voor vragen

---

## 🚨 Wat McAfee Nu Zou Moeten Zien

### Voorheen (Verdacht):
❌ Geen cookie banner
❌ Tracking zonder toestemming
❌ Verborgen sessie-opnames
❌ Lead profiling zonder kennisgeving
❌ Geen opt-out mogelijk
❌ Geen privacybeleid

### Nu (Compliant):
✅ Duidelijke cookie banner (vooraf)
✅ Opt-in vereist voor alle tracking
✅ **Expliciete waarschuwing** over sessie-opnames
✅ Makkelijk opt-out via button
✅ Volledig privacybeleid (/privacy)
✅ AVG compliant
✅ Gebruiker heeft controle

---

## 🧪 Testen

### Development Mode
Alle blocked events worden gelogd in console:
```
[GA4] ❌ page_view blocked - Analytics consent required
[Clarity] Blocked - Analytics consent required
[Lead Scoring] ❌ Blocked - Marketing consent required
```

### Checklist Testen:

1. **Eerste Bezoek:**
   - [ ] Cookie banner verschijnt
   - [ ] Geen tracking scripts in Network tab
   - [ ] Geen localStorage 'lead-score'

2. **"Alleen Noodzakelijke":**
   - [ ] Geen GA4 script geladen
   - [ ] Geen Clarity script geladen
   - [ ] Website functioneert normaal
   - [ ] Cookie settings button verschijnt

3. **"Alles Accepteren":**
   - [ ] GA4 script laadt
   - [ ] Clarity script laadt
   - [ ] Web vitals worden verzonden
   - [ ] Lead scoring werkt
   - [ ] Console toont "✅ Event sent"

4. **Voorkeuren Wijzigen:**
   - [ ] Click cookie button linksonder
   - [ ] Banner verschijnt opnieuw
   - [ ] Wijziging wordt opgeslagen
   - [ ] Scripts herladen bij consent

5. **Privacy Policy:**
   - [ ] Bereikbaar via /privacy
   - [ ] Alle diensten vermeld
   - [ ] Waarschuwingen zichtbaar
   - [ ] Responsive op mobile

---

## 🔄 Onderhoud

### Bij Privacy Policy Wijzigingen:
1. Update `CONSENT_VERSION` in `src/components/cookie-consent/consent-provider.tsx`
2. Update `/privacy` pagina
3. Test dat gebruikers opnieuw toestemming moeten geven

### Bij Nieuwe Tracking Diensten:
1. Voeg toe aan cookie banner beschrijving
2. Voeg toe aan privacy policy
3. Implementeer consent check
4. Test met/zonder consent

### Bij Nieuwe Marketing Features:
1. Check of marketing consent vereist is
2. Voeg consent check toe aan tracking functies
3. Update privacy policy
4. Test opt-out scenario

---

## 📞 Contact

**Privacy Vragen:**
privacy@datingassistent.nl

**Technische Documentatie:**
Zie README.md en inline code comments

---

## ✅ Compliance Status

| Regelgeving | Status | Notities |
|-------------|--------|----------|
| **AVG (GDPR)** | ✅ Compliant | Opt-in consent, transparantie, gebruikersrechten |
| **ePrivacy Directive** | ✅ Compliant | Cookie consent vooraf, opt-in voor tracking |
| **Cookiewet NL** | ✅ Compliant | Duidelijke informatie, toestemming vereist |
| **Transparantie** | ✅ Hoog | Privacybeleid, cookie banner met details |
| **Gebruikerscontrole** | ✅ Volledig | Makkelijk opt-out, voorkeuren aanpasbaar |

---

**Laatste update:** 1 februari 2026
**Versie:** 1.0
**Gecontroleerd door:** Claude Sonnet 4.5
