'use client';

import { Award, Target, Compass, MessageCircle, Mic, Zap, Heart, PenTool,
  BookOpen, Star, CheckCircle2, TrendingUp, Sparkles, Flame, Mountain, Lock } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Award, Target, Compass, MessageCircle, Mic, Zap, Heart, PenTool,
  BookOpen, Star, CheckCircle2, TrendingUp, Sparkles, Flame, Mountain,
};

interface Badge {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  earned_at?: string;
}

interface BadgeShowcaseProps {
  earnedBadges: Badge[];
  allBadges: Badge[];
}

export function BadgeShowcase({ earnedBadges, allBadges }: BadgeShowcaseProps) {
  const earnedIds = new Set(earnedBadges.map(b => b.id));
  const lockedBadges = allBadges.filter(b => !earnedIds.has(b.id));

  return (
    <div className="space-y-4">
      {earnedBadges.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Verdiend ({earnedBadges.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {earnedBadges.map((badge) => {
              const IconComponent = ICON_MAP[badge.icon] ?? Award;
              return (
                <div
                  key={badge.id}
                  title={badge.description}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-yellow-50 border border-yellow-200 cursor-default"
                >
                  <div className="w-9 h-9 rounded-lg bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-[10px] text-center text-gray-700 font-medium leading-tight line-clamp-2">
                    {badge.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Nog te verdienen ({lockedBadges.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                title={badge.description}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-default opacity-60"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-[10px] text-center text-gray-400 font-medium leading-tight line-clamp-2">
                  {badge.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-400">
          <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Voltooi lessen en opdrachten om badges te verdienen.</p>
        </div>
      )}
    </div>
  );
}
