import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  const results = {
    success: true,
    initialized: [] as string[],
    errors: [] as string[],
    totalTables: 0
  };

  try {
    console.log('🚀 Starting comprehensive database initialization...');

    // 1. Core user tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          email_verified BOOLEAN DEFAULT false,
          password_hash TEXT,
          subscription_type VARCHAR(50) DEFAULT 'free',
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      results.initialized.push('users');
      console.log('✅ Users table initialized');
    } catch (error) {
      results.errors.push(`users: ${error}`);
      console.error('❌ Failed to create users table:', error);
    }

    // 2. User profiles
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          age INTEGER,
          gender VARCHAR(50),
          location VARCHAR(255),
          bio TEXT,
          interests TEXT[],
          profile_photo_url VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `;
      results.initialized.push('user_profiles');
      console.log('✅ User profiles table initialized');
    } catch (error) {
      results.errors.push(`user_profiles: ${error}`);
    }

    // 3. Emotional readiness tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS emotionele_readiness_assessments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          laatste_relatie VARCHAR(100),
          emotioneel_herstel INTEGER CHECK (emotioneel_herstel >= 1 AND emotioneel_herstel <= 5),
          stress_niveau INTEGER CHECK (stress_niveau >= 1 AND stress_niveau <= 5),
          status VARCHAR(50) DEFAULT 'in_progress',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS emotionele_readiness_results (
          id SERIAL PRIMARY KEY,
          assessment_id INTEGER REFERENCES emotionele_readiness_assessments(id) ON DELETE CASCADE,
          readiness_score DECIMAL(5,2),
          readiness_level VARCHAR(50),
          emotionele_draagkracht DECIMAL(5,2),
          intenties_score DECIMAL(5,2),
          restlading_score DECIMAL(5,2),
          self_esteem_score DECIMAL(5,2),
          stress_score DECIMAL(5,2),
          rebound_risico DECIMAL(5,2),
          ai_conclusie TEXT,
          readiness_analyse TEXT,
          wat_werkt_nu JSONB,
          wat_lastig_kan_zijn JSONB,
          directe_aanbevelingen JSONB,
          micro_interventies JSONB,
          scripts JSONB,
          recommended_tools JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS emotionele_readiness_responses (
          id SERIAL PRIMARY KEY,
          assessment_id INTEGER REFERENCES emotionele_readiness_assessments(id) ON DELETE CASCADE,
          question_type VARCHAR(50),
          question_id INTEGER,
          response_value INTEGER,
          response_time_ms INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      results.initialized.push('emotionele_readiness_assessments', 'emotionele_readiness_results', 'emotionele_readiness_responses');
      console.log('✅ Emotional readiness tables initialized');
    } catch (error) {
      results.errors.push(`emotional_readiness_tables: ${error}`);
    }

    // 4. Dating style tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS dating_style_questions (
          id SERIAL PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          question_text TEXT NOT NULL,
          option_a TEXT NOT NULL,
          option_b TEXT NOT NULL,
          weight_a DECIMAL(3,2) DEFAULT 1.0,
          weight_b DECIMAL(3,2) DEFAULT 1.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS dating_style_assessments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          responses JSONB NOT NULL,
          dominant_style VARCHAR(100),
          secondary_style VARCHAR(100),
          compatibility_score DECIMAL(5,2),
          analysis TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `;

      results.initialized.push('dating_style_questions', 'dating_style_assessments');
      console.log('✅ Dating style tables initialized');
    } catch (error) {
      results.errors.push(`dating_style_tables: ${error}`);
    }

    // 5. Relationship coach tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS relationship_coach_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_type VARCHAR(50) NOT NULL,
          context TEXT,
          ai_response TEXT,
          user_feedback TEXT,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      results.initialized.push('relationship_coach_sessions');
      console.log('✅ Relationship coach tables initialized');
    } catch (error) {
      results.errors.push(`relationship_coach_tables: ${error}`);
    }

    // 6. Dating style blindspots tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS dating_blindspots_assessments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          responses JSONB NOT NULL,
          blindspots JSONB,
          recommendations JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `;

      results.initialized.push('dating_blindspots_assessments');
      console.log('✅ Dating blindspots tables initialized');
    } catch (error) {
      results.errors.push(`dating_blindspots_tables: ${error}`);
    }

    // 7. Premium dashboard tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS premium_dashboard_data (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          data_type VARCHAR(100) NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, data_type)
        );
      `;

      results.initialized.push('premium_dashboard_data');
      console.log('✅ Premium dashboard tables initialized');
    } catch (error) {
      results.errors.push(`premium_dashboard_tables: ${error}`);
    }

    // 8. Dating archetypes tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS dating_archetypes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          characteristics JSONB,
          strengths JSONB,
          challenges JSONB,
          compatibility JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS user_archetype_assessments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          primary_archetype_id INTEGER REFERENCES dating_archetypes(id),
          secondary_archetype_id INTEGER REFERENCES dating_archetypes(id),
          assessment_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `;

      results.initialized.push('dating_archetypes', 'user_archetype_assessments');
      console.log('✅ Dating archetypes tables initialized');
    } catch (error) {
      results.errors.push(`dating_archetypes_tables: ${error}`);
    }

    // 9. A/B Testing tables
    try {
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

      results.initialized.push('ab_tests', 'user_test_assignments', 'ab_test_metrics');
      console.log('✅ A/B testing tables initialized');
    } catch (error) {
      results.errors.push(`ab_testing_tables: ${error}`);
    }

    // 10. Feedback and support tables
    try {
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

      results.initialized.push('user_feedback', 'support_tickets');
      console.log('✅ Feedback and support tables initialized');
    } catch (error) {
      results.errors.push(`feedback_support_tables: ${error}`);
    }

    // 11. Tutorial and onboarding tables
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS tutorial_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          tutorial_id VARCHAR(100) NOT NULL,
          step_completed INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT false,
          data JSONB DEFAULT '{}',
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          UNIQUE(user_id, tutorial_id)
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS tutorial_analytics (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          tutorial_id VARCHAR(100) NOT NULL,
          event_type VARCHAR(50) NOT NULL,
          event_data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      results.initialized.push('tutorial_progress', 'tutorial_analytics');
      console.log('✅ Tutorial and onboarding tables initialized');
    } catch (error) {
      results.errors.push(`tutorial_tables: ${error}`);
    }

    // 12. Create indexes for performance
    try {
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
        'CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON users(subscription_type);',
        'CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_emotionele_readiness_assessments_user_id ON emotionele_readiness_assessments(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_emotionele_readiness_results_assessment_id ON emotionele_readiness_results(assessment_id);',
        'CREATE INDEX IF NOT EXISTS idx_dating_style_assessments_user_id ON dating_style_assessments(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_relationship_coach_sessions_user_id ON relationship_coach_sessions(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_id ON tutorial_progress(user_id);'
      ];

      for (const indexSQL of indexes) {
        await sql.unsafe(indexSQL);
      }

      console.log('✅ Database indexes created');
    } catch (error) {
      results.errors.push(`indexes: ${error}`);
    }

    results.totalTables = results.initialized.length;

    console.log(`🎉 Database initialization completed!`);
    console.log(`✅ Successfully initialized: ${results.initialized.length} tables`);
    if (results.errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${results.errors.length}`);
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('❌ Critical error during database initialization:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Critical database initialization error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}