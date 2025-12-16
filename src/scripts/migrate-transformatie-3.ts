/**
 * Migratie Script: De Transformatie 3.0
 *
 * Dit script:
 * 1. Maakt/update het Transformatie programma in de programs tabel
 * 2. Maakt module en lesson tabellen aan (transformatie_modules, transformatie_lessons)
 * 3. Seed alle 12 modules en 48 lessen
 * 4. Maakt tabellen voor de 4 nieuwe AI tools
 *
 * Run: npx tsx src/scripts/migrate-transformatie-3.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

// Import course structure from JSON
const courseStructure = {
  course: {
    id: "de-transformatie-3",
    slug: "transformatie",
    title: "De Transformatie 3.0",
    version: "3.0",
    subtitle: "Van Single naar Duurzame Relatie in 90 Dagen",
    description: "De enige datingcursus die je leert hoe je een relatie krijgt én houdt.",
    price: 147.00,
    currency: "EUR",
    access_period_days: 365,
    total_modules: 12,
    total_duration_hours: 9,
    video_format: "micro_learning",
    max_video_length_minutes: 5
  },
  framework: {
    name: "DESIGN_ACTION_SURRENDER",
    phases: [
      {
        id: "DESIGN",
        name: "Het Fundament",
        modules: [1, 2, 3, 4],
        description: "Van onbewust onbekwaam naar bewust bekwaam",
        core_question: "Wie ben ik in de liefde?"
      },
      {
        id: "ACTION",
        name: "De Markt Op",
        modules: [5, 6, 7, 8],
        description: "Kwalitatieve dates genereren zonder burnout",
        core_question: "Hoe creëer ik kansen?"
      },
      {
        id: "SURRENDER",
        name: "Relatie Bouwen",
        modules: [9, 10, 11, 12],
        description: "Van date naar duurzame partner",
        core_question: "Hoe laat ik liefde toe?"
      }
    ]
  },
  modules: [
    {
      order: 1,
      slug: "design-your-love-life",
      title: "Design Your Love Life",
      phase: "DESIGN",
      phase_label: "Het Fundament",
      description: "Ontdek je kernwaarden, definieer je intentie en creëer een heldere visie voor je liefdesleven.",
      mindset_hook: "De meeste mensen falen in liefde omdat ze hongerig boodschappen doen zonder lijstje.",
      ai_tool_id: 11,
      ai_tool_name: "Waarden Kompas",
      duration_minutes: 45,
      lessons: [
        { order: 1, slug: "welkom-bij-je-transformatie", title: "Welkom bij je Transformatie", type: "video", duration_minutes: 4, description: "Introductie tot het DESIGN→ACTION→SURRENDER framework" },
        { order: 2, slug: "waarom-dating-zo-moeilijk-voelt", title: "Waarom Dating Zo Moeilijk Voelt", type: "video", duration_minutes: 5, description: "De psychologie achter dating burnout en frustratie" },
        { order: 3, slug: "jouw-kernwaarden-ontdekken", title: "Jouw Kernwaarden Ontdekken", type: "video", duration_minutes: 5, description: "Interactieve sessie met het Waarden Kompas" },
        { order: 4, slug: "je-dating-intentie-formuleren", title: "Je Dating Intentie Formuleren", type: "video", duration_minutes: 4, description: "Van vage wens naar concrete intentie" }
      ]
    },
    {
      order: 2,
      slug: "jouw-relatie-dna",
      title: "Jouw Relatie-DNA",
      phase: "DESIGN",
      phase_label: "Het Fundament",
      description: "Begrijp je hechtingsstijl en ontdek de onbewuste patronen die je relaties vormen.",
      mindset_hook: "Je bent niet kapot. Je hebt gewoon een gebruiksaanwijzing die je nog niet hebt gelezen.",
      ai_tool_id: 1,
      ai_tool_name: "Hechtingsstijl Scan",
      duration_minutes: 60,
      lessons: [
        { order: 1, slug: "wat-is-hechting", title: "Wat is Hechting?", type: "video", duration_minutes: 5, description: "De wetenschap van Bowlby en Ainsworth" },
        { order: 2, slug: "de-vier-hechtingsstijlen", title: "De Vier Hechtingsstijlen", type: "video", duration_minutes: 5, description: "Veilig, Angstig, Vermijdend, Fearful-Avoidant" },
        { order: 3, slug: "jouw-hechtingsstijl-ontdekken", title: "Jouw Hechtingsstijl Ontdekken", type: "video", duration_minutes: 5, description: "Interactieve test en reflectie" },
        { order: 4, slug: "van-inzicht-naar-actie", title: "Van Inzicht naar Actie", type: "video", duration_minutes: 5, description: "Hoe je je hechtingsstijl kunt helen" }
      ]
    },
    {
      order: 3,
      slug: "magnetische-identiteit",
      title: "Magnetische Identiteit",
      phase: "DESIGN",
      phase_label: "Het Fundament",
      description: "Transformeer je profiel van generiek naar magnetisch.",
      mindset_hook: "Je foto verkoopt niet wie je bent — het verkoopt hoe iemand zich voelt bij wie je bent.",
      ai_tool_id: 101,
      ai_tool_name: "Vibe Check Simulator",
      duration_minutes: 45,
      lessons: [
        { order: 1, slug: "de-psychologie-van-eerste-indrukken", title: "De Psychologie van Eerste Indrukken", type: "video", duration_minutes: 4, description: "Wat er gebeurt in 0.1 seconde" },
        { order: 2, slug: "foto-strategie-die-werkt", title: "Foto Strategie die Werkt", type: "video", duration_minutes: 5, description: "Welke foto's welke emotie oproepen" },
        { order: 3, slug: "je-bio-als-uitnodiging", title: "Je Bio als Uitnodiging", type: "video", duration_minutes: 4, description: "Van cliché naar conversation starter" },
        { order: 4, slug: "de-vibe-check", title: "De Vibe Check", type: "video", duration_minutes: 4, description: "Test je profiel met de Vibe Check Simulator" }
      ]
    },
    {
      order: 4,
      slug: "bewust-matchen",
      title: "Bewust Matchen",
      phase: "DESIGN",
      phase_label: "Het Fundament",
      description: "Leer swipen zonder burnout. Speciaal voor introverts.",
      mindset_hook: "Burnout is geen falen — het is een signaal dat je te snel rent naar iets dat je niet helder ziet.",
      ai_tool_id: 102,
      ai_tool_name: "Energie Batterij",
      duration_minutes: 45,
      lessons: [
        { order: 1, slug: "wat-is-dating-burnout", title: "Wat is Dating Burnout?", type: "video", duration_minutes: 4, description: "De wetenschap achter choice overload" },
        { order: 2, slug: "introvert-vs-extrovert-daten", title: "Introvert vs Extrovert Daten", type: "video", duration_minutes: 5, description: "Waarom standaard advies niet voor iedereen werkt" },
        { order: 3, slug: "je-energie-batterij-begrijpen", title: "Je Energie Batterij Begrijpen", type: "video", duration_minutes: 4, description: "Meet en bescherm je sociale energie" },
        { order: 4, slug: "duurzaam-swipen", title: "Duurzaam Swipen", type: "video", duration_minutes: 4, description: "Praktische strategieën voor energie management" }
      ]
    },
    {
      order: 5,
      slug: "verbinding-en-diepgang",
      title: "Verbinding & Diepgang",
      phase: "ACTION",
      phase_label: "De Markt Op",
      description: "Van oppervlakkige chat naar echte connectie.",
      mindset_hook: "De beste gesprekken beginnen niet met vragen stellen — maar met durven antwoorden.",
      ai_tool_id: 103,
      ai_tool_name: "36 Vragen Oefen-Bot",
      duration_minutes: 60,
      lessons: [
        { order: 1, slug: "waarom-hoi-hoe-gaat-het-niet-werkt", title: "Waarom 'Hoi hoe gaat het' Niet Werkt", type: "video", duration_minutes: 4, description: "De psychologie van aandacht in een drukke inbox" },
        { order: 2, slug: "de-kunst-van-de-openingszin", title: "De Kunst van de Openingszin", type: "video", duration_minutes: 5, description: "Persoonlijk, specifiek, uitnodigend" },
        { order: 3, slug: "van-small-talk-naar-echte-talk", title: "Van Small Talk naar Echte Talk", type: "video", duration_minutes: 5, description: "De wetenschap van intimiteit (Arthur Aron)" },
        { order: 4, slug: "oefenen-met-de-36-vragen", title: "Oefenen met de 36 Vragen", type: "video", duration_minutes: 4, description: "Praktijksessie met de 36 Vragen Bot" }
      ]
    },
    {
      order: 6,
      slug: "de-selectie-en-veiligheid",
      title: "De Selectie & Veiligheid",
      phase: "ACTION",
      phase_label: "De Markt Op",
      description: "Leer het verschil tussen chemie en compatibiliteit.",
      mindset_hook: "Chemie zegt: 'Dit voelt goed.' Compatibiliteit zegt: 'Dit is goed.' Je hebt beide nodig.",
      ai_tool_id: 2,
      ai_tool_name: "Match Analyse",
      duration_minutes: 60,
      lessons: [
        { order: 1, slug: "chemie-vs-compatibiliteit", title: "Chemie vs Compatibiliteit", type: "video", duration_minutes: 5, description: "Waarom vlinders misleidend kunnen zijn" },
        { order: 2, slug: "rode-vlaggen-herkennen", title: "Rode Vlaggen Herkennen", type: "video", duration_minutes: 5, description: "Vroege waarschuwingssignalen" },
        { order: 3, slug: "groene-vlaggen-herkennen", title: "Groene Vlaggen Herkennen", type: "video", duration_minutes: 5, description: "Tekenen van een gezonde match" },
        { order: 4, slug: "je-selectiecriteria-bepalen", title: "Je Selectiecriteria Bepalen", type: "video", duration_minutes: 4, description: "Dealbreakers vs nice-to-haves" }
      ]
    },
    {
      order: 7,
      slug: "de-ontmoeting",
      title: "De Ontmoeting",
      phase: "ACTION",
      phase_label: "De Markt Op",
      description: "Van chat naar eerste date.",
      mindset_hook: "Een eerste date is geen sollicitatie. Het is een uitnodiging om samen nieuwsgierig te zijn.",
      ai_tool_id: 6,
      ai_tool_name: "Date Ideeën Generator",
      duration_minutes: 45,
      lessons: [
        { order: 1, slug: "wanneer-vraag-je-om-een-date", title: "Wanneer Vraag je om een Date?", type: "video", duration_minutes: 4, description: "Het juiste moment herkennen" },
        { order: 2, slug: "eerste-date-ideeen", title: "Eerste Date Ideeën", type: "video", duration_minutes: 4, description: "Locaties die connectie bevorderen" },
        { order: 3, slug: "veiligheid-en-grenzen", title: "Veiligheid en Grenzen", type: "video", duration_minutes: 5, description: "Praktische veiligheidstips" },
        { order: 4, slug: "de-date-zelf", title: "De Date Zelf", type: "video", duration_minutes: 4, description: "Mindset en praktische tips" }
      ]
    },
    {
      order: 8,
      slug: "communicatie-meesterschap",
      title: "Communicatie Meesterschap",
      phase: "ACTION",
      phase_label: "De Markt Op",
      description: "Non-Violent Communication in de praktijk.",
      mindset_hook: "De woorden die je kiest bepalen niet alleen wat je zegt — maar wie je wordt in de ogen van de ander.",
      ai_tool_id: 3,
      ai_tool_name: "Chat Coach",
      duration_minutes: 60,
      lessons: [
        { order: 1, slug: "de-basis-van-nvc", title: "De Basis van NVC", type: "video", duration_minutes: 5, description: "Observatie, Gevoel, Behoefte, Verzoek" },
        { order: 2, slug: "ik-boodschappen", title: "Ik-Boodschappen", type: "video", duration_minutes: 4, description: "Hoe je je behoeften uit zonder aanval" },
        { order: 3, slug: "actief-luisteren", title: "Actief Luisteren", type: "video", duration_minutes: 5, description: "De ander echt horen" },
        { order: 4, slug: "moeilijke-gesprekken-voeren", title: "Moeilijke Gesprekken Voeren", type: "video", duration_minutes: 5, description: "Conflict als kans voor groei" }
      ]
    },
    {
      order: 9,
      slug: "de-transitie",
      title: "De Transitie",
      phase: "SURRENDER",
      phase_label: "Relatie Bouwen",
      description: "Het DTR-gesprek (Define The Relationship).",
      mindset_hook: "Het gesprek over 'wat zijn wij' is niet het einde van de spanning — het is het begin van de echte verbinding.",
      ai_tool_id: 9,
      ai_tool_name: "Relationship Coach",
      duration_minutes: 45,
      lessons: [
        { order: 1, slug: "wat-is-het-dtr-gesprek", title: "Wat is het DTR-Gesprek?", type: "video", duration_minutes: 4, description: "Timing en intentie" },
        { order: 2, slug: "het-gesprek-voorbereiden", title: "Het Gesprek Voorbereiden", type: "video", duration_minutes: 5, description: "Wat wil jij eigenlijk?" },
        { order: 3, slug: "het-gesprek-voeren", title: "Het Gesprek Voeren", type: "video", duration_minutes: 5, description: "Scripts en voorbeelden" },
        { order: 4, slug: "na-het-gesprek", title: "Na het Gesprek", type: "video", duration_minutes: 4, description: "Omgaan met alle uitkomsten" }
      ]
    },
    {
      order: 10,
      slug: "onderhoud-en-groei",
      title: "Onderhoud & Groei",
      phase: "SURRENDER",
      phase_label: "Relatie Bouwen",
      description: "Gottman's Sound Relationship House in de praktijk.",
      mindset_hook: "Liefde is geen gevoel dat je overkomt — het is een vaardigheid die je ontwikkelt.",
      ai_tool_id: 8,
      ai_tool_name: "Love Language Quiz",
      duration_minutes: 60,
      lessons: [
        { order: 1, slug: "het-sound-relationship-house", title: "Het Sound Relationship House", type: "video", duration_minutes: 5, description: "Gottman's wetenschappelijke model" },
        { order: 2, slug: "love-maps-bouwen", title: "Love Maps Bouwen", type: "video", duration_minutes: 5, description: "Je partner echt leren kennen" },
        { order: 3, slug: "de-vijf-liefdestalen", title: "De Vijf Liefdestalen", type: "video", duration_minutes: 5, description: "Hoe je partner liefde ontvangt" },
        { order: 4, slug: "conflict-als-groei", title: "Conflict als Groei", type: "video", duration_minutes: 5, description: "De vier ruiters vermijden" }
      ]
    },
    {
      order: 11,
      slug: "integratie-en-veerkracht",
      title: "Integratie & Veerkracht",
      phase: "SURRENDER",
      phase_label: "Relatie Bouwen",
      description: "Hoe verweven jullie levens zonder jezelf te verliezen?",
      mindset_hook: "Ghosting vertelt je niets over jouw waarde — het vertelt je alles over hun capaciteit.",
      ai_tool_id: 104,
      ai_tool_name: "Ghosting Reframer",
      duration_minutes: 60,
      lessons: [
        { order: 1, slug: "levens-verweven", title: "Levens Verweven", type: "video", duration_minutes: 5, description: "Autonomie vs verbondenheid" },
        { order: 2, slug: "grenzen-in-relaties", title: "Grenzen in Relaties", type: "video", duration_minutes: 5, description: "Gezonde grenzen stellen" },
        { order: 3, slug: "omgaan-met-afwijzing", title: "Omgaan met Afwijzing", type: "video", duration_minutes: 5, description: "De psychologie van ghosting" },
        { order: 4, slug: "veerkracht-opbouwen", title: "Veerkracht Opbouwen", type: "video", duration_minutes: 5, description: "Terugkaatsen na tegenslag" }
      ]
    },
    {
      order: 12,
      slug: "onbreekbare-mindset",
      title: "Onbreekbare Mindset",
      phase: "SURRENDER",
      phase_label: "Relatie Bouwen",
      description: "De finale. Creëer rituelen en blik vooruit.",
      mindset_hook: "Je zoekt niet meer naar de juiste persoon. Je bent de juiste persoon geworden.",
      ai_tool_id: 12,
      ai_tool_name: "Goal Tracker",
      duration_minutes: 45,
      lessons: [
        { order: 1, slug: "je-transformatie-reflecteren", title: "Je Transformatie Reflecteren", type: "video", duration_minutes: 4, description: "Van start tot nu" },
        { order: 2, slug: "rituelen-voor-groei", title: "Rituelen voor Groei", type: "video", duration_minutes: 5, description: "Gewoontes die je vooruitgang vasthouden" },
        { order: 3, slug: "je-toekomstvisie", title: "Je Toekomstvisie", type: "video", duration_minutes: 4, description: "Wat is je volgende hoofdstuk?" },
        { order: 4, slug: "afscheid-en-vooruit", title: "Afscheid en Vooruit", type: "video", duration_minutes: 4, description: "Je bent klaar. Ga ervoor." }
      ]
    }
  ]
};

async function migrate() {
  console.log('🚀 Starting De Transformatie 3.0 migration...\n');

  try {
    // Step 1: Check/Create programs table entry
    console.log('📊 Stap 1: Programma record aanmaken/updaten...');

    // Check if programs table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'programs'
      ) as exists
    `;

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Programs tabel bestaat niet! Run eerst database-setup-programs.sql');
      process.exit(1);
    }

    // Check if transformatie program exists
    const programCheck = await sql`
      SELECT id, name FROM programs WHERE slug = 'transformatie' LIMIT 1
    `;

    let programId: number;

    if (programCheck.rows.length === 0) {
      // Create new program
      const newProgram = await sql`
        INSERT INTO programs (
          slug, name, tagline, transformation_promise,
          price_regular, price_beta, duration_days,
          outcome_category, target_audience, tangible_proof, tier, is_active
        ) VALUES (
          'transformatie',
          'De Transformatie 3.0',
          'Van Single naar Duurzame Relatie in 90 Dagen',
          'De enige datingcursus die je leert hoe je een relatie krijgt én houdt',
          29700, 14700, 365,
          'transformation',
          'Singles 25-45 jaar die klaar zijn met aanmodderen',
          '12 modules, 48 video lessen, 4 exclusieve AI tools',
          'transformatie',
          true
        )
        RETURNING id
      `;
      programId = newProgram.rows[0].id;
      console.log(`  ✓ Nieuw Transformatie programma aangemaakt (ID: ${programId})`);
    } else {
      // Update existing program
      programId = programCheck.rows[0].id;
      await sql`
        UPDATE programs SET
          name = 'De Transformatie 3.0',
          tagline = 'Van Single naar Duurzame Relatie in 90 Dagen',
          transformation_promise = 'De enige datingcursus die je leert hoe je een relatie krijgt én houdt',
          price_regular = 29700,
          price_beta = 14700,
          duration_days = 365,
          tangible_proof = '12 modules, 48 video lessen, 4 exclusieve AI tools'
        WHERE id = ${programId}
      `;
      console.log(`  ✓ Bestaand Transformatie programma geüpdatet (ID: ${programId})`);
    }

    // Step 2: Create module tables
    console.log('\n📊 Stap 2: Tabellen aanmaken...');

    // Drop existing tables (cascade)
    try {
      await sql`DROP TABLE IF EXISTS transformatie_lesson_progress CASCADE`;
      await sql`DROP TABLE IF EXISTS transformatie_lessons CASCADE`;
      await sql`DROP TABLE IF EXISTS transformatie_modules CASCADE`;
      console.log('  ✓ Oude tabellen verwijderd (indien aanwezig)');
    } catch (err: any) {
      console.log('  ⚠️ Drop tables warning:', err.message?.substring(0, 50));
    }

    // Create transformatie_modules table
    await sql`
      CREATE TABLE transformatie_modules (
        id SERIAL PRIMARY KEY,
        program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        module_order INTEGER NOT NULL,
        slug VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        phase VARCHAR(20) NOT NULL CHECK (phase IN ('DESIGN', 'ACTION', 'SURRENDER')),
        phase_label VARCHAR(50) NOT NULL,
        mindset_hook TEXT,
        ai_tool_id INTEGER,
        ai_tool_name VARCHAR(100),
        duration_minutes INTEGER,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(program_id, module_order),
        UNIQUE(program_id, slug)
      )
    `;
    console.log('  ✓ transformatie_modules tabel aangemaakt');

    // Create transformatie_lessons table
    await sql`
      CREATE TABLE transformatie_lessons (
        id SERIAL PRIMARY KEY,
        module_id INTEGER NOT NULL REFERENCES transformatie_modules(id) ON DELETE CASCADE,
        lesson_order INTEGER NOT NULL,
        slug VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        lesson_type VARCHAR(20) DEFAULT 'video',
        duration_minutes INTEGER,
        video_url VARCHAR(500),
        video_thumbnail VARCHAR(500),
        content JSONB,
        reflectie JSONB,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(module_id, lesson_order),
        UNIQUE(module_id, slug)
      )
    `;
    console.log('  ✓ transformatie_lessons tabel aangemaakt');

    // Create progress tracking table
    await sql`
      CREATE TABLE transformatie_lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL REFERENCES transformatie_lessons(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        video_watched_seconds INTEGER DEFAULT 0,
        video_completed BOOLEAN DEFAULT false,
        reflectie_completed BOOLEAN DEFAULT false,
        reflectie_answers JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      )
    `;
    console.log('  ✓ transformatie_lesson_progress tabel aangemaakt');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_transformatie_modules_program_id ON transformatie_modules(program_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transformatie_modules_phase ON transformatie_modules(phase)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transformatie_lessons_module_id ON transformatie_lessons(module_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transformatie_lesson_progress_user_id ON transformatie_lesson_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transformatie_lesson_progress_lesson_id ON transformatie_lesson_progress(lesson_id)`;
    console.log('  ✓ Indexes aangemaakt');

    // Step 3: Create AI Tool tables
    console.log('\n📊 Stap 3: AI Tool tabellen aanmaken...');

    // Vibe Check results
    await sql`
      CREATE TABLE IF NOT EXISTS vibe_check_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        image_url TEXT,
        emotional_analysis JSONB,
        vibe_scores JSONB,
        suggestions TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('  ✓ vibe_check_results tabel aangemaakt');

    // Energie Batterij logs
    await sql`
      CREATE TABLE IF NOT EXISTS energie_batterij_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        energy_level INTEGER,
        answers JSONB,
        recommendation TEXT,
        swipe_allowed BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('  ✓ energie_batterij_logs tabel aangemaakt');

    // 36 Vragen sessions
    await sql`
      CREATE TABLE IF NOT EXISTS vragen_36_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        current_set INTEGER DEFAULT 1,
        current_question INTEGER DEFAULT 1,
        answers JSONB DEFAULT '[]',
        vulnerability_scores JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('  ✓ vragen_36_sessions tabel aangemaakt');

    // Ghosting Reframer sessions
    await sql`
      CREATE TABLE IF NOT EXISTS ghosting_reframe_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        situation TEXT,
        emotions TEXT[],
        reframe_steps JSONB,
        self_compassion_completed BOOLEAN DEFAULT false,
        breathing_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('  ✓ ghosting_reframe_sessions tabel aangemaakt');

    // Step 4: Seed modules and lessons
    console.log('\n📝 Stap 4: Modules en lessen seeden...');

    for (const module of courseStructure.modules) {
      // Insert module
      const insertedModule = await sql`
        INSERT INTO transformatie_modules (
          program_id, module_order, slug, title, description,
          phase, phase_label, mindset_hook,
          ai_tool_id, ai_tool_name, duration_minutes,
          is_published
        ) VALUES (
          ${programId}, ${module.order}, ${module.slug}, ${module.title}, ${module.description},
          ${module.phase}, ${module.phase_label}, ${module.mindset_hook},
          ${module.ai_tool_id}, ${module.ai_tool_name}, ${module.duration_minutes},
          ${module.order <= 4}
        )
        RETURNING id
      `;

      const moduleId = insertedModule.rows[0].id;
      console.log(`  ✓ Module ${module.order}: ${module.title} (${module.phase})`);

      // Insert lessons
      for (const lesson of module.lessons) {
        await sql`
          INSERT INTO transformatie_lessons (
            module_id, lesson_order, slug, title, description,
            lesson_type, duration_minutes,
            reflectie,
            is_published
          ) VALUES (
            ${moduleId}, ${lesson.order}, ${lesson.slug}, ${lesson.title}, ${lesson.description},
            ${lesson.type}, ${lesson.duration_minutes},
            ${JSON.stringify({
              spiegel: `Wat betekent "${module.mindset_hook}" voor jou persoonlijk?`,
              identiteit: `Hoe past dit bij wie je bent in de liefde?`,
              actie: `Wat is één concrete stap die je kunt nemen na deze les?`
            })},
            ${module.order <= 4}
          )
        `;
        console.log(`    ✓ Les ${lesson.order}: ${lesson.title}`);
      }
    }

    // Step 5: Verify
    console.log('\n🔍 Stap 5: Verificatie...');

    const modulesCount = await sql`
      SELECT COUNT(*) as count FROM transformatie_modules
      WHERE program_id = ${programId}
    `;

    const lessonsCount = await sql`
      SELECT COUNT(*) as count FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tm.program_id = ${programId}
    `;

    const publishedModules = await sql`
      SELECT COUNT(*) as count FROM transformatie_modules
      WHERE program_id = ${programId} AND is_published = true
    `;

    console.log(`  • ${modulesCount.rows[0].count} modules aangemaakt`);
    console.log(`  • ${lessonsCount.rows[0].count} lessen aangemaakt`);
    console.log(`  • ${publishedModules.rows[0].count} modules gepubliceerd (Wave 1: DESIGN fase)`);

    console.log('\n✅ Migratie voltooid!');
    console.log('\n📌 Next steps:');
    console.log('  1. Bouw de 4 AI tool routes');
    console.log('  2. Voeg tools toe aan routing.ts');
    console.log('  3. Update access-control.ts');
    console.log('  4. Bouw dashboard componenten');

  } catch (error) {
    console.error('\n❌ Migratie mislukt:', error);
    process.exit(1);
  }
}

// Run migration
migrate().then(() => {
  process.exit(0);
});
