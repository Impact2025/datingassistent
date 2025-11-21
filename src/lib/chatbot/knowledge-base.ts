import type { KnowledgeBaseEntry } from './types';

export const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    id: 'faq-what-is-da',
    category: 'Algemeen',
    intent: 'faq',
    question: 'Wat is de DatingAssistent?',
    answer:
      'DatingAssistent is jouw digitale datingcoach. Je krijgt profielhulp, openingszinnen, platformadvies, date-ideeën en zelfvertrouwenstips die je direct kunt toepassen.',
    quickReplies: [
      { label: 'Hoe werkt het?', payload: 'faq-hoe-werkt-het' },
      { label: 'Welke pakketten zijn er?', payload: 'pricing-overview' },
    ],
    tags: ['algemeen', 'intro', 'start'],
  },
  {
    id: 'faq-hoe-werkt-het',
    category: 'Algemeen',
    intent: 'faq',
    question: 'Hoe werkt DatingAssistent?',
    answer:
      'Maak een account, kies je doelen en voer tekst of spraak in. De AI-coach maakt profielteksten, gespreksopeners en geeft date-advies afgestemd op jouw situatie.',
    quickReplies: [
      { label: 'Kan ik inspreken?', payload: 'faq-profiel-inspreken' },
      { label: 'Is het LVB-vriendelijk?', payload: 'faq-lvb-friendly' },
    ],
    tags: ['werkwijze', 'onboarding'],
  },
  {
    id: 'faq-profiel-inspreken',
    category: 'Profielhulp',
    intent: 'faq',
    question: 'Kan ik mijn profiel inspreken?',
    answer:
      'Ja, je kunt je verhaal inspreken. De assistent zet het om naar een warm en duidelijk profiel dat je daarna kunt aanpassen.',
    tags: ['profiel', 'spraak', 'input'],
  },
  {
    id: 'faq-lvb-friendly',
    category: 'Inclusie & toegankelijkheid',
    intent: 'faq',
    question: 'Is DatingAssistent LVB-vriendelijk?',
    answer:
      'Zeker. We bieden eenvoudige taal, pictogrammen, spraakopties en de mogelijkheid om een begeleider mee te laten kijken.',
    tags: ['inclusie', 'toegankelijkheid'],
  },
  {
    id: 'faq-privacy',
    category: 'Account & Privacy',
    intent: 'privacy',
    question: 'Hoe gaat de app om met privacy?',
    answer:
      'We verwerken alleen gegevens die nodig zijn voor je coaching. Alles is conform AVG en je kunt je data inzien, exporteren of verwijderen. Bekijk https://datingassistent.nl/privacyverklaring voor details.',
    tags: ['privacy', 'avg'],
  },
  {
    id: 'support-login',
    category: 'Account & Privacy',
    intent: 'support',
    question: 'Ik kan niet inloggen',
    answer:
      'Reset eerst je wachtwoord via https://datingassistent.nl/forgot-password. Blijft het probleem? Kies “Praat met medewerker” of mail support@datingassistent.nl.',
    quickReplies: [
      { label: 'Wachtwoord resetten', payload: 'support-reset-password' },
      { label: 'Contact support', payload: 'support-contact' },
    ],
    tags: ['support', 'login'],
  },
  {
    id: 'support-reset-password',
    category: 'Account & Privacy',
    intent: 'support',
    question: 'Hoe reset ik mijn wachtwoord?',
    answer:
      'Ga naar https://datingassistent.nl/reset-password, vul je e-mailadres in en volg de stappen. Lukt het niet, neem contact op met support.',
    tags: ['support', 'password'],
  },
  {
    id: 'sales-pricing',
    category: 'Prijzen',
    intent: 'pricing',
    question: 'Wat kost een abonnement?',
    answer:
      'Gratis: basisprofiel en FAQ. Core: €24,50 p/m met uitgebreide coaching. Premium en zakelijke pakketten op aanvraag. Wil je een PDF met prijzen ontvangen?',
    quickReplies: [
      { label: 'Stuur prijsoverzicht', payload: 'sales-send-pricing-pdf' },
      { label: 'Plan een demo', payload: 'sales-book-demo' },
    ],
    tags: ['pricing', 'sales'],
  },
  {
    id: 'sales-lead-capture',
    category: 'Sales',
    intent: 'sales',
    question: 'Kan ik een demo plannen?',
    answer:
      'Natuurlijk. Laat je naam, e-mail en voorkeursmoment achter. We sturen direct een link om een afspraak in te plannen.',
    quickReplies: [
      { label: 'Plan demo', payload: 'sales-book-demo' },
    ],
    tags: ['sales', 'demo'],
  },
  {
    id: 'faq-safety',
    category: 'Veiligheid',
    intent: 'faq',
    question: 'Wat zijn veiligheidsregels voor dates?',
    answer:
      'Plan je eerste date op een openbare plek, deel je locatie met een vertrouwde persoon en respecteer grenzen. Bekijk onze volledige gids op https://datingassistent.nl/faq.',
    tags: ['veiligheid', 'date'],
  },
  {
    id: 'pricing-overview',
    category: 'Prijzen',
    intent: 'pricing',
    question: 'Overzicht prijzen',
    answer:
      'Onze pakketten: Sociaal €9,95 p/m, Core €24,50 p/m, Pro €39,50 p/m en Premium €69,50 p/m. Jaarabonnementen bieden 2 maanden voordeel. Vraag gerust naar een offerte op maat.',
    tags: ['prijs', 'overzicht', 'kosten'],
  },
  {
    id: 'sales-send-pricing-pdf',
    category: 'Prijzen',
    intent: 'sales',
    question: 'Prijsoverzicht per mail',
    answer:
      'Laat je e-mailadres achter dan sturen we direct de prijslijst (PDF) en optionele kortingen voor teams of begeleiders.',
    tags: ['pricing', 'pdf'],
  },
  {
    id: 'sales-book-demo',
    category: 'Sales',
    intent: 'sales',
    question: 'Demo plannen',
    answer:
      'Top! Stuur je naam, organisatie en voorkeursmoment. We sturen je daarna een kalenderlink om de demo in te plannen.',
    tags: ['demo', 'afspraak'],
  },
  {
    id: 'support-contact',
    category: 'Account & Privacy',
    intent: 'support',
    question: 'Contact met support',
    answer:
      'Je bereikt ons via WhatsApp, support@datingassistent.nl of telefonisch via 06 14470977 (ma-vr 09:00-17:00). Voor urgentie kun je "Praat met medewerker" kiezen.',
    tags: ['support', 'contact'],
  },
  {
    id: 'faq-platform-advies',
    category: 'Profielhulp',
    intent: 'faq',
    question: 'Welke dating app past bij mij?',
    answer:
      'Dat hangt af van je doelen. Tinder voor casual dates, Bumble voor gelijke kansen, Hinge voor relaties, en EliteSingles voor serieuzere daters. Ik kan je helpen kiezen gebaseerd op je profiel.',
    quickReplies: [
      { label: 'Platform advies krijgen', payload: 'platform-match' },
    ],
    tags: ['platform', 'app', 'datingapp', 'kiezen'],
  },
  {
    id: 'faq-profiel-foto',
    category: 'Profielhulp',
    intent: 'faq',
    question: 'Hoe maak ik goede profielfoto\'s?',
    answer:
      'Gebruik recente, duidelijke foto\'s waar je gezicht goed zichtbaar is. Toon je persoonlijkheid met hobby-foto\'s. Vermijd groepsfoto\'s waar niet duidelijk is wie jij bent.',
    tags: ['profiel', 'foto', 'profielfoto'],
  },
  {
    id: 'faq-gesprek-starters',
    category: 'Gesprekscoach',
    intent: 'faq',
    question: 'Wat zijn goede openingszinnen?',
    answer:
      'Vraag naar gedeelde interesses uit het profiel, geef een oprechte compliment, of stel een leuke vraag. Vermijd "Hoi" of "Hoe gaat het?". Ik kan persoonlijke suggesties geven.',
    quickReplies: [
      { label: 'Openingszinnen genereren', payload: 'generate-openers' },
    ],
    tags: ['gesprek', 'openingszin', 'starters'],
  },
  {
    id: 'faq-date-planner',
    category: 'Dateplanner',
    intent: 'faq',
    question: 'Wat is een goed eerste date idee?',
    answer:
      'Kies iets laagdrempeligs zoals koffie, een wandeling in het park, of een museum. Zorg voor een openbare plek en houd het kort (1-2 uur). Ik kan gepersonaliseerde date ideeën geven.',
    quickReplies: [
      { label: 'Date ideeën krijgen', payload: 'date-ideas' },
    ],
    tags: ['date', 'eerste date', 'ontmoeting'],
  },
  {
    id: 'faq-zelfvertrouwen',
    category: 'Zelfvertrouwen',
    intent: 'faq',
    question: 'Hoe word ik zelfverzekerder bij daten?',
    answer:
      'Focus op je sterke punten, oefen met vrienden, en onthoud dat afwijzing normaal is. Elke "nee" brengt je dichter bij een "ja". Ik help je met zelfvertrouwen tips.',
    quickReplies: [
      { label: 'Zelfvertrouwen tips', payload: 'confidence-tips' },
    ],
    tags: ['zelfvertrouwen', 'vertrouwen', 'angst'],
  },
  {
    id: 'faq-red-flags',
    category: 'Veiligheid',
    intent: 'faq',
    question: 'Welke rode vlaggen moet ik herkennen?',
    answer:
      'Let op: te snel willen trouwen, geheimzinnig over werk/relatie, druk uitoefenen voor geld, of inconsistent verhalen. Neem contact op als iets niet klopt.',
    tags: ['veiligheid', 'red flags', 'waarschuwing'],
  },
  {
    id: 'faq-ghosting',
    category: 'Gesprekscoach',
    intent: 'faq',
    question: 'Wat moet ik doen bij ghosting?',
    answer:
      'Geef het een paar dagen, stuur dan één beleefd bericht. Als er geen reactie komt, ga door. Het zegt meer over hen dan over jou. Blijf positief en ga door met daten.',
    tags: ['ghosting', 'afwijzing', 'gesprek'],
  },
  {
    id: 'faq-online-safety',
    category: 'Veiligheid',
    intent: 'faq',
    question: 'Hoe blijf ik veilig bij online daten?',
    answer:
      'Deel locatie pas na vertrouwen, ontmoet op openbare plekken, neem een vriend mee bij eerste date, en vertrouw je gevoel. Nooit geld sturen naar dates.',
    tags: ['veiligheid', 'online', 'bescherming'],
  },
  {
    id: 'faq-profile-writing',
    category: 'Profielhulp',
    intent: 'faq',
    question: 'Hoe schrijf ik een goed profiel?',
    answer:
      'Wees specifiek over hobby\'s, humoristisch, en authentiek. Vermijd negatieve uitspraken. Toon wat je zoekt in een relatie. Ik kan je helpen met profielteksten.',
    quickReplies: [
      { label: 'Profiel hulp krijgen', payload: 'profile-help' },
    ],
    tags: ['profiel', 'tekst', 'schrijven'],
  },
  {
    id: 'faq-matching',
    category: 'Algemeen',
    intent: 'faq',
    question: 'Waarom match ik niet?',
    answer:
      'Check je foto\'s, bio, en swipe gedrag. Wees selectief maar niet te kieskeurig. Het gaat om kwaliteit over kwantiteit. Ik kan je profiel analyseren.',
    quickReplies: [
      { label: 'Profiel analyse', payload: 'profile-analysis' },
    ],
    tags: ['matching', 'swipe', 'profiel'],
  },
  {
    id: 'faq-conversation-flow',
    category: 'Gesprekscoach',
    intent: 'faq',
    question: 'Hoe houd ik een gesprek gaande?',
    answer:
      'Stel open vragen, deel verhalen, toon interesse in hun antwoorden. Luister meer dan je praat. Vraag door op interessante onderwerpen.',
    tags: ['gesprek', 'communicatie', 'flow'],
  },
  {
    id: 'faq-age-difference',
    category: 'Algemeen',
    intent: 'faq',
    question: 'Is leeftijd belangrijk bij daten?',
    answer:
      'Leeftijd kan een rol spelen maar is niet doorslaggevend. Focus op compatibiliteit, waarden, en connectie. Wat voor jou werkt is het belangrijkste.',
    tags: ['leeftijd', 'verschil', 'relatie'],
  },
  {
    id: 'faq-long-distance',
    category: 'Dateplanner',
    intent: 'faq',
    question: 'Werkt lange afstand daten?',
    answer:
      'Het kan werken met goede communicatie, regelmatige bezoeken, en duidelijke doelen. Maar het is uitdagend. Wees eerlijk over verwachtingen.',
    tags: ['lange afstand', 'distance', 'relatie'],
  },
  {
    id: 'faq-breakup-advice',
    category: 'Zelfvertrouwen',
    intent: 'faq',
    question: 'Hoe ga ik om met een break-up?',
    answer:
      'Geef jezelf tijd om te rouwen, focus op zelfzorg, blijf actief met vrienden, en overweeg counseling. Het wordt beter met tijd. Je bent sterk.',
    tags: ['breakup', 'relatie', 'rouw'],
  },
];

export function findKnowledgeBaseEntry(payload: string) {
  const normalized = payload.trim().toLowerCase();
  return KNOWLEDGE_BASE.find((entry) => entry.id.toLowerCase() === normalized);
}
