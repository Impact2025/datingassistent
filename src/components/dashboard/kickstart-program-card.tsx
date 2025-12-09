"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Target } from "lucide-react";

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

export function KickstartProgramCard({ program }: KickstartProgramCardProps) {
  const router = useRouter();

  const progress = program.overall_progress_percentage;
  const currentDay = program.next_day;
  const isCompleted = progress === 100;
  const isStarted = progress > 0;

  // Calculate days remaining
  const daysRemaining = 21 - program.completed_days;

  const handleContinue = () => {
    // Always navigate to kickstart page with inline two-panel view
    router.push(`/kickstart`);
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-purple-100 dark:from-blue-900/30 dark:to-purple-800/30 shadow-md">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile: Stack layout, Desktop: Side-by-side */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          {/* Icon - smaller on mobile */}
          <div className="flex-shrink-0 flex items-center gap-3 sm:block">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <div className="text-blue-600 dark:text-blue-400">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            {/* Title on same line as icon on mobile */}
            <div className="sm:hidden flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base text-blue-600 dark:text-blue-400">
                  {program.program_name}
                </h3>
                {isStarted && !isCompleted && (
                  <span className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-full shadow-md whitespace-nowrap font-medium">
                    Dag {currentDay}/21
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title - hidden on mobile (shown above) */}
            <div className="hidden sm:flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                {program.program_name}
              </h3>
              {isStarted && !isCompleted && (
                <span className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-full shadow-md font-medium">
                  Dag {currentDay}/21
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-2">
              {isCompleted
                ? "Gefeliciteerd! Je hebt alle 21 dagen afgerond! 🎉"
                : `Jouw 21-dagen transformatie naar dating succes. ${program.completed_days} van 21 dagen voltooid.`
              }
            </p>

            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 italic mb-4">
              "Dagelijkse stappen naar meer dating zelfvertrouwen"
            </p>

            {/* Progress Stats */}
            {!isCompleted && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-white/60 dark:bg-white/10 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Voltooid</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {program.completed_days}
                  </p>
                </div>
                <div className="text-center p-2 bg-white/60 dark:bg-white/10 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Te gaan</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {daysRemaining}
                  </p>
                </div>
                <div className="text-center p-2 bg-white/60 dark:bg-white/10 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Voortgang</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {progress}%
                  </p>
                </div>
              </div>
            )}

            {/* Button */}
            <Button
              onClick={handleContinue}
              size="sm"
              className="gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto justify-center"
            >
              {isCompleted ? (
                <>
                  Bekijk Overzicht
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : isStarted ? (
                <>
                  <Play className="w-4 h-4" />
                  Ga verder naar Dag {currentDay}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start met Dag 1
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
