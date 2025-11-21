import { SlideDeck } from '@/types/slides';

export const redFlagsIntroSlides: SlideDeck = {
  title: 'Introductie: De 5 V\'s van Rode Vlaggen',
  slides: [
    {
      type: 'title',
      title: 'De 5 V\'s van Rode Vlaggen',
      subtitle: 'Herken gevaar voordat het te laat is',
      emoji: '🚩',
      backgroundColor: 'from-red-600 to-pink-600'
    },
    {
      type: 'content',
      title: 'Waarom dit belangrijk is',
      emoji: '💡',
      content: 'Veel mensen negeren waarschuwingssignalen in de vroege fase van dating. Dit kan leiden tot onveilige of ongezonde relaties.',
      bullets: [
        'Je intuïtie zegt "iets klopt niet", maar je ratio zegt "geef het nog een kans"',
        'Je wilt geloven in het beste in mensen',
        'Je bent verliefd op het potentieel, niet de realiteit',
        'Je denkt dat jij de uitzondering bent'
      ],
      highlightColor: 'text-orange-600'
    },
    {
      type: 'quote',
      quote: 'Als iemand je laat zien wie ze zijn, geloof ze dan de eerste keer.',
      author: 'Maya Angelou',
      emoji: '🎯'
    },
    {
      type: 'content',
      title: 'De 5 V\'s systeem',
      emoji: '📋',
      bullets: [
        'V1 – Vage foto\'s/info: Ontwijkend gedrag over basics',
        'V2 – Vlotte oppervlakkige praat: Geen diepgang',
        'V3 – Verhalen vol drama: Altijd het slachtoffer',
        'V4 – Verdoezelde antwoorden: Ontwijkende communicatie',
        'V5 – Verliefdheidsbombardement: Te veel, te snel',
        'V6 – Verleggen van grenzen: Jouw grenzen niet respecteren'
      ],
      highlightColor: 'text-red-600'
    },
    {
      type: 'content',
      title: 'V1 – Vage foto\'s/info',
      emoji: '🔍',
      content: 'Iemand die mysterieus doet over basics heeft iets te verbergen.',
      bullets: [
        'Geen duidelijke gezichtsfoto\'s (alleen groepsfoto\'s, filters, van ver)',
        'Profiel is vaag: geen beroep, leeftijd, of interesses',
        'Ontwijkende antwoorden over waar ze wonen of werken',
        'Niet consistent in hun verhaal'
      ],
      backgroundColor: 'bg-gradient-to-br from-gray-100 to-blue-50',
      highlightColor: 'text-blue-700'
    },
    {
      type: 'split',
      title: 'V2 – Vlotte oppervlakkige praat',
      leftContent: 'Deze persoon praat veel maar zegt weinig. Het voelt oppervlakkig en generiek.\n\nZe stellen geen echte vragen over jou en delen niets persoonlijks over zichzelf.',
      rightContent: '• "Hey! Wat ben jij mooi 😍"\n• "Hoe was je dag?"\n• "Lekker weekend gehad?"\n\nMaar als je vraagt: "Wat doe je graag in je vrije tijd?"\n\nReactie: "Van alles 😊 jij?"'
    },
    {
      type: 'content',
      title: 'V3 – Verhalen vol drama',
      emoji: '⛈️',
      bullets: [
        'Alle exen waren "gek" of "narcistisch"',
        'Nooit eigen verantwoordelijkheid in conflict',
        'Verhalen zijn altijd extreem (beste/slechtste)',
        'Constant drama met vrienden, familie, collega\'s',
        'Jij moet kiezen: "Ben je voor mij of tegen mij?"'
      ],
      backgroundColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      highlightColor: 'text-orange-700'
    },
    {
      type: 'content',
      title: 'V4 – Verdoezelde antwoorden',
      emoji: '❓',
      content: 'Ontwijk je geen vragen uit bescheidenheid. Verdoezeling is strategisch.',
      bullets: [
        'Directe vragen krijgen vage antwoorden',
        'Verandert van onderwerp als het persoonlijk wordt',
        'Veel tegenstrijdigheden in hun verhaal',
        'Projecteert: beschuldigt jou van wat zij doen'
      ],
      backgroundColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      highlightColor: 'text-amber-700'
    },
    {
      type: 'content',
      title: 'V5 – Verliefdheidsbombardement',
      emoji: '❤️‍🔥',
      content: 'Love bombing: excessieve aandacht om je snel emotioneel afhankelijk te maken.',
      bullets: [
        '"Ik denk dat ik verliefd op je ben" (na 3 berichten)',
        'Constant berichten sturen, boos als je niet meteen reageert',
        '"Je bent anders dan alle anderen"',
        'Praat over toekomst (samenwonen, trouwen) veel te vroeg',
        'Overdreven complimenten en cadeaus'
      ],
      backgroundColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
      highlightColor: 'text-rose-700'
    },
    {
      type: 'content',
      title: 'V6 – Verleggen van grenzen',
      emoji: '🚨',
      content: 'Dit is de MEEST SERIEUZE rode vlag. Dit is geen misverstand, dit is manipulatie.',
      bullets: [
        'Pusht voor sneller/verder gaan dan jij wilt',
        'Maakt je belachelijk als je grenzen stelt',
        '"Als je van me hield, zou je..."',
        'Neemt "nee" niet serieus',
        'Wordt boos, manipulatief of afstandelijk na grens'
      ],
      backgroundColor: 'bg-gradient-to-br from-red-100 to-pink-100',
      highlightColor: 'text-red-800'
    },
    {
      type: 'checklist',
      title: 'Wat moet je doen?',
      emoji: '✅',
      items: [
        { text: 'Vertrouw je intuïtie - je onderbuik liegt niet', checked: true },
        { text: 'Bespreek rode vlaggen met een vriend(in)', checked: true },
        { text: 'Stel grenzen en kijk hoe ze reageren', checked: true },
        { text: 'Bij twijfel: neem afstand en observeer', checked: true },
        { text: 'Bij V6: DIRECT stoppen, geen discussie', checked: true }
      ]
    },
    {
      type: 'quote',
      quote: 'Jouw veiligheid is belangrijker dan iemand anders gevoelens.',
      emoji: '💛',
      backgroundColor: 'bg-gradient-to-br from-purple-100 to-pink-100'
    }
  ]
};
