/**
 * Pattern Quiz Result Configurations
 *
 * Complete content for each of the 4 attachment patterns.
 * Based on Vincent's blueprint with psychologically informed copy.
 */

import type { AttachmentPattern, PatternResultConfig } from './pattern-types';

export const PATTERN_RESULTS: Record<AttachmentPattern, PatternResultConfig> = {
  // =========================================================
  // SECURE - "De Stabiele Basis"
  // =========================================================
  secure: {
    key: 'secure',
    title: 'De Stabiele Basis',
    subtitle: 'Veilig Gehecht',
    color: '#10b981', // Emerald

    opening: {
      headline: 'Jouw Dating Patroon: De Stabiele Basis',
      paragraph:
        'Goed nieuws: je scoort laag op zowel angst als vermijding. Dit betekent dat je een relatief gezonde basis hebt voor relaties. Je voelt je comfortabel met intimiteit én met onafhankelijkheid.',
    },

    nuance: {
      headline: 'Maar laten we eerlijk zijn...',
      paragraph:
        'Als alles zo goed ging, had je deze quiz niet ingevuld. Wat ik vaak zie bij mensen met jouw patroon: je trekt de verkeerde types aan. Juist omdat jij stabiel bent, kun je aantrekkelijk zijn voor mensen die dat niet zijn — en dan word jij de "fixer" in de dynamiek.',
    },

    patternExplained: {
      headline: 'Wat er waarschijnlijk gebeurt',
      paragraph:
        'Je gezonde basis wordt soms juist je achilleshiel in dating:',
      bullets: [
        'Je geeft mensen te veel kansen omdat je "het goede" in ze ziet',
        'Je blijft te lang proberen iets te laten werken dat niet past',
        'Avoidant types voelen zich veilig bij jou, maar kunnen niet matchen',
        'Je geduld kan worden aangezien voor desinteresse door anxious types',
      ],
    },

    mainPitfall: {
      headline: 'Je grootste valkuil',
      paragraph:
        'Te lang doorgaan met iemand die niet op jouw niveau zit, omdat je denkt dat je het kunt laten werken. Je stabiliteit verdient iemand die dat kan matchen.',
    },

    concreteTip: {
      headline: 'Wat je vandaag kunt doen',
      tip: 'Stel binnen de eerste 3 dates de vraag: "Wat zoek je?" — en geloof het antwoord. Als iemand zegt "ik weet het nog niet", is dat ook een antwoord. Je hoeft niet iemand te overtuigen dat ze klaar zijn.',
    },

    ctaSection: {
      headline: 'De volgende stap',
      paragraph:
        'Je basis is goed. Maar "goed genoeg" is niet waarom je hier bent. In 21 dagen leer je hoe je sneller de juiste mensen herkent — en de verkeerde eerder loslaat. Geen tijdverspilling meer.',
      bullets: [
        'Dagelijkse acties die je dating aanpak transformeren',
        'De exacte vragen om intenties te checken (zonder awkward te zijn)',
        'AI-coach voor wanneer je twijfelt',
      ],
      buttonText: 'Start de 21-Dagen Kickstart',
      buttonTextSecondary: 'Of ga direct diep →',
      testimonial: {
        quote:
          'Ik dacht dat ik gewoon pech had in de liefde. Dit programma liet me zien dat ik steeds dezelfde fout maakte — en hoe ik dat kon doorbreken.',
        name: 'Lisa',
        age: 32,
      },
    },
  },

  // =========================================================
  // ANXIOUS - "De Toegewijde Zoeker"
  // =========================================================
  anxious: {
    key: 'anxious',
    title: 'De Toegewijde Zoeker',
    subtitle: 'Angstig Gehecht',
    color: '#f59e0b', // Amber

    opening: {
      headline: 'Jouw Dating Patroon: De Toegewijde Zoeker',
      paragraph:
        'Eerst dit: er is niets mis met je. Je hebt een sterk verlangen naar verbinding. Je geeft veel in relaties. Je bent attent, betrokken, en je let op signalen. Dit zijn sterke eigenschappen.',
    },

    nuance: {
      headline: 'Maar hier is de andere kant',
      paragraph:
        'Je brein is geprogrammeerd om afwijzing te zoeken — zelfs waar die niet is. Een laat bericht wordt bewijs dat ze je niet leuk vinden. Stilte wordt een oordeel. En hoe meer je geeft, hoe onzekerder je wordt.',
    },

    patternExplained: {
      headline: 'Wat er bij jou gebeurt',
      paragraph: 'Dit patroon is uitputtend — en het is niet jouw schuld:',
      bullets: [
        'Je analyseert elk bericht, elke reactie, elke stilte',
        'Je past jezelf aan om "leuker" gevonden te worden',
        'Je voelt je pas rustig als je bevestiging krijgt',
        'Maar die rust is tijdelijk — tot de volgende onzekerheid',
        'Je investeert vaak meer dan je terugkrijgt',
      ],
    },

    mainPitfall: {
      headline: 'Je grootste valkuil',
      paragraph:
        'Je trekt mensen aan die je onzekerheid voeden. Avoidant types voelen zich aangetrokken tot jouw energie — maar kunnen je nooit geven wat je nodig hebt. Dit creëert een cyclus die je leegtrekt.',
    },

    concreteTip: {
      headline: 'Wat je vandaag kunt doen',
      tip: 'De volgende keer dat je onrustig wordt omdat iemand niet reageert, stel jezelf deze vraag: "Wat is het bewijs dat ze NIET geïnteresseerd zijn?" Niet wat je voelt. Wat is het feitelijke bewijs? In 90% van de gevallen is er geen bewijs — alleen een gevoel. Leer het verschil herkennen.',
    },

    ctaSection: {
      headline: 'Dit patroon doorbreken',
      paragraph:
        'Ik ga eerlijk tegen je zijn: dit patroon los je niet op met één tip. Het zit diep. Maar in 21 dagen kun je de eerste stappen zetten om het te doorbreken.',
      bullets: [
        'Hoe je het verschil herkent tussen intuïtie en angst',
        'Waarom je aangetrokken bent tot mensen die je onzeker maken',
        'Concrete tools om rust te vinden — zonder afhankelijk te zijn van andermans reactie',
      ],
      buttonText: 'Start de 21-Dagen Kickstart',
      buttonTextSecondary: 'Of ga direct diep →',
      testimonial: {
        quote:
          'Na 3 jaar swipen had ik het opgegeven. Dit programma liet me zien waarom ik steeds dezelfde fout maakte.',
        name: 'Marieke',
        age: 34,
      },
    },
  },

  // =========================================================
  // AVOIDANT - "De Onafhankelijke"
  // =========================================================
  avoidant: {
    key: 'avoidant',
    title: 'De Onafhankelijke',
    subtitle: 'Vermijdend Gehecht',
    color: '#6366f1', // Indigo

    opening: {
      headline: 'Jouw Dating Patroon: De Onafhankelijke',
      paragraph:
        'Je waardeert je vrijheid. Je hebt jezelf niet nodig om gelukkig te zijn — je hebt een rijk leven, interesses, een identiteit los van relaties. Dit is een kracht. Veel mensen verliezen zichzelf in relaties; jij niet.',
    },

    nuance: {
      headline: 'Maar hier is wat ik zie',
      paragraph:
        'Na 10 jaar coaching zie ik het patroon: ergens heb je geleerd dat afhankelijkheid gevaarlijk is. Dat kwetsbaarheid leidt tot pijn. Dus houd je afstand — niet omdat je mensen niet leuk vindt, maar omdat dichtbij komen oncomfortabel voelt.',
    },

    patternExplained: {
      headline: 'Wat er bij jou gebeurt',
      paragraph:
        'Dit beschermt je. Maar het houdt ook echte connectie buiten de deur:',
      bullets: [
        'Dates gaan goed tot het "serieus" wordt — dan trek je je terug',
        'Je vindt steeds redenen waarom iemand "toch niet de juiste" is',
        'Mensen vertellen je dat je "moeilijk te lezen" bent',
        'Je voelt je opgesloten zodra iemand te veel van je wil',
        'Interesse verdwijnt zodra iemand beschikbaar is',
      ],
    },

    mainPitfall: {
      headline: 'Je grootste valkuil',
      paragraph:
        'Je raakt geïnteresseerd in mensen die onbereikbaar zijn — omdat die veilig voelen. Maar zodra iemand beschikbaar is, verdwijnt de interesse. Dit is geen toeval; het is het patroon.',
    },

    concreteTip: {
      headline: 'Wat je kunt proberen',
      tip: 'De volgende keer dat je de neiging voelt om afstand te nemen, doe het omgekeerde: deel één ding dat je normaal voor jezelf houdt. Het hoeft niet diep te zijn. Gewoon iets echts. Observeer wat er gebeurt — zowel bij de ander als bij jezelf.',
    },

    ctaSection: {
      headline: 'De muur verlagen (zonder jezelf te verliezen)',
      paragraph:
        'Ik ga je niet vertellen dat je moet veranderen wie je bent. Je onafhankelijkheid is waardevol. Maar in 21 dagen kun je kleine stappen zetten — op jouw tempo.',
      bullets: [
        'Hoe je verbinding kunt maken zonder jezelf te verliezen',
        'Kleine, concrete stappen richting kwetsbaarheid',
        'Op jouw tempo, zonder druk',
      ],
      buttonText: 'Start de 21-Dagen Kickstart',
      buttonTextSecondary: 'Of ga direct diep →',
      testimonial: {
        quote:
          'Ik dacht dat ik gewoon niet gemaakt was voor relaties. Dit programma liet me zien dat ik mezelf beschermde tegen iets dat ik eigenlijk wilde.',
        name: 'Thomas',
        age: 36,
      },
    },
  },

  // =========================================================
  // FEARFUL_AVOIDANT - "De Paradox"
  // =========================================================
  fearful_avoidant: {
    key: 'fearful_avoidant',
    title: 'De Paradox',
    subtitle: 'Angstig-Vermijdend Gehecht',
    color: '#ef4444', // Red

    opening: {
      headline: 'Jouw Dating Patroon: De Paradox',
      paragraph:
        'Dit is misschien het lastigste patroon om mee te leven. Je wilt verbinding. Echt. Je verlangt naar intimiteit, naar iemand die je begrijpt, naar een relatie die voelt als thuiskomen. Maar zodra het dichtbij komt, schiet er iets in je brein aan dat zegt: gevaar.',
    },

    nuance: {
      headline: 'De innerlijke strijd',
      paragraph:
        'In de psychologie noemen we dit "fearful-avoidant" of "disorganized attachment." Het ontstaat vaak wanneer de mensen die veiligheid moesten bieden, ook de bron van onzekerheid waren. Je brein leerde: verbinding = risico. De goede nieuws? Dit is het meest veranderbare patroon. Juist omdat het aangeleerd is.',
    },

    patternExplained: {
      headline: 'Wat je misschien herkent',
      paragraph: 'Dit voelt als een constante innerlijke strijd:',
      bullets: [
        'Je begint enthousiast, maar saboteert het zodra het serieus wordt',
        'Je wisselt tussen "ik wil dit zo graag" en "ik moet hier weg"',
        'Partners noemen je soms "hot and cold" of onvoorspelbaar',
        'Je bent bang voor afwijzing, maar ook bang voor intimiteit',
        'Push-pull dynamiek in bijna elke dating situatie',
      ],
    },

    mainPitfall: {
      headline: 'Je grootste valkuil',
      paragraph:
        'Je saboteert goede kansen voordat ze kunnen mislukken. Je brein probeert je te beschermen tegen de pijn die het verwacht — maar creëert daarmee precies de uitkomst waar je bang voor bent.',
    },

    concreteTip: {
      headline: 'Een eerste stap',
      tip: 'Let de komende week op het moment dat je wilt terugtrekken van iemand. Vraag jezelf niet "waarom doe ik dit?" — dat weet je waarschijnlijk niet. Vraag jezelf: "Waar in mijn lichaam voel ik dit?" Het begint met het opmerken van het patroon, niet met het direct veranderen ervan.',
    },

    ctaSection: {
      headline: 'Dit vraagt om begeleiding',
      paragraph:
        'Ik ga eerlijk zijn: van de vier patronen is dit degene die baat heeft bij structuur. Je hebt een externe spiegel nodig. Start met 21 dagen om het patroon te leren herkennen.',
      bullets: [
        'Dagelijkse begeleiding die je helpt het patroon te herkennen',
        'AI-coach voor de momenten dat het lastig wordt',
        'Kleine stappen die grote verandering brengen',
      ],
      buttonText: 'Start de 21-Dagen Kickstart',
      buttonTextSecondary: 'Of ga direct diep →',
      testimonial: {
        quote:
          'Ik dacht dat ik gewoon "moeilijk" was. Dit programma liet me zien dat het een patroon was — en dat patronen te doorbreken zijn.',
        name: 'Nina',
        age: 29,
      },
    },
  },
};

/**
 * Get result configuration for a specific pattern
 */
export function getPatternResult(pattern: AttachmentPattern): PatternResultConfig {
  return PATTERN_RESULTS[pattern];
}

/**
 * Get all pattern results for comparison/display
 */
export function getAllPatternResults(): PatternResultConfig[] {
  return Object.values(PATTERN_RESULTS);
}
