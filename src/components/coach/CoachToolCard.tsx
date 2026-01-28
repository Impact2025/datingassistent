'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight } from 'lucide-react';

export interface ToolSuggestion {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  href: string;
}

interface CoachToolCardProps {
  tool: ToolSuggestion;
  onClick?: () => void;
}

export function CoachToolCard({ tool, onClick }: CoachToolCardProps) {
  const Icon = tool.icon;

  return (
    <motion.a
      href={tool.href}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-coral-300
                 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 bg-coral-50 rounded-lg flex items-center justify-center flex-shrink-0
                        group-hover:bg-coral-100 transition-colors">
          <Icon className="w-5 h-5 text-coral-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 text-sm">
              {tool.title}
            </h3>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-coral-500 transition-colors" />
          </div>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {tool.description}
          </p>

          <span className="inline-block mt-2 text-xs text-coral-600 font-medium">
            {tool.category}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
