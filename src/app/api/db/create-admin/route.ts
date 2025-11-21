import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';

/**
 * 🔒 SECURITY WARNING: This endpoint has been DISABLED for security reasons
 *
 * DO NOT use hard-coded passwords in production!
 *
 * To create an admin user, use one of these secure methods:
 *
 * 1. Via database console (recommended for production):
 *    ```sql
 *    -- Generate a strong password first, then:
 *    INSERT INTO users (email, display_name, password_hash, role, created_at)
 *    VALUES (
 *      'admin@example.com',
 *      'Admin',
 *      '$2a$10$your_bcrypt_hash_here',  -- Use bcrypt to hash your password
 *      'admin',
 *      NOW()
 *    );
 *    ```
 *
 * 2. Via a secure setup script:
 *    - Create a script that reads admin password from environment variable
 *    - Run once during deployment, then delete
 *
 * 3. For development only:
 *    - Set ALLOW_ADMIN_CREATION=true in .env.local
 *    - Set ADMIN_PASSWORD in environment (min 16 characters)
 *    - This endpoint will work once
 */
export async function POST() {
  // 🔒 SECURITY: This endpoint is disabled by default
  const allowCreation = process.env.ALLOW_ADMIN_CREATION === 'true';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!allowCreation) {
    return NextResponse.json({
      success: false,
      error: 'This endpoint has been disabled for security reasons',
      message: 'Please create admin users via database console or secure setup script',
      documentation: 'See comments in src/app/api/db/create-admin/route.ts',
    }, { status: 403 });
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      error: 'This endpoint is not available in production',
      message: 'Create admin users via database console',
    }, { status: 403 });
  }

  try {
    // Validate admin password from environment
    if (!adminPassword || adminPassword.length < 16) {
      return NextResponse.json({
        success: false,
        error: 'ADMIN_PASSWORD environment variable must be set and at least 16 characters',
      }, { status: 400 });
    }

    // Admin email from environment or default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminName = 'Admin';

    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${adminEmail}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
      }, { status: 400 });
    }

    // Hash password from environment
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user with role
    const result = await sql`
      INSERT INTO users (display_name, email, password_hash, role, created_at, updated_at)
      VALUES (${adminName}, ${adminEmail}, ${hashedPassword}, 'admin', NOW(), NOW())
      RETURNING id, display_name, email, role, created_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      warning: 'DISABLE this endpoint by setting ALLOW_ADMIN_CREATION=false',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        displayName: result.rows[0].display_name,
        role: result.rows[0].role,
      },
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create admin user',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
