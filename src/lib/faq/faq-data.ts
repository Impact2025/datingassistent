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
    answer: 'DatingAssistent is een AI-gedreven dating coach die je helpt bij online daten. Van profieloptimalisatie tot gespreksadvies — wij begeleiden je stap voor stap.',
    category: 'algemeen',
    order: 1,
  },
  {
    id: 'voor-wie-geschikt',
    question: 'Voor wie is DatingAssistent geschikt?',
    answer: 'DatingAssistent is geschikt voor iedereen van 18+ die serieus wil daten. Of je nu beginner bent, al langer online date zonder succes, of weinig tijd hebt — onze tools passen zich aan aan jouw situatie.',
    category: 'algemeen',
    order: 2,
  },
  {
    id: 'hoe-werkt-ai',
    question: 'Hoe werkt de AI van DatingAssistent?',
    answer: 'Onze AI analyseert je profiel en geeft gepersonaliseerde adviezen op basis van jouw input. Voor analyses en nieuwe suggesties is een internetverbinding nodig.',
    category: 'algemeen',
    order: 3,
  },
  {
    id: 'niet-gewoon-chatbot',
    question: 'Is dit niet gewoon een algemene chatbot?',
    answer: 'Nee. DatingAssistent gebruikt context-aware AI die je profiel en gesprekscontext meeneemt. Je krijgt specifieke suggesties, geen algemene adviezen.',
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
    answer: 'We bieden vier abonnementen: Sociaal (€9,95/maand), Core (€24,50/maand), Pro (€39,50/maand) en Premium (€69,50/maand). Jaarlijks betalen bespaart circa 17%. Alle abonnementen zijn maandelijks opzegbaar.',
    category: 'prijzen',
    order: 2,
  },
  {
    id: 'opzeggen',
    question: 'Kan ik mijn abonnement opzeggen wanneer ik wil?',
    answer: 'Ja. Alle abonnementen zijn maandelijks opzegbaar zonder opzegtermijn of extra kosten. Je behoudt toegang tot het einde van de betaalde periode.',
    category: 'prijzen',
    order: 3,
  },
  {
    id: 'niet-werkt',
    question: 'Wat als het niet voor mij werkt?',
    answer: 'We bieden een terugbetalingsregeling binnen 14 dagen na aankoop, mits je minimaal 7 dagen actief gebruik hebt gemaakt. Neem contact op met support als je hier gebruik van wilt maken.',
    category: 'prijzen',
    featured: true,
    order: 4,
  },
  {
    id: 'betaalmethodes',
    question: 'Welke betaalmethodes accepteren jullie?',
    answer: 'We accepteren iDEAL en creditcard (Visa, Mastercard, American Express). Betalingen verlopen via Stripe, een van de veiligste betaalplatforms ter wereld. Alle verbindingen zijn SSL-versleuteld.',
    category: 'prijzen',
    order: 5,
  },
  {
    id: 'kortingen',
    question: 'Bieden jullie kortingen of coupon codes aan?',
    answer: 'We bieden kortingen bij jaarlijkse abonnementen. Coupon codes worden soms aangeboden via onze nieuwsbrief. Neem contact op voor actuele aanbiedingen.',
    category: 'prijzen',
    order: 6,
  },

  // ============================================
  // PRIVACY & VEILIGHEID
  // ============================================
  {
    id: 'data-veilig',
    question: 'Is mijn data veilig?',
    answer: 'Ja. We gebruiken SSL-encryptie en slaan geen gevoelige persoonlijke data langer op dan nodig. We verkopen nooit je informatie. De app is GDPR-compliant.',
    category: 'privacy',
    featured: true,
    order: 1,
  },
  {
    id: 'privacy-bescherming',
    question: 'Hoe beschermen jullie mijn privacy?',
    answer: 'Alle dataverbindingen zijn SSL-versleuteld. We delen nooit persoonlijke informatie met derden. Via de databeheer-sectie in je account heb je volledige controle over je data.',
    category: 'privacy',
    order: 2,
  },
  {
    id: 'data-bij-stoppen',
    question: 'Wat gebeurt er met mijn data als ik stop?',
    answer: 'Bij opzegging kun je kiezen om je account te deactiveren of volledig te verwijderen. Bij verwijdering wordt al je data permanent gewist binnen 30 dagen, conform de AVG.',
    category: 'privacy',
    order: 3,
  },
  {
    id: 'berichten-veilig',
    question: 'Zijn mijn berichten en profielinformatie veilig?',
    answer: 'Ja, alle communicatie met onze AI is versleuteld. Je profielinformatie wordt alleen gebruikt om betere adviezen te geven en niet gedeeld met derden.',
    category: 'privacy',
    order: 4,
  },
  {
    id: 'anderen-zien-gebruik',
    question: 'Zien anderen dat ik een dating coach gebruik?',
    answer: 'Nee, niemand ziet dat je DatingAssistent gebruikt. De suggesties die je krijgt zijn jouw eigen woorden — wij helpen je alleen om authentiek over te komen.',
    category: 'privacy',
    order: 5,
  },

  // ============================================
  // TECHNISCH
  // ============================================
  {
    id: 'welke-apparaten',
    question: 'Op welke apparaten werkt DatingAssistent?',
    answer: 'DatingAssistent werkt als web-app op alle moderne apparaten: desktop, laptop, tablet en smartphone. Je kunt de web-app ook als PWA installeren op je telefoon via de browser.',
    category: 'technisch',
    order: 1,
  },
  {
    id: 'offline',
    question: 'Werkt het offline?',
    answer: 'De app heeft een beperkte offline modus die je informeert dat er geen verbinding is. Voor AI-analyses en alle hoofdfuncties is een internetverbinding vereist.',
    category: 'technisch',
    order: 2,
  },
  {
    id: 'ai-snelheid',
    question: 'Hoe snel reageert de AI?',
    answer: 'Onze AI reageert typisch binnen enkele seconden. Complexe analyses kunnen iets langer duren. Tijdens piekuren kan de responstijd oplopen.',
    category: 'technisch',
    order: 3,
  },
  {
    id: 'inlog-problemen',
    question: 'Wat als ik problemen heb met inloggen?',
    answer: 'Controleer je internetverbinding en probeer een andere browser of incognito modus. Als dat niet helpt, gebruik de wachtwoord reset functie of neem contact op met support via info@datingassistent.nl.',
    category: 'technisch',
    order: 4,
  },
  {
    id: 'betaling-mislukt',
    question: 'Mijn betaling is mislukt, wat nu?',
    answer: 'Controleer je betaalmethode en probeer opnieuw via het Stripe-betaalscherm. Als het probleem blijft bestaan, neem contact op met support via info@datingassistent.nl.',
    category: 'technisch',
    order: 5,
  },
  {
    id: 'data-exporteren',
    question: 'Hoe exporteer ik mijn data?',
    answer: 'Via je account instellingen kun je al je data exporteren als JSON-bestand. Dit omvat profiel analyses, voortgangsdata en persoonlijke instellingen.',
    category: 'technisch',
    order: 6,
  },

  // ============================================
  // FEATURES & TOOLS
  // ============================================
  {
    id: 'welke-dating-apps',
    question: 'Voor welke dating apps werkt het?',
    answer: 'Alle! Tinder, Bumble, Hinge, Lexa, Relatieplanet, etc. Onze adviezen zijn platform-onafhankelijk omdat het gaat om menselijke psychologie, niet om app-specifieke trucjes.',
    category: 'features',
    featured: true,
    order: 1,
  },
  {
    id: 'hoe-snel-resultaten',
    question: 'Hoe snel zie ik resultaten?',
    answer: 'Dat verschilt per persoon en hoe actief je de tools gebruikt. Profielverbeteringen kunnen snel effect hebben op het aantal matches; betere gesprekken ontwikkel je gaandeweg.',
    category: 'features',
    featured: true,
    order: 2,
  },
  {
    id: 'weinig-matches',
    question: 'Werkt dit ook als ik weinig/geen matches krijg?',
    answer: 'Juist dan! Onze Profiel Coach analyseert waarom je weinig matches krijgt (foto\'s, bio, selectie) en geeft concrete verbeterpunten.',
    category: 'features',
    order: 3,
  },
  {
    id: 'voortgang-tracken',
    question: 'Kan ik mijn voortgang tracken?',
    answer: 'Ja, je kunt je voortgang en inzichten bekijken vanuit je dashboard. Dit omvat profiel analyses en persoonlijke verbeterpunten.',
    category: 'features',
    order: 4,
  },

  // ============================================
  // ACCOUNT & SUPPORT
  // ============================================
  {
    id: 'wachtwoord-reset',
    question: 'Hoe kan ik mijn wachtwoord resetten?',
    answer: 'Ga naar de login pagina en klik op \'Wachtwoord vergeten\'. Voer je e-mailadres in en je ontvangt een reset link. Reset links verlopen na 24 uur.',
    category: 'account',
    order: 1,
  },
  {
    id: 'account-verwijderen',
    question: 'Kan ik mijn account verwijderen?',
    answer: 'Ja, je kunt je account op elk moment verwijderen via de account instellingen. Bij permanent verwijderen wordt alle data gewist conform de AVG.',
    category: 'account',
    order: 2,
  },
  {
    id: 'contact-support',
    question: 'Hoe kan ik contact opnemen met support?',
    answer: 'Je kunt ons bereiken via de AI-chat (Iris) in de app, per e-mail via info@datingassistent.nl, of telefonisch op 06 14470977 (maandag t/m vrijdag 09:00–17:00).',
    category: 'account',
    order: 3,
  },

  // ============================================
  // SPECIFIEKE DOELGROEPEN
  // ============================================
  {
    id: 'te-oud-jong',
    question: 'Ben ik te oud/jong voor DatingAssistent?',
    answer: 'Onze gebruikers zijn van 18-65+. We hebben speciale programma\'s voor verschillende leeftijdsgroepen, waaronder 30+, 40+ en 50+.',
    category: 'doelgroepen',
    order: 1,
  },
  {
    id: 'lgbtq',
    question: 'Werkt dit ook voor LGBTQ+ dating?',
    answer: 'Ja. De coaching is inclusief en toepasbaar voor alle oriëntaties en relatiestijlen.',
    category: 'doelgroepen',
    order: 2,
  },
  {
    id: 'beperking',
    question: 'Hebben jullie speciale ondersteuning voor mensen met een beperking?',
    answer: 'Ja, we hebben een speciaal Sociaal-pakket (€9,95/maand) gericht op mensen met een beperking. De web-app is bruikbaar op alle apparaten en browsers.',
    category: 'doelgroepen',
    order: 3,
  },
  {
    id: 'oudere-singles',
    question: 'Is DatingAssistent geschikt voor oudere singles?',
    answer: 'Zeker! We hebben speciale programma\'s voor 50+ singles met focus op moderne dating en betekenisvolle connecties.',
    category: 'doelgroepen',
    order: 4,
  },
  {
    id: 'bedrijven',
    question: 'Kunnen bedrijven DatingAssistent gebruiken?',
    answer: 'Neem contact op via info@datingassistent.nl voor zakelijke mogelijkheden.',
    category: 'doelgroepen',
    order: 5,
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
