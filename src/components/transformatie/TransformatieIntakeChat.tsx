"use client";

/**
 * TransformatieIntakeChat - World-class chat-based onboarding
 *
 * Minimalist, pink (no gradients), professional
 * Matches Kickstart quality level
 */

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { IrisAvatar } from "@/components/onboarding/IrisAvatar";
import { Button } from "@/components/ui/button";
import { Send, Loader2, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  type: "iris" | "user";
  content: string;
  inputType?: "chips" | "multi-chips" | "text";
  chipOptions?: { value: string; label: string; icon?: string }[];
  placeholder?: string;
}

export interface TransformatieIntakeData {
  preferredName: string;
  currentSituation: string;
  biggestChallenge: string;
  goals: string[];
  commitmentLevel: string;
  ageRange: string;
}

interface TransformatieIntakeChatProps {
  onComplete: (data: TransformatieIntakeData) => void;
  className?: string;
}

// Options
const SITUATION_OPTIONS = [
  { value: "single_searching", label: "Single en actief zoekend", icon: "💕" },
  { value: "single_break", label: "Single, even pauze gehad", icon: "⏸️" },
  { value: "dating_struggling", label: "Dating maar het lukt niet", icon: "😔" },
  { value: "relationship_issues", label: "Net uit een relatie", icon: "💔" },
];

const CHALLENGE_OPTIONS = [
  { value: "no_matches", label: "Weinig tot geen matches", icon: "📭" },
  { value: "conversations_die", label: "Gesprekken sterven uit", icon: "💬" },
  { value: "no_dates", label: "Geen dates uit gesprekken", icon: "📅" },
  { value: "wrong_people", label: "Verkeerde mensen aantrekken", icon: "🎯" },
  { value: "confidence", label: "Gebrek aan zelfvertrouwen", icon: "😰" },
  { value: "past_trauma", label: "Vastzitten in het verleden", icon: "⏳" },
];

const GOALS_OPTIONS = [
  { value: "find_partner", label: "Vaste partner vinden", icon: "💑" },
  { value: "better_dates", label: "Betere dates hebben", icon: "✨" },
  { value: "confidence", label: "Meer zelfvertrouwen", icon: "💪" },
  { value: "communication", label: "Beter communiceren", icon: "🗣️" },
  { value: "know_myself", label: "Mezelf beter kennen", icon: "🪞" },
  { value: "healthy_patterns", label: "Gezondere patronen", icon: "🌱" },
];

const COMMITMENT_OPTIONS = [
  { value: "exploring", label: "Ontdekken wat het brengt", icon: "🔍" },
  { value: "serious", label: "Serieus aan de slag", icon: "💼" },
  { value: "all_in", label: "All-in voor mijn transformatie", icon: "🚀" },
];

const AGE_OPTIONS = [
  { value: "18-25", label: "18-25 jaar", icon: "🌱" },
  { value: "26-35", label: "26-35 jaar", icon: "🌿" },
  { value: "36-45", label: "36-45 jaar", icon: "🌳" },
  { value: "46-55", label: "46-55 jaar", icon: "🍂" },
  { value: "55+", label: "55+ jaar", icon: "🌟" },
];

export function TransformatieIntakeChat({ onComplete, className }: TransformatieIntakeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [intakeData, setIntakeData] = useState<Partial<TransformatieIntakeData>>({});
  const [irisReaction, setIrisReaction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const totalSteps = 6;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        id: "welcome",
        type: "iris",
        content: "Welkom bij De Transformatie! 🌟\n\nIk ben Iris, je persoonlijke coach voor de komende 12 modules. Laten we eerst even kennismaken zodat ik je ervaring kan personaliseren.",
      }]);

      // Follow-up question
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: "name-question",
            type: "iris",
            content: "Hoe mag ik je noemen?",
            inputType: "text",
            placeholder: "Je voornaam",
          }]);
          setCurrentStep(1);
          setTimeout(() => inputRef.current?.focus(), 100);
        }, 800);
      }, 1000);
    }, 600);
  }, []);

  const addIrisMessage = (content: string, inputType?: Message["inputType"], options?: { chipOptions?: typeof SITUATION_OPTIONS; placeholder?: string }) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `iris-${Date.now()}`,
        type: "iris",
        content,
        inputType,
        ...options,
      }]);
      if (inputType === "text") {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, 800);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: "user",
      content,
    }]);
  };

  const showReaction = (reaction: string) => {
    setIrisReaction(reaction);
    setTimeout(() => setIrisReaction(null), 2000);
  };

  const handleTextSubmit = () => {
    if (!inputValue.trim()) return;

    const value = inputValue.trim();
    addUserMessage(value);
    setInputValue("");

    if (currentStep === 1) {
      // Name submitted
      setIntakeData(prev => ({ ...prev, preferredName: value }));
      showReaction("Nice! 👋");

      setTimeout(() => {
        addIrisMessage(
          `Leuk je te ontmoeten, ${value}! 💪\n\nOm je de beste ervaring te geven, wil ik graag weten waar je nu staat in je dating journey.`,
          "chips",
          { chipOptions: SITUATION_OPTIONS }
        );
        setCurrentStep(2);
      }, 500);
    }
  };

  const handleChipSelect = (value: string, label: string) => {
    addUserMessage(label);
    setSelectedChips([]);

    switch (currentStep) {
      case 2: // Situation
        setIntakeData(prev => ({ ...prev, currentSituation: value }));
        showReaction("Ik begrijp het 💜");
        setTimeout(() => {
          addIrisMessage(
            "Bedankt voor het delen. Wat is op dit moment je grootste uitdaging in dating?",
            "chips",
            { chipOptions: CHALLENGE_OPTIONS }
          );
          setCurrentStep(3);
        }, 500);
        break;

      case 3: // Challenge
        setIntakeData(prev => ({ ...prev, biggestChallenge: value }));
        showReaction("Daar gaan we aan werken! 💪");
        setTimeout(() => {
          addIrisMessage(
            "Goed om te weten. Wat wil je bereiken met De Transformatie? Je mag er meerdere kiezen.",
            "multi-chips",
            { chipOptions: GOALS_OPTIONS }
          );
          setCurrentStep(4);
        }, 500);
        break;

      case 5: // Commitment
        setIntakeData(prev => ({ ...prev, commitmentLevel: value }));
        showReaction(value === "all_in" ? "Yes! 🔥" : "Top! 👍");
        setTimeout(() => {
          addIrisMessage(
            "Laatste vraag: in welke leeftijdscategorie val je?",
            "chips",
            { chipOptions: AGE_OPTIONS }
          );
          setCurrentStep(6);
        }, 500);
        break;

      case 6: // Age - FINAL
        const finalData: TransformatieIntakeData = {
          ...intakeData as TransformatieIntakeData,
          ageRange: value,
        };
        setIntakeData(finalData);
        showReaction("Perfect! ✨");

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: "complete",
            type: "iris",
            content: `Geweldig ${intakeData.preferredName}! Ik heb alles wat ik nodig heb om je transformatie te personaliseren.\n\nJe gaat door 3 fases: DESIGN, ACTION en SURRENDER. Elke fase brengt je dichter bij de liefde die je verdient. 💕`,
          }]);

          setTimeout(() => {
            onComplete(finalData);
          }, 2000);
        }, 500);
        break;
    }
  };

  const handleMultiChipSubmit = () => {
    if (selectedChips.length === 0) return;

    const labels = selectedChips.map(v =>
      GOALS_OPTIONS.find(o => o.value === v)?.label || v
    ).join(", ");

    addUserMessage(labels);
    setIntakeData(prev => ({ ...prev, goals: selectedChips }));
    setSelectedChips([]);
    showReaction("Mooie doelen! 🎯");

    setTimeout(() => {
      addIrisMessage(
        "Transformatie vraagt commitment. Hoe serieus ben je om hier tijd en energie in te stoppen?",
        "chips",
        { chipOptions: COMMITMENT_OPTIONS }
      );
      setCurrentStep(5);
    }, 500);
  };

  const toggleChip = (value: string) => {
    setSelectedChips(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const currentMessage = messages[messages.length - 1];
  const showInput = currentMessage?.inputType === "text" && !isTyping;
  const showChips = (currentMessage?.inputType === "chips" || currentMessage?.inputType === "multi-chips") && !isTyping;

  return (
    <div className={cn("flex flex-col h-full bg-white", className)} style={{ colorScheme: 'light' }}>
      {/* Header - Minimalist */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <IrisAvatar size="sm" />
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">Iris</p>
          <p className="text-xs text-gray-500">Transformatie Coach</p>
        </div>
        <div className="text-xs text-gray-400">
          {currentStep}/{totalSteps}
        </div>
      </div>

      {/* Progress bar - Minimalist pink */}
      <div className="h-1 bg-gray-100">
        <motion.div
          className="h-full bg-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-2",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.type === "iris" && (
                <div className="flex-shrink-0 mt-1">
                  <IrisAvatar size="xs" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.type === "user"
                    ? "bg-pink-500 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                )}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <IrisAvatar size="xs" />
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Iris reaction bubble */}
        <AnimatePresence>
          {irisReaction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex gap-2"
            >
              <IrisAvatar size="xs" />
              <div className="bg-pink-50 text-pink-600 rounded-full px-3 py-1 text-sm font-medium">
                {irisReaction}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chips */}
        {showChips && currentMessage?.chipOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <div className="flex flex-wrap gap-2">
              {currentMessage.chipOptions.map((option) => {
                const isSelected = selectedChips.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (currentMessage.inputType === "multi-chips") {
                        toggleChip(option.value);
                      } else {
                        handleChipSelect(option.value, option.label);
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                      isSelected
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                    )}
                  >
                    {option.icon && <span className="mr-1">{option.icon}</span>}
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Submit button for multi-chips */}
            {currentMessage.inputType === "multi-chips" && selectedChips.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3"
              >
                <Button
                  onClick={handleMultiChipSubmit}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
                >
                  Bevestig ({selectedChips.length})
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Text input */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-100 bg-white"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTextSubmit();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentMessage?.placeholder || "Type hier..."}
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none text-sm"
              style={{ colorScheme: 'light' }}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
