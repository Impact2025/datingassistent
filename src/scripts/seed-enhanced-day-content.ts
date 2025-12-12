/**
 * Seed Enhanced Day Content - Wereldklasse Kickstart Content
 *
 * Dit script voegt enhanced content toe voor Dag 1-7:
 * - Focus statements (wat is de kern van deze dag?)
 * - Why this matters (waarom is dit belangrijk?)
 * - Time estimates (realistische verwachtingen)
 * - Context per activiteit (waarom video/quiz/reflectie/werkboek doen?)
 *
 * Run: npx tsx src/scripts/seed-enhanced-day-content.ts
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

interface DayEnhancement {
  dag_nummer: number;
  focus_statement: string;
  why_this_matters: string;
  estimated_time_minutes: number;
  video_context?: string;
  quiz_context?: string;
  reflectie_context?: string;
  werkboek_context?: string;
}

const enhancedContent: DayEnhancement[] = [
  {
    dag_nummer: 1,
    focus_statement: "Ontdek wat er nu niet werkt in je profiel",
    why_this_matters: "Je kunt niet verbeteren wat je niet meet. Deze audit laat zien waar je grootste kansen liggen en voorkomt dat je weken verspilt aan de verkeerde dingen.",
    estimated_time_minutes: 18,
    video_context: "In 15 minuten zie je de 3 grootste fouten die 78% van de mannen maakt - en of jij ze ook maakt. Dit voorkomt maanden trial & error.",
    quiz_context: "Check of je de kritieke punten snapt. Deze 3 minuten bepalen of je profiel straks 10x beter wordt of nog steeds onzichtbaar blijft.",
    reflectie_context: "Eerlijkheid is de basis van groei. Door dit op te schrijven creëer je bewustzijn - en dat is waar transformatie begint.",
    werkboek_context: "BONUS: Diep in je huidige situatie met een concrete audit checklist. Doe dit als je echt alles eruit wilt halen."
  },
  {
    dag_nummer: 2,
    focus_statement: "Begrijp waarom sommige foto's 10x meer swipes krijgen",
    why_this_matters: "Foto's bepalen 80% van je matches. Als je de psychologie erachter snapt, kun je bewust kiezen welke foto's werken in plaats van gokken.",
    estimated_time_minutes: 15,
    video_context: "De wetenschap achter aantrekkelijke foto's in 12 minuten. Je leert het halo-effect kennen en de 4 foto types die nooit falen.",
    reflectie_context: "Identificeer je grootste gap. Mis je lifestyle foto's? Social proof? Deze 5 minuten bepalen waar je focus moet liggen.",
    werkboek_context: "BONUS: Plan je fotoshoot strategisch met een stap-voor-stap framework."
  },
  {
    dag_nummer: 3,
    focus_statement: "Laat AI je foto's beoordelen voordat vrouwen dat doen",
    why_this_matters: "Je krijgt maar één kans voor een eerste indruk. AI geeft je objectieve feedback op compositie, verlichting en expressie - zonder oordeel.",
    estimated_time_minutes: 20,
    video_context: "Leer de AI Foto Check tool gebruiken. In 15 minuten weet je precies welke foto's je moet verbeteren en welke al goed zijn.",
    quiz_context: "Test of je weet wat een goede score is. Deze 3 minuten voorkomen dat je slechte foto's gebruikt die je matches kosten.",
    reflectie_context: "AANBEVOLEN: Schrijf op wat je learned van de AI feedback. Dit helpt je patronen zien en bewuste keuzes maken.",
    werkboek_context: "BONUS: Maak een actieplan voor je foto verbetering met concrete next steps."
  },
  {
    dag_nummer: 4,
    focus_statement: "Maak zelf geweldige foto's met alleen je smartphone",
    why_this_matters: "Je hebt geen dure fotograaf nodig. Met de juiste technieken maak je vandaag al foto's die beter zijn dan 90% van de profielen.",
    estimated_time_minutes: 15,
    video_context: "10 minuten die je fotografie skills transformeren. Leer verlichting, hoeken en compositie - vaardigheden die je altijd zult gebruiken.",
    reflectie_context: "AANBEVOLEN: Reflecteer op je foto angsten. Wat houdt je tegen? Deze awareness is de eerste stap naar betere foto's.",
    werkboek_context: "Dit is de gouden checklist! Volg deze stappen en je hebt vanavond al 5 nieuwe foto's die werken. Doe deze oefening!"
  },
  {
    dag_nummer: 5,
    focus_statement: "Selecteer en rangschik je beste foto's strategisch",
    why_this_matters: "Volgorde is cruciaal. De verkeerde volgorde kan je matches halveren, zelfs met goede foto's. Vandaag maak je de optimale selectie.",
    estimated_time_minutes: 17,
    video_context: "12 minuten over de psychologie van volgorde. Waarom hoofdfoto → lifestyle → hobby → social de perfecte flow is.",
    reflectie_context: "AANBEVOLEN: Check je gevoel over je nieuwe selectie. Als je zelf enthousiast bent, voelen anderen dat ook.",
    werkboek_context: "BONUS: Finaliseer je foto strategie met een complete volgorde-checklist."
  },
  {
    dag_nummer: 6,
    focus_statement: "Creëer nieuwe content in echte situaties",
    why_this_matters: "Authentieke lifestyle foto's ontstaan niet thuis voor de spiegel. Dit weekend is dé kans om foto's te maken die jouw leven echt laten zien.",
    estimated_time_minutes: 60,
    video_context: "Korte briefing (10 min) met concrete locatie ideeën en shots die je moet maken. Je weet precies wat te doen dit weekend.",
    reflectie_context: "AANBEVOLEN: Schrijf je plan voor dit weekend. Waar ga je heen? Met wie? Commitment verhoogt de kans dat je het doet met 3x.",
    werkboek_context: "DIT IS KEY! Plan je 3 locaties en vraag een vriend. Met dit werkboek maak je 30+ foto's waar je jaren plezier van hebt."
  },
  {
    dag_nummer: 7,
    focus_statement: "Review je transformatie en vier je eerste week",
    why_this_matters: "Je bent van 'geen idee' naar 'ik weet wat werkt' gegaan in 7 dagen. Deze review consolideert je learnings en bouwt momentum voor week 2.",
    estimated_time_minutes: 18,
    video_context: "15 minuten celebration! Zie je before/after, vier je wins en krijg een sneak peek van week 2 (bio perfection).",
    quiz_context: "Final check: snap je de basics? Deze 3 minuten zorgen dat je week 1 wijsheid nooit vergeet.",
    reflectie_context: "DIT IS BELANGRIJK! Je grootste 'aha moment' opschrijven helpt je brein het te onthouden. Plus, over 3 weken lees je dit terug en zie je hoeveel je gegroeid bent.",
    werkboek_context: "BONUS: Complete foto audit voor/na vergelijking. Perfect om je progressie visueel te maken."
  }
];

async function seed() {
  console.log('🌱 Seeding enhanced content voor Dag 1-7...\n');

  try {
    // Get Kickstart program ID
    const programCheck = await sql`
      SELECT id FROM programs WHERE slug = 'kickstart' LIMIT 1
    `;

    if (programCheck.rows.length === 0) {
      console.log('❌ Kickstart program niet gevonden!');
      process.exit(1);
    }

    const programId = programCheck.rows[0].id;
    console.log(`✅ Kickstart program gevonden (ID: ${programId})\n`);

    // Update each day with enhanced content
    for (const day of enhancedContent) {
      await sql`
        UPDATE program_days
        SET
          focus_statement = ${day.focus_statement},
          why_this_matters = ${day.why_this_matters},
          estimated_time_minutes = ${day.estimated_time_minutes},
          video_context = ${day.video_context || null},
          quiz_context = ${day.quiz_context || null},
          reflectie_context = ${day.reflectie_context || null},
          werkboek_context = ${day.werkboek_context || null}
        WHERE program_id = ${programId} AND dag_nummer = ${day.dag_nummer}
      `;

      console.log(`  ✓ Dag ${day.dag_nummer}: "${day.focus_statement}"`);
      console.log(`    Tijd: ${day.estimated_time_minutes} min`);
      console.log(`    Context: Video ${day.video_context ? '✓' : '○'} | Quiz ${day.quiz_context ? '✓' : '○'} | Reflectie ${day.reflectie_context ? '✓' : '○'} | Werkboek ${day.werkboek_context ? '✓' : '○'}`);
      console.log('');
    }

    // Verify
    const updated = await sql`
      SELECT dag_nummer, titel, focus_statement, estimated_time_minutes
      FROM program_days
      WHERE program_id = ${programId} AND dag_nummer BETWEEN 1 AND 7
      ORDER BY dag_nummer
    `;

    console.log('\n📊 Verificatie:');
    console.log('Dag | Titel                      | Focus                                      | Tijd');
    console.log('────┼────────────────────────────┼────────────────────────────────────────────┼──────');
    updated.rows.forEach((row: any) => {
      const dagStr = String(row.dag_nummer).padStart(2, ' ');
      const titleStr = String(row.titel).padEnd(25, ' ');
      const focusStr = String(row.focus_statement || 'N/A').substring(0, 40).padEnd(40, ' ');
      const timeStr = String(row.estimated_time_minutes) + ' min';
      console.log(`${dagStr}  | ${titleStr} | ${focusStr} | ${timeStr}`);
    });

    console.log('\n✅ Seed completed!');
    console.log('\n📌 Next: Update DayViewer component om deze content te tonen');

  } catch (error) {
    console.error('\n❌ Seed mislukt:', error);
    process.exit(1);
  }
}

// Run seed
seed().then(() => {
  process.exit(0);
});
