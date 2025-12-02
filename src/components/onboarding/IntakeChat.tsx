"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { IrisAvatar } from "./IrisAvatar";
import { IntakeChips } from "./IntakeChips";
import { IntakeSlider } from "./IntakeSlider";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  type: "iris" | "user";
  content: string;
  inputType?: "text" | "chips" | "slider";
  chipOptions?: { value: string; label: string; icon?: string }[];
  sliderConfig?: { min: number; max: number; labels: string[] };
}

interface IntakeChatProps {
  onComplete: (data: IntakeData) => void;
  className?: string;
}

export interface IntakeData {
  primaryGoal: string;
  biggestChallenge: string;
  experienceLevel: number;
}

const CHALLENGE_OPTIONS = [
  { value: "weinig-matches", label: "Ik krijg te weinig matches", icon: "💔" },
  { value: "gesprekken-dood", label: "Gesprekken lopen dood", icon: "💬" },
  { value: "geen-dates", label: "Ik durf geen dates te plannen", icon: "📅" },
  { value: "weet-niet-wat-zeggen", label: "Ik weet niet wat ik moet zeggen", icon: "🤔" },
  { value: "fotos-niet-goed", label: "Mijn foto's zijn niet goed", icon: "📸" },
  { value: "geen-zelfvertrouwen", label: "Ik mis zelfvertrouwen", icon: "💪" },
];

export function IntakeChat({ onComplete, className }: IntakeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [intakeData, setIntakeData] = useState<Partial<IntakeData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

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

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: "intro",
            type: "iris",
            content:
              "Hoi! Ik ben Iris, jouw persoonlijke dating coach. Ik wil je graag beter leren kennen zodat ik je de beste tips kan geven.",
          },
        ]);
      }, 800);
    }, 500);

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: "q1",
            type: "iris",
            content: "Wat wil je bereiken met dating? Vertel me in je eigen woorden wat je droomdoel is.",
            inputType: "text",
          },
        ]);
      }, 800);
    }, 2000);
  }, []);

  const addIrisMessage = (message: Message) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, message]);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  };

  const handleTextSubmit = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    setIntakeData((prev) => ({ ...prev, primaryGoal: inputValue }));
    setInputValue("");
    setCurrentStep(1);

    // Next question - professional response without quoting user input
    setTimeout(() => {
      addIrisMessage({
        id: "iris-response-1",
        type: "iris",
        content: "Dat is een mooi doel! Fijn dat je zo helder weet wat je zoekt. Daar ga ik je mee helpen.",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q2",
        type: "iris",
        content: "Wat houdt je op dit moment het meeste tegen in dating?",
        inputType: "chips",
        chipOptions: CHALLENGE_OPTIONS,
      });
    }, 2500);
  };

  const handleChipSelect = (value: string) => {
    const selectedOption = CHALLENGE_OPTIONS.find((o) => o.value === value);
    if (!selectedOption) return;

    addUserMessage(selectedOption.label);
    setIntakeData((prev) => ({ ...prev, biggestChallenge: value }));
    setCurrentStep(2);

    // Response + next question - professional response without quoting user input
    setTimeout(() => {
      addIrisMessage({
        id: "iris-response-2",
        type: "iris",
        content: "Ik begrijp het helemaal. Dit is iets waar veel mensen mee worstelen. Samen gaan we hier aan werken!",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q3",
        type: "iris",
        content: "Nog één vraag: Hoe zou je je ervaring met online dating omschrijven?",
        inputType: "slider",
        sliderConfig: {
          min: 1,
          max: 3,
          labels: ["Net begonnen", "Enige ervaring", "Ervaren"],
        },
      });
    }, 2500);
  };

  const handleSliderConfirm = (value: number) => {
    const labels = ["Net begonnen", "Enige ervaring", "Ervaren"];
    addUserMessage(labels[value - 1]);
    setIntakeData((prev) => ({ ...prev, experienceLevel: value }));
    setCurrentStep(3);

    // Final message
    setTimeout(() => {
      addIrisMessage({
        id: "final",
        type: "iris",
        content:
          "Perfect! Ik heb nu een goed beeld van waar je staat en waar je naartoe wilt. Ik ga nu een persoonlijk plan voor je maken...",
      });
    }, 500);

    // Complete after delay
    setTimeout(() => {
      onComplete({
        primaryGoal: intakeData.primaryGoal || "",
        biggestChallenge: intakeData.biggestChallenge || "",
        experienceLevel: value,
      });
    }, 3000);
  };

  const [sliderValue, setSliderValue] = useState(2);

  const getCurrentInputType = () => {
    const lastIrisMessage = [...messages]
      .reverse()
      .find((m) => m.type === "iris" && m.inputType);
    return lastIrisMessage?.inputType;
  };

  const getCurrentChipOptions = () => {
    const lastIrisMessage = [...messages]
      .reverse()
      .find((m) => m.type === "iris" && m.chipOptions);
    return lastIrisMessage?.chipOptions;
  };

  const getCurrentSliderConfig = () => {
    const lastIrisMessage = [...messages]
      .reverse()
      .find((m) => m.type === "iris" && m.sliderConfig);
    return lastIrisMessage?.sliderConfig;
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.type === "iris" && <IrisAvatar size="sm" />}
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm",
                  message.type === "iris"
                    ? "bg-gray-100 rounded-tl-none text-gray-800"
                    : "bg-pink-500 text-white rounded-tr-none"
                )}
              >
                <p className="leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center"
          >
            <IrisAvatar size="sm" />
            <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        {getCurrentInputType() === "text" && currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
              placeholder="Typ je antwoord..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!inputValue.trim()}
              className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {getCurrentInputType() === "chips" && currentStep === 1 && (
          <IntakeChips
            options={getCurrentChipOptions() || []}
            onSelect={handleChipSelect}
          />
        )}

        {getCurrentInputType() === "slider" && currentStep === 2 && (
          <div className="space-y-4">
            <IntakeSlider
              value={sliderValue}
              onChange={setSliderValue}
              {...getCurrentSliderConfig()}
            />
            <Button
              onClick={() => handleSliderConfirm(sliderValue)}
              className="w-full bg-pink-500 hover:bg-pink-600 rounded-xl py-3"
            >
              Bevestig mijn keuze
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-gray-500 py-4"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Iris maakt je persoonlijke plan...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
