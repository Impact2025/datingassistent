import { sql } from '@vercel/postgres';
import type { ChatbotLogEntry } from './types';

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS chatbot_sessions (
      session_id SERIAL PRIMARY KEY,
      session_token TEXT NOT NULL UNIQUE,
      channel TEXT NOT NULL,
      user_identifier TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS chatbot_messages (
      id SERIAL PRIMARY KEY,
      session_id INTEGER REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
      message_id TEXT NOT NULL,
      intent TEXT NOT NULL,
      confidence NUMERIC(5,4) NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

async function upsertSession(sessionToken: string, channel: string, userIdentifier?: string) {
  const result = await sql<{ session_id: number }>`
    INSERT INTO chatbot_sessions (session_token, channel, user_identifier)
    VALUES (${sessionToken}, ${channel}, ${userIdentifier ?? null})
    ON CONFLICT (session_token) DO UPDATE SET channel = EXCLUDED.channel, user_identifier = COALESCE(EXCLUDED.user_identifier, chatbot_sessions.user_identifier)
    RETURNING session_id;
  `;

  return result.rows[0]?.session_id;
}

export async function logChatbotInteraction(entry: ChatbotLogEntry) {
  try {
    await ensureTables();
    const sessionId = await upsertSession(entry.sessionId, entry.channel, entry.userIdentifier);

    if (!sessionId) {
      return;
    }

    const metadataJson = JSON.stringify(entry.metadata ?? {});

    await sql`
      INSERT INTO chatbot_messages (session_id, message_id, intent, confidence, question, answer, metadata)
      VALUES (${sessionId}, ${entry.messageId}, ${entry.intent}, ${entry.confidence}, ${entry.question}, ${entry.answer}, ${metadataJson}::jsonb);
    `;
  } catch (error) {
    console.error('Chatbot logging failed', error);
  }
}
