import { SlideDeck } from '@/types/slides';

export const profielOptimalisatieSlides: SlideDeck = {
  title: 'Profiel van Onzichtbaar naar Onweerstaanbaar',
  slides: [
    {
      type: 'title',
      title: 'Module 2: Profiel Optimalisatie',
      subtitle: 'Van onzichtbaar naar onweerstaanbaar met bewezen technieken.',
      emoji: '✨',
      backgroundColor: 'from-pink-500 to-rose-500'
    },
    {
      type: 'content',
      title: 'De Anatomie van een Top-Profiel',
      emoji: '🎯',
      content: 'Een onweerstaanbaar profiel is een strategische mix van drie kernelementen. We gaan ze allemaal masteren.',
      bullets: [
        '**De Foto\'s:** Je visuele eerste indruk (70% van het succes).',
        '**De Bio/Profieltekst:** Jouw verhaal, beknopt en krachtig.',
        '**De Prompts/Antwoorden:** Een inkijkje in je persoonlijkheid en humor.'
      ],
      highlightColor: 'text-rose-500'
    },
    {
      type: 'content',
      title: 'Stap 1: De Fotogalerij Masterclass',
      emoji: '📸',
      content: 'Je foto\'s zijn de belangrijkste factor. Ze moeten een verhaal vertellen over wie je bent en wat voor leven je leidt. Vermijd deze veelgemaakte fouten:',
      bullets: [
        '**Fout #1: De Groepsfoto als Eerste.** Niemand wil een speurtocht doen.',
        '**Fout #2: Zonnebrillen & Hoofddeksels.** Laat je gezicht en ogen zien.',
        '**Fout #3: Alleen Selfies.** Het toont een beperkte sociale wereld.',
        '**Fout #4: Slechte Kwaliteit.** Onscherpe of donkere foto\'s = direct nee.'
      ],
      backgroundColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      highlightColor: 'text-gray-800'
    },
    {
      type: 'split',
      title: 'De 5 Essentiële Foto\'s',
      leftContent: 'JOUW FOTO CHECKLIST:\n\n1. **De Duidelijke Headshot:** Recente, lachende foto waarop je recht in de camera kijkt.\n2. **De Full-Body Foto:** Toont je kledingstijl en postuur.\n3. **De "Passie" Foto:** Iets wat je graag doet (hobby, sport, reizen).\n4. **De Sociale Foto:** Met vrienden of familie (jij duidelijk herkenbaar).\n5. **De "Intriguerende" Foto:** Iets wat een vraag oproept of een gesprek start.',
      rightContent: 'PRO TIPS:\n\n- Gebruik een camera met zelfontspanner, geen selfie.\n- Natuurlijk licht is altijd beter dan een flits.\n- Draag kleding waarin je je zelfverzekerd voelt.\n- Vraag een vriend(in) om te helpen met foto\'s maken.'
    },
    {
      type: 'content',
      title: 'Stap 2: De Magnetische Bio Schrijven',
      emoji: '✍️',
      content: 'Je bio moet kort, krachtig en uitnodigend zijn. Het doel is niet je hele levensverhaal vertellen, maar interesse wekken voor een gesprek.',
      bullets: [
        '**Formule: Wie je bent + Wat je zoekt + Een vraag.**',
        'Gebruik humor en wees specifiek.',
        'Houd het positief: focus op wat je wél wilt.',
        'Vermijd clichés zoals "Ik hou van reizen en gezelligheid."'
      ],
      backgroundColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      highlightColor: 'text-indigo-700'
    },
    {
      type: 'split',
      title: 'Voorbeeld Bio: Van Standaard naar Sterk',
      leftContent: 'VOORBEELD (STANDAARD):\n\n"Ik ben Mark, 32 jaar. Ik hou van reizen, films kijken en lekker eten. Op zoek naar een leuke vrouw voor een serieuze relatie. Geen drama."',
      rightContent: 'VOORBEELD (STERK):\n\n"Projectmanager die liever een Tikkie stuurt voor een goede espresso dan voor een biertje in de kroeg. Ik probeer dit jaar 12 nieuwe recepten te koken (suggesties welkom!). Op zoek naar iemand die net zo van diepe gesprekken houdt als van een slechte woordgrap. Wat is de laatste film die je echt verraste?"'
    },
    {
      type: 'quote',
      quote: 'Specificiteit is het geheim van een gedenkwaardig profiel.',
      author: 'DatingAssistent Pro Tip',
      emoji: '💡'
    },
    {
      type: 'content',
      title: 'Stap 3: Prompts die Persoonlijkheid Tonen',
      emoji: '🗣️',
      content: 'Prompts (zoals bij Hinge of Bumble) zijn een gouden kans om je karakter te laten zien. Gebruik ze om een gesprek uit te lokken.',
      bullets: [
        '**Wees onverwacht:** Geef een antwoord dat niet voor de hand ligt.',
        '**Stel een vraag:** Betrek de ander direct bij je antwoord.',
        '**Toon je humor:** Een gedeelde lach is de beste ijsbreker.',
        '**Combineer diepgang met luchtigheid:** Laat verschillende kanten van jezelf zien.'
      ],
      highlightColor: 'text-emerald-600'
    },
    {
      type: 'checklist',
      title: 'Jouw Profiel Optimalisatie Checklist',
      emoji: '✅',
      items: [
        { text: 'Selecteer 5 foto\'s volgens de checklist.', checked: false },
        { text: 'Herschrijf je bio volgens de Formule.', checked: false },
        { text: 'Kies en beantwoord 3 prompts die een gesprek uitlokken.', checked: false },
        { text: 'Vraag de AI Foto Check om feedback op je beste foto.', checked: false },
        { text: 'Laat de AI Coach je nieuwe bio analyseren.', checked: false }
      ]
    },
    {
      type: 'title',
      title: 'Module 2 Voltooid',
      subtitle: 'Je profiel is nu een magneet voor de juiste matches. In Module 3 leer je hoe je deze matches omzet in geweldige gesprekken.',
      emoji: '🚀',
      backgroundColor: 'from-gray-800 to-gray-900'
    }
  ]
};
