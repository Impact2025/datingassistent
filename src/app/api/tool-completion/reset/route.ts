import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const toolName = request.nextUrl.searchParams.get('toolName');

  // Reset acknowledged - localStorage will be cleared by the hook
  return NextResponse.json({
    success: true,
    message: `Progress reset for ${toolName}`
  });
}
