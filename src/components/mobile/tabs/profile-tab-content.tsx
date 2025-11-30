"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Star,
  Crown,
  TrendingUp,
  Award,
  Edit3,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// PROFILE TAB - Clean, Minimalist Settings Design
// ============================================================================

interface ProfileTabContentProps {
  user: any;
  userProfile: any;
}

// Menu Item Component - Clean Design
function MenuItem({
  icon: Icon,
  label,
  description,
  onClick,
  badge,
  danger = false
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
  badge?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 transition-colors",
        danger ? "hover:bg-red-50" : "hover:bg-gray-50",
        "active:scale-99"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center",
        danger ? "bg-red-50" : "bg-gray-100"
      )}>
        <Icon className={cn("w-4.5 h-4.5", danger ? "text-red-500" : "text-gray-600")} />
      </div>
      <div className="flex-1 text-left">
        <p className={cn("font-medium text-sm", danger ? "text-red-600" : "text-gray-900")}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      {badge && (
        <Badge className="bg-pink-100 text-pink-600 text-[10px]">{badge}</Badge>
      )}
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </button>
  );
}

// Stats Item
function StatItem({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={cn("w-9 h-9 mx-auto mb-1.5 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

// Section Divider
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="px-4 pt-4 pb-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

export function ProfileTabContent({ user, userProfile }: ProfileTabContentProps) {
  const router = useRouter();
  const [isPro] = useState(userProfile?.subscription_tier === 'pro');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-4 space-y-4">
        {/* Profile Header - Clean Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-pink-500 font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100">
                  <Camera className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{user?.name || 'Gebruiker'}</h1>
                  {isPro && (
                    <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5">
                      <Crown className="w-2.5 h-2.5 mr-0.5" /> PRO
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 mt-5 pt-5 border-t border-gray-100">
              <StatItem
                label="Dagen"
                value="47"
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <StatItem
                label="Streak"
                value="7"
                icon={Award}
                color="bg-orange-500"
              />
              <StatItem
                label="Badges"
                value="12"
                icon={Star}
                color="bg-amber-500"
              />
              <StatItem
                label="Level"
                value="3"
                icon={Crown}
                color="bg-pink-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Banner */}
        {!isPro && (
          <Card
            className="border-2 border-amber-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/upgrade')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Upgrade naar Pro</h3>
                  <p className="text-xs text-gray-600">Ontgrendel alle premium features</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Section */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <SectionDivider title="Account" />
          <MenuItem
            icon={Edit3}
            label="Profiel Bewerken"
            description="Naam, bio en voorkeuren"
            onClick={() => router.push('/profiel/bewerken')}
          />
          <MenuItem
            icon={Camera}
            label="Foto's Beheren"
            onClick={() => router.push('/profiel/fotos')}
          />
          <MenuItem
            icon={Lock}
            label="Wachtwoord"
            onClick={() => router.push('/settings/password')}
          />
        </Card>

        {/* Preferences Section */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <SectionDivider title="Voorkeuren" />
          <MenuItem
            icon={Bell}
            label="Notificaties"
            onClick={() => router.push('/settings/notifications')}
          />
          <MenuItem
            icon={Settings}
            label="App Instellingen"
            onClick={() => router.push('/settings')}
          />
        </Card>

        {/* Support Section */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <SectionDivider title="Ondersteuning" />
          <MenuItem
            icon={HelpCircle}
            label="Help & FAQ"
            onClick={() => router.push('/help')}
          />
          <MenuItem
            icon={Shield}
            label="Privacy"
            onClick={() => router.push('/privacy')}
          />
        </Card>

        {/* Logout */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <MenuItem
            icon={LogOut}
            label="Uitloggen"
            onClick={handleLogout}
            danger
          />
        </Card>

        {/* App Version */}
        <p className="text-center text-xs text-gray-400 py-4">
          DatingAssistent v2.0.0
        </p>
      </div>
    </div>
  );
}

export default ProfileTabContent;
