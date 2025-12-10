"use client";

/**
 * Nieuwe 4-Tab Navigatie volgens Masterplan
 * Home | Pad | Coach | Profiel
 */

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Map, Sparkles, User } from "lucide-react";

const NEW_TABS = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    description: "Je persoonlijke dashboard"
  },
  {
    id: "pad",
    label: "Pad",
    icon: Map,
    description: "5-fase gestructureerde reis"
  },
  {
    id: "coach",
    label: "Coach",
    icon: Sparkles,
    description: "Iris AI Coach - jouw centrale hulp"
  },
  {
    id: "profiel",
    label: "Tools",
    icon: User,
    description: "Instellingen & persoonlijkheid"
  }
];

interface MainNavNewProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function MainNavNew({ activeTab, onTabChange }: MainNavNewProps) {
  const isMobile = useIsMobile();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };

  if (isMobile) {
    // Mobile: Bottom navigation (handled by BottomNavigation component)
    return null;
  }

  // Desktop: Top horizontal tabs
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-1">
          {NEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 border-b-2 transition-all",
                  "hover:text-pink-600 hover:border-pink-300",
                  isActive
                    ? "border-pink-500 text-pink-600 font-medium"
                    : "border-transparent text-gray-700"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-pink-500" : "text-gray-700"
                )} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
