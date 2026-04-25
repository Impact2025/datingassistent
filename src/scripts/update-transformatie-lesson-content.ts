/**
 * Update Transformatie 3.0 - Lesson-specific reflectie & content
 * Run: npx tsx src/scripts/update-transformatie-lesson-content.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';
const log = (...args: any[]) => console.log(...args);

interface LessonUpdate {
  moduleOrder: number;
  lessonOrder: number;
  reflectie: { spiegel: string; identiteit: string; actie: string };
  content: { takeaways: string[]; objectives: string[]; quote: string };
}

const lessons: LessonUpdate[] = [
  // ═══════════════════════════════════════════════════════════
  // MODULE 1 — Design Your Love Life
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 1, lessonOrder: 1,
    reflectie: {
      spiegel: "Wat heeft je ervan weerhouden om eerder serieus te investeren in je liefdesleven?",
      identiteit: "Beschrijf jouw ideale zelf in een relatie over 90 dagen — wie ben jij dan?",
      actie: "Blokkeer dagelijks 20 minuten 'Transformatie Tijd' in je agenda voor de komende 7 dagen.",
    },
    content: {
      takeaways: [
        "Dating is een vaardigheid — je bent niet 'slecht in liefde', je hebt gewoon de juiste aanpak nog niet gevonden",
        "Het DESIGN→ACTION→SURRENDER framework geeft je een bewust pad in plaats van blind hopen op geluk",
        "90 dagen consistentie verandert patronen die jaren duurden om te vormen",
      ],
      objectives: ["Je begrijpt de drie fasen van het Transformatie programma", "Je weet wat jij wilt bereiken na 90 dagen"],
      quote: "Je kiest niet voor een relatie — je kiest elke dag voor de persoon die jij wilt zijn daarin.",
    },
  },
  {
    moduleOrder: 1, lessonOrder: 2,
    reflectie: {
      spiegel: "Herken jij dating burnout, swiping-moeheid of informatie-overload bij jezelf? Beschrijf dit concreet.",
      identiteit: "Wat zegt jouw vermoeidheid van het daten over wat je écht verlangt — onder de oppervlakte?",
      actie: "Schrijf drie specifieke momenten op waarbij daten je energie kostte in plaats van gaf. Wat hadden ze gemeen?",
    },
    content: {
      takeaways: [
        "Dating burnout is een erkend verschijnsel — het is niet jouw falen maar een systemisch probleem",
        "Choice overload verlaamt onze besluitvorming: meer opties betekenen minder tevredenheid",
        "De oplossing is niet harder proberen maar slimmer — met intentie, niet met hoop",
      ],
      objectives: ["Je herkent de drie vormen van dating burnout", "Je begrijpt waarom de huidige datingcultuur ons uitput"],
      quote: "Uitputting is niet zwakte. Het is bewijs dat je lang genoeg hebt geprobeerd met de verkeerde aanpak.",
    },
  },
  {
    moduleOrder: 1, lessonOrder: 3,
    reflectie: {
      spiegel: "Welke waarden kwamen naar voren in het Waarden Kompas die jou verraste? Waarom?",
      identiteit: "Hoe leven jouw top-3 kernwaarden al in je dagelijkse leven — en waar leven ze nog níet?",
      actie: "Deel je kernwaarden met één vertrouwenspersoon en vraag of zij dit ook zo zien.",
    },
    content: {
      takeaways: [
        "Je kernwaarden zijn je datinglijstje — zonder dat weet je niet wat je zoekt",
        "Mensen die hun waarden kennen maken sneller betere keuzes en trekken betere partners aan",
        "Compromis op kernwaarden leidt altijd tot frictie — compromis op wensen is gezond",
      ],
      objectives: ["Je kent je persoonlijke top-5 kernwaarden", "Je weet hoe je waarden je datingkeuzes beïnvloeden"],
      quote: "Jouw waarden zijn geen wishlist — ze zijn jouw kompas.",
    },
  },
  {
    moduleOrder: 1, lessonOrder: 4,
    reflectie: {
      spiegel: "Wat is het verschil tussen je vage datingwens en de concrete intentie die je net hebt geformuleerd?",
      identiteit: "Als jouw ideale relatie een spiegel is van wie jij bent — wat zegt die spiegel dan over jou?",
      actie: "Schrijf jouw dating intentie op en plak die op een plek die je dagelijks ziet.",
    },
    content: {
      takeaways: [
        "Een intentie is concreet, positief en vanuit kracht — geen verlanglijst maar een kompasrichting",
        "Mensen met een heldere intentie ervaren significant minder dating stress",
        "Je intentie mag veranderen naarmate je groeit — dat is geen falen, dat is leren",
      ],
      objectives: ["Je hebt een persoonlijke dating intentie geformuleerd", "Je begrijpt het verschil tussen een wens en een intentie"],
      quote: "Zonder richting is elke wind de verkeerde.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 2 — Jouw Relatie-DNA
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 2, lessonOrder: 1,
    reflectie: {
      spiegel: "Hoe werd in jouw jeugd omgegaan met jouw behoeften aan nabijheid en zelfstandigheid?",
      identiteit: "Wat zegt jouw reactie op intimiteit over hoe veilig jij je voelt om jezelf te zijn in een relatie?",
      actie: "Schrijf drie vroege herinneringen op over nabijheid of afstand in je opvoeding — wat valt je op?",
    },
    content: {
      takeaways: [
        "Hechtingspatronen worden gevormd vóór ons 2e levensjaar — ze zijn diep, maar veranderbaar",
        "Je hechtingsstijl is geen karaktergebrek — het is een overlevingsstrategie die je niet meer nodig hebt",
        "Bewustwording is de eerste stap: je kunt niet veranderen wat je niet ziet",
      ],
      objectives: ["Je begrijpt de oorsprong van hechtingstheorie (Bowlby & Ainsworth)", "Je weet waarom vroege ervaringen je huidige relaties beïnvloeden"],
      quote: "Je leert over liefde van de mensen van wie je wordt geboren te houden.",
    },
  },
  {
    moduleOrder: 2, lessonOrder: 2,
    reflectie: {
      spiegel: "Welke hechtingsstijl herkende je het meest bij jezelf? Welk concreet datinggedrag past daarbij?",
      identiteit: "Als jouw hechtingsstijl een beschermingsstrategie was — waartegen beschermde die je dan?",
      actie: "Kijk naar je laatste drie relaties of datingervaringen: welk patroon herhaalde zich in jouw reacties?",
    },
    content: {
      takeaways: [
        "Veilig hechtend (50%): comfortabel met nabijheid én autonomie — dit is het doel",
        "Angstig hechtend (20%): hoge emotionele intensiteit bij dreiging van verlies",
        "Vermijdend (25%): emotionele afstand als bescherming — lijkt cool maar is angst",
        "Fearful-avoidant (5%): wil nabijheid maar is er bang voor — het meest complexe patroon",
      ],
      objectives: ["Je herkent alle vier de hechtingsstijlen", "Je ziet hoe hechtingsstijlen interacteren in relaties"],
      quote: "Je hechtingsstijl is de bril waarmee je liefde ziet. Je kunt een nieuwe bril kiezen.",
    },
  },
  {
    moduleOrder: 2, lessonOrder: 3,
    reflectie: {
      spiegel: "Wat verraste je in de resultaten van de Hechtingsstijl Scan? Wat klopte precies?",
      identiteit: "Hoe heeft jouw hechtingsstijl je geholpen én tegengehouden in de liefde?",
      actie: "Vertel een vriend of vriendin welke hechtingsstijl jij herkende bij jezelf — vraag of zij dit patroon ook bij jou zien.",
    },
    content: {
      takeaways: [
        "Er is geen 'slechte' hechtingsstijl — alleen patronen die je dienen of belemmeren",
        "Je hechtingsstijl kan variëren per relatie — je bent niet opgesloten in één stijl",
        "Inzicht + oefening = verandering. Dit is neuroplasticiteit in actie",
      ],
      objectives: ["Je kent je primaire hechtingsstijl", "Je begrijpt hoe dit je datinggedrag beïnvloedt"],
      quote: "Jij bent niet je patroon. Je bent degene die het patroon kan zien.",
    },
  },
  {
    moduleOrder: 2, lessonOrder: 4,
    reflectie: {
      spiegel: "Welk specifiek hechtingsgedrag wil jij als eerste veranderen? Wat maakt precies dit het meest urgent?",
      identiteit: "Welke concrete gewoonte wil jij opbouwen om bewuster en kalmer te reageren als intimiteit spanning oproept?",
      actie: "Kies één hechtings-trigger en schrijf je nieuwe, bewuste reactie erop.",
    },
    content: {
      takeaways: [
        "Hechtingswonden helen niet door te wachten — maar door bewust anders te reageren",
        "De gap tussen je automatische reactie en je bewuste keuze is waar transformatie plaatsvindt",
        "Kleine, consistente veranderingen herschrijven neurale paden — grote sprong niet nodig",
      ],
      objectives: ["Je hebt een concreet hechtingsactieplan", "Je weet hoe je bewust anders kunt reageren op je triggers"],
      quote: "Healing is niet voelen wat je altijd voelde. Het is anders reageren op wat je altijd voelde.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 3 — Magnetische Identiteit
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 3, lessonOrder: 1,
    reflectie: {
      spiegel: "Welk gevoel wil jij dat iemand krijgt in de eerste 0.1 seconde dat ze jouw profiel zien?",
      identiteit: "Wat is het verschil tussen hoe jij jezelf ziet en hoe anderen jou waarschijnlijk zien online?",
      actie: "Vraag drie mensen die je kennen: 'Welk gevoel geef ik mensen als ze me voor het eerst ontmoeten?'",
    },
    content: {
      takeaways: [
        "In 0.1 seconde vormt ons brein een oordeel: warm/koud, competent/incompetent, betrouwbaar/onbetrouwbaar",
        "Authenticiteit is aantrekkelijker dan perfectie — mensen voelen het verschil feilloos",
        "Je profiel is een uitnodiging, geen cv — het doel is een gevoel opwekken, niet indruk maken",
      ],
      objectives: ["Je begrijpt de psychologie achter eerste indrukken", "Je weet welk gevoel jij wilt uitstralen"],
      quote: "Mensen vergeten wat je zei. Ze vergeten niet hoe je ze liet voelen.",
    },
  },
  {
    moduleOrder: 3, lessonOrder: 2,
    reflectie: {
      spiegel: "Kijk naar je huidige foto's: welk verhaal vertellen ze — en is dat het verhaal dat je wilt vertellen?",
      identiteit: "In welke situatie ben jij het meest jezelf? Dat is waar je foto's moeten worden gemaakt.",
      actie: "Plan een 'fotomoment' deze week op een voor jou betekenisvolle plek.",
    },
    content: {
      takeaways: [
        "Hoofdfoto: goed licht, oogcontact, oprechte glimlach — dat is 80% van het werk",
        "Variatie vertelt een verhaal: activiteit, sociaal, close-up, full-body",
        "Honden, vrienden en activiteiten verhogen het match-percentage — groepsfoto als eerste foto nooit",
      ],
      objectives: ["Je weet welke foto-combinatie het beste werkt", "Je hebt een plan voor nieuwe profielfoto's"],
      quote: "De beste foto is niet de mooiste — het is de meest echte.",
    },
  },
  {
    moduleOrder: 3, lessonOrder: 3,
    reflectie: {
      spiegel: "Lees je huidige bio hardop. Klinkt het als een advertentie of als een gesprek tussen vrienden?",
      identiteit: "Wat wil je dat iemand voelt nadat ze je bio hebben gelezen? Schrijf dat gevoel op.",
      actie: "Herschrijf je bio in één zin die nieuwsgierig maakt — zonder clichés als 'avontuurlijk' of 'van reizen houden'.",
    },
    content: {
      takeaways: [
        "Clichés als 'avontuurlijk' en 'zoek iemand om mee te lachen' zeggen niets over jou",
        "Specificiteit is magnetisch: 'Koffie om 7 uur en true crime podcasts' > 'Van muziek houden'",
        "Eén open vraag in je bio verhoogt de kans op een eerste bericht significant",
      ],
      objectives: ["Je weet hoe een effectieve dating bio is opgebouwd", "Je hebt je bio herschreven naar uitnodiging"],
      quote: "Een goede bio roept geen bewondering op — het roept nieuwsgierigheid op.",
    },
  },
  {
    moduleOrder: 3, lessonOrder: 4,
    reflectie: {
      spiegel: "Wat leerde de Vibe Check je over hoe jouw profiel overkomt versus hoe jij dacht dat het overkwam?",
      identiteit: "Welk aspect van je persoonlijkheid is nu het best zichtbaar — en wat wil je nog meer laten zien?",
      actie: "Pas je profiel aan op basis van de Vibe Check feedback en sla de oude versie op ter vergelijking.",
    },
    content: {
      takeaways: [
        "Feedback is data, geen oordeel — gebruik het om je profiel te kalibreren",
        "Het doel van je profiel is de juiste mensen aantrekken, niet iedereen",
        "Een sterk profiel filtert automatisch — het trekt aan én selecteert",
      ],
      objectives: ["Je hebt je profiel getest met de AI Vibe Check", "Je hebt concrete verbeterpunten geïdentificeerd"],
      quote: "Jouw profiel is geen foto van wie je bent. Het is een uitnodiging voor wie bij jou past.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 4 — Bewust Matchen
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 4, lessonOrder: 1,
    reflectie: {
      spiegel: "Beschrijf jouw datinggedrag van de afgelopen 6 maanden in drie woorden — wat zeggen die woorden over jou?",
      identiteit: "Welke datinggewoonten heb jij aangenomen die eigenlijk meer bij anderen passen dan bij jou?",
      actie: "Zet je drie meest gebruikte dating apps naast elkaar: welke geeft je energie en welke kost je energie? Verwijder er vandaag één die netto energie kost.",
    },
    content: {
      takeaways: [
        "Er is geen universele datingstrategie — de enige strategie die werkt is de strategie die bij jou past",
        "Bewust daten begint met kennis van jezelf als dater: je stijl, je ritme, je energie",
        "Apps, coaches en vrienden geven tips vanuit hun perspectief — jij bent de enige die weet wat bij jou past",
      ],
      objectives: ["Je kent jouw unieke datingprofiel en -stijl", "Je hebt bewust gekozen welke datingtools en -gewoonten bij jou passen"],
      quote: "De beste datingstrategie is de strategie die jij vol kunt houden omdat ze bij jou past.",
    },
  },
  {
    moduleOrder: 4, lessonOrder: 2,
    reflectie: {
      spiegel: "Hoe laad jij energie op — door mensen op te zoeken of door alleen te zijn? Hoe beïnvloedt dit jouw dategedrag?",
      identiteit: "Welke datinggewoonten heb jij aangenomen die eigenlijk meer voor anderen zijn dan voor jou?",
      actie: "Bepaal voor komende week: hoeveel datecontacten zijn voor jou 'genoeg' zonder uitgeput te raken?",
    },
    content: {
      takeaways: [
        "Introverten raken niet uitgeput van daten — ze raken uitgeput van te snel te veel daten",
        "Het gangbare datingadvies is grotendeels voor extraverten geschreven — pas het aan op jou",
        "Kwaliteit boven kwantiteit is voor introverten geen compromis — het is de strategie",
      ],
      objectives: ["Je weet hoe jouw energie-type je datinggedrag beïnvloedt", "Je hebt een datingritme dat bij jou past"],
      quote: "Het juiste tempo is niet het snelste tempo — het is het tempo dat je vol kunt houden.",
    },
  },
  {
    moduleOrder: 4, lessonOrder: 3,
    reflectie: {
      spiegel: "Welke dateactiviteiten laten jouw batterij leeg achter — en welke laden hem op?",
      identiteit: "Wat zegt jouw energiehuishouding over het type relatie dat bij jou past qua tempo en intensiteit?",
      actie: "Meet je sociale energie-baseline vandaag met de Energie Batterij tool.",
    },
    content: {
      takeaways: [
        "Sociale energie is eindig en meetbaar — begin elke week met: hoeveel heb ik te geven?",
        "De Energie Batterij helpt je patronen zien die je anders niet opmerkt",
        "Energieverlies is data — het wijst naar wat niet bij je past",
      ],
      objectives: ["Je begrijpt je persoonlijke energiehuishouding bij sociale interacties", "Je kunt je dating kalender plannen op basis van energie"],
      quote: "Je kunt niet geven wat je niet hebt. Begin bij jouw batterij.",
    },
  },
  {
    moduleOrder: 4, lessonOrder: 4,
    reflectie: {
      spiegel: "Hoe heeft jouw swiping gedrag er tot nu toe uitgezien — welk patroon herken je erin?",
      identiteit: "Wat zegt jouw ideale datingtempo over het type relatie en partner dat écht bij jou past?",
      actie: "Schrijf in drie zinnen op wie jij nu bent na 16 lessen DESIGN — en met welke intentie ga jij de ACTION fase in.",
    },
    content: {
      takeaways: [
        "Swipen zonder intentie is de snelste weg naar burnout — tijdslimiet = kwaliteitslimiet",
        "Eén goede conversatie per dag is meer waard dan tien oppervlakkige matches",
        "Jij sluit nu de DESIGN fase af — je weet wie je bent, wat je zoekt en hoe je duurzaam datet. De ACTION fase begint nu.",
      ],
      objectives: ["Je hebt een duurzame datingstrategie voor jezelf bepaald", "Je sluit de DESIGN fase bewust af en bent klaar voor de ACTION fase"],
      quote: "Het geheim van consistentie is een tempo kiezen dat je vol kunt houden.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 5 — Verbinding & Diepgang
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 5, lessonOrder: 1,
    reflectie: {
      spiegel: "Wat zijn jouw 'go-to' openingszinnen? Wat zeggen die over hoe je verbinding zoekt?",
      identiteit: "Welk gedrag laat jij zien als je écht geïnteresseerd bent in iemand — en wanneer doe je dat te weinig?",
      actie: "Test vandaag drie openingszinnen: stuur ze naar drie matches en noteer welke de meeste reactie opleverde.",
    },
    content: {
      takeaways: [
        "Generieke openers = generieke reacties — specificiteit doorbreekt de ruis",
        "Nieuwsgierigheid is aantrekkelijker dan complimenten — vragen over hen i.p.v. oordelen",
        "De eerste zin zet de toon voor het hele gesprek",
      ],
      objectives: ["Je begrijpt waarom generieke openers niet werken", "Je kunt een pakkende, persoonlijke openingszin schrijven"],
      quote: "Het eerste woord opent een deur. Zorg dat het de juiste deur is.",
    },
  },
  {
    moduleOrder: 5, lessonOrder: 2,
    reflectie: {
      spiegel: "Welke openingszin heb jij ooit ontvangen die werkelijk indruk maakte? Wat maakte hem bijzonder?",
      identiteit: "Wat is het verschil tussen een openingszin die vanuit echte nieuwsgierigheid komt en een die vanuit indruk willen maken?",
      actie: "Stuur vandaag één match een openingszin die specifiek inspeelt op iets in hun profiel.",
    },
    content: {
      takeaways: [
        "De beste openingszin is specifiek, persoonlijk en laat ruimte voor een antwoord",
        "Humor werkt — maar alleen als het authentiek is en niet geforceerd",
        "Vraag iets dat zij kunnen beantwoorden vanuit hun eigen ervaring",
      ],
      objectives: ["Je hebt een formule voor het schrijven van effectieve openingszinnen", "Je past de techniek direct toe"],
      quote: "Wees nieuwsgierig. Niet interessant.",
    },
  },
  {
    moduleOrder: 5, lessonOrder: 3,
    reflectie: {
      spiegel: "Op welk moment in een gesprek ga jij persoonlijk — en wat weerhoudt jou van eerder?",
      identiteit: "Wanneer heb jij voor het laatst iemand het gevoel gegeven volledig gehoord te zijn — en hoe deed je dat?",
      actie: "Gebruik vandaag de 'vulnerability ladder' techniek in één gesprek.",
    },
    content: {
      takeaways: [
        "Arthur Aron's onderzoek toont: gedeelde kwetsbaarheid creëert sneller verbinding dan gedeelde ervaringen",
        "Small talk is niet slecht — het is de opmaat, niet het doel",
        "Je hoeft niet alles te delen — selectieve authenticiteit is de sleutel",
      ],
      objectives: ["Je begrijpt de wetenschap achter intimiteit in gesprekken", "Je kunt small talk omzetten naar echte verbinding"],
      quote: "De diepste gesprekken beginnen niet met vragen — maar met eerlijke antwoorden.",
    },
  },
  {
    moduleOrder: 5, lessonOrder: 4,
    reflectie: {
      spiegel: "Welke van de 36 vragen raakten jou het meest? Waarom juist die?",
      identiteit: "Hoe comfortabel ben jij met emotionele kwetsbaarheid in een vroeg stadium van kennismaken?",
      actie: "Kies drie vragen uit de 36 die je wilt gebruiken bij je volgende eerste date.",
    },
    content: {
      takeaways: [
        "Aron's 36 vragen zijn wetenschappelijk ontworpen om intimiteit te versnellen",
        "Het gaat niet om de vragen zelf — maar om de gedeelde kwetsbaarheid die ze uitnodigen",
        "Oefenen is essentieel: de vragen moeten natuurlijk aanvoelen, niet als een interview",
      ],
      objectives: ["Je begrijpt de werking van de 36 vragen methode", "Je kunt de techniek toepassen in echte gesprekken"],
      quote: "Intimiteit is geen gevoel dat je vindt — het is iets dat je samen bouwt.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 6 — De Selectie & Veiligheid
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 6, lessonOrder: 1,
    reflectie: {
      spiegel: "Denk aan een relatie die chemie had maar geen compatibiliteit — wat was de uitkomst?",
      identiteit: "Wat is voor jou de minimale compatibiliteitseis voor een langdurige relatie?",
      actie: "Bespreek met een vriend die jou goed kent welke partner-eigenschappen hij/zij voor jou het meest belangrijk vindt. Vergelijk zijn antwoord met je eigen lijst.",
    },
    content: {
      takeaways: [
        "Chemie is het begin — compatibiliteit is wat het houdt",
        "Vlinders zijn goed, maar ze zijn geen criterium voor succes op lange termijn",
        "De meeste langdurige relaties beginnen niet met overweldigende chemie",
      ],
      objectives: ["Je begrijpt het verschil tussen chemie en compatibiliteit", "Je weet welke criteria voor jou doorslaggevend zijn"],
      quote: "Chemie zegt: 'Dit voelt goed.' Compatibiliteit zegt: 'Dit werkt.' Je hebt beide nodig.",
    },
  },
  {
    moduleOrder: 6, lessonOrder: 2,
    reflectie: {
      spiegel: "Welke rode vlaggen heb jij in het verleden genegeerd — en waarom?",
      identiteit: "Welke overtuiging maakt het moeilijk voor jou om rode vlaggen te benoemen — en hoe realistisch is die overtuiging?",
      actie: "Maak een lijst van jouw persoonlijke top-5 rode vlaggen op basis van je ervaringen.",
    },
    content: {
      takeaways: [
        "Rode vlaggen worden vaak gerationaliseerd weg — 'hij/zij is gewoon zo'",
        "Vroege patroonherkenning is een vaardigheid, geen paranoia",
        "Soms zijn rode vlaggen subtiel: grenzeloosheid, inconsistentie, overclaiming",
      ],
      objectives: ["Je herkent de meest voorkomende rode vlaggen", "Je kunt eerder ingrijpen wanneer je ze ziet"],
      quote: "Als iemand je laat zien wie ze zijn — geloof ze de eerste keer.",
    },
  },
  {
    moduleOrder: 6, lessonOrder: 3,
    reflectie: {
      spiegel: "Welke groene vlaggen had jouw beste relatie of datingervaring? Wat maakte die speciaal?",
      identiteit: "Welke groene vlag laat jij als partner al zien — en op welk vlak wil je daarin sterker worden?",
      actie: "Schrijf je top-5 groene vlaggen op die je actief wilt signaleren bij een nieuwe match.",
    },
    content: {
      takeaways: [
        "Groene vlaggen zijn even belangrijk als rode — weet wat je zoekt, niet alleen wat je vermijdt",
        "Consistentie is de sterkste groene vlag: zeggen wat je doet en doen wat je zegt",
        "Emotionele beschikbaarheid, respect voor grenzen, nieuwsgierigheid naar jou — krachtige signalen",
      ],
      objectives: ["Je weet welke positieve signalen op gezondheid wijzen", "Je zoekt actief naar groene vlaggen, niet alleen rode"],
      quote: "Weet niet alleen wat je niet wilt. Weet precies wat je wél wilt.",
    },
  },
  {
    moduleOrder: 6, lessonOrder: 4,
    reflectie: {
      spiegel: "Wat is het verschil tussen jouw dealbreakers en jouw nice-to-haves? Is dat verschil voor jou helder?",
      identiteit: "Als je over 10 jaar terugkijkt op je datingkeuzes — op welke criteria ben je blij dat je stond?",
      actie: "Schrijf je definitieve lijst: max 3 dealbreakers en max 5 nice-to-haves.",
    },
    content: {
      takeaways: [
        "Dealbreakers zijn niet-onderhandelbaar — max 3-5, anders wordt alles een dealbreaker",
        "Nice-to-haves zijn bonussen, geen vereisten",
        "Selectiecriteria beschermen je energie — ze zijn geen filter om perfectie te zoeken",
      ],
      objectives: ["Je hebt heldere selectiecriteria voor jezelf bepaald", "Je onderscheidt dealbreakers van wensen"],
      quote: "Selectief zijn is geen hoogmoed. Het is zelfrespect.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 7 — De Ontmoeting
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 7, lessonOrder: 1,
    reflectie: {
      spiegel: "Hoe bepaal jij momenteel wanneer je om een date vraagt — en hoe voelt dat voor jou aan?",
      identiteit: "Welke overtuiging over jezelf houdt jou tegen om eerder en directer om een date te vragen?",
      actie: "Vraag vandaag één match om een specifieke date op een specifiek moment.",
    },
    content: {
      takeaways: [
        "Te vroeg vragen kan pusherig voelen — te laat leidt tot een 'chat-pal' dynamiek",
        "De ideale timing: zodra er wederzijdse interesse is en het gesprek energie heeft",
        "Een specifiek voorstel werkt beter dan een open 'zullen we een keer iets doen?'",
      ],
      objectives: ["Je weet wanneer het juiste moment is om een date voor te stellen", "Je kunt op een zelfverzekerde manier vragen om een date"],
      quote: "Timing is een vaardigheid. Oefening maakt de meester.",
    },
  },
  {
    moduleOrder: 7, lessonOrder: 2,
    reflectie: {
      spiegel: "Wat vond jij van de slechtste eerste date die je ooit had — wat ontbrak er precies?",
      identiteit: "Welk type eerste date past perfect bij wie jij bent en wat jij wilt overbrengen?",
      actie: "Kies drie eerste date locaties die bij jou passen en bewaar ze als vaste go-to opties.",
    },
    content: {
      takeaways: [
        "Activiteit-dates werken beter dan restaurant-dates: iets om over te praten en minder druk",
        "Kies een locatie die bij jou past — je bent op je best als je je thuis voelt",
        "Houd het kort: 1-1,5 uur is genoeg voor een eerste date — laat ze meer willen",
      ],
      objectives: ["Je hebt een repertoire aan eerste date ideeën die bij je passen", "Je begrijpt wat een goede eerste date setting inhoudt"],
      quote: "Een eerste date is geen test. Het is een uitnodiging.",
    },
  },
  {
    moduleOrder: 7, lessonOrder: 3,
    reflectie: {
      spiegel: "Hoe makkelijk vind jij het om grenzen te stellen tijdens een date — en wat blokkeert dat soms?",
      identiteit: "Welke concrete signalen vertellen jou tijdens een date dat je je wel of niet veilig voelt?",
      actie: "Maak een persoonlijke veiligheidschecklist voor je volgende eerste date.",
    },
    content: {
      takeaways: [
        "Veiligheid op eerste dates is altijd een prioriteit — laat altijd iemand je locatie weten",
        "Vertrouw je intuïtie: een gevoel van ongemak is data, geen paranoia",
        "Grenzen stellen is niet onbeleefd — het is communiceren wie jij bent",
      ],
      objectives: ["Je hebt een persoonlijk veiligheidsprotocol voor eerste dates", "Je kunt grenzen stellen op een directe en vriendelijke manier"],
      quote: "Veiligheid is geen angst. Het is zelfzorg.",
    },
  },
  {
    moduleOrder: 7, lessonOrder: 4,
    reflectie: {
      spiegel: "Na je laatste date: welk moment voelde het meest als 'jezelf zijn'? En welk moment het minst?",
      identiteit: "Wie ben jij op je allerbeste bij een eerste ontmoeting — wat maakt die versie van jou zichtbaar?",
      actie: "Voer je pre-date ritual vandaag uit — ook al is er geen date gepland. Stel je voor dat je straks op date gaat, doe het ritual volledig en noteer je energieniveau voor en erna.",
    },
    content: {
      takeaways: [
        "Een eerste date is informatie verzamelen, niet presteren",
        "Curiosity beats charisma: wees nieuwsgieriger naar hen dan naar hoe jij overkomt",
        "Na de date: luister naar je gevoel, niet alleen naar je hoofd",
      ],
      objectives: ["Je gaat een eerste date in met de juiste mindset", "Je weet hoe je jezelf kunt zijn onder sociale druk"],
      quote: "De beste versie van jezelf op een date is gewoon: jezelf.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 8 — Communicatie Meesterschap
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 8, lessonOrder: 1,
    reflectie: {
      spiegel: "Hoe communiceer jij momenteel als je een behoefte hebt in een relatie? Beschrijf dit concreet.",
      identiteit: "Wat is de grootste belemmering in hoe jij momenteel communiceert — en wat kost je dat in relaties?",
      actie: "Gebruik het NVC model (O-G-B-V) in één gesprek vandaag en schrijf op wat er anders ging.",
    },
    content: {
      takeaways: [
        "NVC staat voor: Observatie, Gevoel, Behoefte, Verzoek — in die volgorde",
        "De meeste conflicten escaleren omdat mensen behoeften niet uitspreken maar gedrag bekritiseren",
        "NVC is geen techniek voor ruzies — het is een manier van dagelijks communiceren",
      ],
      objectives: ["Je begrijpt de vier componenten van Non-Violent Communication", "Je kunt NVC toepassen in dagelijkse gesprekken"],
      quote: "Wat je zegt bepaalt wat je krijgt. Leer de taal van behoeften.",
    },
  },
  {
    moduleOrder: 8, lessonOrder: 2,
    reflectie: {
      spiegel: "Wanneer gebruik jij 'jij'-statements in plaats van 'ik'-statements? Wat triggert dat bij jou?",
      identiteit: "Op welke momenten valt jij automatisch terug op 'jij'-boodschappen — wat triggert dat patroon bij jou?",
      actie: "Voer vandaag één gesprek en vervang elke 'jij'-zin live door een ik-boodschap. Geen voorbereiding — gewoon toepassen in het moment.",
    },
    content: {
      takeaways: [
        "Jij-boodschappen maken de ander defensief — ik-boodschappen openen een gesprek",
        "'Ik voel me verdrietig als...' vs 'Jij doet altijd...' — het verschil is enorm",
        "Ik-boodschappen vereisen moed: je moet jezelf kwetsbaar opstellen",
      ],
      objectives: ["Je begrijpt het verschil tussen ik- en jij-boodschappen", "Je kunt bewust overschakelen naar ik-communicatie"],
      quote: "Spreek vanuit jezelf. Niemand kan jouw ervaring weerleggen.",
    },
  },
  {
    moduleOrder: 8, lessonOrder: 3,
    reflectie: {
      spiegel: "Hoe goed luister jij echt — of ben je al aan het nadenken over je antwoord terwijl de ander praat?",
      identiteit: "Wat doet jouw brein terwijl de ander praat — ben je écht aanwezig of al aan het formuleren?",
      actie: "Oefen vandaag actief luisteren in één gesprek: geen advies, alleen spiegelen en doorvragen.",
    },
    content: {
      takeaways: [
        "Actief luisteren is niet wachten tot je aan de beurt bent — het is volledig aanwezig zijn",
        "Spiegelen en doorvragen laten de ander voelen dat ze gehoord worden — dat is intiem",
        "De meeste mensen willen niet een oplossing — ze willen gehoord worden",
      ],
      objectives: ["Je begrijpt de techniek van actief luisteren", "Je kunt actief luisteren toepassen in een gesprek"],
      quote: "Het mooiste geschenk dat je iemand kunt geven is jouw volledige aandacht.",
    },
  },
  {
    moduleOrder: 8, lessonOrder: 4,
    reflectie: {
      spiegel: "Welk moeilijk gesprek heb jij al te lang uitgesteld? Wat houdt je precies tegen?",
      identiteit: "Welk conflictpatroon herhaal jij keer op keer — en wat heeft het je al gekost in relaties?",
      actie: "Bereid één moeilijk gesprek voor met het NVC format en plan wanneer je het gaat voeren.",
    },
    content: {
      takeaways: [
        "Het uitstellen van moeilijke gesprekken vergroot het probleem altijd",
        "De eerste zin van een moeilijk gesprek bepaalt de toon — bereid die voor",
        "Conflict vermijden is niet vrede — het is opgehoopte spanning",
      ],
      objectives: ["Je hebt een framework voor het voeren van moeilijke gesprekken", "Je kunt een confronterend gesprek voorbereiden en plannen"],
      quote: "Moeilijke gesprekken zijn ongemakkelijk. Niet voeren is erger.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 9 — De Transitie
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 9, lessonOrder: 1,
    reflectie: {
      spiegel: "Hoe reageer jij normaal als het gesprek over exclusiviteit nadert — ga je ervoor of vermijd je het?",
      identiteit: "Wat zegt jouw neiging om het DTR-gesprek uit te stellen over je verhouding tot kwetsbaarheid en onzekerheid?",
      actie: "Spreek jouw wens voor deze relatie hardop uit — één zin, voor de spiegel. Luister naar je eigen stem en naar hoe het voelt om het te zeggen.",
    },
    content: {
      takeaways: [
        "DTR = Define The Relationship — een essentieel maar vaak vermeden gesprek",
        "Te vroeg is vervelend — te laat kan leiden tot miscommunicatie en pijn",
        "Het gesprek begint met: weten wat jij wilt, niet wat je denkt dat de ander wil",
      ],
      objectives: ["Je begrijpt wanneer en waarom het DTR-gesprek nodig is", "Je weet wat je in het gesprek wilt bereiken"],
      quote: "Helderheid is vriendelijker dan hoop.",
    },
  },
  {
    moduleOrder: 9, lessonOrder: 2,
    reflectie: {
      spiegel: "Wat wil jij bereiken met het DTR-gesprek — en wat ben je bereid op te geven?",
      identiteit: "Hoe kun jij dit gesprek ingaan vanuit vertrouwen in plaats van angst?",
      actie: "Schrijf jouw opening voor het DTR-gesprek — maximaal twee zinnen, vanuit ik-perspectief.",
    },
    content: {
      takeaways: [
        "Voorbereiding verlaagt angst en verhoogt helderheid",
        "Ken je bottom line: wat is voor jou acceptabel en wat niet?",
        "Het gesprek gaat over jouw behoeften, niet over wat je denkt dat de ander wil horen",
      ],
      objectives: ["Je hebt het DTR-gesprek concreet voorbereid", "Je gaat het gesprek in vanuit helderheid, niet angst"],
      quote: "Bereid zijn is niet manipuleren. Het is respecteren van je eigen behoeften.",
    },
  },
  {
    moduleOrder: 9, lessonOrder: 3,
    reflectie: {
      spiegel: "Na het oefenen: welk deel van het gesprek voelt het moeilijkst voor jou — en waarom?",
      identiteit: "Wie ben jij als je dit gesprek voert vanuit je sterkste, meest authentieke zelf?",
      actie: "Plan het gesprek — bepaal wanneer en waar je het gaat voeren.",
    },
    content: {
      takeaways: [
        "Begin met je gevoel en intentie, niet met eisen",
        "Luister actief naar de reactie — het is een gesprek, geen monoloog",
        "Omgaan met stilte: geef de ander ruimte om te reageren",
      ],
      objectives: ["Je kunt het DTR-gesprek voeren op een kalme, directe manier", "Je reageert constructief op alle mogelijke antwoorden"],
      quote: "Spreek je waarheid met vriendelijkheid. Niet met angst, niet met agressie.",
    },
  },
  {
    moduleOrder: 9, lessonOrder: 4,
    reflectie: {
      spiegel: "Wat is het slechtste dat kan gebeuren na het DTR-gesprek — en kun jij daarmee leven?",
      identiteit: "Hoe verandert jouw gevoel van eigenwaarde afhankelijk van de uitkomst? Wat zegt dat?",
      actie: "App of bel een vertrouwde vriend en vertel hoe het DTR-gesprek is gegaan — of hoe je je voorbereidt als het nog moet komen.",
    },
    content: {
      takeaways: [
        "Elke uitkomst geeft je informatie — geen uitkomst is zinloos",
        "Als de ander niet wil wat jij wilt: dat is geen afwijzing van jou als persoon",
        "Na het gesprek: zorg goed voor jezelf, ongeacht de uitkomst",
      ],
      objectives: ["Je bent voorbereid op alle mogelijke uitkomsten", "Je weet hoe je voor jezelf zorgt na het gesprek"],
      quote: "De uitkomst bepaalt niet jouw waarde. Jij bepaalt jouw waarde.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 10 — Onderhoud & Groei
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 10, lessonOrder: 1,
    reflectie: {
      spiegel: "In welke laag van het Sound Relationship House had jouw vorige relatie de meeste zwakheden?",
      identiteit: "Welke kwaliteit wil jij als partner laten zien die je nu nog niet consistent in jezelf herkent?",
      actie: "Beoordeel jezelf op de 7 lagen van het Sound Relationship House op een schaal van 1-10.",
    },
    content: {
      takeaways: [
        "Gottman's Sound Relationship House heeft 7 lagen — van vriendschap tot commitment",
        "De basis (friendship en liking) is de fundering — zonder die fundament trilt alles",
        "Conflictmanagement is een vaardigheid, geen talent — je kunt het leren",
      ],
      objectives: ["Je kent het Gottman Sound Relationship House model", "Je weet op welke lagen je zelf aandacht nodig hebt"],
      quote: "Een goede relatie is geen gevoel. Het is een dagelijkse keuze.",
    },
  },
  {
    moduleOrder: 10, lessonOrder: 2,
    reflectie: {
      spiegel: "Hoe goed kende jij je vorige partner echt — niet de oppervlakte, maar hun innerlijk leven?",
      identiteit: "Hoe wil jij zelf gekend worden door een partner — wat is belangrijk dat zij weten?",
      actie: "Stel jezelf voor aan je toekomstige partner: schrijf 10 dingen die hij/zij over jou zou moeten weten.",
    },
    content: {
      takeaways: [
        "Love Maps zijn Gottman's term voor hoe goed je je partner kent: dromen, angsten, hoop",
        "Partners die elkaars innerlijk leven kennen, overwinnen tegenslagen beter",
        "Nieuwsgierigheid naar de ander is een van de krachtigste relatiebouwers",
      ],
      objectives: ["Je begrijpt het concept van Love Maps", "Je weet wat het inhoudt om iemand diep te leren kennen"],
      quote: "Liefde is niet alleen iemand kennen. Het is blijven leren kennen.",
    },
  },
  {
    moduleOrder: 10, lessonOrder: 3,
    reflectie: {
      spiegel: "Welke liefdestaal herken jij bij jezelf als primair? En welke mis jij het meest als ze afwezig is?",
      identiteit: "Wanneer heb jij liefde gegeven op jouw manier terwijl de ander iets heel anders nodig had — wat was de uitkomst?",
      actie: "Doe de liefdestalen quiz en deel het resultaat met iemand die jou goed kent.",
    },
    content: {
      takeaways: [
        "De Vijf Liefdestalen (Chapman): kwaliteitstijd, woorden van bevestiging, cadeaus, daden van dienst, fysiek contact — gebruik dit als reflectie-instrument, niet als vaststaand model (wetenschappelijk bewijs is beperkt)",
        "Je geeft liefde zoals jij het wilt ontvangen — maar je partner wil het misschien anders",
        "Liefdestalen leren is het leren spreken van iemands emotionele taal",
      ],
      objectives: ["Je kent de vijf liefdestalen", "Je weet welke liefdestaal jij primair spreekt en ontvangt"],
      quote: "Liefde die niet ontvangen wordt, is liefde die verloren gaat.",
    },
  },
  {
    moduleOrder: 10, lessonOrder: 4,
    reflectie: {
      spiegel: "Hoe reageer jij in conflict — vlucht je, bevries je of ga jij in de aanval?",
      identiteit: "Welk van Gottman's vier ruiters herken jij het meest bij jezelf — en in welke situaties verschijnt het?",
      actie: "Oefen hardop jouw nieuwe reactie op een typisch conflictmoment — spreek hem uit alsof de ander erbij is. Herhaal tot het natuurlijk aanvoelt.",
    },
    content: {
      takeaways: [
        "Gottman's vier ruiters: kritiek, defensiviteit, minachting, stonewalling — vermijd ze",
        "69% van relatieproblemen zijn perpetual problems — ze worden nooit opgelost, maar beheerd",
        "Hoe je ruzie maakt bepaalt meer over je relatie dan hoeveel je ruzie maakt",
      ],
      objectives: ["Je herkent de vier destructieve gesprekspatronen", "Je weet hoe je conflict constructief kunt aanpakken"],
      quote: "Conflicten zijn geen bewijs dat je relatie kapot is. Ze zijn bewijs dat je beiden iets geeft.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 11 — Integratie & Veerkracht
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 11, lessonOrder: 1,
    reflectie: {
      spiegel: "Hoe balanceer jij autonomie en verbondenheid in een relatie — wat gaat goed, wat niet?",
      identiteit: "Wat is jouw ideale balans tussen 'samen zijn' en 'jezelf blijven'?",
      actie: "Blokkeer aankomende week bewust één moment van solo-tijd in je agenda — iets dat jou oplaadt en dat je volledig alleen doet.",
    },
    content: {
      takeaways: [
        "Enmeshment (te vergroeid) en distancing (te los) zijn beide risico's in een relatie",
        "Gezonde relaties bestaan uit twee hele individuen, niet twee halve",
        "Autonomie bewaren versterkt de relatie — het bedreigt haar niet",
      ],
      objectives: ["Je begrijpt de balans tussen verbondenheid en autonomie", "Je weet wat jij nodig hebt om jezelf te blijven in een relatie"],
      quote: "De sterkste verbinding is tussen twee mensen die ook alleen sterk zijn.",
    },
  },
  {
    moduleOrder: 11, lessonOrder: 2,
    reflectie: {
      spiegel: "Welke grens heb jij het moeilijkst te stellen in een intieme relatie — en waarom?",
      identiteit: "Wat heeft het je gekost toen jij een grens die je had moeten stellen, níet hebt gesteld?",
      actie: "Oefen het uitspreken van één grens hardop — zeg hem drie keer alsof je hem aan je toekomstige partner vertelt. Voel hoe het klinkt en aanvoelt.",
    },
    content: {
      takeaways: [
        "Grenzen zijn geen muren — ze zijn de spelregels van jouw welzijn",
        "Grenzen stellen zonder schuldgevoel is een vaardigheid die je kunt leren",
        "Iemand die jouw grenzen niet respecteert, geeft je informatie",
      ],
      objectives: ["Je begrijpt wat gezonde grenzen zijn en hoe je ze stelt", "Je kunt grenzen communiceren zonder je schuldig te voelen"],
      quote: "Een grens is een liefdevolle daad — voor jezelf en voor de ander.",
    },
  },
  {
    moduleOrder: 11, lessonOrder: 3,
    reflectie: {
      spiegel: "Wat is jouw standaard reactie op ghosting of afwijzing — en helpt die reactie jou vooruit?",
      identiteit: "Wat is het verhaal dat jij jezelf vertelt direct nadat je wordt afgewezen — en klopt dat verhaal echt?",
      actie: "Schrijf een brief aan jouw toekomstige zelf voor het geval je wordt ghosted.",
    },
    content: {
      takeaways: [
        "Ghosting vertelt je niets over jouw waarde — het vertelt alles over hun communicatievermogen",
        "Afwijzing doet pijn omdat het evolutionair een bedreiging was — maar het is dat niet meer",
        "Veerkracht na afwijzing is niet voelen dat het niet pijn doet — het is sneller opveren",
      ],
      objectives: ["Je begrijpt de psychologie achter ghosting en afwijzing", "Je hebt een strategie om ermee om te gaan"],
      quote: "Afwijzing is een doorverwijzing naar iets beters.",
    },
  },
  {
    moduleOrder: 11, lessonOrder: 4,
    reflectie: {
      spiegel: "Wat helpt jou het meest om terug te veren na een dating teleurstelling?",
      identiteit: "Hoe wil jij zijn na vijf dating teleurstellingen — sterker of gebroken?",
      actie: "Vraag drie mensen die jou kennen: wat is jouw superkracht als het even tegenzit? Vergelijk hun antwoorden met hoe jij over jezelf denkt in moeilijke momenten.",
    },
    content: {
      takeaways: [
        "Veerkracht is niet hard worden — het is zachter landen en sneller opstaan",
        "Je veerkracht toolkit is persoonlijk: wat werkt voor jou hoeft niet voor anderen te werken",
        "Elke terugslag geeft data over jezelf — gebruik die data",
      ],
      objectives: ["Je hebt een persoonlijke veerkrachtstrategie", "Je weet hoe je voor jezelf zorgt na een teleurstelling"],
      quote: "Val zeven keer. Sta acht keer op.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MODULE 12 — Onbreekbare Mindset
  // ═══════════════════════════════════════════════════════════
  {
    moduleOrder: 12, lessonOrder: 1,
    reflectie: {
      spiegel: "Vergelijk jezelf nu met wie je was aan het begin van dit programma — wat is er concreet veranderd?",
      identiteit: "Wie ben jij geworden de afgelopen 90 dagen — in de liefde en als persoon?",
      actie: "Schrijf een brief aan jezelf van dag 1 — wat zou je hem/haar willen zeggen?",
    },
    content: {
      takeaways: [
        "Groei is zelden lineair — terugkijken toont je hoe ver je echt bent gekomen",
        "De veranderingen die je niet opmerkte zijn vaak de diepste",
        "Viering is essentieel — je hebt iets bijzonders gedaan",
      ],
      objectives: ["Je reflecteert op je volledige transformatie", "Je erkent je groei en verwezenlijkingen"],
      quote: "Wie je was, bracht je hier. Wie je bent, bepaalt wat er verder komt.",
    },
  },
  {
    moduleOrder: 12, lessonOrder: 2,
    reflectie: {
      spiegel: "Welke gewoonten uit dit programma wil jij definitief inbouwen in je dagelijkse leven?",
      identiteit: "Welk ritueel of inzicht uit dit programma wil jij nooit meer loslaten — en waarom?",
      actie: "Kies drie rituelen die je wilt vasthouden en plan ze als vaste gewoontes in je agenda.",
    },
    content: {
      takeaways: [
        "Rituelen zijn niet motivatie — het zijn systemen die je dragen als motivatie er niet is",
        "Kleine dagelijkse acties hebben meer impact dan grote sporadische inzetten",
        "Gewoontes opbouwen kost gemiddeld 66 dagen — je bent al verder dan je denkt",
      ],
      objectives: ["Je hebt drie concrete rituelen voor voortdurende groei gekozen", "Je begrijpt hoe rituelen je beschermen tegen terugval"],
      quote: "Je bent niet wat je je voelt. Je bent wat je elke dag doet.",
    },
  },
  {
    moduleOrder: 12, lessonOrder: 3,
    reflectie: {
      spiegel: "Waar ben jij over één jaar in je liefdesleven als je dit tempo doorzet?",
      identiteit: "Welke versie van jezelf in de liefde is al aanwezig en moet je meer ruimte geven?",
      actie: "Vertel iemand die jou nauw staat over jouw toekomstvisie voor je liefdesleven — spreek hem hardop uit en maak hem real.",
    },
    content: {
      takeaways: [
        "Een heldere toekomstvisie stuurt onbewust je keuzes in de goede richting",
        "Het gaat niet om perfectie — het gaat om richting en intentie",
        "Je toekomstvisie mag ambitieus zijn — het is een kompas, geen contract",
      ],
      objectives: ["Je hebt een concrete toekomstvisie voor je liefdesleven", "Je weet in welke richting je beweegt"],
      quote: "Als je niet weet waar je heen gaat, kom je ergens anders terecht.",
    },
  },
  {
    moduleOrder: 12, lessonOrder: 4,
    reflectie: {
      spiegel: "Wat is de meest waardevolle les die jij in de afgelopen 90 dagen hebt geleerd?",
      identiteit: "Wie jij nu bent — is dat de persoon die jij altijd al wilde zijn in de liefde?",
      actie: "Deel één inzicht uit dit programma met iemand die het nodig heeft.",
    },
    content: {
      takeaways: [
        "Je hebt 90 dagen geïnvesteerd in de meest waardevolle relatie — die met jezelf",
        "De transformatie eindigt hier niet — dit is het begin",
        "Jij bent klaar. Niet perfect, maar klaar.",
      ],
      objectives: ["Je sluit het programma af met dankbaarheid en intentie", "Je draagt je groei vooruit"],
      quote: "Je zoekt niet meer naar de juiste persoon. Je bent de juiste persoon geworden.",
    },
  },
];

async function main() {
  log('🚀 Transformatie 3.0 — Lesson content update\n');

  const programResult = await sql`
    SELECT id FROM programs WHERE slug = 'transformatie' LIMIT 1
  `;

  if (programResult.rows.length === 0) {
    console.error('❌ Transformatie programma niet gevonden in database');
    process.exit(1);
  }

  const programId = programResult.rows[0].id;
  log(`✓ Programma gevonden (ID: ${programId})\n`);

  let updated = 0;
  let failed = 0;

  for (const lesson of lessons) {
    try {
      const result = await sql`
        UPDATE transformatie_lessons tl
        SET
          reflectie = ${JSON.stringify(lesson.reflectie)}::jsonb,
          content   = ${JSON.stringify(lesson.content)}::jsonb,
          updated_at = NOW()
        FROM transformatie_modules tm
        WHERE tl.module_id = tm.id
          AND tm.module_order = ${lesson.moduleOrder}
          AND tl.lesson_order = ${lesson.lessonOrder}
          AND tm.program_id   = ${programId}
      `;

      if (result.rowCount && result.rowCount > 0) {
        log(`  ✓ Module ${lesson.moduleOrder} · Les ${lesson.lessonOrder}`);
        updated++;
      } else {
        console.warn(`  ⚠️ Niet gevonden: Module ${lesson.moduleOrder} · Les ${lesson.lessonOrder}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ Fout bij Module ${lesson.moduleOrder} · Les ${lesson.lessonOrder}:`, err);
      failed++;
    }
  }

  log(`\n✅ Klaar: ${updated} lessen bijgewerkt, ${failed} mislukt`);
}

main().catch(console.error);
