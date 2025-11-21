import { NextResponse } from 'next/server';
import { getAllForumCategories } from '@/lib/community-db';

export async function GET() {
  try {
    const categories = await getAllForumCategories();

    return NextResponse.json({
      categories
    }, { status: 200 });

  } catch (error) {
    console.error('Get forum categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}