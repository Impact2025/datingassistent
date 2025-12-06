import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// WhatsApp Business API Configuration
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = 'v18.0';

interface WhatsAppMessage {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          image?: {
            mime_type: string;
            sha256: string;
            id: string;
            caption?: string;
          };
          document?: {
            mime_type: string;
            sha256: string;
            id: string;
            filename?: string;
            caption?: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

// Webhook verification for WhatsApp
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook (you should set this in your environment variables)
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Verification failed', { status: 403 });
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppMessage = await request.json();
    console.log('📱 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Validate webhook structure
    if (!body.object || body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid webhook structure' }, { status: 400 });
    }

    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages' && change.value.messages) {
          await processWhatsAppMessages(change.value);
        }
      }
    }

    // Always respond with 200 OK to acknowledge receipt
    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processWhatsAppMessages(value: any) {
  const { messages, contacts, metadata } = value;

  if (!messages || !contacts) return;

  for (const message of messages) {
    const contact = contacts.find((c: any) => c.wa_id === message.from);
    const customerName = contact?.profile?.name || 'WhatsApp User';
    const customerPhone = message.from;

    try {
      // Check if there's an existing conversation for this customer
      const conversation = await sql`
        SELECT id, status, assigned_agent_id
        FROM chat_conversations
        WHERE customer_phone = ${customerPhone}
          AND status IN ('active', 'assigned', 'pending')
          AND channel = 'whatsapp'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      let conversationId: string;

      if (conversation.rows.length === 0) {
        // Create new conversation
        const newConversation = await sql`
          INSERT INTO chat_conversations (
            customer_name, customer_phone, customer_email,
            channel, status, priority, department,
            source_url, user_agent, referrer
          ) VALUES (
            ${customerName}, ${customerPhone}, NULL,
            'whatsapp', 'pending', 'normal', 'general',
            NULL, 'WhatsApp Mobile', NULL
          )
          RETURNING id
        `;

        conversationId = newConversation.rows[0].id;

        // Auto-assign to available agent
        await autoAssignConversation(conversationId);

      } else {
        conversationId = conversation.rows[0].id;

        // If conversation was closed, reopen it
        if (conversation.rows[0].status === 'closed') {
          await sql`
            UPDATE chat_conversations
            SET status = 'active', updated_at = NOW()
            WHERE id = ${conversationId}
          `;
        }
      }

      // Process message content
      let messageContent = '';
      let messageType = 'text';
      let attachmentUrl = null;

      if (message.type === 'text' && message.text) {
        messageContent = message.text.body;
      } else if (message.type === 'image' && message.image) {
        messageType = 'image';
        messageContent = message.image.caption || '📷 Image';
        // In production, you would download and store the image
        attachmentUrl = `whatsapp_image_${message.image.id}`;
      } else if (message.type === 'document' && message.document) {
        messageType = 'file';
        messageContent = message.document.filename || '📄 Document';
        // In production, you would download and store the document
        attachmentUrl = `whatsapp_doc_${message.document.id}`;
      }

      // Store message in database
      await sql`
        INSERT INTO chat_messages (
          conversation_id, sender_type, sender_id, sender_name,
          content, message_type, attachment_url, channel_message_id
        ) VALUES (
          ${conversationId}, 'customer', ${customerPhone}, ${customerName},
          ${messageContent}, ${messageType}, ${attachmentUrl}, ${message.id}
        )
      `;

      // Send notification to assigned agent (if any)
      const updatedConversation = await sql`
        SELECT assigned_agent_id
        FROM chat_conversations
        WHERE id = ${conversationId}
      `;

      if (updatedConversation.rows[0].assigned_agent_id) {
        // In production, you would send real-time notification to agent
        console.log(`🔔 Notification sent to agent ${updatedConversation.rows[0].assigned_agent_id} for WhatsApp message`);
      }

    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
    }
  }
}

async function autoAssignConversation(conversationId: string) {
  try {
    // Find available agent
    const availableAgent = await sql`
      SELECT a.id, a.name
      FROM chat_agents a
      WHERE a.is_available = true
        AND a.status = 'online'
        AND (SELECT COUNT(*) FROM chat_conversations c
             WHERE c.assigned_agent_id = a.id
             AND c.status IN ('active', 'assigned')) < a.max_concurrent_chats
      ORDER BY a.avg_response_time ASC
      LIMIT 1
    `;

    if (availableAgent.rows.length > 0) {
      const agent = availableAgent.rows[0];

      await sql`
        UPDATE chat_conversations
        SET assigned_agent_id = ${agent.id}, status = 'assigned', assigned_at = NOW()
        WHERE id = ${conversationId}
      `;

      console.log(`✅ WhatsApp conversation ${conversationId} assigned to agent ${agent.name}`);
    } else {
      console.log(`⏳ WhatsApp conversation ${conversationId} queued - no available agents`);
    }
  } catch (error) {
    console.error('Error auto-assigning WhatsApp conversation:', error);
  }
}

// Send WhatsApp message (for agents to reply)
async function sendWhatsAppMessage(to: string, message: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp credentials not configured');
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}