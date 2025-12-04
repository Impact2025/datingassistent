/**
 * KICKSTART COMPLETE UPGRADE SCRIPT
 *
 * Transforms the Kickstart from tips-based to transformational (Pilarczyk-style)
 *
 * What this script does:
 * 1. Updates ALL 21 days with new transformational reflectievragen
 * 2. Updates video scripts for dag 6-21 with hybrid format (mindset hook + praktijk + transformatie)
 * 3. Updates werkboeken with journaling prompts
 *
 * Run: npx tsx src/scripts/kickstart-complete-upgrade.ts
 */

import { sql } from '@vercel/postgres';

// ============================================================================
// TYPES
// ============================================================================

interface ReflectieVraag {
  type: 'spiegel' | 'identiteit' | 'actie';
  vraag: string;
  doel: string;
}

interface VideoScript {
  mindset_hook: string;
  bridge: string;
  hook: string;
  intro: string;
  secties: { titel: string; content: string }[];
  opdracht: string;
  transformatie_afsluiting: string;
  outro: string;
}

interface Werkboek {
  titel: string;
  intro?: string;
  stappen: string[];
  journaling?: {
    vraag: string;
    placeholder: string;
  }[];
  key_insight?: string;
}

interface DayUpdate {
  dag_nummer: number;
  reflectie: { vragen: ReflectieVraag[] };
  video_script?: VideoScript;
  werkboek?: Werkboek;
}

// ============================================================================
// REFLECTIEVRAGEN (ALL 21 DAYS)
// ============================================================================

const reflecties: { dag_nummer: number; vragen: ReflectieVraag[] }[] = [
  // WEEK 1: IDENTITEIT DOOR BEELD
  {
    dag_nummer: 1,
    vragen: [
      { type: 'spiegel', vraag: 'Als een vreemde jouw profiel zou zien, welk verhaal vertelt het over wie jij bent? Niet wat je WILT dat ze zien - wat zien ze ECHT?', doel: 'Confrontatie met huidige realiteit' },
      { type: 'identiteit', vraag: 'Welke versie van jezelf wil je dat je profiel uitstraalt? Beschrijf die persoon in 3 woorden.', doel: 'Gewenste identiteit definiëren' },
      { type: 'actie', vraag: 'Welke ÉÉN foto in je profiel past niet bij die versie van jezelf? Die gaat eruit.', doel: 'Concrete actie koppelen aan inzicht' }
    ]
  },
  {
    dag_nummer: 2,
    vragen: [
      { type: 'spiegel', vraag: 'Kijk naar je huidige profielfoto. Wat zie je in je eigen ogen? Zelfvertrouwen? Onzekerheid? Proberen te pleasen?', doel: 'Zelfreflectie op non-verbale communicatie' },
      { type: 'identiteit', vraag: 'Een foto is een bevroren moment van wie je bent. Welk moment van JOU zou je willen bevriezen?', doel: 'Authentieke zelfexpressie vinden' },
      { type: 'actie', vraag: 'Scroll door je camera roll. Vind één foto waar je ECHT jezelf bent - niet poseert, niet probeert. Dat is je vertrekpunt.', doel: 'Authentiek startpunt identificeren' }
    ]
  },
  {
    dag_nummer: 3,
    vragen: [
      { type: 'spiegel', vraag: 'Hoe voelde het om je foto\'s beoordeeld te zien door AI? Herken je jezelf in die scores?', doel: 'Omgaan met externe feedback' },
      { type: 'identiteit', vraag: 'Een score is feedback, geen oordeel over je waarde. Hoe reageer jij normaal op feedback? Defensief of nieuwsgierig?', doel: 'Zelfkennis over feedback-patronen' },
      { type: 'actie', vraag: 'Neem de foto met de laagste score. In plaats van hem te verwijderen - wat zou je kunnen LEREN van waarom hij niet werkt?', doel: 'Feedback omzetten naar groei' }
    ]
  },
  {
    dag_nummer: 4,
    vragen: [
      { type: 'spiegel', vraag: 'Waarom vind je het moeilijk (of makkelijk) om foto\'s van jezelf te maken? Wat zegt dat over hoe je naar jezelf kijkt?', doel: 'Zelfbeeld onderzoeken' },
      { type: 'identiteit', vraag: 'De camera vangt niet hoe je ERUITZIET, maar hoe je je VOELT. Hoe wil je je voelen op je volgende foto?', doel: 'Energie boven esthetiek' },
      { type: 'actie', vraag: 'Voordat je morgen foto\'s maakt: schrijf op hoe de beste versie van jezelf zich zou voelen. Neem dat gevoel mee.', doel: 'Intentie setting voor actie' }
    ]
  },
  {
    dag_nummer: 5,
    vragen: [
      { type: 'spiegel', vraag: 'Je hebt nu foto\'s gekozen. Kijk ernaar alsof je ze voor het eerst ziet. Welk verhaal vertellen ze samen?', doel: 'Profiel als geheel zien' },
      { type: 'identiteit', vraag: 'Elke foto in je profiel is een uitnodiging. Waar nodig je mensen voor uit? Avontuur? Rust? Diepgang? Plezier?', doel: 'Bewuste communicatie' },
      { type: 'actie', vraag: 'Als je profiel een trailer was voor de film van jouw leven - mist er dan nog een scene?', doel: 'Gaps identificeren' }
    ]
  },
  {
    dag_nummer: 6,
    vragen: [
      { type: 'spiegel', vraag: 'Wat houdt je tegen om dit weekend echt aan de slag te gaan? Perfectionism? Schaamte? \'Geen tijd\'?', doel: 'Weerstand identificeren' },
      { type: 'identiteit', vraag: 'De man die foto\'s durft te maken van zichzelf is dezelfde man die durft te daten. Welke versie wil je zijn?', doel: 'Moed koppelen aan identiteit' },
      { type: 'actie', vraag: 'Stuur nu een appje naar iemand om te helpen met foto\'s. Het ongemak dat je voelt is precies waar de groei zit.', doel: 'Directe actie ondanks ongemak' }
    ]
  },
  {
    dag_nummer: 7,
    vragen: [
      { type: 'spiegel', vraag: 'Vergelijk je profiel van dag 1 met nu. Wat is er veranderd aan de BUITENKANT? En wat aan de BINNENKANT?', doel: 'Interne vs externe groei erkennen' },
      { type: 'identiteit', vraag: 'Je hebt deze week niet alleen foto\'s verbeterd. Je hebt geoefend om jezelf te zien. Wat heb je ontdekt?', doel: 'Diepere learning articuleren' },
      { type: 'actie', vraag: 'Schrijf één zin op die je tegen jezelf zou zeggen aan het begin van deze week. Wat had je moeten weten?', doel: 'Wijsheid consolideren' }
    ]
  },
  // WEEK 2: IDENTITEIT DOOR WOORDEN
  {
    dag_nummer: 8,
    vragen: [
      { type: 'spiegel', vraag: 'Lees je huidige bio hardop. Klinkt het als JIJ of als iemand die probeert indruk te maken?', doel: 'Authenticiteit check' },
      { type: 'identiteit', vraag: 'Als je bio een eerste date was - zou je met die persoon willen praten? Waarom wel/niet?', doel: 'Perspectief wisseling' },
      { type: 'actie', vraag: 'Schrijf je bio alsof je het tegen je beste vriend vertelt. Geen filter. Dat is je startpunt.', doel: 'Authenticiteit als basis' }
    ]
  },
  {
    dag_nummer: 9,
    vragen: [
      { type: 'spiegel', vraag: 'De AI gaf je suggesties. Welke voelden als \'ja, dat ben ik\' en welke als \'dat is niet echt ik\'?', doel: 'Onderscheid maken tussen hulp en jezelf' },
      { type: 'identiteit', vraag: 'Een goede bio is niet wat je DOET, maar wie je BENT. Wat maakt jou JOU, los van je baan of hobby\'s?', doel: 'Kern-identiteit vinden' },
      { type: 'actie', vraag: 'Neem één AI-suggestie en maak hem MEER jou. Voeg een specifiek verhaal of detail toe dat alleen jij zou kunnen schrijven.', doel: 'AI als startpunt, niet eindpunt' }
    ]
  },
  {
    dag_nummer: 10,
    vragen: [
      { type: 'spiegel', vraag: 'Hoe open JIJ normaal gesprekken in het echte leven? Is dat anders dan online? Waarom?', doel: 'Online vs offline consistentie' },
      { type: 'identiteit', vraag: 'Je eerste zin is een belofte. Welke belofte wil jij maken? Entertainment? Diepgang? Avontuur?', doel: 'Intentie achter communicatie' },
      { type: 'actie', vraag: 'Schrijf een opener die je alleen zou sturen naar iemand waar je ECHT geïnteresseerd in bent. Dat is je standaard.', doel: 'Standaard verhogen' }
    ]
  },
  {
    dag_nummer: 11,
    vragen: [
      { type: 'spiegel', vraag: 'Op welk platform voel je je het meest jezelf? Waarom denk je dat dat zo is?', doel: 'Platform-fit begrijpen' },
      { type: 'identiteit', vraag: 'Elk platform trekt een ander type connectie aan. Welk type connectie zoek JIJ echt?', doel: 'Helder krijgen wat je zoekt' },
      { type: 'actie', vraag: 'Kies één platform om deze week je \'main\' te maken. Focus slaat versnippering.', doel: 'Focus als strategie' }
    ]
  },
  {
    dag_nummer: 12,
    vragen: [
      { type: 'spiegel', vraag: 'Welke prompt-vragen vermijd je? Vaak vermijden we vragen waar we onzeker over zijn.', doel: 'Vermijding als signaal' },
      { type: 'identiteit', vraag: 'Je antwoorden zijn geen CV. Het zijn uitnodigingen tot gesprek. Welke gesprekken wil je hebben?', doel: 'Van presentatie naar connectie' },
      { type: 'actie', vraag: 'Beantwoord één prompt die je normaal zou skippen. Het ongemak betekent dat het ertoe doet.', doel: 'Ongemak als kompas' }
    ]
  },
  {
    dag_nummer: 13,
    vragen: [
      { type: 'spiegel', vraag: 'Welke vraag durf je eigenlijk niet te stellen? Die is waarschijnlijk de belangrijkste.', doel: 'Verborgen vragen identificeren' },
      { type: 'identiteit', vraag: 'Hulp vragen is geen zwakte - het is weten dat je groei belangrijker is dan je ego.', doel: 'Ego vs groei' },
      { type: 'actie', vraag: 'Stel minimaal één vraag die je spannend vindt. Dat is waar de doorbraak zit.', doel: 'Actie ondanks spanning' }
    ]
  },
  {
    dag_nummer: 14,
    vragen: [
      { type: 'spiegel', vraag: 'Je profiel is nu compleet. Als je date dit zou lezen - zou je trots zijn op hoe je jezelf presenteert?', doel: 'Trots als maatstaf' },
      { type: 'identiteit', vraag: 'In twee weken heb je geleerd jezelf in beeld en woord te presenteren. Wie is de persoon die je hebt gecreëerd?', doel: 'Identiteit articuleren' },
      { type: 'actie', vraag: 'Screenshot je profiel nu. Over een maand kijk je terug. Schrijf op wat je hoopt dat er dan anders is in je leven.', doel: 'Toekomst intentie setting' }
    ]
  },
  // WEEK 3: IDENTITEIT DOOR CONNECTIE
  {
    dag_nummer: 15,
    vragen: [
      { type: 'spiegel', vraag: 'Denk aan je laatste gesprek dat doodliep. Wees eerlijk - probeerde je indruk te maken of was je echt nieuwsgierig?', doel: 'Eerlijkheid over eigen gedrag' },
      { type: 'identiteit', vraag: 'De manier waarop je gesprekken voert is een spiegel van hoe je relaties aangaat. Wat zie je?', doel: 'Patronen herkennen' },
      { type: 'actie', vraag: 'In je volgende gesprek: stel één vraag puur uit nieuwsgierigheid, niet om het gesprek gaande te houden.', doel: 'Echte nieuwsgierigheid oefenen' }
    ]
  },
  {
    dag_nummer: 16,
    vragen: [
      { type: 'spiegel', vraag: 'Waarom vind je het eerste bericht zo spannend? Wat ben je bang om te verliezen?', doel: 'Angst onderzoeken' },
      { type: 'identiteit', vraag: 'Een opener is geen test die je moet halen. Het is een uitnodiging die je doet. Welke uitnodiging past bij jou?', doel: 'Van test naar uitnodiging' },
      { type: 'actie', vraag: 'Stuur vandaag drie openers waar je NIET zeker van bent. Het gaat niet om het resultaat, maar om de moed.', doel: 'Moed boven zekerheid' }
    ]
  },
  {
    dag_nummer: 17,
    vragen: [
      { type: 'spiegel', vraag: 'Val jij in de \'interviewer\' rol in gesprekken? Waarom denk je dat dat zo is?', doel: 'Gespreksdynamiek begrijpen' },
      { type: 'identiteit', vraag: 'Een goed gesprek is geen prestatie. Het is twee mensen die samen iets ontdekken. Wat wil JIJ ontdekken?', doel: 'Van presteren naar ontdekken' },
      { type: 'actie', vraag: 'In je volgende gesprek: deel iets persoonlijks VOORDAT je een vraag stelt. Observeer wat er gebeurt.', doel: 'Kwetsbaarheid oefenen' }
    ]
  },
  {
    dag_nummer: 18,
    vragen: [
      { type: 'spiegel', vraag: 'Wat houdt je tegen om sneller naar een date te vragen? Angst voor afwijzing? Of iets anders?', doel: 'Blokkades identificeren' },
      { type: 'identiteit', vraag: 'De man die durft te vragen is de man die krijgt wat hij wil. Welke man wil je zijn?', doel: 'Identiteit koppelen aan actie' },
      { type: 'actie', vraag: 'Als er nu iemand is waar je mee chat: vraag vandaag om een date. Het antwoord is minder belangrijk dan de daad.', doel: 'Directe actie' }
    ]
  },
  {
    dag_nummer: 19,
    vragen: [
      { type: 'spiegel', vraag: 'Welk gesprek vind je het moeilijkst om te delen? Dat is waarschijnlijk waar je het meest van kunt leren.', doel: 'Schaamte als kompas' },
      { type: 'identiteit', vraag: 'Kwetsbaarheid is geen zwakte. Het is de toegangspoort tot echte connectie. Kun je dat ook in je gesprekken toelaten?', doel: 'Kwetsbaarheid herdefiniëren' },
      { type: 'actie', vraag: 'Vraag feedback op het gesprek waar je het minst trots op bent. Daar zit de groei.', doel: 'Feedback zoeken op zwakke plek' }
    ]
  },
  {
    dag_nummer: 20,
    vragen: [
      { type: 'spiegel', vraag: 'Hoe heeft afwijzing je dating gedrag gevormd? Welke muren heb je opgebouwd?', doel: 'Impact van afwijzing erkennen' },
      { type: 'identiteit', vraag: 'Afwijzing is geen oordeel over je waarde. Het is informatie over compatibility. Kun je dat VOELEN, niet alleen weten?', doel: 'Reframing internaliseren' },
      { type: 'actie', vraag: 'Denk aan een recente afwijzing. Schrijf drie dingen op die je ervan hebt GELEERD, niet drie redenen om jezelf te bekritiseren.', doel: 'Van zelfkritiek naar leren' }
    ]
  },
  {
    dag_nummer: 21,
    vragen: [
      { type: 'spiegel', vraag: 'Wie was je 21 dagen geleden? Wie ben je nu? Wat is het grootste verschil?', doel: 'Transformatie erkennen' },
      { type: 'identiteit', vraag: 'Je hebt niet alleen dating skills geleerd. Je hebt geoefend in jezelf zien, jezelf uiten, en connectie maken. Wie ben je geworden?', doel: 'Diepere groei articuleren' },
      { type: 'actie', vraag: 'Schrijf een brief aan jezelf over 3 maanden. Wat hoop je dat er veranderd is? Dit is je kompas.', doel: 'Toekomst intentie vastleggen' }
    ]
  }
];

// ============================================================================
// VIDEO SCRIPTS (DAG 6-21) - HYBRID FORMAT
// ============================================================================

const videoScripts: { dag_nummer: number; video_script: VideoScript }[] = [
  {
    dag_nummer: 6,
    video_script: {
      mindset_hook: 'De meeste mannen wachten tot ze er perfect uitzien voordat ze goede foto\'s maken. Maar hier is de waarheid: je hoeft niet perfect te zijn. Je hoeft alleen JEZELF te zijn.',
      bridge: 'Dit weekend ga je foto\'s maken. Maar dit is geen huiswerkopdracht - dit is een oefening in zelfacceptatie. Elke keer dat je een foto maakt en denkt \'nee, die is niet goed genoeg\', vraag jezelf af: oordeel ik over de foto, of over mezelf? De man die comfortabel is voor de camera is dezelfde man die comfortabel is op een date. Het begint hier.',
      hook: 'Het weekend is dé tijd om geweldige foto\'s te maken.',
      intro: 'Vandaag ga je actief nieuwe content creëren.',
      secties: [
        { titel: 'De opdracht', content: 'Minimaal 3 nieuwe situaties fotograferen: een casual setting, een hobby moment, en een social situatie.' },
        { titel: 'Locatie ideeën', content: 'Koffietent met goed licht, park bij golden hour, restaurant met interessante achtergrond, je hobby locatie.' },
        { titel: 'Praktische tips', content: 'Vraag een vriend om te helpen. Maak 30+ foto\'s per locatie. Experimenteer met verschillende poses en uitdrukkingen.' }
      ],
      opdracht: 'Maak minimaal 30 nieuwe foto\'s dit weekend op 3 verschillende locaties.',
      transformatie_afsluiting: 'Je hebt nu alle technieken. Maar de echte vraag is: durf je jezelf te laten zien? Dit weekend is geen test die je moet halen. Het is een kans om te oefenen met iets dat veel groter is dan dating: jezelf accepteren zoals je bent, EN werken aan wie je wilt worden.',
      outro: 'Ga naar buiten. Maak die foto\'s. En elke keer dat je twijfelt, herinner jezelf: dit is niet voor hen. Dit is voor jou.'
    }
  },
  {
    dag_nummer: 7,
    video_script: {
      mindset_hook: 'Een week geleden begon je met een profiel. Nu heb je iets veel waardevollers: een beter begrip van hoe je jezelf ziet. En dát bepaalt je resultaten - niet de foto\'s.',
      bridge: 'Je kunt de perfecte foto\'s hebben en toch geen matches krijgen. Weet je waarom? Omdat mensen niet reageren op pixels - ze reageren op energie. En energie komt van binnenuit. Deze week heb je niet alleen foto\'s verbeterd. Je hebt geoefend met naar jezelf kijken.',
      hook: 'Tijd om te zien hoeveel je in één week bent gegroeid!',
      intro: 'We sluiten week 1 af met een review van je progressie.',
      secties: [
        { titel: 'Foto vergelijking', content: 'Pak je profiel van dag 1 erbij. Kijk naar de before/after. Niet alleen naar de foto\'s - maar naar de energie die ze uitstralen.' },
        { titel: 'Checklist afronden', content: 'Heb je minimaal 4-6 gevarieerde foto\'s? Hoofdfoto met duidelijk gezicht? Lifestyle foto? Hobby foto? Social proof?' },
        { titel: 'Week 2 preview', content: 'Volgende week: de perfecte bio tekst. Van beeld naar woorden - de volgende laag van wie je bent.' }
      ],
      opdracht: 'Finaliseer je foto selectie - minimaal 4 sterke foto\'s klaar voor je profiel.',
      transformatie_afsluiting: 'Voordat je doorgaat naar week 2, wil ik dat je iets doet. Kijk naar je nieuwe profielfoto. Niet om te oordelen of hij goed genoeg is. Maar om te zien: herken ik mezelf? Ben ik trots op wie ik daar zie? Als het antwoord ja is - geweldig. Als het antwoord nee is - dat is óók waardevolle informatie. Want dan weet je waar je naartoe werkt.',
      outro: 'Gefeliciteerd met het afronden van week 1! Volgende week gaan we van beelden naar woorden. En dan wordt het pas écht interessant.'
    }
  },
  {
    dag_nummer: 8,
    video_script: {
      mindset_hook: 'Je bio is geen CV. Het is geen opsomming van feiten. Het is een uitnodiging. De vraag is: waar nodig je mensen voor uit?',
      bridge: 'De meeste bio\'s falen niet omdat ze slecht geschreven zijn. Ze falen omdat ze NIEMAND zijn. Ze zijn generiek, inwisselbaar, vergeetbaar. En weet je waarom? Omdat de meeste mannen bang zijn om echt gezien te worden. Ze verstoppen zich achter clichés en opsommingen. Vandaag leer je niet alleen hoe je een bio SCHRIJFT. Je leert hoe je de moed vindt om jezelf te LATEN ZIEN.',
      hook: 'Je bio is niet een opsomming van feiten - het is een uitnodiging.',
      intro: 'Welkom bij week 2! Nu gaan we je teksten perfectioneren.',
      secties: [
        { titel: 'Waarom bio\'s falen', content: 'De drie doodzondes: lijstjes zonder persoonlijkheid, clichés die iedereen gebruikt, en negativiteit of cynisme.' },
        { titel: 'De hook formule', content: 'Nieuwsgierigheid (waarom zou ik meer willen weten?) + Persoonlijkheid (wie BEN je?) + Call-to-action (wat is de volgende stap?)' },
        { titel: 'De beste vriend test', content: 'Lees je bio hardop. Zou je het zo tegen je beste vriend vertellen? Als het geforceerd klinkt, IS het geforceerd.' }
      ],
      opdracht: 'Schrijf 3 verschillende bio concepten. Lees ze hardop. Kies de meest authentieke.',
      transformatie_afsluiting: 'Je hebt nu formules en voorbeelden. Maar hier is wat echt telt: de beste bio ter wereld werkt niet als hij niet WAAR is. Iemand voelt het verschil tussen \'dit klinkt goed\' en \'dit BEN ik\'. De vraag die je jezelf moet stellen is niet \'wat klinkt aantrekkelijk?\' maar \'wat is waar over mij dat ook aantrekkelijk is?\' Die overlap - dat is je bio.',
      outro: 'Morgen leer je de AI Profiel Coach gebruiken om je bio te verfijnen!'
    }
  },
  {
    dag_nummer: 9,
    video_script: {
      mindset_hook: 'De meeste mensen vragen feedback en hopen dat alles goed is. De groeiers vragen feedback en hopen op iets om te verbeteren.',
      bridge: 'Vandaag ga je de AI Profiel Coach gebruiken. Hij gaat je eerlijke feedback geven. En hier is de vraag die bepaalt of je groeit of niet: kun je feedback ontvangen zonder defensief te worden? Elke keer dat je denkt \'ja maar...\' na feedback, vraag jezelf: bescherm ik mijn ego of zoek ik de waarheid?',
      hook: 'Laat AI je helpen de perfecte bio te schrijven.',
      intro: 'De Profiel Coach analyseert en verbetert je teksten.',
      secties: [
        { titel: 'Input geven', content: 'Hoe specifieker je input, hoe beter de output. Deel context: wat zoek je? Wie wil je aantrekken? Wat maakt jou uniek?' },
        { titel: 'Feedback verwerken', content: 'Neem elke suggestie serieus, maar filter op authenticiteit. Niet alles past bij jou - en dat is oké.' },
        { titel: 'Iteratief verbeteren', content: 'De eerste versie is nooit de beste. Gebruik de coach 3-4 keer met verschillende invalshoeken.' }
      ],
      opdracht: 'Gebruik de Profiel Coach voor minimaal 3 bio varianten. Kies de beste elementen uit elke versie.',
      transformatie_afsluiting: 'De AI heeft je suggesties gegeven. Sommige voelen als \'ja, dat ben ik\'. Andere voelen als \'hmm, dat is niet echt ik\'. Dat gevoel? Dat is je kompas. Volg het. Een AI kan je helpen met structuur en ideeën, maar alleen JIJ weet wie je bent. De beste versie van je bio is niet de meest geoptimaliseerde - het is de meest authentieke.',
      outro: 'Morgen kiezen we de beste versie en verfijnen we de details!'
    }
  },
  {
    dag_nummer: 10,
    video_script: {
      mindset_hook: 'Je eerste zin is geen test. Het is geen trucje. Het is een belofte. De vraag is: welke belofte wil JIJ maken?',
      bridge: 'We gaan het hebben over opening lines. Maar voordat ik je technieken geef, wil ik dat je iets begrijpt: de beste opener ter wereld werkt niet als je angstig bent voor het antwoord. Iemand voelt je energie door tekst heen. Als je stuurt vanuit \'hopelijk vindt ze me leuk\', voelen ze dat. Als je stuurt vanuit \'ik ben nieuwsgierig naar haar\', voelen ze dat ook. Techniek zonder de juiste energie is als een mooie auto zonder benzine.',
      hook: 'De eerste zin bepaalt of iemand doorleest of doorswipet.',
      intro: 'Vandaag focus op je opening line.',
      secties: [
        { titel: 'Hook technieken', content: 'Vier types die werken: de vraag (nieuwsgierigheid), het statement (persoonlijkheid), humor (lichtheid), mysterie (intrige).' },
        { titel: 'Voorbeelden die werken', content: 'Niet \'Hey\' of \'Hoi\'. Wel specifiek, persoonlijk, en makkelijk te beantwoorden. Refereer aan hun profiel.' },
        { titel: 'De energie check', content: 'Voordat je stuurt, vraag: stuur ik dit vanuit nieuwsgierigheid of vanuit behoefte aan goedkeuring?' }
      ],
      opdracht: 'Test 3 verschillende opening stijlen vandaag. Let niet op resultaten - let op hoe het VOELT om ze te sturen.',
      transformatie_afsluiting: 'Je hebt nu formules. Maar de echte vraag is: wie wil je zijn als je dat eerste bericht stuurt? Ben je de man die hoopt op goedkeuring? Of ben je de man die oprecht nieuwsgierig is naar wie deze persoon is? Die tweede man krijgt niet alleen meer antwoorden - hij heeft ook meer plezier. Want hij is niet bezig met presteren. Hij is bezig met ontdekken.',
      outro: 'Morgen: de rest van je profiel teksten perfectioneren!'
    }
  },
  {
    dag_nummer: 11,
    video_script: {
      mindset_hook: 'Veel mannen zijn op 5 apps en doen het matig op allemaal. De winnende strategie? Kies er één of twee en word er geweldig op.',
      bridge: 'Elk platform heeft zijn eigen energie. Tinder is snel en visueel. Bumble geeft vrouwen de controle. Hinge draait om depth. De vraag is niet \'welke app is het beste?\' De vraag is \'welke app past bij wie IK ben en wat IK zoek?\' Als je een diepe connectie zoekt maar alleen op Tinder zit, vecht je tegen de stroom. Kies je speelveld bewust.',
      hook: 'Elk platform heeft zijn eigen regels voor succes.',
      intro: 'Vandaag optimaliseren we per platform.',
      secties: [
        { titel: 'Tinder vs Bumble vs Hinge', content: 'Tinder: volume, visueel, snelle beslissingen. Bumble: vrouwen initiëren, iets serieuzer. Hinge: prompts, designed to be deleted.' },
        { titel: 'Platform-specifieke tips', content: 'Tinder: sterke eerste foto is alles. Bumble: geef haar makkelijke openers. Hinge: je prompts zijn gespreksstarters.' },
        { titel: 'Focus strategie', content: 'Kies maximaal 2 platforms. Word er goed in voordat je uitbreidt. Quality over quantity.' }
      ],
      opdracht: 'Optimaliseer je profiel op je top 2 platforms. Verwijder de apps waar je alleen maar scrollt.',
      transformatie_afsluiting: 'Je hebt nu tips per platform. Maar de echte les is focus. Versnipperde aandacht geeft versnipperde resultaten. Kies één platform om je \'main\' te maken. Word er goed in. Bouw vertrouwen op. En later, als je er comfortabel mee bent, kun je uitbreiden. Maar begin met focus.',
      outro: 'Morgen: antwoord prompts die écht werken!'
    }
  },
  {
    dag_nummer: 12,
    video_script: {
      mindset_hook: 'De prompts die je kiest onthullen wie je bent. De vragen die je VERMIJDT onthullen waar je onzeker over bent.',
      bridge: 'Prompts zijn niet alleen gespreksstarters. Ze zijn vensters naar wie je bent. En de meeste mannen kiezen de veilige, saaie prompts. \'Ik ben op zoek naar...\' Saai. \'Mijn perfecte zondag...\' Generiek. De prompts die werken zijn de prompts die iets ECHTS over je zeggen. En dat betekent dat je kwetsbaar moet durven zijn.',
      hook: 'De juiste prompts maken gesprekken starten veel makkelijker.',
      intro: 'Prompts zijn je geheime wapen voor betere gesprekken.',
      secties: [
        { titel: 'De beste prompts kiezen', content: 'Kies prompts waar je een VERHAAL bij hebt. Niet \'Ik hou van reizen\' maar een specifieke reis-anekdote.' },
        { titel: 'Antwoorden die werken', content: 'Specifiek slaat generiek. \'Ik hou van Italiaans eten\' vs \'Ik ben op zoek naar iemand die mee wil naar dat kleine pasta tentje in de Pijp\'.' },
        { titel: 'De gespreksstarter test', content: 'Als iemand je antwoord leest, kunnen ze er makkelijk op reageren? Zo niet, maak het specifieker.' }
      ],
      opdracht: 'Kies en beantwoord 3 prompts per platform. Minimaal één die je normaal zou vermijden.',
      transformatie_afsluiting: 'Je hebt nu templates. Maar hier is de uitdaging: beantwoord minimaal één prompt die je normaal zou skippen. Die prompts die je vermijdt? Daar zit meestal de interessante content. Want vermijding komt van onzekerheid, en onzekerheid komt van iets dat ertoe doet. De magie zit in het ongemak.',
      outro: 'Morgen: live Q&A sessie - je vragen worden beantwoord!'
    }
  },
  {
    dag_nummer: 13,
    video_script: {
      mindset_hook: 'De vraag die je niet durft te stellen is waarschijnlijk de vraag die je het meest nodig hebt.',
      bridge: 'Vandaag is live Q&A. En ik wil dat je iets begrijpt: hulp vragen is geen zwakte. De man die denkt dat hij alles alleen moet uitzoeken is niet sterk - hij is trots. En trots is een slechte leraar. De snelste manier om te groeien is van anderen leren. Dat begint met durven vragen.',
      hook: 'Je vragen, live beantwoord!',
      intro: 'Welkom bij de live Q&A sessie.',
      secties: [
        { titel: 'Profiel reviews', content: 'We bekijken echte profielen en geven live feedback. Leer van wat werkt en wat niet.' },
        { titel: 'Q&A', content: 'Geen vraag is te dom. De vragen die je niet durft te stellen zijn vaak de vragen die anderen ook hebben.' },
        { titel: 'Community wisdom', content: 'Leer niet alleen van mij, maar ook van de ervaringen van andere deelnemers.' }
      ],
      opdracht: 'Bereid 2 vragen voor die je wilt stellen. Minimaal één die je spannend vindt om te stellen.',
      transformatie_afsluiting: 'Je hebt vandaag gezien dat anderen dezelfde struggles hebben. Je bent niet alleen. En de mensen die het meest groeiden vandaag? Dat waren degenen die durfden te delen waar ze mee worstelden. Onthoud dat voor je hele dating journey: kwetsbaarheid is geen zwakte. Het is de toegangspoort tot echte connectie.',
      outro: 'Morgen: week 2 review en voorbereiding op de gesprekken-week!'
    }
  },
  {
    dag_nummer: 14,
    video_script: {
      mindset_hook: 'Je profiel is nu compleet. Maar een perfect profiel is pas het begin. Het echte spel begint wanneer je op \'stuur\' drukt.',
      bridge: 'In twee weken heb je jezelf in beeld en woord leren presenteren. Dat is niet niks. De meeste mensen nemen nooit de tijd om echt na te denken over hoe ze overkomen. Maar nu begint het echte werk. Want een profiel is potentieel. Een gesprek is actie. En actie is waar resultaten vandaan komen.',
      hook: 'Je profiel is nu 10x beter dan 2 weken geleden!',
      intro: 'Tijd om je progressie te vieren en vooruit te kijken.',
      secties: [
        { titel: 'Before/After', content: 'Vergelijk je profiel van dag 1 met nu. De transformatie is waarschijnlijk groter dan je denkt.' },
        { titel: 'Checklist afronden', content: 'Foto\'s: check. Bio: check. Prompts: check. Je bent klaar voor gesprekken.' },
        { titel: 'Week 3 preview', content: 'Volgende week: van profiel naar gesprekken. De kunst van connectie maken door tekst.' }
      ],
      opdracht: 'Screenshot je profiel nu. Finaliseer alle elementen. Je bent klaar voor week 3.',
      transformatie_afsluiting: 'Voordat je doorgaat, wil ik dat je iets doet. Screenshot je profiel nu. Bewaar het. Over een maand kijk je terug. En dan zie je niet alleen een beter profiel - je ziet bewijs van wie je aan het worden bent. Iemand die de moeite neemt. Iemand die in zichzelf investeert. Iemand die groeit.',
      outro: 'Volgende week gaan we van potentieel naar actie. Dan wordt het pas echt spannend!'
    }
  },
  {
    dag_nummer: 15,
    video_script: {
      mindset_hook: 'De meeste gesprekken sterven niet door wat je ZEGT. Ze sterven door hoe je je VOELT als je het zegt.',
      bridge: 'Vandaag beginnen we aan de belangrijkste week. Niet omdat gesprekstechnieken moeilijk zijn - ze zijn simpel. Maar omdat gesprekken een spiegel zijn. Als je angstig bent, worden je berichten angstig. Als je probeert te presteren, voelt de ander dat. Als je echt nieuwsgierig bent... voelt de ander dat ook. Techniek is 20%. Mindset is 80%.',
      hook: 'De meeste gesprekken sterven na 3 berichten. Dat gaat veranderen.',
      intro: 'Welkom bij de laatste week! Nu leer je gesprekken voeren die leiden tot echte connecties.',
      secties: [
        { titel: 'Waarom gesprekken doodlopen', content: 'Te veel vragen (interview mode), geen persoonlijkheid (alleen reactief), geen richting (geen doel).' },
        { titel: 'De flow formule', content: 'Statement (deel iets) + Vraag (toon interesse) + Callback (refereer naar eerder). Dit creëert een dans, geen verhoor.' },
        { titel: 'Energie management', content: 'Check jezelf voordat je stuurt: ben ik nieuwsgierig of angstig? Nieuwsgierig = sturen. Angstig = eerst kalmeren.' }
      ],
      opdracht: 'Analyseer je laatste 3 gesprekken. Waar ging het mis? Wat zou je nu anders doen?',
      transformatie_afsluiting: 'Je hebt nu de formule. Maar hier is wat echt telt: de volgende keer dat je chat, vraag jezelf af - ben ik nieuwsgierig naar deze persoon, of probeer ik indruk te maken? Nieuwsgierigheid is aantrekkelijk. Performance is vermoeiend. Kies nieuwsgierigheid.',
      outro: 'Morgen: de kunst van het openen - eerste berichten die werken!'
    }
  },
  {
    dag_nummer: 16,
    video_script: {
      mindset_hook: '"Hey" krijgt zelden antwoord. Maar weet je waarom? Niet omdat het te kort is. Maar omdat het niks zegt over wie je bent.',
      bridge: 'Je eerste bericht is je eerste indruk. En de meeste mannen verspillen hem met iets dat nul moeite toont. Maar hier is het ding: de angst die je voelt voordat je dat eerste bericht stuurt - die angst is niet slecht. Die angst betekent dat het ertoe doet. De vraag is: laat je de angst winnen, of druk je op versturen?',
      hook: 'Leer openers die echt werken - en begrijp WAAROM ze werken.',
      intro: 'Vandaag leer je openers die antwoord krijgen.',
      secties: [
        { titel: 'Het probleem met hey', content: 'Het toont geen moeite, geen creativiteit, geen interesse. Het zegt: jij bent inwisselbaar. Niet de boodschap die je wilt sturen.' },
        { titel: 'De perfecte opener', content: 'Drie elementen: Persoonlijk (specifiek over hun profiel), Makkelijk te beantwoorden (geen essay nodig), Toont wie je bent (je persoonlijkheid).' },
        { titel: 'De IJsbreker Generator', content: 'Gebruik de tool, maar maak het altijd JOUW versie. De AI geeft je een startpunt, niet het eindproduct.' }
      ],
      opdracht: 'Stuur vandaag 5 openers. Niet 5 perfecte openers - 5 moedige openers. Het resultaat is minder belangrijk dan de actie.',
      transformatie_afsluiting: 'Je hebt nu tools en voorbeelden. Maar hier is je echte opdracht: stuur vandaag drie openers waar je NIET 100% zeker van bent. Waarom? Omdat zekerheid zoeken een valkuil is. Je zult nooit 100% zeker zijn. De groei zit in het doen ondanks de onzekerheid. Drie berichten. Vandaag. Het antwoord is minder belangrijk dan de actie.',
      outro: 'Morgen: het gesprek gaande houden - van opener naar flow!'
    }
  },
  {
    dag_nummer: 17,
    video_script: {
      mindset_hook: 'Een goed gesprek voelt niet als een interview. Het voelt als een dans - geven en nemen, leiden en volgen.',
      bridge: 'De meeste mannen vallen in de interview trap. Vraag na vraag na vraag. Het voelt voor haar als een kruisverhoor, niet als een connectie. Waarom doen we dit? Omdat vragen veilig voelt. Je geeft niks van jezelf weg. Je riskeert niks. Maar connectie vraagt risico. Connectie vraagt dat je ook iets van jezelf laat zien.',
      hook: 'Stop met interviewen. Begin met connecten.',
      intro: 'Nu leer je hoe je gesprekken laat stromen.',
      secties: [
        { titel: 'De interview trap', content: 'Herken het patroon: vraag-antwoord-vraag-antwoord. Dit is geen gesprek - dit is een enquête. En enquêtes zijn saai.' },
        { titel: 'Statement-vraag ritme', content: 'Deel iets over jezelf voordat je vraagt. "Ik had gister de beste koffie ooit bij die tent op de hoek - wat is jouw go-to koffieplek?"' },
        { titel: 'Delen en connecten', content: 'Kwetsbaarheid creëert connectie. Je hoeft geen geheimen te delen - maar wel iets echts over jezelf.' }
      ],
      opdracht: 'In je volgende gesprek: deel iets persoonlijks VOORDAT je je volgende vraag stelt. Observeer wat er verandert.',
      transformatie_afsluiting: 'In je volgende gesprek, probeer dit: deel iets persoonlijks VOORDAT je je volgende vraag stelt. Het voelt ongemakkelijk. Dat is het punt. Want in dat ongemak zit kwetsbaarheid. En kwetsbaarheid is wat connectie creëert. Je kunt niet diep connecten terwijl je jezelf beschermt.',
      outro: 'Morgen: van chat naar date - wanneer en hoe vraag je om een date!'
    }
  },
  {
    dag_nummer: 18,
    video_script: {
      mindset_hook: 'De meeste mannen wachten te lang om een date te vragen. Ze wachten op het \'perfecte moment\'. Dat moment bestaat niet.',
      bridge: 'Weet je waarom mannen te lang wachten? Angst. Zolang je niet vraagt, kun je niet worden afgewezen. Zolang het een gesprek is, is er hoop. Maar hier is de waarheid: hoop zonder actie is een illusie. De enige manier om te weten of ze geïnteresseerd is, is door te vragen. En het antwoord? Dat is altijd beter dan de onzekerheid.',
      hook: 'Het juiste moment om een date te vragen is eerder dan je denkt.',
      intro: 'Vandaag: van app naar echte date.',
      secties: [
        { titel: 'Timing', content: 'De sweet spot is 10-20 berichten. Genoeg om interesse te peilen, niet zo lang dat het momentum verdwijnt.' },
        { titel: 'De perfecte ask', content: 'Specifiek (niet "een keer afspreken" maar "donderdag koffie"), Laagdrempelig (eerste date = casual), Makkelijk ja (geef opties).' },
        { titel: 'Na de ask', content: 'Ze zegt ja: bevestig tijd en plek, blijf licht contact houden. Ze zegt nee: respecteer het, ga door met je leven.' }
      ],
      opdracht: 'Als je nu met iemand chat: vraag om een date. Vandaag. Het antwoord is minder belangrijk dan het vragen.',
      transformatie_afsluiting: 'Als je nu met iemand chat waar je interesse in hebt - vraag vandaag om een date. Niet omdat je een trucje toepast. Maar omdat je iemand bent die gaat voor wat hij wil. Het antwoord is niet het punt. De man die durft te vragen, ongeacht het antwoord - dat is wie je aan het worden bent.',
      outro: 'Morgen: live coaching - we reviewen echte gesprekken en geven direct advies!'
    }
  },
  {
    dag_nummer: 19,
    video_script: {
      mindset_hook: 'De gesprekken waar je het minst trots op bent - die bevatten je grootste lessen.',
      bridge: 'Vandaag gaan we echte gesprekken reviewen. En dat vraagt moed. Want je laten zien in je imperfectie is niet makkelijk. Maar hier is wat ik weet: iedereen in deze groep worstelt met dezelfde dingen. Je bent niet alleen. En samen leren gaat sneller dan alleen.',
      hook: 'Live hulp bij je lopende gesprekken!',
      intro: 'Welkom bij de live coaching sessie.',
      secties: [
        { titel: 'Gesprek reviews', content: 'We bekijken echte gesprekken en analyseren wat werkt en wat niet. Geen oordeel - alleen feedback.' },
        { titel: 'Real-time hulp', content: 'Zit je vast in een gesprek? Deel het en krijg direct suggesties voor je volgende bericht.' },
        { titel: 'Patronen herkennen', content: 'Leer de common pitfalls zien voordat je erin trapt. Awareness is de eerste stap naar verandering.' }
      ],
      opdracht: 'Deel minimaal één gesprek - bij voorkeur eentje waar je niet 100% trots op bent. Daar leer je het meest van.',
      transformatie_afsluiting: 'Je hebt vandaag gezien dat niemand perfect is. Niet ik, niet de anderen, niet jij. En dat is oké. Dating is geen examen. Het is een oefening in mens zijn. Met alle imperfecties die daarbij horen. De vraag is niet \'ben ik goed genoeg?\' De vraag is \'durf ik te oefenen totdat ik beter word?\'',
      outro: 'Morgen: de belangrijkste dag - mindset en afwijzing. Daar wordt alles samengebracht.'
    }
  },
  {
    dag_nummer: 20,
    video_script: {
      mindset_hook: 'Afwijzing is geen oordeel over je waarde. Het is informatie over compatibility. En die twee zijn fundamenteel verschillend.',
      bridge: 'Dit is misschien de belangrijkste dag van de hele Kickstart. Want al die technieken - foto\'s, bio\'s, gesprekken - ze werken alleen als je mentaal in orde bent. En voor de meeste mannen is de grootste blokkade niet hun profiel. Het is hun angst voor afwijzing. Die angst zorgt ervoor dat je niet stuurt. Niet vraagt. Niet riskeert. En dus niks krijgt. Vandaag gaan we die angst recht in de ogen kijken.',
      hook: 'Afwijzing hoort erbij. Hoe je ermee omgaat bepaalt je succes.',
      intro: 'Vandaag: de mentale kant van dating - de kern van alles.',
      secties: [
        { titel: 'Waarom afwijzing pijn doet', content: 'Evolutionair gezien was sociale afwijzing levensbedreigend. Je brein reageert nog steeds zo. Maar je bent niet meer in de savanne.' },
        { titel: 'Reframing afwijzing', content: 'Oud frame: "Ze vond me niet leuk = ik ben niet goed genoeg." Nieuw frame: "We pasten niet bij elkaar = informatie die me tijd bespaart."' },
        { titel: 'De abundance mindset', content: 'Schaarste-mindset: elke match is kostbaar, elke afwijzing is verlies. Abundance-mindset: er zijn duizenden potentiële matches, elke afwijzing brengt me dichter bij de juiste.' },
        { titel: 'Detachment (Pilarczyk)', content: 'Hecht je niet aan de uitkomst. Doe je best, stuur het bericht, en laat los. Het antwoord is buiten je controle - maar je actie niet.' }
      ],
      opdracht: 'Denk aan een recente afwijzing. Schrijf 3 dingen op die je ervan hebt GELEERD - niet 3 redenen om jezelf te bekritiseren.',
      transformatie_afsluiting: 'Laat me je iets vragen: als je wist dat je NIET kon falen, wat zou je dan doen in dating? Dat ding dat je net dacht - doe dat. Want falen is niet het einde. Falen is feedback. De man die 100 afwijzingen krijgt en doorgaat, wint altijd van de man die 3 afwijzingen krijgt en stopt. Dit is geen tips-cursus meer. Dit gaat over wie je kiest te zijn. Kies de man die doorgaat.',
      outro: 'Morgen: de grote finale. We brengen alles samen en kijken naar je toekomst.'
    }
  },
  {
    dag_nummer: 21,
    video_script: {
      mindset_hook: '21 dagen geleden begon je deze cursus voor meer matches. Maar wat je echt hebt geleerd is veel waardevoller.',
      bridge: 'Laten we eerlijk zijn: je dating leven is niet perfect na 21 dagen. Dat was ook niet de belofte. Maar wat WEL veranderd is - als je echt meedeed - is hoe je naar jezelf kijkt. Hoe je jezelf presenteert. Hoe je omgaat met onzekerheid en afwijzing. En DAT is wat blijft. DAT is wat resultaten brengt op de lange termijn.',
      hook: 'Je hebt het gedaan. 21 dagen. Gefeliciteerd!',
      intro: 'Dit is het einde van de Kickstart - en het begin van je nieuwe dating journey.',
      secties: [
        { titel: 'De complete transformatie', content: 'Week 1: Je hebt geleerd jezelf te ZIEN. Week 2: Je hebt geleerd jezelf te PRESENTEREN. Week 3: Je hebt geleerd te CONNECTEN.' },
        { titel: 'Wat je hebt bereikt', content: 'Niet alleen skills - maar een nieuwe manier van naar dating kijken. Van angst naar nieuwsgierigheid. Van presteren naar ontdekken.' },
        { titel: 'Hoe je momentum behoudt', content: 'Dating is een skill. Skills roesten als je ze niet gebruikt. Blijf oefenen. Blijf groeien. Blijf vragen stellen.' },
        { titel: 'Next steps', content: 'De Kickstart is een fundament. Als je klaar bent voor het volgende niveau, check de Dating Mastery voor geavanceerde technieken.' }
      ],
      opdracht: 'Schrijf een brief aan jezelf over 3 maanden. Wat hoop je te hebben bereikt? Dit is je kompas.',
      transformatie_afsluiting: 'Ik wil dat je iets doet voordat je dit programma afsluit. Schrijf een brief aan jezelf. Niet aan de jij van nu. Aan de jij van over 3 maanden. Schrijf wat je hoopt te hebben bereikt. Niet in matches of dates - maar in wie je bent geworden. In hoe je je voelt. In de moed die je hebt opgebouwd. En bewaar die brief. Over 3 maanden lees je hem terug. Dit is niet het einde van je journey. Dit is het begin. Je hebt de tools. Je hebt de mindset. Nu is het aan jou. Ga ervoor. Je bent er klaar voor.',
      outro: 'Bedankt dat je deze reis met ons hebt gemaakt. We zijn trots op je. Tot de volgende keer!'
    }
  }
];

// ============================================================================
// WERKBOEKEN (DAG 6, 7, 12, 17, 21)
// ============================================================================

const werkboeken: { dag_nummer: number; werkboek: Werkboek }[] = [
  {
    dag_nummer: 6,
    werkboek: {
      titel: 'Weekend Foto Challenge - Werkboek',
      intro: 'Dit is meer dan een checklist - het is een oefening in zelfacceptatie.',
      stappen: [
        'Kies 3 locaties voor je foto shoot',
        'Vraag iemand om je te helpen met foto\'s',
        'Maak minimaal 30 foto\'s per locatie',
        'Maak lifestyle foto\'s (koffie, activiteit)',
        'Maak hobby foto\'s (iets wat je leuk vindt)',
        'Maak casual portret foto\'s',
        'Selecteer je top 10 foto\'s'
      ],
      journaling: [
        { vraag: 'Wat houdt me tegen om dit te doen? Welk excuus gebruik ik?', placeholder: 'Wees eerlijk met jezelf...' },
        { vraag: 'Als ik geen angst had, hoe zou ik deze foto\'s maken?', placeholder: 'Beschrijf de ideale versie...' },
        { vraag: 'Wat heb ik over mezelf geleerd na de shoot?', placeholder: 'Reflecteer op de ervaring...' }
      ],
      key_insight: 'De man die foto\'s durft te maken is dezelfde man die durft te daten. Het begint met de moed om gezien te worden.'
    }
  },
  {
    dag_nummer: 12,
    werkboek: {
      titel: 'Prompt Antwoord Template',
      intro: 'Je prompts zijn geen CV - het zijn uitnodigingen tot gesprek.',
      stappen: [
        'Kies prompts waar je een VERHAAL bij hebt',
        'Schrijf een eerste draft antwoord',
        'Maak het specifieker en persoonlijker',
        'Voeg humor of een hook toe waar mogelijk',
        'Test met de AI Coach en verfijn',
        'Kies minimaal één prompt die je normaal zou vermijden'
      ],
      journaling: [
        { vraag: 'Welke prompts vermijd ik? Wat zegt dat over mijn onzekerheden?', placeholder: 'Die prompts waar ik overheen scroll...' },
        { vraag: 'Welke gesprekken wil ik eigenlijk hebben?', placeholder: 'Als ik kon kiezen waar we over praten...' }
      ],
      key_insight: 'De prompts die je vermijdt bevatten vaak je meest interessante content. Het ongemak is een kompas.'
    }
  },
  {
    dag_nummer: 17,
    werkboek: {
      titel: 'Gesprek Flow Templates',
      intro: 'Een goed gesprek is geen interview - het is een dans.',
      stappen: [
        'Open met iets persoonlijks uit hun profiel',
        'Reageer op hun antwoord met een statement (niet alleen een vraag)',
        'Voeg een gerelateerde vraag toe',
        'Deel iets over jezelf dat relevant is',
        'Bouw naar een date voorstel als het klikt',
        'Let op: maximaal 2 vragen achter elkaar, dan weer een statement'
      ],
      journaling: [
        { vraag: 'Val ik in de interviewer rol? Waarom doe ik dat?', placeholder: 'Eerlijk reflecteren op mijn patronen...' },
        { vraag: 'Wat zou de meest zelfverzekerde versie van mij delen in een gesprek?', placeholder: 'Denk aan specifieke voorbeelden...' }
      ],
      key_insight: 'Je kunt niet diep connecten terwijl je jezelf beschermt. Kwetsbaarheid creëert connectie.'
    }
  },
  {
    dag_nummer: 21,
    werkboek: {
      titel: 'Kickstart Afsluiting & Toekomst',
      intro: 'Dit is niet het einde - het is het begin van wie je aan het worden bent.',
      stappen: [
        'Review je profiel before/after screenshots',
        'Tel je progressie: aantal gesprekken, dates, learnings',
        'Identificeer je #1 doorbraak moment',
        'Schrijf je brief aan jezelf over 3 maanden',
        'Plan je eerste acties voor na de Kickstart',
        'Vier je succes - je hebt dit verdiend!'
      ],
      journaling: [
        { vraag: 'Wie was ik 21 dagen geleden? Wie ben ik nu?', placeholder: 'Het verschil in hoe ik mezelf zie...' },
        { vraag: 'Brief aan mezelf over 3 maanden:', placeholder: 'Lieve toekomstige ik, ik hoop dat je...' },
        { vraag: 'Mijn belangrijkste les uit deze 21 dagen:', placeholder: 'Als ik één ding zou onthouden...' }
      ],
      key_insight: 'Je hebt niet alleen dating skills geleerd. Je hebt geoefend in jezelf zien, jezelf uiten, en connectie maken. Dat is voor altijd.'
    }
  }
];

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function runKickstartUpgrade() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     KICKSTART COMPLETE UPGRADE - TRANSFORMATIE START       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Get Kickstart program ID
    const programResult = await sql`
      SELECT id FROM programs WHERE slug = 'kickstart' LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      console.log('❌ Kickstart program niet gevonden!');
      console.log('   Run eerst de basis migratie.');
      process.exit(1);
    }

    const programId = programResult.rows[0].id;
    console.log(`✅ Kickstart program gevonden (ID: ${programId})\n`);

    // ========================================
    // PHASE 1: UPDATE REFLECTIES
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 FASE 1: Reflectievragen Upgraden (21 dagen)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let reflectieSuccess = 0;
    for (const r of reflecties) {
      try {
        const result = await sql`
          UPDATE program_days
          SET
            reflectie = ${JSON.stringify({ vragen: r.vragen })}::jsonb,
            updated_at = NOW()
          WHERE program_id = ${programId} AND dag_nummer = ${r.dag_nummer}
          RETURNING dag_nummer, titel
        `;
        if (result.rows.length > 0) {
          console.log(`  ✓ Dag ${r.dag_nummer}: ${r.vragen.length} transformationele vragen`);
          reflectieSuccess++;
        }
      } catch (err) {
        console.log(`  ❌ Dag ${r.dag_nummer}: Error`);
      }
    }
    console.log(`\n  📊 Reflecties: ${reflectieSuccess}/21 dagen succesvol\n`);

    // ========================================
    // PHASE 2: UPDATE VIDEO SCRIPTS
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬 FASE 2: Video Scripts Upgraden (Dag 6-21)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let scriptSuccess = 0;
    for (const vs of videoScripts) {
      try {
        const result = await sql`
          UPDATE program_days
          SET
            video_script = ${JSON.stringify(vs.video_script)}::jsonb,
            updated_at = NOW()
          WHERE program_id = ${programId} AND dag_nummer = ${vs.dag_nummer}
          RETURNING dag_nummer, titel
        `;
        if (result.rows.length > 0) {
          console.log(`  ✓ Dag ${vs.dag_nummer}: Hybrid script (mindset + praktijk)`);
          scriptSuccess++;
        }
      } catch (err) {
        console.log(`  ❌ Dag ${vs.dag_nummer}: Error`);
      }
    }
    console.log(`\n  📊 Video Scripts: ${scriptSuccess}/${videoScripts.length} dagen succesvol\n`);

    // ========================================
    // PHASE 3: UPDATE WERKBOEKEN
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📓 FASE 3: Werkboeken Upgraden met Journaling');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let werkboekSuccess = 0;
    for (const wb of werkboeken) {
      try {
        const result = await sql`
          UPDATE program_days
          SET
            werkboek = ${JSON.stringify(wb.werkboek)}::jsonb,
            updated_at = NOW()
          WHERE program_id = ${programId} AND dag_nummer = ${wb.dag_nummer}
          RETURNING dag_nummer, titel
        `;
        if (result.rows.length > 0) {
          console.log(`  ✓ Dag ${wb.dag_nummer}: Werkboek + journaling prompts`);
          werkboekSuccess++;
        }
      } catch (err) {
        console.log(`  ❌ Dag ${wb.dag_nummer}: Error`);
      }
    }
    console.log(`\n  📊 Werkboeken: ${werkboekSuccess}/${werkboeken.length} dagen succesvol\n`);

    // ========================================
    // SUMMARY
    // ========================================
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    UPGRADE COMPLEET!                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 SAMENVATTING:');
    console.log(`   • Reflecties geupgraded: ${reflectieSuccess}/21 dagen`);
    console.log(`   • Video scripts geupgraded: ${scriptSuccess}/${videoScripts.length} dagen`);
    console.log(`   • Werkboeken geupgraded: ${werkboekSuccess}/${werkboeken.length} dagen`);
    console.log('');
    console.log('🎯 WAT IS ER VERANDERD:');
    console.log('   • Elke dag heeft nu 3 transformationele reflectievragen');
    console.log('   • Spiegel (confrontatie) + Identiteit (wie wil je zijn) + Actie');
    console.log('   • Video scripts bevatten nu mindset hooks en transformatie afsluitingen');
    console.log('   • Werkboeken bevatten journaling prompts voor diepere reflectie');
    console.log('');
    console.log('🔗 TEST DE UPGRADE:');
    console.log('   http://localhost:9000/kickstart/dag/1  (check reflecties)');
    console.log('   http://localhost:9000/kickstart/dag/6  (check nieuwe content)');
    console.log('   http://localhost:9000/kickstart/dag/20 (check mindset dag)');
    console.log('');

  } catch (error) {
    console.error('\n❌ Upgrade mislukt:', error);
    process.exit(1);
  }
}

// Run the upgrade
runKickstartUpgrade().then(() => {
  process.exit(0);
});
