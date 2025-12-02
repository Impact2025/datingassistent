"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IrisAvatar } from "./IrisAvatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock } from "lucide-react";
import Link from "next/link";

interface PriorityActionCardProps {
  toolSlug: string;
  toolName: string;
  toolIcon: string;
  toolDescription: string;
  estimatedTime: string;
  irisMessage: string;
  className?: string;
}

export function PriorityActionCard({
  toolSlug,
  toolName,
  toolIcon,
  toolDescription,
  estimatedTime,
  irisMessage,
  className,
}: PriorityActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "relative bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl overflow-hidden border-2 border-pink-200 shadow-lg",
        className
      )}
    >
      {/* Recommended Badge */}
      <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          <span>Aanbevolen</span>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl flex-shrink-0">
            {toolIcon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{toolName}</h3>
            <p className="text-gray-600 text-sm">{toolDescription}</p>
            <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Iris Recommendation */}
        <div className="flex items-start gap-3 mb-4 bg-white rounded-xl p-3">
          <IrisAvatar size="xs" />
          <p className="text-gray-700 text-sm italic flex-1">"{irisMessage}"</p>
        </div>

        {/* CTA */}
        <Link href={`/tools/${toolSlug}`}>
          <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all group">
            Start nu
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

// Default priority actions per path
export const PRIORITY_ACTIONS: Record<
  string,
  {
    toolSlug: string;
    toolName: string;
    toolIcon: string;
    toolDescription: string;
    estimatedTime: string;
    irisMessage: string;
  }
> = {
  profile: {
    toolSlug: "profiel-analyse",
    toolName: "AI Profiel Analyse",
    toolIcon: "🔍",
    toolDescription: "Laat AI je profiel analyseren en krijg concrete verbeterpunten",
    estimatedTime: "5 minuten",
    irisMessage: "Begin hier. Dit is de snelste manier om meer matches te krijgen.",
  },
  conversation: {
    toolSlug: "chat-coach",
    toolName: "Chat Coach",
    toolIcon: "💬",
    toolDescription: "Real-time begeleiding bij je gesprekken",
    estimatedTime: "Doorlopend",
    irisMessage: "Laten we je gesprekken naar een hoger niveau tillen.",
  },
  dating: {
    toolSlug: "date-prep",
    toolName: "Date Voorbereiding",
    toolIcon: "📅",
    toolDescription: "Bereid je perfect voor op je date",
    estimatedTime: "5 minuten",
    irisMessage: "Je bent klaar voor de volgende stap. Laten we je voorbereiden.",
  },
  confidence: {
    toolSlug: "zelfbeeld-analyse",
    toolName: "Zelfbeeld Analyse",
    toolIcon: "🪞",
    toolDescription: "Ontdek je sterke punten en werk aan je mindset",
    estimatedTime: "10 minuten",
    irisMessage: "Laten we beginnen bij de basis: wie jij bent.",
  },
};
