"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle, Calendar } from "lucide-react";

interface KickstartProgram {
  program_id: number;
  program_slug: string;
  program_name: string;
  program_tier: string;
  program_type: 'kickstart';
  enrolled_at: string;
  status: string;
  completed_days: number;
  total_days: number;
  next_day: number;
  last_completed_day?: number;
  overall_progress_percentage: number;
}

interface KickstartProgramCardProps {
  program: KickstartProgram;
  index?: number;
}

export function KickstartProgramCard({ program, index = 0 }: KickstartProgramCardProps) {
  const router = useRouter();
  const progress = program.overall_progress_percentage;
  const currentDay = program.next_day;
  const isCompleted = progress === 100;
  const isStarted = progress > 0;

  // Calculate days remaining
  const daysRemaining = 21 - program.completed_days;

  const handleContinue = () => {
    if (isCompleted) {
      router.push(`/kickstart`);
    } else {
      router.push(`/kickstart/dag/${currentDay}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="border rounded-lg p-4 hover:border-pink-500 transition-colors cursor-pointer group bg-gradient-to-br from-blue-50 to-purple-50">
        <div onClick={() => router.push('/kickstart')}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                  {program.program_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {isCompleted && (
                    <Badge className="bg-green-500 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Voltooid!
                    </Badge>
                  )}
                  {!isCompleted && isStarted && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      Dag {currentDay}/21
                    </Badge>
                  )}
                  {!isStarted && (
                    <Badge variant="outline" className="text-xs">
                      Nieuw
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Circle */}
            <div className="text-center">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                    className="text-blue-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Day-based instead of module/lesson */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-2 bg-white rounded-lg">
              <p className="text-xs text-gray-600">Voltooid</p>
              <p className="text-sm font-bold text-gray-900">
                {program.completed_days}/{program.total_days} dagen
              </p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <p className="text-xs text-gray-600">Te gaan</p>
              <p className="text-sm font-bold text-gray-900">
                {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagen'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Current Day Info */}
          {!isCompleted && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="line-clamp-1">
                Volgende: Dag {currentDay}
              </span>
            </div>
          )}

          {/* Completed Message */}
          {isCompleted && (
            <div className="flex items-center gap-2 text-sm text-green-600 mb-3 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>
                Gefeliciteerd! Je hebt alle 21 dagen afgerond! 🎉
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!isCompleted && (
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
            size="sm"
          >
            {isStarted ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Ga verder naar Dag {currentDay}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start met Dag 1
              </>
            )}
          </Button>
        )}

        {isCompleted && (
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/kickstart')}
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Bekijk overzicht
            </Button>
            <Button
              onClick={() => router.push('/kickstart/dag/1')}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Herbekijk dagen
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
