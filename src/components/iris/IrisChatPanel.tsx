'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, Lightbulb, TrendingUp, Heart, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoachingSuggestion } from '@/lib/iris/proactive-coaching';
import { trackChatMessageSent, trackToolUsed } from '@/lib/analytics/ga4-events';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      if (data.error) {
        throw new Error(data.error);
      }

      const antwoord = data.response || 'Hmm, ik kon geen antwoord vinden.';

      // 🚀 Update mode & suggestions
      if (data.mode) setCurrentMode(data.mode);
      if (data.proactiveSuggestions) setProactiveSuggestions(data.proactiveSuggestions);
      if (data.followUpSuggestions) setFollowUpSuggestions(data.followUpSuggestions);

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 mr-16
                 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl
                 border border-gray-100 flex flex-col"
      style={{ height: '600px', maxHeight: '80vh' }}
    >
      {/* Header with Mode Indicator - Dashboard Style */}
      <div className="bg-pink-500 p-4 flex-shrink-0 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Iris</h3>
              <p className="text-xs text-white/90">Je persoonlijke dating coach</p>
            </div>
          </div>
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
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl ${
                    bericht.type === 'gebruiker'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white shadow-sm border border-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{bericht.tekst}</p>

                  {/* Topics & Sentiment for Iris messages */}
                  {bericht.type === 'iris' && (bericht.topics?.length > 0 || bericht.sentiment) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1.5">
                      {bericht.topics?.map((topic, i) => (
                        <span key={i} className="text-xs bg-pink-50 px-2 py-0.5 rounded-full text-pink-700">
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
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {/* Typing Bubble - Dashboard Style */}
              <div className="px-4 py-3 bg-white shadow-sm border border-gray-100 rounded-2xl">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
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
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-pink-500" />
              Misschien kan dit je helpen
            </p>
            {proactiveSuggestions.slice(0, 2).map((suggestion, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleQuickQuestion(suggestion.actionText)}
                className="bg-white border border-pink-200 hover:border-pink-400 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{suggestion.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{suggestion.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{suggestion.description}</p>
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
                className="text-xs bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 px-3 py-1.5 rounded-full transition-all text-gray-700 hover:text-pink-600"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Dashboard Style */}
      <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-gray-100 flex-shrink-0 rounded-b-2xl">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stel een vraag aan Iris..."
            className="flex-1 px-6 py-3 bg-gray-50 rounded-full
                       border-2 border-gray-200 focus:border-pink-400 focus:bg-white
                       focus:outline-none text-sm text-gray-900
                       placeholder:text-gray-400 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-11 h-11 bg-pink-500 hover:bg-pink-600
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       rounded-full flex items-center justify-center
                       transition-all shadow-md hover:shadow-lg"
          >
            <Send className="w-5 h-5 text-white" />
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
