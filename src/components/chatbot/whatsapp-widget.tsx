'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
};

type FollowUpAction = { label: string; payload: string };

const SUGGESTED_PROMPTS = [
  'Wat is DatingAssistent?',
  'Ik heb een probleem met inloggen',
  'Welke pakketten hebben jullie?',
];

function createClientId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function WebChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [actions, setActions] = useState<FollowUpAction[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => createClientId());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: 'Hoi! Ik ben je DatingAssistent-coach. Waar kan ik je mee helpen? 💬',
        },
      ]);
      setActions([
        { label: 'Supportvragen', payload: 'support-login' },
        { label: 'Prijzen bekijken', payload: 'pricing-overview' },
        { label: 'Meer over de app', payload: 'faq-what-is-da' },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (text: string, quickReplyId?: string) => {
    const trimmed = text.trim();
    if (!trimmed && !quickReplyId) {
      return;
    }

    const userMessage: Message | null = quickReplyId
      ? null
      : {
          id: `user-${Date.now()}`,
          sender: 'user',
          text: trimmed,
        };

    if (userMessage) {
      setMessages((prev) => [...prev, userMessage]);
    }

    setLoading(true);
    setStatus(null);
    setActions([]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: trimmed || undefined,
          quickReplyId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er ging iets mis. Probeer het later opnieuw.');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.replyText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setActions(data.followUpActions ?? []);
      setInput('');
    } catch (error: any) {
      const fallbackMessage = error.message ?? 'Er ging iets mis. Probeer het later opnieuw.';
      setStatus(fallbackMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          sender: 'assistant',
          text: fallbackMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleQuickReply = (payload: string) => {
    const action = actions.find((item) => item.payload === payload);
    if (action) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: 'user',
          text: action.label,
        },
      ]);
    }
    void sendMessage('', payload);
  };

  const displayMessages = useMemo(() => messages, [messages]);

  return (
    <div>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Open chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <header className="bg-primary/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-primary">DatingAssistent live chat</h2>
            <p className="text-xs text-foreground/70">Antwoord binnen enkele seconden</p>
          </header>

          <div className="flex flex-col gap-3 overflow-y-auto px-4 py-4 text-sm" style={{ maxHeight: '360px' }}>
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                  message.sender === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.text}
              </div>
            ))}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <button
                    key={action.payload}
                    onClick={() => handleQuickReply(action.payload)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-muted/30 px-4 py-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Typ je vraag..."
                rows={1}
                className="h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="icon" disabled={loading || (!input.trim() && actions.length === 0)}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {status && <p className="mt-2 text-xs text-destructive">{status}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-full bg-background px-3 py-1 text-xs text-foreground/70 transition-colors hover:text-primary"
                  onClick={() => {
                    setInput(prompt);
                  }}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Door te chatten ga je akkoord met onze{' '}
              <a href="/privacyverklaring" className="underline">
                privacyverklaring
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
