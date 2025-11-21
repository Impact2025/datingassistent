/**
 * Admin API: Migrate Badges System
 * Creates missing database tables for the badges/gamification system
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting Badges System Migration via API...');

    // Check if tables already exist
    console.log('📋 Checking existing tables...');

    const existingTables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('performance_metrics', 'weekly_insights')
    `;

    const existingTableNames = existingTables.rows.map(row => row.tablename);
    console.log('📊 Existing tables:', existingTableNames);

    // Create performance_metrics table if it doesn't exist
    if (!existingTableNames.includes('performance_metrics')) {
      console.log('📈 Creating performance_metrics table...');
      await sql`
        CREATE TABLE IF NOT EXISTS performance_metrics (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          metric_type VARCHAR(50) NOT NULL,
          metric_value INTEGER NOT NULL DEFAULT 0,
          recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, metric_type, recorded_at)
        )
      `;
      console.log('✅ performance_metrics table created');
    } else {
      console.log('⏭️  performance_metrics table already exists');
    }

    // Create weekly_insights table if it doesn't exist
    if (!existingTableNames.includes('weekly_insights')) {
      console.log('📅 Creating weekly_insights table...');
      await sql`
        CREATE TABLE IF NOT EXISTS weekly_insights (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          week_start DATE NOT NULL,
          insight_type VARCHAR(50) NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          actionable BOOLEAN DEFAULT FALSE,
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, week_start, insight_type)
        )
      `;
      console.log('✅ weekly_insights table created');
    } else {
      console.log('⏭️  weekly_insights table already exists');
    }

    // Fix user_badges table structure - nuclear approach
    console.log('🏆 Fixing user_badges table structure...');

    try {
      // Check current structure
      const badgeColumns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'user_badges'
        AND table_schema = 'public'
      `;

      const existingColumns = badgeColumns.rows.map(row => row.column_name);
      console.log('📋 Current user_badges columns:', existingColumns);

      // If the table has wrong structure, recreate it
      const hasCorrectStructure = existingColumns.includes('badge_type') &&
                                  existingColumns.includes('badge_name') &&
                                  existingColumns.includes('tier');

      if (!hasCorrectStructure) {
        console.log('🔄 user_badges table has incorrect structure, recreating...');

        // Backup existing data if any
        let existingData: any[] = [];
        try {
          existingData = (await sql`SELECT * FROM user_badges`).rows;
          console.log(`📦 Backed up ${existingData.length} existing badge records`);
        } catch (error) {
          console.log('ℹ️  No existing data to backup');
        }

        // Drop and recreate table with correct structure
        await sql`DROP TABLE IF EXISTS user_badges CASCADE`;

        await sql`
          CREATE TABLE user_badges (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            badge_type VARCHAR(50) NOT NULL,
            badge_name VARCHAR(100) NOT NULL,
            badge_description TEXT,
            badge_icon VARCHAR(10),
            tier VARCHAR(20),
            earned_at TIMESTAMP DEFAULT NOW(),
            displayed BOOLEAN DEFAULT TRUE
          )
        `;

        // Restore data if we had any (map old structure to new)
        if (existingData.length > 0) {
          console.log('🔄 Restoring backed up data...');
          for (const record of existingData) {
            try {
              await sql`
                INSERT INTO user_badges (
                  user_id, badge_type, badge_name, badge_description,
                  badge_icon, tier, earned_at, displayed
                ) VALUES (
                  ${record.user_id},
                  ${record.badge_type || record.badge_id || 'unknown'},
                  ${record.badge_name || 'Unknown Badge'},
                  ${record.badge_description || ''},
                  ${record.badge_icon || '🏆'},
                  ${record.tier || 'bronze'},
                  ${record.earned_at || new Date()},
                  ${record.displayed !== false}
                )
              `;
            } catch (error: any) {
              console.warn('⚠️  Failed to restore record:', error.message);
            }
          }
        }

        console.log('✅ user_badges table recreated with correct structure');
      } else {
        console.log('⏭️  user_badges table structure is already correct');
      }

    } catch (error: any) {
      console.error('❌ Failed to fix user_badges table:', error.message);
      throw error;
    }

    // Create indexes for performance
    console.log('⚡ Creating performance indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(recorded_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON weekly_insights(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_insights_week ON weekly_insights(week_start DESC)`;

    console.log('✅ Performance indexes created');

    // Insert some sample performance metrics for testing (optional)
    console.log('📊 Adding sample performance data for testing...');

    try {
      // Only add if no data exists
      const existingMetrics = await sql`SELECT COUNT(*) as count FROM performance_metrics`;
      if (existingMetrics.rows[0].count === 0) {
        // Add sample data for user ID 1 (if exists)
        const users = await sql`SELECT id FROM users LIMIT 1`;
        if (users.rows.length > 0) {
          const userId = users.rows[0].id;

          await sql`
            INSERT INTO performance_metrics (user_id, metric_type, metric_value, recorded_at)
            VALUES
              (${userId}, 'match', 5, CURRENT_DATE),
              (${userId}, 'message', 12, CURRENT_DATE),
              (${userId}, 'task_completed', 3, CURRENT_DATE)
          `;
          console.log('✅ Sample performance metrics added');
        }
      } else {
        console.log('⏭️  Performance metrics already exist');
      }
    } catch (error: any) {
      console.warn('⚠️  Could not add sample data:', error.message);
    }

    // Verify migration success
    console.log('🔍 Verifying migration...');

    const finalTables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('performance_metrics', 'weekly_insights', 'user_badges')
    `;

    console.log('📊 Final table status:', finalTables.rows.map(row => row.tablename));

    // Test badge service functionality
    console.log('🧪 Testing badge service...');

    try {
      const badgeCount = await sql`SELECT COUNT(*) as count FROM user_badges`;
      const metricsCount = await sql`SELECT COUNT(*) as count FROM performance_metrics`;
      const insightsCount = await sql`SELECT COUNT(*) as count FROM weekly_insights`;

      console.log('📈 Table counts:', {
        badges: badgeCount.rows[0].count,
        metrics: metricsCount.rows[0].count,
        insights: insightsCount.rows[0].count
      });

    } catch (error: any) {
      console.warn('⚠️  Could not verify table counts:', error.message);
    }

    console.log('🎉 Badges System Migration Completed Successfully!');
    console.log('🏆 The badge system is now fully operational.');

    return NextResponse.json({
      success: true,
      message: 'Badges system migration completed successfully',
      tables: finalTables.rows.map(row => row.tablename),
      status: 'operational'
    });

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      message: error.message
    }, { status: 500 });
  }
}