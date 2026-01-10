/**
 * Centrale FAQ Data
 * Single source of truth voor alle FAQ vragen
 */

export type FAQCategory =
  | 'algemeen'
  | 'prijzen'
  | 'privacy'
  | 'technisch'
  | 'features'
  | 'account'
  | 'doelgroepen';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  featured?: boolean;
  order: number;
}

export const FAQ_CATEGORIES_META: Record<FAQCategory, { label: string; icon: string }> = {
  algemeen: { label: 'Algemeen', icon: 'HelpCircle' },
  prijzen: { label: 'Prijzen & Abonnementen', icon: 'CreditCard' },
  privacy: { label: 'Privacy & Veiligheid', icon: 'Shield' },
  technisch: { label: 'Technisch', icon: 'Settings' },
  features: { label: 'Features & Tools', icon: 'Sparkles' },
  account: { label: 'Account & Support', icon: 'User' },
  doelgroepen: { label: 'Specifieke Doelgroepen', icon: 'Users' },
};

export const FAQ_DATA: FAQItem[] = [
  // ============================================
  // ALGEMEEN
  // ============================================
  {
    id: 'wat-is-datingassistent',
    question: 'Wat is DatingAssistent precies?',
    answer: 'DatingAssistent is een professionele AI-gedreven dating coach die je helpt bij elk aspect van online daten. We combineren geavanceerde kunstmatige intelligentie met 10+ jaar expertise in dating coaching. Van profieloptimalisatie tot date planning - wij begeleiden je stap voor stap naar meer succes in de liefde.',
    category: 'algemeen',
    order: 1,
  },
  {
    id: 'voor-wie-geschikt',
    question: 'Voor wie is DatingAssistent geschikt?',
    answer: 'DatingAssistent is geschikt voor iedereen van 18+ die serieus wil daten. Of je nu beginner bent, al langer online date zonder succes, single ouders, mensen met een beperking, of professionals die weinig tijd hebben - onze tools passen zich aan aan jouw unieke situatie en behoeften.',
    category: 'algemeen',
    order: 2,
  },
  {
    id: 'hoe-werkt-ai',
    question: 'Hoe werkt de AI-technologie van DatingAssistent?',
    answer: 'Onze AI analyseert miljoenen datapunten van succesvolle dates en combineert dit met bewezen dating psychologie. De AI leert van jouw gedrag, geeft gepersonaliseerde adviezen, en past zich continu aan om steeds betere resultaten te leveren.',
    category: 'algemeen',
    order: 3,
  },
  {
    id: 'niet-gewoon-chatbot',
    question: 'Is dit niet gewoon een algemene chatbot?',
    answer: 'Nee! DatingAssistent gebruikt context-aware AI gebaseerd op 10 jaar coaching ervaring. De AI ziet je profiel, je match\'s profiel, en gesprekscontext. Het geeft specifieke suggesties, geen algemene "wees jezelf" adviezen.',
    category: 'algemeen',
    featured: true,
    order: 4,
  },

  // ============================================
  // PRIJZEN & ABONNEMENTEN
  // ============================================
  {
    id: 'gratis-beginnen',
    question: 'Kan ik gratis beginnen?',
    answer: 'Ja! De Profiel Check is volledig gratis, zonder creditcard. Je krijgt direct inzicht in je dating profiel en concrete verbeterpunten. Daarna kies je zelf of je verder wilt met een van onze programma\'s.',
    category: 'prijzen',
    featured: true,
    order: 1,
  },
  {
    id: 'kosten',
    question: 'Wat zijn de kosten van DatingAssistent?',
    answer: 'We bieden flexibele abonnementen: Core (€29/maand), Pro (€49/maand), Premium AI (€99/maand) en Premium Plus (€2490 eenmalig). Alle abonnementen zijn maandelijks opzegbaar. Jaarlijks betalen bespaart tot 17%. Gratis proefperiode van 7 dagen beschikbaar.',
    category: 'prijzen',
    order: 2,
  },
  {
    id: 'investering-waard',
    question: 'Is de investering het waard?',
    answer: 'De gemiddelde gebruiker bespaart 15+ uur per maand door gerichte hulp vs. zelf uitproberen. Plus: kwaliteit over kwantiteit betekent minder tijdverspilling aan verkeerde matches. Veel gebruikers zeggen dat één goede date de investering al waard was.',
    category: 'prijzen',
    order: 3,
  },
  {
    id: 'opzeggen',
    question: 'Kan ik mijn abonnement opzeggen wanneer ik wil?',
    answer: 'Absoluut. Alle abonnementen zijn maandelijks opzegbaar zonder opzegtermijn of extra kosten. Je behoudt toegang tot al je data en voortgang tot het einde van de betaalde periode. Geen verplichtingen, geen gedoe.',
    category: 'prijzen',
    order: 4,
  },
  {
    id: 'niet-werkt',
    question: 'Wat als het niet voor mij werkt?',
    answer: 'Geen risico! Alle programma\'s hebben een 30 dagen niet-goed-geld-terug garantie. Niet tevreden? Je krijgt je geld terug, geen vragen.',
    category: 'prijzen',
    featured: true,
    order: 5,
  },
  {
    id: 'betaalmethodes',
    question: 'Welke betaalmethodes accepteren jullie?',
    answer: 'We accepteren alle gangbare betaalmethodes: iDEAL, creditcard (Visa, Mastercard, American Express), PayPal, en bankoverschrijving. Alle betalingen zijn SSL-versleuteld en voldoen aan PCI DSS security standaarden.',
    category: 'prijzen',
    order: 6,
  },
  {
    id: 'kortingen',
    question: 'Bieden jullie kortingen of coupon codes aan?',
    answer: 'Ja, we bieden regelmatig kortingen aan voor nieuwe gebruikers, studenten, en bij jaarlijkse abonnementen. Coupon codes zijn beschikbaar via onze nieuwsbrief, social media, en partner websites. Neem contact op voor actuele aanbiedingen.',
    category: 'prijzen',
    order: 7,
  },

  // ============================================
  // PRIVACY & VEILIGHEID
  // ============================================
  {
    id: 'data-veilig',
    question: 'Is mijn data veilig?',
    answer: '100%. We gebruiken SSL encryptie, opslaan geen gevoelige persoonlijke data langer dan nodig, en verkopen nooit je informatie. GDPR-compliant en gehost in Nederland.',
    category: 'privacy',
    featured: true,
    order: 1,
  },
  {
    id: 'privacy-bescherming',
    question: 'Hoe beschermen jullie mijn privacy?',
    answer: 'Privacy is onze hoogste prioriteit. Alle data is end-to-end versleuteld, opgeslagen in Nederlandse datacenters die voldoen aan GDPR. We delen nooit persoonlijke informatie met derden. Je hebt volledige controle over je data via ons privacy dashboard.',
    category: 'privacy',
    order: 2,
  },
  {
    id: 'data-bij-stoppen',
    question: 'Wat gebeurt er met mijn data als ik stop?',
    answer: 'Bij opzegging kun je kiezen om je account te deactiveren (tijdelijk pauze) of volledig te verwijderen. Bij verwijdering wordt al je data permanent gewist binnen 30 dagen, conform GDPR \'right to be forgotten\'.',
    category: 'privacy',
    order: 3,
  },
  {
    id: 'berichten-veilig',
    question: 'Zijn mijn berichten en profielinformatie veilig?',
    answer: 'Ja, alle communicatie tussen jou en onze AI is versleuteld. We slaan geen persoonlijke berichten op langer dan noodzakelijk voor service verbetering. Je profielinformatie wordt alleen gebruikt om betere adviezen te geven.',
    category: 'privacy',
    order: 4,
  },
  {
    id: 'anderen-zien-gebruik',
    question: 'Zien anderen dat ik een dating coach gebruik?',
    answer: 'Nee, niemand ziet dat je DatingAssistent gebruikt. De suggesties die je krijgt zijn jouw eigen woorden—wij helpen je alleen om authentiek én aantrekkelijk over te komen.',
    category: 'privacy',
    order: 5,
  },

  // ============================================
  // TECHNISCH
  // ============================================
  {
    id: 'welke-apparaten',
    question: 'Op welke apparaten werkt DatingAssistent?',
    answer: 'DatingAssistent werkt op alle moderne apparaten: desktop computers, laptops, tablets en smartphones. We ondersteunen alle populaire browsers (Chrome, Firefox, Safari, Edge) en hebben native apps voor iOS en Android.',
    category: 'technisch',
    order: 1,
  },
  {
    id: 'offline',
    question: 'Werkt het offline?',
    answer: 'Basisfunctionaliteit werkt offline voor opgeslagen content. Voor AI-features en nieuwe analyses is internetverbinding vereist. We raden minimaal 4G verbinding aan voor optimale prestaties.',
    category: 'technisch',
    order: 2,
  },
  {
    id: 'ai-snelheid',
    question: 'Hoe snel reageert de AI?',
    answer: 'Onze AI reageert typisch binnen 2-5 seconden op vragen. Complexe analyses kunnen tot 30 seconden duren. Tijdens piekuren kan het iets langer zijn, maar we streven altijd naar sub-10 seconden response tijden.',
    category: 'technisch',
    order: 3,
  },
  {
    id: 'inlog-problemen',
    question: 'Wat als ik problemen heb met inloggen?',
    answer: 'Controleer eerst je internetverbinding en browser cache. Probeer een andere browser of incognito modus. Als dat niet helpt, gebruik de wachtwoord reset functie of neem contact op met support. We helpen je binnen 1 uur weer online.',
    category: 'technisch',
    order: 4,
  },
  {
    id: 'betaling-mislukt',
    question: 'Mijn betaling is mislukt, wat nu?',
    answer: 'Controleer je betaalmethode en probeer opnieuw. Als het probleem blijft bestaan, neem contact op met support. We kunnen handmatig betalingen verwerken en zorgen dat je geen toegang verliest.',
    category: 'technisch',
    order: 5,
  },
  {
    id: 'data-exporteren',
    question: 'Hoe exporteer ik mijn data?',
    answer: 'Via je account instellingen kun je al je data exporteren in JSON of CSV formaat. Dit omvat profiel analyses, chat geschiedenis, voortgangsdata, en persoonlijke instellingen. Export is gratis en onbeperkt.',
    category: 'technisch',
    order: 6,
  },

  // ============================================
  // FEATURES & TOOLS
  // ============================================
  {
    id: 'welke-dating-apps',
    question: 'Voor welke dating apps werkt het?',
    answer: 'Alle! Tinder, Bumble, Hinge, Lexa, Relatieplanet, etc. Onze tips zijn platform-onafhankelijk omdat het gaat om menselijke psychologie, niet om app-specifieke trucjes.',
    category: 'features',
    featured: true,
    order: 1,
  },
  {
    id: 'hoe-snel-resultaten',
    question: 'Hoe snel zie ik resultaten?',
    answer: 'Profiel verbeteringen zie je binnen 48 uur (meer matches). Betere gesprekken starten binnen 1 week. Voor de meeste gebruikers: eerste betekenisvolle date binnen 2-4 weken bij actief gebruik.',
    category: 'features',
    featured: true,
    order: 2,
  },
  {
    id: 'weinig-matches',
    question: 'Werkt dit ook als ik weinig/geen matches krijg?',
    answer: 'Juist dan! Onze Profiel Coach analyseert precies waarom je geen matches krijgt (foto\'s, bio, selectie) en geeft concrete verbeteringen. 78% van gebruikers met minder dan 5 matches/maand komt uit op 15+ matches na profiel optimalisatie.',
    category: 'features',
    order: 3,
  },
  {
    id: 'voortgang-tracken',
    question: 'Kan ik mijn voortgang tracken?',
    answer: 'Ja, onze Voortgang Tracker geeft gedetailleerde inzichten in je dating statistieken: matches, conversaties, date success rate, en persoonlijke verbeterpunten. Alles wordt visueel weergegeven met trends en aanbevelingen.',
    category: 'features',
    order: 4,
  },

  // ============================================
  // ACCOUNT & SUPPORT
  // ============================================
  {
    id: 'wachtwoord-reset',
    question: 'Hoe kan ik mijn wachtwoord resetten?',
    answer: 'Ga naar de login pagina en klik op \'Wachtwoord vergeten\'. Voer je e-mailadres in en je ontvangt binnen 5 minuten een reset link. Voor security redenen verlopen reset links na 24 uur.',
    category: 'account',
    order: 1,
  },
  {
    id: 'account-verwijderen',
    question: 'Kan ik mijn account verwijderen?',
    answer: 'Ja, je kunt je account op elk moment verwijderen via de account instellingen. Kies tussen \'tijdelijk deactiveren\' (30 dagen pauze) of \'permanent verwijderen\'. Bij permanent verwijderen wordt alle data gewist conform privacy wetgeving.',
    category: 'account',
    order: 2,
  },
  {
    id: 'contact-support',
    question: 'Hoe kan ik contact opnemen met support?',
    answer: 'We bieden meerdere support kanalen: live chat (24/7), e-mail (support@datingassistent.nl, response binnen 24 uur), telefoon (werkdagen 9-17), en uitgebreide help documentatie. Premium gebruikers krijgen prioriteit support.',
    category: 'account',
    order: 3,
  },

  // ============================================
  // SPECIFIEKE DOELGROEPEN
  // ============================================
  {
    id: 'te-oud-jong',
    question: 'Ben ik te oud/jong voor DatingAssistent?',
    answer: 'Onze gebruikers zijn van 18-65+. De meeste tips zijn leeftijd-onafhankelijk. Wel: onze tone of voice en voorbeelden zijn het meest gericht op 25-45 jaar.',
    category: 'doelgroepen',
    order: 1,
  },
  {
    id: 'lgbtq',
    question: 'Werkt dit ook voor LGBTQ+ dating?',
    answer: 'Absoluut! Onze AI is getraind op diverse relaties en dating scenario\'s. Of je nu zoekt naar mannen, vrouwen, of non-binaire partners - de coaching is inclusief en respectvol voor alle oriëntaties.',
    category: 'doelgroepen',
    order: 2,
  },
  {
    id: 'beperking',
    question: 'Hebben jullie speciale ondersteuning voor mensen met een beperking?',
    answer: 'Ja, DatingAssistent is begonnen als toegankelijke dating coach voor mensen met beperkingen. We bieden voice-over ondersteuning, screen reader compatibility, vereenvoudigde interfaces, en speciale coaching programma\'s.',
    category: 'doelgroepen',
    order: 3,
  },
  {
    id: 'oudere-singles',
    question: 'Is DatingAssistent geschikt voor oudere singles?',
    answer: 'Zeker! We hebben speciale programma\'s voor 50+ singles met focus op moderne dating etiquette, digitale veiligheid, en betekenisvolle connecties. Onze AI begrijpt de unieke uitdagingen van deze doelgroep.',
    category: 'doelgroepen',
    order: 4,
  },
  {
    id: 'api-toegang',
    question: 'Bieden jullie API toegang aan?',
    answer: 'Ja, voor zakelijke gebruikers en developers bieden we REST API toegang. Hiermee kun je DatingAssistent integreren in je eigen applicaties. API documentatie en sandbox omgeving beschikbaar op aanvraag.',
    category: 'doelgroepen',
    order: 5,
  },
  {
    id: 'bedrijven',
    question: 'Kunnen bedrijven DatingAssistent gebruiken?',
    answer: 'Absoluut. We hebben speciale enterprise oplossingen voor dating bureaus, relatie coaches, en HR afdelingen. Neem contact op voor een customized demo en prijsopgave.',
    category: 'doelgroepen',
    order: 6,
  },
];

// Helper functies
export function getFeaturedFAQs(): FAQItem[] {
  return FAQ_DATA.filter(faq => faq.featured).sort((a, b) => a.order - b.order);
}

export function getFAQsByCategory(category: FAQCategory): FAQItem[] {
  return FAQ_DATA.filter(faq => faq.category === category).sort((a, b) => a.order - b.order);
}

export function getAllCategories(): FAQCategory[] {
  return Object.keys(FAQ_CATEGORIES_META) as FAQCategory[];
}

export function searchFAQs(query: string): FAQItem[] {
  const lowerQuery = query.toLowerCase();
  return FAQ_DATA.filter(
    faq =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
  );
}

// Voor Schema.org structured data
export function getFAQsForSchema(): Array<{ question: string; answer: string }> {
  return FAQ_DATA.map(faq => ({
    question: faq.question,
    answer: faq.answer,
  }));
}
