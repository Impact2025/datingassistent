# 🎨 DATINGASSISTENT BRAND & STIJLGIDS
## Versie 1.0 - Cursus Productie

---

## 🎯 MERK ESSENTIE

**Missie**: Dating transformeren van loterij naar leerbare vaardigheid
**Toon**: Warm, deskundig, toegankelijk, een beetje speels
**Persoonlijkheid**: Je slimme beste vriend(in) die toevallig dating-expert is

---

## 🎨 KLEUREN

### Primair Palet

```css
/* Warm Koraal - Liefde, Warmte, Actie */
--da-coral: #E8636B;
--da-coral-light: #F5A0A5;
--da-coral-dark: #C94D55;

/* Diep Navy - Vertrouwen, Expertise, Rust */
--da-navy: #1E3A5F;
--da-navy-light: #2D5A8A;

/* Goud Accent - Premium, Succes, Beloning */
--da-gold: #D4A853;
```

### Functionele Kleuren

```css
/* Achtergronden */
--da-bg-light: #FAFAFA;
--da-bg-cream: #FDF8F4;
--da-bg-dark: #1A1A2E;

/* Tekst */
--da-text-primary: #1E3A5F;
--da-text-secondary: #6B7280;
--da-text-muted: #9CA3AF;

/* Feedback */
--da-success: #4CAF50;
--da-warning: #F59E0B;
--da-error: #EF4444;
--da-info: #3B82F6;
```

### Kleurgebruik Regels

| Element | Kleur | Gebruik |
|---------|-------|---------|
| CTA Buttons | `--da-coral` | Primaire acties |
| Headers | `--da-navy` | Titels, belangrijke tekst |
| Accenten | `--da-gold` | Badges, highlights, succes |
| Achtergrond slides | `--da-navy` gradient | Video achtergronden |
| Cards | `white` + `--da-coral` border-top | Content blokken |
| Fouten/Don'ts | `--da-error` | Wat te vermijden |
| Goed/Do's | `--da-success` | Wat wel te doen |

---

## ✍️ TYPOGRAFIE

### Font Stack

```css
/* Headlines - Warm & Persoonlijk */
font-family: Georgia, 'Times New Roman', serif;
font-weight: 700;

/* Body - Helder & Toegankelijk */
font-family: Arial, Helvetica, sans-serif;
font-weight: 400;

/* Code/Data - Technisch */
font-family: 'Courier New', monospace;
```

### Groottes (Slides 960x540)

| Element | Grootte | Gebruik |
|---------|---------|---------|
| Slide Titel | 36-42px | Hoofdtitel per slide |
| Sectie Header | 24-28px | Onderdelen binnen slide |
| Body Tekst | 18-20px | Uitleg, beschrijvingen |
| Bullets/Lijst | 16-18px | Opsommingen |
| Caption/Small | 12-14px | Bronnen, footnotes |
| Big Numbers | 80-120px | Statistieken, impact |

### Typografie Regels

1. **Maximum 3 tekstniveaus per slide**
2. **Headlines altijd Georgia** (serif = warmte)
3. **Body altijd Arial** (sans = leesbaarheid)
4. **Geen volledig CAPS** behalve korte labels
5. **Line-height: 1.4** voor body tekst

---

## 📐 LAYOUT & SPACING

### Slide Dimensies

```
Standaard: 960 x 540 px (16:9)
Margins: 32px rondom
Content area: 896 x 476 px
```

### Spacing Schaal (8px basis)

```css
--space-xs: 4px;    /* Tight */
--space-sm: 8px;    /* Compact */
--space-md: 16px;   /* Standard */
--space-lg: 24px;   /* Comfortable */
--space-xl: 32px;   /* Generous */
--space-2xl: 48px;  /* Section breaks */
```

### Layout Patronen

**Header Bar (Signature Element)**
```
┌────────────────────────────────────────────┐
│ 6px coral accent bar                       │
├────────────────────────────────────────────┤
│ Navy background                            │
│ [Nummer badge]  Titel                      │
└────────────────────────────────────────────┘
```

**Content Cards**
```
┌────────────────────────────────────────────┐
│ 4px coral top border                       │
├────────────────────────────────────────────┤
│                                            │
│  Icon/Nummer                               │
│  Titel                                     │
│  Beschrijving                              │
│                                            │
│  ─────────────────────────────             │
│  Actie/Takeaway                            │
│                                            │
└────────────────────────────────────────────┘
```

**Vergelijking Layout**
```
┌──────────────────┐    ┌──────────────────┐
│   ❌ FOUT        │    │   ✅ GOED        │
│                  │    │                  │
│   [Voorbeeld]    │ →  │   [Voorbeeld]    │
│                  │    │                  │
│   Uitleg         │    │   Uitleg         │
└──────────────────┘    └──────────────────┘
```

---

## 🖼️ VISUELE ELEMENTEN

### Iconen & Emoji

**Toegestane emoji's voor lessen:**
```
📸 Foto gerelateerd
👀 Ogen/Zien
😊 Glimlach/Positief
💡 Tips/Ideeën
✅ Goed/Correct
❌ Fout/Vermijd
⚠️ Waarschuwing
🎯 Doel/Focus
💪 Actie/Motivatie
❤️ Liefde/Relaties
🔥 Hot tip/Belangrijk
```

### Afbeeldingen

**Do's:**
- Echte mensen (geen stockfoto-gevoel)
- Diverse representatie
- Warme, natuurlijke belichting
- Emotionele expressie zichtbaar

**Don'ts:**
- Overduidelijke stockfoto's
- Perfecte/onrealistische mensen
- Koude, klinische beelden
- Afbeeldingen zonder context

### Shapes & Decoratie

```
Primair:  Rounded rectangles (border-radius: 12px)
Badges:   Circles (border-radius: 50%)
Accenten: 4-8px solid borders (coral of navy)
Shadows:  Subtle (0 4px 16px rgba(0,0,0,0.1))
```

---

## 🎬 VIDEO STIJL (HEYGEN)

### Iris - De AI Coach

**Persoonlijkheid:**
- Warm en uitnodigend
- Deskundig maar niet betuttelend
- Enthousiast zonder overdreven
- Empathisch en begripvol

**Spreekstijl:**
- Direct aanspreken ("jij", "je")
- Actieve zinnen
- Korte paragrafen (max 3 zinnen)
- Retorische vragen voor engagement
- Humor waar gepast (subtiel)

**Toon per sectie:**

| Sectie | Toon |
|--------|------|
| Opening | Energiek, intrigerend |
| Probleem uitleggen | Empathisch, herkenbaar |
| Oplossing geven | Zelfverzekerd, helder |
| Voorbeelden | Licht humoristisch |
| Samenvatting | Motiverend |
| CTA | Uitnodigend, hoopvol |

### Video Slide Achtergronden

**Intro/Outro:**
- Navy gradient achtergrond
- Logo + cursus titel
- Coral accent elementen

**Content slides:**
- Lichte achtergrond (#FAFAFA)
- Navy header bar
- Coral accenten voor nadruk

**Vergelijking slides:**
- Split layout
- Rood voor "fout" (subtiel)
- Groen voor "goed" (subtiel)

---

## 📝 SCHRIJFSTIJL

### Tone of Voice

```
✅ "Je foto's bepalen 83% van de eerste indruk"
❌ "Foto's zijn erg belangrijk voor uw datingprofiel"

✅ "Wist je dat..."
❌ "Het is algemeen bekend dat..."

✅ "Dit ga je leren:"
❌ "De leerdoelen van deze module zijn:"

✅ "Oeps, dat is een veelgemaakte fout!"
❌ "Dit is incorrect en dient vermeden te worden."
```

### Formatting Conventies

**Titels:**
- Kort en actiegericht
- "De 3 Grote Foto-Fouten" ✅
- "Module 1: Veelvoorkomende fouten bij profielfoto's" ❌

**Bullets:**
- Start met werkwoord of kernwoord
- Max 7 woorden per bullet
- Parallelle structuur

**Nummering:**
- Gebruik voor stappen/volgorde
- "Stap 1:", "Fout #1:", "Tip 1:"

---

## ✅ KWALITEITSCHECK

### Per Slide

- [ ] Max 3 kernpunten
- [ ] Voldoende witruimte (min 30%)
- [ ] Tekst leesbaar (min 16px)
- [ ] Kleuren consistent met gids
- [ ] Geen spelfouten

### Per Les

- [ ] Opening heeft hook (statistiek/vraag)
- [ ] Duidelijke structuur (probleem → oplossing)
- [ ] Praktische takeaways
- [ ] CTA naar tool of volgende les
- [ ] Iris' toon consistent

### Per Cursus

- [ ] Logische opbouw lessen
- [ ] Stijgende complexiteit
- [ ] Rode draad zichtbaar
- [ ] Upsell momenten natuurlijk
- [ ] Werkboek compleet

---

## 📂 BESTANDSNAMEN

### Conventies

```
Cursussen:    [niveau]-[slug]/
              gratis/profielfoto/
              basis/dating-fundament/

Lessen:       les-[nummer]-[slug]/
              les-1-fotofouten/
              les-2-glimlach/

Slides:       slide-[nummer]-[beschrijving].png
              slide-01-intro.png
              slide-02-fout-zonnebril.png

Scripts:      script.md (per les folder)
Werkboek:     werkboek.docx (per cursus)
Data:         cursus.json, les.json, quiz.json
```

---

*Versie 1.0 - DatingAssistent Cursus Productie Systeem*
