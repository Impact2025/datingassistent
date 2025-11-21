import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'whatsapp_disabled',
      message: 'WhatsApp-integratie is uitgeschakeld. Gebruik de webchat-widget.',
    },
    { status: 410 },
  );
}
