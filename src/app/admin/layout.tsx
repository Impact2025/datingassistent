"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Shield,
  Database,
  LogOut,
  Menu,
  X,
  Activity,
  AlertTriangle,
  CheckCircle,
  Tag,
  MessageSquare,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";
import { Toaster } from "@/components/ui/toaster";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overzicht en key metrics"
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Gebruikersbeheer en analytics"
  },
  {
    name: "User Insights",
    href: "/admin/user-insights",
    icon: Activity,
    description: "Wereldklasse user analytics & stuck users",
    badge: "NEW"
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Gedetailleerde gebruikersdata"
  },
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
    description: "Coupon codes beheren"
  },
  {
    name: "Cursussen",
    href: "/admin/courses",
    icon: BookOpen,
    description: "Cursus en content beheer"
  },
  {
    name: "Live Chat",
    href: "/admin/live-chat",
    icon: MessageSquare,
    description: "Chat support beheer"
  },
  {
    name: "Security",
    href: "/admin/security",
    icon: Shield,
    description: "Beveiliging en audit logs"
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Systeem configuratie"
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();

  // Check if we're on the login page
  const isLoginPage = pathname === '/admin/login';

  // Prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check admin role from API
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user || isLoginPage) {
        setCheckingAdmin(false);
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();

        setIsAdmin(data.isAdmin || false);

        // Redirect if not admin
        if (!data.isAdmin) {
          console.log('🚫 User is not an admin, redirecting...');
          setTimeout(() => router.push('/dashboard'), 100);
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
        setTimeout(() => router.push('/dashboard'), 100);
      } finally {
        setCheckingAdmin(false);
      }
    }

    if (mounted && !loading && user && !isLoginPage) {
      checkAdminStatus();
    } else if (isLoginPage || !user) {
      setCheckingAdmin(false);
      setIsAdmin(false);
    }
  }, [user?.id, mounted, loading, isLoginPage, router]);

  // Check admin authentication (skip for login page)
  useEffect(() => {
    if (mounted && !loading && !user && !isLoginPage) {
      // Not logged in, redirect to admin login
      router.push('/admin/login');
    }
  }, [user, loading, router, mounted, isLoginPage]);

  // If on login page, just render children without the admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    // Implement logout logic
    router.push('/login');
  };

  // Show loading spinner while checking authentication or admin status
  if (!mounted || loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">
            {checkingAdmin ? 'Verifiëren admin toegang...' : 'Laden...'}
          </p>
        </div>
      </div>
    );
  }

  // If no user after loading, the useEffect will handle redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not admin, show access denied (while redirecting)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Shield className="h-16 w-16 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Toegang geweigerd</h2>
          <p className="text-gray-600">Je hebt geen admin rechten</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl flex-shrink-0",
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-pink-250 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                  <p className="text-xs text-slate-400">DatingAssistent Pro</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-pink-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "font-semibold" : ""
                      )}>
                        {item.name}
                      </div>
                      {(item as any).badge && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] px-1.5 py-0 h-4">
                          {(item as any).badge}
                        </Badge>
                      )}
                    </div>
                    <div className={cn(
                      "text-xs truncate",
                      isActive ? "text-blue-100" : "text-slate-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/50 transition-all"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-pink-100/30">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-blue-50"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
