/**
 * Admin API: Migrate Dating Activities System
 * Creates the dating_activities table for tracking user dating activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting Dating Activities System Migration via API...');

    // Check if table already exists
    const existingTables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'dating_activities'
    `;

    if (existingTables.rows.length > 0) {
      console.log('⏭️  dating_activities table already exists');
      return NextResponse.json({
        success: true,
        message: 'Dating activities table already exists',
        tables: ['dating_activities'],
        status: 'already_exists'
      });
    }

    // Create dating_activities table
    console.log('📅 Creating dating_activities table...');
    await sql`
      CREATE TABLE IF NOT EXISTS dating_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
        activity_type VARCHAR(50) NOT NULL,

        -- Match details
        match_quality INTEGER CHECK (match_quality BETWEEN 1 AND 10),
        platform VARCHAR(50),

        -- Conversation details
        conversation_length INTEGER,
        was_meaningful BOOLEAN DEFAULT FALSE,

        -- Date details
        date_location TEXT,
        date_rating INTEGER CHECK (date_rating BETWEEN 1 AND 10),
        notes TEXT,

        -- Metadata
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ dating_activities table created');

    // Create indexes
    console.log('⚡ Creating performance indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_activities_user_date ON dating_activities(user_id, activity_date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_activities_type ON dating_activities(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_activities_platform ON dating_activities(platform)`;
    console.log('✅ Performance indexes created');

    // Create trigger for updated_at
    console.log('🔧 Setting up update trigger...');
    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_dating_activities_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

      await sql`
        CREATE TRIGGER update_dating_activities_updated_at
          BEFORE UPDATE ON dating_activities
          FOR EACH ROW
          EXECUTE FUNCTION update_dating_activities_updated_at()
      `;
      console.log('✅ Update trigger created');
    } catch (error: any) {
      console.warn('⚠️  Could not create trigger:', error.message);
    }

    // Add some sample data for testing
    console.log('📊 Adding sample data for testing...');
    try {
      // Add sample data for user ID 1 (if exists)
      const users = await sql`SELECT id FROM users LIMIT 1`;
      if (users.rows.length > 0) {
        const userId = users.rows[0].id;

        // Add some sample activities
        const sampleActivities = [
          { type: 'match', quality: 8, platform: 'tinder' },
          { type: 'conversation', length: 15, meaningful: true },
          { type: 'date', location: 'Café Central', rating: 7 },
          { type: 'match', quality: 6, platform: 'bumble' },
          { type: 'conversation', length: 8, meaningful: false },
        ];

        for (const activity of sampleActivities) {
          await sql`
            INSERT INTO dating_activities (
              user_id,
              activity_type,
              match_quality,
              platform,
              conversation_length,
              was_meaningful,
              date_location,
              date_rating
            ) VALUES (
              ${userId},
              ${activity.type},
              ${activity.quality || null},
              ${activity.platform || null},
              ${activity.length || null},
              ${activity.meaningful || null},
              ${activity.location || null},
              ${activity.rating || null}
            )
          `;
        }
        console.log('✅ Sample dating activities added');
      }
    } catch (error: any) {
      console.warn('⚠️  Could not add sample data:', error.message);
    }

    // Verify migration
    console.log('🔍 Verifying migration...');
    const finalTable = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'dating_activities'
    `;

    console.log('📊 Final table status:', finalTable.rows.map(row => row.tablename));

    console.log('🎉 Dating Activities System Migration Completed Successfully!');
    console.log('📅 The dating activities tracking system is now operational.');

    return NextResponse.json({
      success: true,
      message: 'Dating activities system migration completed successfully',
      tables: finalTable.rows.map(row => row.tablename),
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