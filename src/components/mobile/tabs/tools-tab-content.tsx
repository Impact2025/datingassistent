"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Camera,
  MessageCircle,
  Heart,
  Target,
  Image as ImageIcon,
  Mic,
  Users,
  Shield,
  BookOpen,
  Wrench,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TOOLS TAB - Quick Actions Grid with Categories
// ============================================================================

interface ToolsTabContentProps {
  user: any;
  userProfile: any;
}

interface Tool {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  route: string;
  color: string;
  bgColor: string;
  badge?: string;
  isNew?: boolean;
  isPro?: boolean;
}

interface ToolCategory {
  id: string;
  title: string;
  tools: Tool[];
}

// Tool Card Component
function ToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:scale-102 active:scale-98",
        "bg-white border-gray-100 hover:border-pink-200"
      )}
    >
      {/* Badges */}
      {tool.isNew && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
          NEW
        </span>
      )}
      {tool.isPro && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5" /> PRO
        </span>
      )}

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
        tool.bgColor
      )}>
        <Icon className={cn("w-6 h-6", tool.color)} />
      </div>

      {/* Text */}
      <h3 className="font-medium text-gray-900 text-sm text-center leading-tight">
        {tool.title}
      </h3>
      <p className="text-[10px] text-gray-500 text-center mt-0.5 leading-tight">
        {tool.subtitle}
      </p>
    </button>
  );
}

// Featured Tool Card (Larger)
function FeaturedToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all active:scale-98"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{tool.title}</h3>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <p className="text-white/80 text-sm">{tool.subtitle}</p>
        </div>
        <ChevronRight className="w-6 h-6 text-white/60" />
      </div>
    </button>
  );
}

// Category Section
function CategorySection({ category, onToolClick }: {
  category: ToolCategory;
  onToolClick: (route: string) => void
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-900 text-sm px-1">{category.title}</h2>
      <div className="grid grid-cols-3 gap-2">
        {category.tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => onToolClick(tool.route)}
          />
        ))}
      </div>
    </div>
  );
}

export function ToolsTabContent({ user, userProfile }: ToolsTabContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredTool: Tool = {
    id: 'ai-coach',
    icon: Sparkles,
    title: 'AI Dating Coach',
    subtitle: 'Krijg persoonlijk advies van Iris',
    route: '/chat',
    color: 'text-white',
    bgColor: 'bg-white/20',
  };

  const toolCategories: ToolCategory[] = [
    {
      id: 'profiel',
      title: 'Profiel Optimalisatie',
      tools: [
        {
          id: 'profile-coach',
          icon: Camera,
          title: 'Profiel Coach',
          subtitle: 'Foto + Bio',
          route: '/profiel',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          id: 'photo-analysis',
          icon: ImageIcon,
          title: 'Foto Analyse',
          subtitle: 'AI beoordeling',
          route: '/foto',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          isNew: true,
        },
        {
          id: 'bio-generator',
          icon: Sparkles,
          title: 'Bio Generator',
          subtitle: 'AI geschreven',
          route: '/profiel/bio',
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
        },
      ],
    },
    {
      id: 'communicatie',
      title: 'Communicatie',
      tools: [
        {
          id: 'chat-coach',
          icon: MessageCircle,
          title: 'Chat Coach',
          subtitle: 'Gespreksanalyse',
          route: '/chat',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          id: 'opener-lab',
          icon: Heart,
          title: 'Opener Lab',
          subtitle: 'Eerste berichten',
          route: '/opener',
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
        },
        {
          id: 'voice-notes',
          icon: Mic,
          title: 'Voice Coach',
          subtitle: 'Audio analyse',
          route: '/voice',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          isPro: true,
        },
      ],
    },
    {
      id: 'dating',
      title: 'Dating & Matches',
      tools: [
        {
          id: 'match-analysis',
          icon: Users,
          title: 'Match Analyse',
          subtitle: 'Profiel scannen',
          route: '/match',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
        },
        {
          id: 'date-planner',
          icon: Target,
          title: 'Date Planner',
          subtitle: 'Perfecte dates',
          route: '/date-planner',
          color: 'text-teal-600',
          bgColor: 'bg-teal-50',
        },
        {
          id: 'safety-check',
          icon: Shield,
          title: 'Veiligheid',
          subtitle: 'Red flag check',
          route: '/veiligheid',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        },
      ],
    },
    {
      id: 'leren',
      title: 'Leren & Ontwikkelen',
      tools: [
        {
          id: 'cursussen',
          icon: BookOpen,
          title: 'Cursussen',
          subtitle: 'Video lessen',
          route: '/cursussen',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
        },
        {
          id: 'doelen',
          icon: TrendingUp,
          title: 'Doelen',
          subtitle: 'Track voortgang',
          route: '/groei',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
        },
        {
          id: 'alle-tools',
          icon: Wrench,
          title: 'Meer Tools',
          subtitle: 'Alles bekijken',
          route: '/tools',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        },
      ],
    },
  ];

  const handleToolClick = (route: string) => {
    router.push(route);
  };

  // Filter tools based on search
  const filteredCategories = searchQuery
    ? toolCategories.map(category => ({
        ...category,
        tools: category.tools.filter(tool =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.tools.length > 0)
    : toolCategories;

  return (
    <div className="p-4 space-y-5">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Zoek tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Featured Tool */}
      {!searchQuery && (
        <FeaturedToolCard
          tool={featuredTool}
          onClick={() => handleToolClick(featuredTool.route)}
        />
      )}

      {/* Quick Stats */}
      {!searchQuery && (
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-700">
              <strong>12</strong> tools gebruikt deze week
            </span>
          </div>
          <span className="text-xs text-green-600 font-medium">+3 vs vorige week</span>
        </div>
      )}

      {/* Tool Categories */}
      <div className="space-y-5">
        {filteredCategories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onToolClick={handleToolClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {searchQuery && filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Geen tools gevonden voor "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-pink-600 text-sm font-medium mt-2"
          >
            Wis zoekopdracht
          </button>
        </div>
      )}
    </div>
  );
}

export default ToolsTabContent;
