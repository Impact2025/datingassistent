'use client';

/**
 * Support Channel Cards Component
 * Wereldklasse channel selectie met real-time availability
 *
 * Features:
 * - Multiple support channels
 * - Queue visibility
 * - Estimated wait times
 * - Premium indicators
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Phone,
  Video,
  Clock,
  CheckCircle,
  Crown,
  ArrowRight,
  Users,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportChannelConfig } from '@/lib/support/types';

interface SupportChannelCardsProps {
  onChannelSelect: (channel: string) => void;
  isPremium?: boolean;
  className?: string;
}

// Channel configurations
const SUPPORT_CHANNELS: SupportChannelConfig[] = [
  {
    channel: 'live_chat',
    title: 'Live Chat met Iris',
    description: 'AI-powered instant support, 24/7 beschikbaar',
    availability: '24/7',
    responseTime: 'Direct',
    isAvailable: true,
    queueLength: 0,
    estimatedWait: 'Geen wachttijd',
  },
  {
    channel: 'email',
    title: 'E-mail Support',
    description: 'Gedetailleerde hulp voor complexe vragen',
    availability: '24/7',
    responseTime: '< 24 uur',
    isAvailable: true,
  },
  {
    channel: 'phone',
    title: 'Telefonisch Contact',
    description: 'Spreek direct met een medewerker',
    availability: 'Ma-Vr 9:00-17:00',
    responseTime: '< 5 min',
    isAvailable: true, // Would check actual hours
    queueLength: 2,
    estimatedWait: '~5 min',
  },
  {
    channel: 'video_call',
    title: 'Video Support',
    description: 'Persoonlijke 1-op-1 sessie met screensharing',
    availability: 'Op afspraak',
    responseTime: 'Gepland',
    isAvailable: true,
    premiumOnly: true,
  },
];

// Icon mapping
const CHANNEL_ICONS = {
  live_chat: MessageCircle,
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  video_call: Video,
};

// Color schemes
const CHANNEL_COLORS = {
  live_chat: {
    bg: 'bg-gradient-to-br from-pink-500 to-pink-600',
    bgHover: 'hover:from-pink-600 hover:to-pink-700',
    light: 'bg-pink-50',
    border: 'border-pink-200 hover:border-pink-400',
    text: 'text-pink-600',
  },
  email: {
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    bgHover: 'hover:from-blue-600 hover:to-indigo-700',
    light: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
    text: 'text-blue-600',
  },
  phone: {
    bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    bgHover: 'hover:from-green-600 hover:to-emerald-700',
    light: 'bg-green-50',
    border: 'border-green-200 hover:border-green-400',
    text: 'text-green-600',
  },
  video_call: {
    bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    bgHover: 'hover:from-amber-600 hover:to-orange-700',
    light: 'bg-amber-50',
    border: 'border-amber-200 hover:border-amber-400',
    text: 'text-amber-600',
  },
  whatsapp: {
    bg: 'bg-gradient-to-br from-green-500 to-green-600',
    bgHover: 'hover:from-green-600 hover:to-green-700',
    light: 'bg-green-50',
    border: 'border-green-200 hover:border-green-400',
    text: 'text-green-600',
  },
};

export function SupportChannelCards({
  onChannelSelect,
  isPremium = false,
  className,
}: SupportChannelCardsProps) {
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  // Filter channels based on premium status
  const availableChannels = SUPPORT_CHANNELS.filter(
    channel => !channel.premiumOnly || isPremium
  );

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {availableChannels.map((channel, index) => {
        const Icon = CHANNEL_ICONS[channel.channel];
        const colors = CHANNEL_COLORS[channel.channel];
        const isHovered = hoveredChannel === channel.channel;

        return (
          <motion.button
            key={channel.channel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onChannelSelect(channel.channel)}
            onMouseEnter={() => setHoveredChannel(channel.channel)}
            onMouseLeave={() => setHoveredChannel(null)}
            className={cn(
              'relative overflow-hidden',
              'p-6 rounded-2xl border-2 text-left',
              'transition-all duration-300',
              'hover:shadow-xl hover:-translate-y-1',
              colors.border,
              'bg-white'
            )}
          >
            {/* Premium Badge */}
            {channel.premiumOnly && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              </div>
            )}

            {/* Live indicator for chat */}
            {channel.channel === 'live_chat' && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full text-green-700 text-xs font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
              'transition-transform duration-300',
              isHovered ? 'scale-110' : 'scale-100',
              colors.bg
            )}>
              <Icon className="w-7 h-7 text-white" />
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {channel.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {channel.description}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm">
              {/* Availability */}
              <div className="flex items-center gap-1.5">
                <Clock className={cn('w-4 h-4', colors.text)} />
                <span className="text-gray-600">{channel.availability}</span>
              </div>

              {/* Response Time */}
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">{channel.responseTime}</span>
              </div>
            </div>

            {/* Queue Info (if applicable) */}
            {channel.queueLength !== undefined && channel.queueLength > 0 && (
              <div className={cn(
                'mt-3 flex items-center gap-2 px-3 py-2 rounded-lg',
                colors.light
              )}>
                <Users className={cn('w-4 h-4', colors.text)} />
                <span className="text-sm text-gray-700">
                  {channel.queueLength} in wachtrij • {channel.estimatedWait}
                </span>
              </div>
            )}

            {/* AI Badge for chat */}
            {channel.channel === 'live_chat' && (
              <div className={cn(
                'mt-3 flex items-center gap-2 px-3 py-2 rounded-lg',
                colors.light
              )}>
                <Sparkles className={cn('w-4 h-4', colors.text)} />
                <span className="text-sm text-gray-700">
                  AI-powered • Geen wachttijd
                </span>
              </div>
            )}

            {/* Hover Arrow */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
              className="absolute bottom-6 right-6"
            >
              <ArrowRight className={cn('w-5 h-5', colors.text)} />
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact version for smaller spaces
export function SupportChannelList({
  onChannelSelect,
  isPremium = false,
  className,
}: SupportChannelCardsProps) {
  const availableChannels = SUPPORT_CHANNELS.filter(
    channel => !channel.premiumOnly || isPremium
  );

  return (
    <div className={cn('space-y-2', className)}>
      {availableChannels.map((channel) => {
        const Icon = CHANNEL_ICONS[channel.channel];
        const colors = CHANNEL_COLORS[channel.channel];

        return (
          <button
            key={channel.channel}
            onClick={() => onChannelSelect(channel.channel)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border',
              'transition-all duration-200',
              'hover:shadow-md',
              colors.border,
              'bg-white'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              colors.bg
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{channel.title}</div>
              <div className="text-xs text-gray-500">
                {channel.availability} • {channel.responseTime}
              </div>
            </div>

            {channel.channel === 'live_chat' && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full text-green-700 text-xs">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            )}

            {channel.premiumOnly && (
              <Crown className="w-4 h-4 text-amber-500" />
            )}

            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        );
      })}
    </div>
  );
}
