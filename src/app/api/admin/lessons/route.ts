import { NextRequest, NextResponse } from 'next/server';
import { createLesson, updateLesson, deleteLesson } from '@/lib/course-service';
import { checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

  const body = await request.json();
  const lesson = await createLesson(body);

  if (!lesson) return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  return NextResponse.json(lesson);
}

export async function PUT(request: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;

  const success = await updateLesson(id, data);
  if (!success) return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '');

  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const success = await deleteLesson(id);
  if (!success) return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });

  return NextResponse.json({ success: true });
}
