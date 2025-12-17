"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Loader2, Sparkles } from "lucide-react";

/**
 * Transformatie 3.0 Onboarding Redirect Page
 *
 * Deze pagina redirect naar het dashboard waar de Transformatie onboarding
 * geïntegreerd is. Dit zorgt voor een betere UX waar de onboarding
 * plaatsvindt binnen het dashboard context.
 */
export default function TransformatieOnboardingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Niet ingelogd - redirect naar login met redirect terug naar dashboard
      console.log("🔄 Transformatie onboarding: Not logged in, redirecting to login");
      router.push("/login?redirect=/dashboard");
    } else {
      // Ingelogd - redirect naar dashboard waar de Transformatie onboarding geïntegreerd is
      console.log("🔄 Transformatie onboarding: Logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-25 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welkom bij De Transformatie 3.0
        </h2>
        <p className="text-gray-600">
          Je wordt doorgestuurd naar je dashboard
        </p>
      </div>
    </div>
  );
}
