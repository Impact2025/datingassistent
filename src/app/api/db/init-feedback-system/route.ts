import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create user_feedback table
    await sql`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'general', 'satisfaction')),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        page_url VARCHAR(500),
        user_agent TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'responded', 'closed')),
        admin_response TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create support_tickets table
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        category VARCHAR(100) NOT NULL,
        tags JSONB DEFAULT '[]',
        attachments JSONB DEFAULT '[]',
        admin_notes TEXT,
        resolution TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create survey_responses table
    await sql`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        survey_id VARCHAR(255) NOT NULL,
        responses JSONB NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);`;

    await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);`;

    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);`;

    console.log('✅ Feedback system database tables initialized successfully');

    return NextResponse.json({
      success: true,
      message: 'Feedback system database tables initialized successfully',
      tables: ['user_feedback', 'support_tickets', 'survey_responses']
    });

  } catch (error) {
    console.error('❌ Error initializing feedback system database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize feedback system database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}