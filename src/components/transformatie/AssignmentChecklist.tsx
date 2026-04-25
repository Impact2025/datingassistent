'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssignmentChecklistProps {
  lessonId: number;
  assignmentText: string;
  isCompleted: boolean;
  onComplete: (completed: boolean) => void;
}

export function AssignmentChecklist({
  lessonId,
  assignmentText,
  isCompleted,
  onComplete,
}: AssignmentChecklistProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(isCompleted);

  const handleToggle = async () => {
    if (loading) return;
    const newValue = !done;
    setLoading(true);

    try {
      const res = await fetch('/api/transformatie/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, assignmentCompleted: newValue }),
      });
      if (res.ok) {
        setDone(newValue);
        onComplete(newValue);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-start gap-2 mb-2">
        <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Jouw opdracht</span>
      </div>

      <div
        className={`
          relative rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer select-none
          ${done
            ? 'border-green-400 bg-green-50/60'
            : 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
          }
        `}
        onClick={handleToggle}
        role="checkbox"
        aria-checked={done}
        tabIndex={0}
        onKeyDown={(e) => e.key === ' ' || e.key === 'Enter' ? handleToggle() : undefined}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            ) : done ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </motion.div>
            ) : (
              <Circle className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <p className={`text-sm leading-relaxed transition-all duration-200 ${done ? 'text-green-700 line-through decoration-green-400' : 'text-gray-700'}`}>
            {assignmentText}
          </p>
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-2 ml-8 text-xs text-green-600 font-medium"
            >
              Gedaan
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
