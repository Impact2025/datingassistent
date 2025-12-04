/**
 * Complete Content Delivery System Migration
 *
 * Creates all necessary tables for:
 * - Standard program progress tracking (module/lesson based)
 * - Kickstart day-based progress tracking
 * - Achievements and gamification
 *
 * Run: npx tsx src/scripts/migrate-complete-content-system.ts
 */

import { sql } from '@vercel/postgres';

interface MigrationStep {
  name: string;
  execute: () => Promise<void>;
}

async function migrate() {
  console.log('🚀 Starting Complete Content System Migration...\n');
  console.log('=' .repeat(60));

  const steps: MigrationStep[] = [
    {
      name: 'Create program_modules table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS program_modules (
            id SERIAL PRIMARY KEY,
            program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
            module_number INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            learning_objectives TEXT[],
            unlock_after_module_id INTEGER REFERENCES program_modules(id),
            unlock_immediately BOOLEAN DEFAULT false,
            estimated_duration_minutes INTEGER,
            icon_emoji VARCHAR(10) DEFAULT '📚',
            cover_image_url TEXT,
            display_order INTEGER NOT NULL,
            is_published BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(program_id, module_number)
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_modules_program ON program_modules(program_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_modules_order ON program_modules(program_id, display_order)`;
      }
    },
    {
      name: 'Create lessons table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS lessons (
            id SERIAL PRIMARY KEY,
            module_id INTEGER NOT NULL REFERENCES program_modules(id) ON DELETE CASCADE,
            lesson_number INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            content_type VARCHAR(50) NOT NULL,
            video_provider VARCHAR(50),
            video_id TEXT,
            video_url TEXT,
            video_thumbnail_url TEXT,
            duration_seconds INTEGER,
            text_content TEXT,
            quiz_data JSONB,
            download_url TEXT,
            download_filename VARCHAR(255),
            download_size_bytes BIGINT,
            transcript TEXT,
            unlock_after_lesson_id INTEGER REFERENCES lessons(id),
            requires_previous_completion BOOLEAN DEFAULT true,
            is_preview BOOLEAN DEFAULT false,
            estimated_duration_minutes INTEGER,
            difficulty_level VARCHAR(50),
            tags TEXT[],
            display_order INTEGER NOT NULL,
            is_published BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, display_order)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons(content_type)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_lessons_preview ON lessons(is_preview) WHERE is_preview = true`;
      }
    },
    {
      name: 'Create user_lesson_progress table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS user_lesson_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            is_completed BOOLEAN DEFAULT false,
            watch_time_seconds INTEGER DEFAULT 0,
            last_position_seconds INTEGER DEFAULT 0,
            watched_percentage INTEGER DEFAULT 0,
            quiz_score INTEGER,
            quiz_attempts INTEGER DEFAULT 0,
            quiz_passed BOOLEAN DEFAULT false,
            quiz_answers JSONB,
            time_spent_seconds INTEGER DEFAULT 0,
            revisit_count INTEGER DEFAULT 0,
            last_accessed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, lesson_id)
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_completed ON user_lesson_progress(user_id, is_completed)`;
      }
    },
    {
      name: 'Create user_module_progress table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS user_module_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            module_id INTEGER NOT NULL REFERENCES program_modules(id) ON DELETE CASCADE,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            is_completed BOOLEAN DEFAULT false,
            total_lessons INTEGER DEFAULT 0,
            completed_lessons INTEGER DEFAULT 0,
            progress_percentage INTEGER DEFAULT 0,
            total_time_spent_seconds INTEGER DEFAULT 0,
            last_accessed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, module_id)
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_module_progress_user ON user_module_progress(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_module_progress_module ON user_module_progress(module_id)`;
      }
    },
    {
      name: 'Create user_program_progress table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS user_program_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            is_completed BOOLEAN DEFAULT false,
            total_modules INTEGER DEFAULT 0,
            completed_modules INTEGER DEFAULT 0,
            total_lessons INTEGER DEFAULT 0,
            completed_lessons INTEGER DEFAULT 0,
            overall_progress_percentage INTEGER DEFAULT 0,
            current_module_id INTEGER,
            current_lesson_id INTEGER,
            total_time_spent_seconds INTEGER DEFAULT 0,
            last_accessed_at TIMESTAMP,
            certificate_issued BOOLEAN DEFAULT false,
            certificate_issued_at TIMESTAMP,
            certificate_url TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, program_id)
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_program_progress_user ON user_program_progress(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_program_progress_program ON user_program_progress(program_id)`;
      }
    },
    {
      name: 'Create program_weeks table (Kickstart)',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS program_weeks (
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
        await sql`CREATE INDEX IF NOT EXISTS idx_program_weeks_program_id ON program_weeks(program_id)`;
      }
    },
    {
      name: 'Create program_days table (Kickstart)',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS program_days (
            id SERIAL PRIMARY KEY,
            week_id INTEGER NOT NULL REFERENCES program_weeks(id) ON DELETE CASCADE,
            program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
            dag_nummer INTEGER NOT NULL,
            titel VARCHAR(255) NOT NULL,
            emoji VARCHAR(10),
            dag_type VARCHAR(20) NOT NULL,
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
        await sql`CREATE INDEX IF NOT EXISTS idx_program_days_week_id ON program_days(week_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_program_days_program_id ON program_days(program_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_program_days_dag_nummer ON program_days(dag_nummer)`;
      }
    },
    {
      name: 'Create user_day_progress table (Kickstart)',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS user_day_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
            day_id INTEGER NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'locked',
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
        await sql`CREATE INDEX IF NOT EXISTS idx_user_day_progress_user_id ON user_day_progress(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_day_progress_day_id ON user_day_progress(day_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_day_progress_status ON user_day_progress(status)`;
      }
    },
    {
      name: 'Create user_weekly_metrics table (Kickstart)',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS user_weekly_metrics (
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
        await sql`CREATE INDEX IF NOT EXISTS idx_user_weekly_metrics_user_id ON user_weekly_metrics(user_id)`;
      }
    },
    {
      name: 'Create achievements table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS achievements (
            id SERIAL PRIMARY KEY,
            achievement_key VARCHAR(100) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            icon_emoji VARCHAR(10),
            badge_image_url TEXT,
            criteria_type VARCHAR(50),
            criteria_value INTEGER,
            points INTEGER DEFAULT 0,
            rarity VARCHAR(50) DEFAULT 'common',
            created_at TIMESTAMP DEFAULT NOW()
          )
        `;
      }
    },
    {
      name: 'Create user_achievements table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS user_achievements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
            unlocked_at TIMESTAMP DEFAULT NOW(),
            is_viewed BOOLEAN DEFAULT false,
            UNIQUE(user_id, achievement_id)
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_viewed ON user_achievements(user_id, is_viewed)`;
      }
    },
    {
      name: 'Create user_lesson_bookmarks table',
      execute: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS user_lesson_bookmarks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            note TEXT,
            video_timestamp_seconds INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, lesson_id)
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON user_lesson_bookmarks(user_id)`;
      }
    },
    {
      name: 'Initialize user progress for existing Kickstart enrollments',
      execute: async () => {
        // Find all users enrolled in Kickstart who don't have progress initialized
        const kickstartProgram = await sql`
          SELECT id FROM programs WHERE slug = 'kickstart' LIMIT 1
        `;

        if (kickstartProgram.rows.length === 0) {
          console.log('    ⚠️ Kickstart program not found, skipping user progress initialization');
          return;
        }

        const programId = kickstartProgram.rows[0].id;

        // Get all users enrolled in Kickstart
        const enrolledUsers = await sql`
          SELECT DISTINCT pe.user_id
          FROM program_enrollments pe
          WHERE pe.program_id = ${programId}
            AND pe.status = 'active'
            AND NOT EXISTS (
              SELECT 1 FROM user_day_progress udp
              WHERE udp.user_id = pe.user_id
                AND udp.program_id = ${programId}
            )
        `;

        if (enrolledUsers.rows.length === 0) {
          console.log('    ℹ️ No users need progress initialization');
          return;
        }

        // Get all days for Kickstart
        const days = await sql`
          SELECT id, dag_nummer FROM program_days
          WHERE program_id = ${programId}
          ORDER BY dag_nummer
        `;

        if (days.rows.length === 0) {
          console.log('    ⚠️ No days found for Kickstart, skipping initialization');
          return;
        }

        // Initialize progress for each user
        for (const user of enrolledUsers.rows) {
          for (const day of days.rows) {
            // Day 1 is available, rest are locked
            const status = day.dag_nummer === 1 ? 'available' : 'locked';

            await sql`
              INSERT INTO user_day_progress (user_id, program_id, day_id, status)
              VALUES (${user.user_id}, ${programId}, ${day.id}, ${status})
              ON CONFLICT (user_id, day_id) DO NOTHING
            `;
          }
          console.log(`    ✓ Initialized progress for user ${user.user_id}`);
        }
      }
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const step of steps) {
    try {
      console.log(`\n📋 ${step.name}...`);
      await step.execute();
      console.log(`   ✓ Success`);
      successCount++;
    } catch (error: any) {
      // Check if it's just a "table already exists" or similar benign error
      if (error.message?.includes('already exists') ||
          error.message?.includes('duplicate key')) {
        console.log(`   ✓ Already exists (skipped)`);
        successCount++;
      } else {
        console.error(`   ✗ Error: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✓ Successful: ${successCount}`);
  console.log(`   ✗ Errors: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n✅ Migration completed successfully!');

    // Verify tables exist
    console.log('\n🔍 Verification:');
    const tables = [
      'program_modules', 'lessons', 'user_lesson_progress',
      'user_module_progress', 'user_program_progress',
      'program_weeks', 'program_days', 'user_day_progress',
      'user_weekly_metrics', 'achievements', 'user_achievements'
    ];

    for (const table of tables) {
      try {
        const result = await sql.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ✓ ${table}: ${result.rows[0].count} rows`);
      } catch {
        console.log(`   ✗ ${table}: not found or error`);
      }
    }
  } else {
    console.log('\n⚠️ Migration completed with some errors. Please review the logs above.');
  }

  console.log('\n📌 Next steps:');
  console.log('   1. The enrolled-programs API should now work correctly');
  console.log('   2. Test: http://localhost:9000/dashboard');
  console.log('   3. Kickstart should appear in "Mijn Programma\'s" widget');
}

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
