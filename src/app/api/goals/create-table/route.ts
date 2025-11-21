import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Check if table exists
    const checkResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_goals'
      );
    `;
    
    const tableExists = checkResult.rows[0].exists;
    
    if (tableExists) {
      return NextResponse.json({
        success: true,
        message: 'Table user_goals already exists',
        created: false
      });
    }
    
    // Create table
    await sql`
      CREATE TABLE user_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        target_value INTEGER DEFAULT 1,
        current_value INTEGER DEFAULT 0,
        deadline TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'active',
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create index
    await sql`
      CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Table user_goals created successfully',
      created: true
    });
    
  } catch (error) {
    console.error('Error creating user_goals table:', error);
    return NextResponse.json(
      { error: 'Failed to create user_goals table', details: error },
      { status: 500 }
    );
  }
}