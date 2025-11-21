"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Send, Sparkles, Lightbulb, HelpCircle, CheckCircle2, History, Plus, MessageSquare, Heart, Shield, Calendar, User, MoreVertical, Trash2, Download, Copy } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useUser } from "@/providers/user-provider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCoachingTracker } from "@/hooks/use-coaching-tracker";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";
import { ContextualTooltip } from "@/components/shared/contextual-tooltip";
import { useToolCompletion } from "@/hooks/use-tool-completion";
import { useAIContext } from "@/hooks/use-ai-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Message = {
  role: "user" | "model";
  content: string;
};

export function ChatCoachTab() {
  const { toast } = useToast();
  const { userProfile } = useUser();
  const { trackCustomEvent, isFirstTime, isFromOnboarding } = useCoachingTracker('chat-coach');
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('chat-coach');
  const {
    isCompleted: isActionCompleted,
    markAsCompleted: markCompleted,
    completedActions = [],
    progressPercentage = 0,
    isLoading: progressLoading
  } = useToolCompletion('chat-coach');

  // AI Context integration
  const { context: aiContext, trackToolUsage, getContextSummary } = useAIContext();
  
  // Create progress object for backward compatibility
  const progress = {
    completedActions: completedActions?.length || 0,
    progressPercentage: progressPercentage || 0,
    actionsCompleted: completedActions || []
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isResponding, startResponding] = useTransition();
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Array<{id: string, title: string, messages: Message[], timestamp: Date}>>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A simple way to scroll to the bottom.
        // In a real app you might use a library or a more robust solution.
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  // Listen for tutorial trigger events from parent
  useEffect(() => {
    const handleTutorialTrigger = (event: CustomEvent) => {
      if (event.detail?.toolId === 'chat') {
        setShowOverlay(true);
      }
    };

    window.addEventListener('open-tool-tutorial', handleTutorialTrigger as EventListener);

    return () => {
      window.removeEventListener('open-tool-tutorial', handleTutorialTrigger as EventListener);
    };
  }, []);


  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const newMessage: Message = { role: "user", content: currentMessage };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setCurrentMessage("");

    // Track tool usage
    await trackToolUsage('chat-coach');

    startResponding(async () => {
      try {
        // Use our new API endpoint instead of the Genkit flow
        const token = localStorage.getItem('datespark_auth_token');
        const contextSummary = getContextSummary();

        const response = await fetch('/api/chat-coach', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            history: messages,
            message: currentMessage,
            aiContext: contextSummary, // Include personalized context
          }),
        });

        if (!response.ok) {
          throw new Error('AI coach failed to respond');
        }

        const data = await response.json();
        const aiResponse: Message = { role: "model", content: data.response };
        setMessages([...newMessages, aiResponse]);

        // Track completion milestones in database
        const userMessageCount = newMessages.filter(m => m.role === 'user').length;
        if (userMessageCount === 1) {
          await markCompleted('first_question', {
            messageLength: currentMessage.length,
            timestamp: new Date().toISOString()
          });
        }
        if (userMessageCount >= 3) {
          await markCompleted('conversation_continued', {
            messageCount: userMessageCount,
            timestamp: new Date().toISOString()
          });
        }
        if (userMessageCount >= 5) {
          await markCompleted('practice_completed', {
            messageCount: userMessageCount,
            timestamp: new Date().toISOString()
          });
        }

        // Track chat message
        await trackCustomEvent('chat_message_sent', {
          messageLength: currentMessage.length,
          conversationType: 'practice'
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Fout",
          description: "De AI-coach kon niet antwoorden. Probeer het opnieuw.",
          variant: "destructive",
        });
        // Optional: remove the user's message if the API call fails
        setMessages(messages);
      }
    });
  };
  
  const getUserInitials = () => {
    if (!userProfile?.name) return 'U';
    return userProfile.name.charAt(0).toUpperCase();
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const startNewConversation = () => {
    if (messages.length > 1) {
      const newConversation = {
        id: Date.now().toString(),
        title: messages[1]?.content.slice(0, 50) + "..." || "Nieuwe chat",
        messages: [...messages],
        timestamp: new Date()
      };
      setConversations(prev => [newConversation, ...prev]);
    }
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false); // Close history sidebar when starting new chat
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      setShowHistory(false);
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setMessages([{
        role: "model",
        content: "👋 **Hallo! Ik ben je persoonlijke dating coach.**\n\nIk help je met al je dating vragen - van profiel optimalisatie tot gesprekstechnieken. Stel me gerust al je vragen!"
      }]);
      setCurrentConversationId(null);
    }
  };

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="chat-coach"
        displayName={getToolDisplayName('chat-coach')}
        steps={getOnboardingSteps('chat-coach')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('Chat Coach onboarding completed!')}
      />

      {/* Main Chat Container - ChatGPT Style */}
      <div className="flex h-full max-h-[calc(100vh-200px)] bg-background rounded-lg border overflow-hidden">
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-80 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Chat History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <Button
                onClick={startNewConversation}
                className="w-full gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Nieuwe Chat
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                      currentConversationId === conversation.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.timestamp.toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => deleteConversation(conversation.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback>
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">Coach Iris</h2>
                <p className="text-xs text-muted-foreground">Altijd beschikbaar • Persoonlijk advies</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverlay(true)}
                className="gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8 bg-primary flex-shrink-0 mt-1">
                      <AvatarFallback>
                        <Sparkles className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted border'
                    }`}>
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              h3: ({ children }) => <h3 className="font-semibold mt-4 mb-2 text-base">{children}</h3>,
                              h4: ({ children }) => <h4 className="font-semibold mt-3 mb-1 text-sm">{children}</h4>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Message Actions for AI responses */}
                    {message.role === 'model' && (
                      <div className="flex items-center gap-2 mt-2 ml-12">
                        <Button
                          variant="ghost"
                          size="sm"
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

              {/* Typing Indicator */}
              {isResponding && (
                <div className="flex items-start gap-4 justify-start">
                  <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
                    <AvatarFallback>
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted border rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">Coach Iris typt...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area - Fixed at Bottom */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
            <div className="max-w-4xl mx-auto">
              {/* Quick Suggestions - Only show when no conversation or first message */}
              {messages.length <= 1 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Voorbeelden om te beginnen:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMessage("Hoe maak ik mijn dating profiel aantrekkelijker?")}
                      className="text-xs"
                    >
                      Profiel verbeteren
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMessage("Wat zijn goede gespreksonderwerpen voor een eerste date?")}
                      className="text-xs"
                    >
                      Date gesprekken
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMessage("Hoe ga ik om met afwijzing?")}
                      className="text-xs"
                    >
                      Afwijzing verwerken
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMessage("Welke dating app past bij mij?")}
                      className="text-xs"
                    >
                      App advies
                    </Button>
                  </div>
                </div>
              )}

              {/* Input Field */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isResponding && handleSendMessage()}
                    placeholder="Stel je vraag aan de dating coach..."
                    className="min-h-[60px] max-h-[200px] resize-none border-0 shadow-none focus:ring-0 bg-pink-50/50 border-pink-200/50 text-base leading-relaxed placeholder:text-muted-foreground/70"
                    disabled={isResponding}
                    rows={1}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={isResponding || !currentMessage.trim()}
                  size="lg"
                  className="px-4 bg-primary hover:bg-primary/90 h-12 w-12 rounded-full p-0 flex-shrink-0"
                >
                  {isResponding ? (
                    <LoadingSpinner />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Druk op Enter om te versturen</span>
                <span className="text-muted-foreground/70">
                  Coach Iris • Altijd beschikbaar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}