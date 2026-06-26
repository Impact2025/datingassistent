"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Loader2 } from "lucide-react";
import { logger } from '@/lib/logger';

/**
 * Kickstart Onboarding Redirect Page
 *
 * Deze pagina redirect naar het dashboard waar de Kickstart onboarding
 * geïntegreerd is. Dit zorgt voor een betere UX waar de onboarding
 * plaatsvindt binnen het dashboard context.
 */
export default function KickstartOnboardingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Niet ingelogd - redirect naar login met redirect terug naar dashboard
      logger.log("🔄 Kickstart onboarding: Not logged in, redirecting to login");
      router.push("/login?redirect=/dashboard");
    } else {
      // Ingelogd - redirect naar dashboard waar de Kickstart onboarding geïntegreerd is
      logger.log("🔄 Kickstart onboarding: Logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-coral-500 hover:bg-coral-600 flex items-center justify-center shadow-xl mx-auto mb-6">
          <span className="text-white font-bold text-2xl">D</span>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-coral-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Even geduld...
        </h2>
        <p className="text-gray-600">
          Je wordt doorgestuurd naar je dashboard
        </p>
      </div>
    </div>
  );
}
