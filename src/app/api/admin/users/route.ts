import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/users - Get all users with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role && role !== 'all') {
      whereConditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status && status !== 'all') {
      whereConditions.push(`u.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get users with pagination
    const usersQuery = `
      SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        'active' as status,
        u.created_at,
        u.last_login,
        true as email_verified,
        COALESCE(u.subscription_status, 'free') as subscription_status,
        CASE WHEN u.profile IS NOT NULL THEN true ELSE false END as profile_complete
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const usersResult = await sql.query(usersQuery, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN user_profiles_extended up ON u.id = up.user_id
      ${whereClause}
    `;

    const countResult = await sql.query(countQuery, params.slice(0, -2)); // Remove limit and offset

    const users = usersResult.rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      emailVerified: user.email_verified,
      subscriptionStatus: user.subscription_status,
      profileComplete: user.profile_complete
    }));

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin(request);

    const body = await request.json();
    const { email, name, password, role = 'user', sendWelcomeEmail = true } = body;

    // Comprehensive input validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Valid name is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Valid password is required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Name validation (no special characters that could cause issues)
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name.trim()) || name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, apostrophes, and periods' },
        { status: 400 }
      );
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        },
        { status: 400 }
      );
    }

    // Role validation
    const allowedRoles = ['user', 'admin', 'coach'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    const sanitizedRole = role;

    // Check if user already exists (using sanitized email)
    const existingUserResult = await sql.query(`
      SELECT id FROM users WHERE email = $1
    `, [sanitizedEmail]);

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with proper salt rounds
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with sanitized inputs
    const result = await sql.query(`
      INSERT INTO users (
        email,
        name,
        password_hash,
        role,
        status,
        email_verified,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, 'active', true, NOW(), NOW()
      )
      RETURNING id, email, name, role, status, created_at
    `, [sanitizedEmail, sanitizedName, passwordHash, sanitizedRole]);

    const newUser = result.rows[0];

    // TODO: Send welcome email if requested
    if (sendWelcomeEmail) {
      // Implementation for welcome email would go here
      console.log(`Welcome email would be sent to ${email}`);
    }

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}