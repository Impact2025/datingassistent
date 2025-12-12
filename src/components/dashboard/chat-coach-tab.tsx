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
  const { user, userProfile } = useUser();
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with welcome message and load from localStorage
  useEffect(() => {
    if (!isInitialized) {
      try {
        // Load saved conversations from localStorage
        const savedConversations = localStorage.getItem('chat_coach_conversations');
        if (savedConversations) {
          const parsed = JSON.parse(savedConversations);
          setConversations(parsed.map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp)
          })));
        }

        // Load current conversation from localStorage
        const savedMessages = localStorage.getItem('chat_coach_current_messages');
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed);
        } else {
          // Set welcome message if no saved conversation
          setMessages([{
            role: "model",
            content: "👋 **Hallo! Ik ben Coach Iris, je persoonlijke AI dating coach.**\n\nIk help je met:\n• Dating profiel optimalisatie\n• Gesprekstechnieken en flirten\n• Date planning en advies\n• Omgaan met afwijzing\n• Relatie vragen\n\nStel me gerust je vraag! 💕"
          }]);
        }
      } catch (error) {
        console.error('Failed to load saved conversations:', error);
        // Set default welcome message on error
        setMessages([{
          role: "model",
          content: "👋 **Hallo! Ik ben Coach Iris.**\n\nWaarmee kan ik je helpen met dating? 💕"
        }]);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      try {
        localStorage.setItem('chat_coach_current_messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages:', error);
      }
    }
  }, [messages, isInitialized]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && conversations.length > 0) {
      try {
        localStorage.setItem('chat_coach_conversations', JSON.stringify(conversations));
      } catch (error) {
        console.error('Failed to save conversations:', error);
      }
    }
  }, [conversations, isInitialized]);

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
    const messageToSend = currentMessage;
    setCurrentMessage("");

    // Track tool usage
    await trackToolUsage('chat-coach');

    startResponding(async () => {
      try {
        // Get user ID from user object
        const userId = user?.id;

        if (!userId) {
          throw new Error('Gebruikersprofiel niet gevonden. Log opnieuw in.');
        }

        // Build conversation history in the format the API expects
        const conversationHistory = messages.map(msg => ({
          type: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

        const response = await fetch('/api/coach/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageToSend,
            userId: userId,
            conversationHistory: conversationHistory,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API fout: ${response.status}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data.response) {
          console.error('Invalid API response:', data);
          throw new Error('Onverwachte API response - geen antwoord ontvangen');
        }

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
        console.error('Chat coach error:', error);

        // Provide specific error messages based on error type
        let errorTitle = "Fout";
        let errorDescription = "De AI-coach kon niet antwoorden. Probeer het opnieuw.";

        if (error instanceof Error) {
          if (error.message.includes('Gebruikersprofiel')) {
            errorTitle = "Geen gebruikersprofiel";
            errorDescription = "Je bent niet ingelogd. Ververs de pagina en log opnieuw in.";
          } else if (error.message.includes('401') || error.message.includes('403')) {
            errorTitle = "Authenticatie fout";
            errorDescription = "Je sessie is verlopen. Log opnieuw in.";
          } else if (error.message.includes('429')) {
            errorTitle = "Te veel verzoeken";
            errorDescription = "Je hebt te veel berichten verstuurd. Wacht even voordat je verder gaat.";
          } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
            errorTitle = "Server fout";
            errorDescription = "Er is een probleem met de server. We werken eraan - probeer het over een minuut opnieuw.";
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorTitle = "Netwerkfout";
            errorDescription = "Controleer je internetverbinding en probeer opnieuw.";
          } else if (error.message.includes('API fout')) {
            errorDescription = error.message;
          }
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });

        // Remove the user's message if the API call fails to maintain conversation integrity
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
    // Save current conversation if it has meaningful content
    if (messages.length > 1) {
      // Get first user message for title
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
        : "Nieuwe chat";

      const newConversation = {
        id: Date.now().toString(),
        title,
        messages: [...messages],
        timestamp: new Date()
      };
      setConversations(prev => [newConversation, ...prev]);
    }

    // Start fresh with welcome message
    setMessages([{
      role: "model",
      content: "👋 **Hallo! Ik ben Coach Iris.**\n\nWaar kan ik je mee helpen? Stel gerust je vraag over dating! 💕"
    }]);
    setCurrentConversationId(null);
    setShowHistory(false);

    // Clear localStorage for current messages
    try {
      localStorage.removeItem('chat_coach_current_messages');
    } catch (error) {
      console.error('Failed to clear current messages:', error);
    }
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
        content: "👋 **Hallo! Ik ben Coach Iris.**\n\nWaar kan ik je mee helpen? Stel gerust je vraag over dating! 💕"
      }]);
      setCurrentConversationId(null);
      // Clear localStorage
      try {
        localStorage.removeItem('chat_coach_current_messages');
      } catch (error) {
        console.error('Failed to clear messages:', error);
      }
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
          {/* Header - Hidden on Mobile to Save Space */}
          <div className="hidden md:flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <ScrollArea className={`flex-1 ${showHistory ? 'md:p-4' : 'p-4'}`} ref={scrollAreaRef}>
            <div className={`${showHistory ? 'max-w-4xl mx-auto' : 'max-w-4xl mx-auto md:max-w-4xl'} space-y-6`}>
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
                                <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 md:text-muted-foreground my-2">
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
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Mobile Layout - Full Width */}
            <div className="md:hidden">
              {/* Quick Suggestions - Only show when no messages */}
              {messages.length <= 1 && (
                <div className="px-4 pt-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Voorbeelden om te beginnen:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMessage("Hoe maak ik mijn dating profiel aantrekkelijker?")}
                        className="text-xs h-auto py-2 px-3"
                      >
                        Profiel verbeteren
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMessage("Wat zijn goede gespreksonderwerpen voor een eerste date?")}
                        className="text-xs h-auto py-2 px-3"
                      >
                        Date gesprekken
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMessage("Hoe ga ik om met afwijzing?")}
                        className="text-xs h-auto py-2 px-3"
                      >
                        Afwijzing verwerken
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMessage("Welke dating app past bij mij?")}
                        className="text-xs h-auto py-2 px-3"
                      >
                        App advies
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Field - Compact when messages exist */}
              <div className={`px-4 ${messages.length <= 1 ? 'pt-2 pb-4' : 'py-3'}`}>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isResponding && handleSendMessage()}
                      placeholder="Stel je vraag aan de dating coach..."
                      className={`w-full resize-none border-0 shadow-none focus:ring-0 bg-pink-50/50 border-pink-200/50 text-base leading-relaxed placeholder:text-muted-foreground/70 rounded-2xl px-4 ${
                        messages.length <= 1 ? 'min-h-[80px] py-3' : 'min-h-[60px] py-2'
                      }`}
                      disabled={isResponding}
                      rows={messages.length <= 1 ? 2 : 1}
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={isResponding || !currentMessage.trim()}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-full p-0 flex-shrink-0"
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

            {/* Desktop Layout */}
            <div className="hidden md:block max-w-4xl mx-auto">
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