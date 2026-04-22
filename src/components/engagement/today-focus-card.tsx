"use client";

/**
 * TodayFocusCard — De enige handeling die telt vandaag.
 * Eén taak. Prominent. Vóór alles.
 *
 * State machine:
 *   loading → ready → completing → done
 *             ready → (skip)  → ready (volgende taak)
 *                             → skipped (alle taken over)
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Flame,
  SkipForward,
  MessageSquare,
  Camera,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FocusTask {
  id: number;
  taskTitle: string;
  taskDescription?: string;
  taskCategory: "social" | "practical" | "mindset";
  status: string;
}

interface TodayFocusCardProps {
  userId?: number;
}

type CardState = "loading" | "ready" | "completing" | "done" | "skipped" | "no_tasks";

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  social: {
    Icon: MessageSquare,
    gradient: "from-blue-500 to-indigo-500",
    pill: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    accent: "text-blue-600 dark:text-blue-400",
    label: "Sociaal",
  },
  practical: {
    Icon: Camera,
    gradient: "from-emerald-500 to-teal-500",
    pill: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    accent: "text-emerald-600 dark:text-emerald-400",
    label: "Praktisch",
  },
  mindset: {
    Icon: Heart,
    gradient: "from-purple-500 to-rose-500",
    pill: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    accent: "text-purple-600 dark:text-purple-400",
    label: "Mindset",
  },
} as const;

// Slaat dagelijkse voltooiing op: key = "today_focus_2025-03-23"
const getTodayKey = () =>
  `today_focus_${new Date().toISOString().slice(0, 10)}`;

// ─── Component ────────────────────────────────────────────────────────────────

export function TodayFocusCard({ userId }: TodayFocusCardProps) {
  const [cardState, setCardState] = useState<CardState>("loading");
  const [task, setTask] = useState<FocusTask | null>(null);
  const [allTasks, setAllTasks] = useState<FocusTask[]>([]);
  const [skippedIds, setSkippedIds] = useState<Set<number>>(new Set());
  const [streak, setStreak] = useState(0);
  const [journeyDay, setJourneyDay] = useState(1);

  // ── Data laden ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!userId) {
      setCardState("no_tasks");
      return;
    }

    // Check of vandaag al afgerond
    const stored = localStorage.getItem(getTodayKey());
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.status === "done") {
          setStreak(parsed.streak ?? 0);
          setJourneyDay(parsed.journeyDay ?? 1);
          setCardState("done");
          return;
        }
      } catch {
        /* corrupt entry — doorgaan met laden */
      }
    }

    try {
      // Engagement metrics ophalen
      const engRes = await fetch(`/api/engagement/dashboard?userId=${userId}`);
      let currentStreak = 0;
      let currentJourneyDay = 1;

      if (engRes.ok) {
        const engData = await engRes.json();
        currentStreak = engData.engagement?.currentStreak ?? 0;
        currentJourneyDay = engData.engagement?.journeyDay ?? 1;
        setStreak(currentStreak);
        setJourneyDay(currentJourneyDay);
      }

      // Dagelijkse taken ophalen
      const taskRes = await fetch("/api/daily-tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          journeyDay: currentJourneyDay,
          userProfile: null,
          recentActivity: null,
          completedTasks: null,
        }),
      });

      if (!taskRes.ok) {
        setCardState("no_tasks");
        return;
      }

      const taskData = await taskRes.json();
      const pending: FocusTask[] = (taskData.tasks ?? []).filter(
        (t: FocusTask) => t.status !== "completed"
      );

      setAllTasks(pending);

      const first = pending[0] ?? null;
      setTask(first);
      setCardState(first ? "ready" : "no_tasks");
    } catch {
      setCardState("no_tasks");
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDone = useCallback(async () => {
    if (!task) return;
    setCardState("completing");

    // Taak markeren als voltooid (non-blocking)
    fetch("/api/engagement/task-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, currentValue: 1 }),
    }).catch(() => {});

    const newStreak = streak + 1;

    // Voltooiing persisteren voor de rest van de dag
    localStorage.setItem(
      getTodayKey(),
      JSON.stringify({
        status: "done",
        taskId: task.id,
        streak: newStreak,
        journeyDay,
      })
    );

    setStreak(newStreak);

    setTimeout(() => setCardState("done"), 1600);
  }, [task, streak, journeyDay]);

  const handleSkip = useCallback(() => {
    if (!task) return;

    const newSkipped = new Set(skippedIds).add(task.id);
    setSkippedIds(newSkipped);

    const remaining = allTasks.filter((t) => !newSkipped.has(t.id));
    const next = remaining[0] ?? null;

    setTask(next);
    setCardState(next ? "ready" : "skipped");
  }, [task, skippedIds, allTasks]);

  // ── Render: loading ──────────────────────────────────────────────────────────
  if (cardState === "loading") {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 animate-pulse shadow-sm">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2" />
        <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-full mb-1" />
        <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-3/4 mb-6" />
        <div className="flex gap-3">
          <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1" />
          <div className="h-11 bg-gray-100 dark:bg-gray-600 rounded-xl w-28" />
        </div>
      </div>
    );
  }

  // Geen taken → geen kaart (doe niets, verstoort de layout niet)
  if (cardState === "no_tasks") return null;

  // ── Render: alles overgeslagen ───────────────────────────────────────────────
  if (cardState === "skipped") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
      >
        <SkipForward className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Geen taken meer voor vandaag. Kom morgen terug.
        </span>
      </motion.div>
    );
  }

  // ── Render: voltooiing animatie ──────────────────────────────────────────────
  if (cardState === "completing") {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0.8, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 p-5 shadow-sm"
      >
        <div className="flex items-center justify-center gap-3 py-3">
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            Bezig met opslaan…
          </span>
        </div>
      </motion.div>
    );
  }

  // ── Render: vandaag klaar ────────────────────────────────────────────────────
  if (cardState === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="rounded-2xl bg-coral-500 hover:bg-coral-600 p-5 text-white relative overflow-hidden shadow-md"
      >
        {/* Decoratieve blur-cirkels */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/75 mb-0.5 uppercase tracking-wide">
              Taak van vandaag
            </p>
            <p className="text-xl font-bold text-white leading-tight">
              Goed gedaan!
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-white/90 font-medium">
                {streak} {streak === 1 ? "dag" : "dagen"} op rij
              </span>
              <span className="text-white/50 mx-1">·</span>
              <span className="text-sm text-white/75">Dag {journeyDay}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Render: hoofdstaat (ready) ───────────────────────────────────────────────
  const category = task?.taskCategory ?? "mindset";
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.mindset;
  const { Icon } = cfg;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={task?.id ?? "focus"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
      >
        {/* Kleur-accent bovenrand */}
        <div className={cn("h-1 w-full bg-gradient-to-r", cfg.gradient)} />

        <div className="p-5">
          {/* Koptekst: categorie + streak */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center",
                  cfg.pill
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  cfg.accent
                )}
              >
                {cfg.label} · Dag {journeyDay}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {streak}
              </span>
            </div>
          </div>

          {/* De taak zelf */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-1.5">
              {task?.taskTitle}
            </h3>
            {task?.taskDescription && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {task.taskDescription}
              </p>
            )}
          </div>

          {/* Acties */}
          <div className="flex gap-3">
            <Button
              onClick={handleDone}
              className={cn(
                "flex-1 font-semibold rounded-xl h-11 shadow-sm text-white",
                "bg-coral-500 hover:bg-coral-600",
                "transition-all active:scale-[0.98]"
              )}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Gedaan
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="rounded-xl h-11 px-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <SkipForward className="w-4 h-4 mr-1.5" />
              Sla over
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
