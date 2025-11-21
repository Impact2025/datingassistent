import { NextRequest, NextResponse } from 'next/server';
import { createModule, updateModule, deleteModule } from '@/lib/course-service';
import { checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

  const body = await request.json();
  const module = await createModule(body);

  if (!module) return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  return NextResponse.json(module);
}

export async function PUT(request: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;

  const success = await updateModule(id, data);
  if (!success) return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '');

  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const success = await deleteModule(id);
  if (!success) return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });

  return NextResponse.json({ success: true });
}
