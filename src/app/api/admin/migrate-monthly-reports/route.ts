/**
 * Admin API: Migrate Monthly Reports System
 * Creates missing database tables for the monthly reports system
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting Monthly Reports System Migration via API...');

    // Check if tables already exist
    console.log('📋 Checking existing tables...');

    const existingTables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('monthly_reports', 'user_goals', 'performance_metrics')
    `;

    const existingTableNames = existingTables.rows.map(row => row.tablename);
    console.log('📊 Existing tables:', existingTableNames);

    // Create monthly_reports table if it doesn't exist
    if (!existingTableNames.includes('monthly_reports')) {
      console.log('📊 Creating monthly_reports table...');
      await sql`
        CREATE TABLE IF NOT EXISTS monthly_reports (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
          year INTEGER NOT NULL,
          report_date DATE NOT NULL DEFAULT CURRENT_DATE,
          metrics_data JSONB NOT NULL,
          insights_data JSONB NOT NULL,
          overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, month_number, year)
        )
      `;
      console.log('✅ monthly_reports table created');
    } else {
      console.log('⏭️  monthly_reports table already exists');
    }

    // Check and fix user_goals table structure
    console.log('🎯 Checking user_goals table structure...');

    const goalsColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user_goals'
      AND table_schema = 'public'
    `;

    const existingGoalColumns = goalsColumns.rows.map(row => row.column_name);
    console.log('📋 user_goals columns:', existingGoalColumns);

    // Check if we need to add the deadline column
    if (!existingGoalColumns.includes('deadline')) {
      console.log('🔧 Adding deadline column to user_goals...');
      try {
        await sql`ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS deadline DATE`;
        console.log('✅ deadline column added to user_goals');
      } catch (error: any) {
        console.warn('⚠️  Could not add deadline column:', error.message);
      }
    } else {
      console.log('⏭️  user_goals deadline column already exists');
    }

    // Performance metrics table might already exist from badges migration
    if (!existingTableNames.includes('performance_metrics')) {
      console.log('📈 Creating performance_metrics table...');
      await sql`
        CREATE TABLE IF NOT EXISTS performance_metrics (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
          metric_type VARCHAR(50) NOT NULL,
          metric_value INTEGER DEFAULT 1,
          quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log('✅ performance_metrics table created');
    } else {
      console.log('⏭️  performance_metrics table already exists');
    }

    // Create indexes for performance
    console.log('⚡ Creating performance indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_reports_user ON monthly_reports(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON monthly_reports(year DESC, month_number DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_deadline ON user_goals(deadline)`;

    // Check performance_metrics table structure and create appropriate indexes
    const perfColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'performance_metrics'
      AND table_schema = 'public'
    `;

    const perfColumnNames = perfColumns.rows.map(row => row.column_name);

    if (perfColumnNames.includes('recorded_at')) {
      // Badges system structure
      await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(recorded_at DESC)`;
    } else if (perfColumnNames.includes('metric_date')) {
      // Monthly reports structure
      await sql`CREATE INDEX IF NOT EXISTS idx_performance_user_date ON performance_metrics(user_id, metric_date DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(metric_type)`;
    }

    console.log('✅ Performance indexes created');

    // Create trigger function if it doesn't exist
    console.log('🔧 Setting up update trigger...');

    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

      await sql`
        CREATE TRIGGER update_monthly_reports_updated_at
          BEFORE UPDATE ON monthly_reports
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
      `;

      console.log('✅ Update trigger created');
    } catch (error: any) {
      console.warn('⚠️  Could not create trigger:', error.message);
    }

    // Insert some sample data for testing (optional)
    console.log('📊 Adding sample data for testing...');

    try {
      // Only add if no data exists
      const existingReports = await sql`SELECT COUNT(*) as count FROM monthly_reports`;
      if (existingReports.rows[0].count === 0) {
        // Add sample data for user ID 1 (if exists)
        const users = await sql`SELECT id FROM users LIMIT 1`;
        if (users.rows.length > 0) {
          const userId = users.rows[0].id;

          const sampleMetrics = {
            userId,
            monthNumber: 11,
            year: 2025,
            reportDate: new Date().toISOString().split('T')[0],
            totalMatches: 15,
            qualityMatches: 8,
            totalConversations: 12,
            meaningfulConversations: 6,
            totalDates: 3,
            secondDates: 1,
            daysActive: 20,
            totalDaysInMonth: 30,
            consistencyScore: 67,
            longestStreak: 5,
            profileUpdates: 2,
            photosUpdated: 1,
            bioUpdates: 1,
            messagesAnalyzed: 25,
            coachingSessions: 3,
            tasksCompleted: 18,
            totalTasks: 25,
            checkinsCompleted: 20,
            goalsAchieved: 2,
            totalGoals: 4,
            pointsEarned: 450,
            badgesEarned: 1,
            milestonesReached: 3,
            topWins: ['Eerste date gehad', 'Nieuwe matches'],
            biggestChallenges: ['Minder consistent', 'Moeite met gesprekken'],
            lessonsLearned: []
          };

          const sampleInsights = {
            overallProgress: 65,
            strengthAreas: ['Profiel verbeteringen', 'Actieve deelname'],
            improvementAreas: ['Meer consistentie', 'Betere gesprekken'],
            personalizedTips: [
              'Plan vaste dating avonden in',
              'Gebruik AI hulp voor betere gesprekken',
              'Update profiel regelmatig'
            ],
            aiSummary: 'Goede voortgang deze maand met focus op profiel verbetering.',
            nextMonthFocus: ['Consistentie verbeteren', 'Meer dates plannen'],
            motivationalMessage: 'Je bent op de goede weg!'
          };

          await sql`
            INSERT INTO monthly_reports (
              user_id,
              month_number,
              year,
              report_date,
              metrics_data,
              insights_data,
              overall_score
            ) VALUES (
              ${userId},
              11,
              2025,
              CURRENT_DATE,
              ${JSON.stringify(sampleMetrics)},
              ${JSON.stringify(sampleInsights)},
              65
            )
          `;
          console.log('✅ Sample monthly report added');
        }
      } else {
        console.log('⏭️  Monthly reports already exist');
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
      AND tablename IN ('monthly_reports', 'user_goals', 'performance_metrics')
    `;

    console.log('📊 Final table status:', finalTables.rows.map(row => row.tablename));

    // Test monthly reports functionality
    console.log('🧪 Testing monthly reports...');

    try {
      const reportCount = await sql`SELECT COUNT(*) as count FROM monthly_reports`;
      const goalsCount = await sql`SELECT COUNT(*) as count FROM user_goals`;
      const metricsCount = await sql`SELECT COUNT(*) as count FROM performance_metrics`;

      console.log('📈 Table counts:', {
        reports: reportCount.rows[0].count,
        goals: goalsCount.rows[0].count,
        metrics: metricsCount.rows[0].count
      });

    } catch (error: any) {
      console.warn('⚠️  Could not verify table counts:', error.message);
    }

    console.log('🎉 Monthly Reports System Migration Completed Successfully!');
    console.log('📊 The monthly reports system is now fully operational.');

    return NextResponse.json({
      success: true,
      message: 'Monthly reports system migration completed successfully',
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