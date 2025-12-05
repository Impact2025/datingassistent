/**
 * API Route: POST /api/support/chat
 *
 * Iris Support Chat - AI-first support with escalation
 * Wereldklasse Helpdesk - DatingAssistent.nl
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { KB_ARTICLES, searchKnowledgeBase } from '@/lib/support/knowledge-base';
import type { SupportMessage, TicketCategory } from '@/lib/support/types';

// Lazy initialization
const getAnthropicClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};

// Support-focused system prompt
const IRIS_SUPPORT_SYSTEM_PROMPT = `Je bent Iris Support, de vriendelijke AI support assistant van DatingAssistent.nl.

## Jouw Rol
Je helpt gebruikers met:
- Account problemen (login, wachtwoord, profiel)
- Betalingsvragen (abonnement, facturen, opzeggen)
- Technische problemen (bugs, errors, performance)
- Feature vragen (hoe werkt X, waar vind ik Y)
- Algemene vragen over DatingAssistent

## Communicatiestijl
- Warm, empathisch en geduldig
- Professioneel maar niet stijf
- Kort en to-the-point (max 3 korte alinea's)
- Gebruik af en toe een relevante emoji voor warmte
- Spreek in informeel Nederlands (jij/je)

## Belangrijke Richtlijnen
1. ALTIJD eerst begrip tonen voor de frustratie/vraag
2. Geef concrete, actionable oplossingen
3. Als je iets niet weet, zeg dat eerlijk
4. Bied ALTIJD aan om door te verbinden met een medewerker als de vraag complex is
5. Nooit beloven wat je niet kunt waarmaken

## Escalatie Triggers
Adviseer escalatie naar menselijke support bij:
- Billing disputes boven €50
- Account deletion verzoeken
- Klachten over discriminatie/harassment
- Juridische/GDPR vragen
- Wanneer gebruiker 3x dezelfde vraag stelt zonder oplossing
- Extreme frustratie of emotie

## Wat je NIET doet
- Geen medisch/psychologisch advies
- Geen wachtwoorden of persoonlijke gegevens vragen
- Geen beloftes over refunds zonder verificatie
- Geen externe links (alleen datingassistent.nl)

## Response Format
Begin met begrip, geef oplossing, eindig met vraag of de gebruiker verder geholpen is.`;

// Detect ticket category from message
function detectCategory(message: string): TicketCategory {
  const lowerMessage = message.toLowerCase();

  if (/betaling|betalen|geld|factuur|abonnement|prijs|kosten|opzeggen|refund/.test(lowerMessage)) {
    return 'billing';
  }
  if (/bug|error|crash|werkt niet|traag|probleem|kapot|fout/.test(lowerMessage)) {
    return 'technical';
  }
  if (/feature|functie|nieuw|toevoegen|idee|suggestie/.test(lowerMessage)) {
    return 'feature_request';
  }
  if (/account|inloggen|wachtwoord|email|profiel|verwijderen/.test(lowerMessage)) {
    return 'account';
  }
  if (/hoe werkt|waar vind|wat is|uitleg/.test(lowerMessage)) {
    return 'feature_question';
  }

  return 'general';
}

// Detect sentiment
function detectSentiment(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Negative indicators
  const negativeWords = ['frustratie', 'boos', 'teleurgesteld', 'slecht', 'verschrikkelijk', 'waardeloos', 'oplichting', 'stelen'];
  const hasNegative = negativeWords.some(word => lowerMessage.includes(word));

  // Question indicators
  const isQuestion = /\?|hoe|wat|waar|wanneer|waarom/.test(lowerMessage);

  // Urgency indicators
  const urgentWords = ['dringend', 'urgent', 'snel', 'direct', 'nu', 'help'];
  const isUrgent = urgentWords.some(word => lowerMessage.includes(word));

  if (hasNegative) return 'negatief';
  if (isUrgent) return 'urgent';
  if (isQuestion) return 'vragend';
  return 'neutraal';
}

// Check if escalation is needed
function checkEscalationNeeded(
  message: string,
  category: TicketCategory,
  conversationLength: number
): boolean {
  const lowerMessage = message.toLowerCase();

  // Explicit escalation requests
  if (/mens|medewerker|echt persoon|bellen|telefoon|geen bot/.test(lowerMessage)) {
    return true;
  }

  // Long conversations without resolution
  if (conversationLength > 6) {
    return true;
  }

  // Billing disputes
  if (category === 'billing' && /refund|terugbetaling|dispute|klacht/.test(lowerMessage)) {
    return true;
  }

  // Legal/GDPR
  if (/gdpr|avg|privacy|advocaat|juridisch|rechtszaak/.test(lowerMessage)) {
    return true;
  }

  return false;
}

// Find relevant knowledge base articles
function findRelevantArticles(message: string): string {
  const results = searchKnowledgeBase(message).slice(0, 2);
  if (results.length === 0) return '';

  return '\n\nRelevante artikelen die je kunt aanbevelen:\n' +
    results.map(article =>
      `- "${article.title}": ${article.summary}`
    ).join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      conversationHistory = [],
      userSegment = 'anonymous',
      userId,
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Bericht is verplicht' },
        { status: 400 }
      );
    }

    // Detect category, sentiment, and escalation need
    const category = detectCategory(message);
    const sentiment = detectSentiment(message);
    const escalationNeeded = checkEscalationNeeded(
      message,
      category,
      conversationHistory.length
    );

    // Find relevant KB articles to include in context
    const relevantArticles = findRelevantArticles(message);

    // Build conversation messages for Claude
    const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = [];

    // Add conversation history (last 6 messages)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      if (msg.type === 'user') {
        claudeMessages.push({ role: 'user', content: msg.content });
      } else if (msg.type === 'iris') {
        claudeMessages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Add current message with context
    let contextualMessage = message;
    if (relevantArticles) {
      contextualMessage += relevantArticles;
    }

    // Add user segment context
    const segmentContext = getSegmentContext(userSegment);
    if (segmentContext) {
      contextualMessage += `\n\n[Context: ${segmentContext}]`;
    }

    claudeMessages.push({ role: 'user', content: contextualMessage });

    // Call Claude API
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: IRIS_SUPPORT_SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    const irisResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Sorry, ik kon geen antwoord genereren. Neem contact op met onze support.';

    // Generate suggested actions based on category
    const suggestedActions = getSuggestedActions(category);

    return NextResponse.json({
      response: irisResponse,
      category,
      sentiment,
      escalationNeeded,
      suggestedActions,
    });

  } catch (error) {
    console.error('Support chat error:', error);

    // Return a friendly fallback response
    return NextResponse.json({
      response: 'Er ging iets mis aan mijn kant. Mijn excuses! Je kunt ook direct contact opnemen via support@datingassistent.nl of bel ons op 020-1234567.',
      category: 'general',
      sentiment: 'neutraal',
      escalationNeeded: true,
      suggestedActions: ['contact_support'],
    });
  }
}

function getSegmentContext(segment: string): string {
  switch (segment) {
    case 'premium':
      return 'Dit is een Premium gebruiker met voorrang support';
    case 'new_user':
      return 'Dit is een nieuwe gebruiker (< 7 dagen), wees extra behulpzaam';
    case 'struggling':
      return 'Deze gebruiker heeft moeite met het platform, bied extra hulp aan';
    case 'churning':
      return 'Deze gebruiker is mogelijk aan het afhaken, wees extra attent';
    default:
      return '';
  }
}

function getSuggestedActions(category: TicketCategory): string[] {
  switch (category) {
    case 'billing':
      return ['view_subscription', 'contact_billing', 'view_invoices'];
    case 'technical':
      return ['clear_cache', 'report_bug', 'contact_tech'];
    case 'account':
      return ['reset_password', 'edit_profile', 'privacy_settings'];
    case 'feature_question':
      return ['view_tutorials', 'ask_iris', 'read_docs'];
    default:
      return ['contact_support', 'view_faq'];
  }
}
