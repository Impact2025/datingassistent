"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { IrisAvatar } from "./IrisAvatar";
import { IrisSpeechBubble } from "./IrisSpeechBubble";

type RecommendedPath = "profile" | "conversation" | "dating" | "confidence";

interface PathConfig {
  message: string;
  actionTitle: string;
  actionDescription: string;
  actionIcon: string;
  actionRoute: { type: "tab" | "url"; value: string };
}

const PATH_CONFIG: Record<RecommendedPath, PathConfig> = {
  profile: {
    message:
      "Jouw profiel versterken is de snelste weg naar meer matches. Laten we direct starten met een AI-analyse van je huidige profiel.",
    actionTitle: "AI Profiel Analyse",
    actionDescription: "Ontdek concrete verbeterpunten in 5 minuten",
    actionIcon: "🔍",
    actionRoute: { type: "tab", value: "profiel-persoonlijkheid" },
  },
  conversation: {
    message:
      "Goede gesprekken zijn een vaardigheid die je kunt leren. Start nu met de Chat Coach voor direct feedback op je berichten.",
    actionTitle: "Chat Coach",
    actionDescription: "Real-time begeleiding bij je gesprekken",
    actionIcon: "💬",
    actionRoute: { type: "tab", value: "communicatie-matching" },
  },
  dating: {
    message:
      "Van match naar date — dat is jouw doel. Ik help je een date plannen die ze niet vergeten.",
    actionTitle: "Date Voorbereiding",
    actionDescription: "Bereid je perfect voor op je volgende date",
    actionIcon: "📅",
    actionRoute: { type: "tab", value: "daten-relaties" },
  },
  confidence: {
    message:
      "Alles begint met zelfvertrouwen. Start met de Hechtingsstijl Scan — dat geeft direct inzicht in jouw patronen.",
    actionTitle: "Hechtingsstijl Scan",
    actionDescription: "Ontdek jouw hechtingsstijl in 10 minuten",
    actionIcon: "🪞",
    actionRoute: { type: "url", value: "/hechtingsstijl" },
  },
};

interface FirstActionModalProps {
  path: RecommendedPath;
  userName?: string;
  onDismiss: () => void;
}

export function FirstActionModal({
  path,
  userName,
  onDismiss,
}: FirstActionModalProps) {
  const router = useRouter();
  const config = PATH_CONFIG[path] ?? PATH_CONFIG.profile;
  const firstName = userName?.split(" ")[0] || "daar";

  const handleStartAction = () => {
    onDismiss();
    if (config.actionRoute.type === "tab") {
      router.push(`/dashboard?tab=${config.actionRoute.value}`);
    } else {
      router.push(config.actionRoute.value);
    }
  };

  const handleViewProgram = () => {
    onDismiss();
    router.push("/select-package");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onDismiss();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-coral-500 to-coral-600 px-6 pt-6 pb-8 relative">
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <IrisAvatar size="lg" showGlow animated />
              <div>
                <p className="text-white/80 text-sm font-medium">Iris zegt</p>
                <h2 className="text-white text-lg font-bold leading-tight">
                  Welkom, {firstName}!
                </h2>
              </div>
            </div>

            <div className="bg-white/15 rounded-2xl p-4">
              <p className="text-white text-sm leading-relaxed">
                {config.message}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Recommended first action */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Jouw eerste stap
              </p>
              <button
                onClick={handleStartAction}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-coral-100 bg-coral-50 hover:border-coral-300 hover:bg-coral-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
                  {config.actionIcon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">
                    {config.actionTitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    {config.actionDescription}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-coral-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">of</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Program teaser */}
            <button
              onClick={handleViewProgram}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-coral-50 border border-violet-100 hover:border-violet-200 transition-colors group"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Wil je het volledig aanpakken?
                </p>
                <p className="text-xs text-gray-500">
                  Bekijk het Kickstart programma
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Ik verken eerst het dashboard
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
