"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContextualTooltipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  showIcon?: boolean;
  iconClassName?: string;
  className?: string;
  delayDuration?: number;
}

/**
 * Contextual Tooltip Component
 *
 * Shows helpful hints and tips to guide users through tools.
 * Can wrap existing elements or render as standalone info icon.
 *
 * @example
 * // Wrap existing element
 * <ContextualTooltip content="Upload in natuurlijk licht">
 *   <Button>Upload Foto</Button>
 * </ContextualTooltip>
 *
 * @example
 * // Standalone icon
 * <ContextualTooltip
 *   content="Dit helpt ons je profiel te optimaliseren"
 *   showIcon
 * />
 */
export function ContextualTooltip({
  content,
  children,
  position = "top",
  showIcon = false,
  iconClassName,
  className,
  delayDuration = 200
}: ContextualTooltipProps) {
  const [open, setOpen] = useState(false);

  // If no children provided and showIcon is true, render info icon
  const trigger = children || (
    showIcon ? (
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center",
          "w-4 h-4 rounded-full",
          "text-muted-foreground hover:text-foreground",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          iconClassName
        )}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Info className="w-4 h-4" />
        <span className="sr-only">Meer informatie</span>
      </button>
    ) : null
  );

  if (!trigger) {
    console.warn('ContextualTooltip: No children or showIcon prop provided');
    return null;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          {children ? (
            <span
              className={cn("inline-flex", className)}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {children}
            </span>
          ) : (
            trigger
          )}
        </TooltipTrigger>
        <TooltipContent side={position} className="max-w-xs">
          {typeof content === 'string' ? (
            <p className="text-sm">{content}</p>
          ) : (
            content
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Inline Tooltip with Label
 *
 * Combines a label with an inline tooltip icon.
 * Perfect for form fields.
 *
 * @example
 * <InlineTooltip
 *   label="Profielfoto"
 *   tooltip="Upload een foto in natuurlijk licht voor beste resultaten"
 * />
 */
export function InlineTooltip({
  label,
  tooltip,
  required = false,
  htmlFor
}: {
  label: string;
  tooltip: string;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <ContextualTooltip content={tooltip} showIcon />
    </div>
  );
}

/**
 * Tooltip Badge
 *
 * Small badge with tooltip, perfect for feature highlights.
 *
 * @example
 * <TooltipBadge
 *   badge="NIEUW"
 *   tooltip="Deze feature is nieuw toegevoegd!"
 * />
 */
export function TooltipBadge({
  badge,
  tooltip,
  variant = "default"
}: {
  badge: string;
  tooltip: string;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white"
  };

  return (
    <ContextualTooltip content={tooltip}>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          variantStyles[variant]
        )}
      >
        {badge}
      </span>
    </ContextualTooltip>
  );
}
