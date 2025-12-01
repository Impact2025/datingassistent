import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create ab_tests table
    await sql`
      CREATE TABLE IF NOT EXISTS ab_tests (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
        variants JSONB NOT NULL,
        target_audience JSONB DEFAULT '{}',
        goals JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        started_at TIMESTAMP WITH TIME ZONE,
        ended_at TIMESTAMP WITH TIME ZONE
      );
    `;

    // Create user_test_assignments table
    await sql`
      CREATE TABLE IF NOT EXISTS user_test_assignments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        test_id VARCHAR(255) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
        variant_id VARCHAR(255) NOT NULL,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, test_id)
      );
    `;

    // Create ab_test_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS ab_test_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        test_id VARCHAR(255) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
        metric_name VARCHAR(255) NOT NULL,
        metric_value DECIMAL(10,4) NOT NULL,
        metadata JSONB DEFAULT '{}',
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_tests_created_at ON ab_tests(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_test_assignments_user_id ON user_test_assignments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_test_assignments_test_id ON user_test_assignments(test_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_metrics_test_id ON ab_test_metrics(test_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_metrics_metric_name ON ab_test_metrics(metric_name);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_metrics_recorded_at ON ab_test_metrics(recorded_at);`;

    console.log('✅ A/B testing database tables initialized successfully');

    return NextResponse.json({
      success: true,
      message: 'A/B testing database tables initialized successfully',
      tables: ['ab_tests', 'user_test_assignments', 'ab_test_metrics']
    });

  } catch (error) {
    console.error('❌ Error initializing A/B testing database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize A/B testing database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}