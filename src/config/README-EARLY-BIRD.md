# Early Bird Actie - Configuratie & Beheer

## 📅 Huidige Actie Status

**Deadline:** 1 maart 2026 (23:59:59)
**Status:** ✅ Actief
**Dagen resterend:** Wordt automatisch berekend

---

## 🎯 Kortingen

| Programma | Normaal | Early Bird | Korting | % |
|-----------|---------|------------|---------|---|
| **Kickstart** | €97 | €47 | €50 | 51% |
| **Transformatie** | €297 | €147 | €150 | 50% |
| **VIP Reis** | €997 | €797 | €200 | 20% |

---

## 🔧 Hoe werkt het?

### Automatische Features

1. **Auto-hide na deadline**: Badges verdwijnen automatisch na de einddatum
2. **Dynamische tekst**: Badge tekst past zich aan op basis van resterende tijd
3. **Centrale configuratie**: Alle instellingen in één bestand

### Geïmplementeerde Locaties

✅ **Homepage V4** (`/src/app/homepage-v4/page.tsx`)
- Early bird badge in pricing section
- Conditionele weergave

✅ **Prijzen Pagina** (`/src/app/prijzen/page.tsx`)
- Hero section badge
- Programma kaarten

✅ **Program Cards Component** (`/src/components/landing/program-cards.tsx`)
- Alle 3 programma kaarten
- Dynamische badge tekst

---

## 🚀 Hoe de actie te updaten/verlengen?

### Optie 1: Quick Update (Huidige Implementatie)

Update de volgende bestanden:

**1. Homepage V4**
```typescript
// Regel 55-57 in src/app/homepage-v4/page.tsx
const EARLY_BIRD_DEADLINE = 'NIEUWE DATUM';
const EARLY_BIRD_END_DATE = new Date('YYYY-MM-DDTHH:MM:SS');
```

**2. Prijzen Pagina**
```typescript
// Regel 30-32 in src/app/prijzen/page.tsx
const EARLY_BIRD_DEADLINE = 'NIEUWE DATUM';
const EARLY_BIRD_END_DATE = new Date('YYYY-MM-DDTHH:MM:SS');
```

**3. Program Cards**
```typescript
// Regel 10-11 in src/components/landing/program-cards.tsx
const EARLY_BIRD_DEADLINE = 'NIEUWE DATUM';
const EARLY_BIRD_END_DATE = new Date('YYYY-MM-DDTHH:MM:SS');
```

### Optie 2: Pro Setup (Toekomstig - Aanbevolen)

Gebruik de centrale configuratie in `src/config/early-bird.config.ts`:

```typescript
import { EARLY_BIRD_CONFIG } from '@/config/early-bird.config';

// Gebruik in component
{EARLY_BIRD_CONFIG.isActive() && (
  <Badge>
    {EARLY_BIRD_CONFIG.getBadgeText()}
  </Badge>
)}
```

**Voordelen:**
- Eén plek voor alle updates
- Automatische urgentie messaging
- Type-safe met TypeScript
- Helpers voor countdown features

---

## 📊 Monitoring & Analytics

### Te tracken metrics:
- [ ] Conversie rate tijdens early bird vs normaal
- [ ] Welk programma het meest gekozen wordt
- [ ] Drop-off na early bird einde
- [ ] Urgentie effect laatste 3 dagen

### Aanbevolen A/B tests:
- [ ] Countdown timer toevoegen (laatste 48 uur)
- [ ] Verschillende urgentie messaging
- [ ] Badge kleuren (groen vs rood laatste dagen)

---

## 🎨 Styling & Brand Guidelines

### Badge Kleuren
- **Groen** (#10B981 / green-500): Standaard early bird badge
- **Oranje Gradient** (#f59e0b → #ea580c): Hero section badges
- **Rood** (optioneel): Laatste 24 uur urgentie

### Tekst Variaties
- Standaard: "EARLYBIRD t/m [DATUM]"
- Laatste 3 dagen: "EARLYBIRD - Nog X dagen"
- Laatste dag: "LAATSTE KANS - Eindigt vandaag!"

---

## 🔄 Proces: Early Bird Beëindigen

Wanneer de actie afgelopen is:

1. **Niets doen!** - Badges verdwijnen automatisch door `isEarlyBirdActive()` check
2. (Optioneel) Verhoog prijzen naar originele tarieven als korting permanent was
3. Update marketing materialen
4. Plan volgende campagne

---

## 💡 Toekomstige Verbeteringen

### Prioriteit Hoog
- [ ] Migreer naar centrale `early-bird.config.ts`
- [ ] Countdown timer component (laatste 48u)
- [ ] Admin panel om actie te beheren

### Prioriteit Medium
- [ ] Email notificaties bij bijna afgelopen
- [ ] A/B testing framework
- [ ] Scarcity indicators (X plekken over)

### Prioriteit Laag
- [ ] Seizoensgebonden campagnes
- [ ] Personalisatie per gebruiker
- [ ] Loyalty discounts na early bird

---

## 📞 Support

Bij vragen over de early bird configuratie:
- Check deze README eerst
- Zie `src/config/early-bird.config.ts` voor details
- Test lokaal met verschillende datums

**Laatst geupdate:** 14 februari 2026
