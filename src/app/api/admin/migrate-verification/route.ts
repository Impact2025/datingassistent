import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  // Basic auth check - in production you'd want proper authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // For development, accept any token. In production, validate properly
  const token = authHeader.substring(7);
  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  console.log('🚀 Starting database migration via API...');

  try {
    // Add columns one by one
    console.log('Adding email_verified column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;`;

    console.log('Adding verification_token column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);`;

    console.log('Adding verification_expires_at column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;`;

    // Migrate existing users to verified status
    console.log('Migrating existing users to verified status...');
    const migrationResult = await sql`
      UPDATE users
      SET email_verified = true
      WHERE email_verified IS NULL OR email_verified = false;
    `;

    console.log(`✅ Migrated ${migrationResult.rowCount} existing users to verified status`);

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_verification_expires ON users(verification_expires_at);`;

    // Verify the changes
    const verifyResult = await sql`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
      FROM users;
    `;

    const stats = verifyResult.rows[0];

    console.log('✅ Database migration completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Email verification migration completed successfully',
      stats: {
        totalUsers: parseInt(stats.total_users),
        verifiedUsers: parseInt(stats.verified_users),
        migratedUsers: migrationResult.rowCount,
      },
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}