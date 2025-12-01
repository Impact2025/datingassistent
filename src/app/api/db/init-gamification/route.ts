import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Database Schema voor Gamification & Engagement
 * Sprint 4: Streaks, Challenges, Points, Levels & Leaderboard
 */
export async function GET() {
  try {
    console.log('🎮 Initializing Gamification tables...');

    // First, drop existing gamification tables to ensure clean slate
    console.log('Dropping existing gamification tables if they exist...');
    try {
      await sql`DROP TABLE IF EXISTS user_challenge_progress CASCADE`;
      await sql`DROP TABLE IF EXISTS points_history CASCADE`;
      await sql`DROP TABLE IF EXISTS user_streaks CASCADE`;
      await sql`DROP TABLE IF EXISTS leaderboard_entries CASCADE`;
      await sql`DROP TABLE IF EXISTS user_gamification_stats CASCADE`;
      await sql`DROP TABLE IF EXISTS level_milestones CASCADE`;
      await sql`DROP TABLE IF EXISTS daily_challenges CASCADE`;
      console.log('✅ Existing tables dropped');
    } catch (dropError) {
      console.log('⚠️ Some tables could not be dropped (may not exist)');
    }

    // 1. User Stats - Overall gamification stats per user
    console.log('Creating user_gamification_stats table...');
    await sql`
      CREATE TABLE user_gamification_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_points INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        level_progress INTEGER DEFAULT 0 CHECK (level_progress >= 0 AND level_progress <= 100),
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        total_logins INTEGER DEFAULT 0,
        total_challenges_completed INTEGER DEFAULT 0,
        total_tools_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('✅ user_gamification_stats table created');

    // 2. Streak History - Track daily login streaks
    console.log('Creating user_streaks table...');
    await sql`
      CREATE TABLE user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        login_date DATE NOT NULL,
        streak_count INTEGER DEFAULT 1,
        points_earned INTEGER DEFAULT 0,
        bonus_applied BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, login_date)
      )
    `;
    console.log('✅ user_streaks table created');

    // 3. Daily Challenges - Available challenges
    console.log('Creating daily_challenges table...');
    await sql`
      CREATE TABLE daily_challenges (
        id SERIAL PRIMARY KEY,
        challenge_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        challenge_type VARCHAR(50) NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'medium',
        points_reward INTEGER DEFAULT 50,
        bonus_reward INTEGER DEFAULT 0,
        requirements JSONB,
        icon VARCHAR(50),
        color VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        is_daily BOOLEAN DEFAULT true,
        recurrence VARCHAR(20) DEFAULT 'daily',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ daily_challenges table created');

    // 4. User Challenge Progress - Track user progress on challenges
    console.log('Creating user_challenge_progress table...');
    await sql`
      CREATE TABLE user_challenge_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        challenge_id VARCHAR(100) NOT NULL,
        challenge_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        target INTEGER DEFAULT 100,
        completed_at TIMESTAMP,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, challenge_id, challenge_date)
      )
    `;
    console.log('✅ user_challenge_progress table created');

    // 5. Points History - Track all point transactions
    console.log('Creating points_history table...');
    await sql`
      CREATE TABLE points_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points_amount INTEGER NOT NULL,
        points_source VARCHAR(100) NOT NULL,
        source_id VARCHAR(100),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ points_history table created');

    // 6. Level Milestones - Level progression rewards
    console.log('Creating level_milestones table...');
    await sql`
      CREATE TABLE level_milestones (
        id SERIAL PRIMARY KEY,
        level INTEGER UNIQUE NOT NULL,
        points_required INTEGER NOT NULL,
        title VARCHAR(255),
        description TEXT,
        rewards JSONB,
        badge_icon VARCHAR(50),
        badge_color VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ level_milestones table created');

    // 7. Leaderboard Entries - Privacy-aware leaderboard
    console.log('Creating leaderboard_entries table...');
    await sql`
      CREATE TABLE leaderboard_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        display_name VARCHAR(100),
        total_points INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        rank INTEGER,
        is_visible BOOLEAN DEFAULT true,
        period VARCHAR(20) DEFAULT 'all_time',
        period_start DATE,
        period_end DATE,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, period)
      )
    `;
    console.log('✅ leaderboard_entries table created');

    console.log('✅ All gamification tables created');

    // Insert default daily challenges
    await sql`
      INSERT INTO daily_challenges (challenge_id, title, description, challenge_type, difficulty, points_reward, bonus_reward, requirements, icon, color)
      VALUES
        -- Daily Engagement Challenges
        ('daily_login', 'Start je Dag', 'Log in en begin je dating journey', 'login', 'easy', 10, 5, '{"action":"login"}', 'Sun', 'orange'),
        ('chat_with_iris', 'Praat met Iris', 'Heb een gesprek met je AI coach', 'chat', 'easy', 15, 10, '{"chat_sessions":1}', 'MessageCircle', 'blue'),
        ('complete_assessment', 'Zelfkennis Boost', 'Voltooi een assessment vandaag', 'assessment', 'medium', 30, 15, '{"assessment_count":1}', 'Brain', 'purple'),

        -- Tool Usage Challenges
        ('profile_update', 'Profiel Polijsten', 'Update je profiel of foto''s', 'profile', 'easy', 20, 10, '{"action":"profile_update"}', 'Edit', 'pink'),
        ('generate_opener', 'Gesprek Starter', 'Genereer een chat opener', 'tool_use', 'easy', 15, 5, '{"tool":"opener_generator"}', 'Sparkles', 'green'),
        ('analyze_conversation', 'Chat Coach Sessie', 'Gebruik de chat coach tool', 'tool_use', 'medium', 25, 10, '{"tool":"chat_coach"}', 'Bot', 'indigo'),

        -- Learning Challenges
        ('watch_tutorial', 'Leer & Groei', 'Bekijk een tutorial of video', 'learning', 'easy', 15, 5, '{"action":"watch_content"}', 'PlayCircle', 'teal'),
        ('read_tip', 'Dating Tip van de Dag', 'Lees een dating tip', 'learning', 'easy', 10, 5, '{"action":"read_tip"}', 'Lightbulb', 'yellow'),

        -- Engagement Challenges
        ('three_tools', 'Tool Master', 'Gebruik 3 verschillende tools vandaag', 'engagement', 'hard', 50, 25, '{"tool_count":3}', 'Zap', 'purple'),
        ('milestone_setter', 'Doelen Stellen', 'Stel een nieuw doel voor jezelf', 'goal', 'medium', 25, 10, '{"action":"set_goal"}', 'Target', 'orange'),

        -- Streak Bonuses
        ('week_streak', 'Week Warrior', '7 dagen streak bereikt', 'streak', 'hard', 100, 50, '{"streak_days":7}', 'Flame', 'red'),
        ('month_streak', 'Maand Master', '30 dagen streak bereikt', 'streak', 'legendary', 500, 250, '{"streak_days":30}', 'Trophy', 'gold')
      ON CONFLICT (challenge_id) DO NOTHING
    `;

    console.log('✅ Default challenges inserted');

    // Insert level milestones (1-50)
    const levelMilestones = [];
    for (let level = 1; level <= 50; level++) {
      // Use a more conservative growth formula to stay within INT range
      // Cap at 2 billion (PostgreSQL INT max is ~2.1 billion)
      const pointsRequired = Math.min(
        Math.floor(100 * Math.pow(1.3, level - 1)),
        2000000000
      );
      const title = getLevelTitle(level);
      const description = `Bereik level ${level} en word ${title}`;

      levelMilestones.push({
        level,
        points_required: pointsRequired,
        title,
        description,
        badge_icon: getLevelIcon(level),
        badge_color: getLevelColor(level)
      });
    }

    for (const milestone of levelMilestones) {
      await sql`
        INSERT INTO level_milestones (level, points_required, title, description, badge_icon, badge_color)
        VALUES (
          ${milestone.level},
          ${milestone.points_required},
          ${milestone.title},
          ${milestone.description},
          ${milestone.badge_icon},
          ${milestone.badge_color}
        )
        ON CONFLICT (level) DO NOTHING
      `;
    }

    console.log('✅ Level milestones created (1-50)');

    // Create indexes for performance
    console.log('Creating database indexes...');

    console.log('Creating index: idx_gamification_stats_user...');
    await sql`CREATE INDEX IF NOT EXISTS idx_gamification_stats_user ON user_gamification_stats(user_id)`;
    console.log('✅ idx_gamification_stats_user created');

    console.log('Creating index: idx_streaks_user_date...');
    await sql`CREATE INDEX IF NOT EXISTS idx_streaks_user_date ON user_streaks(user_id, login_date DESC)`;
    console.log('✅ idx_streaks_user_date created');

    console.log('Creating index: idx_challenge_progress_user...');
    await sql`CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON user_challenge_progress(user_id, challenge_date DESC)`;
    console.log('✅ idx_challenge_progress_user created');

    console.log('Creating index: idx_points_history_user...');
    await sql`CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_id, created_at DESC)`;
    console.log('✅ idx_points_history_user created');

    console.log('Creating index: idx_leaderboard_rank...');
    await sql`CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(period, rank)`;
    console.log('✅ idx_leaderboard_rank created');

    console.log('✅ All indexes created');
    console.log('✅ Gamification system initialized successfully!');

    return NextResponse.json({
      success: true,
      message: 'Gamification system initialized',
      tables: [
        'user_gamification_stats',
        'user_streaks',
        'daily_challenges',
        'user_challenge_progress',
        'points_history',
        'level_milestones',
        'leaderboard_entries'
      ],
      challenges_count: 12,
      levels_count: 50
    });

  } catch (error) {
    console.error('❌ Error initializing gamification:', error);
    return NextResponse.json(
      { error: 'Failed to initialize gamification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper functions for level progression
function getLevelTitle(level: number): string {
  if (level === 1) return 'Nieuweling';
  if (level <= 5) return 'Dating Beginner';
  if (level <= 10) return 'Dating Student';
  if (level <= 15) return 'Dating Leerling';
  if (level <= 20) return 'Dating Expert';
  if (level <= 25) return 'Dating Pro';
  if (level <= 30) return 'Dating Master';
  if (level <= 35) return 'Dating Virtuoos';
  if (level <= 40) return 'Dating Guru';
  if (level <= 45) return 'Dating Legende';
  return 'Dating God';
}

function getLevelIcon(level: number): string {
  if (level === 1) return 'Star';
  if (level <= 10) return 'Award';
  if (level <= 20) return 'Medal';
  if (level <= 30) return 'Trophy';
  if (level <= 40) return 'Crown';
  return 'Gem';
}

function getLevelColor(level: number): string {
  if (level <= 10) return 'gray';
  if (level <= 20) return 'blue';
  if (level <= 30) return 'purple';
  if (level <= 40) return 'gold';
  return 'rainbow';
}
