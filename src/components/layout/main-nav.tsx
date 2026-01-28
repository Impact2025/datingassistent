"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import {
  LayoutDashboard,
  UserCircle2,
  MessageCircle,
  MessageSquare,
  Bot,
  CalendarHeart,
  GraduationCap,
  Award,
  Sparkles,
  Users,
  Search,
  Target,
  TrendingUp,
  Flame,
  Trophy,
  BarChart3,
  Calendar,
  Heart,
  Shield,
  CreditCard,
  Settings
} from "lucide-react";

const TABS = [
  // NIEUWE 5-MODULE STRUCTUUR
  { id: "profiel-persoonlijkheid", label: "Profiel & Persoonlijkheid", icon: UserCircle2, category: "core" },
  { id: "communicatie-matching", label: "Communicatie & Matching", icon: MessageCircle, category: "core" },
  { id: "daten-relaties", label: "Daten & Relaties", icon: CalendarHeart, category: "core" },
  { id: "groei-doelen", label: "Groei & Doelen", icon: Target, category: "core" },
  { id: "leren-ontwikkelen", label: "Leren & Ontwikkelen", icon: GraduationCap, category: "core" },

  // LEGACY TABS (voorlopig behouden voor backward compatibility)
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "legacy" },
  { id: "daily", label: "Dagelijkse Taken", icon: Flame, category: "legacy" },
  { id: "dating-activity", label: "Dating Log", icon: Heart, category: "legacy" },
  { id: "badges", label: "Badges", icon: Trophy, category: "legacy" },
  { id: "monthly-report", label: "Maand Rapport", icon: BarChart3, category: "legacy" },
  { id: "yearly-review", label: "Jaar Review", icon: Calendar, category: "legacy" },
  { id: "doelen", label: "Doelen", icon: Target, category: "legacy" },
  { id: "voortgang", label: "Voortgang", icon: TrendingUp, category: "legacy" },
  { id: "profiel-coach", label: "Jouw profiel", icon: UserCircle2, category: "legacy" },
  { id: "dating-profiler-ai", label: "Dating Profiler AI", icon: Sparkles, category: "legacy" },
  { id: "profiel-analyse", label: "Profiel analyse", icon: Search, category: "legacy" },
  { id: "gesprek-starter", label: "Contact maken", icon: MessageCircle, category: "legacy" },
  { id: "chat-coach", label: "Chat coach", icon: Bot, category: "legacy" },
  { id: "dateplanner", label: "Dateplanner", icon: CalendarHeart, category: "legacy" },
  { id: "online-cursus", label: "Cursus", icon: GraduationCap, category: "legacy" },
  { id: "skills-assessment", label: "Vaardigheden", icon: Award, category: "legacy" },
  { id: "recommendations", label: "Aanbevelingen", icon: Sparkles, category: "legacy" },
  { id: "community", label: "Community", icon: Users, category: "legacy" },
];


interface MainNavProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function MainNav({ activeTab, onTabChange }: MainNavProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  // Filter to show only core modules by default
  const coreTabs = TABS.filter(tab => tab.category === 'core');

  // Essential legacy tabs that users need
  const essentialLegacyTabs = [
    TABS.find(tab => tab.id === 'dashboard')!,
    TABS.find(tab => tab.id === 'daily')!,
    TABS.find(tab => tab.id === 'monthly-report')!,
    TABS.find(tab => tab.id === 'yearly-review')!
  ].filter(Boolean);

  if (isMobile) {
    return (
      <Select
        value={activeTab}
        onValueChange={(value) => {
          if (value === 'community') {
            router.push('/dashboard/community');
          } else {
            onTabChange(value);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecteer een sectie" />
        </SelectTrigger>
        <SelectContent>
          {[...coreTabs, ...essentialLegacyTabs].map((tab) => (
            <SelectItem key={tab.id} value={tab.id}>
              {tab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-4">
      {/* All Modules in 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {/* Dashboard */}
        <Button
          variant="ghost"
          onClick={() => onTabChange('dashboard')}
          className={cn(
            "h-auto p-4 flex flex-col gap-2 transition-all",
            activeTab === 'dashboard'
              ? "bg-coral-50 text-coral-600 border-coral-200 dark:bg-coral-950/20 dark:text-coral-400"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-sm font-medium text-center leading-tight">Dashboard</span>
        </Button>

        {/* Core Modules */}
        {coreTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const title = tab.label;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "h-auto p-4 flex flex-col gap-2 transition-all",
                isActive
                  ? "bg-coral-50 text-coral-600 border-coral-200 dark:bg-coral-950/20 dark:text-coral-400"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium text-center leading-tight">{title}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
