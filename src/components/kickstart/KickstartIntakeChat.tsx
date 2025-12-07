"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { IrisAvatar } from "@/components/onboarding/IrisAvatar";
import { IntakeChips } from "@/components/onboarding/IntakeChips";
import { IntakeSlider } from "@/components/onboarding/IntakeSlider";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle } from "lucide-react";
import type { KickstartIntakeData } from "@/types/kickstart-onboarding.types";

interface Message {
  id: string;
  type: "iris" | "user";
  content: string;
  inputType?: "text" | "number" | "chips" | "slider" | "multi-chips";
  chipOptions?: { value: string; label: string; icon?: string }[];
  sliderConfig?: { min: number; max: number; labels: string[] };
  placeholder?: string;
}

interface KickstartIntakeChatProps {
  onComplete: (data: KickstartIntakeData) => void;
  className?: string;
}

// Dating app options
const DATING_APP_OPTIONS = [
  { value: "tinder", label: "Tinder", icon: "🔥" },
  { value: "bumble", label: "Bumble", icon: "🐝" },
  { value: "hinge", label: "Hinge", icon: "💑" },
  { value: "happn", label: "Happn", icon: "📍" },
  { value: "once", label: "Once", icon: "⏰" },
  { value: "inner-circle", label: "Inner Circle", icon: "👥" },
];

const DATING_STATUS_OPTIONS = [
  { value: "single", label: "Helemaal single, weinig actie", icon: "😔" },
  { value: "matching-no-dates", label: "Ik match, maar geen dates", icon: "💬" },
  { value: "dating-no-click", label: "Ik date, maar geen klik", icon: "🤷" },
  { value: "recent-breakup", label: "Net uit een relatie", icon: "💔" },
];

const SINGLE_DURATION_OPTIONS = [
  { value: "less-than-month", label: "Minder dan een maand", icon: "⏰" },
  { value: "1-3-months", label: "1-3 maanden", icon: "📅" },
  { value: "3-6-months", label: "3-6 maanden", icon: "📆" },
  { value: "6-12-months", label: "6-12 maanden", icon: "🗓️" },
  { value: "1-year-plus", label: "Langer dan een jaar", icon: "⌛" },
];

const WEEKLY_MATCHES_OPTIONS = [
  { value: "0-2", label: "0-2 matches per week", icon: "😢" },
  { value: "3-5", label: "3-5 matches per week", icon: "😊" },
  { value: "6-10", label: "6-10 matches per week", icon: "😃" },
  { value: "10-plus", label: "Meer dan 10 per week", icon: "🔥" },
];

const PROFILE_DESCRIPTION_OPTIONS = [
  { value: "few-photos", label: "Ik heb weinig foto's", icon: "📸" },
  { value: "boring-bio", label: "Mijn bio is saai", icon: "📝" },
  { value: "no-idea", label: "Geen idee wat ik doe", icon: "🤷" },
  { value: "good-but-not-working", label: "Best goed, maar werkt niet", icon: "🤔" },
];

const BIGGEST_DIFFICULTY_OPTIONS = [
  { value: "starting-convos", label: "Gesprekken starten", icon: "💬" },
  { value: "getting-matches", label: "Matches krijgen", icon: "💔" },
  { value: "planning-dates", label: "Dates plannen", icon: "📅" },
  { value: "presenting-self", label: "Mezelf presenteren", icon: "🎭" },
];

const RELATIONSHIP_GOAL_OPTIONS = [
  { value: "serious", label: "Serieuze relatie", icon: "💑" },
  { value: "open", label: "Open staan voor wat komt", icon: "🌟" },
  { value: "dates-first", label: "Eerst dates, dan zien", icon: "☕" },
  { value: "connections", label: "Gewoon leuke connecties", icon: "🤝" },
];

// NEW: Gender, Looking For, Region options
const GENDER_OPTIONS = [
  { value: "man", label: "Man", icon: "👨" },
  { value: "vrouw", label: "Vrouw", icon: "👩" },
  { value: "anders", label: "Anders", icon: "🌈" },
];

const LOOKING_FOR_OPTIONS = [
  { value: "vrouwen", label: "Vrouwen", icon: "👩" },
  { value: "mannen", label: "Mannen", icon: "👨" },
  { value: "beiden", label: "Beiden", icon: "💑" },
];

const REGION_OPTIONS = [
  { value: "amsterdam", label: "Amsterdam", icon: "🏙️" },
  { value: "rotterdam", label: "Rotterdam", icon: "🌉" },
  { value: "den-haag", label: "Den Haag", icon: "🏛️" },
  { value: "utrecht", label: "Utrecht", icon: "🗼" },
  { value: "eindhoven", label: "Eindhoven", icon: "💡" },
  { value: "groningen", label: "Groningen", icon: "🎓" },
  { value: "tilburg", label: "Tilburg", icon: "🎭" },
  { value: "almere", label: "Almere", icon: "🏘️" },
  { value: "breda", label: "Breda", icon: "🏰" },
  { value: "nijmegen", label: "Nijmegen", icon: "🌿" },
  { value: "anders", label: "Andere regio", icon: "📍" },
];

export function KickstartIntakeChat({ onComplete, className }: KickstartIntakeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [sliderValue, setSliderValue] = useState(5);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [intakeData, setIntakeData] = useState<Partial<KickstartIntakeData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const totalSteps = 15; // Updated: 12 original + 3 new (gender, lookingFor, region)

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
      addIrisMessage({
        id: "welcome",
        type: "iris",
        content: "Hey! Super dat je de Kickstart hebt gepakt. De komende 21 dagen ga ik je elke dag helpen met concrete dating tips.",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "welcome-2",
        type: "iris",
        content: "Maar eerst wil ik je écht leren kennen, zodat mijn tips perfect bij jou passen. Oké?",
      });
    }, 2500);

    setTimeout(() => {
      addIrisMessage({
        id: "q1",
        type: "iris",
        content: "Laten we beginnen! Hoe mag ik je noemen?",
        inputType: "text",
        placeholder: "Bijv. Mark, Lisa, etc.",
      });
    }, 4500);
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

  // Question 1: Preferred Name
  const handleNameSubmit = () => {
    if (!inputValue.trim()) return;
    addUserMessage(inputValue);
    setIntakeData((prev) => ({ ...prev, preferredName: inputValue }));
    setInputValue("");
    setCurrentStep(1);

    setTimeout(() => {
      addIrisMessage({
        id: "response-1",
        type: "iris",
        content: `Nice to meet you, ${inputValue}! 😊`,
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q2",
        type: "iris",
        content: "Even snel - ben je een man of vrouw?",
        inputType: "chips",
        chipOptions: GENDER_OPTIONS,
      });
    }, 2000);
  };

  // Question 2: Gender (NEW)
  const handleGenderSelect = (value: string) => {
    const selected = GENDER_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, gender: value as any }));
    setCurrentStep(2);

    setTimeout(() => {
      addIrisMessage({
        id: "q3",
        type: "iris",
        content: "En naar wie ben je op zoek?",
        inputType: "chips",
        chipOptions: LOOKING_FOR_OPTIONS,
      });
    }, 1000);
  };

  // Question 3: Looking For (NEW)
  const handleLookingForSelect = (value: string) => {
    const selected = LOOKING_FOR_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, lookingFor: value as any }));
    setCurrentStep(3);

    setTimeout(() => {
      addIrisMessage({
        id: "q4",
        type: "iris",
        content: "In welke regio woon je? (Helpt me met date tips!)",
        inputType: "chips",
        chipOptions: REGION_OPTIONS,
      });
    }, 1000);
  };

  // Question 4: Region (NEW)
  const handleRegionSelect = (value: string) => {
    const selected = REGION_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, region: value }));
    setCurrentStep(4);

    setTimeout(() => {
      addIrisMessage({
        id: "response-4",
        type: "iris",
        content: "Top! Nu weet ik wie je bent en waar je zoekt. 🎯",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q5",
        type: "iris",
        content: "Hoe oud ben je?",
        inputType: "number",
        placeholder: "Bijv. 28",
      });
    }, 2000);
  };

  // Question 5: Age (was Question 2)
  const handleAgeSubmit = () => {
    const age = parseInt(numberValue, 10);
    if (isNaN(age) || age < 18 || age > 99) return;

    addUserMessage(numberValue);
    setIntakeData((prev) => ({ ...prev, age }));
    setNumberValue("");
    setCurrentStep(5);

    setTimeout(() => {
      addIrisMessage({
        id: "response-5",
        type: "iris",
        content: "Perfect! Laten we het over je dating situatie hebben.",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q6",
        type: "iris",
        content: "Wat is je huidige dating situatie?",
        inputType: "chips",
        chipOptions: DATING_STATUS_OPTIONS,
      });
    }, 2500);
  };

  // Question 6: Dating Status (was Question 3)
  const handleDatingStatusSelect = (value: string) => {
    const selected = DATING_STATUS_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, datingStatus: value as any }));
    setCurrentStep(6);

    setTimeout(() => {
      addIrisMessage({
        id: "response-6",
        type: "iris",
        content: "Oké, dat geeft me al een goed beeld. Thanks voor je eerlijkheid!",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q7",
        type: "iris",
        content: "Hoe lang ben je al single?",
        inputType: "chips",
        chipOptions: SINGLE_DURATION_OPTIONS,
      });
    }, 2500);
  };

  // Question 7: Single Duration (was Question 4)
  const handleSingleDurationSelect = (value: string) => {
    const selected = SINGLE_DURATION_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, singleDuration: value as any }));
    setCurrentStep(7);

    setTimeout(() => {
      addIrisMessage({
        id: "response-7",
        type: "iris",
        content: "Got it! Nu een praktische vraag...",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q8",
        type: "iris",
        content: "Welke dating apps gebruik je? (Je mag er meerdere kiezen)",
        inputType: "multi-chips",
        chipOptions: DATING_APP_OPTIONS,
      });
    }, 2500);
  };

  // Question 8: Dating Apps (multi-select) (was Question 5)
  const handleDatingAppsConfirm = () => {
    if (selectedChips.length === 0) return;

    const labels = selectedChips
      .map((val) => DATING_APP_OPTIONS.find((o) => o.value === val)?.label)
      .filter(Boolean)
      .join(", ");

    addUserMessage(labels);
    setIntakeData((prev) => ({ ...prev, datingApps: selectedChips }));
    setSelectedChips([]);
    setCurrentStep(8);

    setTimeout(() => {
      addIrisMessage({
        id: "response-8",
        type: "iris",
        content: "Nice! Dus je bent al actief aan het swipen.",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q9",
        type: "iris",
        content: "Hoeveel matches krijg je gemiddeld per week?",
        inputType: "chips",
        chipOptions: WEEKLY_MATCHES_OPTIONS,
      });
    }, 2500);
  };

  // Question 9: Weekly Matches (was Question 6)
  const handleWeeklyMatchesSelect = (value: string) => {
    const selected = WEEKLY_MATCHES_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, weeklyMatches: value as any }));
    setCurrentStep(9);

    setTimeout(() => {
      addIrisMessage({
        id: "response-9",
        type: "iris",
        content: "Oké, dat is goed om te weten. Nu wil ik graag dieper ingaan op wat je tegenhoudt...",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q10",
        type: "iris",
        content: "Wat is je grootste frustratie in dating op dit moment? Vertel het me in je eigen woorden.",
        inputType: "text",
        placeholder: "Bijv. Ik krijg wel matches maar gesprekken lopen altijd dood...",
      });
    }, 2500);
  };

  // Question 10: Biggest Frustration (open text - GOLDMINE!) (was Question 7)
  const handleFrustrationSubmit = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    setIntakeData((prev) => ({ ...prev, biggestFrustration: inputValue }));
    setInputValue("");
    setCurrentStep(10);

    setTimeout(() => {
      addIrisMessage({
        id: "response-10",
        type: "iris",
        content: "Dank je voor het delen. Ik snap dat dat frustrerend is. We gaan hier zeker aan werken!",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q11",
        type: "iris",
        content: "Hoe zou je je dating profiel beschrijven?",
        inputType: "chips",
        chipOptions: PROFILE_DESCRIPTION_OPTIONS,
      });
    }, 2500);
  };

  // Question 11: Profile Description (was Question 8)
  const handleProfileDescriptionSelect = (value: string) => {
    const selected = PROFILE_DESCRIPTION_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, profileDescription: value as any }));
    setCurrentStep(11);

    setTimeout(() => {
      addIrisMessage({
        id: "response-11",
        type: "iris",
        content: "Helder! Dan weet ik waar we aan kunnen werken met je profiel.",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q12",
        type: "iris",
        content: "Wat vind je het moeilijkste aan online dating?",
        inputType: "chips",
        chipOptions: BIGGEST_DIFFICULTY_OPTIONS,
      });
    }, 2500);
  };

  // Question 12: Biggest Difficulty (was Question 9)
  const handleBiggestDifficultySelect = (value: string) => {
    const selected = BIGGEST_DIFFICULTY_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, biggestDifficulty: value as any }));
    setCurrentStep(12);

    setTimeout(() => {
      addIrisMessage({
        id: "response-12",
        type: "iris",
        content: "Thanks! Nu wil ik graag weten wat je eigenlijk zoekt...",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q13",
        type: "iris",
        content: "Wat voor type relatie zoek je?",
        inputType: "chips",
        chipOptions: RELATIONSHIP_GOAL_OPTIONS,
      });
    }, 2500);
  };

  // Question 13: Relationship Goal (was Question 10)
  const handleRelationshipGoalSelect = (value: string) => {
    const selected = RELATIONSHIP_GOAL_OPTIONS.find((o) => o.value === value);
    if (!selected) return;

    addUserMessage(selected.label);
    setIntakeData((prev) => ({ ...prev, relationshipGoal: value as any }));
    setCurrentStep(13);

    setTimeout(() => {
      addIrisMessage({
        id: "response-13",
        type: "iris",
        content: "Perfect, dan weet ik wat je zoekt. Nu een eerlijke vraag...",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q14",
        type: "iris",
        content: "Hoe zelfverzekerd voel je je in dating? (1 = helemaal niet, 10 = super zelfverzekerd)",
        inputType: "slider",
        sliderConfig: {
          min: 1,
          max: 10,
          labels: ["Niet zelfverzekerd", "Neutraal", "Heel zelfverzekerd"],
        },
      });
    }, 2500);
  };

  // Question 14: Confidence Level (was Question 11)
  const handleConfidenceLevelConfirm = () => {
    addUserMessage(`Zelfvertrouwen: ${sliderValue}/10`);
    setIntakeData((prev) => ({ ...prev, confidenceLevel: sliderValue }));
    setCurrentStep(14);

    setTimeout(() => {
      addIrisMessage({
        id: "response-14",
        type: "iris",
        content: sliderValue <= 4
          ? "Dank je voor je eerlijkheid. Aan je zelfvertrouwen gaan we zeker werken!"
          : sliderValue <= 7
          ? "Dat is een goed uitgangspunt! We kunnen het nog verder opbouwen."
          : "Wow, dat is mooi! Laten we die energie gebruiken!",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q15-intro",
        type: "iris",
        content: "Nog twee laatste vragen, dan zijn we klaar. Deze zijn wat dieper, maar super waardevol voor mij...",
      });
    }, 2500);

    setTimeout(() => {
      addIrisMessage({
        id: "q15",
        type: "iris",
        content: "Wat is je grootste angst in dating? Wees eerlijk, dit blijft tussen ons.",
        inputType: "text",
        placeholder: "Bijv. Dat ik niet goed genoeg ben, afgewezen worden, etc.",
      });
    }, 5000);
  };

  // Question 15: Biggest Fear (open text - DEEP!) (was Question 12)
  const handleBiggestFearSubmit = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    setIntakeData((prev) => ({ ...prev, biggestFear: inputValue }));
    setInputValue("");
    setCurrentStep(15);

    setTimeout(() => {
      addIrisMessage({
        id: "response-15",
        type: "iris",
        content: "Bedankt dat je dit deelt. Dat vraagt moed. We gaan hier samen aan werken.",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "q16",
        type: "iris",
        content: "Laatste vraag: Stel je voor... het is over 3 maanden. Wat zou jouw ideale dating leven er dan uitzien?",
        inputType: "text",
        placeholder: "Bijv. Ik heb leuke dates, voel me zelfverzekerd, misschien wel een leuke relatie...",
      });
    }, 2500);
  };

  // Question 16: Ideal Outcome (final question!) (was Question 13)
  const handleIdealOutcomeSubmit = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    const finalData: KickstartIntakeData = {
      ...intakeData,
      idealOutcome: inputValue,
    } as KickstartIntakeData;

    setIntakeData(finalData);
    setInputValue("");
    setCurrentStep(16);

    setTimeout(() => {
      addIrisMessage({
        id: "final-1",
        type: "iris",
        content: "Dat is een mooi doel! En weet je wat? Dat gaat je lukken.",
      });
    }, 500);

    setTimeout(() => {
      addIrisMessage({
        id: "final-2",
        type: "iris",
        content: "Ik heb nu een compleet beeld van jou, je situatie, je uitdagingen en je dromen. Perfect! 🎯",
      });
    }, 2500);

    setTimeout(() => {
      addIrisMessage({
        id: "final-3",
        type: "iris",
        content: "Ik ga je de komende 21 dagen persoonlijk begeleiden naar je ideale dating leven. Let's go! 🚀",
      });
    }, 4500);

    // Complete after final message
    setTimeout(() => {
      onComplete(finalData);
    }, 6500);
  };

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

  const getCurrentPlaceholder = () => {
    const lastIrisMessage = [...messages]
      .reverse()
      .find((m) => m.type === "iris" && m.placeholder);
    return lastIrisMessage?.placeholder;
  };

  const handleMultiChipToggle = (value: string) => {
    setSelectedChips((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Progress Bar */}
      {currentStep > 0 && currentStep <= totalSteps && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">
              Vraag {currentStep}/{totalSteps}
            </span>
            <span className="text-xs font-semibold text-pink-600">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

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
        {/* Text Input (Name, Frustration, Fear, Ideal Outcome) */}
        {getCurrentInputType() === "text" && currentStep < 16 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (currentStep === 0) handleNameSubmit();
                  else if (currentStep === 9) handleFrustrationSubmit();
                  else if (currentStep === 14) handleBiggestFearSubmit();
                  else if (currentStep === 15) handleIdealOutcomeSubmit();
                }
              }}
              placeholder={getCurrentPlaceholder()}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              autoFocus
            />
            <Button
              onClick={() => {
                if (currentStep === 0) handleNameSubmit();
                else if (currentStep === 9) handleFrustrationSubmit();
                else if (currentStep === 14) handleBiggestFearSubmit();
                else if (currentStep === 15) handleIdealOutcomeSubmit();
              }}
              disabled={!inputValue.trim()}
              className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Number Input (Age) */}
        {getCurrentInputType() === "number" && currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <input
              type="number"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAgeSubmit()}
              placeholder={getCurrentPlaceholder()}
              min="18"
              max="99"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              autoFocus
            />
            <Button
              onClick={handleAgeSubmit}
              disabled={!numberValue || parseInt(numberValue) < 18 || parseInt(numberValue) > 99}
              className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Single Choice Chips */}
        {getCurrentInputType() === "chips" && (
          <IntakeChips
            options={getCurrentChipOptions() || []}
            onSelect={(value) => {
              // New questions (steps 1-3)
              if (currentStep === 1) handleGenderSelect(value);
              else if (currentStep === 2) handleLookingForSelect(value);
              else if (currentStep === 3) handleRegionSelect(value);
              // Original questions (shifted +3)
              else if (currentStep === 5) handleDatingStatusSelect(value);
              else if (currentStep === 6) handleSingleDurationSelect(value);
              else if (currentStep === 8) handleWeeklyMatchesSelect(value);
              else if (currentStep === 10) handleProfileDescriptionSelect(value);
              else if (currentStep === 11) handleBiggestDifficultySelect(value);
              else if (currentStep === 12) handleRelationshipGoalSelect(value);
            }}
          />
        )}

        {/* Multi-Select Chips (Dating Apps) */}
        {getCurrentInputType() === "multi-chips" && currentStep === 7 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap gap-2">
              {getCurrentChipOptions()?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMultiChipToggle(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 font-medium transition-all",
                    "hover:scale-105 active:scale-95",
                    selectedChips.includes(option.value)
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-pink-300"
                  )}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                  {selectedChips.includes(option.value) && (
                    <CheckCircle className="inline-block w-4 h-4 ml-2 text-pink-600" />
                  )}
                </button>
              ))}
            </div>
            <Button
              onClick={handleDatingAppsConfirm}
              disabled={selectedChips.length === 0}
              className="w-full bg-pink-500 hover:bg-pink-600 rounded-xl py-3"
            >
              Bevestig mijn keuze ({selectedChips.length} geselecteerd)
            </Button>
          </motion.div>
        )}

        {/* Slider (Confidence Level) */}
        {getCurrentInputType() === "slider" && currentStep === 13 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <IntakeSlider
              value={sliderValue}
              onChange={setSliderValue}
              {...getCurrentSliderConfig()}
            />
            <Button
              onClick={handleConfidenceLevelConfirm}
              className="w-full bg-pink-500 hover:bg-pink-600 rounded-xl py-3"
            >
              Bevestig mijn keuze
            </Button>
          </motion.div>
        )}

        {/* Loading State (Completing) */}
        {currentStep === 16 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-gray-500 py-4"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Iris maakt je persoonlijke Kickstart plan...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
