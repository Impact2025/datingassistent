require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

const courseId = process.argv[2];
if (!courseId) {
  console.error('❌ Gebruik: node add-slides-to-course.js <course_id>');
  console.error('Voorbeeld: node add-slides-to-course.js 21');
  process.exit(1);
}

const slidesData = {
  "title": "MODULE 1: Zelfkennis - Het Fundament van Authenticiteit",
  "description": "Leer de basis van zelfkennis en authenticiteit voor betere dating profielen",
  "slides": [
    {
      "id": "slide-1",
      "title": "MODULE 1: Zelfkennis",
      "content": "<h1 style=\"font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;\">MODULE 1: Zelfkennis</h1><h2 style=\"font-size: 1.5rem; font-weight: normal; color: #666; margin-bottom: 2rem;\">Het Fundament van Authenticiteit</h2>"
    },
    {
      "id": "slide-2",
      "title": "Slide 2",
      "content": "<blockquote style=\"font-size: 1.5rem; font-style: italic; text-align: center; padding: 2rem; border-left: 4px solid #E14874; background: #f8f9fa; margin: 2rem 0;\">\n          <p>\"Authenticiteit is de enige valuta die echt werkt in dating.\"</p>\n          <cite style=\"display: block; margin-top: 1rem; font-size: 1rem; color: #666;\">— DatingAssistent</cite>\n        </blockquote>"
    },
    {
      "id": "slide-3",
      "title": "Doel van deze module",
      "content": "<div style=\"max-width: none;\"><h3 style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;\">🎯 Doel van deze module</h3><p style=\"margin-bottom: 1.5rem; line-height: 1.6;\">Het wegnemen van onzekerheden en het blootleggen van de diepste, meest aantrekkelijke lagen van uw persoonlijkheid.</p><ul style=\"margin: 1rem 0; padding-left: 1.5rem;\"><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Voordat we bouwen, moeten we afbreken wat u tegenhoudt</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Van angst naar waarde: \"Wat heb ik te bieden?\"</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Authenticiteit als uw sterkste dating tool</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Zelfkennis als fundament voor echte connecties</li></ul></div>",
      "notes": "Tip: Neem de tijd om elke bullet point te overdenken en toe te passen."
    },
    {
      "id": "slide-4",
      "title": "Slide 1.1: Ontmantel de Zelfsabotage",
      "content": "<div style=\"max-width: none;\"><h3 style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;\">🛡️ Slide 1.1: Ontmantel de Zelfsabotage</h3><p style=\"margin-bottom: 1.5rem; line-height: 1.6;\">Voordat we bouwen, moeten we afbreken wat u tegenhoudt. De meeste mensen schrijven profielen vanuit angst (\"Wat als ik afgewezen word?\") in plaats van vanuit waarde (\"Wat heb ik te bieden?\").</p><ul style=\"margin: 1rem 0; padding-left: 1.5rem;\"><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Gebruik het Zelfkennis Workbook om de 3 meest hardnekkige, beperkende overtuigingen over uzelf in dating te identificeren</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Draai ze om in ''power statements''</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Voorbeeld: \"Ik ben te oud\" wordt \"Ik heb de levenservaring en rust om échte diepgang te bieden\"</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Schrijf elke beperkende overtuiging op en transformeer hem</li></ul></div>",
      "notes": "Tip: Neem de tijd om elke bullet point te overdenken en toe te passen."
    },
    {
      "id": "slide-5",
      "title": "Van Angst naar Waarde",
      "content": "<div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;\">\n          <div style=\"padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #dc3545;\">\n            <h4 style=\"font-weight: bold; margin-bottom: 1rem; color: #dc3545;\">Van Angst naar Waarde</h4>\n            <div style=\"white-space: pre-line; line-height: 1.6;\">❌ UIT ANGST SCHRIJVEN:\n\n• \"Ik ben te oud voor dating\"\n• \"Niemand vindt me interessant\"\n• \"Ik ben niet goed genoeg\"\n• \"Wat als ze me afwijzen?\"\n\nDit creëert oppervlakkige, defensieve profielen.</div>\n          </div>\n          <div style=\"padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;\">\n            <h4 style=\"font-weight: bold; margin-bottom: 1rem; color: #28a745;\">Oplossing</h4>\n            <div style=\"white-space: pre-line; line-height: 1.6;\">✅ UIT WAARDE SCHRIJVEN:\n\n• \"Ik heb levenservaring om diepgang te bieden\"\n• \"Ik heb unieke verhalen te delen\"\n• \"Ik weet wat ik wil in het leven\"\n• \"Ik ben klaar voor echte verbinding\"\n\nDit creëert authentieke, aantrekkelijke profielen.</div>\n          </div>\n        </div>"
    },
    {
      "id": "slide-6",
      "title": "Slide 1.2: De 5-Fasen Ontwikkelmethode (De K.A.I.K. Regel)",
      "content": "<div style=\"max-width: none;\"><h3 style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;\">📊 Slide 1.2: De 5-Fasen Ontwikkelmethode (De K.A.I.K. Regel)</h3><p style=\"margin-bottom: 1.5rem; line-height: 1.6;\">Aantrekkelijkheid is een vaardigheid, geen lot. Dit framework helpt u uw gedrag in dating te zien als data.</p><ul style=\"margin: 1rem 0; padding-left: 1.5rem;\"><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">KENNIS: Begrijp de psychologie (deze cursus)</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">ACTIE: Schrijf het profiel en start met daten</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">INTERACTIE: Verzamel feedback en data (Matches/Berichten)</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">KORREL: Verfijn en optimaliseer op basis van de data</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">FOCUS: Uw profieltekst is een hypothese; dating is het experiment</li></ul></div>",
      "notes": "Tip: Neem de tijd om elke bullet point te overdenken en toe te passen."
    },
    {
      "id": "slide-7",
      "title": "De K.A.I.K. Regel Uitgelegd",
      "content": "<div style=\"max-width: none;\"><h3 style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;\">🔄 De K.A.I.K. Regel Uitgelegd</h3><ul style=\"margin: 1rem 0; padding-left: 1.5rem;\"><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">📚 KENNIS: Leer de principes van aantrekkelijke profielen</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">✍️ ACTIE: Schrijf je eerste versie en ga live</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">💬 INTERACTIE: Date actief en verzamel data (matches, berichten, gesprekken)</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">🎯 KORREL: Analyseer wat werkt en wat niet - optimaliseer</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">🔄 HERHAAL: Nieuwe hypothese → Test → Optimaliseer → Herhaal</li></ul></div>",
      "notes": "Tip: Neem de tijd om elke bullet point te overdenken en toe te passen."
    },
    {
      "id": "slide-8",
      "title": "Slide 1.3: Het Onthullen van de Zachte Verhalen",
      "content": "<div style=\"max-width: none;\"><h3 style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;\">📖 Slide 1.3: Het Onthullen van de Zachte Verhalen</h3><p style=\"margin-bottom: 1.5rem; line-height: 1.6;\">Harde feiten (beroep, lengte, woonplaats) zijn de botten; zachte verhalen zijn het vlees. Mensen vallen voor hoe u bent, niet wat u bent.</p><ul style=\"margin: 1rem 0; padding-left: 1.5rem;\"><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Passie & Drive: Waar verliest u de tijd? Niet uw werk, maar uw obsessie</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Humor & Lichtheid: Wat is uw unieke merk van humor?</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Kwetsbaarheid & Diepgang: Welke overtuiging heeft u recent veranderd?</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Toon proces, niet alleen het eindresultaat</li></ul></div>",
      "notes": "Tip: Neem de tijd om elke bullet point te overdenken en toe te passen."
    },
    {
      "id": "slide-9",
      "title": "Harde Feiten vs Zachte Verhalen",
      "content": "<div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;\">\n          <div style=\"padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #dc3545;\">\n            <h4 style=\"font-weight: bold; margin-bottom: 1rem; color: #dc3545;\">Harde Feiten vs Zachte Verhalen</h4>\n            <div style=\"white-space: pre-line; line-height: 1.6;\">⚪ HARDE FEITEN (de botten):\n\n• Software ontwikkelaar\n• 32 jaar\n• Amsterdam\n• Sportief\n• Hondenliefhebber\n\nDit vertelt WAT je bent, maar niet WIE.</div>\n          </div>\n          <div style=\"padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;\">\n            <h4 style=\"font-weight: bold; margin-bottom: 1rem; color: #28a745;\">Oplossing</h4>\n            <div style=\"white-space: pre-line; line-height: 1.6;\">💖 ZACHTE VERHALEN (het vlees):\n\n• \"Ik bouw apps die mensen helpen, maar mijn echte passie is koken voor vrienden\"\n• \"Vorige maand veranderde ik mijn mening over reizen alleen - nu plan ik mijn eerste solo-trip\"\n• \"Mijn humor? Sarcasme met een knipoog - vraag maar naar mijn grap over koffiemachines\"\n\nDit toont HOE je denkt en voelt.</div>\n          </div>\n        </div>"
    },
    {
      "id": "slide-10",
      "title": "Oefening: 3 Unieke Anekdotes",
      "content": "<div style=\"max-width: none;\"><h3 style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;\">✍️ Oefening: 3 Unieke Anekdotes</h3><p style=\"margin-bottom: 1.5rem; line-height: 1.6;\">Schrijf 3 korte, authentieke verhalen die uw passie, humor en kwetsbaarheid in actie laten zien.</p><ul style=\"margin: 1rem 0; padding-left: 1.5rem;\"><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">PASSIE: \"Vorige week vergat ik te eten omdat ik verdiept was in...\"</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">HUMOR: \"Mijn vrienden noemen me altijd de koning/in van...\"</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">KWETSBAARHEID: \"Iets wat ik vorig jaar nog anders zag...\"</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Houd ze kort: 2-3 zinnen per anekdote</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Maak ze specifiek en herkenbaar</li></ul></div>",
      "notes": "Tip: Neem de tijd om elke bullet point te overdenken en toe te passen."
    },
    {
      "id": "slide-11",
      "title": "Module 1 Checklist",
      "content": "<div style=\"background: #f8f9fa; padding: 2rem; border-radius: 8px; margin: 2rem 0;\">\n          <h3 style=\"font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;\">✅ Module 1 Checklist</h3>\n          <ul style=\"list-style: none; padding: 0;\"><li style=\"margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem;\">\n            <span style=\"font-size: 1.25rem;\">⬜</span>\n            <span>Identificeer 3 beperkende overtuigingen over jezelf in dating</span>\n          </li><li style=\"margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem;\">\n            <span style=\"font-size: 1.25rem;\">⬜</span>\n            <span>Transformeer elke overtuiging naar een power statement</span>\n          </li><li style=\"margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem;\">\n            <span style=\"font-size: 1.25rem;\">⬜</span>\n            <span>Begrijp de K.A.I.K. methode voor continue verbetering</span>\n          </li><li style=\"margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem;\">\n            <span style=\"font-size: 1.25rem;\">⬜</span>\n            <span>Schrijf 3 anekdotes over passie, humor en kwetsbaarheid</span>\n          </li><li style=\"margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem;\">\n            <span style=\"font-size: 1.25rem;\">⬜</span>\n            <span>Begin met schrijven van je eerste authentieke profieltekst</span>\n          </li></ul></div>"
    },
    {
      "id": "slide-12",
      "title": "Slide 12",
      "content": "<blockquote style=\"font-size: 1.5rem; font-style: italic; text-align: center; padding: 2rem; border-left: 4px solid #E14874; background: #f8f9fa; margin: 2rem 0;\">\n          <p>\"Het gaat niet om perfect zijn. Het gaat om authentiek zijn in een wereld vol filters.\"</p>\n          \n        </blockquote>"
    },
    {
      "id": "slide-13",
      "title": "Volgende Stap",
      "content": "<div style=\"max-width: none;\"><h3 style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;\">🚀 Volgende Stap</h3><p style=\"margin-bottom: 1.5rem; line-height: 1.6;\">Nu u het fundament heeft gelegd, bent u klaar voor Module 2: De Psychologie van Aantrekkelijkheid.</p><ul style=\"margin: 1rem 0; padding-left: 1.5rem;\"><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Leer wat mensen écht lezen in profielen</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Ontdek de psychologische triggers die werken</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Master de kunst van subtiele zelfpromotie</li><li style=\"margin-bottom: 0.5rem; line-height: 1.6;\">Creeër profielen die 3x meer matches opleveren</li></ul></div>",
      "notes": "Tip: Neem de tijd om elke bullet point te overdenken en toe te passen."
    }
  ]
};

async function addSlidesToCourse() {
  try {
    console.log('🔍 Connecting to database...');
    console.log('📚 Course ID:', courseId);

    // Check if course exists
    const courseCheck = await sql`SELECT id, title FROM courses WHERE id = ${courseId}`;
    if (courseCheck.rows.length === 0) {
      console.error('❌ Course niet gevonden met ID:', courseId);
      return;
    }

    console.log('✅ Course gevonden:', courseCheck.rows[0].title);

    // Check if slides already exist for this course
    const existingSlides = await sql`SELECT id, title FROM course_modules WHERE course_id = ${courseId} AND lesson_type = 'slides'`;
    if (existingSlides.rows.length > 0) {
      console.log('⚠️ Slides bestaan al voor deze course:');
      existingSlides.rows.forEach(slide => {
        console.log('   -', slide.id, ':', slide.title);
      });
      console.log('❌ Stoppen om duplicates te voorkomen');
      return;
    }

    // Convert slides data to JSON string
    const slidesJson = JSON.stringify(slidesData);

    console.log('📝 Slides data prepared, lengte:', slidesJson.length, 'karakters');

    // Insert the slides
    console.log('💾 Slides toevoegen aan database...');
    const result = await sql`
      INSERT INTO course_modules (course_id, title, description, lesson_type, content, created_at, updated_at)
      VALUES (
        ${courseId},
        'Module 1: Zelfkennis - Het Fundament van Authenticiteit',
        'Ontdek wie je echt bent en leer authentiek te daten',
        'slides',
        ${slidesJson},
        NOW(),
        NOW()
      )
      RETURNING id, title
    `;

    console.log('✅ Slides succesvol toegevoegd!');
    console.log('   Module ID:', result.rows[0].id);
    console.log('   Titel:', result.rows[0].title);
    console.log('');
    console.log('🎉 Klaar! De slides zijn nu zichtbaar in Module 1 van de cursus.');
    console.log('   Ga naar je dashboard → Cursussen → "Je profieltekst die wél werkt" → Module 1');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

addSlidesToCourse();