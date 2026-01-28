/**
 * ToolsGridSection - Featured tools grid for dashboard
 * Optimized, reusable component with access control
 */

'use client';

import React from 'react';
import { ArrowRight, Zap, Heart, Camera, MessageCircle, Sparkles, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockedToolCard } from '@/components/ui/locked-tool-card';
import { useAccessControl } from '@/hooks/use-access-control';
import { checkProfileSuiteToolAccess } from '@/lib/access-control';
import { FEATURED_TOOL_IDS, ANIMATION_DELAYS } from '@/lib/constants/dashboard';
import { motion } from 'framer-motion';

interface ToolsGridSectionProps {
  onTabChange?: (tab: string) => void;
  onOpenScan?: (scanType: string) => void;
  showWelcomeVideo?: boolean;
}

const FEATURED_TOOLS = [
  {
    id: 'profiel-optimalisatie',
    label: 'Profiel Optimalisatie',
    icon: Target,
    description: 'Bouw een profiel dat werkt',
    color: 'from-coral-500 to-coral-600',
  },
  {
    id: FEATURED_TOOL_IDS.HECHTINGSSTIJL,
    label: 'Hechtingsstijl',
    icon: Heart,
    description: 'Ontdek je hechtingspatroon',
    color: 'from-purple-500 to-coral-500',
  },
  {
    id: FEATURED_TOOL_IDS.PHOTO_ANALYSIS,
    label: 'Foto Analyse',
    icon: Camera,
    description: 'AI feedback op je foto\'s',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: FEATURED_TOOL_IDS.CHAT_COACH,
    label: 'Chat Coach',
    icon: MessageCircle,
    description: 'Je 24/7 AI dating coach',
    color: 'from-blue-500 to-cyan-500',
  },
];

export const ToolsGridSection = React.memo(function ToolsGridSection({
  onTabChange,
  onOpenScan,
  showWelcomeVideo = false,
}: ToolsGridSectionProps) {
  const { userTier } = useAccessControl();

  if (showWelcomeVideo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: ANIMATION_DELAYS.TOOLS }}
    >
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-coral-50/30 dark:from-gray-800 dark:to-coral-900/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-coral-100 dark:bg-coral-900/30 rounded-lg">
                <Zap className="w-4 h-4 text-coral-600 dark:text-coral-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Jouw Tools</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Alles wat je nodig hebt</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange?.('profiel')}
              className="text-coral-600 hover:text-coral-700 text-xs"
            >
              Alle tools
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURED_TOOLS.map((tool) => {
              const accessInfo = checkProfileSuiteToolAccess(tool.id, userTier, 0);
              return (
                <LockedToolCard
                  key={tool.id}
                  tool={tool}
                  accessLevel={accessInfo.accessLevel}
                  remaining={accessInfo.remaining}
                  limit={accessInfo.limit}
                  lockedMessage={accessInfo.lockedMessage}
                  upgradeMessage={accessInfo.upgradeMessage}
                  upgradeTier={accessInfo.upgradeTier}
                  onUnlockedClick={() => {
                    if (tool.id === FEATURED_TOOL_IDS.HECHTINGSSTIJL) {
                      onOpenScan?.('hechtingsstijl');
                    } else if (tool.id === FEATURED_TOOL_IDS.CHAT_COACH) {
                      onTabChange?.('coach');
                    } else if (tool.id === FEATURED_TOOL_IDS.PHOTO_ANALYSIS || tool.id === FEATURED_TOOL_IDS.OPENERS) {
                      // Direct open tool met query parameter
                      if (typeof window !== 'undefined') {
                        const currentUrl = new URL(window.location.href);
                        currentUrl.searchParams.set('tab', 'profiel');
                        currentUrl.searchParams.set('tool', tool.id);
                        window.history.pushState({}, '', currentUrl.toString());
                        onTabChange?.('profiel');
                      }
                    } else {
                      onTabChange?.('profiel');
                    }
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
