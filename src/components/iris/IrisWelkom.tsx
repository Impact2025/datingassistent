'use client';

import { Sparkles } from 'lucide-react';

interface IrisWelkomProps {
  bericht: string;
}

export function IrisWelkom({ bericht }: IrisWelkomProps) {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-accent-50
                    rounded-xl p-4 border border-primary-100 mb-6">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500
                        rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-gray-700 text-sm leading-relaxed">{bericht}</p>
        </div>
      </div>
    </div>
  );
}