import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating chat coach tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS chat_coach_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        conversation_text TEXT NOT NULL,
        conversation_type VARCHAR(20) NOT NULL CHECK (conversation_type IN ('dating_app', 'date', 'relationship', 'general')),
        message_count INTEGER NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'analysing', 'failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created chat_coach_conversations table');

    await sql`
      CREATE TABLE IF NOT EXISTS chat_coach_analyses (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES chat_coach_conversations(id) ON DELETE CASCADE UNIQUE,

        -- Overall scores (0-100)
        overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
        engagement_score DECIMAL(5,2) NOT NULL CHECK (engagement_score BETWEEN 0 AND 100),
        authenticity_score DECIMAL(5,2) NOT NULL CHECK (authenticity_score BETWEEN 0 AND 100),
        balance_score DECIMAL(5,2) NOT NULL CHECK (balance_score BETWEEN 0 AND 100),
        clarity_score DECIMAL(5,2) NOT NULL CHECK (clarity_score BETWEEN 0 AND 100),

        -- AI-generated analysis
        conversation_summary TEXT,
        strengths TEXT[],
        improvements TEXT[],
        red_flags TEXT[],
        conversation_flow TEXT,
        tone_analysis TEXT,
        pacing_feedback TEXT,
        question_quality TEXT,
        response_depth TEXT,

        -- Recommendations
        suggested_openers TEXT[],
        better_responses TEXT[],
        conversation_starters TEXT[],
        boundary_scripts TEXT[],
        escalation_tips TEXT[],

        -- Integration data
        compatible_styles TEXT[], -- From dating style scan
        attachment_alignment TEXT, -- From attachment style scan
        readiness_level TEXT, -- From emotional readiness scan

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created chat_coach_analyses table');

    // Message-level analysis table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_coach_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES chat_coach_conversations(id) ON DELETE CASCADE,
        message_number INTEGER NOT NULL,
        message_text TEXT NOT NULL,
        is_user_message BOOLEAN NOT NULL,
        message_length INTEGER NOT NULL,
        sentiment_score DECIMAL(3,2), -- -1 to 1
        engagement_level VARCHAR(20), -- low, medium, high
        question_count INTEGER DEFAULT 0,
        emoji_count INTEGER DEFAULT 0,
        response_time_seconds INTEGER, -- If available
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created chat_coach_messages table');

    // User progress and learning
    await sql`
      CREATE TABLE IF NOT EXISTS chat_coach_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_conversations_analyzed INTEGER DEFAULT 0,
        average_score DECIMAL(5,2),
        strongest_area VARCHAR(50),
        area_for_improvement VARCHAR(50),
        common_patterns TEXT[],
        learned_skills TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created chat_coach_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_coach_conversations_user_id ON chat_coach_conversations(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_coach_conversations_status ON chat_coach_conversations(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_coach_analyses_conversation_id ON chat_coach_analyses(conversation_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_coach_messages_conversation_id ON chat_coach_messages(conversation_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_coach_progress_user_id ON chat_coach_progress(user_id);`;
    console.log('✅ Created indexes');

    return NextResponse.json({
      success: true,
      message: 'Chat coach database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'chat_coach_conversations',
          'chat_coach_analyses',
          'chat_coach_messages',
          'chat_coach_progress'
        ]
      },
    });
  } catch (error: any) {
    console.error('Error initializing chat coach tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize chat coach database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}