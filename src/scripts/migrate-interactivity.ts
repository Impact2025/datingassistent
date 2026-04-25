/**
 * Migratie: Transformatie Interactiviteit
 *
 * Voegt toe:
 * 1. transformatie_lesson_quizzes     — kennisquiz vragen per les
 * 2. transformatie_quiz_attempts      — gebruiker quiz-pogingen
 * 3. assignment_completed kolom       — opdracht-tracking in lesson_progress
 * 4. transformatie_badges             — badge definitie tabel
 * 5. transformatie_user_badges        — verdiende badges per gebruiker
 * 6. Seed: 15 badges
 *
 * Run: npx tsx src/scripts/migrate-interactivity.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

const log = (...args: any[]) => console.log(...args);

async function createQuizTables() {
  log('\n📝 Quiz tabellen aanmaken...');

  await sql`
    CREATE TABLE IF NOT EXISTS transformatie_lesson_quizzes (
      id                SERIAL PRIMARY KEY,
      lesson_id         INTEGER NOT NULL REFERENCES transformatie_lessons(id) ON DELETE CASCADE,
      question_order    INTEGER NOT NULL,
      question_type     VARCHAR(20) NOT NULL DEFAULT 'multiple_choice',
      question_text     TEXT NOT NULL,
      options           JSONB NOT NULL,
      correct_answer    VARCHAR(255) NOT NULL,
      explanation       TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(lesson_id, question_order)
    )
  `;
  log('  ✓ transformatie_lesson_quizzes');

  await sql`
    CREATE TABLE IF NOT EXISTS transformatie_quiz_attempts (
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER NOT NULL,
      lesson_id       INTEGER NOT NULL REFERENCES transformatie_lessons(id) ON DELETE CASCADE,
      answers         JSONB NOT NULL,
      score           INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
      completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  log('  ✓ transformatie_quiz_attempts');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson
      ON transformatie_quiz_attempts(user_id, lesson_id)
  `;
  log('  ✓ index op quiz_attempts');
}

async function extendProgressTable() {
  log('\n📋 Assignment tracking toevoegen aan lesson_progress...');

  await sql`
    ALTER TABLE transformatie_lesson_progress
      ADD COLUMN IF NOT EXISTS assignment_completed      BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS assignment_completed_at   TIMESTAMPTZ
  `;
  log('  ✓ assignment_completed + assignment_completed_at kolommen toegevoegd');
}

async function createBadgeTables() {
  log('\n🏅 Badge tabellen aanmaken...');

  await sql`
    CREATE TABLE IF NOT EXISTS transformatie_badges (
      id              SERIAL PRIMARY KEY,
      slug            VARCHAR(100) UNIQUE NOT NULL,
      title           VARCHAR(255) NOT NULL,
      description     TEXT,
      icon            VARCHAR(50),
      trigger_type    VARCHAR(50) NOT NULL,
      trigger_value   JSONB,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  log('  ✓ transformatie_badges');

  await sql`
    CREATE TABLE IF NOT EXISTS transformatie_user_badges (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      badge_id    INTEGER NOT NULL REFERENCES transformatie_badges(id) ON DELETE CASCADE,
      earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, badge_id)
    )
  `;
  log('  ✓ transformatie_user_badges');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_badges_user
      ON transformatie_user_badges(user_id)
  `;
  log('  ✓ index op user_badges');
}

interface Badge {
  slug: string;
  title: string;
  description: string;
  icon: string;
  trigger_type: string;
  trigger_value: object;
}

const badges: Badge[] = [
  // Fase completion badges
  {
    slug: 'design-fase-voltooid',
    title: 'Architect van Liefde',
    description: 'Je hebt de volledige DESIGN fase afgerond — je kent jezelf als dater.',
    icon: 'PenTool',
    trigger_type: 'phase_complete',
    trigger_value: { phase: 'DESIGN' },
  },
  {
    slug: 'action-fase-voltooid',
    title: 'Dapper in Actie',
    description: 'Je hebt de volledige ACTION fase afgerond — je durft de wereld op.',
    icon: 'Zap',
    trigger_type: 'phase_complete',
    trigger_value: { phase: 'ACTION' },
  },
  {
    slug: 'surrender-fase-voltooid',
    title: 'Meester van Overgave',
    description: 'Je hebt de volledige SURRENDER fase afgerond — je bouwt vanuit liefde.',
    icon: 'Heart',
    trigger_type: 'phase_complete',
    trigger_value: { phase: 'SURRENDER' },
  },

  // Module milestone badges (per fase één halverwege, één aan het einde)
  {
    slug: 'module-1-voltooid',
    title: 'Eerste Stap Gezet',
    description: 'Module 1 afgerond: je hebt jouw liefdesleven gedesigned.',
    icon: 'Target',
    trigger_type: 'module_complete',
    trigger_value: { module_order: 1 },
  },
  {
    slug: 'module-4-voltooid',
    title: 'DESIGN Afgesloten',
    description: 'Module 4 afgerond: je weet wie jij bent als dater.',
    icon: 'Compass',
    trigger_type: 'module_complete',
    trigger_value: { module_order: 4 },
  },
  {
    slug: 'module-5-voltooid',
    title: 'De Verbinder',
    description: 'Module 5 afgerond: jij maakt echte verbinding in gesprekken.',
    icon: 'MessageCircle',
    trigger_type: 'module_complete',
    trigger_value: { module_order: 5 },
  },
  {
    slug: 'module-8-voltooid',
    title: 'Communicatie Meester',
    description: 'Module 8 afgerond: jij spreekt de taal van behoeften.',
    icon: 'Mic',
    trigger_type: 'module_complete',
    trigger_value: { module_order: 8 },
  },
  {
    slug: 'module-12-voltooid',
    title: 'Transformatie Voltooid',
    description: 'Alle 12 modules afgerond. Jij bent de juiste persoon geworden.',
    icon: 'Award',
    trigger_type: 'module_complete',
    trigger_value: { module_order: 12 },
  },

  // Special achievement badges
  {
    slug: 'alle-reflecties-module',
    title: 'Diepe Duiker',
    description: 'Alle drie reflectievragen van een module ingevuld.',
    icon: 'BookOpen',
    trigger_type: 'reflections_complete',
    trigger_value: { scope: 'module' },
  },
  {
    slug: 'eerste-quiz-perfect',
    title: 'Scherpe Geest',
    description: 'Een kennisquiz met 100% score afgerond.',
    icon: 'Star',
    trigger_type: 'quiz_perfect',
    trigger_value: { score: 100 },
  },
  {
    slug: 'eerste-opdracht-gedaan',
    title: 'Van Woorden naar Daden',
    description: 'Je eerste Actie-opdracht aangevinkt als gedaan.',
    icon: 'CheckCircle',
    trigger_type: 'assignment_complete',
    trigger_value: { count: 1 },
  },
  {
    slug: 'tien-opdrachten-gedaan',
    title: 'Consistent in Actie',
    description: '10 Actie-opdrachten aangevinkt als gedaan.',
    icon: 'TrendingUp',
    trigger_type: 'assignment_complete',
    trigger_value: { count: 10 },
  },
  {
    slug: 'eerste-ai-feedback',
    title: 'Spiegel Gebruiker',
    description: 'Voor het eerst AI feedback gevraagd op een reflectie.',
    icon: 'Sparkles',
    trigger_type: 'ai_feedback_used',
    trigger_value: { count: 1 },
  },
  {
    slug: 'zeven-dagen-streak',
    title: '7-Daagse Stroom',
    description: '7 dagen op rij een les geopend of reflectie ingevuld.',
    icon: 'Flame',
    trigger_type: 'streak',
    trigger_value: { days: 7 },
  },
  {
    slug: 'programma-halverwege',
    title: 'Halverwege de Berg',
    description: '24 van de 48 lessen voltooid — je bent halverwege de transformatie.',
    icon: 'Mountain',
    trigger_type: 'lessons_complete',
    trigger_value: { count: 24 },
  },
];

async function seedBadges() {
  log('\n🌱 Badges seeden...');
  let inserted = 0;
  let skipped = 0;

  for (const badge of badges) {
    try {
      await sql`
        INSERT INTO transformatie_badges (slug, title, description, icon, trigger_type, trigger_value)
        VALUES (
          ${badge.slug},
          ${badge.title},
          ${badge.description},
          ${badge.icon},
          ${badge.trigger_type},
          ${JSON.stringify(badge.trigger_value)}::jsonb
        )
        ON CONFLICT (slug) DO UPDATE SET
          title         = EXCLUDED.title,
          description   = EXCLUDED.description,
          icon          = EXCLUDED.icon,
          trigger_type  = EXCLUDED.trigger_type,
          trigger_value = EXCLUDED.trigger_value
      `;
      log(`  ✓ ${badge.slug}`);
      inserted++;
    } catch (err) {
      console.error(`  ❌ Fout bij badge ${badge.slug}:`, err);
      skipped++;
    }
  }

  log(`\n  Badges: ${inserted} ingevoegd/bijgewerkt, ${skipped} mislukt`);
}

async function main() {
  log('🚀 Transformatie Interactiviteit Migratie\n');
  log('══════════════════════════════════════════');

  try {
    await createQuizTables();
    await extendProgressTable();
    await createBadgeTables();
    await seedBadges();

    log('\n══════════════════════════════════════════');
    log('✅ Migratie succesvol afgerond!\n');
    log('Volgende stap: voeg quiz-content toe via een seed script');
    log('en draai: npx tsx src/scripts/update-transformatie-lesson-content.ts');
  } catch (err) {
    console.error('\n❌ Migratie mislukt:', err);
    process.exit(1);
  }
}

main().catch(console.error);
