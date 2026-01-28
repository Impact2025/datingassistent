"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

const ONBOARDING_STEPS = [
  { path: "welcome", label: "Welkom" },
  { path: "intake", label: "Kennismaking" },
  { path: "roadmap", label: "Je Plan" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // Determine current step from pathname
  const currentStepPath = pathname?.split("/").pop() || "welcome";
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.path === currentStepPath
  );

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        // Redirect to login with returnUrl so user comes back here after login
        const currentPath = pathname || '/onboarding/welcome';
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }
      setIsLoading(false);
    }
  }, [user, userLoading, router, pathname]);

  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-coral-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-coral-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
              <span className="font-medium text-gray-900 text-sm">
                DatingAssistent
              </span>
            </div>

            {/* Simple Step Indicator */}
            <div className="flex items-center gap-1.5">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step.path}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStepIndex
                      ? "bg-coral-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
