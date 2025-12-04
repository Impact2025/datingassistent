/**
 * Kickstart Upgrade: Nieuwe Transformationele Reflectievragen
 *
 * Dit script upgradet alle reflectievragen van oppervlakkig naar diep (Pilarczyk-stijl)
 *
 * Run: npx tsx src/scripts/upgrade-kickstart-reflecties.ts
 */

import { sql } from '@vercel/postgres';

interface ReflectieVraag {
  type: 'spiegel' | 'identiteit' | 'actie';
  vraag: string;
  doel: string;
}

interface DagReflectie {
  dag_nummer: number;
  vragen: ReflectieVraag[];
}

const nieuweReflecties: DagReflectie[] = [
  // WEEK 1: IDENTITEIT DOOR BEELD
  {
    dag_nummer: 1,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Als een vreemde jouw profiel zou zien, welk verhaal vertelt het over wie jij bent? Niet wat je WILT dat ze zien - wat zien ze ECHT?',
        doel: 'Confrontatie met huidige realiteit'
      },
      {
        type: 'identiteit',
        vraag: 'Welke versie van jezelf wil je dat je profiel uitstraalt? Beschrijf die persoon in 3 woorden.',
        doel: 'Gewenste identiteit definiëren'
      },
      {
        type: 'actie',
        vraag: 'Welke ÉÉN foto in je profiel past niet bij die versie van jezelf? Die gaat eruit.',
        doel: 'Concrete actie koppelen aan inzicht'
      }
    ]
  },
  {
    dag_nummer: 2,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Kijk naar je huidige profielfoto. Wat zie je in je eigen ogen? Zelfvertrouwen? Onzekerheid? Proberen te pleasen?',
        doel: 'Zelfreflectie op non-verbale communicatie'
      },
      {
        type: 'identiteit',
        vraag: 'Een foto is een bevroren moment van wie je bent. Welk moment van JOU zou je willen bevriezen?',
        doel: 'Authentieke zelfexpressie vinden'
      },
      {
        type: 'actie',
        vraag: 'Scroll door je camera roll. Vind één foto waar je ECHT jezelf bent - niet poseert, niet probeert. Dat is je vertrekpunt.',
        doel: 'Authentiek startpunt identificeren'
      }
    ]
  },
  {
    dag_nummer: 3,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Hoe voelde het om je foto\'s beoordeeld te zien door AI? Herken je jezelf in die scores?',
        doel: 'Omgaan met externe feedback'
      },
      {
        type: 'identiteit',
        vraag: 'Een score is feedback, geen oordeel over je waarde. Hoe reageer jij normaal op feedback? Defensief of nieuwsgierig?',
        doel: 'Zelfkennis over feedback-patronen'
      },
      {
        type: 'actie',
        vraag: 'Neem de foto met de laagste score. In plaats van hem te verwijderen - wat zou je kunnen LEREN van waarom hij niet werkt?',
        doel: 'Feedback omzetten naar groei'
      }
    ]
  },
  {
    dag_nummer: 4,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Waarom vind je het moeilijk (of makkelijk) om foto\'s van jezelf te maken? Wat zegt dat over hoe je naar jezelf kijkt?',
        doel: 'Zelfbeeld onderzoeken'
      },
      {
        type: 'identiteit',
        vraag: 'De camera vangt niet hoe je ERUITZIET, maar hoe je je VOELT. Hoe wil je je voelen op je volgende foto?',
        doel: 'Energie boven esthetiek'
      },
      {
        type: 'actie',
        vraag: 'Voordat je morgen foto\'s maakt: schrijf op hoe de beste versie van jezelf zich zou voelen. Neem dat gevoel mee.',
        doel: 'Intentie setting voor actie'
      }
    ]
  },
  {
    dag_nummer: 5,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Je hebt nu foto\'s gekozen. Kijk ernaar alsof je ze voor het eerst ziet. Welk verhaal vertellen ze samen?',
        doel: 'Profiel als geheel zien'
      },
      {
        type: 'identiteit',
        vraag: 'Elke foto in je profiel is een uitnodiging. Waar nodig je mensen voor uit? Avontuur? Rust? Diepgang? Plezier?',
        doel: 'Bewuste communicatie'
      },
      {
        type: 'actie',
        vraag: 'Als je profiel een trailer was voor de film van jouw leven - mist er dan nog een scene?',
        doel: 'Gaps identificeren'
      }
    ]
  },
  {
    dag_nummer: 6,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Wat houdt je tegen om dit weekend echt aan de slag te gaan? Perfectionism? Schaamte? \'Geen tijd\'?',
        doel: 'Weerstand identificeren'
      },
      {
        type: 'identiteit',
        vraag: 'De man die foto\'s durft te maken van zichzelf is dezelfde man die durft te daten. Welke versie wil je zijn?',
        doel: 'Moed koppelen aan identiteit'
      },
      {
        type: 'actie',
        vraag: 'Stuur nu een appje naar iemand om te helpen met foto\'s. Het ongemak dat je voelt is precies waar de groei zit.',
        doel: 'Directe actie ondanks ongemak'
      }
    ]
  },
  {
    dag_nummer: 7,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Vergelijk je profiel van dag 1 met nu. Wat is er veranderd aan de BUITENKANT? En wat aan de BINNENKANT?',
        doel: 'Interne vs externe groei erkennen'
      },
      {
        type: 'identiteit',
        vraag: 'Je hebt deze week niet alleen foto\'s verbeterd. Je hebt geoefend om jezelf te zien. Wat heb je ontdekt?',
        doel: 'Diepere learning articuleren'
      },
      {
        type: 'actie',
        vraag: 'Schrijf één zin op die je tegen jezelf zou zeggen aan het begin van deze week. Wat had je moeten weten?',
        doel: 'Wijsheid consolideren'
      }
    ]
  },

  // WEEK 2: IDENTITEIT DOOR WOORDEN
  {
    dag_nummer: 8,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Lees je huidige bio hardop. Klinkt het als JIJ of als iemand die probeert indruk te maken?',
        doel: 'Authenticiteit check'
      },
      {
        type: 'identiteit',
        vraag: 'Als je bio een eerste date was - zou je met die persoon willen praten? Waarom wel/niet?',
        doel: 'Perspectief wisseling'
      },
      {
        type: 'actie',
        vraag: 'Schrijf je bio alsof je het tegen je beste vriend vertelt. Geen filter. Dat is je startpunt.',
        doel: 'Authenticiteit als basis'
      }
    ]
  },
  {
    dag_nummer: 9,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'De AI gaf je suggesties. Welke voelden als \'ja, dat ben ik\' en welke als \'dat is niet echt ik\'?',
        doel: 'Onderscheid maken tussen hulp en jezelf'
      },
      {
        type: 'identiteit',
        vraag: 'Een goede bio is niet wat je DOET, maar wie je BENT. Wat maakt jou JOU, los van je baan of hobby\'s?',
        doel: 'Kern-identiteit vinden'
      },
      {
        type: 'actie',
        vraag: 'Neem één AI-suggestie en maak hem MEER jou. Voeg een specifiek verhaal of detail toe dat alleen jij zou kunnen schrijven.',
        doel: 'AI als startpunt, niet eindpunt'
      }
    ]
  },
  {
    dag_nummer: 10,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Hoe open JIJ normaal gesprekken in het echte leven? Is dat anders dan online? Waarom?',
        doel: 'Online vs offline consistentie'
      },
      {
        type: 'identiteit',
        vraag: 'Je eerste zin is een belofte. Welke belofte wil jij maken? Entertainment? Diepgang? Avontuur?',
        doel: 'Intentie achter communicatie'
      },
      {
        type: 'actie',
        vraag: 'Schrijf een opener die je alleen zou sturen naar iemand waar je ECHT geïnteresseerd in bent. Dat is je standaard.',
        doel: 'Standaard verhogen'
      }
    ]
  },
  {
    dag_nummer: 11,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Op welk platform voel je je het meest jezelf? Waarom denk je dat dat zo is?',
        doel: 'Platform-fit begrijpen'
      },
      {
        type: 'identiteit',
        vraag: 'Elk platform trekt een ander type connectie aan. Welk type connectie zoek JIJ echt?',
        doel: 'Helder krijgen wat je zoekt'
      },
      {
        type: 'actie',
        vraag: 'Kies één platform om deze week je \'main\' te maken. Focus slaat versnippering.',
        doel: 'Focus als strategie'
      }
    ]
  },
  {
    dag_nummer: 12,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Welke prompt-vragen vermijd je? Vaak vermijden we vragen waar we onzeker over zijn.',
        doel: 'Vermijding als signaal'
      },
      {
        type: 'identiteit',
        vraag: 'Je antwoorden zijn geen CV. Het zijn uitnodigingen tot gesprek. Welke gesprekken wil je hebben?',
        doel: 'Van presentatie naar connectie'
      },
      {
        type: 'actie',
        vraag: 'Beantwoord één prompt die je normaal zou skippen. Het ongemak betekent dat het ertoe doet.',
        doel: 'Ongemak als kompas'
      }
    ]
  },
  {
    dag_nummer: 13,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Welke vraag durf je eigenlijk niet te stellen? Die is waarschijnlijk de belangrijkste.',
        doel: 'Verborgen vragen identificeren'
      },
      {
        type: 'identiteit',
        vraag: 'Hulp vragen is geen zwakte - het is weten dat je groei belangrijker is dan je ego.',
        doel: 'Ego vs groei'
      },
      {
        type: 'actie',
        vraag: 'Stel minimaal één vraag die je spannend vindt. Dat is waar de doorbraak zit.',
        doel: 'Actie ondanks spanning'
      }
    ]
  },
  {
    dag_nummer: 14,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Je profiel is nu compleet. Als je date dit zou lezen - zou je trots zijn op hoe je jezelf presenteert?',
        doel: 'Trots als maatstaf'
      },
      {
        type: 'identiteit',
        vraag: 'In twee weken heb je geleerd jezelf in beeld en woord te presenteren. Wie is de persoon die je hebt gecreëerd?',
        doel: 'Identiteit articuleren'
      },
      {
        type: 'actie',
        vraag: 'Screenshot je profiel nu. Over een maand kijk je terug. Schrijf op wat je hoopt dat er dan anders is in je leven.',
        doel: 'Toekomst intentie setting'
      }
    ]
  },

  // WEEK 3: IDENTITEIT DOOR CONNECTIE
  {
    dag_nummer: 15,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Denk aan je laatste gesprek dat doodliep. Wees eerlijk - probeerde je indruk te maken of was je echt nieuwsgierig?',
        doel: 'Eerlijkheid over eigen gedrag'
      },
      {
        type: 'identiteit',
        vraag: 'De manier waarop je gesprekken voert is een spiegel van hoe je relaties aangaat. Wat zie je?',
        doel: 'Patronen herkennen'
      },
      {
        type: 'actie',
        vraag: 'In je volgende gesprek: stel één vraag puur uit nieuwsgierigheid, niet om het gesprek gaande te houden.',
        doel: 'Echte nieuwsgierigheid oefenen'
      }
    ]
  },
  {
    dag_nummer: 16,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Waarom vind je het eerste bericht zo spannend? Wat ben je bang om te verliezen?',
        doel: 'Angst onderzoeken'
      },
      {
        type: 'identiteit',
        vraag: 'Een opener is geen test die je moet halen. Het is een uitnodiging die je doet. Welke uitnodiging past bij jou?',
        doel: 'Van test naar uitnodiging'
      },
      {
        type: 'actie',
        vraag: 'Stuur vandaag drie openers waar je NIET zeker van bent. Het gaat niet om het resultaat, maar om de moed.',
        doel: 'Moed boven zekerheid'
      }
    ]
  },
  {
    dag_nummer: 17,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Val jij in de \'interviewer\' rol in gesprekken? Waarom denk je dat dat zo is?',
        doel: 'Gespreksdynamiek begrijpen'
      },
      {
        type: 'identiteit',
        vraag: 'Een goed gesprek is geen prestatie. Het is twee mensen die samen iets ontdekken. Wat wil JIJ ontdekken?',
        doel: 'Van presteren naar ontdekken'
      },
      {
        type: 'actie',
        vraag: 'In je volgende gesprek: deel iets persoonlijks VOORDAT je een vraag stelt. Observeer wat er gebeurt.',
        doel: 'Kwetsbaarheid oefenen'
      }
    ]
  },
  {
    dag_nummer: 18,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Wat houdt je tegen om sneller naar een date te vragen? Angst voor afwijzing? Of iets anders?',
        doel: 'Blokkades identificeren'
      },
      {
        type: 'identiteit',
        vraag: 'De man die durft te vragen is de man die krijgt wat hij wil. Welke man wil je zijn?',
        doel: 'Identiteit koppelen aan actie'
      },
      {
        type: 'actie',
        vraag: 'Als er nu iemand is waar je mee chat: vraag vandaag om een date. Het antwoord is minder belangrijk dan de daad.',
        doel: 'Directe actie'
      }
    ]
  },
  {
    dag_nummer: 19,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Welk gesprek vind je het moeilijkst om te delen? Dat is waarschijnlijk waar je het meest van kunt leren.',
        doel: 'Schaamte als kompas'
      },
      {
        type: 'identiteit',
        vraag: 'Kwetsbaarheid is geen zwakte. Het is de toegangspoort tot echte connectie. Kun je dat ook in je gesprekken toelaten?',
        doel: 'Kwetsbaarheid herdefiniëren'
      },
      {
        type: 'actie',
        vraag: 'Vraag feedback op het gesprek waar je het minst trots op bent. Daar zit de groei.',
        doel: 'Feedback zoeken op zwakke plek'
      }
    ]
  },
  {
    dag_nummer: 20,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Hoe heeft afwijzing je dating gedrag gevormd? Welke muren heb je opgebouwd?',
        doel: 'Impact van afwijzing erkennen'
      },
      {
        type: 'identiteit',
        vraag: 'Afwijzing is geen oordeel over je waarde. Het is informatie over compatibility. Kun je dat VOELEN, niet alleen weten?',
        doel: 'Reframing internaliseren'
      },
      {
        type: 'actie',
        vraag: 'Denk aan een recente afwijzing. Schrijf drie dingen op die je ervan hebt GELEERD, niet drie redenen om jezelf te bekritiseren.',
        doel: 'Van zelfkritiek naar leren'
      }
    ]
  },
  {
    dag_nummer: 21,
    vragen: [
      {
        type: 'spiegel',
        vraag: 'Wie was je 21 dagen geleden? Wie ben je nu? Wat is het grootste verschil?',
        doel: 'Transformatie erkennen'
      },
      {
        type: 'identiteit',
        vraag: 'Je hebt niet alleen dating skills geleerd. Je hebt geoefend in jezelf zien, jezelf uiten, en connectie maken. Wie ben je geworden?',
        doel: 'Diepere groei articuleren'
      },
      {
        type: 'actie',
        vraag: 'Schrijf een brief aan jezelf over 3 maanden. Wat hoop je dat er veranderd is? Dit is je kompas.',
        doel: 'Toekomst intentie vastleggen'
      }
    ]
  }
];

async function upgradeReflecties() {
  console.log('🚀 Starting Kickstart Reflecties Upgrade...\n');
  console.log('📝 Upgrading from surface-level to transformational questions\n');

  try {
    // Get Kickstart program ID
    const programResult = await sql`
      SELECT id FROM programs WHERE slug = 'kickstart' LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      console.log('❌ Kickstart program niet gevonden!');
      process.exit(1);
    }

    const programId = programResult.rows[0].id;
    console.log(`✅ Kickstart program gevonden (ID: ${programId})\n`);

    // Update each day's reflecties
    let successCount = 0;
    let errorCount = 0;

    for (const dagReflectie of nieuweReflecties) {
      try {
        const result = await sql`
          UPDATE program_days
          SET
            reflectie = ${JSON.stringify({ vragen: dagReflectie.vragen })}::jsonb,
            updated_at = NOW()
          WHERE program_id = ${programId}
            AND dag_nummer = ${dagReflectie.dag_nummer}
          RETURNING dag_nummer, titel
        `;

        if (result.rows.length > 0) {
          console.log(`  ✓ Dag ${result.rows[0].dag_nummer}: ${result.rows[0].titel}`);
          console.log(`    → ${dagReflectie.vragen.length} nieuwe transformationele vragen`);
          successCount++;
        } else {
          console.log(`  ⚠️ Dag ${dagReflectie.dag_nummer}: Niet gevonden in database`);
          errorCount++;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log(`  ❌ Dag ${dagReflectie.dag_nummer}: Error - ${errorMessage.substring(0, 50)}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 UPGRADE RESULTAAT');
    console.log('='.repeat(50));
    console.log(`  ✅ Succesvol: ${successCount} dagen`);
    console.log(`  ❌ Errors: ${errorCount} dagen`);
    console.log(`  📝 Totaal: ${nieuweReflecties.length} dagen`);

    if (successCount === nieuweReflecties.length) {
      console.log('\n🎉 ALLE REFLECTIES SUCCESVOL GEUPGRADED!');
      console.log('\n📌 What changed:');
      console.log('   • Elke dag heeft nu 3 diepere vragen:');
      console.log('     1. SPIEGEL - Confronteert met huidige situatie');
      console.log('     2. IDENTITEIT - Wie wil je zijn?');
      console.log('     3. ACTIE - Concrete volgende stap');
      console.log('\n🔗 Test: http://localhost:9000/kickstart/dag/1');
    } else {
      console.log('\n⚠️ Sommige dagen konden niet worden geupgraded.');
      console.log('   Check of alle 21 dagen in de database staan.');
    }

  } catch (error) {
    console.error('\n❌ Upgrade mislukt:', error);
    process.exit(1);
  }
}

// Run upgrade
upgradeReflecties().then(() => {
  process.exit(0);
});
