#!/usr/bin/env tsx

/**
 * A/B Testing Tables Creation Script
 * Creates all necessary tables for A/B testing and analytics
 */

import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createABTestingTables() {
  console.log('🔧 Creating A/B Testing Tables...');

  try {
    // A/B Test Conversions Table
    await sql`
      CREATE TABLE IF NOT EXISTS ab_test_conversions (
        id SERIAL PRIMARY KEY,
        test_id VARCHAR(50) NOT NULL,
        variant_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(test_id, variant_id, user_id, event_type)
      )
    `;
    console.log('✅ Created ab_test_conversions table');

    // Profile Analytics Events Table
    await sql`
      CREATE TABLE IF NOT EXISTS profile_analytics_events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        session_id VARCHAR(100) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created profile_analytics_events table');

    // Profile Quality Scores Table
    await sql`
      CREATE TABLE IF NOT EXISTS profile_quality_scores (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        session_id VARCHAR(100) NOT NULL,
        profile_text TEXT NOT NULL,
        quality_metrics JSONB NOT NULL,
        ab_test_variant VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created profile_quality_scores table');

    // User Journey Metrics Table
    await sql`
      CREATE TABLE IF NOT EXISTS user_journey_metrics (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        metrics JSONB NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created user_journey_metrics table');

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test_id ON ab_test_conversions(test_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_variant_id ON ab_test_conversions(variant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_user_id ON ab_test_conversions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_created_at ON ab_test_conversions(created_at)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_profile_analytics_user_id ON profile_analytics_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_profile_analytics_session_id ON profile_analytics_events(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_profile_analytics_event_type ON profile_analytics_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_profile_analytics_created_at ON profile_analytics_events(created_at)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_profile_quality_user_id ON profile_quality_scores(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_profile_quality_session_id ON profile_quality_scores(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_profile_quality_created_at ON profile_quality_scores(created_at)`;

    console.log('✅ Created indexes');

    // Create views for analytics
    await sql`
      CREATE OR REPLACE VIEW ab_test_results AS
      SELECT
        test_id,
        variant_id,
        COUNT(DISTINCT user_id) as participants,
        COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
        ROUND(
          (COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::decimal /
           NULLIF(COUNT(DISTINCT user_id), 0)) * 100, 2
        ) as conversion_rate
      FROM ab_test_conversions
      GROUP BY test_id, variant_id
    `;
    console.log('✅ Created ab_test_results view');

    await sql`
      CREATE OR REPLACE VIEW profile_analytics_summary AS
      SELECT
        DATE(created_at) as date,
        event_type,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM profile_analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at), event_type
      ORDER BY date DESC, event_count DESC
    `;
    console.log('✅ Created profile_analytics_summary view');

    // Create statistical significance function
    await sql`
      CREATE OR REPLACE FUNCTION calculate_ab_significance(
        conversions_a INTEGER,
        participants_a INTEGER,
        conversions_b INTEGER,
        participants_b INTEGER
      ) RETURNS DECIMAL AS $$
      DECLARE
        rate_a DECIMAL;
        rate_b DECIMAL;
        se DECIMAL;
        z_score DECIMAL;
      BEGIN
        IF participants_a = 0 OR participants_b = 0 THEN
          RETURN 0;
        END IF;

        rate_a := conversions_a::DECIMAL / participants_a;
        rate_b := conversions_b::DECIMAL / participants_b;

        se := SQRT(
          (rate_a * (1 - rate_a) / participants_a) +
          (rate_b * (1 - rate_b) / participants_b)
        );

        IF se = 0 THEN
          RETURN 100;
        END IF;

        z_score := ABS(rate_a - rate_b) / se;

        IF z_score > 2.58 THEN
          RETURN 99.0;
        ELSIF z_score > 1.96 THEN
          RETURN 95.0;
        ELSE
          RETURN 0.0;
        END IF;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log('✅ Created statistical significance function');

    console.log('🎉 All A/B Testing tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating A/B testing tables:', error);
    process.exit(1);
  }
}

// Run the script
createABTestingTables().then(() => {
  console.log('✅ A/B Testing setup complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});