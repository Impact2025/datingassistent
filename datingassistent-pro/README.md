# 🎓 DATINGASSISTENT CURSUS SYSTEEM
## Professionele Database Architectuur v2.0

---

## 📦 WAT ZIT ER IN DIT PAKKET

```
datingassistent-pro/
│
├── 📁 migrations/                    # Database migraties
│   ├── 001_cursus_systeem.sql        # Schema voor cursus systeem
│   └── 002_seed_profielfoto_cursus.sql   # Eerste cursus data
│
├── 📁 types/                         # TypeScript definities
│   └── cursus.types.ts               # Alle interfaces
│
├── 📁 lib/                           # Utility functies
│   └── iris-context.ts               # Iris AI context builder
│
└── 📁 api/                           # API route voorbeelden
    ├── cursussen/[slug]/route.ts     # GET/POST cursus data
    └── iris/chat/route.ts            # Chat met Iris
```

---

## 🚀 INSTALLATIE

### Stap 1: Kopieer bestanden naar je project

```bash
# Kopieer types
cp types/cursus.types.ts your-app/src/types/

# Kopieer lib
cp lib/iris-context.ts your-app/src/lib/

# Kopieer API routes
cp -r api/* your-app/src/app/api/
```

### Stap 2: Run database migraties

```bash
# Via psql
psql -d your_database -f migrations/001_cursus_systeem.sql
psql -d your_database -f migrations/002_seed_profielfoto_cursus.sql

# Of via Vercel Postgres dashboard:
# 1. Open je Neon console
# 2. Ga naar SQL Editor
# 3. Plak de inhoud van beide .sql bestanden
# 4. Run
```

### Stap 3: Installeer dependencies (indien nodig)

```bash
npm install @anthropic-ai/sdk  # Voor Iris AI
```

---

## 📊 DATABASE SCHEMA

### Nieuwe Tabellen

| Tabel | Doel | Relaties |
|-------|------|----------|
| `cursussen` | Cursus metadata | - |
| `cursus_lessen` | Lessen per cursus | → cursussen |
| `cursus_secties` | Content per les | → cursus_lessen |
| `cursus_quiz_vragen` | Quiz vragen | → cursus_secties |
| `iris_user_context` | Iris kent de gebruiker | → users |
| `iris_conversation_memory` | Gesprek historie | → users |
| `cursus_quiz_antwoorden` | Quiz antwoorden | → users, quiz_vragen |
| `cursus_reflectie_antwoorden` | Reflectie antwoorden | → users, secties |

### Bestaande Tabellen (uitgebreid)

| Tabel | Wijziging |
|-------|-----------|
| `cursus_progress` | Werkt nu met cursus_lessen via slug |
| `cursus_exercise_answers` | Blijft werken, quiz_antwoorden is specifieker |

---

## 🧠 HOE IRIS DE GEBRUIKER LEERT KENNEN

```
┌─────────────────────────────────────────────────────────┐
│  DATA BRONNEN                                           │
├─────────────────────────────────────────────────────────┤
│  • Quiz scores          → iris_user_context             │
│  • Reflectie antwoorden → reflectie_inzichten           │
│  • Assessment resultaten → hechtingsstijl, etc.         │
│  • Gesprekken met Iris   → conversation_memory          │
│  • Cursus voortgang      → huidige_cursus/les           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  buildIrisSystemPrompt()                                │
├─────────────────────────────────────────────────────────┤
│  Combineert alle data tot één system prompt:            │
│                                                         │
│  "Je bent Iris...                                       │
│                                                         │
│   WAT JE WEET OVER DEZE GEBRUIKER:                      │
│   - Dating doel: serieuze relatie                       │
│   - Hechtingsstijl: angstig                             │
│   - Sterke punten: humor, empathie                      │
│   - Ontwikkelpunten: zelfvertrouwen                     │
│   - Gebruikt: Tinder, Bumble                            │
│                                                         │
│   HUIDIGE LES CONTEXT:                                  │
│   [ai_coach_context uit cursus_lessen]                  │
│                                                         │
│   BELANGRIJKE INZICHTEN:                                │
│   - 'ik twijfel vaak aan mijn lach'                     │
│   - 'vorige relatie eindigde slecht'                    │
│   ..."                                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GEPERSONALISEERDE IRIS RESPONSE                        │
├─────────────────────────────────────────────────────────┤
│  "Ik snap dat je twijfelt aan je lach - dat past bij    │
│   wat je eerder deelde. Maar weet je, met jouw          │
│   empathie en humor heb je juist veel te bieden..."     │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 SECTIE TYPES

De `inhoud` JSONB kolom heeft verschillende structuren per type:

### `video`
```json
{
  "introTekst": "In deze video leer je..."
}
```

### `tekst`
```json
{
  "body": "Je hebt maar 7 seconden...",
  "format": "plain"  // of "markdown", "html"
}
```

### `kernpunten`
```json
{
  "punten": [
    {
      "icon": "sunglasses",
      "titel": "Fout #1: Zonnebrillen",
      "beschrijving": "Ogen zijn het raam..."
    }
  ]
}
```

### `quiz`
```json
{
  "succesMessage": "Goed gedaan!",
  "minimumScore": 2
}
```
(Vragen staan in `cursus_quiz_vragen` tabel)

### `reflectie`
```json
{
  "vragen": ["Bekijk je huidige foto's..."],
  "aiAnalyse": false
}
```

### `opdracht`
```json
{
  "stappen": ["Stap 1...", "Stap 2..."],
  "tijdsduur": "30 minuten",
  "benodigdheden": ["Smartphone", "Vriend"]
}
```

### `tool`
```json
{
  "toolId": "foto-checker",
  "introTekst": "Upload een foto...",
  "ctaTekst": "Check mijn foto"
}
```

### `tip`
```json
{
  "tekst": "Pro tip: Vraag een vriend..."
}
```

---

## 🔧 API ENDPOINTS

### GET `/api/cursussen/[slug]`
Haalt cursus op met lessen, secties en quiz vragen.

**Response:**
```json
{
  "id": 1,
  "slug": "profielfoto-5-stappen",
  "titel": "De Perfecte Profielfoto",
  "lessen": [
    {
      "id": 1,
      "slug": "les-1-fotofouten",
      "secties": [...],
      "user_progress": {
        "status": "bezig",
        "completion_percentage": 50
      }
    }
  ]
}
```

### POST `/api/cursussen/[slug]/voortgang`
Update gebruiker voortgang.

**Request:**
```json
{
  "les_slug": "les-1-fotofouten",
  "status": "afgerond",
  "completed_exercises": 3,
  "total_exercises": 3
}
```

### POST `/api/iris/chat`
Chat met Iris AI coach.

**Request:**
```json
{
  "message": "Ik twijfel aan mijn foto's",
  "context_type": "cursus",
  "context_cursus_slug": "profielfoto-5-stappen",
  "context_les_slug": "les-1-fotofouten"
}
```

**Response:**
```json
{
  "response": "Ik snap dat je twijfelt...",
  "sentiment": "bezorgd"
}
```

---

## ✅ CHECKLIST VOOR IMPLEMENTATIE

### Database
- [ ] Run `001_cursus_systeem.sql`
- [ ] Run `002_seed_profielfoto_cursus.sql`
- [ ] Verifieer tabellen in Neon dashboard

### Code
- [ ] Kopieer `cursus.types.ts` naar `/src/types/`
- [ ] Kopieer `iris-context.ts` naar `/src/lib/`
- [ ] Kopieer API routes naar `/src/app/api/`
- [ ] Update imports waar nodig

### Componenten (nog te bouwen)
- [ ] `CursusOverzicht` - Lijst van beschikbare cursussen
- [ ] `LesPagina` - Render een les met alle secties
- [ ] `SectieRenderer` - Switch op sectie_type
- [ ] `QuizComponent` - Interactieve quiz
- [ ] `ReflectieComponent` - Tekstveld met AI analyse
- [ ] `IrisChat` - Chat interface

### Integratie
- [ ] Koppel bestaande assessments aan iris_user_context
- [ ] Sync gebruiker_profielen met iris_user_context
- [ ] HeyGen video's uploaden en URL's invullen

---

## 🎯 VOLGENDE STAPPEN

1. **Run migraties** → Database klaar
2. **Bouw componenten** → UI voor lessen
3. **Maak HeyGen video's** → Met de scripts uit `/cursussen/`
4. **Test Iris chat** → Verifieer context werkt
5. **Launch gratis cursus** → Verzamel emails
6. **Bouw betaalde cursussen** → Zelfde structuur

---

## 📚 GERELATEERDE BESTANDEN

- `/cursussen/` folder → JSON content + scripts + werkboek
- `/mnt/project/*.docx` → Strategische documenten

---

*Versie 2.0 - November 2025*
*DatingAssistent.nl*
