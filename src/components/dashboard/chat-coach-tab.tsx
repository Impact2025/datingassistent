"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Send, Sparkles, HelpCircle, Copy } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCoachingTracker } from "@/hooks/use-coaching-tracker";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";
import { useToolCompletion } from "@/hooks/use-tool-completion";
import { useAIContext } from "@/hooks/use-ai-context";
import { useUser } from "@/providers/user-provider";

type Message = {
  role: "user" | "model";
  content: string;
};

const DEFAULT_WELCOME: Message = {
  role: "model",
  content: "👋 **Hallo! Ik ben Coach Iris, je persoonlijke AI dating coach.**\n\nIk help je met:\n• Dating profiel optimalisatie\n• Gesprekstechnieken en flirten\n• Date planning en advies\n• Omgaan met afwijzing\n• Relatie vragen\n\nStel me gerust je vraag! 💕"
};

export function ChatCoachTab() {
  const { toast } = useToast();
  const { userProfile } = useUser();
  const { trackCustomEvent } = useCoachingTracker('chat-coach');
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('chat-coach');
  const {
    markAsCompleted: markCompleted,
  } = useToolCompletion('chat-coach');

  const { trackToolUsage } = useAIContext();

  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isResponding, startResponding] = useTransition();
  const [usageLimitReached, setUsageLimitReached] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; resetTimeHuman: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gepersonaliseerd welkomstbericht bij terugkeer (eenmalig per sessie)
  useEffect(() => {
    if (sessionStorage.getItem('iris_welcomed')) return;

    fetch('/api/iris/welcome')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.welcome) {
          setMessages([{ role: 'model', content: data.welcome }]);
        }
        sessionStorage.setItem('iris_welcomed', '1');
      })
      .catch(() => {
        sessionStorage.setItem('iris_welcomed', '1');
      });
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Tutorial trigger
  useEffect(() => {
    const handleTutorialTrigger = (event: CustomEvent) => {
      if (event.detail?.toolId === 'chat') setShowOverlay(true);
    };
    window.addEventListener('open-tool-tutorial', handleTutorialTrigger as EventListener);
    return () => window.removeEventListener('open-tool-tutorial', handleTutorialTrigger as EventListener);
  }, []);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || usageLimitReached) return;

    const newMessage: Message = { role: "user", content: currentMessage };
    const previousMessages = messages;
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    const messageToSend = currentMessage;
    setCurrentMessage("");

    await trackToolUsage('chat-coach');

    startResponding(async () => {
      try {
        const response = await fetch('/api/iris/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageToSend,
            context_type: 'general',
          }),
        });

        // 429 = daglimiet bereikt (JSON response van iris route)
        if (response.status === 429) {
          const data = await response.json();
          setUsageLimitReached(true);
          if (data.usageStatus) setUsageInfo(data.usageStatus);
          toast({
            title: "Daglimiet bereikt",
            description: data.message || "Je hebt je dagelijkse limiet bereikt.",
            variant: "destructive",
          });
          setMessages(previousMessages);
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || `API fout: ${response.status}`);
        }

        // Streaming response verwerken
        setMessages(prev => [...prev, { role: 'model', content: '' }]);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'chunk') {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'model',
                    content: updated[updated.length - 1].content + event.content
                  };
                  return updated;
                });
              } else if (event.type === 'done') {
                if (event.usageStatus) {
                  setUsageInfo(event.usageStatus);
                  if (!event.usageStatus.allowed) setUsageLimitReached(true);
                }
              } else if (event.type === 'error') {
                throw new Error(event.error);
              }
            } catch (parseError) {
              if (parseError instanceof SyntaxError) continue;
              throw parseError;
            }
          }
        }

        // Milestone tracking
        const userCount = updatedMessages.filter(m => m.role === 'user').length;
        if (userCount === 1) await markCompleted('first_question', { timestamp: new Date().toISOString() });
        if (userCount >= 3) await markCompleted('conversation_continued', { messageCount: userCount, timestamp: new Date().toISOString() });
        if (userCount >= 5) await markCompleted('practice_completed', { messageCount: userCount, timestamp: new Date().toISOString() });

        await trackCustomEvent('chat_message_sent', { messageLength: messageToSend.length, conversationType: 'general' });

      } catch (error) {
        console.error('Coach Iris error:', error);

        let errorTitle = "Fout";
        let errorDescription = "Coach Iris kon niet antwoorden. Probeer het opnieuw.";

        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('403')) {
            errorTitle = "Sessie verlopen";
            errorDescription = "Log opnieuw in.";
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorTitle = "Netwerkfout";
            errorDescription = "Controleer je internetverbinding.";
          }
        }

        toast({ title: errorTitle, description: errorDescription, variant: "destructive" });
        setMessages(previousMessages);
      }
    });
  };

  const getUserInitials = () => {
    if (!userProfile?.name) return 'U';
    return userProfile.name.charAt(0).toUpperCase();
  };

  return (
    <>
      <ToolOnboardingOverlay
        toolName="chat-coach"
        displayName={getToolDisplayName('chat-coach')}
        steps={getOnboardingSteps('chat-coach')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => {}}
      />

      <div className="flex h-full bg-background rounded-xl md:rounded-lg border overflow-hidden" style={{ maxHeight: 'calc(100dvh - 180px)' }}>
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="hidden md:flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">Coach Iris</h2>
                <p className="text-xs text-muted-foreground">Altijd beschikbaar • Persoonlijk advies</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowOverlay(true)} className="gap-2">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </div>

          {/* Daglimiet melding */}
          {usageLimitReached && usageInfo && (
            <Alert className="m-4 mb-0">
              <AlertTitle>Daglimiet bereikt</AlertTitle>
              <AlertDescription>
                Je hebt {usageInfo.used}/{usageInfo.limit} berichten gebruikt. Beschikbaar over: {usageInfo.resetTimeHuman}.
              </AlertDescription>
            </Alert>
          )}

          {/* Berichten */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8 bg-primary flex-shrink-0 mt-1">
                      <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-white border border-gray-200 shadow-sm md:bg-muted md:border'
                    }`}>
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-900 md:text-foreground">{children}</p>,
                              ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed text-gray-900 md:text-foreground">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-gray-900 md:text-foreground">{children}</strong>,
                              em: ({ children }) => <em className="italic text-gray-900 md:text-foreground">{children}</em>,
                              h3: ({ children }) => <h3 className="font-semibold mt-4 mb-2 text-base text-gray-900 md:text-foreground">{children}</h3>,
                              h4: ({ children }) => <h4 className="font-semibold mt-3 mb-1 text-sm text-gray-900 md:text-foreground">{children}</h4>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 md:text-muted-foreground my-2">{children}</blockquote>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {message.role === 'model' && message.content && (
                      <div className="flex items-center gap-2 mt-2 ml-12">
                        <Button
                          variant="ghost" size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Kopiëren
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 bg-secondary flex-shrink-0 mt-1">
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isResponding && (
                <div className="flex items-start gap-4 justify-start">
                  <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
                    <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted border rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">Coach Iris typt...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Mobile */}
            <div className="md:hidden">
              {messages.length <= 1 && (
                <div className="px-4 pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Voorbeelden om te beginnen:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Profiel verbeteren", "Hoe maak ik mijn dating profiel aantrekkelijker?"],
                      ["Date gesprekken", "Wat zijn goede gespreksonderwerpen voor een eerste date?"],
                      ["Afwijzing verwerken", "Hoe ga ik om met afwijzing?"],
                      ["App advies", "Welke dating app past bij mij?"],
                    ].map(([label, msg]) => (
                      <Button key={label} variant="outline" size="sm" onClick={() => setCurrentMessage(msg)} className="text-xs h-auto py-2 px-3">
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className={`px-4 ${messages.length <= 1 ? 'pt-2 pb-4' : 'py-3'}`}>
                <div className="flex items-end gap-2">
                  <Textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isResponding && handleSendMessage()}
                    placeholder="Stel je vraag aan de dating coach..."
                    className={`w-full resize-none border-0 shadow-none focus:ring-0 bg-coral-50/50 border-coral-200/50 text-base leading-relaxed placeholder:text-muted-foreground/70 rounded-2xl px-4 ${messages.length <= 1 ? 'min-h-[80px] py-3' : 'min-h-[60px] py-2'}`}
                    disabled={isResponding || usageLimitReached}
                    rows={messages.length <= 1 ? 2 : 1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isResponding || !currentMessage.trim() || usageLimitReached}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-full p-0 flex-shrink-0"
                  >
                    {isResponding ? <LoadingSpinner /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Druk op Enter om te versturen</span>
                  <span className="text-muted-foreground/70">Coach Iris • Altijd beschikbaar</span>
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block max-w-4xl mx-auto p-4">
              {messages.length <= 1 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Voorbeelden om te beginnen:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["Profiel verbeteren", "Hoe maak ik mijn dating profiel aantrekkelijker?"],
                      ["Date gesprekken", "Wat zijn goede gespreksonderwerpen voor een eerste date?"],
                      ["Afwijzing verwerken", "Hoe ga ik om met afwijzing?"],
                      ["App advies", "Welke dating app past bij mij?"],
                    ].map(([label, msg]) => (
                      <Button key={label} variant="outline" size="sm" onClick={() => setCurrentMessage(msg)} className="text-xs">
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-end gap-3">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isResponding && handleSendMessage()}
                  placeholder="Stel je vraag aan de dating coach..."
                  className="min-h-[60px] max-h-[200px] resize-none border-0 shadow-none focus:ring-0 bg-coral-50/50 border-coral-200/50 text-base leading-relaxed placeholder:text-muted-foreground/70"
                  disabled={isResponding || usageLimitReached}
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isResponding || !currentMessage.trim() || usageLimitReached}
                  size="lg"
                  className="px-4 bg-primary hover:bg-primary/90 h-12 w-12 rounded-full p-0 flex-shrink-0"
                >
                  {isResponding ? <LoadingSpinner /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Druk op Enter om te versturen</span>
                <span className="text-muted-foreground/70">Coach Iris • Altijd beschikbaar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
