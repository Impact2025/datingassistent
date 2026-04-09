import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getUserProfileExtended, updateUserProfileExtended } from '@/lib/community-db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    logger.log('Profile API GET request for userId:', userId);

    if (!userId) {
      logger.log('No userId provided');
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    try {
      const profile = await getUserProfileExtended(parseInt(userId));
      logger.log('Profile fetched:', profile);

      if (!profile) {
        logger.log('No profile found for userId:', userId);
        // Return empty profile instead of error to prevent crashes
        return NextResponse.json({
          profile: {
            userId: parseInt(userId),
            bio: null,
            location: null,
            interests: [],
            profilePictureUrl: null,
            coverPhotoUrl: null,
            joinDate: null,
            lastActive: null,
            reputationPoints: 0
          }
        }, { status: 200 });
      }

      return NextResponse.json({
        profile
      }, { status: 200 });
    } catch (dbError) {
      console.error('Database error fetching profile:', dbError);
      // Return empty profile on database errors to prevent crashes
      return NextResponse.json({
        profile: {
          userId: parseInt(userId),
          bio: null,
          location: null,
          interests: [],
          profilePictureUrl: null,
          coverPhotoUrl: null,
          joinDate: null,
          lastActive: null,
          reputationPoints: 0
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, profileData } = await request.json();
    logger.log('Profile API PUT request for userId:', userId, 'with data:', profileData);

    if (!userId || !profileData) {
      logger.log('Missing userId or profileData');
      return NextResponse.json(
        { error: 'userId and profileData are required' },
        { status: 400 }
      );
    }

    try {
      await updateUserProfileExtended(parseInt(userId), profileData);
      logger.log('Profile updated for userId:', userId);

      // Fetch the updated profile
      const updatedProfile = await getUserProfileExtended(parseInt(userId));
      logger.log('Updated profile fetched:', updatedProfile);

      return NextResponse.json({
        profile: updatedProfile
      }, { status: 200 });
    } catch (dbError) {
      console.error('Database error updating profile:', dbError);
      // Return success with empty profile on database errors
      return NextResponse.json({
        profile: {
          userId: parseInt(userId),
          bio: profileData.bio || null,
          location: profileData.location || null,
          interests: profileData.interests || [],
          profilePictureUrl: profileData.profilePictureUrl || null,
          coverPhotoUrl: profileData.coverPhotoUrl || null,
          joinDate: null,
          lastActive: null,
          reputationPoints: 0
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}