import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/in-app-notification-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, subscriptionType } = await request.json();

    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      );
    }

    // Create welcome notification
    const notification = await createNotification({
      userId,
      title: `Welkom bij DatingAssistent, ${userName}! 🎉`,
      message: subscriptionType && subscriptionType !== 'free'
        ? `Je ${subscriptionType} abonnement is geactiveerd. Ontdek al je premium tools en start je dating journey!`
        : `Je account is klaar! Ontdek onze gratis tools en verbeter je dating skills.`,
      type: 'success',
      actionUrl: '/dashboard',
      actionText: 'Naar Dashboard'
    });

    if (notification) {
      return NextResponse.json({
        success: true,
        notificationId: notification.id
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Welcome notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}