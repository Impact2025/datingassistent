# 📊 Interactive Slide System - Documentatie

## Overzicht

Het Interactive Slide System is een modern, professioneel presentatie-systeem voor lesmateriaal. Perfect voor het presenteren van educatieve content in een visueel aantrekkelijke, navigeerbare format.

## ✨ Features

### Navigatie
- **Keyboard**: ← → pijltjestoetsen of spatiebalk
- **Touch**: Swipe links/rechts op mobiel
- **Buttons**: Knoppen voor vorige/volgende
- **Dots**: Klik op dots onderaan voor direct naar slide
- **Progress bar**: Visuele voortgang bovenaan

### Slide Types

#### 1. **Title Slide** - Introductie
```typescript
{
  type: 'title',
  title: 'Hoofdtitel',
  subtitle: 'Ondertitel',
  emoji: '🚩',
  backgroundColor: 'from-purple-600 to-pink-600'
}
```

#### 2. **Content Slide** - Informatie met bullets
```typescript
{
  type: 'content',
  title: 'Titel',
  emoji: '💡',
  content: 'Introductie tekst',
  bullets: [
    'Punt 1',
    'Punt 2',
    'Punt 3'
  ],
  highlightColor: 'text-purple-600'
}
```

#### 3. **Quote Slide** - Citaat
```typescript
{
  type: 'quote',
  quote: 'De quote tekst',
  author: 'Naam auteur',
  emoji: '🎯'
}
```

#### 4. **Split Slide** - Twee kolommen
```typescript
{
  type: 'split',
  title: 'Titel',
  leftContent: 'Tekst links',
  rightContent: 'Tekst rechts of image URL',
  isRightImage: false  // true als rightContent een image URL is
}
```

#### 5. **Image Slide** - Afbeelding
```typescript
{
  type: 'image',
  title: 'Titel (optioneel)',
  imageUrl: '/path/to/image.jpg',
  caption: 'Onderschrift'
}
```

#### 6. **Checklist Slide** - Checklist
```typescript
{
  type: 'checklist',
  title: 'Wat moet je doen?',
  emoji: '✅',
  items: [
    { text: 'Item 1', checked: true },
    { text: 'Item 2', checked: false }
  ]
}
```

## 📝 Hoe te gebruiken

### Stap 1: Maak een Slide Deck

Maak een nieuw bestand in `/src/data/` (bijv. `my-lesson-slides.ts`):

```typescript
import { SlideDeck } from '@/types/slides';

export const myLessonSlides: SlideDeck = {
  title: 'Mijn Les Titel',
  slides: [
    {
      type: 'title',
      title: 'Welkom',
      subtitle: 'Leer over...',
      emoji: '👋'
    },
    {
      type: 'content',
      title: 'Waarom belangrijk?',
      bullets: [
        'Reden 1',
        'Reden 2'
      ]
    },
    // ... meer slides
  ]
};
```

### Stap 2: Integreer in Lesson

In `starter-course-detail.tsx`:

```typescript
// 1. Import je slide deck
import { myLessonSlides } from '@/data/my-lesson-slides';

// 2. Voeg detectie toe
{lesson.title.toLowerCase().includes('jouw les titel') && (
  <div className="mt-3">
    <SlideViewer deck={myLessonSlides} />
  </div>
)}
```

## 🎨 Styling & Aanpassing

### Achtergrond Kleuren

Gebruik Tailwind gradient classes:
```typescript
backgroundColor: 'from-blue-600 to-purple-600'
backgroundColor: 'from-green-50 to-emerald-50'
backgroundColor: 'bg-white'
```

### Highlight Kleuren

```typescript
highlightColor: 'text-purple-600'
highlightColor: 'text-red-600'
highlightColor: 'text-blue-700'
```

## 📱 Responsive Design

- **Desktop**: 16:9 aspect ratio, volledig navigeerbaar
- **Tablet**: Aangepaste spacing, touch gestures
- **Mobiel**: Stack layout waar nodig, swipe navigatie

## 🔄 Database Integratie (Toekomstig)

Later kan slides content uit de database komen:

```sql
-- Nieuwe kolom in course_lessons tabel
ALTER TABLE course_lessons ADD COLUMN slides_data JSONB;

-- Voorbeeld data
UPDATE course_lessons
SET slides_data = '{
  "slides": [...slide objects...]
}'::jsonb
WHERE id = 564;
```

Dan in de component:
```typescript
{lesson.slides_data && (
  <SlideViewer deck={{
    title: lesson.title,
    slides: JSON.parse(lesson.slides_data).slides
  }} />
)}
```

## 💡 Best Practices

### Content

- **Max 5-7 bullets per slide** - Houdt het overzichtelijk
- **Korte zinnen** - Max 1-2 regels per bullet
- **Visueel** - Gebruik emojis voor snelle herkenning
- **Variatie** - Mix verschillende slide types

### Structuur

1. **Start**: Title slide (set de toon)
2. **Waarom**: Content slide (motivatie)
3. **Wat**: Content slides (hoofdinhoud)
4. **Quote**: Tussen door (pauze, bezinking)
5. **Hoe**: Content slides (praktisch)
6. **Actie**: Checklist (takeaways)

### Design

- **Consistent**: Gebruik dezelfde kleuren binnen een deck
- **Contrast**: Zorg voor goede leesbaarheid
- **Witruimte**: Niet te vol, laat content ademen
- **Animaties**: Bullets faden in (automatisch gedaan)

## 🚀 Voorbeeld: Red Flags Module

Zie `/src/data/example-slides.ts` voor een volledig uitgewerkt voorbeeld met alle slide types.

De slides worden getoond voor lessen met:
- "Waarom dit belangrijk is" in de titel
- "Introduct" in de titel
- "De 5 V" in de titel

## 🔧 Troubleshooting

### Slides laden niet
- Check of de import correct is
- Verify of de title detection klopt
- Kijk in de browser console voor errors

### Navigatie werkt niet
- Check of je in de slide container klikt
- Keyboard shortcuts werken alleen als slide focus heeft
- Swipe werkt alleen op touch devices

### Styling is anders dan verwacht
- Check Tailwind classes (sommige werken alleen met JIT)
- Verify backgroundColor en textColor syntax
- Test in verschillende browsers

## 📊 Analytics (Toekomstig)

Later kunnen we tracken:
- Welke slides worden overgeslagen
- Hoeveel tijd per slide
- Completion rate
- User feedback per slide

## 🎯 Roadmap

- [ ] Admin interface voor slide creation
- [ ] Database storage voor slides
- [ ] Video embeds in slides
- [ ] Interactive elements (polls, input)
- [ ] Presenter notes
- [ ] Export to PDF
- [ ] Slide templates library

---

**Gemaakt met ❤️ voor Dating Assistent**
Versie: 1.0.0
Laatste update: 11-11-2025
