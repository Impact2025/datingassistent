import { NextRequest, NextResponse } from 'next/server';
import { AIContextManager } from '@/lib/ai-context-manager';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
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

    const context = await AIContextManager.getUserContext(user.id);

    return NextResponse.json({
      success: true,
      context
    });

  } catch (error: any) {
    console.error('Error getting AI context:', error);
    return NextResponse.json(
      { error: 'Failed to get AI context', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
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

    const body = await request.json();
    const { action, field, value, updates } = body;

    // Validate request size - prevent 413 errors
    const requestSize = JSON.stringify(body).length;
    const maxRequestSize = 100000; // 100KB limit for AI context

    if (requestSize > maxRequestSize) {
      return NextResponse.json(
        { error: 'Request too large', message: 'De verzonden data is te groot. Probeer met kleinere updates.' },
        { status: 413 }
      );
    }

    switch (action) {
      case 'update_field':
        if (!field || value === undefined) {
          return NextResponse.json(
            { error: 'Field and value are required for update_field action' },
            { status: 400 }
          );
        }
        await AIContextManager.updateContextField(user.id, field, value);
        break;

      case 'save_context':
        if (!updates) {
          return NextResponse.json(
            { error: 'Updates are required for save_context action' },
            { status: 400 }
          );
        }
        await AIContextManager.saveUserContext(user.id, updates);
        break;

      case 'track_usage':
        if (!field) {
          return NextResponse.json(
            { error: 'Tool name is required for track_usage action' },
            { status: 400 }
          );
        }
        await AIContextManager.trackToolUsage(user.id, field);
        break;

      case 'initialize':
        const { userProfile, personalityScan } = updates || {};
        await AIContextManager.initializeFromProfile(user.id, userProfile, personalityScan);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: update_field, save_context, track_usage, initialize' },
          { status: 400 }
        );
    }

    // Return updated context
    const updatedContext = await AIContextManager.getUserContext(user.id);

    return NextResponse.json({
      success: true,
      context: updatedContext
    });

  } catch (error: any) {
    console.error('Error updating AI context:', error);
    return NextResponse.json(
      { error: 'Failed to update AI context', details: error.message },
      { status: 500 }
    );
  }
}