import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'whatsapp_disabled',
      message: 'WhatsApp-webhook is uitgeschakeld. Gebruik de webchat-widget.',
    },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'whatsapp_disabled',
      message: 'WhatsApp-webhook is uitgeschakeld. Gebruik de webchat-widget.',
    },
    { status: 410 },
  );
}
