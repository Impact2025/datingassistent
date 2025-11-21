// ============================================
// CLICHÉ DATABASE - Interactive Transformation Data
// ============================================

export interface ClicheExercise {
  id: string;
  clicheText: string;
  category: 'travel' | 'food' | 'personality' | 'hobby' | 'lifestyle' | 'values';
  usagePercentage: number;

  // Transformation steps
  meaningOptions: string[];
  detailPrompts: string[];

  // Examples
  badExamples: string[];
  goodExamples: string[];
  exceptionalExamples: string[];

  // Scoring criteria
  mustInclude: string[];
  bonusPoints: string[];
}

export const CLICHE_EXERCISES: ClicheExercise[] = [
  {
    id: 'travel',
    clicheText: 'Ik hou van reizen',
    category: 'travel',
    usagePercentage: 67,
    meaningOptions: [
      'Ik ga graag naar nieuwe plekken',
      'Ik verzamel ervaringen uit verschillende culturen',
      'Ik voel me het meest mezelf als ik ergens ben waar ik de taal niet spreek',
      'Ik ontsnap graag aan mijn routine'
    ],
    detailPrompts: [
      'Laatste reis waar je heen ging',
      'Beste ervaring die je had',
      'Vreemdste moment tijdens een reis',
      'Plek waar je nog heen wilt'
    ],
    badExamples: [
      'Ik hou van reizen en nieuwe culturen ontdekken',
      'Reizen is mijn passie',
      'Ik ben een echte travel lover'
    ],
    goodExamples: [
      'Laatst verdwaald in Marrakech - best mistake ever',
      'Ik verzamel vintage kaarten van plekken waar ik nog nooit ben geweest',
      'Vorige maand solo naar IJsland - noorderlicht jagen werd mijn nieuwe obsessie'
    ],
    exceptionalExamples: [
      'Mijn Nederlands-Engels woordenboek heeft me door 12 landen geholpen. Het Japans deel staat nog steeds op pagina 1.',
      'Laatst verdwaald in een Shinto-tempel in Tokio - geen wifi, geen plan. Eindigde met thee bij een monnik die me de weg wees. Beste middag ooit.'
    ],
    mustInclude: ['specific location', 'personal experience'],
    bonusPoints: ['emotion', 'unexpected detail', 'sensory detail']
  },

  {
    id: 'foodie',
    clicheText: 'Ik hou van lekker eten',
    category: 'food',
    usagePercentage: 73,
    meaningOptions: [
      'Ik experimenteer graag in de keuken',
      'Ik kan uren praten over eten en restaurants',
      'Ik reis voor specifieke gerechten',
      'Eten is mijn love language'
    ],
    detailPrompts: [
      'Laatste gerecht dat je maakte',
      'Favoriete restaurant en waarom',
      'Meest avontuurlijke ding dat je at',
      'Gerecht waar je obsessed mee bent'
    ],
    badExamples: [
      'Ik ben een echte foodie',
      'Ik hou van lekker eten en nieuwe restaurants',
      'Food lover'
    ],
    goodExamples: [
      'Ik ben die vriend die altijd het restaurant kiest en daar een essay over schrijft',
      'Mijn stamppot is legendarisch (vraag het mijn neefjes)',
      'Elke zondag probeer ik een recept uit een ander land - vorige week ging Vietnamese pho mis, deze week: redemption'
    ],
    exceptionalExamples: [
      'Ik probeer elk weekend een nieuw gerecht uit een ander land. Deze week: Vietnamese pho. Spoiler: mijn keuken rook 3 dagen naar sterrenijs.',
      'Mijn vrienden kennen me als "de ramen detective" - ik heb 23 ramen restaurants in Nederland bezocht en gerangschikt op bouillon, noodle bite en toppings. Ja, ik heb een spreadsheet.'
    ],
    mustInclude: ['specific cuisine or dish', 'personal action'],
    bonusPoints: ['frequency', 'outcome', 'social element']
  },

  {
    id: 'spontaneous',
    clicheText: 'Ik ben spontaan',
    category: 'personality',
    usagePercentage: 54,
    meaningOptions: [
      'Ik maak vaak last-minute plannen',
      'Ik zeg ja tegen dingen buiten mijn comfort zone',
      'Ik plan niet alles van tevoren',
      'Ik ga vaak met mijn gevoel mee'
    ],
    detailPrompts: [
      'Laatste spontane actie',
      'Meest spontane trip',
      'Iets wat je op de gok deed',
      'Beslissing binnen 5 minuten genomen'
    ],
    badExamples: [
      'Ik ben spontaan',
      'Spontane avonturen zijn mijn ding',
      'I love spontaneity'
    ],
    goodExamples: [
      'Vorige week donderdag besloten om vrijdag naar Berlijn te gaan - geen hotel, geen plan',
      'Ik plan mijn spontane momenten (oxymoron? misschien)',
      'Laatst op dinsdag wakker geworden met het idee "vandaag ga ik zeilen leren" - zaterdagmiddag lag ik in het water bij Loosdrecht'
    ],
    exceptionalExamples: [
      'Mijn vrienden noemen me "georganiseerd spontaan" - ik boek last-minute trips maar heb wel een backup batterij, offline maps en drie snack opties.',
      'Laatst om 23:00 besloten om de zonsopgang te zien - eindbestemming: willekeurige parkeerplaats bij Texel. Was het waard? Absoluut niet, maar het verhaal wel.'
    ],
    mustInclude: ['specific example', 'timeframe'],
    bonusPoints: ['contradiction', 'outcome', 'self-awareness']
  },

  {
    id: 'fitness',
    clicheText: 'Ik sport graag',
    category: 'hobby',
    usagePercentage: 61,
    meaningOptions: [
      'Sporten geeft me energie',
      'Ik heb specifieke fitness doelen',
      'Sport is mijn manier om te ontstressen',
      'Ik ben competitief in mijn sport'
    ],
    detailPrompts: [
      'Welke sport specifiek',
      'Hoe vaak per week',
      'Beste prestatie',
      'Waarom deze sport'
    ],
    badExamples: [
      'Ik sport graag',
      'Fitness is belangrijk voor me',
      'Sportief type'
    ],
    goodExamples: [
      'Ik race tegen mijn eigen tijd bij het hardlopen - current PR: 10K in 48 minuten',
      'Drie keer per week kickboksen - soms tegen een zak, soms tegen mijn frustraties',
      'Yoga op dinsdag, boulderen op vrijdag, uitslapen op zondag (priorities)'
    ],
    exceptionalExamples: [
      'Elke ochtend om 6:00 zwemmen in de Bosbaan. In de winter met een wetsuit, in de zomer niet. Vrienden denken dat ik gek ben - ze hebben gelijk.',
      'Ik doe aan CrossFit maar vertel er nooit over... oh wait. (Het stereotype klopt: ik kan er niet over zwijgen.)'
    ],
    mustInclude: ['specific sport', 'frequency'],
    bonusPoints: ['achievement', 'personality reveal', 'humor']
  },

  {
    id: 'netflix',
    clicheText: 'Ik kijk graag series',
    category: 'hobby',
    usagePercentage: 44,
    meaningOptions: [
      'Series zijn mijn manier om te ontspannen',
      'Ik ben een binge-watcher',
      'Ik hou van specifieke genres',
      'Series kijken is mijn guilty pleasure'
    ],
    detailPrompts: [
      'Favoriete serie en waarom',
      'Genre waar je naar toe trekt',
      'Laatste serie die je bingede',
      'Serie die je leven veranderde'
    ],
    badExamples: [
      'Netflix and chill',
      'Ik kijk graag series',
      'Serie liefhebber'
    ],
    goodExamples: [
      'Ik heb Breaking Bad 3x gekeken - elke keer zie ik nieuwe details',
      'Koreaanse dramas zijn mijn nieuwe verslaving - tissues altijd binnen handbereik',
      'Ik maak lijstjes van series per mood: "na werk", "zondagmiddag", "kan niet slapen"'
    ],
    exceptionalExamples: [
      'Mijn Letterboxd heeft 847 series gelogd met persoonlijke reviews. Ja, ik ben die persoon. Ja, ik heb een rating systeem voor intro muziek.',
      'True crime documentaires zijn mijn guilty pleasure. Mijn moeder vindt het concerning. Ik vind het educational.'
    ],
    mustInclude: ['specific title or genre', 'personal habit'],
    bonusPoints: ['count/frequency', 'emotional connection', 'self-awareness']
  },

  {
    id: 'music',
    clicheText: 'Ik hou van muziek',
    category: 'hobby',
    usagePercentage: 39,
    meaningOptions: [
      'Muziek is altijd aan bij mij',
      'Ik ga graag naar concerten',
      'Ik speel zelf een instrument',
      'Muziek bepaalt mijn mood'
    ],
    detailPrompts: [
      'Laatste concert dat je bezocht',
      'Artiest die je niet mist',
      'Instrument dat je speelt',
      'Genre waar je van houdt'
    ],
    badExamples: [
      'Ik hou van muziek',
      'Music lover',
      'Concerten zijn mijn ding'
    ],
    goodExamples: [
      'Afgelopen jaar naar 12 concerten - van Stromae tot een obscure noise band in een kelder',
      'Ik leer mezelf piano via YouTube - het klinkt nog... experimenteel',
      'Mijn Spotify Wrapped is elk jaar een existentiële crisis (waarom luisterde ik 847 keer naar dat ene nummer?)'
    ],
    exceptionalExamples: [
      '2 jaar geleden begon ik mezelf piano te leren op de piano van mijn oma. Momenteel worstel ik met Comptine d\'un autre été. Klinkt nog niet zoals Yann Tiersen, maar ik geef niet op.',
      'Ik verzamel vinyl van artiesten die ik live heb gezien. 47 platen, 47 verhalen, 1 bankrekening die huilt.'
    ],
    mustInclude: ['specific artist/genre', 'action taken'],
    bonusPoints: ['count', 'dedication', 'personality detail']
  },

  {
    id: 'family',
    clicheText: 'Ik ben family-minded',
    category: 'values',
    usagePercentage: 38,
    meaningOptions: [
      'Familie is belangrijk voor mij',
      'Ik zie mijn familie vaak',
      'Familietijd is heilig',
      'Familie geeft me energie'
    ],
    detailPrompts: [
      'Familietraditie die je koestert',
      'Hoe vaak zie je familie',
      'Favoriete familieritueel',
      'Speciale band met familielid'
    ],
    badExamples: [
      'Familie is belangrijk',
      'Family-minded',
      'Family first'
    ],
    goodExamples: [
      'Elke zondagochtend bel ik mijn oma voor haar weekupdate (en haar oordeel over mijn keuzes)',
      'Jaarlijkse familie-escape room competitie - we nemen het veel te serieus',
      'Mijn neefjes denken dat ik de coolste oom ben (ik beloof ze niets en geef ze suiker voor bedtijd)'
    ],
    exceptionalExamples: [
      'Elk jaar organiseer ik een familie-weekendje weg. Dit jaar: 17 mensen, 1 huis, veel discussies over Monopoly. Chaos? Ja. Worth it? Absolutely.',
      'Zondagmiddag patat halen met mijn pa is heilig - 23 jaar lang dezelfde snackbar, dezelfde bestelling, steeds betere gesprekken.'
    ],
    mustInclude: ['specific ritual or action', 'frequency'],
    bonusPoints: ['emotional detail', 'humor', 'tradition']
  },

  {
    id: 'adventure',
    clicheText: 'Ik ben avontuurlijk',
    category: 'personality',
    usagePercentage: 48,
    meaningOptions: [
      'Ik probeer graag nieuwe dingen',
      'Ik ga buiten mijn comfort zone',
      'Ik zoek spannende ervaringen',
      'Routine is niet aan mij besteed'
    ],
    detailPrompts: [
      'Laatste avontuur',
      'Engste ding dat je deed',
      'Next adventure op je lijst',
      'Avontuur dat fout ging'
    ],
    badExamples: [
      'Ik ben avontuurlijk',
      'Adventure seeker',
      'Ik hou van avontuur'
    ],
    goodExamples: [
      'Vorig jaar wild kamperen in Schotland terwijl het regende - tent lekte, schoenen nat, glimlach permanent',
      'Ik heb een lijst met "dingen die me bang maken" - tot nu toe: 3 afgev inkt, 7 te gaan',
      'Bungeejumpen deed niks voor me, maar een improv comedy workshop gaf me nightmares (en ik ging toch)'
    ],
    exceptionalExamples: [
      'Mijn "ja-jaar" experiment: zeg ja tegen alles beangstigends. Tot nu toe: schaatsen leren op 32-jarige leeftijd, standup comedy open mic, en een tattoo (kleine, niet impulsief).',
      'Laatste avontuur: kanoën in Zweden. Wat fout ging: alles. Wat ik leerde: veel. Zou ik het weer doen? Geef me een maand om te herstellen.'
    ],
    mustInclude: ['specific adventure', 'outcome'],
    bonusPoints: ['vulnerability', 'growth moment', 'realistic']
  },

  {
    id: 'positive',
    clicheText: 'Ik ben positief ingesteld',
    category: 'personality',
    usagePercentage: 42,
    meaningOptions: [
      'Ik zie oplossingen, niet problemen',
      'Ik probeer het goede in situaties te zien',
      'Negatieve mensen trekken me leeg',
      'Optimisme is mijn default'
    ],
    detailPrompts: [
      'Situatie waar je positief bleef',
      'Hoe toon je positiviteit',
      'Wat geeft jou energie',
      'Moeilijke tijd die je doorstond'
    ],
    badExamples: [
      'Ik ben positief ingesteld',
      'Positive vibes only',
      'Optimist'
    ],
    goodExamples: [
      'Toen ik mijn baan verloor, startte ik een cursus waar ik al jaren over nadacht - beste plot twist ever',
      'Mijn vrienden komen naar mij voor pep talks - ik heb blijkbaar een talent voor perspectief',
      'Regen op vakantie = excuus voor museum marathon en indoor picknicken'
    ],
    exceptionalExamples: [
      'Afgelopen jaar was zwaar, maar ik leerde dat positief zijn niet betekent dat alles makkelijk is - het betekent dat je weet dat je het aankan.',
      'Ik hou een "wins journal" bij - kleine dingen die goed gingen. Laatste entry: geen koffie gemorst op mijn laptop. De lat ligt laag, de vibes zijn hoog.'
    ],
    mustInclude: ['specific example of behavior'],
    bonusPoints: ['nuance', 'realistic', 'shows growth']
  },

  {
    id: 'work-play',
    clicheText: 'Ik werk hard en speel harder',
    category: 'lifestyle',
    usagePercentage: 31,
    meaningOptions: [
      'Ik ben gedreven in mijn werk',
      'Balance is belangrijk voor me',
      'Ik kan goed omschakelen',
      'Werk en privé zijn beide belangrijk'
    ],
    detailPrompts: [
      'Hoe ziet een werkdag eruit',
      'Hoe ontspan je na werk',
      'Beste weekend recent',
      'Hoe vind je balans'
    ],
    badExamples: [
      'Work hard play hard',
      'Ik werk hard maar kan ook goed ontspannen',
      'Balance is key'
    ],
    goodExamples: [
      'Maandag tot vrijdag fulltime druk, vrijdagavond laptop dicht en telefoon op stil - geen compromis',
      'Ik ben die persoon die op kantoor geconcentreerd werkt en in het weekend op de bank ligt met een boek',
      'Mijn werk-life balance: 40 uur focus, 40 uur chaos, 88 uur slaap (wiskundig klopt het niet maar het voelt goed)'
    ],
    exceptionalExamples: [
      'Ik ben project manager by day, amateur salsa dancer by night. Context switching is mijn superkracht.',
      'Doordeweeks spreadsheets en deadlines, weekend festival camping met vrienden die me eraan herinneren dat ik ook maar een mens ben.'
    ],
    mustInclude: ['specific contrast between work and play'],
    bonusPoints: ['humor', 'self-awareness', 'concrete activities']
  }
];

// ============================================
// SCORING LOGIC
// ============================================

export interface TransformationScore {
  total: number; // 0-100
  breakdown: {
    specificity: number; // 0-25
    creativity: number; // 0-25
    authenticity: number; // 0-25
    impact: number; // 0-25
  };
  feedback: string[];
  level: 'poor' | 'okay' | 'good' | 'excellent';
}

export function scoreTransformation(
  exercise: ClicheExercise,
  transformed: string
): TransformationScore {
  let specificity = 0;
  let creativity = 0;
  let authenticity = 0;
  let impact = 0;
  const feedback: string[] = [];

  // Check if still contains cliché
  if (transformed.toLowerCase().includes(exercise.clicheText.toLowerCase())) {
    feedback.push('❌ Je transformatie bevat nog steeds het originele cliché');
    specificity -= 10;
  } else {
    specificity += 5;
  }

  // Check for must-include elements
  const hasLocation = /\b[A-Z][a-z]+\b/.test(transformed);
  const hasNumber = /\b\d+\b/.test(transformed);
  const hasTimeMarker = /\b(laatst|vorige|recent|gisteren|afgelopen)\b/i.test(transformed);
  const hasFirstPerson = /\b(ik|mijn|me)\b/i.test(transformed);

  if (hasLocation) {
    specificity += 5;
    feedback.push('✅ Specifieke locatie/naam genoemd');
  }
  if (hasNumber) {
    specificity += 5;
    feedback.push('✅ Concrete getallen gebruikt');
  }
  if (hasTimeMarker) {
    specificity += 5;
    feedback.push('✅ Tijdsaanduiding toegevoegd');
  }
  if (hasFirstPerson) {
    authenticity += 5;
  }

  // Check length (sweet spot: 60-150 chars)
  const length = transformed.length;
  if (length < 30) {
    feedback.push('⚠️ Te kort - voeg meer details toe');
    impact -= 10;
  } else if (length >= 60 && length <= 150) {
    impact += 10;
    feedback.push('✅ Perfecte lengte');
  } else if (length > 150) {
    feedback.push('⚠️ Een beetje lang - probeer punchier te zijn');
    impact -= 5;
  }

  // Check for bonus points
  const hasEmotion = /\b(geweldig|mooi|leuk|beste|love|haat|bang|blij|trots)\b/i.test(transformed);
  const hasHumor = /\b(spoiler|plot twist|oops|classic|natuurlijk|obviously)\b/i.test(transformed) || /\?!|!\)|\(/.test(transformed);
  const hasSensory = /\b(rook|klonk|voelde|zag|smaakte)\b/i.test(transformed);
  const hasContrast = /\bmaar\b|\ben toch\b|hoewel/i.test(transformed);

  if (hasEmotion) {
    creativity += 5;
    feedback.push('✅ Emotie toegevoegd');
  }
  if (hasHumor) {
    creativity += 10;
    feedback.push('✅ Humor/zelfspot - goed!');
  }
  if (hasSensory) {
    creativity += 5;
    feedback.push('✅ Zintuiglijke details');
  }
  if (hasContrast) {
    creativity += 5;
    feedback.push('✅ Interessant contrast/paradox');
  }

  // Check originality (not matching bad examples)
  const matchesBadExample = exercise.badExamples.some(bad =>
    transformed.toLowerCase().includes(bad.toLowerCase().slice(0, 20))
  );
  if (matchesBadExample) {
    feedback.push('❌ Dit lijkt te veel op de "slechte" voorbeelden');
    creativity -= 15;
  } else {
    creativity += 5;
  }

  // Authenticity checks
  const hasPersonalDetail = /\b(mijn|me|ik)\b/i.test(transformed) && !(/\b(iedereen|mensen|je)\b/i.test(transformed));
  const hasConcreteAction = /\b(probeer|maak|ga|doe|leer|verzamel)\b/i.test(transformed);

  if (hasPersonalDetail) {
    authenticity += 10;
  }
  if (hasConcreteAction) {
    authenticity += 10;
    feedback.push('✅ Concrete actie beschreven');
  }

  // Cap scores at 25 each
  specificity = Math.min(25, Math.max(0, specificity));
  creativity = Math.min(25, Math.max(0, creativity));
  authenticity = Math.min(25, Math.max(0, authenticity));
  impact = Math.min(25, Math.max(0, impact));

  const total = specificity + creativity + authenticity + impact;

  let level: TransformationScore['level'];
  if (total >= 80) level = 'excellent';
  else if (total >= 60) level = 'good';
  else if (total >= 40) level = 'okay';
  else level = 'poor';

  return {
    total,
    breakdown: { specificity, creativity, authenticity, impact },
    feedback,
    level
  };
}
