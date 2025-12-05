import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

// Helper functions to map kickstart onboarding data to profile format
function mapGender(kickstartGender: string | null): string {
  if (!kickstartGender) return '';
  const mapping: Record<string, string> = {
    'man': 'Man',
    'vrouw': 'Vrouw',
    'anders': 'Non-binair'
  };
  return mapping[kickstartGender] || kickstartGender;
}

function mapSeekingGender(lookingFor: string | null): string[] {
  if (!lookingFor) return [];
  const mapping: Record<string, string[]> = {
    'vrouwen': ['Vrouwen'],
    'mannen': ['Mannen'],
    'beiden': ['Vrouwen', 'Mannen']
  };
  return mapping[lookingFor] || [];
}

function mapRelationshipGoal(goal: string | null): string {
  if (!goal) return '';
  const mapping: Record<string, string> = {
    'serious': 'een serieuze relatie',
    'open': 'iets serieus of casual',
    'dates-first': 'iets serieus of casual',
    'connections': 'iets casuals'
  };
  return mapping[goal] || '';
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user profile from users table
    const result = await sql`
      SELECT profile, email, name FROM users WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let profile = result.rows[0].profile || {};
    const userName = result.rows[0].name;

    // If profile is empty or missing key fields, try to get data from kickstart_onboarding
    const needsKickstartData = !profile || !profile.name || !profile.age || !profile.gender;

    if (needsKickstartData) {
      try {
        const kickstartResult = await sql`
          SELECT
            preferred_name,
            gender,
            looking_for,
            region,
            age,
            dating_status,
            dating_apps,
            relationship_goal
          FROM kickstart_onboarding
          WHERE user_id = ${userId}
          LIMIT 1
        `;

        if (kickstartResult.rows.length > 0) {
          const ko = kickstartResult.rows[0];

          // Map kickstart onboarding data to profile format
          // Only fill in missing fields, don't overwrite existing profile data
          profile = {
            ...profile,
            name: profile.name || ko.preferred_name || userName,
            age: profile.age || ko.age,
            gender: profile.gender || mapGender(ko.gender),
            location: profile.location || ko.region,
            seekingGender: profile.seekingGender || mapSeekingGender(ko.looking_for),
            seekingType: profile.seekingType || mapRelationshipGoal(ko.relationship_goal),
            identityGroup: profile.identityGroup || 'algemeen',
            seekingAgeMin: profile.seekingAgeMin || 18,
            seekingAgeMax: profile.seekingAgeMax || 99,
            // Store source info for debugging
            _dataSource: 'kickstart_onboarding'
          };

          console.log('✅ Profile enriched with Kickstart onboarding data for user:', userId);
        }
      } catch (koError) {
        console.error('Error fetching kickstart onboarding data:', koError);
        // Continue with what we have
      }
    }

    return NextResponse.json({
      profile: Object.keys(profile).length > 0 ? profile : null,
      email: result.rows[0].email
    }, { status: 200 });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profileData, profileType } = body;

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Save profile data to user record
    const result = await sql`
      UPDATE users
      SET profile = ${JSON.stringify({
        ...profileData,
        savedAt: new Date().toISOString(),
        profileType: profileType || 'ai_generated'
      })}
      WHERE id = ${decoded.id}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Save profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
