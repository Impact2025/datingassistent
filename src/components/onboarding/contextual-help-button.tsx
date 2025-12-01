"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Play, Lightbulb, BookOpen, Zap } from 'lucide-react';
import { useTutorial } from './tutorial-engine/tutorial-engine';
import { cn } from '@/lib/utils';

interface ContextualHelpButtonProps {
  tutorialId?: string;
  helpText?: string;
  helpTitle?: string;
  variant?: 'icon' | 'button' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  showTutorialTrigger?: boolean;
  quickTips?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
}

export function ContextualHelpButton({
  tutorialId,
  helpText,
  helpTitle = "Hulp nodig?",
  variant = 'icon',
  size = 'md',
  position = 'top',
  className,
  showTutorialTrigger = true,
  quickTips
}: ContextualHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { startTutorial, isTutorialCompleted } = useTutorial();

  const handleTutorialStart = () => {
    if (tutorialId) {
      startTutorial(tutorialId);
      setIsOpen(false);
    }
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSize = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  if (variant === 'badge') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "cursor-help hover:bg-primary/10 hover:border-primary/50 transition-colors",
              className
            )}
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            Hulp
          </Badge>
        </PopoverTrigger>
        <PopoverContent
          side={position}
          className="w-80 p-0"
          align="start"
        >
          <HelpContent
            helpTitle={helpTitle}
            helpText={helpText}
            tutorialId={tutorialId}
            showTutorialTrigger={showTutorialTrigger}
            quickTips={quickTips}
            onTutorialStart={handleTutorialStart}
            isTutorialCompleted={isTutorialCompleted(tutorialId || '')}
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === 'button') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 hover:bg-primary/10 hover:border-primary/50",
              className
            )}
          >
            <HelpCircle className="w-4 h-4" />
            Hulp
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side={position}
          className="w-80 p-0"
          align="start"
        >
          <HelpContent
            helpTitle={helpTitle}
            helpText={helpText}
            tutorialId={tutorialId}
            showTutorialTrigger={showTutorialTrigger}
            quickTips={quickTips}
            onTutorialStart={handleTutorialStart}
            isTutorialCompleted={isTutorialCompleted(tutorialId || '')}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Default icon variant
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            buttonSize[size],
            "text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
            className
          )}
        >
          <HelpCircle className={iconSize[size]} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={position}
        className="w-80 p-0"
        align="start"
      >
        <HelpContent
          helpTitle={helpTitle}
          helpText={helpText}
          tutorialId={tutorialId}
          showTutorialTrigger={showTutorialTrigger}
          quickTips={quickTips}
          onTutorialStart={handleTutorialStart}
          isTutorialCompleted={isTutorialCompleted(tutorialId || '')}
        />
      </PopoverContent>
    </Popover>
  );
}

interface HelpContentProps {
  helpTitle: string;
  helpText?: string;
  tutorialId?: string;
  showTutorialTrigger: boolean;
  quickTips?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  onTutorialStart: () => void;
  isTutorialCompleted: boolean;
}

function HelpContent({
  helpTitle,
  helpText,
  tutorialId,
  showTutorialTrigger,
  quickTips,
  onTutorialStart,
  isTutorialCompleted
}: HelpContentProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h4 className="font-semibold text-sm">{helpTitle}</h4>
      </div>

      {helpText && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {helpText}
        </p>
      )}

      {/* Quick Tips */}
      {quickTips && quickTips.length > 0 && (
        <div className="space-y-3 mb-4">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Snelle Tips
          </h5>
          {quickTips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-2 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {tip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="text-sm font-medium">{tip.title}</h6>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tutorial Trigger */}
      {tutorialId && showTutorialTrigger && (
        <Button
          onClick={onTutorialStart}
          size="sm"
          className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isTutorialCompleted ? (
            <>
              <BookOpen className="w-4 h-4" />
              Opnieuw bekijken
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Tutorial
            </>
          )}
        </Button>
      )}

      {!tutorialId && !helpText && !quickTips && (
        <div className="text-center py-4">
          <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Meer hulp nodig? Neem contact op met onze support.
          </p>
        </div>
      )}
    </div>
  );
}