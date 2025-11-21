export type ChatbotIntent =
  | 'support'
  | 'sales'
  | 'faq'
  | 'pricing'
  | 'privacy'
  | 'fallback';

export interface ChatbotContext {
  sessionId: string;
  channel: 'web' | 'whatsapp';
  userIdentifier?: string;
  locale?: string;
  intent?: ChatbotIntent;
  metadata?: Record<string, string | undefined>;
}

export interface ProcessMessageInput {
  messageId: string;
  messageText: string;
  context: ChatbotContext;
}

export interface ChatbotResponse {
  replyText: string;
  intent: ChatbotIntent;
  confidence: number;
  knowledgeBaseMatch?: KnowledgeBaseEntry;
  followUpActions?: Array<{ label: string; payload: string }>;
}

export interface KnowledgeBaseEntry {
  id: string;
  category:
    | 'Algemeen'
    | 'Profielhulp'
    | 'Gesprekscoach'
    | 'Dateplanner'
    | 'Zelfvertrouwen'
    | 'Veiligheid'
    | 'Account & Privacy'
    | 'Sales'
    | 'Prijzen'
    | 'Inclusie & toegankelijkheid';
  intent: ChatbotIntent;
  question: string;
  answer: string;
  quickReplies?: Array<{ label: string; payload: string }>;
  tags?: string[];
}

export interface ChatbotLogEntry {
  messageId: string;
  intent: ChatbotIntent;
  confidence: number;
  sessionId: string;
  channel: 'web' | 'whatsapp';
  userIdentifier?: string;
  question: string;
  answer: string;
  metadata?: Record<string, string | undefined>;
}
