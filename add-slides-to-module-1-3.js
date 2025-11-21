const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Use POSTGRES_URL_NON_POOLING for direct connection or POSTGRES_URL for pooled
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const slidesData = {
  title: "De wetenschap achter aantrekkingskracht",
  description: "Leer de psychologische principes achter een aantrekkelijk dating profiel",
  slides: [
    {
      id: "1.3.1",
      title: "De wetenschap achter aantrekkingskracht",
      content: `
        <h3>Introductie: de filter</h3>
        <p>Dating apps zijn een selectieproces, geen sollicitatiegesprek.</p>

        <h3>Het reciprociteitsbeginsel</h3>
        <p>Mensen voelen zich aangetrokken tot mensen die aantoonbaar moeite hebben gedaan. Een generieke bio = weinig moeite.</p>

        <h3>Theorie van unieke waarde</h3>
        <p>Je bent geen doorsnee. Je bio mag dat ook niet zijn. Wat is het meest onverwachte of specifieke aan jou? Dit creëert intrigue (nieuwsgierigheid).</p>

        <h3>De wet van deelbare kwetsbaarheid</h3>
        <p>Het tonen van een kleine, charmante imperfectie (mijn favoriete netflix-binge is guilty pleasure x) maakt je menselijk en toegankelijk. Dit bouwt vertrouwen op.</p>

        <h3>Sociale bewijskracht (impliciet)</h3>
        <p>Zinnen die laten zien dat je een rijk leven leidt (ik heb net mijn tent op de veluwe opgezet), tonen aan dat je al gewild en boeiend bent. Dit verhoogt je waargenomen status.</p>

        <h3>De 3 B's: Bridge, Barrier, Benefit</h3>
        <p>Elke zin moet 1 van de 3 doen: <strong>bridge</strong> (verbinding leggen), <strong>barrier</strong> (filteren wie niet past), of <strong>benefit</strong> (laten zien wat je toevoegt).</p>
      `,
      notes: "Deze psychologische principes zijn de basis voor een sterk dating profiel"
    },
    {
      id: "1.3.2",
      title: "Wat je gaat bereiken in 8 stappen",
      content: `
        <h3>Stap 1: Authenticiteit fundament</h3>
        <p>Je kent je diepste waarden en wat je echt zoekt.</p>

        <h3>Stap 2: Psychologische blueprint</h3>
        <p>Je weet hoe je onbewuste aantrekkingskracht activeert.</p>

        <h3>Stap 3: Succes structuur</h3>
        <p>Je beheerst de 4 onweerstaanbare zinsstructuren.</p>

        <h3>Stap 4: Karakter optimalisatie</h3>
        <p>Je herschrijft je 'zwakheden' in charmante, aantrekkelijke kenmerken.</p>

        <h3>Stap 5: AI-optimalisatie</h3>
        <p>Je gebruikt AI als een professionele editor.</p>

        <h3>Stap 6: Validatie & optimalisatie</h3>
        <p>Je test en meet de prestaties van je profiel.</p>

        <h3>Stap 7: Momentum bouwen</h3>
        <p>Je leert hoe je het vuur brandend houdt.</p>

        <h3>Stap 8: Certificering</h3>
        <p>Je bent een gecertificeerd profiel-expert.</p>
      `,
      notes: "Dit 8-stappenplan brengt je van generiek naar onweerstaanbaar"
    },
    {
      id: "1.3.3",
      title: "De 5-fasen ontwikkelmethode (de K.A.I.K. regel)",
      content: `
        <p><strong>Principe:</strong> Aantrekkelijkheid is een vaardigheid, geen lot. Dit plan helpt je jouw datinggedrag als slimme data te zien.</p>

        <h3>Kennis</h3>
        <p>Begrijp de psychologie (deze cursus).</p>

        <h3>Actie</h3>
        <p>Schrijf het profiel en start met daten.</p>

        <h3>Interactie</h3>
        <p>Verzamel feedback en data (matches/berichten).</p>

        <h3>Korrel</h3>
        <p>Verfijn en optimaliseer op basis van de data.</p>

        <h3>Focus</h3>
        <p>Jouw profieltekst is een proef; dating is het experiment.</p>
      `,
      notes: "De K.A.I.K. regel maakt van dating een systematisch proces"
    },
    {
      id: "1.3.4",
      title: "Je echte verhalen vinden (kern van de module)",
      content: `
        <p><strong>Kern:</strong> Harde feiten (werk, lengte, woonplaats) zijn de basis; zachte verhalen zijn wat je aantrekkelijk maakt. Mensen vallen voor hoe je bent, niet wat je bent.</p>

        <h3>Onderwerpen om te vinden:</h3>

        <h4>Passie & Drive</h4>
        <p>Waar verlies je de tijd? Niet je werk, maar je obsessie.</p>

        <h4>Humor & Lichtheid</h4>
        <p>Wat is jouw unieke soort humor?</p>

        <h4>Kwetsbaarheid & Diepgang</h4>
        <p>Welke mening over jezelf of de wereld heb je laatst veranderd? Laat het proces zien, niet alleen het eindresultaat.</p>
      `,
      notes: "Persoonlijke verhalen maken het verschil tussen een gemiddeld en geweldig profiel"
    }
  ]
};

async function addSlides() {
  const client = await pool.connect();
  try {
    console.log('🔍 Zoeken naar de profieltekst cursus...');

    // Find the course
    const courseResult = await client.query(`
      SELECT id, title FROM courses
      WHERE LOWER(title) LIKE '%profieltekst%'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (courseResult.rows.length === 0) {
      console.log('❌ Course niet gevonden. Probeer eerst de course aan te maken.');
      return;
    }

    const course = courseResult.rows[0];
    console.log(`✅ Course gevonden: ${course.title} (ID: ${course.id})`);

    // Find or create module 1.3 (Introductie)
    console.log('\n🔍 Zoeken naar Module 1.3...');

    let moduleResult = await client.query(`
      SELECT id, title, position FROM course_modules
      WHERE course_id = $1 AND title LIKE '%introduct%'
      ORDER BY position ASC
      LIMIT 1
    `, [course.id]);

    let moduleId;

    if (moduleResult.rows.length === 0) {
      console.log('Module 1.3 niet gevonden, aanmaken...');

      // Get the highest position
      const posResult = await client.query(`
        SELECT COALESCE(MAX(position), 0) as max_pos FROM course_modules WHERE course_id = $1
      `, [course.id]);

      const newPosition = posResult.rows[0].max_pos + 1;

      const insertResult = await client.query(`
        INSERT INTO course_modules (course_id, title, description, position, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, title
      `, [
        course.id,
        'Introductie: De Psychologie van Aantrekkingskracht',
        'Leer de wetenschap achter een aantrekkelijk dating profiel',
        newPosition
      ]);

      moduleId = insertResult.rows[0].id;
      console.log(`✅ Module aangemaakt: ${insertResult.rows[0].title} (ID: ${moduleId})`);
    } else {
      moduleId = moduleResult.rows[0].id;
      console.log(`✅ Module gevonden: ${moduleResult.rows[0].title} (ID: ${moduleId}, Position: ${moduleResult.rows[0].position})`);
    }

    // Check if slides lesson already exists
    console.log('\n🔍 Controleren of slides lesson al bestaat...');

    const existingLessonResult = await client.query(`
      SELECT id, title FROM course_lessons
      WHERE module_id = $1 AND lesson_type = 'slides'
      LIMIT 1
    `, [moduleId]);

    if (existingLessonResult.rows.length > 0) {
      console.log(`⚠️  Slides lesson bestaat al: ${existingLessonResult.rows[0].title} (ID: ${existingLessonResult.rows[0].id})`);
      console.log('Wil je deze updaten? (Handmatig aanpassen in database of lesson verwijderen en script opnieuw uitvoeren)');
      return;
    }

    // Get the highest lesson position
    const lessonPosResult = await client.query(`
      SELECT COALESCE(MAX(position), 0) as max_pos FROM course_lessons WHERE module_id = $1
    `, [moduleId]);

    const lessonPosition = lessonPosResult.rows[0].max_pos + 1;

    // Create the slides lesson
    console.log('\n📝 Slides lesson aanmaken...');

    const lessonResult = await client.query(`
      INSERT INTO course_lessons (
        module_id,
        title,
        description,
        lesson_type,
        content,
        position,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, title
    `, [
      moduleId,
      slidesData.title,
      slidesData.description,
      'slides',
      JSON.stringify(slidesData),
      lessonPosition
    ]);

    console.log(`✅ Slides lesson aangemaakt: ${lessonResult.rows[0].title} (ID: ${lessonResult.rows[0].id})`);
    console.log(`\n🎉 Klaar! De slides zijn toegevoegd aan de cursus.`);
    console.log(`\n📍 Je kunt ze nu bekijken op: http://localhost:9000/dashboard/starter/starter-5`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addSlides().catch(console.error);
