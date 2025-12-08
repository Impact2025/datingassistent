/**
 * Icon Map - Centralized icon mapping for consistent usage
 */

import {
  Heart, Sparkles, User, Camera, FileText, MessageCircle,
  Target, Calendar, TrendingUp, Lightbulb, Crown, Zap,
  CheckCircle2, Brain, Scan, BarChart3, Compass, Repeat, Eye
} from 'lucide-react';

export const iconMap: Record<string, any> = {
  'Heart': Heart,
  'Sparkles': Sparkles,
  'User': User,
  'Camera': Camera,
  'FileText': FileText,
  'MessageCircle': MessageCircle,
  'Target': Target,
  'Calendar': Calendar,
  'TrendingUp': TrendingUp,
  'Lightbulb': Lightbulb,
  'Crown': Crown,
  'Zap': Zap,
  'CheckCircle2': CheckCircle2,
  'Brain': Brain,
  'Scan': Scan,
  'BarChart3': BarChart3,
  'Compass': Compass,
  'Repeat': Repeat,
  'Eye': Eye,
};

export const getIcon = (iconName: string, defaultIcon: any = Sparkles) => {
  return iconMap[iconName] || defaultIcon;
};
