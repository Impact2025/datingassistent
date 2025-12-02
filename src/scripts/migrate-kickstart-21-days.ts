/**
 * Migratie Script: Kickstart 21-dagen structuur
 *
 * Dit script:
 * 1. Maakt de nieuwe tabellen aan (program_weeks, program_days, user_day_progress, etc.)
 * 2. Seed alle 21 dagen content
 *
 * Run: npx tsx src/scripts/migrate-kickstart-21-days.ts
 */

import { sql } from '@vercel/postgres';

async function migrate() {
  console.log('🚀 Starting Kickstart 21-dagen migration...\n');

  try {
    // Check if Kickstart program exists
    const programCheck = await sql`
      SELECT id, name FROM programs WHERE slug = 'kickstart' LIMIT 1
    `;

    if (programCheck.rows.length === 0) {
      console.log('❌ Kickstart program niet gevonden!');
      console.log('   Run eerst: database-setup-programs.sql');
      process.exit(1);
    }

    const programId = programCheck.rows[0].id;
    console.log(`✅ Kickstart program gevonden (ID: ${programId})`);

    // Step 1: Create tables
    console.log('\n📊 Stap 1: Tabellen aanmaken...');

    // Drop existing tables first (cascade)
    try {
      await sql`DROP TABLE IF EXISTS user_weekly_metrics CASCADE`;
      await sql`DROP TABLE IF EXISTS user_day_progress CASCADE`;
      await sql`DROP TABLE IF EXISTS program_days CASCADE`;
      await sql`DROP TABLE IF EXISTS program_weeks CASCADE`;
      console.log('  ✓ Oude tabellen verwijderd');
    } catch (err: any) {
      console.log('  ⚠️ Drop tables warning:', err.message?.substring(0, 50));
    }

    // Create program_weeks table
    await sql`
      CREATE TABLE program_weeks (
        id SERIAL PRIMARY KEY,
        program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        week_nummer INTEGER NOT NULL,
        titel VARCHAR(255) NOT NULL,
        thema TEXT NOT NULL,
        kpi TEXT NOT NULL,
        emoji VARCHAR(10),
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(program_id, week_nummer)
      )
    `;
    console.log('  ✓ program_weeks tabel aangemaakt');

    // Create program_days table
    await sql`
      CREATE TABLE program_days (
        id SERIAL PRIMARY KEY,
        week_id INTEGER NOT NULL REFERENCES program_weeks(id) ON DELETE CASCADE,
        program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        dag_nummer INTEGER NOT NULL,
        titel VARCHAR(255) NOT NULL,
        emoji VARCHAR(10),
        dag_type VARCHAR(20) NOT NULL CHECK (dag_type IN ('VIDEO', 'LIVE', 'EXERCISE', 'REVIEW')),
        duur_minuten INTEGER NOT NULL,
        ai_tool VARCHAR(100),
        ai_tool_slug VARCHAR(100),
        video_url VARCHAR(500),
        video_thumbnail VARCHAR(500),
        video_script JSONB,
        quiz JSONB,
        reflectie JSONB,
        werkboek JSONB,
        upsell JSONB,
        unlock_na_dag INTEGER,
        is_preview BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT true,
        display_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(program_id, dag_nummer)
      )
    `;
    console.log('  ✓ program_days tabel aangemaakt');

    // Create user_day_progress table
    await sql`
      CREATE TABLE user_day_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        day_id INTEGER NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        video_watched_seconds INTEGER DEFAULT 0,
        video_completed BOOLEAN DEFAULT false,
        quiz_completed BOOLEAN DEFAULT false,
        quiz_score INTEGER,
        quiz_answers JSONB,
        reflectie_completed BOOLEAN DEFAULT false,
        reflectie_antwoord TEXT,
        werkboek_completed BOOLEAN DEFAULT false,
        werkboek_antwoorden JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, day_id)
      )
    `;
    console.log('  ✓ user_day_progress tabel aangemaakt');

    // Create user_weekly_metrics table
    await sql`
      CREATE TABLE user_weekly_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        week_nummer INTEGER NOT NULL,
        matches_count INTEGER,
        gesprekken_count INTEGER,
        dates_count INTEGER,
        foto_score INTEGER,
        bio_score INTEGER,
        notities TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, program_id, week_nummer)
      )
    `;
    console.log('  ✓ user_weekly_metrics tabel aangemaakt');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_program_weeks_program_id ON program_weeks(program_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_program_days_week_id ON program_days(week_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_program_days_program_id ON program_days(program_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_program_days_dag_nummer ON program_days(dag_nummer)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_day_progress_user_id ON user_day_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_day_progress_day_id ON user_day_progress(day_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_day_progress_status ON user_day_progress(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_weekly_metrics_user_id ON user_weekly_metrics(user_id)`;
    console.log('  ✓ Indexes aangemaakt');

    console.log('✅ Tabellen aangemaakt');

    // Step 2: Seed weeks
    console.log('\n📝 Stap 2: Weken seeden...');

    // Insert Week 1
    const week1 = await sql`
      INSERT INTO program_weeks (program_id, week_nummer, titel, thema, kpi, emoji)
      VALUES (${programId}, 1, 'Fundament & Foto''s', 'Van onzichtbaar naar opvallend', '4-6 goedgekeurde foto''s die werken', '📸')
      RETURNING id
    `;
    console.log('  ✓ Week 1 aangemaakt');

    // Insert Week 2
    const week2 = await sql`
      INSERT INTO program_weeks (program_id, week_nummer, titel, thema, kpi, emoji)
      VALUES (${programId}, 2, 'Bio & Platform', 'Van swipen naar connecties', 'Complete profieltekst + 3 platforms geoptimaliseerd', '✍️')
      RETURNING id
    `;
    console.log('  ✓ Week 2 aangemaakt');

    // Insert Week 3
    const week3 = await sql`
      INSERT INTO program_weeks (program_id, week_nummer, titel, thema, kpi, emoji)
      VALUES (${programId}, 3, 'Gesprekken & Connectie', 'Van match naar date', '3+ nieuwe gesprekken gestart, 1+ date gepland', '💬')
      RETURNING id
    `;
    console.log('  ✓ Week 3 aangemaakt');

    // Step 3: Seed all 21 days
    console.log('\n📅 Stap 3: Dagen seeden...');

    // Week 1 Days (1-7)
    const week1Days = [
      {
        dag_nummer: 1,
        titel: 'De Dating Audit',
        emoji: '🔍',
        dag_type: 'VIDEO',
        duur_minuten: 15,
        video_script: {
          hook: "Wist je dat 78% van de mannen dezelfde 3 fouten maakt op dating apps? Vandaag ontdek je welke jij maakt.",
          intro: "Welkom bij dag 1! We gaan vandaag je huidige profiel helemaal doorlichten.",
          secties: [
            { titel: "De 3 grootste profielfouten", content: "1. Te generieke foto's 2. Saaie bio teksten 3. Verkeerde app keuze" },
            { titel: "Je persoonlijke audit", content: "We gaan nu jouw profiel checken op deze punten..." }
          ],
          opdracht: "Screenshot je huidige profiel en stuur het naar de AI voor analyse",
          outro: "Morgen gaan we aan de slag met de basis van foto's die werken!"
        },
        quiz: {
          vragen: [
            {
              vraag: "Wat is de #1 fout die mannen maken met hun hoofdfoto?",
              opties: [
                { tekst: "Groepsfoto als eerste", correct: false },
                { tekst: "Zonnebril op", correct: true },
                { tekst: "Te ver weg", correct: false }
              ],
              feedback_correct: "Goed! Zonnebrillen verbergen je ogen - het belangrijkste voor connectie.",
              feedback_incorrect: "Bijna! Het juiste antwoord is: zonnebril op. Oogcontact is cruciaal."
            }
          ]
        },
        reflectie: {
          vraag: "Wat denk jij dat de grootste zwakte is van je huidige profiel?",
          doel: "Zelfinzicht creëren"
        },
        werkboek: {
          titel: "Profiel Audit Checklist",
          stappen: [
            "Screenshot je huidige profiel",
            "Tel het aantal foto's",
            "Bekijk of je bio 3 unieke punten heeft",
            "Check of je gespreksstarters hebt"
          ]
        }
      },
      {
        dag_nummer: 2,
        titel: 'De Psychologie van Foto\'s',
        emoji: '🧠',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        video_script: {
          hook: "Er is een reden waarom sommige foto's 10x meer swipes krijgen. Het is geen toeval.",
          intro: "Vandaag duiken we in de wetenschap achter aantrekkelijke foto's.",
          secties: [
            { titel: "Het halo-effect", content: "Hoe één goede foto je hele profiel beïnvloedt..." },
            { titel: "De 4 foto types die werken", content: "Hoofdfoto, lifestyle, hobby, social proof..." }
          ],
          opdracht: "Selecteer 10 foto's uit je telefoon die potentieel hebben",
          outro: "Morgen leer je welke van je foto's het beste werken!"
        },
        reflectie: {
          vraag: "Welk type foto mis je het meest in je huidige profiel?",
          doel: "Gaps identificeren"
        }
      },
      {
        dag_nummer: 3,
        titel: 'AI Foto Check',
        emoji: '🤖',
        dag_type: 'VIDEO',
        duur_minuten: 15,
        ai_tool: 'AI Foto Check',
        ai_tool_slug: 'ai-foto-check',
        video_script: {
          hook: "Laat AI je foto's beoordelen voordat vrouwen dat doen.",
          intro: "Vandaag gebruik je de AI Foto Check tool om je beste foto's te vinden.",
          secties: [
            { titel: "Hoe de tool werkt", content: "De AI analyseert compositie, verlichting, expressie en meer..." },
            { titel: "Je score interpreteren", content: "Wat de scores betekenen en hoe je verbetert..." }
          ],
          opdracht: "Upload minimaal 5 foto's naar de AI Foto Check",
          outro: "Morgen leer je zelf betere foto's maken!"
        },
        quiz: {
          vragen: [
            {
              vraag: "Welke score moet je minimaal hebben voor een hoofdfoto?",
              opties: [
                { tekst: "50+", correct: false },
                { tekst: "70+", correct: true },
                { tekst: "90+", correct: false }
              ],
              feedback_correct: "Correct! Een score van 70+ is goed genoeg voor je profiel.",
              feedback_incorrect: "Niet helemaal. Een score van 70+ is het minimum voor je hoofdfoto."
            }
          ]
        }
      },
      {
        dag_nummer: 4,
        titel: 'De Perfecte Selfie',
        emoji: '📱',
        dag_type: 'VIDEO',
        duur_minuten: 10,
        video_script: {
          hook: "Je smartphone is alles wat je nodig hebt voor dating foto's.",
          intro: "Vandaag leer je de technieken voor geweldige selfies en foto's.",
          secties: [
            { titel: "Verlichting basics", content: "Golden hour, window light, vermijd TL..." },
            { titel: "De beste hoeken", content: "Iets boven ooghoogte, 3/4 profiel..." }
          ],
          opdracht: "Maak 10 nieuwe foto's met de geleerde technieken",
          outro: "Morgen ga je deze foto's laten checken!"
        },
        werkboek: {
          titel: "Foto Shoot Checklist",
          stappen: [
            "Zoek een locatie met goed licht",
            "Kleed je in effen kleuren",
            "Maak 20+ foto's vanuit verschillende hoeken",
            "Selecteer de beste 5"
          ]
        }
      },
      {
        dag_nummer: 5,
        titel: 'Foto Selectie & Upload',
        emoji: '✅',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        ai_tool: 'AI Foto Check',
        ai_tool_slug: 'ai-foto-check',
        video_script: {
          hook: "De juiste volgorde van foto's kan je matches verdubbelen.",
          intro: "Vandaag finaliseren we je fotoselectie.",
          secties: [
            { titel: "De ideale volgorde", content: "Hoofdfoto → Lifestyle → Hobby → Social → Fun" },
            { titel: "Foto's rangschikken", content: "Waarom volgorde er toe doet..." }
          ],
          opdracht: "Upload je nieuwe foto's naar de AI voor finale check",
          outro: "Dit weekend: tijd voor een professionele shoot!"
        }
      },
      {
        dag_nummer: 6,
        titel: 'Weekend Foto Challenge',
        emoji: '📸',
        dag_type: 'EXERCISE',
        duur_minuten: 60,
        video_script: {
          hook: "Het weekend is dé tijd om geweldige foto's te maken.",
          intro: "Vandaag ga je actief nieuwe content creëren.",
          secties: [
            { titel: "De opdracht", content: "Minimaal 3 nieuwe situaties fotograferen" },
            { titel: "Locatie ideeën", content: "Koffietent, park, restaurant, hobby locatie..." }
          ],
          opdracht: "Maak minimaal 30 nieuwe foto's dit weekend",
          outro: "Morgen reviewen we alles en kiezen de finalisten!"
        },
        werkboek: {
          titel: "Weekend Shoot Plan",
          stappen: [
            "Plan 3 locaties",
            "Vraag een vriend om te helpen",
            "Maak lifestyle foto's",
            "Maak hobby foto's",
            "Maak casual portret foto's"
          ]
        }
      },
      {
        dag_nummer: 7,
        titel: 'Week 1 Review',
        emoji: '🏆',
        dag_type: 'REVIEW',
        duur_minuten: 15,
        video_script: {
          hook: "Tijd om te zien hoeveel je in één week bent gegroeid!",
          intro: "We sluiten week 1 af met een review van je progressie.",
          secties: [
            { titel: "Foto vergelijking", content: "Before/after van je profiel foto's" },
            { titel: "Week 2 preview", content: "Volgende week: de perfecte bio tekst" }
          ],
          opdracht: "Finaliseer je foto selectie - minimaal 4 foto's klaar",
          outro: "Gefeliciteerd met het afronden van week 1! Je bent op de goede weg."
        },
        quiz: {
          vragen: [
            {
              vraag: "Hoeveel foto's moet je minimaal hebben in je profiel?",
              opties: [
                { tekst: "2-3", correct: false },
                { tekst: "4-6", correct: true },
                { tekst: "8-10", correct: false }
              ],
              feedback_correct: "Precies! 4-6 gevarieerde foto's is ideaal.",
              feedback_incorrect: "Niet helemaal. 4-6 foto's is de sweet spot."
            }
          ]
        },
        reflectie: {
          vraag: "Wat was je grootste 'aha moment' deze week over foto's?",
          doel: "Learnings consolideren"
        }
      }
    ];

    // Insert Week 1 days
    for (const day of week1Days) {
      await sql`
        INSERT INTO program_days (
          week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
          ai_tool, ai_tool_slug, video_script, quiz, reflectie, werkboek, display_order
        ) VALUES (
          ${week1.rows[0].id}, ${programId}, ${day.dag_nummer}, ${day.titel}, ${day.emoji},
          ${day.dag_type}, ${day.duur_minuten}, ${day.ai_tool || null}, ${day.ai_tool_slug || null},
          ${JSON.stringify(day.video_script) || null}, ${day.quiz ? JSON.stringify(day.quiz) : null},
          ${day.reflectie ? JSON.stringify(day.reflectie) : null}, ${day.werkboek ? JSON.stringify(day.werkboek) : null},
          ${day.dag_nummer}
        )
      `;
      console.log(`  ✓ Dag ${day.dag_nummer}: ${day.titel}`);
    }

    // Week 2 Days (8-14)
    const week2Days = [
      {
        dag_nummer: 8,
        titel: 'Bio Psychologie',
        emoji: '📝',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        video_script: {
          hook: "Je bio is niet een opsomming van feiten - het is een uitnodiging.",
          intro: "Welkom bij week 2! Nu gaan we je teksten perfectioneren.",
          secties: [
            { titel: "Waarom bio's falen", content: "Lijstjes, clichés, negativiteit..." },
            { titel: "De hook formule", content: "Nieuwsgierigheid + Persoonlijkheid + Call-to-action" }
          ],
          opdracht: "Schrijf 3 verschillende bio concepten",
          outro: "Morgen leer je de AI Profiel Coach gebruiken!"
        },
        reflectie: {
          vraag: "Wat maakt jou uniek dat je nog niet in je bio hebt gezet?",
          doel: "Unieke selling points vinden"
        }
      },
      {
        dag_nummer: 9,
        titel: 'AI Profiel Coach',
        emoji: '✨',
        dag_type: 'VIDEO',
        duur_minuten: 15,
        ai_tool: 'Profiel Coach',
        ai_tool_slug: 'profiel-coach',
        video_script: {
          hook: "Laat AI je helpen de perfecte bio te schrijven.",
          intro: "De Profiel Coach analyseert en verbetert je teksten.",
          secties: [
            { titel: "Input geven", content: "Hoe je de beste resultaten krijgt..." },
            { titel: "Feedback verwerken", content: "Je bio iteratief verbeteren..." }
          ],
          opdracht: "Gebruik de Profiel Coach voor minimaal 3 bio varianten",
          outro: "Morgen kiezen we de beste versie!"
        }
      },
      {
        dag_nummer: 10,
        titel: 'De Perfecte Opening',
        emoji: '💬',
        dag_type: 'VIDEO',
        duur_minuten: 10,
        video_script: {
          hook: "De eerste zin bepaalt of iemand doorleest of doorswipet.",
          intro: "Vandaag focus op je opening line.",
          secties: [
            { titel: "Hook technieken", content: "Vraag, statement, humor, mysterie..." },
            { titel: "Voorbeelden die werken", content: "5 bewezen formules..." }
          ],
          opdracht: "Test 3 verschillende openings zinnen",
          outro: "Morgen: de rest van je profiel teksten!"
        },
        quiz: {
          vragen: [
            {
              vraag: "Welk type opening werkt het beste?",
              opties: [
                { tekst: "\"Hoi, ik ben [naam]\"", correct: false },
                { tekst: "Een intrigerende vraag of statement", correct: true },
                { tekst: "Een lange intro over jezelf", correct: false }
              ],
              feedback_correct: "Ja! Nieuwsgierigheid wekt interesse.",
              feedback_incorrect: "Niet echt. Een intrigerende hook werkt veel beter."
            }
          ]
        }
      },
      {
        dag_nummer: 11,
        titel: 'Platform Optimalisatie',
        emoji: '📱',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        video_script: {
          hook: "Elk platform heeft zijn eigen regels voor succes.",
          intro: "Vandaag optimaliseren we per platform.",
          secties: [
            { titel: "Tinder vs Bumble vs Hinge", content: "De verschillen en hoe je ze gebruikt..." },
            { titel: "Platform-specifieke tips", content: "Prompts, foto volgorde, bio lengte..." }
          ],
          opdracht: "Optimaliseer je profiel op minimaal 2 platforms",
          outro: "Morgen: antwoord prompts die werken!"
        }
      },
      {
        dag_nummer: 12,
        titel: 'Prompts & Antwoorden',
        emoji: '🎯',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        video_script: {
          hook: "De juiste prompts maken gesprekken starten veel makkelijker.",
          intro: "Prompts zijn je geheime wapen voor betere gesprekken.",
          secties: [
            { titel: "De beste prompts kiezen", content: "Welke vragen je moet beantwoorden..." },
            { titel: "Antwoorden die werken", content: "Specifiek, grappig, gespreksstartend..." }
          ],
          opdracht: "Kies en beantwoord 3 prompts per platform",
          outro: "Morgen: live Q&A sessie!"
        },
        werkboek: {
          titel: "Prompt Antwoord Template",
          stappen: [
            "Kies prompts die bij je passen",
            "Schrijf een draft antwoord",
            "Maak het specifieker",
            "Voeg humor of een hook toe",
            "Test met de AI Coach"
          ]
        }
      },
      {
        dag_nummer: 13,
        titel: 'Live Q&A',
        emoji: '🎙️',
        dag_type: 'LIVE',
        duur_minuten: 45,
        video_script: {
          hook: "Je vragen, live beantwoord!",
          intro: "Welkom bij de live Q&A sessie.",
          secties: [
            { titel: "Profiel reviews", content: "Live feedback op ingestuurde profielen" },
            { titel: "Q&A", content: "Al je vragen beantwoord" }
          ],
          opdracht: "Bereid 2 vragen voor die je wilt stellen",
          outro: "Morgen: week 2 review!"
        }
      },
      {
        dag_nummer: 14,
        titel: 'Week 2 Review',
        emoji: '🏆',
        dag_type: 'REVIEW',
        duur_minuten: 15,
        video_script: {
          hook: "Je profiel is nu 10x beter dan 2 weken geleden!",
          intro: "Tijd om je progressie te vieren.",
          secties: [
            { titel: "Before/After", content: "Je profiel transformatie bekijken" },
            { titel: "Week 3 preview", content: "Volgende week: gesprekken die leiden tot dates" }
          ],
          opdracht: "Finaliseer je profiel - foto's, bio, prompts klaar",
          outro: "Volgende week gaan we van matches naar dates!"
        },
        reflectie: {
          vraag: "Hoe voelt het om je nieuwe profiel te zien?",
          doel: "Positieve mindset versterken"
        }
      }
    ];

    // Insert Week 2 days
    for (const day of week2Days) {
      await sql`
        INSERT INTO program_days (
          week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
          ai_tool, ai_tool_slug, video_script, quiz, reflectie, werkboek, display_order
        ) VALUES (
          ${week2.rows[0].id}, ${programId}, ${day.dag_nummer}, ${day.titel}, ${day.emoji},
          ${day.dag_type}, ${day.duur_minuten}, ${day.ai_tool || null}, ${day.ai_tool_slug || null},
          ${JSON.stringify(day.video_script) || null}, ${day.quiz ? JSON.stringify(day.quiz) : null},
          ${day.reflectie ? JSON.stringify(day.reflectie) : null}, ${day.werkboek ? JSON.stringify(day.werkboek) : null},
          ${day.dag_nummer}
        )
      `;
      console.log(`  ✓ Dag ${day.dag_nummer}: ${day.titel}`);
    }

    // Week 3 Days (15-21)
    const week3Days = [
      {
        dag_nummer: 15,
        titel: 'Gesprek Psychologie',
        emoji: '💭',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        video_script: {
          hook: "De meeste gesprekken sterven na 3 berichten. Dat gaat veranderen.",
          intro: "Welkom bij de laatste week! Nu leer je gesprekken voeren.",
          secties: [
            { titel: "Waarom gesprekken doodlopen", content: "Te veel vragen, geen persoonlijkheid, geen richting..." },
            { titel: "De flow formule", content: "Statement + Vraag + Callback..." }
          ],
          opdracht: "Analyseer je laatste 3 gesprekken op deze punten",
          outro: "Morgen: de kunst van het openen!"
        },
        reflectie: {
          vraag: "Waar lopen jouw gesprekken meestal vast?",
          doel: "Patronen herkennen"
        }
      },
      {
        dag_nummer: 16,
        titel: 'IJsbreker Mastery',
        emoji: '❄️',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        ai_tool: 'IJsbreker Generator',
        ai_tool_slug: 'ijsbreker-generator',
        video_script: {
          hook: "\"Hey\" krijgt zelden antwoord. Dit wel.",
          intro: "Vandaag leer je openers die werken.",
          secties: [
            { titel: "Het probleem met hey", content: "Waarom generieke openers niet werken" },
            { titel: "De perfecte opener", content: "Persoonlijk, specifiek, makkelijk te beantwoorden" }
          ],
          opdracht: "Genereer 5 openers met de IJsbreker Generator",
          outro: "Morgen: het gesprek gaande houden!"
        }
      },
      {
        dag_nummer: 17,
        titel: 'Gesprek Flow',
        emoji: '🌊',
        dag_type: 'VIDEO',
        duur_minuten: 15,
        video_script: {
          hook: "Een goed gesprek voelt als een dans, niet als een interview.",
          intro: "Nu leer je hoe je gesprekken laat stromen.",
          secties: [
            { titel: "De interview trap", content: "Hoe je stopt met alleen vragen stellen" },
            { titel: "Delen en connecten", content: "Het balanceren van vragen en statements" }
          ],
          opdracht: "Oefen de technieken in 2 gesprekken vandaag",
          outro: "Morgen: van chat naar date!"
        },
        werkboek: {
          titel: "Gesprek Templates",
          stappen: [
            "Begin met een persoonlijke opener",
            "Reageer op hun antwoord met een statement",
            "Voeg een gerelateerde vraag toe",
            "Deel iets over jezelf",
            "Bouw naar een date voorstel"
          ]
        }
      },
      {
        dag_nummer: 18,
        titel: 'De Date Ask',
        emoji: '📅',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        video_script: {
          hook: "Het juiste moment om een date te vragen is eerder dan je denkt.",
          intro: "Vandaag: van app naar echte date.",
          secties: [
            { titel: "Timing is alles", content: "Wanneer vraag je om een date?" },
            { titel: "De perfecte ask", content: "Specifiek, makkelijk, laagdrempelig" }
          ],
          opdracht: "Vraag minimaal 1 persoon op date deze week",
          outro: "Morgen: live hulp bij je gesprekken!"
        },
        quiz: {
          vragen: [
            {
              vraag: "Na hoeveel berichten moet je meestal een date voorstellen?",
              opties: [
                { tekst: "5-10 berichten", correct: false },
                { tekst: "10-20 berichten", correct: true },
                { tekst: "30+ berichten", correct: false }
              ],
              feedback_correct: "Goed! Niet te snel, maar ook niet te lang wachten.",
              feedback_incorrect: "10-20 berichten is meestal de sweet spot."
            }
          ]
        }
      },
      {
        dag_nummer: 19,
        titel: 'Live Gesprek Coaching',
        emoji: '🎙️',
        dag_type: 'LIVE',
        duur_minuten: 45,
        video_script: {
          hook: "Live hulp bij je lopende gesprekken!",
          intro: "Welkom bij de live coaching sessie.",
          secties: [
            { titel: "Gesprek reviews", content: "We bekijken echte gesprekken en geven feedback" },
            { titel: "Live hulp", content: "Suggesties voor je volgende berichten" }
          ],
          opdracht: "Heb minimaal 1 lopend gesprek klaar om te bespreken",
          outro: "Nog 2 dagen! Je bent er bijna!"
        }
      },
      {
        dag_nummer: 20,
        titel: 'Mindset & Afwijzing',
        emoji: '🧠',
        dag_type: 'VIDEO',
        duur_minuten: 12,
        video_script: {
          hook: "Afwijzing hoort erbij. Hoe je ermee omgaat bepaalt je succes.",
          intro: "Vandaag: de mentale kant van dating.",
          secties: [
            { titel: "Reframing afwijzing", content: "Het is informatie, geen oordeel" },
            { titel: "De abundance mindset", content: "Hoe je ontspannen blijft in gesprekken" }
          ],
          opdracht: "Schrijf 3 positieve learnings van je dating journey",
          outro: "Morgen: de grote finale!"
        },
        reflectie: {
          vraag: "Hoe is je mindset over dating veranderd in de afgelopen 3 weken?",
          doel: "Groei erkennen"
        }
      },
      {
        dag_nummer: 21,
        titel: 'De Grote Finale',
        emoji: '🎉',
        dag_type: 'REVIEW',
        duur_minuten: 20,
        video_script: {
          hook: "21 dagen geleden begon je als beginner. Nu ben je een dating pro!",
          intro: "Gefeliciteerd! Je hebt het programma voltooid!",
          secties: [
            { titel: "Je transformatie", content: "Before/after: profiel, mindset, resultaten" },
            { titel: "Next steps", content: "Hoe je dit momentum vasthoudt" }
          ],
          opdracht: "Vier je succes! Je hebt dit verdiend.",
          outro: "Dit is niet het einde - het is het begin van je dating succes verhaal!"
        },
        reflectie: {
          vraag: "Wat is je #1 takeaway van de Kickstart?",
          doel: "Learnings consolideren"
        },
        upsell: {
          programma: "Dating Mastery",
          korting_cents: 5000,
          boodschap: "Klaar voor het next level? De Dating Mastery gaat nog dieper in op geavanceerde technieken."
        }
      }
    ];

    // Insert Week 3 days
    for (const day of week3Days) {
      await sql`
        INSERT INTO program_days (
          week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
          ai_tool, ai_tool_slug, video_script, quiz, reflectie, werkboek, upsell, display_order
        ) VALUES (
          ${week3.rows[0].id}, ${programId}, ${day.dag_nummer}, ${day.titel}, ${day.emoji},
          ${day.dag_type}, ${day.duur_minuten}, ${day.ai_tool || null}, ${day.ai_tool_slug || null},
          ${JSON.stringify(day.video_script) || null}, ${day.quiz ? JSON.stringify(day.quiz) : null},
          ${day.reflectie ? JSON.stringify(day.reflectie) : null}, ${day.werkboek ? JSON.stringify(day.werkboek) : null},
          ${day.upsell ? JSON.stringify(day.upsell) : null}, ${day.dag_nummer}
        )
      `;
      console.log(`  ✓ Dag ${day.dag_nummer}: ${day.titel}`);
    }

    // Step 4: Verify
    console.log('\n🔍 Stap 4: Verificatie...');

    const weeksCount = await sql`
      SELECT COUNT(*) as count FROM program_weeks
      WHERE program_id = ${programId}
    `;

    const daysCount = await sql`
      SELECT COUNT(*) as count FROM program_days
      WHERE program_id = ${programId}
    `;

    console.log(`  • ${weeksCount.rows[0].count} weken aangemaakt`);
    console.log(`  • ${daysCount.rows[0].count} dagen aangemaakt`);

    console.log('\n✅ Migratie voltooid!');
    console.log('\n📌 Next steps:');
    console.log('  1. Start de dev server: npm run dev');
    console.log('  2. Ga naar: http://localhost:9000/kickstart');
    console.log('  3. Test een dag: http://localhost:9000/kickstart/dag/1');

  } catch (error) {
    console.error('\n❌ Migratie mislukt:', error);
    process.exit(1);
  }
}

// Run migration
migrate().then(() => {
  process.exit(0);
});
