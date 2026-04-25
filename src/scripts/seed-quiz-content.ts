/**
 * Seed quiz questions for all 48 Transformatie lessons (12 modules × 4 lessons)
 * Run: npx tsx src/scripts/seed-quiz-content.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

interface QuizQuestion {
  moduleOrder: number;
  lessonOrder: number;
  questionOrder: number;
  questionText: string;
  options: { label: string; value: string }[];
  correctAnswer: string;
  explanation: string;
}

const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════
  // MODULE 1 — Design Your Love Life
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 1, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat beschrijft het DESIGN → ACTION → SURRENDER framework het beste?',
    options: [
      { label: 'Drie dating-apps die je na elkaar gebruikt', value: 'a' },
      { label: 'Een bewust drielaags pad naar transformatie in je liefdesleven', value: 'b' },
      { label: 'De drie stappen van een succesvolle eerste date', value: 'c' },
      { label: 'Een methode om een ex terug te winnen', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Het framework geeft je een bewust pad: in de DESIGN fase ontwerp je wie je bent, in ACTION pas je het toe, in SURRENDER laat je los en ontvang je.',
  },
  { moduleOrder: 1, lessonOrder: 1, questionOrder: 2,
    questionText: 'Dating is in dit programma primair beschreven als...',
    options: [
      { label: 'Een aangeboren talent dat je wel of niet hebt', value: 'a' },
      { label: 'Een kwestie van geluk en timing', value: 'b' },
      { label: 'Een vaardigheid die je kunt leren', value: 'c' },
      { label: 'Een persoonlijkheidskenmerk dat nauwelijks verandert', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Dating is een vaardigheid — je bent niet "slecht in liefde", je hebt gewoon de juiste aanpak nog niet gevonden.',
  },

  // Les 2
  { moduleOrder: 1, lessonOrder: 2, questionOrder: 1,
    questionText: 'Wat is volgens de les de hoofdoorzaak van dating burnout?',
    options: [
      { label: 'Te weinig matches op de apps', value: 'a' },
      { label: 'Te veel keuzes gecombineerd met te weinig intentie', value: 'b' },
      { label: 'Slechte fotoʼs op je profiel', value: 'c' },
      { label: 'Gebrek aan zelfvertrouwen', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Choice overload verlaamt onze besluitvorming: meer opties betekenen minder tevredenheid. De oplossing is slimmer daten met intentie, niet harder proberen.',
  },
  { moduleOrder: 1, lessonOrder: 2, questionOrder: 2,
    questionText: 'Welke aanpak lost dating burnout het beste op?',
    options: [
      { label: 'Meer apps downloaden en meer matches maken', value: 'a' },
      { label: 'Tijdelijk helemaal stoppen met daten', value: 'b' },
      { label: 'Slimmer daten met intentie in plaats van harder proberen', value: 'c' },
      { label: 'Je standaarden verlagen om sneller iemand te vinden', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'De oplossing is niet harder proberen maar slimmer — daten met intentie, niet met hoop.',
  },

  // Les 3
  { moduleOrder: 1, lessonOrder: 3, questionOrder: 1,
    questionText: 'Waarom zijn kernwaarden zo belangrijk bij daten?',
    options: [
      { label: 'Ze helpen je profiel aantrekkelijker te maken', value: 'a' },
      { label: 'Ze zijn je interne kompas voor betere keuzes en het aantrekken van de juiste partner', value: 'b' },
      { label: 'Ze maken het makkelijker om small talk te voeren', value: 'c' },
      { label: 'Ze zijn alleen nuttig bij langdurige relaties', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je kernwaarden zijn je datinglijstje — zonder dat weet je niet wat je zoekt. Compromis op kernwaarden leidt altijd tot frictie.',
  },
  { moduleOrder: 1, lessonOrder: 3, questionOrder: 2,
    questionText: 'Wat is het verschil tussen een kernwaarde en een wens bij daten?',
    options: [
      { label: 'Kernwaarden zijn belangrijker dan wensen, maar beide zijn niet-onderhandelbaar', value: 'a' },
      { label: 'Kernwaarden zijn niet-onderhandelbaar; op wensen kun je gezond compromis sluiten', value: 'b' },
      { label: 'Er is geen praktisch verschil', value: 'c' },
      { label: 'Wensen zijn persoonlijker dan kernwaarden', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Compromis op kernwaarden leidt altijd tot frictie. Compromis op wensen is gezond en normaal in relaties.',
  },

  // Les 4
  { moduleOrder: 1, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat onderscheidt een dating-intentie van een gewone wens?',
    options: [
      { label: 'Een intentie is vaag en inspirerend, een wens is concreet', value: 'a' },
      { label: 'Een intentie is concreet, positief en vanuit kracht geformuleerd — geen verlanglijst', value: 'b' },
      { label: 'Een wens is sterker dan een intentie omdat hij emotioneel is', value: 'c' },
      { label: 'Er is geen verschil — beide gaan over wat je wilt', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Een intentie is concreet, positief en vanuit kracht — een kompasrichting, geen verlanglijst. Mensen met een heldere intentie ervaren significant minder dating stress.',
  },
  { moduleOrder: 1, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat betekent het als je dating-intentie verandert naarmate je groeit?',
    options: [
      { label: 'Dat je niet consistent genoeg bent', value: 'a' },
      { label: 'Dat je programma niet werkt', value: 'b' },
      { label: 'Dat je aan het falen bent', value: 'c' },
      { label: 'Dat je aan het leren bent — intenties mogen meegroeien', value: 'd' },
    ],
    correctAnswer: 'd',
    explanation: 'Je intentie mag veranderen naarmate je groeit — dat is geen falen, dat is leren.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 2 — Jouw Relatie-DNA
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 2, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wanneer worden hechtingspatronen gevormd?',
    options: [
      { label: 'Tijdens de puberteit', value: 'a' },
      { label: 'In de eerste volwassen relatie', value: 'b' },
      { label: 'Vóór het tweede levensjaar', value: 'c' },
      { label: 'Gedurende het hele leven gelijkmatig', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Hechtingspatronen worden gevormd vóór ons 2e levensjaar — ze zijn diep maar veranderbaar door bewustwording en oefening.',
  },
  { moduleOrder: 2, lessonOrder: 1, questionOrder: 2,
    questionText: 'Hoe kun je je hechtingsstijl het beste omschrijven?',
    options: [
      { label: 'Een aangeboren karaktergebrek dat je niet kunt veranderen', value: 'a' },
      { label: 'Een overlevingsstrategie die je niet meer nodig hebt maar wel kunt veranderen', value: 'b' },
      { label: 'Een bewuste keuze die je elke dag opnieuw maakt', value: 'c' },
      { label: 'Iets dat alleen door therapie te veranderen is', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je hechtingsstijl is geen karaktergebrek — het is een overlevingsstrategie die je niet meer nodig hebt. Bewustwording is de eerste stap naar verandering.',
  },

  // Les 2
  { moduleOrder: 2, lessonOrder: 2, questionOrder: 1,
    questionText: 'Welk percentage van de mensen heeft een veilige hechtingsstijl?',
    options: [
      { label: 'Ongeveer 20%', value: 'a' },
      { label: 'Ongeveer 50%', value: 'b' },
      { label: 'Ongeveer 75%', value: 'c' },
      { label: 'Ongeveer 90%', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Circa 50% van mensen hecht veilig: comfortabel met nabijheid én autonomie. Dit is het doel van het programma.',
  },
  { moduleOrder: 2, lessonOrder: 2, questionOrder: 2,
    questionText: 'Hoe uit een vermijdende hechtingsstijl zich in de praktijk?',
    options: [
      { label: 'Als hoge emotionele intensiteit bij dreiging van verlies', value: 'a' },
      { label: 'Als emotionele afstand als beschermingsmechanisme — lijkt koel maar is onderliggende angst', value: 'b' },
      { label: 'Als comfortabel met zowel nabijheid als autonomie', value: 'c' },
      { label: 'Als de wens naar nabijheid maar tegelijk angst daarvoor', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Vermijdend hechtenden (25%) gebruiken emotionele afstand als bescherming. Het lijkt cool of onafhankelijk, maar de grondslag is angst voor intimiteit.',
  },

  // Les 3
  { moduleOrder: 2, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat is waar over hechtingsstijlen per relatie?',
    options: [
      { label: 'Je hebt altijd exact dezelfde hechtingsstijl in elke relatie', value: 'a' },
      { label: 'Je hechtingsstijl kan variëren per relatie — je bent niet opgesloten in één stijl', value: 'b' },
      { label: 'Hechtingsstijlen zijn permanent vastgelegd na je tiende jaar', value: 'c' },
      { label: 'Alleen mensen met trauma hebben een bepaalde hechtingsstijl', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je hechtingsstijl kan variëren per relatie. Er is geen "slechte" stijl — alleen patronen die je dienen of belemmeren.',
  },
  { moduleOrder: 2, lessonOrder: 3, questionOrder: 2,
    questionText: 'Wat maakt verandering van een hechtingsstijl mogelijk?',
    options: [
      { label: 'Wachten tot de juiste partner jou heelt', value: 'a' },
      { label: 'Inzicht plus oefening — neuroplasticiteit in actie', value: 'b' },
      { label: 'Alleen intensieve langdurige therapie', value: 'c' },
      { label: 'Hechtingsstijlen zijn fundamenteel onveranderlijk', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Inzicht + oefening = verandering. Dit is neuroplasticiteit in actie. Kleine, consistente veranderingen herschrijven neurale paden.',
  },

  // Les 4
  { moduleOrder: 2, lessonOrder: 4, questionOrder: 1,
    questionText: 'Waar vindt transformatie van je hechtingsgedrag plaatsvinden?',
    options: [
      { label: 'In de ruimte tussen je automatische reactie en je bewuste keuze', value: 'a' },
      { label: 'Alleen tijdens grote levensgebeurtenissen', value: 'b' },
      { label: 'Enkel in nieuwe relaties, niet in bestaande patronen', value: 'c' },
      { label: 'Automatisch zodra je bewust bent van je patroon', value: 'd' },
    ],
    correctAnswer: 'a',
    explanation: 'De gap tussen je automatische reactie en je bewuste keuze is precies waar transformatie plaatsvindt.',
  },
  { moduleOrder: 2, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat is de meest effectieve aanpak bij het veranderen van een hechtingstrigger?',
    options: [
      { label: 'De trigger zoveel mogelijk vermijden', value: 'a' },
      { label: 'Wachten tot het patroon vanzelf verdwijnt', value: 'b' },
      { label: 'Een grote gedragsverandering in één keer doorvoeren', value: 'c' },
      { label: 'Kleine, consistente bewuste reacties oefenen die neurale paden herschrijven', value: 'd' },
    ],
    correctAnswer: 'd',
    explanation: 'Kleine, consistente veranderingen herschrijven neurale paden. Een grote sprong is niet nodig — het is de dagelijkse oefening die telt.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 3 — Magnetische Identiteit
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 3, lessonOrder: 1, questionOrder: 1,
    questionText: 'Hoe snel vormt ons brein een eerste indruk?',
    options: [
      { label: 'Binnen 30 seconden', value: 'a' },
      { label: 'Binnen 5 seconden', value: 'b' },
      { label: 'Binnen 0,1 seconde', value: 'c' },
      { label: 'Pas na een volledig gesprek', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'In 0,1 seconde vormt ons brein een oordeel over warmte, competentie en betrouwbaarheid. Jouw profiel moet dat gevoel opwekken.',
  },
  { moduleOrder: 3, lessonOrder: 1, questionOrder: 2,
    questionText: 'Wat is het doel van een dating-profiel?',
    options: [
      { label: 'Zo veel mogelijk indruk maken met je prestaties', value: 'a' },
      { label: 'Een uitnodiging zijn die een gevoel opwekt bij de juiste persoon', value: 'b' },
      { label: 'Een compleet beeld geven van al jouw eigenschappen', value: 'c' },
      { label: 'Perfecte foto\'s tonen om zoveel mogelijk matches te krijgen', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je profiel is een uitnodiging, geen cv. Het doel is een gevoel opwekken, niet indruk maken. Authenticiteit is aantrekkelijker dan perfectie.',
  },

  // Les 2
  { moduleOrder: 3, lessonOrder: 2, questionOrder: 1,
    questionText: 'Welke combinatie van foto\'s werkt het beste voor een datingprofiel?',
    options: [
      { label: 'Alleen professionele studiofoto\'s', value: 'a' },
      { label: 'Alleen groepsfoto\'s om sociaal te lijken', value: 'b' },
      { label: 'Variatie: activiteit, sociaal, close-up en full-body', value: 'c' },
      { label: 'Eén perfecte foto is genoeg', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Variatie vertelt een verhaal: activiteit, sociaal, close-up, full-body. Een groepsfoto als eerste foto is altijd een slechte keuze.',
  },
  { moduleOrder: 3, lessonOrder: 2, questionOrder: 2,
    questionText: 'Welke elementen bepalen 80% van het succes van een hoofdfoto?',
    options: [
      { label: 'Dure kleding en professionele belichting', value: 'a' },
      { label: 'Goed licht, oogcontact en een oprechte glimlach', value: 'b' },
      { label: 'Een exotische locatie en opvallende kleur', value: 'c' },
      { label: 'Een recente en hoge resolutie', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Hoofdfoto: goed licht, oogcontact, oprechte glimlach — dat is 80% van het werk. Echtheid wint van perfectie.',
  },

  // Les 3
  { moduleOrder: 3, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat maakt een dating bio effectief?',
    options: [
      { label: 'Zoveel mogelijk eigenschappen opsommen zoals "avontuurlijk" en "van reizen houden"', value: 'a' },
      { label: 'Specificiteit die nieuwsgierigheid opwekt en ruimte laat voor een gesprek', value: 'b' },
      { label: 'Een professioneel klinkende beschrijving van je carrière', value: 'c' },
      { label: 'Een grappige opmerking die iedereen aanspreekt', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Clichés als "avontuurlijk" zeggen niets over jou. Specificiteit is magnetisch: "Koffie om 7 uur en true crime podcasts" werkt beter dan "van muziek houden".',
  },
  { moduleOrder: 3, lessonOrder: 3, questionOrder: 2,
    questionText: 'Wat is de ideale uitwerking van een dating bio?',
    options: [
      { label: 'Bewondering wekken', value: 'a' },
      { label: 'Indruk maken met je prestaties', value: 'b' },
      { label: 'Nieuwsgierigheid opwekken', value: 'c' },
      { label: 'Zoveel mogelijk matches genereren', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Een goede bio roept geen bewondering op — het roept nieuwsgierigheid op. Eén open vraag in je bio verhoogt de kans op een eerste bericht significant.',
  },

  // Les 4
  { moduleOrder: 3, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat is het uiteindelijke doel van een sterk datingprofiel?',
    options: [
      { label: 'Zoveel mogelijk matches genereren', value: 'a' },
      { label: 'De juiste mensen aantrekken én de verkeerde mensen filteren', value: 'b' },
      { label: 'Zo authentiek mogelijk overkomen', value: 'c' },
      { label: 'Een perfecte weergave zijn van wie je bent', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Een sterk profiel filtert automatisch — het trekt aan én selecteert. Het doel is de juiste mensen aantrekken, niet iedereen.',
  },
  { moduleOrder: 3, lessonOrder: 4, questionOrder: 2,
    questionText: 'Hoe gebruik je feedback van de Vibe Check het beste?',
    options: [
      { label: 'Als persoonlijk oordeel over wie je bent', value: 'a' },
      { label: 'Als bewijs dat je profiel niet werkt', value: 'b' },
      { label: 'Als data om je profiel te kalibreren — geen oordeel maar informatie', value: 'c' },
      { label: 'Om je profiel aan te passen aan wat de meeste mensen leuk vinden', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Feedback is data, geen oordeel. Gebruik het om je profiel te kalibreren en de juiste mensen aan te trekken.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 4 — Bewust Matchen
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 4, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat is de beste datingstrategie?',
    options: [
      { label: 'De strategie die het meeste wetenschappelijk is bewezen', value: 'a' },
      { label: 'De strategie die de meeste matches oplevert', value: 'b' },
      { label: 'De strategie die bij jou past en die jij vol kunt houden', value: 'c' },
      { label: 'De strategie die een succesvol persoon in jouw omgeving gebruikt', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Er is geen universele datingstrategie. De enige strategie die werkt is de strategie die bij jou past — omdat jij hem vol kunt houden.',
  },
  { moduleOrder: 4, lessonOrder: 1, questionOrder: 2,
    questionText: 'Bewust daten begint met...',
    options: [
      { label: 'Het juiste profiel op de juiste app', value: 'a' },
      { label: 'Kennis van jezelf als dater: je stijl, ritme en energieniveau', value: 'b' },
      { label: 'Kennis van wat populaire datingcoaches adviseren', value: 'c' },
      { label: 'Weten wat jouw matches aantrekkelijk vinden', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Bewust daten begint met kennis van jezelf als dater. Apps, coaches en vrienden geven tips vanuit hun perspectief — jij bent de enige expert op jezelf.',
  },

  // Les 2
  { moduleOrder: 4, lessonOrder: 2, questionOrder: 1,
    questionText: 'Hoe beïnvloedt introversie het beste je datingstrategie?',
    options: [
      { label: 'Introverten zouden dating apps moeten vermijden', value: 'a' },
      { label: 'Introverten raken niet uitgeput door daten, maar door te snel te veel daten', value: 'b' },
      { label: 'Introverten moeten hun grenzen doorbreken en meer daten', value: 'c' },
      { label: 'Introversie en daten gaan fundamenteel niet samen', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Introverten raken niet uitgeput van daten — ze raken uitgeput van te snel te veel daten. Het gangbare datingadvies is grotendeels voor extraverten geschreven.',
  },
  { moduleOrder: 4, lessonOrder: 2, questionOrder: 2,
    questionText: 'Wat is voor introverten de optimale datingstrategie?',
    options: [
      { label: 'Zo snel mogelijk veel dates plannen voor meer oefening', value: 'a' },
      { label: 'Kwaliteit boven kwantiteit — dat is geen compromis maar de strategie', value: 'b' },
      { label: 'Alleen online communiceren en nooit live afspreken', value: 'c' },
      { label: 'Extrovert gedrag aanleren om meer aantrekkingskracht te hebben', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Kwaliteit boven kwantiteit is voor introverten geen compromis — het is de strategie. Het juiste tempo is het tempo dat je vol kunt houden.',
  },

  // Les 3
  { moduleOrder: 4, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat vertelt energieverlies na een date je?',
    options: [
      { label: 'Dat je introvert bent en beter niet kunt daten', value: 'a' },
      { label: 'Dat de date niet goed ging', value: 'b' },
      { label: 'Bruikbare data over wat niet bij jou past', value: 'c' },
      { label: 'Dat je te weinig sociale interactie hebt', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Energieverlies is data — het wijst naar wat niet bij je past. Sociale energie is eindig en meetbaar.',
  },
  { moduleOrder: 4, lessonOrder: 3, questionOrder: 2,
    questionText: 'Waarom is het meten van sociale energie nuttig bij daten?',
    options: [
      { label: 'Om te bepalen of je introvert of extrovert bent', value: 'a' },
      { label: 'Om indruk te maken op je date', value: 'b' },
      { label: 'Om je datingkalender te plannen op basis van beschikbare energie', value: 'c' },
      { label: 'Om te weten wanneer je meer koffie moet drinken', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'De Energie Batterij helpt je patronen zien die je anders niet opmerkt. Je kunt je datingkalender plannen op basis van energie — je kunt niet geven wat je niet hebt.',
  },

  // Les 4
  { moduleOrder: 4, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat is het risico van swipen zonder intentie?',
    options: [
      { label: 'Je profiel wordt minder zichtbaar in het algoritme', value: 'a' },
      { label: 'Je trekt de verkeerde mensen aan', value: 'b' },
      { label: 'Het is de snelste weg naar dating burnout', value: 'c' },
      { label: 'Je mist goede matches door te snel te beslissen', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Swipen zonder intentie is de snelste weg naar burnout. Eén goede conversatie per dag is meer waard dan tien oppervlakkige matches.',
  },
  { moduleOrder: 4, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat is de essentie van de overgang van DESIGN naar ACTION?',
    options: [
      { label: 'Je stopt met nadenken en gaat gewoon op zoveel mogelijk dates', value: 'a' },
      { label: 'Je weet nu wie je bent, wat je zoekt en hoe je duurzaam datet — de actiefase begint', value: 'b' },
      { label: 'Je vervangt je profiel door een nieuw, verbeterd profiel', value: 'c' },
      { label: 'Je sluit alle dating apps af en start opnieuw', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je sluit de DESIGN fase bewust af. Je weet wie je bent, wat je zoekt en hoe je duurzaam datet. De ACTION fase begint nu — met intentie.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 5 — Verbinding & Diepgang
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 5, lessonOrder: 1, questionOrder: 1,
    questionText: 'Waarom werken generieke openingszinnen niet?',
    options: [
      { label: 'Ze zijn te lang en mensen lezen ze niet helemaal', value: 'a' },
      { label: 'Generieke openers leveren generieke reacties op — ze doorbreken de ruis niet', value: 'b' },
      { label: 'Ze zijn te formeel voor een datingapp', value: 'c' },
      { label: 'Matches prefereren stilte boven een slechte opener', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Generieke openers = generieke reacties. Specificiteit doorbreekt de ruis. De eerste zin zet de toon voor het hele gesprek.',
  },
  { moduleOrder: 5, lessonOrder: 1, questionOrder: 2,
    questionText: 'Wat werkt beter in een openingsbericht: complimenten of nieuwsgierigheid?',
    options: [
      { label: 'Complimenten werken altijd beter', value: 'a' },
      { label: 'Ze zijn even effectief', value: 'b' },
      { label: 'Nieuwsgierigheid is aantrekkelijker dan complimenten', value: 'c' },
      { label: 'Complimenten over uiterlijk werken het beste', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Nieuwsgierigheid is aantrekkelijker dan complimenten — stel vragen over hen in plaats van oordelen te geven.',
  },

  // Les 2
  { moduleOrder: 5, lessonOrder: 2, questionOrder: 1,
    questionText: 'Wat maakt een openingszin écht effectief?',
    options: [
      { label: 'Hij is lang genoeg om de ander te imponeren', value: 'a' },
      { label: 'Hij is specifiek, persoonlijk en laat ruimte voor een antwoord', value: 'b' },
      { label: 'Hij is grappig en luchtig', value: 'c' },
      { label: 'Hij toont dat je slim en belezen bent', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'De beste openingszin is specifiek, persoonlijk en laat ruimte voor een antwoord. Vraag iets dat zij kunnen beantwoorden vanuit hun eigen ervaring.',
  },
  { moduleOrder: 5, lessonOrder: 2, questionOrder: 2,
    questionText: 'Wanneer werkt humor in een openingsbericht?',
    options: [
      { label: 'Altijd — humor is altijd de beste opener', value: 'a' },
      { label: 'Alleen als de match zelf ook humoristisch overkomt', value: 'b' },
      { label: 'Alleen als het authentiek is en niet geforceerd', value: 'c' },
      { label: 'Nooit — het is te riskant in een eerste bericht', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Humor werkt — maar alleen als het authentiek is en niet geforceerd. Geforceerde humor werkt averechts.',
  },

  // Les 3
  { moduleOrder: 5, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat toont Aron\'s onderzoek over het opbouwen van verbinding?',
    options: [
      { label: 'Gedeelde ervaringen creëren de sterkste verbinding', value: 'a' },
      { label: 'Gedeelde kwetsbaarheid creëert sneller verbinding dan gedeelde ervaringen', value: 'b' },
      { label: 'Humor is de sterkste verbindingsfactor', value: 'c' },
      { label: 'Verbinding bouw je alleen op door veel tijd samen door te brengen', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Arthur Aron\'s onderzoek toont: gedeelde kwetsbaarheid creëert sneller verbinding dan gedeelde ervaringen. Small talk is de opmaat, niet het doel.',
  },
  { moduleOrder: 5, lessonOrder: 3, questionOrder: 2,
    questionText: 'Wat is "selectieve authenticiteit" in een gesprek?',
    options: [
      { label: 'Alleen authentiek zijn als de ander het ook is', value: 'a' },
      { label: 'Alles delen wat je voelt en denkt', value: 'b' },
      { label: 'Strategisch openheid tonen zonder alles te delen — de sleutel tot diepgang', value: 'c' },
      { label: 'Authentiek overkomen maar weinig echts zeggen', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Je hoeft niet alles te delen — selectieve authenticiteit is de sleutel. De diepste gesprekken beginnen niet met vragen maar met eerlijke antwoorden.',
  },

  // Les 4
  { moduleOrder: 5, lessonOrder: 4, questionOrder: 1,
    questionText: 'Hoe werken Aron\'s 36 vragen?',
    options: [
      { label: 'Ze geven je altijd een romantische verbinding', value: 'a' },
      { label: 'Ze werken door gedeelde kwetsbaarheid uit te nodigen — niet door de vragen zelf', value: 'b' },
      { label: 'Ze werken alleen als beide mensen ze kennen', value: 'c' },
      { label: 'Ze zijn bedoeld als vervanging voor gewone gesprekken', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Het gaat niet om de vragen zelf — maar om de gedeelde kwetsbaarheid die ze uitnodigen. Oefenen is essentieel zodat de vragen natuurlijk aanvoelen.',
  },
  { moduleOrder: 5, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat is intimiteit in de context van verbinding?',
    options: [
      { label: 'Een gevoel dat je vindt bij de juiste persoon', value: 'a' },
      { label: 'Iets dat alleen tijd kan opbouwen', value: 'b' },
      { label: 'Iets dat je samen bouwt — actief en bewust', value: 'c' },
      { label: 'Hetzelfde als romantiek', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Intimiteit is geen gevoel dat je vindt — het is iets dat je samen bouwt. Bewust, door gedeelde kwetsbaarheid te creëren.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 6 — De Selectie & Veiligheid
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 6, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat is het verschil tussen chemie en compatibiliteit?',
    options: [
      { label: 'Chemie is dieper dan compatibiliteit', value: 'a' },
      { label: 'Ze zijn hetzelfde — sterke chemie is altijd compatibiliteit', value: 'b' },
      { label: 'Chemie is het begin, compatibiliteit is wat een relatie houdt', value: 'c' },
      { label: 'Compatibiliteit is minder belangrijk dan chemie voor geluk', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Chemie zegt: "Dit voelt goed." Compatibiliteit zegt: "Dit werkt." De meeste langdurige relaties beginnen niet met overweldigende chemie.',
  },
  { moduleOrder: 6, lessonOrder: 1, questionOrder: 2,
    questionText: 'Zijn vlinders (intense chemie) een betrouwbare indicator van relatie-succes?',
    options: [
      { label: 'Ja, sterke chemie is de beste voorspeller van een goede relatie', value: 'a' },
      { label: 'Nee — vlinders zijn goed maar zijn geen criterium voor succes op lange termijn', value: 'b' },
      { label: 'Ja, als de vlinders langer dan 3 maanden duren', value: 'c' },
      { label: 'Nee, vlinders zijn altijd een teken van een ongezonde relatie', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Vlinders zijn goed, maar ze zijn geen criterium voor succes op lange termijn. Je hebt zowel chemie als compatibiliteit nodig.',
  },

  // Les 2
  { moduleOrder: 6, lessonOrder: 2, questionOrder: 1,
    questionText: 'Hoe worden rode vlaggen het vaakst genegeerd?',
    options: [
      { label: 'Doordat mensen ze gewoonweg niet zien', value: 'a' },
      { label: 'Doordat ze worden gerationaliseerd: "hij/zij is gewoon zo"', value: 'b' },
      { label: 'Doordat mensen bang zijn voor conflicten', value: 'c' },
      { label: 'Doordat mensen onervaren zijn in relaties', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Rode vlaggen worden vaak gerationaliseerd weg — "hij/zij is gewoon zo". Vroege patroonherkenning is een vaardigheid, geen paranoia.',
  },
  { moduleOrder: 6, lessonOrder: 2, questionOrder: 2,
    questionText: 'Welke subtiele rode vlag wordt het vaakst gemist?',
    options: [
      { label: 'Agressief gedrag', value: 'a' },
      { label: 'Inconsistentie, grenzeloosheid en overclaiming', value: 'b' },
      { label: 'Weinig sociale media aanwezigheid', value: 'c' },
      { label: 'Introversie en bescheidenheid', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Soms zijn rode vlaggen subtiel: grenzeloosheid, inconsistentie, overclaiming. Agressief gedrag is duidelijk, maar subtiele signalen zijn gevaarlijker.',
  },

  // Les 3
  { moduleOrder: 6, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat is de sterkste groene vlag in een potentiële partner?',
    options: [
      { label: 'Veel aandacht en complimenten geven', value: 'a' },
      { label: 'Consistentie: zeggen wat je doet en doen wat je zegt', value: 'b' },
      { label: 'Een breed sociaal netwerk hebben', value: 'c' },
      { label: 'Intense chemie en romantiek van het begin af aan', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Consistentie is de sterkste groene vlag. Weet niet alleen wat je niet wilt — weet precies wat je wél wilt.',
  },
  { moduleOrder: 6, lessonOrder: 3, questionOrder: 2,
    questionText: 'Waarom is het actief zoeken naar groene vlaggen net zo belangrijk als letten op rode vlaggen?',
    options: [
      { label: 'Omdat groene vlaggen rode vlaggen kunnen compenseren', value: 'a' },
      { label: 'Omdat je anders gefocust blijft op negatieve selectie en nooit iemand goed genoeg vindt', value: 'b' },
      { label: 'Omdat de meeste mensen meer groene dan rode vlaggen hebben', value: 'c' },
      { label: 'Het is niet nodig — rode vlaggen zijn voldoende als selectiecriterium', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Groene vlaggen zijn even belangrijk als rode. Weet wat je zoekt, niet alleen wat je vermijdt. Emotionele beschikbaarheid en respect voor grenzen zijn krachtige positieve signalen.',
  },

  // Les 4
  { moduleOrder: 6, lessonOrder: 4, questionOrder: 1,
    questionText: 'Hoeveel dealbreakers zijn ideaal?',
    options: [
      { label: 'Geen — dealbreakers zijn te rigide', value: 'a' },
      { label: 'Zo veel mogelijk, want selectiviteit is goed', value: 'b' },
      { label: 'Maximaal 3 tot 5 — anders wordt alles een dealbreaker', value: 'c' },
      { label: 'Exact 10 — één per jaar dat je al datet', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Dealbreakers zijn niet-onderhandelbaar — maar max 3-5, anders wordt alles een dealbreaker en vind je niemand goed genoeg.',
  },
  { moduleOrder: 6, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat zijn selectiecriteria in wezen?',
    options: [
      { label: 'Bewijs dat je te veeleisend bent', value: 'a' },
      { label: 'Een bescherming van je energie — geen filter voor perfectie', value: 'b' },
      { label: 'Een checklist die je van tevoren invult en nooit aanpast', value: 'c' },
      { label: 'Een teken dat je de juiste persoon nog niet hebt gevonden', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Selectiecriteria beschermen je energie — ze zijn geen filter om perfectie te zoeken. Selectief zijn is geen hoogmoed. Het is zelfrespect.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 7 — De Ontmoeting
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 7, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat is het risico van te lang wachten met het vragen om een date?',
    options: [
      { label: 'Je match verliest interesse in de app', value: 'a' },
      { label: 'Je komt pusherig over', value: 'b' },
      { label: 'Er ontstaat een "chat-pal" dynamiek zonder romantische richting', value: 'c' },
      { label: 'Je match denkt dat je te serieus bent', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Te vroeg vragen kan pusherig voelen — maar te laat leidt tot een "chat-pal" dynamiek. De ideale timing: zodra er wederzijdse interesse is.',
  },
  { moduleOrder: 7, lessonOrder: 1, questionOrder: 2,
    questionText: 'Welke formulering werkt beter bij het vragen om een date?',
    options: [
      { label: '"Zullen we een keer iets doen?"', value: 'a' },
      { label: 'Een specifiek voorstel: dag, tijd en activiteit', value: 'b' },
      { label: 'Impliciet hints geven en kijken of zij het initiatief nemen', value: 'c' },
      { label: '"Ik vind je leuk" — kort en direct', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Een specifiek voorstel werkt beter dan een open "zullen we een keer iets doen?" — het verlaagt de drempel voor de ander om ja te zeggen.',
  },

  // Les 2
  { moduleOrder: 7, lessonOrder: 2, questionOrder: 1,
    questionText: 'Waarom werken activiteit-dates beter dan restaurant-dates als eerste date?',
    options: [
      { label: 'Ze zijn goedkoper', value: 'a' },
      { label: 'Ze geven iets om over te praten en verminderen druk', value: 'b' },
      { label: 'Ze bewijzen dat je creatief bent', value: 'c' },
      { label: 'Ze duren korter en zijn daarmee minder risicovol', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Activiteit-dates werken beter dan restaurant-dates: er is iets om over te praten en er is minder druk. Kies een locatie die bij jou past — je bent op je best als je je thuis voelt.',
  },
  { moduleOrder: 7, lessonOrder: 2, questionOrder: 2,
    questionText: 'Hoe lang is ideaal voor een eerste date?',
    options: [
      { label: 'Zo lang mogelijk — meer tijd = meer verbinding', value: 'a' },
      { label: '1 tot 1,5 uur — laat ze meer willen', value: 'b' },
      { label: 'Minimaal 3 uur voor een echte indruk', value: 'c' },
      { label: '30 minuten — kort en krachtig', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Houd het kort: 1 tot 1,5 uur is genoeg voor een eerste date — laat ze meer willen. Een eerste date is een uitnodiging, geen interview.',
  },

  // Les 3
  { moduleOrder: 7, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat is een gevoel van ongemak tijdens een date?',
    options: [
      { label: 'Bewijs dat je te verlegen bent', value: 'a' },
      { label: 'Normaal en te negeren voor de sfeer', value: 'b' },
      { label: 'Bruikbare data — geen paranoia maar intuïtie', value: 'c' },
      { label: 'Teken dat de chemie ontbreekt', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Vertrouw je intuïtie: een gevoel van ongemak is data, geen paranoia. Veiligheid op eerste dates is altijd een prioriteit.',
  },
  { moduleOrder: 7, lessonOrder: 3, questionOrder: 2,
    questionText: 'Waarom is grenzen stellen op een eerste date niet onbeleefd?',
    options: [
      { label: 'Omdat eerste dates nog niet serieus genoeg zijn voor grenzen', value: 'a' },
      { label: 'Omdat het communiceren is wie jij bent — respectvol en zelfbewust', value: 'b' },
      { label: 'Omdat de ander het toch niet persoonlijk opvat', value: 'c' },
      { label: 'Het is wel onbeleefd maar soms noodzakelijk', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Grenzen stellen is niet onbeleefd — het is communiceren wie jij bent. Veiligheid is geen angst, het is zelfzorg.',
  },

  // Les 4
  { moduleOrder: 7, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat is de beste mindset voor een eerste date?',
    options: [
      { label: 'Presteren en een goede indruk maken', value: 'a' },
      { label: 'Informatie verzamelen, niet presteren', value: 'b' },
      { label: 'Zo snel mogelijk duidelijkheid krijgen over de toekomst', value: 'c' },
      { label: 'Onopvallend zijn om de ander niet af te schrikken', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Een eerste date is informatie verzamelen, niet presteren. Curiosity beats charisma: wees nieuwsgieriger naar hen dan naar hoe jij overkomt.',
  },
  { moduleOrder: 7, lessonOrder: 4, questionOrder: 2,
    questionText: 'Na de date: waar moet je op letten bij je evaluatie?',
    options: [
      { label: 'Alleen naar objectieve criteria zoals uiterlijk en status', value: 'a' },
      { label: 'Alleen naar wat je hoofd zegt', value: 'b' },
      { label: 'Naar zowel je gevoel als je rationele analyse', value: 'c' },
      { label: 'Wat je vrienden ervan zouden vinden', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Na de date: luister naar je gevoel, niet alleen naar je hoofd. De beste versie van jezelf op een date is gewoon: jezelf.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 8 — Communicatie Meesterschap
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 8, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat staat NVC voor en in welke volgorde pas je het toe?',
    options: [
      { label: 'Non-Violent Communication: Observatie, Gevoel, Behoefte, Verzoek', value: 'a' },
      { label: 'Natuurlijke Verbinding Communicatie: Gevoel, Wens, Actie', value: 'b' },
      { label: 'Non-Violent Communication: Verzoek, Gevoel, Observatie, Behoefte', value: 'c' },
      { label: 'Neutraal Verbindend Contact: Observatie, Reactie, Verzoek', value: 'd' },
    ],
    correctAnswer: 'a',
    explanation: 'NVC staat voor Non-Violent Communication: Observatie → Gevoel → Behoefte → Verzoek. In die volgorde. De meeste conflicten escaleren omdat mensen behoeften niet uitspreken.',
  },
  { moduleOrder: 8, lessonOrder: 1, questionOrder: 2,
    questionText: 'Waarvoor is NVC het beste geschikt?',
    options: [
      { label: 'Alleen voor het oplossen van heftige ruzies', value: 'a' },
      { label: 'Als dagelijkse manier van communiceren, niet alleen bij conflicten', value: 'b' },
      { label: 'Alleen in langdurige relaties', value: 'c' },
      { label: 'Als techniek om de ander te overtuigen van jouw gelijk', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'NVC is geen techniek voor ruzies — het is een manier van dagelijks communiceren. Wat je zegt bepaalt wat je krijgt.',
  },

  // Les 2
  { moduleOrder: 8, lessonOrder: 2, questionOrder: 1,
    questionText: 'Wat is het verschil tussen een ik-boodschap en een jij-boodschap?',
    options: [
      { label: 'Ik-boodschappen zijn zwakker omdat je jezelf kwetsbaar opstelt', value: 'a' },
      { label: 'Jij-boodschappen zijn directer en daardoor effectiever', value: 'b' },
      { label: 'Ik-boodschappen openen een gesprek; jij-boodschappen maken de ander defensief', value: 'c' },
      { label: 'Er is geen wezenlijk verschil in effect', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: '"Ik voel me verdrietig als..." vs "Jij doet altijd..." — het verschil is enorm. Jij-boodschappen maken de ander defensief, ik-boodschappen openen een gesprek.',
  },
  { moduleOrder: 8, lessonOrder: 2, questionOrder: 2,
    questionText: 'Waarom vereisen ik-boodschappen moed?',
    options: [
      { label: 'Omdat ze moeilijk te formuleren zijn', value: 'a' },
      { label: 'Omdat je jezelf kwetsbaar moet opstellen', value: 'b' },
      { label: 'Omdat de ander er negatief op kan reageren', value: 'c' },
      { label: 'Omdat ze altijd leiden tot een emotioneel gesprek', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Ik-boodschappen vereisen moed: je moet jezelf kwetsbaar opstellen. Maar niemand kan jouw ervaring weerleggen.',
  },

  // Les 3
  { moduleOrder: 8, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat is het verschil tussen actief luisteren en gewoon luisteren?',
    options: [
      { label: 'Actief luisteren is ook antwoorden geven', value: 'a' },
      { label: 'Bij actief luisteren wacht je totdat de ander klaar is', value: 'b' },
      { label: 'Actief luisteren is volledig aanwezig zijn — niet al nadenken over je antwoord', value: 'c' },
      { label: 'Actief luisteren betekent dat je aantekeningen maakt', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Actief luisteren is niet wachten tot je aan de beurt bent — het is volledig aanwezig zijn. De meeste mensen willen niet een oplossing — ze willen gehoord worden.',
  },
  { moduleOrder: 8, lessonOrder: 3, questionOrder: 2,
    questionText: 'Wat is het mooiste geschenk dat je iemand kunt geven in een gesprek?',
    options: [
      { label: 'Een goed advies', value: 'a' },
      { label: 'Jouw volledige aandacht', value: 'b' },
      { label: 'Een eerlijk oordeel', value: 'c' },
      { label: 'Een oplossing voor hun probleem', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Het mooiste geschenk dat je iemand kunt geven is jouw volledige aandacht. Spiegelen en doorvragen laten de ander voelen dat ze gehoord worden — dat is intiem.',
  },

  // Les 4
  { moduleOrder: 8, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat is de consequentie van moeilijke gesprekken uitstellen?',
    options: [
      { label: 'Het probleem lost zichzelf vanzelf op', value: 'a' },
      { label: 'De ander merkt het toch niet', value: 'b' },
      { label: 'Het vergroot het probleem altijd', value: 'c' },
      { label: 'Het bewaart de vrede in de relatie', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Het uitstellen van moeilijke gesprekken vergroot het probleem altijd. Conflict vermijden is niet vrede — het is opgehoopte spanning.',
  },
  { moduleOrder: 8, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat bepaalt de toon van een moeilijk gesprek het meest?',
    options: [
      { label: 'Hoe emotioneel je bent tijdens het gesprek', value: 'a' },
      { label: 'De eerste zin waarmee je het gesprek opent', value: 'b' },
      { label: 'Of de ander in een goede stemming is', value: 'c' },
      { label: 'De locatie waar je het gesprek voert', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'De eerste zin van een moeilijk gesprek bepaalt de toon — bereid die voor. Moeilijke gesprekken zijn ongemakkelijk, maar ze niet voeren is erger.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 9 — De Transitie
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 9, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat is het DTR-gesprek?',
    options: [
      { label: 'Dating The Right person — een zelfevaluatie methode', value: 'a' },
      { label: 'Define The Relationship — het gesprek over exclusiviteit en intentie', value: 'b' },
      { label: 'Discussing The Relationship — een wekelijks check-in gesprek', value: 'c' },
      { label: 'Determine The Roadmap — toekomstplanning in een relatie', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'DTR = Define The Relationship — een essentieel maar vaak vermeden gesprek over exclusiviteit en intentie. Helderheid is vriendelijker dan hoop.',
  },
  { moduleOrder: 9, lessonOrder: 1, questionOrder: 2,
    questionText: 'Wanneer is het goede moment voor het DTR-gesprek?',
    options: [
      { label: 'Na precies 3 maanden daten', value: 'a' },
      { label: 'Zo snel mogelijk na de eerste date', value: 'b' },
      { label: 'Te vroeg is vervelend, te laat leidt tot miscommunicatie — timing vraagt afstemming op de situatie', value: 'c' },
      { label: 'Altijd na de derde date', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Te vroeg is vervelend — te laat kan leiden tot miscommunicatie en pijn. Het gesprek begint met weten wat jij wilt, niet wat je denkt dat de ander wil.',
  },

  // Les 2
  { moduleOrder: 9, lessonOrder: 2, questionOrder: 1,
    questionText: 'Wat is de "bottom line" in het DTR-gesprek?',
    options: [
      { label: 'De minimale datum waarop je het gesprek moet voeren', value: 'a' },
      { label: 'Wat voor jou acceptabel is en wat niet — je grens', value: 'b' },
      { label: 'De samenvatting van wat je de ander wilt vragen', value: 'c' },
      { label: 'Wat je wilt dat de ander over jou denkt', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Ken je bottom line: wat is voor jou acceptabel en wat niet? Het gesprek gaat over jouw behoeften, niet over wat je denkt dat de ander wil horen.',
  },
  { moduleOrder: 9, lessonOrder: 2, questionOrder: 2,
    questionText: 'Waarom is het DTR-gesprek voorbereiden geen manipulatie?',
    options: [
      { label: 'Omdat je de ander toch niet kunt sturen', value: 'a' },
      { label: 'Omdat voorbereiding het respecteren van je eigen behoeften is', value: 'b' },
      { label: 'Omdat de ander het toch niet weet', value: 'c' },
      { label: 'Alleen als je eerlijk bent over je voorbereiding', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Bereid zijn is niet manipuleren. Het is respecteren van je eigen behoeften. Voorbereiding verlaagt angst en verhoogt helderheid.',
  },

  // Les 3
  { moduleOrder: 9, lessonOrder: 3, questionOrder: 1,
    questionText: 'Hoe begin je een DTR-gesprek het beste?',
    options: [
      { label: 'Met een ultimatum zodat de ander weet dat je serieus bent', value: 'a' },
      { label: 'Met je gevoel en intentie, niet met eisen', value: 'b' },
      { label: 'Met vragen stellen zodat de ander de leiding neemt', value: 'c' },
      { label: 'Met een lijst van je verwachtingen', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Begin met je gevoel en intentie, niet met eisen. Luister actief naar de reactie — het is een gesprek, geen monoloog.',
  },
  { moduleOrder: 9, lessonOrder: 3, questionOrder: 2,
    questionText: 'Hoe ga je om met stilte tijdens het DTR-gesprek?',
    options: [
      { label: 'Vul de stilte direct met meer uitleg', value: 'a' },
      { label: 'Interpreteer stilte als een negatief teken', value: 'b' },
      { label: 'Geef de ander ruimte om te reageren — stilte is geen probleem', value: 'c' },
      { label: 'Herhaal je vraag als de ander niet direct antwoordt', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Omgaan met stilte: geef de ander ruimte om te reageren. Spreek je waarheid met vriendelijkheid — niet met angst, niet met agressie.',
  },

  // Les 4
  { moduleOrder: 9, lessonOrder: 4, questionOrder: 1,
    questionText: 'Als de ander niet wil wat jij wilt na het DTR-gesprek — wat betekent dat?',
    options: [
      { label: 'Dat je niet goed genoeg bent voor hem of haar', value: 'a' },
      { label: 'Dat je je aanpak verkeerd hebt ingesteld', value: 'b' },
      { label: 'Geen afwijzing van jou als persoon — maar waardevolle informatie', value: 'c' },
      { label: 'Dat je het gesprek op het verkeerde moment voerde', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Als de ander niet wil wat jij wilt: dat is geen afwijzing van jou als persoon. Elke uitkomst geeft je informatie. De uitkomst bepaalt niet jouw waarde.',
  },
  { moduleOrder: 9, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat is de meest waardevolle houding na het DTR-gesprek, ongeacht de uitkomst?',
    options: [
      { label: 'De ander de schuld geven als het niet goed gaat', value: 'a' },
      { label: 'Goed voor jezelf zorgen en de uitkomst als informatie zien', value: 'b' },
      { label: 'De relatie zo snel mogelijk loslaten', value: 'c' },
      { label: 'De ander proberen te overtuigen van je standpunt', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Na het gesprek: zorg goed voor jezelf, ongeacht de uitkomst. Elke uitkomst is informatie — geen uitkomst is zinloos.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 10 — Onderhoud & Groei
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 10, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat is de fundering van Gottman\'s Sound Relationship House?',
    options: [
      { label: 'Commitment en loyaliteit', value: 'a' },
      { label: 'Vriendschap en het oprecht leuk vinden van elkaar', value: 'b' },
      { label: 'Goede communicatie en conflictoplossing', value: 'c' },
      { label: 'Gedeelde doelen en waarden', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'De basis (friendship en liking) is de fundering van Gottman\'s model — zonder die fundering trilt alles. Conflictmanagement is een vaardigheid, geen talent.',
  },
  { moduleOrder: 10, lessonOrder: 1, questionOrder: 2,
    questionText: 'Hoe veel lagen heeft Gottman\'s Sound Relationship House?',
    options: [
      { label: '3 lagen', value: 'a' },
      { label: '5 lagen', value: 'b' },
      { label: '7 lagen', value: 'c' },
      { label: '9 lagen', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Gottman\'s Sound Relationship House heeft 7 lagen — van vriendschap tot commitment. Een goede relatie is geen gevoel, het is een dagelijkse keuze.',
  },

  // Les 2
  { moduleOrder: 10, lessonOrder: 2, questionOrder: 1,
    questionText: 'Wat zijn "Love Maps" in Gottman\'s theorie?',
    options: [
      { label: 'Kaarten van plekken die voor een koppel betekenisvol zijn', value: 'a' },
      { label: 'Plannen voor romantische dates', value: 'b' },
      { label: 'Hoe goed je je partner kent: dromen, angsten, hoop', value: 'c' },
      { label: 'De communicatiestijlen van een koppel in kaart gebracht', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Love Maps zijn Gottman\'s term voor hoe goed je je partner kent: dromen, angsten, hoop. Partners die elkaars innerlijk leven kennen, overwinnen tegenslagen beter.',
  },
  { moduleOrder: 10, lessonOrder: 2, questionOrder: 2,
    questionText: 'Wat is liefde in de context van kennen?',
    options: [
      { label: 'Iemand kennen en daarna accepteren', value: 'a' },
      { label: 'Iemand kennen en dat nooit meer hoeven te doen', value: 'b' },
      { label: 'Iemand kennen én blijven leren kennen', value: 'c' },
      { label: 'Iemand zo goed kennen dat je hun reacties kunt voorspellen', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Liefde is niet alleen iemand kennen. Het is blijven leren kennen. Nieuwsgierigheid naar de ander is een van de krachtigste relatiebouwers.',
  },

  // Les 3
  { moduleOrder: 10, lessonOrder: 3, questionOrder: 1,
    questionText: 'Hoe gebruik je de liefdestalen van Chapman het beste?',
    options: [
      { label: 'Als wetenschappelijk bewezen model voor relatieproblemen', value: 'a' },
      { label: 'Als aanklacht bij je partner dat hij/zij jouw taal niet spreekt', value: 'b' },
      { label: 'Als reflectie-instrument op jezelf en je partner — niet als vaststaand wetenschappelijk model', value: 'c' },
      { label: 'Alleen bij langdurige relaties, niet bij daten', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Gebruik de vijf liefdestalen als reflectie-instrument, niet als vaststaand wetenschappelijk model (empirisch bewijs is beperkt). Je geeft liefde zoals jij het wilt ontvangen — maar je partner wil het misschien anders.',
  },
  { moduleOrder: 10, lessonOrder: 3, questionOrder: 2,
    questionText: 'Wat is het risico van alleen liefde geven op jouw manier?',
    options: [
      { label: 'Dat je te veel geeft en opgebrand raakt', value: 'a' },
      { label: 'Dat de ander jouw liefde niet ontvangt omdat het niet hun liefdestaal is', value: 'b' },
      { label: 'Dat je partner te afhankelijk van je wordt', value: 'c' },
      { label: 'Er is geen risico — echte liefde wordt altijd gevoeld', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je geeft liefde zoals jij het wilt ontvangen — maar je partner wil het misschien anders. Liefde die niet ontvangen wordt, is liefde die verloren gaat.',
  },

  // Les 4
  { moduleOrder: 10, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat zijn Gottman\'s vier ruiters die een relatie ondermijnen?',
    options: [
      { label: 'Jaloezie, onzekerheid, afstand, stilte', value: 'a' },
      { label: 'Kritiek, defensiviteit, minachting, stonewalling', value: 'b' },
      { label: 'Agressie, passiviteit, oneerlijkheid, afhankelijkheid', value: 'c' },
      { label: 'Overreactie, terugtrekken, beschuldigen, negeren', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Gottman\'s vier ruiters: kritiek, defensiviteit, minachting, stonewalling. Vermijd ze actief — ze zijn de sterkste predictoren van relatiebreuk.',
  },
  { moduleOrder: 10, lessonOrder: 4, questionOrder: 2,
    questionText: 'Welk percentage van relatieproblemen zijn "perpetual problems"?',
    options: [
      { label: '30%', value: 'a' },
      { label: '50%', value: 'b' },
      { label: '69%', value: 'c' },
      { label: '85%', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: '69% van relatieproblemen zijn perpetual problems — ze worden nooit opgelost, maar beheerd. Hoe je ruzie maakt bepaalt meer dan hoeveel je ruzie maakt.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 11 — Integratie & Veerkracht
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 11, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat is het gevaar van "enmeshment" in een relatie?',
    options: [
      { label: 'Te veel autonomie waardoor de relatie verliest aan verbinding', value: 'a' },
      { label: 'Te veel vergroeid zijn, waardoor je jezelf verliest in de relatie', value: 'b' },
      { label: 'Te formeel zijn in de communicatie', value: 'c' },
      { label: 'Te weinig tijd samen doorbrengen', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Enmeshment (te vergroeid) is net zo riskant als distancing (te los). Gezonde relaties bestaan uit twee hele individuen, niet twee halve.',
  },
  { moduleOrder: 11, lessonOrder: 1, questionOrder: 2,
    questionText: 'Wat doet autonomie bewaren in een relatie?',
    options: [
      { label: 'Het bedreigt de relatie door emotionele afstand te creëren', value: 'a' },
      { label: 'Het versterkt de relatie — het bedreigt haar niet', value: 'b' },
      { label: 'Het is alleen goed in het begin van een relatie', value: 'c' },
      { label: 'Het is egocentrisch en onverenigbaar met ware liefde', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Autonomie bewaren versterkt de relatie — het bedreigt haar niet. De sterkste verbinding is tussen twee mensen die ook alleen sterk zijn.',
  },

  // Les 2
  { moduleOrder: 11, lessonOrder: 2, questionOrder: 1,
    questionText: 'Wat zijn grenzen in een relatie?',
    options: [
      { label: 'Muren die intimiteit blokkeren', value: 'a' },
      { label: 'De spelregels van jouw welzijn', value: 'b' },
      { label: 'Tekens dat je de ander niet volledig vertrouwt', value: 'c' },
      { label: 'Alleen nodig bij ongezonde relaties', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Grenzen zijn geen muren — ze zijn de spelregels van jouw welzijn. Een grens is een liefdevolle daad — voor jezelf en voor de ander.',
  },
  { moduleOrder: 11, lessonOrder: 2, questionOrder: 2,
    questionText: 'Wat geeft iemand je als hij of zij jouw grenzen niet respecteert?',
    options: [
      { label: 'Een reden om de relatie te repareren', value: 'a' },
      { label: 'Bruikbare informatie over wie zij zijn', value: 'b' },
      { label: 'Bewijs dat je grenzen te strikt zijn', value: 'c' },
      { label: 'Een uitnodiging om je grenzen opnieuw te formuleren', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Iemand die jouw grenzen niet respecteert, geeft je informatie. Grenzen stellen zonder schuldgevoel is een vaardigheid die je kunt leren.',
  },

  // Les 3
  { moduleOrder: 11, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat vertelt ghosting je over jouw waarde?',
    options: [
      { label: 'Dat je niet goed genoeg was voor die persoon', value: 'a' },
      { label: 'Dat je iets had kunnen doen om het te voorkomen', value: 'b' },
      { label: 'Niets over jouw waarde — het vertelt alles over hun communicatievermogen', value: 'c' },
      { label: 'Dat de chemie niet sterk genoeg was', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Ghosting vertelt je niets over jouw waarde — het vertelt alles over hun communicatievermogen. Afwijzing doet pijn omdat het evolutionair een bedreiging was, maar het is dat niet meer.',
  },
  { moduleOrder: 11, lessonOrder: 3, questionOrder: 2,
    questionText: 'Wat is veerkracht na afwijzing?',
    options: [
      { label: 'Voelen dat het niet pijn doet', value: 'a' },
      { label: 'Snel vergeten en doorgaan', value: 'b' },
      { label: 'Sneller opveren terwijl je de pijn toelaat', value: 'c' },
      { label: 'De pijn omzetten in boosheid voor motivatie', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Veerkracht na afwijzing is niet voelen dat het niet pijn doet — het is sneller opveren. Afwijzing is een doorverwijzing naar iets beters.',
  },

  // Les 4
  { moduleOrder: 11, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat is veerkracht in de context van daten?',
    options: [
      { label: 'Hard worden zodat afwijzing je niet meer raakt', value: 'a' },
      { label: 'Zachter landen en sneller opstaan — niet onkwetsbaar worden', value: 'b' },
      { label: 'Zo weinig mogelijk risico nemen', value: 'c' },
      { label: 'Alleen daten als je er klaar voor bent', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Veerkracht is niet hard worden — het is zachter landen en sneller opstaan. Elke terugslag geeft data over jezelf.',
  },
  { moduleOrder: 11, lessonOrder: 4, questionOrder: 2,
    questionText: 'Waarom is je veerkrachttoolkit persoonlijk?',
    options: [
      { label: 'Omdat iedereen unieke problemen heeft', value: 'a' },
      { label: 'Omdat wat voor jou werkt niet voor anderen hoeft te werken', value: 'b' },
      { label: 'Omdat externe hulp nooit echt werkt bij dating-teleurstellingen', value: 'c' },
      { label: 'Omdat universele strategieën te oppervlakkig zijn', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je veerkracht toolkit is persoonlijk: wat werkt voor jou hoeft niet voor anderen te werken. Gebruik terugslag als data over jezelf.',
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 12 — Onbreekbare Mindset
  // ═══════════════════════════════════════════════════════════

  // Les 1
  { moduleOrder: 12, lessonOrder: 1, questionOrder: 1,
    questionText: 'Wat zijn vaak de diepste veranderingen in persoonlijke groei?',
    options: [
      { label: 'De meest spectaculaire en zichtbare transformaties', value: 'a' },
      { label: 'De veranderingen die je niet direct opmerkt', value: 'b' },
      { label: 'De veranderingen die anderen als eerste zien', value: 'c' },
      { label: 'De veranderingen die je bewust hebt nagestreefd', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'De veranderingen die je niet opmerkte zijn vaak de diepste. Groei is zelden lineair — terugkijken toont je hoe ver je echt bent gekomen.',
  },
  { moduleOrder: 12, lessonOrder: 1, questionOrder: 2,
    questionText: 'Waarom is viering van je groei essentieel?',
    options: [
      { label: 'Om anderen te laten zien hoe ver je bent gekomen', value: 'a' },
      { label: 'Omdat het je helpt herinneren waarom je aan dit programma begon', value: 'b' },
      { label: 'Omdat je iets bijzonders hebt gedaan dat erkenning verdient', value: 'c' },
      { label: 'Om jezelf te motiveren voor de volgende stap', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Viering is essentieel — je hebt iets bijzonders gedaan. Wie je was, bracht je hier. Wie je bent, bepaalt wat er verder komt.',
  },

  // Les 2
  { moduleOrder: 12, lessonOrder: 2, questionOrder: 1,
    questionText: 'Waarom zijn rituelen krachtiger dan motivatie voor gedragsverandering?',
    options: [
      { label: 'Rituelen zijn aangenamer dan motivatie', value: 'a' },
      { label: 'Motivatie vervaagt, rituelen dragen je ook als motivatie ontbreekt', value: 'b' },
      { label: 'Rituelen kosten minder wilskracht', value: 'c' },
      { label: 'Rituelen activeren automatisch de motivatie', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Rituelen zijn niet motivatie — het zijn systemen die je dragen als motivatie er niet is. Je bent niet wat je je voelt. Je bent wat je elke dag doet.',
  },
  { moduleOrder: 12, lessonOrder: 2, questionOrder: 2,
    questionText: 'Hoe lang duurt het gemiddeld om een nieuwe gewoonte op te bouwen?',
    options: [
      { label: '21 dagen', value: 'a' },
      { label: '30 dagen', value: 'b' },
      { label: '66 dagen', value: 'c' },
      { label: '90 dagen', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Gewoontes opbouwen kost gemiddeld 66 dagen. Kleine dagelijkse acties hebben meer impact dan grote sporadische inzetten.',
  },

  // Les 3
  { moduleOrder: 12, lessonOrder: 3, questionOrder: 1,
    questionText: 'Wat is een toekomstvisie voor je liefdesleven?',
    options: [
      { label: 'Een contract dat je aan jezelf houdt', value: 'a' },
      { label: 'Een gedetailleerd plan voor de komende 5 jaar', value: 'b' },
      { label: 'Een kompas dat je richting geeft, geen contract', value: 'c' },
      { label: 'Een deadline voor het vinden van een partner', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Je toekomstvisie mag ambitieus zijn — het is een kompas, geen contract. Het gaat niet om perfectie — het gaat om richting en intentie.',
  },
  { moduleOrder: 12, lessonOrder: 3, questionOrder: 2,
    questionText: 'Waarom je toekomstvisie hardop uitspreken aan iemand die je nauw staat?',
    options: [
      { label: 'Om goedkeuring te vragen voor je plannen', value: 'a' },
      { label: 'Om je visie te toetsen aan de realiteit', value: 'b' },
      { label: 'Om de visie reëel te maken en commitment te versterken', value: 'c' },
      { label: 'Zodat zij je verantwoordelijk kunnen houden', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Een heldere toekomstvisie stuurt onbewust je keuzes. Door hem uit te spreken, maak je hem real. Als je niet weet waar je heen gaat, kom je ergens anders terecht.',
  },

  // Les 4
  { moduleOrder: 12, lessonOrder: 4, questionOrder: 1,
    questionText: 'Wat heb je in de afgelopen 90 dagen primair geïnvesteerd?',
    options: [
      { label: 'In het vinden van een partner', value: 'a' },
      { label: 'In de meest waardevolle relatie — die met jezelf', value: 'b' },
      { label: 'In het aantrekkelijker worden voor anderen', value: 'c' },
      { label: 'In technische datingvaardigheden', value: 'd' },
    ],
    correctAnswer: 'b',
    explanation: 'Je hebt 90 dagen geïnvesteerd in de meest waardevolle relatie — die met jezelf. De transformatie eindigt hier niet — dit is het begin.',
  },
  { moduleOrder: 12, lessonOrder: 4, questionOrder: 2,
    questionText: 'Wat is de diepste betekenis van de afsluitende uitspraak van dit programma?',
    options: [
      { label: 'Je hoeft niet meer te daten — je bent nu perfect', value: 'a' },
      { label: 'Je kunt stoppen met werken aan jezelf', value: 'b' },
      { label: 'Je zoekt niet meer naar de juiste persoon — je bent de juiste persoon geworden', value: 'c' },
      { label: 'Je verdient een partner die even hard heeft gewerkt als jij', value: 'd' },
    ],
    correctAnswer: 'c',
    explanation: 'Je zoekt niet meer naar de juiste persoon. Je bent de juiste persoon geworden. Niet perfect, maar klaar — en dat is genoeg.',
  },
];

async function main() {
  console.log('Transformatie quiz content seed\n');

  const programResult = await sql`SELECT id FROM programs WHERE slug = 'transformatie' LIMIT 1`;
  if (programResult.rows.length === 0) {
    console.error('Transformatie programma niet gevonden');
    process.exit(1);
  }
  const programId = programResult.rows[0].id;
  console.log(`Programma gevonden (ID: ${programId})\n`);

  // Clear existing quiz questions
  await sql`
    DELETE FROM transformatie_lesson_quizzes
    WHERE lesson_id IN (
      SELECT tl.id FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tm.program_id = ${programId}
    )
  `;
  console.log('Bestaande quizvragen verwijderd\n');

  let inserted = 0;
  let failed = 0;

  for (const q of questions) {
    try {
      const lessonResult = await sql`
        SELECT tl.id FROM transformatie_lessons tl
        JOIN transformatie_modules tm ON tl.module_id = tm.id
        WHERE tm.module_order = ${q.moduleOrder}
          AND tl.lesson_order = ${q.lessonOrder}
          AND tm.program_id = ${programId}
        LIMIT 1
      `;

      if (lessonResult.rows.length === 0) {
        console.warn(`  Niet gevonden: Module ${q.moduleOrder} · Les ${q.lessonOrder}`);
        failed++;
        continue;
      }

      const lessonId = lessonResult.rows[0].id;

      await sql`
        INSERT INTO transformatie_lesson_quizzes
          (lesson_id, question_order, question_type, question_text, options, correct_answer, explanation)
        VALUES (
          ${lessonId},
          ${q.questionOrder},
          'multiple_choice',
          ${q.questionText},
          ${JSON.stringify(q.options)}::jsonb,
          ${q.correctAnswer},
          ${q.explanation}
        )
      `;

      inserted++;
    } catch (err) {
      console.error(`  Fout Module ${q.moduleOrder} · Les ${q.lessonOrder} · Q${q.questionOrder}:`, err);
      failed++;
    }
  }

  console.log(`\nKlaar: ${inserted} vragen ingevoegd, ${failed} mislukt`);
  console.log(`Gemiddeld ${(inserted / 48).toFixed(1)} vragen per les over 48 lessen`);
}

main().catch(console.error);
