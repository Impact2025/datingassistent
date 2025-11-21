#!/usr/bin/env tsx

/**
 * Date Planner Tables Creation Script
 * Creates all necessary tables for the Date Planner tool
 */

import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createDatePlannerTables() {
  console.log('📅 Creating Date Planner Tables...');

  try {
    // Date Plans Table
    await sql`
      CREATE TABLE IF NOT EXISTS date_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(50) NOT NULL,
        date_idea_id VARCHAR(50),

        -- Input data
        date_type VARCHAR(50) NOT NULL,
        location TEXT,
        duration INTEGER,
        energy_level VARCHAR(20),
        desired_style VARCHAR(30),
        budget VARCHAR(20),
        date_info TEXT,
        insecurities TEXT[],
        user_goals TEXT,
        initiator VARCHAR(20),

        -- Generated content (JSONB for flexibility)
        plan_content JSONB NOT NULL,

        -- Metadata
        ai_version VARCHAR(20) DEFAULT '1.0',
        quality_score DECIMAL(3,1),
        personalization_level VARCHAR(20) DEFAULT 'standard',
        is_completed BOOLEAN DEFAULT false,
        is_shared BOOLEAN DEFAULT false,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created date_plans table');

    // Date Plan Checklists (for progress tracking)
    await sql`
      CREATE TABLE IF NOT EXISTS date_plan_checklists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date_plan_id UUID NOT NULL,
        item_text TEXT NOT NULL,
        category VARCHAR(30) NOT NULL,
        is_completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP WITH TIME ZONE,
        priority VARCHAR(10) DEFAULT 'medium',

        FOREIGN KEY (date_plan_id) REFERENCES date_plans(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Created date_plan_checklists table');

    // Date Ideas Table (for integration)
    await sql`
      CREATE TABLE IF NOT EXISTS date_ideas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        location TEXT,
        duration INTEGER,
        difficulty VARCHAR(20),
        vibe TEXT,
        activities TEXT[],
        budget_range VARCHAR(50),
        is_premium BOOLEAN DEFAULT false,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created date_ideas table');

    // Indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_date_plans_user_id ON date_plans(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_date_plans_date_idea_id ON date_plans(date_idea_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_date_plans_created_at ON date_plans(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_date_plan_checklists_date_plan_id ON date_plan_checklists(date_plan_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_date_ideas_user_id ON date_ideas(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_date_ideas_type ON date_ideas(type)`;

    console.log('✅ Created indexes');

    // Views for analytics
    await sql`
      CREATE OR REPLACE VIEW date_planner_analytics AS
      SELECT
        DATE(created_at) as date,
        date_type,
        energy_level,
        desired_style,
        budget,
        COUNT(*) as plans_created,
        AVG(quality_score) as avg_quality_score,
        COUNT(CASE WHEN is_completed THEN 1 END) as completed_plans,
        COUNT(CASE WHEN is_shared THEN 1 END) as shared_plans
      FROM date_plans
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at), date_type, energy_level, desired_style, budget
      ORDER BY date DESC
    `;
    console.log('✅ Created date_planner_analytics view');

    await sql`
      CREATE OR REPLACE VIEW date_plan_completion_rates AS
      SELECT
        user_id,
        COUNT(*) as total_plans,
        COUNT(CASE WHEN is_completed THEN 1 END) as completed_plans,
        ROUND(
          (COUNT(CASE WHEN is_completed THEN 1 END)::decimal /
           NULLIF(COUNT(*), 0)) * 100, 1
        ) as completion_rate,
        AVG(quality_score) as avg_quality_score
      FROM date_plans
      GROUP BY user_id
      HAVING COUNT(*) >= 1
    `;
    console.log('✅ Created date_plan_completion_rates view');

    console.log('🎉 All Date Planner tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating Date Planner tables:', error);
    process.exit(1);
  }
}

// Run the script
createDatePlannerTables().then(() => {
  console.log('✅ Date Planner setup complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});