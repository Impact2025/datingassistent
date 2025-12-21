'use client';

/**
 * World-class skeleton loaders voor dashboard tabs
 * Specifieke skeletons per content type voor betere perceived performance
 */

import { cn } from '@/lib/utils';

// Base skeleton pulse animation
const pulseClass = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

// Generic Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className={cn("h-32 rounded-xl", pulseClass)} />
      <div className={cn("h-48 rounded-xl", pulseClass)} />
      <div className="grid grid-cols-2 gap-4">
        <div className={cn("h-24 rounded-xl", pulseClass)} />
        <div className={cn("h-24 rounded-xl", pulseClass)} />
      </div>
    </div>
  );
}

// Home Tab Skeleton - with welcome card + quick actions
export function HomeTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <div className={cn("h-40 rounded-2xl", pulseClass)} />

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={cn("h-24 rounded-xl", pulseClass)} />
        ))}
      </div>

      {/* Progress section */}
      <div className={cn("h-32 rounded-xl", pulseClass)} />
    </div>
  );
}

// Pad Tab Skeleton - with journey phases
export function PadTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Program header */}
      <div className={cn("h-28 rounded-2xl", pulseClass)} />

      {/* Journey timeline */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-full flex-shrink-0", pulseClass)} />
            <div className="flex-1 space-y-2">
              <div className={cn("h-4 w-3/4 rounded", pulseClass)} />
              <div className={cn("h-3 w-1/2 rounded", pulseClass)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Coach Tab Skeleton - chat interface
export function CoachTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Coach header */}
      <div className="flex items-center gap-3">
        <div className={cn("w-14 h-14 rounded-full", pulseClass)} />
        <div className="space-y-2">
          <div className={cn("h-5 w-32 rounded", pulseClass)} />
          <div className={cn("h-3 w-24 rounded", pulseClass)} />
        </div>
      </div>

      {/* Chat messages */}
      <div className="space-y-3 py-4">
        <div className={cn("h-20 w-4/5 rounded-2xl rounded-bl-sm", pulseClass)} />
        <div className={cn("h-16 w-3/5 rounded-2xl rounded-br-sm ml-auto", pulseClass)} />
        <div className={cn("h-24 w-4/5 rounded-2xl rounded-bl-sm", pulseClass)} />
      </div>

      {/* Input area */}
      <div className={cn("h-14 rounded-full mt-auto", pulseClass)} />
    </div>
  );
}

// Profile/Tools Tab Skeleton
export function ToolsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="space-y-2">
        <div className={cn("h-6 w-40 rounded", pulseClass)} />
        <div className={cn("h-4 w-64 rounded", pulseClass)} />
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={cn("h-32 rounded-xl", pulseClass)} />
        ))}
      </div>
    </div>
  );
}

// Settings Tab Skeleton
export function SettingsTabSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg", pulseClass)} />
            <div className="space-y-2">
              <div className={cn("h-4 w-32 rounded", pulseClass)} />
              <div className={cn("h-3 w-48 rounded", pulseClass)} />
            </div>
          </div>
          <div className={cn("w-12 h-6 rounded-full", pulseClass)} />
        </div>
      ))}
    </div>
  );
}

// Subscription Tab Skeleton
export function SubscriptionTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current plan card */}
      <div className={cn("h-36 rounded-xl", pulseClass)} />

      {/* Plan options */}
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={cn("h-64 rounded-xl", pulseClass)} />
        ))}
      </div>
    </div>
  );
}

// Community Tab Skeleton
export function CommunityTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Community header */}
      <div className={cn("h-24 rounded-xl", pulseClass)} />

      {/* Posts */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full", pulseClass)} />
            <div className="space-y-1">
              <div className={cn("h-4 w-24 rounded", pulseClass)} />
              <div className={cn("h-3 w-16 rounded", pulseClass)} />
            </div>
          </div>
          <div className={cn("h-16 rounded", pulseClass)} />
        </div>
      ))}
    </div>
  );
}

// Engagement/Stats Skeleton
export function EngagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className={cn("h-12 w-12 rounded-full mx-auto", pulseClass)} />
            <div className={cn("h-6 w-16 mx-auto rounded", pulseClass)} />
            <div className={cn("h-3 w-20 mx-auto rounded", pulseClass)} />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className={cn("h-48 rounded-xl", pulseClass)} />

      {/* Activity list */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={cn("h-12 rounded-lg", pulseClass)} />
        ))}
      </div>
    </div>
  );
}
