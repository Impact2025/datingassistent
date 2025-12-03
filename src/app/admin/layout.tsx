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
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

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
    name: "Content",
    href: "/admin/content",
    icon: Database,
    description: "Content en assessment beheer"
  },
  {
    name: "Security",
    href: "/admin/security",
    icon: Shield,
    description: "Beveiliging en monitoring"
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
        return;
      }

      try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();

        setIsAdmin(data.isAdmin || false);

        // Redirect if not admin
        if (!data.isAdmin) {
          console.log('🚫 User is not an admin, redirecting...');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
        router.push('/dashboard');
      } finally {
        setCheckingAdmin(false);
      }
    }

    if (mounted && !loading && !isLoginPage) {
      checkAdminStatus();
    } else if (isLoginPage) {
      setCheckingAdmin(false);
    }
  }, [user, mounted, loading, isLoginPage, router]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">DatingAssistent</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
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
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
