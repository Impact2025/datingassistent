# Dating Fundament PRO - Sectie Type Mapping

## 📊 Analyse: 51 Unieke Types → 8 Component Patronen

### Pattern 1: **ComparisonSectie** (Two-Column Vergelijking)
**Handles 15 types**: framework, contrast, transformatie, myth-bust, concept, mindset

**Visual Pattern**: Twee kolommen naast elkaar met vergelijking

**Content Structure**:
```json
{
  "vergelijking": [
    {"type": "A", "kenmerken": [...], "gevolg": "..."},
    {"type": "B", "kenmerken": [...], "gevolg": "..."}
  ],
  "conclusie": "..."
}
```

**Voorbeelden**:
- "Eenzaamheid vs. Verlangen naar een Partner"
- "Chemie vs. Compatibiliteit"
- "De Mindset Shift" (van → naar transformatie)

---

### Pattern 2: **InsightSectie** (Rijke Uitleg met Structuur)
**Handles 10 types**: insight, wetenschap, analyse, uitleg, regel

**Visual Pattern**: Gestructureerde uitleg met highlights, data points, kernboodschappen

**Content Structure**:
```json
{
  "intro": "...",
  "content": [
    {"type": "contrast", "links": {...}, "rechts": {...}},
    {"type": "kernpunt", "tekst": "...", "toelichting": "..."}
  ],
  "conclusie": "..."
}
```

**Voorbeelden**:
- "Het Probleem Met 'Gewoon Iemand'" (contrast + kernpunt)
- "De 3 Fases van Aantrekking"
- "Wat is Dating Burnout?"

---

### Pattern 3: **ListSectie** (Lijst met Icons/Items)
**Handles 12 types**: waarschuwing, checklist, tips, positief, systeem, analyse

**Visual Pattern**: Bulleted/numbered lijst met optional icons

**Content Structure**:
```json
{
  "intro": "...",
  "items": [
    {"naam": "...", "icon": "🚫", "beschrijving": "...", "fix": "..."}
  ],
  "tip": "..."
}
```

**Voorbeelden**:
- "De 5 Dodelijke Foto-Fouten"
- "De Perfecte Foto Mix (6 Foto's)"
- "Green Flags"

---

### Pattern 4: **StrategieSectie** (Steps/Process)
**Handles 8 types**: strategie, proces, actieplan, stappen, opdracht, template

**Visual Pattern**: Numbered steps, timeline, action plan

**Content Structure**:
```json
{
  "stappen": [
    {"stap": "1", "actie": "...", "waarom": "..."}
  ],
  "tip": "..."
}
```

**Voorbeelden**:
- "Het 15-Minuten Protocol"
- "Hoe Je Pauzeert"
- "Van App naar Telefoon"

---

### Pattern 5: **InteractiveSectie** (Vragen & Input)
**Handles 5 types**: hook, zelfreflectie, reflectie, check-in, diagnose

**Visual Pattern**: Interactive questions met opties of text input

**Content Structure**:
```json
{
  "vraag": "...",
  "opties": [{"tekst": "...", "tag": "..."}],
  "interpretatie": {"0-1": "...", "2-3": "..."}
}
```

**Voorbeelden**:
- "Waarom wil je daten?" (multiple choice)
- "De Eerlijke Check" (yes/no questions met scores)
- "Herken Je Dit?" (quotes + reflection)

---

### Pattern 6: **ExamplesSectie** (Voorbeelden Goed/Fout)
**Handles 6 types**: voorbeelden, template, skill, praktijk, techniek

**Visual Pattern**: Side-by-side examples (vaag vs concreet, fout vs goed)

**Content Structure**:
```json
{
  "voorbeelden": {
    "vaag": ["...", "..."],
    "concreet": ["...", "..."]
  },
  "tip": "..."
}
```

**Voorbeelden**:
- "Van Vaag naar Concreet"
- "Je Eerste Berichten" (niet vs wel)
- "Conversation Threading"

---

### Pattern 7: **DataSectie** (Stats & Numbers)
**Handles 3 types**: data, statistiek, realiteit

**Visual Pattern**: Big numbers, percentages, funnel visualization

**Content Structure**:
```json
{
  "statistiek": "...",
  "funnel": [
    {"fase": "...", "conversie": "..."}
  ],
  "perspectief": "..."
}
```

**Voorbeelden**:
- "De Realiteit van Dating in Cijfers"
- "Realistische Verwachtingen - Week 1"

---

### Pattern 8: **FlexContentSectie** (Mixed Nested Content)
**Handles 5+ types**: content, opdracht, overzicht, beslisboom, scenario

**Visual Pattern**: Flexible blocks - kan alle bovenstaande patronen bevatten

**Content Structure**:
```json
{
  "0": {"type": "tekst", "tekst": "..."},
  "1": {"type": "lijst", "items": [...]},
  "2": {"type": "tool", "tool_id": "..."}
}
```

**Voorbeelden**:
- "Bio's Die Niemand Leest" (mixed content blocks)
- "Welk Platform Past Bij Jou?" (decision tree)

---

## 🎯 Implementatie Strategie

### Fase 1: Core Patterns (80% coverage)
1. ✅ **ComparisonSectie** - framework, contrast, transformatie
2. ✅ **InsightSectie** - insight, wetenschap
3. ✅ **ListSectie** - waarschuwing, checklist, tips
4. ✅ **ExamplesSectie** - voorbeelden, praktijk
5. ✅ **InteractiveSectie** - hook, zelfreflectie

### Fase 2: Extended Patterns (15% coverage)
6. **StrategieSectie** - strategie, proces
7. **DataSectie** - data, statistiek

### Fase 3: Fallback (5% coverage)
8. **FlexContentSectie** - catch-all voor complexe nested content

---

## 📋 Import Script Mapping

```javascript
const TYPE_TO_COMPONENT_MAP = {
  // Pattern 1: Comparison
  'framework': 'comparison',
  'contrast': 'comparison',
  'transformatie': 'comparison',
  'myth-bust': 'comparison',
  'mindset': 'comparison',

  // Pattern 2: Insight
  'insight': 'insight',
  'wetenschap': 'insight',
  'analyse': 'insight',
  'uitleg': 'insight',
  'regel': 'insight',
  'concept': 'insight',

  // Pattern 3: List
  'waarschuwing': 'list',
  'checklist': 'list',
  'tips': 'list',
  'positief': 'list',
  'systeem': 'list',

  // Pattern 4: Strategy
  'strategie': 'strategy',
  'proces': 'strategy',
  'actieplan': 'strategy',
  'template': 'strategy',

  // Pattern 5: Interactive
  'hook': 'interactive',
  'zelfreflectie': 'interactive',
  'reflectie': 'interactive',
  'check-in': 'interactive',

  // Pattern 6: Examples
  'voorbeelden': 'examples',
  'praktijk': 'examples',
  'skill': 'examples',
  'techniek': 'examples',

  // Pattern 7: Data
  'data': 'data',
  'statistiek': 'data',
  'realiteit': 'data',

  // Pattern 8: Flex Content
  'content': 'flex',
  'opdracht': 'flex',
  'overzicht': 'flex',

  // Already supported (legacy)
  'video': 'video',
  'tekst': 'tekst',
  'kernpunten': 'kernpunten',
  'quiz': 'quiz',
  'opdracht': 'opdracht'
};
```

---

## ✅ Action Items

1. **Build 8 core component files** in `src/app/cursussen/[slug]/[lesSlug]/components/`
2. **Create smart import script** that normalizes JSON → component data
3. **Add type mapping** in database schema
4. **Test with Les 1-1** eerst, dan uitrollen naar alle lessen

