import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Database Schema voor Journey Tracking & Achievements
 * Sprint 3: Het Pad - Full Implementation
 */
export async function GET() {
  try {
    console.log('🎯 Initializing Journey Achievements tables...');

    // 1. User Journey Progress - Detailed tracking per phase
    await sql`
      CREATE TABLE IF NOT EXISTS user_journey_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_phase INTEGER NOT NULL DEFAULT 1 CHECK (current_phase >= 1 AND current_phase <= 5),
        phase_1_progress INTEGER DEFAULT 0 CHECK (phase_1_progress >= 0 AND phase_1_progress <= 100),
        phase_2_progress INTEGER DEFAULT 0 CHECK (phase_2_progress >= 0 AND phase_2_progress <= 100),
        phase_3_progress INTEGER DEFAULT 0 CHECK (phase_3_progress >= 0 AND phase_3_progress <= 100),
        phase_4_progress INTEGER DEFAULT 0 CHECK (phase_4_progress >= 0 AND phase_4_progress <= 100),
        phase_5_progress INTEGER DEFAULT 0 CHECK (phase_5_progress >= 0 AND phase_5_progress <= 100),
        overall_progress INTEGER DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
        phase_1_completed_at TIMESTAMP,
        phase_2_completed_at TIMESTAMP,
        phase_3_completed_at TIMESTAMP,
        phase_4_completed_at TIMESTAMP,
        phase_5_completed_at TIMESTAMP,
        journey_started_at TIMESTAMP DEFAULT NOW(),
        last_activity_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;

    // 2. Tool Completions - Track which tools user has completed
    await sql`
      CREATE TABLE IF NOT EXISTS tool_completions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tool_id VARCHAR(100) NOT NULL,
        tool_name VARCHAR(255) NOT NULL,
        phase INTEGER NOT NULL CHECK (phase >= 1 AND phase <= 5),
        completed_at TIMESTAMP DEFAULT NOW(),
        completion_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, tool_id)
      )
    `;

    // 3. Achievements - Available achievements
    await sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        achievement_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        badge_icon VARCHAR(50),
        badge_color VARCHAR(50),
        points INTEGER DEFAULT 10,
        unlock_criteria JSONB,
        rarity VARCHAR(20) DEFAULT 'common',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 4. User Achievements - Track earned achievements
    await sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_id VARCHAR(100) NOT NULL,
        earned_at TIMESTAMP DEFAULT NOW(),
        notified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, achievement_id)
      )
    `;

    // 5. Journey Milestones - Important events in user journey
    await sql`
      CREATE TABLE IF NOT EXISTS journey_milestones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        milestone_type VARCHAR(100) NOT NULL,
        milestone_name VARCHAR(255) NOT NULL,
        description TEXT,
        phase INTEGER CHECK (phase >= 1 AND phase <= 5),
        milestone_data JSONB,
        achieved_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 6. Notifications - Achievement & milestone notifications
    await sql`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        action_url VARCHAR(255),
        action_text VARCHAR(100),
        icon VARCHAR(50),
        color VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        priority INTEGER DEFAULT 1,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Insert default achievements
    await sql`
      INSERT INTO achievements (achievement_id, name, description, category, badge_icon, badge_color, points, rarity, unlock_criteria)
      VALUES
        -- Phase 1 Achievements
        ('first_steps', 'Eerste Stappen', 'Je bent begonnen aan je dating journey!', 'journey', 'Footprints', 'blue', 10, 'common', '{"type":"journey_start"}'),
        ('hechtingsstijl_master', 'Hechtingsstijl Expert', 'Hechtingsstijl assessment voltooid', 'assessment', 'Heart', 'pink', 25, 'uncommon', '{"tool":"hechtingsstijl"}'),
        ('emotioneel_ready', 'Emotioneel Klaar', 'Emotionele readiness check voltooid', 'assessment', 'Sparkles', 'blue', 20, 'common', '{"tool":"emotionele-readiness"}'),
        ('zelfbeeld_unlocked', 'Zelfkennis Koning', 'Zelfbeeld assessment voltooid', 'assessment', 'User', 'purple', 25, 'uncommon', '{"tool":"zelfbeeld"}'),
        ('phase_1_complete', 'Fundament Gelegd', 'Fase 1 volledig afgerond!', 'phase', 'Award', 'gold', 50, 'rare', '{"phase":1,"complete":true}'),

        -- Phase 2 Achievements
        ('first_photo', 'Camera Klaar', 'Eerste profielfoto geüpload', 'profile', 'Camera', 'indigo', 15, 'common', '{"action":"photo_upload"}'),
        ('bio_writer', 'Bio Schrijver', 'Profiel bio geschreven', 'profile', 'FileText', 'green', 20, 'common', '{"action":"bio_written"}'),
        ('dating_style_expert', 'Dating Stijl Expert', 'Dating stijl scan voltooid', 'assessment', 'Compass', 'rose', 25, 'uncommon', '{"tool":"dating-stijl"}'),
        ('phase_2_complete', 'Profiel Perfect', 'Fase 2 volledig afgerond!', 'phase', 'Award', 'gold', 50, 'rare', '{"phase":2,"complete":true}'),

        -- Phase 3 Achievements
        ('conversation_starter', 'Gesprek Starter', 'Eerste opener gegenereerd', 'communication', 'MessageCircle', 'blue', 15, 'common', '{"action":"opener_generated"}'),
        ('chat_coach_user', 'Chat Coach Pro', '10+ AI chat coaching sessies', 'communication', 'Bot', 'purple', 30, 'uncommon', '{"chat_sessions":10}'),
        ('phase_3_complete', 'Communicatie Master', 'Fase 3 volledig afgerond!', 'phase', 'Award', 'gold', 50, 'rare', '{"phase":3,"complete":true}'),

        -- Phase 4 Achievements
        ('first_date_planned', 'Date Planner', 'Eerste date gepland', 'dating', 'Calendar', 'orange', 20, 'common', '{"action":"date_planned"}'),
        ('date_reflection_master', 'Reflectie Expert', '5+ date reflecties ingevuld', 'dating', 'BookOpen', 'blue', 35, 'uncommon', '{"reflections":5}'),
        ('phase_4_complete', 'Actief Dater', 'Fase 4 volledig afgerond!', 'phase', 'Award', 'gold', 50, 'rare', '{"phase":4,"complete":true}'),

        -- Phase 5 Achievements
        ('pattern_analyzer', 'Patroon Herkenner', 'Relatiepatronen analyse voltooid', 'growth', 'TrendingUp', 'teal', 30, 'uncommon', '{"tool":"relatiepatronen"}'),
        ('vision_creator', 'Visie Maker', 'Levensvisie tool voltooid', 'growth', 'Target', 'purple', 30, 'uncommon', '{"tool":"levensvisie"}'),
        ('phase_5_complete', 'Groei Expert', 'Fase 5 volledig afgerond!', 'phase', 'Award', 'gold', 50, 'rare', '{"phase":5,"complete":true}'),

        -- Special Achievements
        ('journey_complete', '🏆 Journey Held', 'ALLE 5 fases voltooid!', 'special', 'Trophy', 'rainbow', 100, 'legendary', '{"all_phases_complete":true}'),
        ('early_bird', 'Ochtend Persoon', '10+ sessies voor 10:00', 'engagement', 'Sunrise', 'yellow', 20, 'uncommon', '{"morning_sessions":10}'),
        ('night_owl', 'Nacht Uil', '10+ sessies na 22:00', 'engagement', 'Moon', 'indigo', 20, 'uncommon', '{"night_sessions":10}'),
        ('consistent_user', 'Consistent', '7 dagen op rij actief', 'engagement', 'Flame', 'orange', 40, 'rare', '{"streak":7}'),
        ('super_achiever', 'Super Achiever', '10+ achievements verdiend', 'special', 'Star', 'gold', 50, 'rare', '{"achievement_count":10}'),
        ('iris_friend', 'Iris BFF', '50+ AI coach gesprekken', 'engagement', 'MessageHeart', 'pink', 45, 'rare', '{"iris_chats":50}')
      ON CONFLICT (achievement_id) DO NOTHING
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_journey_progress_user ON user_journey_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tool_completions_user ON tool_completions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id, is_read)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_milestones_user ON journey_milestones(user_id)`;

    console.log('✅ Journey Achievements tables initialized successfully!');

    return NextResponse.json({
      success: true,
      message: 'Journey achievements database initialized',
      tables: [
        'user_journey_progress',
        'tool_completions',
        'achievements',
        'user_achievements',
        'journey_milestones',
        'user_notifications'
      ],
      achievements_count: 23
    });

  } catch (error) {
    console.error('❌ Error initializing journey achievements:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
