import { SlideDeck } from '@/types/slides';

export const mindsetVoorbereidingSlides: SlideDeck = {
  title: 'Goed Jezelf Kennen - De Basis van Aantrekkingskracht',
  slides: [
    {
      type: 'title',
      title: 'Module 1: Goed Jezelf Kennen',
      subtitle: 'Het fundament voor authentieke en onweerstaanbare aantrekkingskracht.',
      emoji: '🧭',
      backgroundColor: 'from-gray-800 to-gray-900'
    },
    {
      type: 'content',
      title: 'Waarom Zelfkennis de Start is',
      emoji: '💡',
      content: 'Voordat je kunt laten zien wie je bent, moet je het zelf weten. Een onduidelijk profiel is het gevolg van onduidelijkheid over jezelf. Dit is de meest cruciale stap.',
      bullets: [
        'Authenticiteit is de kern van echte connectie.',
        'Duidelijkheid over jezelf leidt tot betere matches.',
        'Voorkomt dat je tijd verspilt aan mensen die niet bij je passen.',
        'Vormt de basis voor een profiel dat écht opvalt.'
      ],
      highlightColor: 'text-pink-500'
    },
    {
      type: 'content',
      title: 'Stap 1: Jouw Kernwaarden Definiëren',
      emoji: '💎',
      content: 'Kernwaarden zijn jouw innerlijke kompas. Ze bepalen wat echt belangrijk voor je is in het leven en in een relatie. Weet je deze, dan kun je hierop filteren.',
      bullets: [
        'Vraag jezelf af: Wat gaf mij energie in de afgelopen maand?',
        'Waar geef ik mijn geld en tijd aan uit zonder erover na te denken?',
        'Welke eigenschappen bewonder ik in anderen?',
        'Denk aan: Avontuur, Zekerheid, Groei, Humor, Verbinding, Vrijheid.'
      ],
      backgroundColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      highlightColor: 'text-gray-800'
    },
    {
      type: 'split',
      title: 'Oefening: Kies Jouw Top 5',
      leftContent: 'ANALYSEER JE LIJST:\n\n1. Schrijf 10-15 waarden op die je aanspreken.\n2. Omcirkel de 7 belangrijkste.\n3. Breng dit terug naar een top 5. Dit is jouw kern.\n4. Rangschik ze van 1 tot 5.',
      rightContent: 'VOORBEELD TOP 5:\n\n1. **Groei:** Ik wil blijven leren en ontwikkelen.\n2. **Verbinding:** Diepe, betekenisvolle gesprekken.\n3. **Humor:** Samen kunnen lachen is essentieel.\n4. **Zekerheid:** Emotionele en financiële stabiliteit.\n5. **Vrijheid:** Ruimte voor eigen interesses.'
    },
    {
      type: 'content',
      title: 'Stap 2: Jouw "Niet-Onderhandelbare" Punten',
      emoji: '🛑',
      content: 'Dit zijn je absolute dealbreakers. Door deze helder te hebben, bescherm je je eigen grenzen en verspil je geen energie.',
      bullets: [
        'Wat accepteer je absoluut niet in een relatie? (bv. roken, oneerlijkheid)',
        'Wat zijn absolute voorwaarden voor jou? (bv. kinderwens, ambitie)',
        'Dit zijn geen voorkeuren, maar harde eisen.',
        'Wees eerlijk en onwrikbaar hierin.'
      ],
      backgroundColor: 'bg-gradient-to-br from-red-50 to-orange-50',
      highlightColor: 'text-red-700'
    },
    {
      type: 'quote',
      quote: 'Als je niet weet waar je voor staat, val je voor alles.',
      author: 'Onbekend',
      emoji: '⚓'
    },
    {
      type: 'content',
      title: 'Stap 3: Zelfsabotage Herkennen',
      emoji: '🚧',
      content: 'Je onbewuste overtuigingen kunnen je succes in de weg staan. Bewustwording is de eerste stap naar verandering.',
      bullets: [
        '**Imposter Syndrome:** "Ik ben niet goed genoeg.".',
        '**Zelfkritiek:** "Zie je wel, ik verpest het altijd.".',
        '**Vermijding:** "Ik wacht wel op de perfecte persoon.".',
        '**People-pleasing:** Je eigen wensen negeren om de ander te behagen.'
      ],
      highlightColor: 'text-orange-600'
    },
    {
      type: 'content',
      title: 'Van Zelfkennis naar Profieltekst',
      emoji: '✍️',
      content: 'Nu vertalen we jouw innerlijke wereld naar een magnetische profieltekst. Laat je waarden zien, in plaats van ze alleen te benoemen.',
      bullets: [
        '**Waarde "Avontuur":** "Op zoek naar een reismaatje voor een spontane trip naar de bergen." (Niet: "Ik hou van avontuur.")', 
        '**Waarde "Verbinding":** "Ik hecht meer waarde aan een diep gesprek dan aan een avond uit." (Niet: "Ik zoek een serieuze relatie.")', 
        '**Waarde "Humor":** "Ik lach het hardst om... (vul in). Bonuspunten als jij dit ook hebt." (Niet: "Ik heb humor.")'
      ],
      backgroundColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      highlightColor: 'text-emerald-700'
    },
    {
      type: 'checklist',
      title: 'Jouw Fundament Checklist',
      emoji: '✅',
      items: [
        { text: 'Definieer je top 5 kernwaarden.', checked: false },
        { text: 'Stel je 3-5 niet-onderhandelbare punten vast.', checked: false },
        { text: 'Identificeer één patroon van zelfsabotage om op te letten.', checked: false },
        { text: 'Vertaal één kernwaarde naar een concrete zin voor je profiel.', checked: false },
        { text: 'Deel je inzichten met de AI Coach voor feedback.', checked: false }
      ]
    },
    {
      type: 'title',
      title: 'Module 1 Voltooid',
      subtitle: 'Je hebt het fundament gelegd. In Module 2 gaan we hierop bouwen en je profiel onweerstaanbaar maken.',
      emoji: '🎉',
      backgroundColor: 'from-pink-500 to-rose-500'
    }
  ]
};
