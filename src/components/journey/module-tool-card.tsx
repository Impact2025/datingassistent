'use client';

import { useRouter } from 'next/navigation';
import { Clock, ArrowRight } from 'lucide-react';
import { getToolForModuleName } from '@/lib/journey/tool-journey-map';
import { getIcon } from '@/lib/utils/icon-map';
import { cn } from '@/lib/utils';

const COLOR_STYLES = {
  coral:  { bg: 'bg-coral-50 dark:bg-coral-950/20',   border: 'border-coral-200 dark:border-coral-800/50',   icon: 'bg-coral-100 dark:bg-coral-900/40 text-coral-600 dark:text-coral-400',   btn: 'bg-coral-500 hover:bg-coral-600 text-white',   badge: 'bg-coral-100 text-coral-700 dark:bg-coral-900/40 dark:text-coral-300' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/20',     border: 'border-blue-200 dark:border-blue-800/50',     icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',     btn: 'bg-blue-500 hover:bg-blue-600 text-white',     badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800/50', icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400', btn: 'bg-purple-500 hover:bg-purple-600 text-white', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  green:  { bg: 'bg-green-50 dark:bg-green-950/20',   border: 'border-green-200 dark:border-green-800/50',   icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',   btn: 'bg-green-500 hover:bg-green-600 text-white',   badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-950/20',   border: 'border-amber-200 dark:border-amber-800/50',   icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',   btn: 'bg-amber-500 hover:bg-amber-600 text-white',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
};

interface ModuleToolCardProps {
  toolName: string | null | undefined;
  className?: string;
}

export function ModuleToolCard({ toolName, className }: ModuleToolCardProps) {
  const router = useRouter();

  if (!toolName) return null;

  const tool = getToolForModuleName(toolName);
  if (!tool) return null;

  const colors = COLOR_STYLES[tool.color];
  const Icon = getIcon(tool.icon);

  return (
    <div className={cn('rounded-2xl border p-4', colors.bg, colors.border, className)}>
      {/* Header label */}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
        Aanbevolen bij deze module
      </p>

      <div className="flex items-start gap-3">
        {/* Tool icon */}
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', colors.icon)}>
          {Icon && <Icon className="w-5 h-5" strokeWidth={2} />}
        </div>

        {/* Tool info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{tool.name}</p>
            <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full', colors.badge)}>
              <Clock className="w-2.5 h-2.5" />
              {tool.duration}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={() => router.push(tool.route)}
        className={cn(
          'mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98]',
          colors.btn
        )}
      >
        {tool.cta}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
