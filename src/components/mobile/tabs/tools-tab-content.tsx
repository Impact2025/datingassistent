"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Search,
  Sparkles,
  Star,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolModal } from '@/components/tools/tool-modal';
import { ToolModalHeader } from '@/components/tools/tool-modal-header';
import { getToolMetadata, hasModalComponent } from '@/components/tools/tool-registry';

// ============================================================================
// TOOLS TAB - Clean, Minimalist Grid Design
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
  isNew?: boolean;
  isPro?: boolean;
}

interface ToolCategory {
  id: string;
  title: string;
  tools: Tool[];
}

// Tool Card Component - Clean Design
function ToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98"
    >
      {/* Badges */}
      {tool.isNew && (
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full">
          NEW
        </span>
      )}
      {tool.isPro && (
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center gap-0.5">
          <Star className="w-2 h-2" /> PRO
        </span>
      )}

      {/* Icon */}
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-2", tool.color)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Text */}
      <h3 className="font-medium text-gray-900 text-xs text-center leading-tight">
        {tool.title}
      </h3>
      <p className="text-[10px] text-gray-500 text-center mt-0.5">
        {tool.subtitle}
      </p>
    </button>
  );
}

// Featured Card - Clean Design
function FeaturedCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      className="border-2 border-coral-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-coral-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">AI Dating Coach</h3>
              <Badge className="bg-coral-500 text-white text-[10px] px-1.5 py-0.5">Populair</Badge>
            </div>
            <p className="text-sm text-gray-600">Krijg persoonlijk advies van Iris</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </CardContent>
    </Card>
  );
}

// Category Section
function CategorySection({ category, onToolClick }: {
  category: ToolCategory;
  onToolClick: (route: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 px-1">{category.title}</h2>
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

  // Modal state for tools
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    route: string | null;
    title: string;
    subtitle: string;
    component: React.ComponentType<any> | null;
  }>({
    isOpen: false,
    route: null,
    title: '',
    subtitle: '',
    component: null,
  });

  const toolCategories: ToolCategory[] = [
    {
      id: 'profiel',
      title: 'Profiel',
      tools: [
        {
          id: 'profile-coach',
          icon: Camera,
          title: 'Profiel Coach',
          subtitle: 'Foto + Bio',
          route: '/profiel',
          color: 'bg-blue-50 text-blue-600',
        },
        {
          id: 'photo-analysis',
          icon: ImageIcon,
          title: 'Foto Analyse',
          subtitle: 'AI beoordeling',
          route: '/foto',
          color: 'bg-purple-50 text-purple-600',
          isNew: true,
        },
        {
          id: 'bio-generator',
          icon: Sparkles,
          title: 'Bio Generator',
          subtitle: 'AI geschreven',
          route: '/tools/ai-bio-generator',
          color: 'bg-coral-50 text-coral-600',
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
          color: 'bg-green-50 text-green-600',
        },
        {
          id: 'opener-lab',
          icon: Heart,
          title: 'Opener Lab',
          subtitle: 'Eerste berichten',
          route: '/opener',
          color: 'bg-coral-50 text-coral-600',
        },
        {
          id: 'voice-notes',
          icon: Mic,
          title: 'Voice Coach',
          subtitle: 'Audio analyse',
          route: '/voice',
          color: 'bg-orange-50 text-orange-600',
          isPro: true,
        },
      ],
    },
    {
      id: 'dating',
      title: 'Dating',
      tools: [
        {
          id: 'match-analysis',
          icon: Users,
          title: 'Match Analyse',
          subtitle: 'Profiel scannen',
          route: '/match',
          color: 'bg-indigo-50 text-indigo-600',
        },
        {
          id: 'date-planner',
          icon: Target,
          title: 'Date Planner',
          subtitle: 'Perfecte dates',
          route: '/date-planner',
          color: 'bg-teal-50 text-teal-600',
        },
        {
          id: 'safety-check',
          icon: Shield,
          title: 'Veiligheid',
          subtitle: 'Red flag check',
          route: '/veiligheid',
          color: 'bg-red-50 text-red-600',
        },
      ],
    },
    {
      id: 'leren',
      title: 'Leren',
      tools: [
        {
          id: 'cursussen',
          icon: BookOpen,
          title: 'Cursussen',
          subtitle: 'Video lessen',
          route: '/cursussen',
          color: 'bg-amber-50 text-amber-600',
        },
        {
          id: 'doelen',
          icon: Target,
          title: 'Doelen',
          subtitle: 'Track voortgang',
          route: '/groei',
          color: 'bg-emerald-50 text-emerald-600',
        },
        {
          id: 'hechtingsstijl',
          icon: Heart,
          title: 'Hechtingsstijl',
          subtitle: 'Zelfkennis',
          route: '/hechtingsstijl',
          color: 'bg-rose-50 text-rose-600',
        },
      ],
    },
  ];

  const handleToolClick = (route: string) => {
    // Check if tool has modal component
    if (hasModalComponent(route)) {
      const metadata = getToolMetadata(route);
      if (metadata) {
        setActiveModal({
          isOpen: true,
          route,
          title: metadata.title,
          subtitle: metadata.subtitle,
          component: metadata.component,
        });
      }
    } else {
      // Fallback to page navigation for tools without modal
      router.push(route);
    }
  };

  const closeModal = () => {
    setActiveModal({
      isOpen: false,
      route: null,
      title: '',
      subtitle: '',
      component: null,
    });
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
    <div className="bg-gray-50 min-h-screen">
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-0 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-coral-500 transition-all"
          />
        </div>

        {/* Featured Tool */}
        {!searchQuery && (
          <FeaturedCard onClick={() => handleToolClick('/chat')} />
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
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Geen tools gevonden voor "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-coral-500 text-sm font-medium mt-2"
              >
                Wis zoekopdracht
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tool Modal */}
      <ToolModal isOpen={activeModal.isOpen} onClose={closeModal}>
        <ToolModalHeader
          title={activeModal.title}
          subtitle={activeModal.subtitle}
          onBack={closeModal}
          onClose={closeModal}
        />

        {/* Tool Content with Suspense for lazy loading */}
        <div className="flex-1 overflow-y-auto">
          {activeModal.component && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-gray-300 border-t-coral-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-600">Tool laden...</p>
                  </div>
                </div>
              }
            >
              <activeModal.component onClose={closeModal} />
            </Suspense>
          )}
        </div>
      </ToolModal>
    </div>
  );
}

export default ToolsTabContent;
