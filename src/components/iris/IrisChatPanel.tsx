'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, Lightbulb, TrendingUp, Heart, Target, AlertCircle, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoachingSuggestion } from '@/lib/iris/proactive-coaching';
import { trackChatMessageSent, trackToolUsed } from '@/lib/analytics/ga4-events';
import { useIrisUsage, getTierDisplayName, getUsageBarColor, type IrisUsageStatus } from '@/hooks/use-iris-usage';

interface Bericht {
  id: string;
  type: 'iris' | 'gebruiker';
  tekst: string;
  // 🚀 WERELDKLASSE: Enhanced metadata
  mode?: string;
  sentiment?: string;
  topics?: string[];
  emotionalTone?: string;
}

interface IrisChatPanelProps {
  onClose?: () => void;
  initialContext?: string;
  variant?: 'default' | 'compact';
}

export function IrisChatPanel({ onClose, initialContext, variant = 'default' }: IrisChatPanelProps) {
  const [berichten, setBerichten] = useState<Bericht[]>([
    {
      id: '1',
      type: 'iris',
      tekst: '👋 Hoi! Ik ben Iris, je persoonlijke AI dating coach. Ik ken je hechtingsstijl, waarden, en blinde vlekken. Vraag me wat dan ook over dating!',
      mode: 'general',
      sentiment: 'positief',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>('general');
  const [proactiveSuggestions, setProactiveSuggestions] = useState<any[]>([]);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔒 Usage limit tracking
  const { usageStatus, updateFromResponse } = useIrisUsage();

  // GA4: Track when Iris chat is opened
  useEffect(() => {
    trackToolUsed({
      tool_name: 'iris_chat',
      tool_category: 'ai_coach',
      completed: false,
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [berichten]);

  const handleSubmit = async (e: React.FormEvent, customMessage?: string) => {
    e.preventDefault();
    const vraag = customMessage || input.trim();
    if (!vraag) return;

    // GA4: Track chat message sent
    trackChatMessageSent({
      chat_type: 'iris',
      message_length: vraag.length,
    });

    setInput('');

    // Voeg gebruiker bericht toe
    setBerichten(prev => [...prev, {
      id: Date.now().toString(),
      type: 'gebruiker',
      tekst: vraag
    }]);

    // Iris "analyseert..."
    setIsTyping(true);

    try {
      // 🚀 WERELDKLASSE: Gebruik nieuwe Iris API
      const response = await fetch('/api/iris/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: vraag,
          context_type: 'general',
          additional_context: initialContext
        })
      });

      const data = await response.json();

      // 🔒 Handle limit reached error
      if (response.status === 429 || data.error === 'limit_reached') {
        setLimitReached(true);
        if (data.usageStatus) {
          updateFromResponse(data.usageStatus);
        }
        setBerichten(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'iris',
          tekst: `⏳ ${data.message || 'Je hebt je dagelijkse limiet bereikt. Probeer het morgen weer!'}`,
          sentiment: 'neutraal',
        }]);
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const antwoord = data.response || 'Hmm, ik kon geen antwoord vinden.';

      // 🚀 Update mode & suggestions
      if (data.mode) setCurrentMode(data.mode);
      if (data.proactiveSuggestions) setProactiveSuggestions(data.proactiveSuggestions);
      if (data.followUpSuggestions) setFollowUpSuggestions(data.followUpSuggestions);

      // 🔒 Update usage status from response
      if (data.usageStatus) {
        updateFromResponse(data.usageStatus);
        // Check if limit is now reached after this message
        if (!data.usageStatus.allowed) {
          setLimitReached(true);
        }
      }

      setBerichten(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'iris',
        tekst: antwoord,
        mode: data.mode,
        sentiment: data.sentiment,
        topics: data.topics,
        emotionalTone: data.emotionalTone,
      }]);
    } catch (error) {
      console.error('Iris chat error:', error);
      setBerichten(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'iris',
        tekst: '😔 Oeps, er ging iets mis. Probeer het nog eens!',
        sentiment: 'negatief',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent, question);
  };

  // Compact variant renders inline, default variant renders as fixed overlay
  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={isCompact
        ? "bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col w-full max-h-[500px]"
        : "fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col inset-x-3 bottom-20 top-auto max-h-[70vh] sm:inset-x-auto sm:right-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:max-h-[80vh] sm:w-96 sm:max-w-[calc(100vw-2rem)] lg:right-6 lg:mr-16"
      }
      style={{
        minHeight: isCompact ? '300px' : '350px',
      }}
    >
      {/* Header with Mode Indicator - Dashboard Style */}
      <div className="bg-coral-500 p-3 sm:p-4 flex-shrink-0 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-coral-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Iris</h3>
              <p className="text-[10px] sm:text-xs text-white/90">Je persoonlijke dating coach</p>
            </div>
          </div>
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              aria-label="Sluit chat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          )}
        </div>

        {/* Mode Badge */}
        {currentMode && currentMode !== 'general' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <p className="text-xs text-white font-medium flex items-center gap-1">
                {getModeIcon(currentMode)}
                <span>{getModeLabel(currentMode)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Usage Indicator - Only show for limited tiers */}
        {usageStatus && !usageStatus.isUnlimited && (
          <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-between text-xs text-white/90 mb-1">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                Berichten vandaag
              </span>
              <span className="font-medium">
                {usageStatus.remaining} over
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${getUsageBarColor(usageStatus.percentageUsed)}`}
                style={{ width: `${usageStatus.percentageUsed}%` }}
              />
            </div>
            {usageStatus.percentageUsed >= 80 && (
              <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                Reset over {usageStatus.resetTimeHuman}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-4" style={{ flex: '1 1 0', minHeight: 0 }}>
        {berichten.map((bericht, index) => (
          <div key={bericht.id}>
            <div
              className={`flex ${bericht.type === 'gebruiker' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${bericht.type === 'gebruiker' && 'flex-row-reverse'}`}>
                {/* Avatar - Dashboard Style */}
                {bericht.type === 'iris' && (
                  <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl ${
                    bericht.type === 'gebruiker'
                      ? 'bg-coral-500 text-white'
                      : 'bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{bericht.tekst}</p>

                  {/* Topics & Sentiment for Iris messages */}
                  {bericht.type === 'iris' && (bericht.topics?.length > 0 || bericht.sentiment) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-1.5">
                      {bericht.topics?.map((topic, i) => (
                        <span key={i} className="text-xs bg-coral-50 dark:bg-coral-900/30 px-2 py-0.5 rounded-full text-coral-700 dark:text-coral-300">
                          #{topic}
                        </span>
                      ))}
                      {bericht.sentiment && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSentimentStyle(bericht.sentiment)}`}>
                          {getSentimentEmoji(bericht.sentiment)} {bericht.sentiment}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex gap-3 max-w-[80%]">
              {/* Avatar */}
              <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {/* Typing Bubble - Dashboard Style */}
              <div className="px-4 py-3 bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded-2xl">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proactive Suggestions - Dashboard Style */}
        {!isTyping && proactiveSuggestions.length > 0 && berichten.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-coral-500" />
              Misschien kan dit je helpen
            </p>
            {proactiveSuggestions.slice(0, 2).map((suggestion, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleQuickQuestion(suggestion.actionText)}
                className="bg-white dark:bg-gray-700 border border-coral-200 dark:border-coral-700 hover:border-coral-400 dark:hover:border-coral-500 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{suggestion.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{suggestion.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{suggestion.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Follow-up Suggestions - Dashboard Style */}
        {!isTyping && followUpSuggestions.length > 0 && berichten.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            {followUpSuggestions.slice(0, 3).map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleQuickQuestion(suggestion)}
                className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-coral-300 dark:hover:border-coral-500 hover:bg-coral-50 dark:hover:bg-coral-900/30 px-3 py-1.5 rounded-full transition-all text-gray-700 dark:text-gray-200 hover:text-coral-600 dark:hover:text-coral-400"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Dashboard Style */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 rounded-b-2xl safe-area-bottom">
        {/* Limit Reached Warning */}
        {limitReached && usageStatus && (
          <div className="mb-2 sm:mb-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <p className="text-[11px] sm:text-xs text-orange-700 dark:text-orange-300">
              Dagelijkse limiet bereikt. Reset over {usageStatus.resetTimeHuman}
            </p>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={limitReached ? "Limiet bereikt" : "Stel een vraag..."}
            disabled={limitReached}
            className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 rounded-full
                       border-2 border-gray-200 dark:border-gray-600 focus:border-coral-400 dark:focus:border-coral-500 focus:bg-white dark:focus:bg-gray-600
                       focus:outline-none text-sm text-gray-900 dark:text-white
                       placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all
                       ${limitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            type="submit"
            disabled={!input.trim() || limitReached}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-coral-500 hover:bg-coral-600
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       rounded-full flex items-center justify-center flex-shrink-0
                       transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Helper functions
function getModeIcon(mode: string) {
  const icons: Record<string, JSX.Element> = {
    'profile-review': <Target className="w-3 h-3" />,
    'match-analysis': <Heart className="w-3 h-3" />,
    'date-prep': <TrendingUp className="w-3 h-3" />,
    'text-review': <MessageCircle className="w-3 h-3" />,
    'conversation': <MessageCircle className="w-3 h-3" />,
    'relationship': <Heart className="w-3 h-3" />,
    'breakup-support': <Heart className="w-3 h-3" />,
  };
  return icons[mode] || <Brain className="w-3 h-3" />;
}

function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    'profile-review': 'Profiel Review',
    'match-analysis': 'Match Analyse',
    'date-prep': 'Date Prep',
    'text-review': 'Bericht Review',
    'conversation': 'Gesprek Analyse',
    'relationship': 'Relatie Advies',
    'breakup-support': 'Breakup Support',
    'general': 'Algemeen',
  };
  return labels[mode] || mode;
}

function getSentimentStyle(sentiment: string): string {
  const styles: Record<string, string> = {
    'positief': 'bg-green-100 text-green-700',
    'negatief': 'bg-red-100 text-red-700',
    'bezorgd': 'bg-orange-100 text-orange-700',
    'enthousiast': 'bg-blue-100 text-blue-700',
    'neutraal': 'bg-gray-100 text-gray-700',
  };
  return styles[sentiment] || 'bg-gray-100 text-gray-700';
}

function getSentimentEmoji(sentiment: string): string {
  const emojis: Record<string, string> = {
    'positief': '😊',
    'negatief': '😔',
    'bezorgd': '😰',
    'enthousiast': '🎉',
    'neutraal': '😐',
  };
  return emojis[sentiment] || '💭';
}
