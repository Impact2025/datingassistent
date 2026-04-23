import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Ensure data_requests table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS data_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'modify')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
          requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
    } catch (tableError) {
      console.error('Error ensuring data_requests table:', tableError);
    }

    const {
      // Standaard profiel
      name, age, location,
      // Art. 16 uitbreiding: bijzondere categorieën (vereist Art.9 consent)
      lookingFor,
      region,
      biggestFrustration,
      biggestFear,
      relationshipGoal,
      // Reflectie-correcties: [{id: number, correctedText: string}]
      reflectionCorrections,
    } = await request.json();

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
    }
    if (age !== undefined && (typeof age !== 'number' || age < 18 || age > 120)) {
      return NextResponse.json({ error: 'Age must be a number between 18 and 120' }, { status: 400 });
    }
    if (location !== undefined && (typeof location !== 'string' || location.trim().length === 0)) {
      return NextResponse.json({ error: 'Location must be a non-empty string' }, { status: 400 });
    }

    // Art.9-velden vereisen uitdrukkelijke toestemming
    const hasArt9Fields = lookingFor !== undefined || region !== undefined ||
      biggestFrustration !== undefined || biggestFear !== undefined || relationshipGoal !== undefined;

    if (hasArt9Fields) {
      const consentCheck = await sql`SELECT article9_consent FROM users WHERE id = ${user.id}`;
      if (!consentCheck.rows[0]?.article9_consent) {
        return NextResponse.json(
          { error: 'article9_consent_required', message: 'Uitdrukkelijke Art.9-toestemming vereist voor wijziging van deze gegevens.' },
          { status: 403 }
        );
      }
    }

    logger.log(`✏️ Data modification requested for user ${user.id}`);

    const currentProfileResult = await sql`SELECT profile FROM users WHERE id = ${user.id}`;
    if (currentProfileResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentProfile = currentProfileResult.rows[0].profile || {};
    const updatedProfile = {
      ...currentProfile,
      ...(name     !== undefined && { name: name.trim() }),
      ...(age      !== undefined && { age }),
      ...(location !== undefined && { location: location.trim() }),
    };

    await sql`UPDATE users SET profile = ${JSON.stringify(updatedProfile)}, updated_at = NOW() WHERE id = ${user.id}`;

    // Kickstart onboarding bijzondere categorieën
    if (hasArt9Fields) {
      await sql`
        UPDATE kickstart_onboarding SET
          looking_for          = COALESCE(${lookingFor ?? null},          looking_for),
          region               = COALESCE(${region ?? null},               region),
          biggest_frustration  = COALESCE(${biggestFrustration ?? null},  biggest_frustration),
          biggest_fear         = COALESCE(${biggestFear ?? null},         biggest_fear),
          relationship_goal    = COALESCE(${relationshipGoal ?? null},    relationship_goal),
          updated_at           = NOW()
        WHERE user_id = ${user.id}
      `.catch(() => {}); // stil mislukken als rij nog niet bestaat
    }

    // Reflectie-correcties (Art. 16: recht op rectificatie)
    const correctedReflections: number[] = [];
    if (Array.isArray(reflectionCorrections)) {
      for (const correction of reflectionCorrections) {
        if (!correction.id || typeof correction.correctedText !== 'string') continue;
        const res = await sql`
          UPDATE user_reflections SET
            answer_text = ${correction.correctedText.trim()},
            updated_at  = NOW()
          WHERE id = ${correction.id} AND user_id = ${user.id}
          RETURNING id
        `.catch(() => ({ rows: [] }));
        if (res.rows.length > 0) correctedReflections.push(correction.id);
      }
    }

    const changes: string[] = [];
    if (name !== undefined && name !== currentProfile.name) changes.push('name');
    if (age !== undefined && age !== currentProfile.age) changes.push('age');
    if (location !== undefined && location !== currentProfile.location) changes.push('location');
    if (hasArt9Fields) changes.push('kickstart_art9_fields');
    if (correctedReflections.length > 0) changes.push(`reflections(${correctedReflections.join(',')})`);

    if (changes.length > 0) {
      await sql`
        INSERT INTO data_requests (user_id, request_type, status, data)
        VALUES (${user.id}, 'modify', 'completed', ${JSON.stringify({ changes, correctedReflections })})
      `.catch(() => {});
    }

    logger.log(`✅ Data modification completed for user ${user.id}, changes: ${changes.join(', ')}`);

    return NextResponse.json({ message: 'Gegevens bijgewerkt', changes, correctedReflections });

  } catch (error: any) {
    console.error('❌ Data modification error:', error);
    return NextResponse.json(
      {
        error: 'Data modification failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}