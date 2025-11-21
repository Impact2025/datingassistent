import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Email configuration
const EMAIL_WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET || 'your_webhook_secret';

interface EmailWebhookPayload {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    content: Buffer;
  }>;
  messageId: string;
  timestamp: number;
}

// Handle incoming emails (webhook from email service like SendGrid, Mailgun, etc.)
export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity
    const signature = request.headers.get('X-Webhook-Signature');
    const timestamp = request.headers.get('X-Timestamp');

    // Basic signature verification (implement proper verification based on your email provider)
    if (!verifyWebhookSignature(request, signature, timestamp)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const emailData: EmailWebhookPayload = await request.json();
    console.log('📧 Email webhook received:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      messageId: emailData.messageId
    });

    await processIncomingEmail(emailData);

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Process incoming email and convert to chat conversation
async function processIncomingEmail(email: EmailWebhookPayload) {
  try {
    const { from, to, subject, text, html, attachments, messageId } = email;

    // Extract customer email and name
    const customerEmail = extractEmailAddress(from);
    const customerName = extractNameFromEmail(from) || 'Email Customer';

    // Check if this is a reply to an existing conversation
    const existingConversation = await findExistingConversation(customerEmail, subject, messageId);

    let conversationId: string;

    if (existingConversation) {
      conversationId = existingConversation.id;

      // Reopen conversation if it was closed
      if (existingConversation.status === 'closed') {
        await sql`
          UPDATE chat_conversations
          SET status = 'active', updated_at = NOW()
          WHERE id = ${conversationId}
        `;
      }
    } else {
      // Create new conversation from email
      const priority = determinePriority(subject, text || '');
      const department = determineDepartment(subject, text || '');

      const newConversation = await sql`
        INSERT INTO chat_conversations (
          customer_name, customer_email, customer_phone,
          channel, status, priority, department,
          source_url, user_agent, referrer,
          metadata
        ) VALUES (
          ${customerName}, ${customerEmail}, NULL,
          'email', 'pending', ${priority}, ${department},
          NULL, 'Email Client', NULL,
          ${JSON.stringify({ originalSubject: subject, messageId })}
        )
        RETURNING id
      `;

      conversationId = newConversation.rows[0].id;

      // Auto-assign to available agent
      await autoAssignConversation(conversationId);
    }

    // Process email content
    const messageContent = processEmailContent(subject, text, html);

    // Store email as message
    await sql`
      INSERT INTO chat_messages (
        conversation_id, sender_type, sender_id, sender_name,
        content, message_type, channel_message_id, metadata
      ) VALUES (
        ${conversationId}, 'customer', ${customerEmail}, ${customerName},
        ${messageContent}, 'email', ${messageId},
        ${JSON.stringify({ subject, hasAttachments: (attachments?.length || 0) > 0 })}
      )
    `;

    // Process attachments if any
    if (attachments && attachments.length > 0) {
      await processEmailAttachments(conversationId, attachments, customerEmail);
    }

    // Send notification to assigned agent
    const conversation = await sql`
      SELECT assigned_agent_id FROM chat_conversations WHERE id = ${conversationId}
    `;

    if (conversation.rows[0].assigned_agent_id) {
      console.log(`🔔 Email notification sent to agent ${conversation.rows[0].assigned_agent_id}`);
      // In production, send real-time notification
    }

  } catch (error) {
    console.error('Error processing incoming email:', error);
  }
}

async function findExistingConversation(customerEmail: string, subject: string, messageId: string) {
  try {
    // Check for direct reply (References or In-Reply-To headers would be better)
    const conversation = await sql`
      SELECT c.id, c.status, c.metadata
      FROM chat_conversations c
      JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.customer_email = ${customerEmail}
        AND c.channel = 'email'
        AND c.status IN ('active', 'assigned', 'pending', 'closed')
        AND (m.metadata->>'subject' ILIKE ${'%' + subject + '%'} OR c.metadata->>'originalSubject' ILIKE ${'%' + subject + '%'})
      ORDER BY c.updated_at DESC
      LIMIT 1
    `;

    return conversation.rows[0] || null;
  } catch (error) {
    console.error('Error finding existing conversation:', error);
    return null;
  }
}

function determinePriority(subject: string, content: string): string {
  const urgentKeywords = ['urgent', 'spoedeisend', 'asap', 'emergency', 'probleem', 'fout'];
  const subjectLower = subject.toLowerCase();
  const contentLower = content.toLowerCase();

  if (urgentKeywords.some(keyword => subjectLower.includes(keyword) || contentLower.includes(keyword))) {
    return 'urgent';
  }

  const highKeywords = ['complaint', 'klacht', 'refund', 'terugbetaling', 'cancel', 'opzeggen'];
  if (highKeywords.some(keyword => subjectLower.includes(keyword) || contentLower.includes(keyword))) {
    return 'high';
  }

  return 'normal';
}

function determineDepartment(subject: string, content: string): string {
  const subjectLower = subject.toLowerCase();
  const contentLower = content.toLowerCase();

  if (subjectLower.includes('betal') || subjectLower.includes('payment') || subjectLower.includes('prijs')) {
    return 'billing';
  }

  if (subjectLower.includes('technisch') || subjectLower.includes('fout') || subjectLower.includes('bug')) {
    return 'technical';
  }

  if (subjectLower.includes('verkoop') || subjectLower.includes('abonnement') || contentLower.includes('premium')) {
    return 'sales';
  }

  return 'general';
}

function processEmailContent(subject: string, text?: string, html?: string): string {
  let content = '';

  // Add subject as header
  content += `📧 ${subject}\n\n`;

  // Add email body
  if (text) {
    content += text;
  } else if (html) {
    // Basic HTML to text conversion (in production, use a proper HTML parser)
    content += html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  return content;
}

async function processEmailAttachments(conversationId: string, attachments: any[], customerEmail: string) {
  for (const attachment of attachments) {
    try {
      // Generate unique filename
      const fileName = `${Date.now()}_${attachment.filename}`;
      const filePath = `/uploads/email-attachments/${fileName}`;

      // In production, save file to cloud storage
      // For now, we'll just log it
      console.log(`📎 Processing email attachment: ${attachment.filename}`);

      // Store attachment reference in database
      await sql`
        INSERT INTO chat_attachments (
          conversation_id, file_name, file_path, file_size, file_type,
          uploaded_by_type, uploaded_by_id
        ) VALUES (
          ${conversationId}, ${attachment.filename}, ${filePath}, ${attachment.size}, ${attachment.contentType},
          'customer', ${customerEmail}
        )
      `;

    } catch (error) {
      console.error('Error processing email attachment:', error);
    }
  }
}

function extractEmailAddress(from: string): string {
  const emailMatch = from.match(/<([^>]+)>/);
  return emailMatch ? emailMatch[1] : from.trim();
}

function extractNameFromEmail(from: string): string | null {
  const nameMatch = from.match(/^([^<]+)/);
  return nameMatch ? nameMatch[1].trim().replace(/["']/g, '') : null;
}

function verifyWebhookSignature(request: NextRequest, signature: string | null, timestamp: string | null): boolean {
  // Implement proper webhook signature verification based on your email provider
  // For now, we'll do basic verification
  if (!signature || !timestamp) {
    return false;
  }

  // In production, verify the signature using HMAC-SHA256 with your webhook secret
  // const expectedSignature = crypto.createHmac('sha256', EMAIL_WEBHOOK_SECRET)
  //   .update(timestamp + JSON.stringify(await request.json()))
  //   .digest('hex');

  return true; // Placeholder - implement proper verification
}

// Send email reply (for agents)
export async function sendEmailReply(
  to: string,
  subject: string,
  message: string,
  conversationId: string,
  agentName: string
) {
  // In production, integrate with your email service (SendGrid, AWS SES, etc.)
  console.log(`📤 Sending email reply to ${to}`);
  console.log(`Subject: Re: ${subject}`);
  console.log(`From: ${agentName} <support@datingsassistent.nl>`);
  console.log(`Message: ${message}`);

  // Store agent's reply as message
  await sql`
    INSERT INTO chat_messages (
      conversation_id, sender_type, sender_name,
      content, message_type, metadata
    ) VALUES (
      ${conversationId}, 'agent', ${agentName},
      ${message}, 'email_reply',
      ${JSON.stringify({ to, subject: `Re: ${subject}` })}
    )
  `;

  // Update conversation
  await sql`
    UPDATE chat_conversations
    SET updated_at = NOW()
    WHERE id = ${conversationId}
  `;

  // In production, actually send the email via your email service
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: to,
    from: 'support@datingsassistent.nl',
    subject: `Re: ${subject}`,
    text: message,
    html: message.replace(/\n/g, '<br>'),
  };

  await sgMail.send(msg);
  */
}

export async function autoAssignConversation(conversationId: string) {
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

      console.log(`✅ Email conversation ${conversationId} assigned to agent ${agent.name}`);
    } else {
      console.log(`⏳ Email conversation ${conversationId} queued - no available agents`);
    }
  } catch (error) {
    console.error('Error auto-assigning email conversation:', error);
  }
}